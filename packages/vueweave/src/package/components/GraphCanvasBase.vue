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
          <!-- Default fallback: Simple NodeBase with single input/output -->
          <NodeBase :inputs="getDefaultInputs()" :outputs="getDefaultOutputs()">
            <template #header>
              <div class="w-full rounded-t-md bg-gray-500 py-2 text-center text-white">
                {{ nodeData.nodeId }}
              </div>
            </template>
            <template #body-main>
              <div class="p-2 text-center text-sm">
                {{ getDefaultLabel(nodeData) }}
              </div>
            </template>
          </NodeBase>
        </slot>
      </NodeContextProvider>

      <!-- Context menus -->
      <ContextEdgeMenu ref="contextEdgeMenu" />
      <ContextNodeMenu ref="contextNodeMenu" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, provide } from "vue";
import NodeContextProvider from "./NodeContextProvider.vue";
import NodeBase from "./NodeBase.vue";
import Edge from "./Edge.vue";
import ContextEdgeMenu from "./ContextEdgeMenu.vue";
import ContextNodeMenu from "./ContextNodeMenu.vue";
import { useNewEdge } from "../composable/gui";
import { usePanAndScroll } from "../composable/usePanAndScroll";
import { useGraphCanvas } from "../composable/useGraphCanvas";
import { guiEdgeData2edgeData } from "../utils/gui";
import { NODE_STYLE_KEY, EDGE_COLOR_KEY, resolveStyleConfig, resolveEdgeColors, type NodeStyleOptions } from "../utils/nodeStyles";
import type { GUINodeData, NodePosition, GUIEdgeData, GUINodeDataRecord, ValidateConnectionFn } from "../utils/type";

const props = defineProps<{
  nodes?: GUINodeData[];
  edges?: GUIEdgeData[];
  nodeRecords?: GUINodeDataRecord;
  updatePosition?: (nodeIndex: number, position: NodePosition) => void;
  savePosition?: () => void;
  validateConnection?: ValidateConnectionFn;
  getNodeKey?: (nodeData: GUINodeData, index: number) => string;
  nodeStyles?: NodeStyleOptions;
}>();

// Resolve and provide style configuration
const resolvedStyles = resolveStyleConfig(props.nodeStyles);
provide(NODE_STYLE_KEY, resolvedStyles);

// Resolve and provide edge colors
const resolvedEdgeColors = resolveEdgeColors(props.nodeStyles);
provide(EDGE_COLOR_KEY, resolvedEdgeColors);

const getNodeKey = props.getNodeKey ?? ((nodeData: GUINodeData, index: number) => `${nodeData.nodeId}-${index}`);

// Use default implementation from useGraphCanvas if props not provided
const defaultGraph = useGraphCanvas({ validateConnection: props.validateConnection });

const nodes = computed(() => props.nodes ?? defaultGraph.nodes.value);
const edges = computed(() => props.edges ?? defaultGraph.edges.value);
const nodeRecords = computed(() => props.nodeRecords ?? defaultGraph.nodeRecords.value);
const updatePosition = props.updatePosition ?? defaultGraph.updateNodePosition;
const savePosition = props.savePosition ?? defaultGraph.saveNodePosition;
const validateConnection = props.validateConnection ?? defaultGraph.validateConnection;

const mainContainer = ref<HTMLElement | undefined>(undefined);
const contextEdgeMenu = ref();
const contextNodeMenu = ref();

// Edge management

const edgeDataList = computed(() => {
  return guiEdgeData2edgeData(edges.value, nodeRecords.value);
});

const { svgRef, newEdgeData, onNewEdgeStart, onNewEdge, onNewEdgeEnd, nearestData, edgeConnectable } = useNewEdge(validateConnection);

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

// Default node rendering helpers
const getDefaultInputs = () => {
  return [{ name: "in" }];
};

const getDefaultOutputs = () => {
  return [{ name: "out" }];
};

const getDefaultLabel = (nodeData: GUINodeData) => {
  return nodeData.data?.label ?? nodeData.type ?? "Node";
};
</script>
