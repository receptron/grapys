import { GUIEdgeData, GUILoopData, GUINodeDataRecord, HistoryPayload } from "./type";
import { NodeData, StaticNodeData } from "graphai";
import { edgeEnd2agentProfile } from "./utils";
import { agentProfiles } from "./data";
import { resultsOf } from "./result";

// import { graphs } from "../../graph";

// for store to generate new graphData
type SourceTargetIntermediateData = {
  sourceData: string;
  targetNodeId: string;
  targetPropId: string;
  targetIndex: number;
};
type SourceTargetTmpObject = Record<string, Record<string, SourceTargetIntermediateData[]>>;

type NodeEdgeMap = Record<string, string | string[]>;
type EdgeRecord = Record<string, NodeEdgeMap>;

export const edges2inputs = (edges: GUIEdgeData[], nodes: GUINodeData[], nestedGraphs: NestedGraphList) => {
  const nodeRecords = nodes.reduce((tmp: GUINodeDataRecord, current) => {
    tmp[current.nodeId] = current;
    return tmp;
  }, {});

  const records = edges
    .map((edge) => {
      const { source: sourceEdge, target: targetEdge } = edge;

      const sourceData = (() => {
        const sourceAgentProfile = edgeEnd2agentProfile(sourceEdge, nodeRecords, "source", nestedGraphs);
        if (sourceAgentProfile) {
          const props = sourceAgentProfile.IOData?.name;
          return `:${sourceEdge.nodeId}.${props}`;
        }
        return `:${sourceEdge.nodeId}`;
      })();
      const targetPropId = (() => {
        const targetAgentProfile = edgeEnd2agentProfile(targetEdge, nodeRecords, "target", nestedGraphs);
        if (targetAgentProfile) {
          const targetProp = targetAgentProfile.IOData?.name;
          return targetProp;
        }
        return "update";
      })();

      return {
        sourceData,
        targetNodeId: targetEdge.nodeId,
        targetPropId,
        targetIndex: targetEdge.index,
      };
    })
    .reduce((tmp: SourceTargetTmpObject, current) => {
      if (!tmp[current.targetNodeId]) {
        tmp[current.targetNodeId] = {};
      }
      if (!tmp[current.targetNodeId][current.targetPropId]) {
        tmp[current.targetNodeId][current.targetPropId] = [];
      }
      tmp[current.targetNodeId][current.targetPropId].push(current);
      return tmp;
    }, {});

  return Object.keys(records).reduce((edgeRecord: EdgeRecord, nodeId) => {
    const inputsRecord = Object.keys(records[nodeId]).reduce((nodeEdgeMap: NodeEdgeMap, propId) => {
      const { targetIndex } = records[nodeId][propId][0];
      const targetProfile = edgeEnd2agentProfile({ nodeId, index: targetIndex }, nodeRecords, "target", nestedGraphs);
      if (!targetProfile) {
        nodeEdgeMap[propId] = records[nodeId][propId][0].sourceData;
      } else if (targetProfile.IOData.type === "text") {
        nodeEdgeMap[propId] = records[nodeId][propId][0].sourceData;
      } else if (targetProfile.IOData.type === "array") {
        nodeEdgeMap[propId] = records[nodeId][propId].map((data) => data.sourceData);
      } else if (records[nodeId][propId].length === 1) {
        nodeEdgeMap[propId] = records[nodeId][propId][0].sourceData;
      } else {
        nodeEdgeMap[propId] = records[nodeId][propId].map((data) => data.sourceData);
      }
      return nodeEdgeMap;
    }, {});

    edgeRecord[nodeId] = inputsRecord;
    return edgeRecord;
  }, {});
};

const loop2LoopObj = (loop: GUILoopData) => {
  if (loop.loopType === "while") {
    return {
      while: loop.while,
    };
  }
  if (loop.loopType === "count") {
    return {
      count: loop.count,
    };
  }
  return undefined;
};

export const store2graphData = (currentData: HistoryPayload, nestedGraphs: NestedGraphList) => {
  const { nodes, edges, loop } = currentData;
  const edgeObject = edges2inputs(edges, nodes, nestedGraphs);

  const nestedOutput = {};
  const nestedOutputs = [];

  const newNodes = nodes.reduce((tmp: Record<string, NodeData>, node) => {
    const { guiAgentId } = node.data;
    const profile = agentProfiles[guiAgentId ?? ""];
    const inputs = profile?.inputSchema ? resultsOf(profile.inputSchema as NodeEdgeMap, edgeObject[node.nodeId]) : edgeObject[node.nodeId];
    // static node don't have profile and guiAgentId

    if (profile) {
      const agent = profile.agents ? profile.agents[node.data.agentIndex ?? 0] : profile.agent;
      tmp[node.nodeId] = {
        agent: profile.agents ? profile.agents[node.data.agentIndex ?? 0] : profile.agent,
        params: node.data.params,
        inputs: inputs ?? {},
        isResult: node.data?.params?.isResult ?? false,
        output: profile?.output,
        // anyInput (boolean)
        // if/unless (edge)
        // defaultValue (object?)
        // retry ?
        ...(profile.isNestedGraph || profile.isMap
          ? {
              graph: nestedGraphs[node.data.nestedGraphIndex].graph,
            }
          : {}),
      };

      if (node.data?.params?.isResult) {
        profile.outputs.forEach((IOData) => {
          const name = [node.nodeId, IOData.name].join("_");
          nestedOutput[name] = `.${node.nodeId}.${IOData.name}`;
          nestedOutputs.push({ name, type: IOData.type });
        });
      }
    } else {
      tmp[node.nodeId] = {
        value: node.data.value,
        ...inputs,
      } as StaticNodeData;
    }
    return tmp;
  }, {});

  console.log({ nestedOutput, nestedOutputs });
  // save inputs
  const newGraphData = {
    version: 0.5,
    nodes: newNodes,
    loop: loop2LoopObj(loop),
    metadata: {
      data: currentData,
      forNested: {
        output: nestedOutput,
        outputs: nestedOutputs,
      },
    },
  };
  return newGraphData;
};
