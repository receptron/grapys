import { create } from "zustand";
import {
  GUINodeData,
  GUIEdgeData,
  GUINodeDataRecord,
  UpdateNodePositionData,
  HistoryData,
  HistoryPayload,
} from "../package/utils";
import {
  NestedGraphList,
} from "../utils/gui/type";
import { store2graphData } from "../utils/gui/graph";

export interface LocalState {
  histories: HistoryData[];
  currentData: HistoryPayload;
  index: number;

  // react
  updateData: (nodeData: GUINodeData[], edgeData: GUIEdgeData[], extraData: Record<string, unknown>, name: string, saveHistory: boolean) => void;

  // methods
  initData: (nodeData: GUINodeData[], edgeData: GUIEdgeData[], extraData: Record<string, unknown>) => void;
  pushNode: (nodeData: GUINodeData) => void;
  pushEdge: (edgeData: GUIEdgeData) => void;
  deleteEdge: (edgeIndex: number) => void;
  deleteNode: (nodeIndex: number) => void;

  updateNodePosition: (positionIndex: number, pos: UpdateNodePositionData) => void;
  pushDataToHistory: (name: string, data: HistoryPayload) => void;
  saveNodePositionData: () => void;

  loadData: (data: HistoryPayload) => void;

  // Low-level API for extensions
  updateNodeAt: (nodeIndex: number, updater: (node: GUINodeData) => GUINodeData, name: string, saveHistory: boolean) => void;
  updateNodesAndEdges: (
    nodeUpdater: (nodes: GUINodeData[]) => GUINodeData[],
    edgeUpdater: (edges: GUIEdgeData[]) => GUIEdgeData[],
    name: string,
    saveHistory: boolean,
  ) => void;
  updateExtra: (extraData: Record<string, unknown>) => void;

  undo: () => void;
  redo: () => void;

  reset: (defaultExtra?: Record<string, unknown>) => void;

  // computed
  nodes: () => GUINodeData[];
  edges: () => GUIEdgeData[];
  extra: () => Record<string, unknown>;
  // nodeRecords,
  streamNodes: () => string[];
  resultNodes: () => string[];

  undoable: () => boolean;
  redoable: () => boolean;
}

