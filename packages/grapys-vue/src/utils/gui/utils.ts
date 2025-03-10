import {
  Position,
  GUINodeData,
  GUIEdgeData,
  GUINodeDataRecord,
  GUINearestData,
  EdgeData,
  AgentProfile,
  InputOutputData,
  NewEdgeStartEventData,
  NewEdgeData,
  ClosestNodeData,
  EdgeEndPointData,
  NodePositionData,
  StaticNodeType,
  GUILoopData,
  ParamData,
} from "./type";
import { inputs2dataSources, GraphData, isComputedNodeData, DefaultParamsType, LoopData } from "graphai";
import { agentProfiles } from "./data";
import { store2graphData } from "./graph";
// import { graphs } from "../../graph";

const isTouch = (event: MouseEvent | TouchEvent): event is TouchEvent => {
  return "touches" in event;
};
export const getClientPos = (event: MouseEvent | TouchEvent) => {
  const clientX = isTouch(event) ? event.touches[0].clientX : event.clientX;
  const clientY = isTouch(event) ? event.touches[0].clientY : event.clientY;
  return { clientX, clientY };
};

const loop2loop = (graphLoop: LoopData): GUILoopData => {
  if (graphLoop.while) {
    return {
      loopType: "while",
      while: graphLoop.while,
    };
  }
  if (graphLoop.count) {
    return {
      loopType: "count",
      count: graphLoop.count,
    };
  }
  return {
    loopType: "none",
  };
};

export const graphToGUIData = (graphData: GraphData) => {
  if (graphData?.metadata?.data?.nodes && graphData?.metadata?.data?.edges) {
    const { nodes, edges, loop } = graphData?.metadata?.data ?? {};
    return {
      rawEdge: edges,
      rawNode: nodes,
      loop: loop2loop(loop ?? {}),
    };
  }

  const nodeIds = Object.keys(graphData.nodes);
  const rawEdge: GUIEdgeData[] = [];
  const node2agent = Object.keys(graphData.nodes).reduce((tmp: Record<string, string | null>, nodeId) => {
    const node = graphData.nodes[nodeId];
    tmp[nodeId] = isComputedNodeData(node) ? (node.agent as string) : null;
    return tmp;
  }, {});

  const getIndex = (nodeId: string, propId: string, key: keyof AgentProfile) => {
    const agent = node2agent[nodeId];

    const indexes = agent ? (agentProfiles[agent][key] as InputOutputData[]) : [];
    const index = indexes.findIndex((data) => data.name === propId);
    if (index === -1) {
      console.log(`${key} ${nodeId}.${propId} is not hit`);
    }
    return index;
  };

  let positionIndex = 1;
  const rawNode: GUINodeData[] = Object.keys(graphData.nodes).map((nodeId) => {
    const node = graphData.nodes[nodeId];
    const isComputed = isComputedNodeData(node);
    const inputs = isComputed ? (graphData?.metadata?.inputs ?? node.inputs ?? {}) : node.update ? { update: node.update } : {};
    Object.keys(inputs).forEach((inputProp) => {
      // node, props
      // inputs(to), oututs(from)
      inputs2dataSources([inputs[inputProp]]).forEach((source) => {
        const outputNodeId = source.nodeId;
        if (outputNodeId) {
          // source is computed node
          if (source.propIds && source.propIds.length > 0) {
            source.propIds.forEach((outputPropId) => {
              if (nodeIds.includes(outputNodeId)) {
                const sourceIndex = getIndex(outputNodeId, outputPropId, "outputs");
                const targetIndex = isComputed ? getIndex(nodeId, inputProp, "inputs") : 0;
                rawEdge.push({
                  source: {
                    nodeId: outputNodeId,
                    index: sourceIndex > -1 ? sourceIndex : 0,
                  },
                  target: { nodeId, index: targetIndex > -1 ? targetIndex : 0 },
                  type: "edge",
                });
              }
            });
          } else {
            // source is static nodeData
            const targetIndex = isComputed ? getIndex(nodeId, inputProp, "inputs") : 0;
            rawEdge.push({
              source: { nodeId: outputNodeId, index: 0 },
              target: { nodeId, index: targetIndex > -1 ? targetIndex : 0 },
              type: "edge",
            });
          }
        }
      });
    });

    const position = {
      x: (positionIndex % 4) * 200 + 100,
      y: Math.floor(positionIndex / 4) * 300 + 50,
    };
    positionIndex += 1;
    const data = (() => {
      if (isComputed) {
        return {
          params: node.params,
          guiAgentId: node.agent as string,
        };
      }
      const staticNodeType: StaticNodeType = (() => {
        if (node.value === undefined) {
          return "text";
        }
        if (typeof node.value === "object" || Array.isArray(node.value)) {
          return "data";
        }
        if (node.value === true || node.value === false) {
          return "boolean";
        }
        if (node.value) {
          return "number";
        }
        return "text";
      })();
      return {
        value: node.value,
        staticNodeType,
      };
    })();
    return {
      type: isComputed ? "computed" : "static",
      nodeId,
      position,

      data,
    };
  });

  // graph loop 2 store loop
  const { loop: graphLoop } = graphData;
  return {
    rawEdge,
    rawNode,
    loop: loop2loop(graphLoop ?? {}),
  };
};

