import type { GraphData, DefaultParamsType } from "graphai";
import type { GUINodeData, GUIEdgeData, InputOutputData, HistoryPayload } from "../../package";

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

export type AppHistoryPayload = {
  nodes: GUINodeData[];
  edges: GUIEdgeData[];
  extra: {
    loop: GUILoopData;
  };
};

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
