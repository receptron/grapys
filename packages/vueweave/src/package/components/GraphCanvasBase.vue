<template>
  <div ref="mainContainer" class="relative box-border h-full overflow-auto rounded-md border-4 border-gray-200" @click="closeMenu">
    <div class="relative h-full w-full">
      <!-- head slot for custom header content like Loop -->
      <slot name="head"></slot>

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

      <!-- Nodes with context provider -->
      <NodeContextProvider
        v-for="(nodeData, index) in nodes"
        :key="getNodeKey(nodeData, index)"
        :node-data="nodeData"
        :node-index="index"
        :nearest-data="nearestData"
        :is-connectable="edgeConnectable"
        :update-position="updatePosition"
        :save-position="savePosition"
        :on-new-edge-start="onNewEdgeStart"
        :on-new-edge="onNewEdge"
        :on-new-edge-end="onNewEdgeEnd"
        :on-node-drag-start="handleNodeDragStart"
        :on-node-drag-end="handleNodeDragEnd"
        :open-node-menu="openNodeMenu"
      >
        <!-- node slot - user provides their custom node component -->
        <slot name="node" :node-data="nodeData" :node-index="index">
          <!-- Default fallback if no slot provided -->
          <div>No node component provided</div>
        </slot>
      </NodeContextProvider>

      <!-- Context menus -->
      <ContextEdgeMenu ref="contextEdgeMenu" />
      <ContextNodeMenu ref="contextNodeMenu" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, type PropType } from "vue";
import NodeContextProvider from "./NodeContextProvider.vue";
import Edge from "./Edge.vue";
import ContextEdgeMenu from "./ContextEdgeMenu.vue";
import ContextNodeMenu from "./ContextNodeMenu.vue";
import { useNewEdge } from "../composable/gui";
import { usePanAndScroll } from "../composable/usePanAndScroll";
import { guiEdgeData2edgeData } from "../utils/gui";
import type { GUINodeData, NodePosition, GUIEdgeData, GUINodeDataRecord, ValidateConnectionFn } from "../utils/type";

const props = defineProps({
  nodes: {
    type: Array as PropType<GUINodeData[]>,
    required: true,
  },
  edges: {
    type: Array as PropType<GUIEdgeData[]>,
    required: true,
  },
  nodeRecords: {
    type: Object as PropType<GUINodeDataRecord>,
    required: true,
  },
  updatePosition: {
    type: Function as PropType<(nodeIndex: number, position: NodePosition) => void>,
    required: true,
  },
  savePosition: {
    type: Function as PropType<() => void>,
    required: true,
  },
  validateConnection: {
    type: Function as PropType<ValidateConnectionFn>,
    required: false,
    default: undefined,
  },
  getNodeKey: {
    type: Function as PropType<(nodeData: GUINodeData, index: number) => string>,
    default: (nodeData: GUINodeData, index: number) => `${nodeData.nodeId}-${index}`,
  },
});

const mainContainer = ref<HTMLElement | undefined>(undefined);
const contextEdgeMenu = ref();
const contextNodeMenu = ref();

// Edge management
 
const edgeDataList = computed(() => {
  return guiEdgeData2edgeData(props.edges, props.nodeRecords);
});

 
const { svgRef, newEdgeData, onNewEdgeStart, onNewEdge, onNewEdgeEnd, nearestData, edgeConnectable } = useNewEdge(props.validateConnection);

// Node drag state management
const isNodeDragging = ref(false);

 
const handleNodeDragStart = () => {
  isNodeDragging.value = true;
};

 
const handleNodeDragEnd = () => {
  isNodeDragging.value = false;
};

// Pan and scroll setup
const { setupPanAndScroll } = usePanAndScroll(mainContainer, isNodeDragging, newEdgeData);

onMounted(() => {
  setupPanAndScroll();
});

// Context menu handlers
 
const openEdgeMenu = (event: MouseEvent, edgeIndex: number) => {
  if (!svgRef.value) return;
  const rect = svgRef.value.getBoundingClientRect();
  contextEdgeMenu.value.openMenu(event, rect, edgeIndex);
};

const openNodeMenu = (event: MouseEvent, nodeIndex: number) => {
  if (!svgRef.value) return;
  const rect = svgRef.value.getBoundingClientRect();
  contextNodeMenu.value.openMenu(event, rect, nodeIndex);
};

 
const closeMenu = () => {
  contextEdgeMenu.value?.closeMenu();
  contextNodeMenu.value?.closeMenu();
};

defineExpose({
  mainContainer,
  svgRef,
  openNodeMenu,
});
</script>