export const edgeEnd2agentProfile = (
  edgeEndPointData: EdgeEndPointData,
  nodeRecords: GUINodeDataRecord,
  sorceOrTarget: "source" | "target",
  nestedGraphs: NestedGraphList,
) => {
  const node = nodeRecords[edgeEndPointData.nodeId];
  if (node && node.type === "computed") {
    const specializedAgent = node.data.guiAgentId ?? ""; // undefined is static node.

    const profile = agentProfiles[specializedAgent];
    const IOData = (() => {
      // output
      if (sorceOrTarget === "source") {
        return profile.outputs[edgeEndPointData.index];
      }
      // inputs
      if (profile.isNestedGraph) {
        // not map
        return nestedGraphInputs(nestedGraphs[node.data.nestedGraphIndex].graph)[edgeEndPointData.index];
      }
      return profile.inputs[edgeEndPointData.index];
    })();

    return {
      agent: specializedAgent,
      profile,
      IOData,
    };
  }
};

// composable
export const guiEdgeData2edgeData = (guiEdges: GUIEdgeData[], nodeRecords: GUINodeDataRecord): EdgeData[] => {
  return guiEdges.map((edge) => {
    const { type, source, target } = edge;
    return {
      type,
      source: {
        ...source,
        data: nodeRecords[edge.source.nodeId],
      },
      target: {
        ...target,
        data: nodeRecords[edge.target.nodeId],
      },
    };
  });
};

export const edgeStartEventData = (data: NewEdgeStartEventData, parentElement: HTMLElement | SVGSVGElement, nodeData: GUINodeData) => {
  // Since x and y are clientX and clientY, adjust the height by the header.
  // If there is a horizontal menu, you will need to adjust x.
  const rect = parentElement.getBoundingClientRect();
  const mousePosition = { x: data.x - rect.left, y: data.y - rect.top };

  const edgeNodeData = {
    nodeId: data.nodeId,
    data: nodeData,
    index: data.index,
  };

  const positionData = {
    data: { position: mousePosition },
  };
  const startEdgeData: NewEdgeData = (() => {
    if (data.direction === "outbound") {
      return {
        direction: data.direction,
        source: edgeNodeData,
        target: positionData,
      };
    }
    return {
      direction: data.direction,
      source: positionData,
      target: edgeNodeData,
    };
  })();
  return {
    mousePosition,
    startEdgeData,
  };
};

export const edgeUpdateEventData = (data: Position, parentElement: HTMLElement | SVGSVGElement, prevEdgeData: NewEdgeData) => {
  const rect = parentElement.getBoundingClientRect();
  const mousePosition = { x: data.x - rect.left, y: data.y - rect.top };

  const newData = { data: { position: mousePosition } };

  const updateEdgeData =
    prevEdgeData.direction === "outbound"
      ? {
          ...prevEdgeData,
          target: newData,
        }
      : {
          ...prevEdgeData,
          source: newData,
        };
  return {
    mousePosition,
    updateEdgeData,
  };
};

