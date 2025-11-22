// Core types for graph-editor (GraphAI-independent)

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

export type UpdateNodePositionData = NodePosition | { width: number; height: number; outputCenters: number[]; inputCenters: number[] };

// Generic node data - no GraphAI specifics
export type GUINodeData<T = Record<string, unknown>> = {
  type: string; // Generic type string (e.g., "computed", "static", etc.)
  nodeId: string;
  position: NodePositionData;
  data: T; // Generic data payload
  profile?: NodeProfile; // Optional node profile
};

export type GUINodeDataRecord = Record<string, GUINodeData>;

// Port definition for nodes
export type PortDefinition = {
  name: string;
  type?: string; // Generic type string
  [key: string]: unknown; // Allow plugin-specific properties
};

// Node profile (replaces AgentProfile)
export type NodeProfile = {
  id: string; // Profile ID
  inputs: PortDefinition[];
  outputs: PortDefinition[];
  category?: string;
  [key: string]: unknown; // Allow plugin-specific properties
};

// Edge types
export type EdgeEndPointData = {
  nodeId: string;
  index: number;
};

export type GUIEdgeDataType = "edge"; // Extensible
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

// New edge creation types
export type NewEdgeEventDirection = "outbound" | "inbound";

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
  index?: number;
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

export type NearestData = {
  nodeId: string;
  index: number;
  direction: string;
};

// History types
export type HistoryPayload = {
  nodes: GUINodeData[];
  edges: GUIEdgeData[];
  metadata?: Record<string, unknown>; // Generic metadata
};

export type HistoryData = { name: string; data: HistoryPayload };