export const useLocalStore = create<LocalState>((set, get) => ({
  histories: [],
  currentData: {
    nodes: [],
    edges: [],
    extra: {},
  },
  index: 0,

  nodes: () => {
    return get().currentData.nodes;
  },

  edges: () => {
    return get().currentData.edges;
  },

  extra: () => {
    return get().currentData.extra ?? {};
  },

  streamNodes: () => {
    const nodes = get().currentData.nodes;
    return nodes
      .filter((node) => {
        return node.data?.params?.stream ?? false;
      })
      .map((node) => node.nodeId);
  },

  resultNodes: () => {
    const nodes = get().currentData.nodes;
    return nodes
      .filter((node) => {
        return node.data?.params?.isResult ?? false;
      })
      .map((node) => node.nodeId);
  },

  reset: (defaultExtra: Record<string, unknown> = {}) => {
    const { updateData } = get();
    updateData([], [], defaultExtra, "reset", true);
  },

  loadData: (data: HistoryPayload) => {
    // BACKWARD COMPATIBILITY: Migrate old format (root.loop) to new format (extra.loop)
    const migratedData = data.loop && !data.extra?.loop
      ? {
          nodes: data.nodes,
          edges: data.edges,
          extra: {
            loop: data.loop,
          },
        }
      : data;

    set((state) => {
      state.pushDataToHistory("load", migratedData);
      return { currentData: migratedData };
    });
  },

  initData: (nodeData: GUINodeData[], edgeData: GUIEdgeData[], extraData: Record<string, unknown>) =>
    set(() => ({
      currentData: { nodes: nodeData, edges: edgeData, extra: extraData },
    })),

  pushNode: (nodeData: GUINodeData) => {
    const { updateData, currentData } = get();
    updateData([...currentData.nodes, nodeData], [...currentData.edges], { ...currentData.extra }, "addNode", true);
  },

  updateNodePosition: (positionIndex: number, pos: UpdateNodePositionData) => {
    set((state) => {
      const newNodes = [...state.currentData.nodes];

      newNodes[positionIndex] = {
        ...newNodes[positionIndex],
        position: { ...newNodes[positionIndex].position, ...pos },
      };

      return { currentData: { ...state.currentData, nodes: newNodes } };
    });
  },

  // Low-level API: Generic node updater
  updateNodeAt: (nodeIndex: number, updater: (node: GUINodeData) => GUINodeData, name: string, saveHistory: boolean) => {
    const { updateData, currentData } = get();
    const newNodes = [...currentData.nodes];
    newNodes[nodeIndex] = updater({ ...currentData.nodes[nodeIndex] });
    updateData(newNodes, [...currentData.edges], { ...currentData.extra }, name, saveHistory);
  },

  // Low-level API: Generic nodes and edges updater
  updateNodesAndEdges: (
    nodeUpdater: (nodes: GUINodeData[]) => GUINodeData[],
    edgeUpdater: (edges: GUIEdgeData[]) => GUIEdgeData[],
    name: string,
    saveHistory: boolean,
  ) => {
    const { updateData, currentData } = get();
    updateData(nodeUpdater([...currentData.nodes]), edgeUpdater([...currentData.edges]), { ...currentData.extra }, name, saveHistory);
  },

  updateData: (nodeData: GUINodeData[], edgeData: GUIEdgeData[], extraData: Record<string, unknown>, name: string, saveHistory: boolean) =>
    set((state) => {
      const newData = {
        nodes: nodeData,
        edges: edgeData,
        extra: extraData,
      };

      if (saveHistory) {
        state.pushDataToHistory(name, newData);
      }

      return { currentData: newData };
    }),

  pushDataToHistory: (name: string, data: HistoryPayload) =>
    set((state) => {
      const newHistories = [...state.histories.slice(0, state.index), { data, name }];
      return {
        histories: newHistories,
        index: state.index + 1,
      };
    }),

  saveNodePositionData: () =>
    set((state) => {
      state.pushDataToHistory("position", state.currentData);
      return {};
    }),

  updateExtra: (extraData: Record<string, unknown>) => {
    const { currentData, updateData } = get();
    updateData([...currentData.nodes], [...currentData.edges], extraData, "extraUpdate", true);
  },

  pushEdge: (edgeData: GUIEdgeData) => {
    const { currentData, updateData } = get();
    updateData([...currentData.nodes], [...currentData.edges, edgeData], { ...currentData.extra }, "addEdge", true);
  },
  deleteEdge: (edgeIndex: number) => {
    const { currentData, updateData } = get();
    updateData([...currentData.nodes], [...currentData.edges.filter((__, idx) => idx !== edgeIndex)], { ...currentData.extra }, "deleteEdge", true);
  },
  deleteNode: (nodeIndex: number) => {
    const { currentData, updateData } = get();
    const node = currentData.nodes[nodeIndex];
    updateData(
      [...currentData.nodes.filter((__, idx) => idx !== nodeIndex)],
      [
        ...currentData.edges.filter((edge) => {
          const { source, target } = edge;
          return source.nodeId !== node.nodeId && target.nodeId !== node.nodeId;
        }),
      ],
      { ...currentData.extra },
      "deleteNode",
      true,
    );
  },

  // history api
  undoable: () => {
    return get().index > 1;
  },

  undo: () => {
    const { index, histories } = get();
    if (get().index > 1) {
      set(() => ({
        currentData: histories[index - 2].data,
        index: index - 1,
      }));
    }
  },
  redoable: () => {
    const { index, histories } = get();
    return index < histories.length;
  },

  redo: () => {
    const { index, histories } = get();
    if (index < histories.length) {
      set(() => ({
        currentData: histories[index].data,
        index: index + 1,
      }));
    }
  },
}));

export const node2Record = (nodes: GUINodeData[]): GUINodeDataRecord => {
  return nodes.reduce((tmp: GUINodeDataRecord, current) => {
    tmp[current.nodeId] = current;
    return tmp;
  }, {});
};

export const toGraph = (currentData: HistoryPayload) => {
  // BACKWARD COMPATIBILITY: Support both old (root.loop) and new (extra.loop) format
  const extra = currentData.extra as { loop?: any } | undefined;
  const loop = extra?.loop ?? currentData.loop ?? { loopType: "none" as const };

  const dataWithLoop = {
    nodes: currentData.nodes,
    edges: currentData.edges,
    loop: loop,
  };

  const nestedGraphs: NestedGraphList = []; // TODO: for nested graph
  return store2graphData(dataWithLoop, nestedGraphs);
};
