import type {
  Position,
  GUINodeData,
  GUIEdgeData,
  GUINodeDataRecord,
  EdgeData,
  NewEdgeStartEventData,
  NewEdgeData,
  GUINearestData,
  ClosestNodeData,
  NodePositionData,
} from "../types";

/**
 * Convert GUI edge data to edge data with full node information
 */
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

/**
 * Create initial edge data when starting edge creation
 */
export const edgeStartEventData = (data: NewEdgeStartEventData, parentElement: HTMLElement | SVGSVGElement, nodeData: GUINodeData) => {
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

/**
 * Update edge data during edge creation (mouse move)
 */
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

/**
 * Create final edge data when ending edge creation
 */
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

/**
 * Generate SVG path for edge (Bezier curve)
 */
export const convEdgePath = (
  sourceIndex: number | undefined,
  sourcePosition: NodePositionData,
  targetIndex: number | undefined,
  targetPosition: NodePositionData,
) => {
  const { x, y: y1, width, outputCenters } = sourcePosition;
  const x1 = x + (width ?? 0);
  const { x: x2, y: y2, inputCenters } = targetPosition;

  const y1Offset = sourceIndex !== undefined && outputCenters && outputCenters.length >= sourceIndex ? outputCenters[sourceIndex] : 0;
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