export const edgeEndEventData = (newEdgeData: NewEdgeData, nearestData: GUINearestData): GUIEdgeData | null => {
  if (newEdgeData.direction === "outbound") {
    const sourceData = newEdgeData.source;
    const { nodeId, index } = sourceData;
    const addEdge: GUIEdgeData = {
      type: "edge",
      source: {
        nodeId,
        index,
      },
      target: nearestData,
    };
    return addEdge;
  }
  if (newEdgeData.direction === "inbound") {
    const targetData = newEdgeData.target;
    const { nodeId, index } = targetData;
    const addEdge: GUIEdgeData = {
      type: "edge",
      source: nearestData,
      target: {
        nodeId,
        index,
      },
    };
    return addEdge;
  }
  return null;
};

export const pickNearestNode = (nodes: GUINodeData[], targetNode: string, mouseCurrentPosition: Position) => {
  return nodes.reduce((closest: null | ClosestNodeData, node) => {
    if (targetNode === node.nodeId) {
      return closest;
    }
    const mouseX = mouseCurrentPosition.x;
    const mouseY = mouseCurrentPosition.y;

    const { x, y, width, height } = node.position;

    const closestX = Math.max(x, Math.min(mouseX, x + (width ?? 0)));
    const closestY = Math.max(y, Math.min(mouseY, y + (height ?? 0)));

    const distance = Math.sqrt((closestX - mouseX) ** 2 + (closestY - mouseY) ** 2);

    if (!closest || distance < closest.distance) {
      return { node, distance };
    }

    return closest;
  }, null);
};

export const pickNearestConnect = (nearestNode: ClosestNodeData, newEdgeData: NewEdgeData, mouseCurrentPosition: Position) => {
  const nodePos = nearestNode.node.position;
  const { inputCenters, outputCenters } = nodePos;

  const isOutput = newEdgeData.direction === "outbound";
  const centers = (isOutput ? inputCenters : outputCenters) ?? [];

  return centers.reduce((closest: null | { index: number; distance: number }, center: number, index: number) => {
    const nodeX = nodePos.x + (isOutput ? 0 : (nodePos?.width ?? 0));
    const nodeY = nodePos.y + center;
    const mouseX = mouseCurrentPosition.x;
    const mouseY = mouseCurrentPosition.y;

    const distance = Math.sqrt((nodeX - mouseX) ** 2 + (nodeY - mouseY) ** 2);
    if (!closest || distance < closest.distance) {
      return { index, distance };
    }

    return closest;
  }, null);
};

const sameEdge = (edge1: EdgeData | GUIEdgeData, edge2: EdgeData | GUIEdgeData) => {
  return (
    edge1.source.nodeId === edge2.source.nodeId &&
    edge1.source.index === edge2.source.index &&
    edge1.target.nodeId === edge2.target.nodeId &&
    edge1.target.index === edge2.target.index
  );
};
const sameTargetEdge = (edge1: EdgeData | GUIEdgeData, edge2: EdgeData | GUIEdgeData) => {
  return edge1.target.nodeId === edge2.target.nodeId && edge1.target.index === edge2.target.index;
};

export const isEdgeConnectale = (expectEdge: GUIEdgeData | null, edges: GUIEdgeData[], nodeRecords: GUINodeDataRecord, nestedGraphs: NestedGraphList) => {
  if (!expectEdge) {
    return false;
  }
  if (edges.find((edge) => sameEdge(edge, expectEdge))) {
    return false;
  }
  const existanceEdges = edges.filter((edge) => {
    return sameTargetEdge(edge, expectEdge);
  });
  const profile = edgeEnd2agentProfile(expectEdge.target, nodeRecords, "target", nestedGraphs);
  if (!profile) {
    // maybe static node
    return true;
  }
  if (profile.IOData.type === "text") {
    return existanceEdges.length === 0;
  }
  return true;
};

