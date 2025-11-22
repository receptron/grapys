import { ref, computed } from "vue";
import { GUINodeData, GUIEdgeData, GUINodeDataRecord, HistoryData, HistoryPayload, NodePosition } from "../types";
import { defineStore } from "pinia";
import type { GraphEditorPlugin } from "../types/plugin";

export const useGraphStore = defineStore("graphEditor", () => {
  const histories = ref<HistoryData[]>([]);
  const currentData = ref<HistoryPayload>({
    nodes: [],
    edges: [],
    metadata: {},
  });
  const index = ref(0);

  // Plugin registry
  const plugins = ref<GraphEditorPlugin[]>([]);

  const reset = () => {
    updateData([], [], {}, "reset", true);
  };

  const nodes = computed(() => {
    return currentData.value.nodes;
  });

  const edges = computed(() => {
    return currentData.value.edges;
  });

  const metadata = computed(() => {
    return currentData.value.metadata ?? {};
  });

  const nodeRecords = computed<GUINodeDataRecord>(() => {
    return nodes.value.reduce((tmp: GUINodeDataRecord, current) => {
      tmp[current.nodeId] = current;
      return tmp;
    }, {});
  });

  // Plugin management
  const registerPlugin = (plugin: GraphEditorPlugin) => {
    plugins.value.push(plugin);
    plugin.onInit?.();
  };

  const getPlugin = (name: string) => {
    return plugins.value.find((p) => p.name === name);
  };

  // Data management
  const loadData = (data: HistoryPayload) => {
    currentData.value = data;
    pushDataToHistory("load", data);
  };

  const updateData = (nodeData: GUINodeData[], edgeData: GUIEdgeData[], metaData: Record<string, unknown>, name: string, saveHistory: boolean) => {
    const data = { nodes: nodeData, edges: edgeData, metadata: metaData };
    currentData.value = data;
    if (saveHistory) {
      pushDataToHistory(name, data);
    }
  };

  const pushDataToHistory = (name: string, data: HistoryPayload) => {
    histories.value.length = index.value;
    histories.value.push({ data, name });
    index.value = index.value + 1;
  };

  const saveNodePositionData = () => {
    pushDataToHistory("position", currentData.value);
  };

  const initData = (nodeData: GUINodeData[], edgeData: GUIEdgeData[], metaData: Record<string, unknown> = {}) => {
    const data = { nodes: nodeData, edges: edgeData, metadata: metaData };
    currentData.value = data;
  };

  // Node operations
  const pushNode = (nodeData: GUINodeData) => {
    // Call plugin hooks
    plugins.value.forEach((plugin) => plugin.onNodeAdd?.(nodeData));

    updateData([...nodes.value, nodeData], [...edges.value], { ...metadata.value }, "addNode", true);
  };

  const updateNodePosition = (positionIndex: number, pos: NodePosition) => {
    const newNode = { ...nodes.value[positionIndex] };
    newNode.position = { ...newNode.position, ...pos };
    const newNodes = [...nodes.value];
    newNodes[positionIndex] = newNode;

    // Call plugin hooks
    plugins.value.forEach((plugin) => plugin.onNodeUpdate?.(newNode.nodeId, { position: newNode.position }));

    updateData(newNodes, [...edges.value], { ...metadata.value }, "updatePosition", false);
  };

  const updateNodeData = (positionIndex: number, data: Partial<GUINodeData>) => {
    const oldNode = nodes.value[positionIndex];
    const newNode = { ...oldNode, ...data };
    const newNodes = [...nodes.value];
    newNodes[positionIndex] = newNode;

    // Call plugin hooks
    plugins.value.forEach((plugin) => plugin.onNodeUpdate?.(newNode.nodeId, data));

    updateData(newNodes, [...edges.value], { ...metadata.value }, "updateNode", true);
  };

  const deleteNode = (nodeIndex: number) => {
    const node = nodes.value[nodeIndex];

    // Call plugin hooks
    plugins.value.forEach((plugin) => plugin.onNodeDelete?.(node.nodeId));

    updateData(
      [...nodes.value.filter((__, idx) => idx !== nodeIndex)],
      [
        ...edges.value.filter((edge) => {
          const { source, target } = edge;
          return source.nodeId !== node.nodeId && target.nodeId !== node.nodeId;
        }),
      ],
      { ...metadata.value },
      "deleteNode",
      true,
    );
  };

  // Edge operations
  const pushEdge = (edgeData: GUIEdgeData) => {
    // Validate with plugins
    const isValid = plugins.value.every((plugin) => {
      if (plugin.validateEdge) {
        return plugin.validateEdge(edgeData.source, edgeData.target, nodes.value, edges.value);
      }
      return true;
    });

    if (!isValid) {
      return;
    }

    // Call plugin hooks
    plugins.value.forEach((plugin) => plugin.onEdgeAdd?.(edgeData));

    updateData([...nodes.value], [...edges.value, edgeData], { ...metadata.value }, "addEdge", true);
  };

  const deleteEdge = (edgeIndex: number) => {
    // Call plugin hooks
    plugins.value.forEach((plugin) => plugin.onEdgeDelete?.(String(edgeIndex)));

    updateData([...nodes.value], [...edges.value.filter((__, idx) => idx !== edgeIndex)], { ...metadata.value }, "deleteEdge", true);
  };

  // History operations
  const undoable = computed(() => {
    return index.value > 1;
  });

  const undo = () => {
    if (undoable.value) {
      currentData.value = histories.value[index.value - 2].data;
      index.value = index.value - 1;
    }
  };

  const redoable = computed(() => {
    return index.value < histories.value.length;
  });

  const redo = () => {
    if (redoable.value) {
      currentData.value = histories.value[index.value].data;
      index.value = index.value + 1;
    }
  };

  // Export data via plugins
  const exportData = () => {
    const plugin = plugins.value.find((p) => p.exportData);
    if (plugin?.exportData) {
      return plugin.exportData(currentData.value);
    }
    return currentData.value;
  };

  // Import data via plugins
  const importData = (data: unknown) => {
    const plugin = plugins.value.find((p) => p.importData);
    if (plugin?.importData) {
      const payload = plugin.importData(data);
      loadData(payload);
    }
  };

  return {
    // State
    histories,
    currentData,

    // Computed
    nodes,
    edges,
    metadata,
    nodeRecords,
    undoable,
    redoable,

    // Plugin management
    plugins,
    registerPlugin,
    getPlugin,

    // Data operations
    initData,
    loadData,
    exportData,
    importData,

    // Node operations
    pushNode,
    updateNodePosition,
    updateNodeData,
    deleteNode,

    // Edge operations
    pushEdge,
    deleteEdge,

    // History operations
    saveNodePositionData,
    undo,
    redo,

    // Misc
    reset,
  };
});
