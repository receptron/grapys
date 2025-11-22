<template>
  <slot />
</template>

<script setup lang="ts">
import { toRef, provide, computed } from "vue";
import type { GUINodeData, GUINearestData, NodePosition, NewEdgeStartEventData } from "../../utils/gui/type";
import { NodeContextKey } from "../composable/useNodeContext";

const props = defineProps<{
  nodeData: GUINodeData;
  nodeIndex: number;
  nearestData: GUINearestData | undefined;
  isConnectable: boolean;
  updatePosition: (nodeIndex: number, position: NodePosition) => void;
  savePosition: () => void;
  onNewEdgeStart: (event: NewEdgeStartEventData) => void;
  onNewEdge: (event: { x: number; y: number }) => void;
  onNewEdgeEnd: () => void;
  onNodeDragStart: () => void;
  onNodeDragEnd: () => void;
}>();

const nodeDataRef = toRef(props, "nodeData");
const nodeIndexRef = toRef(props, "nodeIndex");

const context = computed(() => ({
  nodeData: nodeDataRef.value,
  nodeIndex: nodeIndexRef.value,
  nearestData: props.nearestData,
  isConnectable: props.isConnectable,
  updatePosition: props.updatePosition,
  savePosition: props.savePosition,
  onNewEdgeStart: props.onNewEdgeStart,
  onNewEdge: props.onNewEdge,
  onNewEdgeEnd: props.onNewEdgeEnd,
  onNodeDragStart: props.onNodeDragStart,
  onNodeDragEnd: props.onNodeDragEnd,
}));

provide(NodeContextKey, context);
</script>
