import React from "react";
import NodeComputedParam from "./NodeComputedParam";
import { agentProfiles } from "../utils/gui/data";
import type { GUINodeData } from "../package/utils";

interface NodeComputedParamsProps {
  nodeData: GUINodeData;
  nodeIndex: number;
  onFocus: () => void;
  onBlur: () => void;
}

const NodeComputedParams: React.FC<NodeComputedParamsProps> = ({ nodeData, nodeIndex, onFocus, onBlur }) => {
  const profile = agentProfiles[nodeData.data.guiAgentId ?? ""];
  const params = profile?.params ?? [];

  return (
    <div>
      {params.map((param, k) => (
        <NodeComputedParam key={k} param={param} nodeIndex={nodeIndex} appData={nodeData.data} onFocus={onFocus} onBlur={onBlur} />
      ))}
    </div>
  );
};

export default NodeComputedParams;
