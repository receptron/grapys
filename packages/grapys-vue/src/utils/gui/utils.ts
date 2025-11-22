import {
  GUINodeData,
  GUIEdgeData,
  GUINodeDataRecord,
  AgentProfile,
  InputOutputData,
  EdgeEndPointData,
  StaticNodeType,
  GUILoopData,
  ParamData,
  NestedGraphList,
  GraphDataMetaData,
} from "./type";
import { inputs2dataSources, GraphData, isComputedNodeData, isStaticNodeData, DefaultParamsType, LoopData } from "graphai";
import { agentProfiles } from "./data";
import { store2graphData } from "./graph";

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

export const graphToGUIData = (graphData: GraphData & GraphDataMetaData) => {
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
    const inputs = isComputed ? (node.inputs ?? {}) : node.update ? { update: node.update } : {};
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
        // only for nested not map agent
        if (profile.isNestedGraph) {
          return nestedGraphs[node.data?.nestedGraphIndex ?? 0].graph?.metadata?.forNested?.outputs[edgeEndPointData.index];
        }
        return profile.outputs[edgeEndPointData.index];
      }
      // inputs
      if (profile.isNestedGraph) {
        // only for nested not map agent
        return nestedGraphInputs(nestedGraphs[node.data?.nestedGraphIndex ?? 0].graph)[edgeEndPointData.index];
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

export const getLoopWhileSources = (nodes: GUINodeData[], nestedGraphs: NestedGraphList) => {
  return ["true"].concat(
    nodes.flatMap((node) => {
      const agent = node.data.guiAgentId;
      if (agent) {
        const profile = agentProfiles[agent] || { outputs: [] };
        const { outputs } = profile.isNestedGraph ? (nestedGraphs[node.data?.nestedGraphIndex ?? 0].graph?.metadata?.forNested ?? profile ?? {}) : profile;
        return (outputs ?? []).map((prop: InputOutputData) => `:${node.nodeId}.${prop.name}`);
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
    if (param.values) {
      tmp[param.name] = param.values[0];
    }
    return tmp;
  }, {});
};

export const handleDownload = (graphData: GraphData & GraphDataMetaData) => {
  const dataStr = JSON.stringify(graphData, null, 2);
  const blob = new Blob([dataStr], {
    type: `application/json`,
  });
  const link = document.createElement("a");
  link.href = window.URL.createObjectURL(blob);
  link.download = `graph.json`;
  link.click();
};

export const nestedGraphInputs = (graphData: GraphData & GraphDataMetaData) => {
  const nodes = graphData?.metadata?.data ? store2graphData(graphData?.metadata?.data, []).nodes : graphData.nodes;
  const staticInputs = Object.keys(nodes)
    .filter((nodeId) => {
      return isStaticNodeData(nodes[nodeId]);
    })
    .map((nodeId) => {
      return { name: nodeId, type: "data" };
    });
  return staticInputs;
};
