import { ref } from "vue";
import { defineStore } from "pinia";
import { graphs } from "../../../graph/nested";
import type { NestedGraphList } from "../../../utils/gui/type";

/**
 * GraphAI-specific store
 * Handles GraphAI execution results and nested graphs
 */
export const useGraphAIStore = defineStore("graphai", () => {
  // GraphAI execution results
  const graphAIResults = ref<Record<string, unknown>>({});

  // Nested graphs for nestedAgent and mapAgent
  const nestedGraphs = ref<NestedGraphList>(graphs);

  const setResult = (nodeId: string, result: unknown) => {
    graphAIResults.value[nodeId] = result;
  };

  const clearResults = () => {
    graphAIResults.value = {};
  };

  return {
    graphAIResults,
    nestedGraphs,
    setResult,
    clearResults,
  };
});
