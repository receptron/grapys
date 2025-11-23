import type { GraphData, DefaultParamsType } from "graphai";

export type StaticNodeType = "text" | "data" | "number" | "boolean";

export type ApplicationData = {
  // Application dependent data
  // agent?: string; // actual agent id
  guiAgentId?: string; // key of utils/gui/utils/data.
  agentIndex?: number; // If agents exist in AgentProfile, choose one.
  value?: unknown; // ResultData<DefaultResultData>;
  staticNodeType?: StaticNodeType;
  params?: DefaultParamsType;
  isResult?: boolean;
  nestedGraphIndex?: number;
};

// Re-export types from package for backward compatibility
export type {
  Position,
  NodePosition,
  NodePositionData,
  GUINodeDataType,
  GUINodeData,
  GUINodeDataRecord,
  EdgeEndPointData,
  GUIEdgeDataType,
  GUIEdgeData,
  EdgeFormToData,
  EdgeData,
  NewEdgeEventDirection,
  NewEdgeStartEventData,
  GUINearestData,
  EdgeData2,
  NewEdgeData1,
  NewEdgeData2,
  NewEdgeData,
  ClosestNodeData,
  InputOutputType,
  InputOutputData,
} from "../../package/utils/type";

import type { NodePosition, GUINodeData, GUIEdgeData, InputOutputData } from "../../package/utils/type";

export type UpdateNodePositionData = NodePosition | { width: number; height: number; outputCenters: number[]; inputCenters: number[] };

export type UpdateStaticValue = {
  staticNodeType: StaticNodeType;
  value: string | number | boolean;
};
export type UpdateAgentValue = {
  agentIndex: number;
  agent?: string;
};

export type NearestData = {
  nodeId: string;
  index: number;
  direction: string;
};

export type ParamType = "string" | "text" | "data" | "boolean" | "float" | "int" | "enum";

export type ParamData = {
  name: string;
  type?: ParamType;
  defaultValue?: number | boolean | string;
  max?: number;
  min?: number;
  step?: number;
  values?: string[];
};
export type AgentProfile = {
  inputs: InputOutputData[];
  outputs: InputOutputData[];
  params?: ParamData[];
  agent?: string;
  agents?: string[];
  inputSchema?: unknown;
  output?: Record<string, string>;
  isNestedGraph?: boolean;
  isMap?: boolean;
  if?: string;
  unless?: string;
};

export type LoopDataType = "while" | "count" | "none";
export type GUILoopData = {
  loopType: LoopDataType;
  while?: string | true;
  count?: number;
};
export type HistoryPayload = {
  loop: GUILoopData;
  nodes: GUINodeData[];
  edges: GUIEdgeData[];
};
export type HistoryData = { name: string; data: HistoryPayload };

export type GUIMessage = {
  role: string;
  content: string;
  nodeId: string;
};

export type GraphDataMetaData = {
  metadata?: {
    data?: HistoryPayload;
    forNested?: {
      output: Record<string, unknown>; // ComputedNode output
      outputs: InputOutputData[];
    };
  };
};

export type NestedGraphList = { name: string; graph: GraphData & GraphDataMetaData; id: string }[];
