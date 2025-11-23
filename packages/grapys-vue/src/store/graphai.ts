import { ref } from "vue";
import { defineStore } from "pinia";
import { store2graphData } from "../utils/gui/graph";
import { graphs } from "../graph/nested";
import type { HistoryPayload } from "../package";
import type { GUILoopData } from "../utils/gui/type";

export const useGraphAIStore = defineStore("graphai", () => {
  const graphAIResults = ref<Record<string, unknown>>({});

  // graphAIResult
  const setResult = (nodeId: string, result: unknown) => {
    const ret = graphAIResults.value;
    ret[nodeId] = result;
    graphAIResults.value = ret;
  };

  // for nested agent
  const nestedGraphs = graphs;

  // Create graphData from current GUI data (needs to be passed from main store)
  const createGraphData = (currentData: HistoryPayload) => {
    // BACKWARD COMPATIBILITY: Support both old (root.loop) and new (extra.loop) format
    const extra = currentData.extra as { loop?: GUILoopData } | undefined;
    const loop: GUILoopData = extra?.loop ?? (currentData.loop as GUILoopData | undefined) ?? { loopType: "none" };

    const dataWithLoop = {
      nodes: currentData.nodes,
      edges: currentData.edges,
      loop,
    };

    return store2graphData(dataWithLoop, graphs);
  };

  // Get stream nodes from current nodes
  const getStreamNodes = (nodes: { nodeId: string; data?: { params?: { stream?: boolean } } }[]) => {
    return nodes
      .filter((node) => {
        return node.data?.params?.stream ?? false;
      })
      .map((node) => node.nodeId);
  };

  // Get result nodes from current nodes
  const getResultNodes = (nodes: { nodeId: string; data?: { params?: { isResult?: boolean } } }[]) => {
    return nodes
      .filter((node) => {
        return node.data?.params?.isResult ?? false;
      })
      .map((node) => node.nodeId);
  };

  return {
    // graphAIResult
    setResult,
    graphAIResults,

    // for nested agent
    nestedGraphs,

    // helper methods
    createGraphData,
    getStreamNodes,
    getResultNodes,
  };
});
