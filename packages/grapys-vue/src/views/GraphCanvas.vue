<script lang="ts">
import { defineComponent, onMounted, ref, computed } from "vue";
import { useStore } from "../store";
import Loop from "./Loop.vue";
import Edge from "./Edge.vue";
import Node from "./Node.vue";
import ContextEdgeMenu from "./ContextEdgeMenu.vue";
import ContextNodeMenu from "./ContextNodeMenu.vue";
import { useNewEdge } from "../composable/gui";
import { usePanAndScroll } from "../composable/usePanAndScroll";
import { guiEdgeData2edgeData } from "../utils/gui/utils";
import type { EdgeData, NodePosition, UpdateStaticValue } from "../utils/gui/type";

export default defineComponent({
  name: "GraphCanvas",
  components: { Loop, Edge, Node, ContextEdgeMenu, ContextNodeMenu },
  setup() {
    const store = useStore();

    const contextEdgeMenu = ref();
    const contextNodeMenu = ref();
    const mainContainer = ref<HTMLElement | undefined>(undefined);

    // Node drag state
    const isNodeDragging = ref(false);
    const handleNodeDragStart = () => (isNodeDragging.value = true);
    const handleNodeDragEnd = () => (isNodeDragging.value = false);

    const { svgRef, newEdgeData, onNewEdgeStart, onNewEdge, onNewEdgeEnd, nearestData, edgeConnectable } = useNewEdge();

    // Pan & scroll
    const { setupPanAndScroll } = usePanAndScroll(mainContainer, isNodeDragging, newEdgeData);

    onMounted(() => {
      setupPanAndScroll();
    });

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
    const edgeDataList = computed<EdgeData[]>(() => guiEdgeData2edgeData(store.edges, store.nodeRecords));

    return {
      store,
      contextEdgeMenu,
      contextNodeMenu,
      mainContainer,
      svgRef,
      newEdgeData,
      nearestData,
      edgeConnectable,

      onNewEdgeStart,
      onNewEdge,
      onNewEdgeEnd,

      updateNodePosition,
      saveNodePosition,
      updateStaticNodeValue,
      updateNestedGraph,

      openEdgeMenu,
      openNodeMenu,
      closeMenu,

      handleNodeDragStart,
      handleNodeDragEnd,

      edgeDataList,
    };
  },
});
</script>

<template>
  <div
    ref="mainContainer"
    class="relative h-full w-full overflow-auto rounded-md border-4 border-gray-200 box-border"
    @click="closeMenu"
  >
    <div class="relative" style="width: 2000px; height: 1500px">
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
      <Node
        v-for="(node, index) in store.nodes"
        :key="[node.nodeId, index].join('-')"
        :node-index="index"
        :node-data="node"
        :nearest-data="nearestData"
        :is-connectable="edgeConnectable"
        @update-position="(pos) => updateNodePosition(index, pos)"
        @update-static-node-value="(value) => updateStaticNodeValue(index, value, true)"
        @update-nested-graph="(value) => updateNestedGraph(index, value)"
        @save-position="saveNodePosition"
        @new-edge-start="onNewEdgeStart"
        @new-edge="onNewEdge"
        @new-edge-end="onNewEdgeEnd"
        @open-node-menu="(event) => openNodeMenu(event, index)"
        @node-drag-start="handleNodeDragStart"
        @node-drag-end="handleNodeDragEnd"
      />
      <ContextEdgeMenu ref="contextEdgeMenu" />
      <ContextNodeMenu ref="contextNodeMenu" />
    </div>
  </div>
</template>
