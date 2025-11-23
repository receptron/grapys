import { ref, computed } from "vue";
import { GUINodeData, GUIEdgeData, GUINodeDataRecord, UpdateNodePositionData, HistoryData, HistoryPayload } from "../utils";
import { defineStore } from "pinia";

import { graphToGUIData } from "../../utils/gui/utils";
import type { GraphData } from "graphai";

export const useFlowStore = defineStore("store", () => {
  const histories = ref<HistoryData[]>([]);
  const currentData = ref<HistoryPayload>({
    nodes: [],
    edges: [],
    extra: {},
  });
  const index = ref(0);

  const reset = (defaultExtra: Record<string, unknown> = {}) => {
    updateData([], [], defaultExtra, "reset", true);
  };

  const nodes = computed(() => {
    return currentData.value.nodes;
  });

  const edges = computed(() => {
    return currentData.value.edges;
  });

  const extra = computed(() => {
    return currentData.value.extra ?? {};
  });

  const nodeRecords = computed<GUINodeDataRecord>(() => {
    return nodes.value.reduce((tmp: GUINodeDataRecord, current) => {
      tmp[current.nodeId] = current;
      return tmp;
    }, {});
  });
  // end of computed

  const loadData = (data: HistoryPayload) => {
    // BACKWARD COMPATIBILITY: Migrate old format (root.loop) to new format (extra.loop)
    if (data.loop && !data.extra?.loop) {
      currentData.value = {
        nodes: data.nodes,
        edges: data.edges,
        extra: {
          loop: data.loop,
        },
      };
    } else {
      currentData.value = data;
    }
    pushDataToHistory("load", currentData.value);
  };
  const updateData = (nodeData: GUINodeData[], edgeData: GUIEdgeData[], extraData: Record<string, unknown>, name: string, saveHistory: boolean) => {
    const data = {
      nodes: nodeData,
      edges: edgeData,
      extra: extraData,
    };
    currentData.value = data;
    if (saveHistory) {
      pushDataToHistory(name, data);
    }
  };
  const pushDataToHistory = (name: string, data: HistoryPayload) => {
    // don't call directory.
    histories.value.length = index.value;
    histories.value.push({ data, name });
    index.value = index.value + 1;
  };
  const saveNodePositionData = () => {
    // just special case. only use position update.
    pushDataToHistory("position", currentData.value);
  };

  const initData = (nodeData: GUINodeData[], edgeData: GUIEdgeData[], extraData: Record<string, unknown>) => {
    const data = {
      nodes: nodeData,
      edges: edgeData,
      extra: extraData,
    };
    currentData.value = data;
    // this time, node position is not set. save after mounted.
  };

  const initFromGraphData = (graph: GraphData, extraData: Record<string, unknown> = {}) => {
    const { rawEdge, rawNode, loop: loopData } = graphToGUIData(graph);
    // BACKWARD COMPATIBILITY: If graph has loop, put it in extra.loop
    const initExtra = loopData ? { ...extraData, loop: loopData } : extraData;
    initData(rawNode, rawEdge, initExtra);
  };

  // node
  const pushNode = (nodeData: GUINodeData) => {
    updateData([...nodes.value, nodeData], [...edges.value], { ...extra.value }, "addNode", true);
  };

  const updateNodePosition = (positionIndex: number, pos: UpdateNodePositionData) => {
    const newNode = { ...nodes.value[positionIndex] };
    newNode.position = { ...newNode.position, ...pos };
    const newNodes = [...nodes.value];
    newNodes[positionIndex] = newNode;
    updateData(newNodes, [...edges.value], { ...extra.value }, "updatePosition", false);
  };

  // Low-level API: Generic node updater
  const updateNodeAt = (nodeIndex: number, updater: (node: GUINodeData) => GUINodeData, name: string, saveHistory: boolean) => {
    const newNodes = [...nodes.value];
    newNodes[nodeIndex] = updater({ ...nodes.value[nodeIndex] });
    updateData(newNodes, [...edges.value], { ...extra.value }, name, saveHistory);
  };

  // Low-level API: Generic nodes and edges updater
  const updateNodesAndEdges = (
    nodeUpdater: (nodes: GUINodeData[]) => GUINodeData[],
    edgeUpdater: (edges: GUIEdgeData[]) => GUIEdgeData[],
    name: string,
    saveHistory: boolean,
  ) => {
    updateData(nodeUpdater([...nodes.value]), edgeUpdater([...edges.value]), { ...extra.value }, name, saveHistory);
  };

  const updateExtra = (extraData: Record<string, unknown>) => {
    updateData([...nodes.value], [...edges.value], extraData, "extraUpdate", true);
  };
  // edge
  const pushEdge = (edgeData: GUIEdgeData) => {
    updateData([...nodes.value], [...edges.value, edgeData], { ...extra.value }, "addEdge", true);
  };
  const deleteEdge = (edgeIndex: number) => {
    updateData([...nodes.value], [...edges.value.filter((__, idx) => idx !== edgeIndex)], { ...extra.value }, "deleteEdge", true);
  };
  const deleteNode = (nodeIndex: number) => {
    const node = nodes.value[nodeIndex];
    updateData(
      [...nodes.value.filter((__, idx) => idx !== nodeIndex)],
      [
        ...edges.value.filter((edge) => {
          const { source, target } = edge;
          return source.nodeId !== node.nodeId && target.nodeId !== node.nodeId;
        }),
      ],
      { ...extra.value },
      "deleteNode",
      true,
    );
  };

  // history api
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

  return {
    // variables
    histories,
    currentData,

    // methods
    initData,
    initFromGraphData,
    pushNode,
    pushEdge,
    deleteEdge,
    deleteNode,

    updateNodePosition,
    saveNodePositionData,

    loadData,

    // Low-level API for extensions
    updateData,
    updateNodeAt,
    updateNodesAndEdges,
    updateExtra,

    undo,
    redo,

    reset,

    // computed
    nodes,
    edges,
    extra,
    nodeRecords,

    undoable,
    redoable,
  };
});
