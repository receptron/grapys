import { ref, computed } from "vue";
import {
  GUINodeData,
  GUIEdgeData,
  GUINodeDataRecord,
  UpdateStaticValue,
  UpdateNodePositionData,
  HistoryData,
  HistoryPayload,
  GUILoopData,
} from "../utils/gui/type";
import { defineStore } from "pinia";

import { graphToGUIData } from "../utils/gui/utils";
import type { GraphData } from "graphai";

export const useStore = defineStore("store", () => {

  const histories = ref<HistoryData[]>([]);
  const currentData = ref<HistoryPayload>({
    nodes: [],
    edges: [],
    loop: { loopType: "none" },
  });
  const index = ref(0);

  const reset = () => {
    updateData([], [], { loopType: "none" }, "reset", true);
  };

  const nodes = computed(() => {
    return currentData.value.nodes;
  });

  const edges = computed(() => {
    return currentData.value.edges;
  });

  const loop = computed(() => {
    return currentData.value.loop;
  });

  const nodeRecords = computed<GUINodeDataRecord>(() => {
    return nodes.value.reduce((tmp: GUINodeDataRecord, current) => {
      tmp[current.nodeId] = current;
      return tmp;
    }, {});
  });
  // end of computed

  const loadData = (data: HistoryPayload) => {
    currentData.value = data;
    pushDataToHistory("load", data);
  };
  const updateData = (nodeData: GUINodeData[], edgeData: GUIEdgeData[], loopData: GUILoopData, name: string, saveHistory: boolean) => {
    const data = { nodes: nodeData, edges: edgeData, loop: loopData };
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

  const initData = (nodeData: GUINodeData[], edgeData: GUIEdgeData[], loopData: GUILoopData) => {
    const data = { nodes: nodeData, edges: edgeData, loop: loopData };
    currentData.value = data;
    // this time, node position is not set. save after mounted.
  };

  const initFromGraphData = (graph: GraphData) => {
    const { rawEdge, rawNode, loop: loopData } = graphToGUIData(graph);
    initData(rawNode, rawEdge, loopData);
  };

  // node
  const pushNode = (nodeData: GUINodeData) => {
    updateData([...nodes.value, nodeData], [...edges.value], { ...loop.value }, "addNode", true);
  };

  const updateNodePosition = (positionIndex: number, pos: UpdateNodePositionData) => {
    const newNode = { ...nodes.value[positionIndex] };
    newNode.position = { ...newNode.position, ...pos };
    const newNodes = [...nodes.value];
    newNodes[positionIndex] = newNode;
    updateData(newNodes, [...edges.value], { ...loop.value }, "updatePosition", false);
  };
  const updateNodeParam = (positionIndex: number, key: string, value: unknown) => {
    const oldNode = nodes.value[positionIndex];
    const newNode = {
      ...oldNode,
      data: {
        ...oldNode.data,
        params: oldNode.data.params ? { ...oldNode.data.params } : {},
      },
    };

    if (value === "" || value === undefined || (value === null && newNode.data.params && newNode.data.params[key] !== undefined)) {
      // delete operation
      const { [key]: __, ...updatedParams } = newNode.data.params || {};
      newNode.data.params = updatedParams;
    } else {
      // upsert
      newNode.data.params = { ...(newNode.data.params || {}), [key]: value };
    }
    const newNodes = [...nodes.value];
    newNodes[positionIndex] = newNode;
    updateData(newNodes, [...edges.value], { ...loop.value }, "updateParams", true);
  };
  const updateStaticNodeValue = (positionIndex: number, value: UpdateStaticValue, saveHistory: boolean) => {
    const newNode = { ...nodes.value[positionIndex] };
    newNode.data = { ...newNode.data, ...value };
    const newNodes = [...nodes.value];
    newNodes[positionIndex] = newNode;
    updateData(newNodes, [...edges.value], { ...loop.value }, "updateStaticValue", saveHistory);
  };

  const updateNestedGraph = (positionIndex: number, value: UpdateStaticValue) => {
    const newNode = { ...nodes.value[positionIndex] };
    newNode.data = { ...newNode.data, ...value };
    const newNodes = [...nodes.value];
    newNodes[positionIndex] = newNode;
    updateData(
      newNodes,
      [
        ...edges.value.filter((edge) => {
          const { source, target } = edge;
          return source.nodeId !== newNode.nodeId && target.nodeId !== newNode.nodeId;
        }),
      ],
      { ...loop.value },
      "NestedGraph",
      true,
    );
  };

  const updateLoop = (loopData: GUILoopData) => {
    updateData([...nodes.value], [...edges.value], loopData, "loopUpdate", true);
  };
  // edge
  const pushEdge = (edgeData: GUIEdgeData) => {
    updateData([...nodes.value], [...edges.value, edgeData], { ...loop.value }, "addEdge", true);
  };
  const deleteEdge = (edgeIndex: number) => {
    updateData([...nodes.value], [...edges.value.filter((__, idx) => idx !== edgeIndex)], { ...loop.value }, "deleteEdge", true);
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
      { ...loop.value },
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
    updateNodeParam,
    // pushDataToHistory,
    saveNodePositionData,

    loadData,

    updateStaticNodeValue,
    updateNestedGraph,
    updateLoop,

    undo,
    redo,

    reset,

    // computed
    nodes,
    edges,
    loop,
    nodeRecords,

    undoable,
    redoable,
  };
});
