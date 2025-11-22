<script lang="ts">
import { defineComponent, onMounted, ref, computed } from "vue";
import BaseNode from "./BaseNode.vue";
import Edge from "./Edge.vue";
import { useNewEdge } from "../composables/useNewEdge";
import { usePanAndScroll } from "../composables/usePanAndScroll";
import { guiEdgeData2edgeData } from "../utils";
import { useGraphStore } from "../store";
import type { EdgeData, NodePosition } from "../types";

export default defineComponent({
  name: "GraphCanvas",
  components: {
    BaseNode,
    Edge,
  },
  props: {
    // Allow custom node component
    nodeComponent: {
      type: Object,
      default: () => BaseNode,
    },
  },
  emits: ["open-node-editor", "node-click", "edge-click", "canvas-click"],
  setup(_props, { emit }) {
    const store = useGraphStore();
    const mainContainer = ref();
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

    const edgeDataList = computed<EdgeData[]>(() => {
      return guiEdgeData2edgeData(store.edges, store.nodeRecords);
    });

    const { svgRef, newEdgeData, onNewEdgeStart, onNewEdge, onNewEdgeEnd, nearestData, edgeConnectable } = useNewEdge({
      nodes: store.nodeRecords,
      edges: store.edges,
      onEdgeCreate: (edge) => store.pushEdge(edge),
    });

    const { setupPanAndScroll } = usePanAndScroll(mainContainer, isNodeDragging, newEdgeData);

    const openNodeMenu = (event: MouseEvent, nodeIndex: number) => {
      emit("node-click", { event, nodeIndex });
    };

    const openNodeEditor = (nodeIndex: number) => {
      emit("open-node-editor", nodeIndex);
    };

    const openEdgeMenu = (event: MouseEvent, edgeIndex: number) => {
      emit("edge-click", { event, edgeIndex });
    };

    const handleCanvasClick = () => {
      emit("canvas-click");
    };

    // Get inputs/outputs from node profile or data
    const getNodeInputs = (node: any) => {
      return node.profile?.inputs || node.data?.inputs || [];
    };

    const getNodeOutputs = (node: any) => {
      return node.profile?.outputs || node.data?.outputs || [];
    };

    return {
      updateNodePosition,
      saveNodePosition,

      store,

      edgeDataList,
      onNewEdgeStart,
      onNewEdge,
      onNewEdgeEnd,
      newEdgeData,
      svgRef,
      nearestData,

      openEdgeMenu,
      openNodeMenu,
      openNodeEditor,
      handleCanvasClick,

      edgeConnectable,

      mainContainer,
      handleNodeDragStart,
      handleNodeDragEnd,

      getNodeInputs,
      getNodeOutputs,
    };
  },
});
</script>

<template>
  <div ref="mainContainer" class="relative box-border h-full overflow-auto rounded-md border-4 border-gray-200" @click="handleCanvasClick">
    <div class="relative h-full w-full">
      <!-- Custom content slot (for Loop, etc.) -->
      <slot name="content"></slot>

      <!-- SVG for edges -->
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

      <!-- Nodes -->
      <component
        :is="nodeComponent"
        v-for="(node, index) in store.nodes"
        :key="[node.nodeId, index].join('-')"
        :node-index="index"
        :node-data="node"
        :nearest-data="nearestData"
        :is-connectable="edgeConnectable"
        :inputs="getNodeInputs(node)"
        :outputs="getNodeOutputs(node)"
        @update-position="(pos: NodePosition) => updateNodePosition(index, pos)"
        @save-position="saveNodePosition"
        @new-edge-start="onNewEdgeStart"
        @new-edge="onNewEdge"
        @new-edge-end="onNewEdgeEnd"
        @open-node-menu="(e: MouseEvent) => openNodeMenu(e, index)"
        @open-node-edit-menu="openNodeEditor(index)"
        @node-drag-start="handleNodeDragStart"
        @node-drag-end="handleNodeDragEnd"
      >
        <!-- Pass through slots to node component -->
        <template #header v-if="$slots['node-header']">
          <slot name="node-header" :node="node" :index="index"></slot>
        </template>
        <template #body v-if="$slots['node-body']">
          <slot name="node-body" :node="node" :index="index"></slot>
        </template>
        <template #footer v-if="$slots['node-footer']">
          <slot name="node-footer" :node="node" :index="index"></slot>
        </template>
      </component>

      <!-- Context menus slot -->
      <slot name="context-menus"></slot>
    </div>
  </div>
</template>
