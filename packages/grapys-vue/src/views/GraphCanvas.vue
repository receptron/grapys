<script lang="ts">
import { defineComponent, onMounted, ref, computed } from "vue";
import Node2 from "./Node2.vue";
import Edge from "./Edge.vue";
import Loop from "./Loop.vue";

import ContextEdgeMenu from "./ContextEdgeMenu.vue";
import ContextNodeMenu from "./ContextNodeMenu.vue";
import { useNewEdge } from "../composable/gui";
import { usePanAndScroll } from "../composable/usePanAndScroll";
import { guiEdgeData2edgeData } from "../utils/gui/utils";
import { useStore } from "../store";
import type { EdgeData, NodePosition, UpdateStaticValue } from "../utils/gui/type";

export default defineComponent({
  name: "GraphCanvas",
  components: {
    Node2,
    Edge,
    Loop,
    ContextEdgeMenu,
    ContextNodeMenu,
  },
  emits: ["open-node-editor"],
  setup(props, { emit }) {
    const store = useStore();
    const contextEdgeMenu = ref();
    const contextNodeMenu = ref();
    const mainContainer = ref();

    // ノードドラッグ状態の管理
    const isNodeDragging = ref(false);

    const handleNodeDragStart = () => {
      isNodeDragging.value = true;
    };

    const handleNodeDragEnd = () => {
      isNodeDragging.value = false;
    };

    onMounted(() => {
      setupPanAndScroll();
    });

    const updateNodePosition = (index: number, pos: NodePosition) => {
      store.updateNodePosition(index, pos);
    };
    const saveNodePosition = () => {
      store.saveNodePositionData();
    };
    const updateStaticNodeValue = (index: number, value: UpdateStaticValue, saveHistory: boolean) => {
      store.updateStaticNodeValue(index, value, saveHistory);
    };
    const updateNestedGraph = (index: number, value: UpdateStaticValue) => {
      store.updateNestedGraph(index, value);
    };

    const edgeDataList = computed<EdgeData[]>(() => {
      return guiEdgeData2edgeData(store.edges, store.nodeRecords);
    });

    const { svgRef, newEdgeData, onNewEdgeStart, onNewEdge, onNewEdgeEnd, nearestData, edgeConnectable } = useNewEdge();

    // パン（掴んで動かす）とスクロール機能のセットアップ
    const { setupPanAndScroll } = usePanAndScroll(mainContainer, isNodeDragging, newEdgeData);

    const openEdgeMenu = (event: MouseEvent, edgeIndex: number) => {
      const rect = svgRef.value.getBoundingClientRect();
      contextEdgeMenu.value.openMenu(event, rect, edgeIndex);
    };
    const closeMenu = () => {
      contextEdgeMenu.value.closeMenu();
      contextNodeMenu.value.closeMenu();
    };
    const openNodeMenu = (event: MouseEvent, nodeIndex: number) => {
      const rect = svgRef.value.getBoundingClientRect();
      contextNodeMenu.value.openMenu(event, rect, nodeIndex);
    };
    const openNodeEditor = (event: MouseEvent, nodeIndex: number) => {
      emit("open-node-editor", event, nodeIndex);
    };

    return {
      updateNodePosition,
      saveNodePosition,
      updateStaticNodeValue,
      updateNestedGraph,

      store,

      edgeDataList,
      onNewEdgeStart,
      onNewEdge,
      onNewEdgeEnd,
      newEdgeData,
      svgRef,
      nearestData,

      contextEdgeMenu,
      contextNodeMenu,
      openEdgeMenu,
      openNodeMenu,
      openNodeEditor,
      closeMenu,

      edgeConnectable,

      mainContainer,
      handleNodeDragStart,
      handleNodeDragEnd,
    };
  },
});
</script>

<template>
  <div ref="mainContainer" class="relative box-border h-full overflow-auto rounded-md border-4 border-gray-200" @click="closeMenu">
    <div class="relative h-full w-full">
      <Loop />
      <svg x="0" y="0" class="pointer-events-none absolute h-full w-full" ref="svgRef">
        <Edge
          v-for="(edge, index) in edgeDataList"
          :key="['edge', edge.source, edge.target, index].join('-')"
          :source-data="edge.source"
          :target-data="edge.target"
          class="pointer-events-auto"
          @dblclick="(e: MouseEvent) => openEdgeMenu(e, index)"
        />
        <Edge
          v-if="newEdgeData"
          :source-data="newEdgeData.source"
          :target-data="newEdgeData.target"
          class="pointer-events-auto"
          :is-connectable="edgeConnectable"
        />
      </svg>
      <Node2
        v-for="(node, index) in store.nodes"
        :key="[node.nodeId, index].join('-')"
        :node-index="index"
        :node-data="node"
        :nearest-data="nearestData"
        :is-connectable="edgeConnectable"
        @update-position="(pos: NodePosition) => updateNodePosition(index, pos)"
        @update-static-node-value="updateStaticNodeValue(index, $event, true)"
        @update-nested-graph="updateNestedGraph(index, $event)"
        @save-position="saveNodePosition"
        @new-edge-start="onNewEdgeStart"
        @new-edge="onNewEdge"
        @new-edge-end="onNewEdgeEnd"
        @open-node-menu="(e: MouseEvent) => openNodeMenu(e, index)"
        @open-node-edit-menu="(e: MouseEvent) => openNodeEditor(e, index)"
        @node-drag-start="handleNodeDragStart"
        @node-drag-end="handleNodeDragEnd"
      />
      <ContextEdgeMenu ref="contextEdgeMenu" />
      <ContextNodeMenu ref="contextNodeMenu" />
    </div>
  </div>
</template>
