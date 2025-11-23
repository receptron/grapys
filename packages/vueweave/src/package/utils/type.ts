export type Position = { x: number; y: number };
export type NodePosition = Position & {
  width: number;
  height: number;
};
export type NodePositionData = Position & {
  width?: number;
  height?: number;
  outputCenters?: number[];
  inputCenters?: number[];
};

export type GUINodeDataType = "computed" | "static";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type GUINodeData<T = any> = {
  type: GUINodeDataType;
  nodeId: string;
  position: NodePositionData;
  data: T;
};

export type GUINodeDataRecord = Record<string, GUINodeData>;

export type EdgeEndPointData = {
  nodeId: string;
  index: number;
};

export type GUIEdgeDataType = "edge";
export type GUIEdgeData = {
  type: GUIEdgeDataType;
  source: EdgeEndPointData;
  target: EdgeEndPointData;
};

export type EdgeFormToData = {
  data: GUINodeData;
} & EdgeEndPointData;

export type EdgeData = {
  type: GUIEdgeDataType;
  source: EdgeFormToData;
  target: EdgeFormToData;
};

export type NewEdgeEventDirection = "outbound" | "inbound";

// x, y is clientX, clientY of mouse pointer
export type NewEdgeStartEventData = Position & {
  direction: NewEdgeEventDirection;
  index: number;
  nodeId: string;
};

export type GUINearestData = {
  nodeId: string;
  index: number;
  direction: NewEdgeEventDirection;
};

type NewEdgeMouseData = {
  data: {
    position: NodePositionData;
  };
  index?: number; // index and width, outputCenters, inputCenters never exists. for data type compatibility.
};
type NewEdgeNodeData = {
  nodeId: string;
  index: number;
  data: GUINodeData;
};

export type EdgeData2 = NewEdgeMouseData | NewEdgeNodeData;

export type NewEdgeData1 = {
  direction: "outbound";
  source: NewEdgeNodeData;
  target: NewEdgeMouseData;
};

export type NewEdgeData2 = {
  direction: "inbound";
  source: NewEdgeMouseData;
  target: NewEdgeNodeData;
};

export type NewEdgeData = NewEdgeData1 | NewEdgeData2;

export type ClosestNodeData = { node: GUINodeData; distance: number };

export type InputOutputType = "text" | "array" | "message" | "data" | "wait" | "boolean";
export type InputOutputData = { name: string; type?: InputOutputType; mapTo?: string };

export type ValidateConnectionFn = (expectEdge: GUIEdgeData, existingEdges: GUIEdgeData[]) => boolean;

// History and store-related types
export type UpdateNodePositionData = NodePosition | { width: number; height: number; outputCenters: number[]; inputCenters: number[] };

// BACKWARD COMPATIBILITY: Old format included 'loop' at root level.
// New format uses 'extra' for application-specific data.
export type HistoryPayload = {
  nodes: GUINodeData[];
  edges: GUIEdgeData[];
  extra?: Record<string, unknown>;
  // Deprecated: kept for backward compatibility
  loop?: unknown;
};

export type HistoryData = { name: string; data: HistoryPayload };
