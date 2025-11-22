/**
 * Store Adapter
 * Provides backward compatibility between old store API and new vue-flow store + GraphAI plugin
 */

import { computed, type ComputedRef } from "vue";
import { defineStore } from "pinia";
import { useGraphStore } from "@receptron/vue-flow";
import { useGraphAIStore } from "../plugins/graphai/store/graphaiStore";
import { createGraphAIPlugin } from "../plugins/graphai";
import type { GUINodeData, GUIEdgeData, GUILoopData, UpdateStaticValue, GUINodeDataRecord, HistoryData } from "../utils/gui/type";
import type { GraphData } from "graphai";

export const useStoreAdapter = defineStore("store", () => {
  const coreStore = useGraphStore();
  const graphaiStore = useGraphAIStore();

  // Register GraphAI plugin if not already registered
  if (!coreStore.getPlugin("graphai")) {
    const plugin = createGraphAIPlugin(graphaiStore.nestedGraphs);
    coreStore.registerPlugin(plugin);
  }

  // Computed properties - compatible with old API
  // Wrap in computed to ensure reactivity across store instances
  const nodes = computed(() => coreStore.nodes) as ComputedRef<GUINodeData[]>;
  const edges = computed(() => coreStore.edges) as ComputedRef<GUIEdgeData[]>;

  // Loop is now in metadata
  const loop = computed<GUILoopData>(() => {
    return (coreStore.metadata.loop as GUILoopData) || { loopType: "none" };
  });

  const nodeRecords = computed(() => coreStore.nodeRecords) as ComputedRef<GUINodeDataRecord>;

  const graphData = computed<GraphData>(() => {
    const plugin = coreStore.getPlugin("graphai");
    if (plugin?.exportData) {
      return plugin.exportData(coreStore.currentData as any) as GraphData;
    }
    return {} as GraphData;
  });

  const streamNodes = computed(() => {
    return coreStore.nodes
      .filter((node: any) => node.data?.params?.stream ?? false)
      .map((node: any) => node.nodeId);
  });

  const resultNodes = computed(() => {
    return coreStore.nodes
      .filter((node: any) => node.data?.params?.isResult ?? false)
      .map((node: any) => node.nodeId);
  });

  // History - Pinia auto-unwraps refs from other stores
  const histories: ComputedRef<HistoryData[]> = computed(() => coreStore.histories) as any;
  const undoable: ComputedRef<boolean> = coreStore.undoable as any; // already computed
  const redoable: ComputedRef<boolean> = coreStore.redoable as any; // already computed

  // Methods - compatible with old API
  const reset = () => {
    coreStore.initData([], [], { loop: { loopType: "none" } });
  };

  const loadData = (data: { nodes: GUINodeData[]; edges: GUIEdgeData[]; loop: GUILoopData }) => {
    coreStore.loadData({
      nodes: data.nodes,
      edges: data.edges,
      metadata: { loop: data.loop },
    });
  };

  const initData = (nodeData: GUINodeData[], edgeData: GUIEdgeData[], loopData: GUILoopData) => {
    coreStore.initData(nodeData, edgeData, { loop: loopData });
  };

  const initFromGraphData = (graph: GraphData) => {
    const plugin = coreStore.getPlugin("graphai");
    if (plugin?.importData) {
      const payload = plugin.importData(graph);
      coreStore.loadData(payload);
    }
  };

  const pushNode = (nodeData: GUINodeData) => {
    coreStore.pushNode(nodeData);
  };

  const updateNodePosition = (positionIndex: number, pos: any) => {
    coreStore.updateNodePosition(positionIndex, pos);
  };

  const updateNodeParam = (positionIndex: number, key: string, value: unknown) => {
    const oldNode = nodes.value[positionIndex];
    const newData = {
      ...oldNode.data,
      params: oldNode.data.params ? { ...oldNode.data.params } : {},
    };

    if (value === "" || value === undefined || (value === null && newData.params && newData.params[key] !== undefined)) {
      const { [key]: __, ...updatedParams } = newData.params || {};
      newData.params = updatedParams;
    } else {
      newData.params = { ...(newData.params || {}), [key]: value };
    }

    coreStore.updateNodeData(positionIndex, { data: newData });
  };

  const updateStaticNodeValue = (positionIndex: number, value: UpdateStaticValue, saveHistory: boolean) => {
    const oldNode = nodes.value[positionIndex];
    const newData = { ...oldNode.data, ...value };

    if (saveHistory) {
      coreStore.updateNodeData(positionIndex, { data: newData });
    } else {
      // For non-history updates, we need to manually update
      const newNode = { ...oldNode, data: newData };
      const newNodes = [...nodes.value];
      newNodes[positionIndex] = newNode;
      coreStore.initData(newNodes, [...edges.value], { loop: loop.value });
    }
  };

  const updateNestedGraph = (positionIndex: number, value: UpdateStaticValue) => {
    const oldNode = nodes.value[positionIndex];
    const newData = { ...oldNode.data, ...value };
    const newNode = { ...oldNode, data: newData };

    // Remove edges connected to this node
    const newEdges = edges.value.filter((edge) => {
      return edge.source.nodeId !== newNode.nodeId && edge.target.nodeId !== newNode.nodeId;
    });

    const newNodes = [...nodes.value];
    newNodes[positionIndex] = newNode;

    coreStore.initData(newNodes, newEdges, { loop: loop.value });
    coreStore.histories.push({
      name: "NestedGraph",
      data: {
        nodes: newNodes,
        edges: newEdges,
        metadata: { loop: loop.value },
      },
    });
  };

  const updateLoop = (loopData: GUILoopData) => {
    coreStore.initData([...nodes.value], [...edges.value], { loop: loopData });
    coreStore.histories.push({
      name: "loopUpdate",
      data: {
        nodes: [...nodes.value],
        edges: [...edges.value],
        metadata: { loop: loopData },
      },
    });
  };

  const pushEdge = (edgeData: GUIEdgeData) => {
    coreStore.pushEdge(edgeData);
  };

  const deleteEdge = (edgeIndex: number) => {
    coreStore.deleteEdge(edgeIndex);
  };

  const deleteNode = (nodeIndex: number) => {
    coreStore.deleteNode(nodeIndex);
  };

  const saveNodePositionData = () => {
    coreStore.saveNodePositionData();
  };

  const undo = () => {
    coreStore.undo();
  };

  const redo = () => {
    coreStore.redo();
  };

  // GraphAI-specific
  const setResult = (nodeId: string, result: unknown) => {
    graphaiStore.setResult(nodeId, result);
  };

  // GraphAI - Pinia auto-unwraps refs from other stores
  const graphAIResults = computed(() => graphaiStore.graphAIResults);
  const nestedGraphs = computed(() => graphaiStore.nestedGraphs);

  // Return compatible API
  return {
    // State
    histories,
    currentData: computed(() => ({
      nodes: nodes.value,
      edges: edges.value,
      loop: loop.value,
    })),

    // Computed
    nodes,
    edges,
    loop,
    graphData,
    nodeRecords,
    streamNodes,
    resultNodes,
    undoable,
    redoable,

    // Methods
    initData,
    initFromGraphData,
    pushNode,
    pushEdge,
    deleteEdge,
    deleteNode,
    updateNodePosition,
    updateNodeParam,
    saveNodePositionData,
    loadData,
    updateStaticNodeValue,
    updateNestedGraph,
    updateLoop,
    undo,
    redo,
    reset,

    // GraphAI
    setResult,
    graphAIResults,
    nestedGraphs,
  };
});

// Re-export as useStore for backward compatibility
export { useStoreAdapter as useStore };