export const convEdgePath = (
  soureIndex: number | undefined,
  sourcePosition: NodePositionData,
  targetIndex: number | undefined,
  targetPosition: NodePositionData,
) => {
  const { x, y: y1, width, outputCenters } = sourcePosition;
  const x1 = x + (width ?? 0);
  const { x: x2, y: y2, inputCenters } = targetPosition;

  const y1Offset = soureIndex !== undefined && outputCenters && outputCenters.length >= soureIndex ? outputCenters[soureIndex] : 0;
  const y2Offset = targetIndex !== undefined && inputCenters && inputCenters.length >= targetIndex ? inputCenters[targetIndex] : 0;

  const y1dash = y1 + y1Offset;
  const y2dash = y2 + y2Offset;

  const ydashDiff = Math.abs(y1dash - y2dash);
  const controlYOffset = (ydashDiff > 40 ? 40 : ydashDiff) * (y1dash > y2dash ? 1 : -1);

  const xDiff = x2 - x1;
  const maxOffset = 120;
  const minOffset = 40;
  const offsetThreshold = maxOffset - minOffset;
  const controlXOffset = xDiff > 0 ? minOffset + (xDiff > offsetThreshold ? 0 : offsetThreshold - xDiff) : maxOffset;

  return `M ${x1} ${y1dash} C ${x1 + controlXOffset} ${y1dash - controlYOffset}, ${x2 - controlXOffset} ${y2dash + controlYOffset}, ${x2} ${y2dash}`;
};

const round = (data: number) => {
  return Math.round(data * 100) / 100;
};

export const getNodeSize = (nodeDom: HTMLElement | null, inputDoms: HTMLElement[], outputDoms: HTMLElement[]) => {
  if (!nodeDom) {
    return { width: 0, height: 0, outputCenters: [], inputCenters: [] };
  }
  const rect = nodeDom.getBoundingClientRect();
  const parentTop = rect.top;

  const getCenterHeight = (el: HTMLElement) => {
    const oRect = el.getBoundingClientRect();
    return round(oRect.top - parentTop + oRect.height / 2);
  };
  return {
    width: round(rect.width),
    height: round(rect.height),
    inputCenters: inputDoms.map(getCenterHeight),
    outputCenters: outputDoms.map(getCenterHeight),
  };
};

export const getTransformStyle = (nodeData: GUINodeData, isDragging: boolean) => {
  return {
    transform: `translate(${nodeData?.position?.x ?? 0}px, ${nodeData?.position?.y ?? 0}px)`,
    cursor: isDragging ? "grabbing" : "grab",
  };
};

export const getLoopWhileSources = (nodes: GUINodeData[]) => {
  return ["true"].concat(
    nodes.flatMap((node) => {
      const agent = node.data.guiAgentId;
      if (agent) {
        const profile = agentProfiles[agent] || { outputs: [] };
        return profile.outputs.map((prop) => `:${node.nodeId}.${prop.name}`);
      }
      return [`:${node.nodeId}`];
    }),
  );
};

export const getDefaultParams = (params: ParamData[]) => {
  return params.reduce((tmp: DefaultParamsType, param) => {
    if (param.defaultValue !== undefined) {
      tmp[param.name] = param.defaultValue;
    }
    return tmp;
  }, {});
};

export const handleDownload = (graphData: GraphData) => {
  const dataStr = JSON.stringify(graphData, null, 2);
  const blob = new Blob([dataStr], {
    type: `application/json`,
  });
  const link = document.createElement("a");
  link.href = window.URL.createObjectURL(blob);
  link.download = `graph.json`;
  link.click();
};

export const nestedGraphInputs = (graphData: GraphData) => {
  const nodes = graphData?.metadata?.data ? store2graphData(graphData?.metadata?.data).nodes : graphData.nodes;
  const staticInputs = Object.keys(nodes)
    .filter((nodeId) => {
      return !nodes[nodeId].agent;
    })
    .map((nodeId) => {
      return { name: nodeId, type: "data" };
    });
  return staticInputs;
};
