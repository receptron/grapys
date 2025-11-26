import type {
  GUINodeData,
  GUIEdgeData,
  GUINodeDataRecord,
  EdgeData,
  NewEdgeStartEventData,
  NewEdgeData,
  Position,
  GUINearestData,
  ClosestNodeData,
  NodePositionData,
  ValidateConnectionFn,
} from "./type";

const isTouch = (event: MouseEvent | TouchEvent): event is TouchEvent => {
  return "touches" in event;
};

const round = (data: number) => {
  return Math.round(data * 100) / 100;
};

export const getClientPos = (event: MouseEvent | TouchEvent) => {
  const clientX = isTouch(event) ? event.touches[0].clientX : event.clientX;
  const clientY = isTouch(event) ? event.touches[0].clientY : event.clientY;
  return { clientX, clientY };
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

// Edge validation helper
const isValidEdge = (edge: GUIEdgeData, nodeRecords: GUINodeDataRecord): boolean => {
  const sourceNode = nodeRecords[edge.source.nodeId];
  const targetNode = nodeRecords[edge.target.nodeId];

  if (!sourceNode || !targetNode) {
    console.error(`[VueWeave] Invalid edge: missing node. Source: ${edge.source.nodeId}, Target: ${edge.target.nodeId}`);
    return false;
  }

  // Check if source has outputs (only if outputCenters is initialized and not empty)
  const sourceOutputs = sourceNode.position.outputCenters || [];
  if (sourceOutputs.length > 0 && edge.source.index >= sourceOutputs.length) {
    console.error(
      `[VueWeave] Invalid edge: source node "${edge.source.nodeId}" does not have output at index ${edge.source.index}. ` +
        `Available outputs: ${sourceOutputs.length}`,
    );
    return false;
  }

  // Check if target has inputs (only if inputCenters is initialized and not empty)
  const targetInputs = targetNode.position.inputCenters || [];
  if (targetInputs.length > 0 && edge.target.index >= targetInputs.length) {
    console.error(
      `[VueWeave] Invalid edge: target node "${edge.target.nodeId}" does not have input at index ${edge.target.index}. ` +
        `Available inputs: ${targetInputs.length}`,
    );
    return false;
  }

  return true;
};

// Edge related functions
export const guiEdgeData2edgeData = (guiEdges: GUIEdgeData[], nodeRecords: GUINodeDataRecord): EdgeData[] => {
  return guiEdges
    .filter((edge) => isValidEdge(edge, nodeRecords))
    .map((edge) => {
      const { type, source, target } = edge;
      return {
        type,
        source: {
          kind: "node" as const,
          ...source,
          data: nodeRecords[edge.source.nodeId],
        },
        target: {
          kind: "node" as const,
          ...target,
          data: nodeRecords[edge.target.nodeId],
        },
      };
    });
};

export const edgeStartEventData = (data: NewEdgeStartEventData, parentElement: HTMLElement | SVGSVGElement, nodeData: GUINodeData) => {
  const rect = parentElement.getBoundingClientRect();
  const mousePosition = { x: data.x - rect.left, y: data.y - rect.top };

  const edgeNodeData = {
    kind: "node" as const,
    nodeId: data.nodeId,
    data: nodeData,
    index: data.index,
  };

  const positionData = {
    kind: "mouse" as const,
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

  const newData = { kind: "mouse" as const, data: { position: mousePosition } };

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

export const pickNearestNode = (nodes: GUINodeData[], mouseCurrentPosition: Position) => {
  return nodes.reduce((closest: null | ClosestNodeData, node) => {
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

  const closestPort = centers.reduce((acc: null | { index: number; distance: number }, center: number, index: number) => {
    const nodeX = nodePos.x + (isOutput ? 0 : (nodePos?.width ?? 0));
    const nodeY = nodePos.y + center;
    const mouseX = mouseCurrentPosition.x;
    const mouseY = mouseCurrentPosition.y;

    const distance = Math.sqrt((nodeX - mouseX) ** 2 + (nodeY - mouseY) ** 2);
    if (!acc || distance < acc.distance) {
      return { index, distance };
    }

    return acc;
  }, null);

  // Only return a connection if within threshold distance (50px)
  const CONNECT_THRESHOLD = 50;
  if (closestPort && closestPort.distance < CONNECT_THRESHOLD) {
    return closestPort;
  }
  return null;
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

export const isEdgeConnectable = (expectEdge: GUIEdgeData | null, edges: GUIEdgeData[], validateConnection?: ValidateConnectionFn) => {
  if (!expectEdge) {
    return false;
  }
  if (expectEdge.target.nodeId === expectEdge.source.nodeId) {
    return false;
  }

  if (edges.find((edge) => sameEdge(edge, expectEdge))) {
    return false;
  }
  const existingEdges = edges.filter((edge) => {
    return sameTargetEdge(edge, expectEdge);
  });

  // Additional validation callback (application-specific logic)
  if (validateConnection) {
    return validateConnection(expectEdge, existingEdges);
  }

  // Default: allow connection if no existing edges to same target
  return existingEdges.length === 0;
};

export const convEdgePath = (
  sourceIndex: number | undefined,
  sourcePosition: NodePositionData,
  targetIndex: number | undefined,
  targetPosition: NodePositionData,
) => {
  const { x, y: y1, width, outputCenters } = sourcePosition;
  const x1 = x + (width ?? 0);
  const { x: x2, y: y2, inputCenters } = targetPosition;

  const y1Offset = sourceIndex !== undefined && outputCenters && outputCenters.length > sourceIndex ? outputCenters[sourceIndex] : 0;
  const y2Offset = targetIndex !== undefined && inputCenters && inputCenters.length > targetIndex ? inputCenters[targetIndex] : 0;

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
