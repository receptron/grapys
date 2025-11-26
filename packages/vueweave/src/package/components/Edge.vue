<template>
  <path
    :d="edgePath"
    :stroke="isHover ? edgeColors.hover : edgeColors.edge"
    fill="none"
    :stroke-width="isHover ? 4 : 2"
    @mouseover="isHover = true"
    @mouseleave="isHover = false"
  />
</template>

<script lang="ts">
import { defineComponent, ref, computed, inject, PropType, watch } from "vue";
import { EdgeData2, GUINearestData } from "../utils/type";
import { convEdgePath } from "../utils/gui";
import { EDGE_COLOR_KEY, type EdgeColorConfig } from "../utils/nodeStyles";

const defaultEdgeColors: EdgeColorConfig = {
  edge: "red",
  hover: "blue",
  notConnectable: "pink",
};

export default defineComponent({
  components: {},
  props: {
    sourceData: {
      type: Object as PropType<EdgeData2>,
      required: true,
    },
    targetData: {
      type: Object as PropType<EdgeData2>,
      required: true,
    },
    nearestData: {
      type: Object as PropType<GUINearestData>,
      required: false,
      default: undefined,
    },
    isNewEdge: {
      type: Boolean,
      required: false,
      default: false,
    },
    edgeDirection: {
      type: String as PropType<"outbound" | "inbound">,
      required: false,
      default: undefined,
    },
    isConnectable: {
      type: Boolean,
      required: false,
      default: true,
    },
  },
  setup(props) {
    const isHover = ref(false);
    const edgePath = computed(() => {
      const sourceIndex = props.sourceData.kind === "node" ? props.sourceData.index : undefined;
      const targetIndex = props.targetData.kind === "node" ? props.targetData.index : undefined;
      return convEdgePath(sourceIndex, props.sourceData.data.position, targetIndex, props.targetData.data.position);
    });

    // Inject edge colors with defaults
    const injectedEdgeColors = inject<EdgeColorConfig>(EDGE_COLOR_KEY, defaultEdgeColors);

    // Compute actual edge colors based on source/target nodes
    const edgeColors = computed(() => {
      // Use the explicit isNewEdge prop
      const isNewEdge = props.isNewEdge;

      // Get source node ID and index
      // For new edges, we need to consider the direction:
      // - outbound: source is the node, target is mouse
      // - inbound: target is the node, source is mouse
      let sourceNodeId = "";
      let sourceIndex: number | undefined;

      if (props.isNewEdge && props.edgeDirection === "inbound") {
        // For inbound, the actual starting node is in targetData
        sourceNodeId = props.targetData.kind === "node" ? props.targetData.nodeId : "";
        sourceIndex = props.targetData.kind === "node" ? props.targetData.index : undefined;
      } else {
        // For outbound or existing edges, use sourceData
        sourceNodeId = props.sourceData.kind === "node" ? props.sourceData.nodeId : "";
        sourceIndex = props.sourceData.kind === "node" ? props.sourceData.index : undefined;
      }

      // For new edge (when nearestData is provided), use nearestData for stable color
      // Otherwise use targetData
      const hasTarget = Boolean(props.nearestData);

      // For new edges, nearestData contains the hover target (if any)
      // For existing edges, use targetData or sourceData based on direction
      let targetNodeId = "";
      let targetIndex: number | undefined;

      if (props.nearestData) {
        // New edge hovering over a port
        targetNodeId = props.nearestData.nodeId;
        targetIndex = props.nearestData.index;
      } else if (props.isNewEdge && props.edgeDirection === "inbound") {
        // Inbound new edge without hover target - sourceData is mouse, no real target yet
        targetNodeId = "";
        targetIndex = undefined;
      } else if (props.isNewEdge && props.edgeDirection === "outbound") {
        // Outbound new edge without hover target - targetData is mouse, no real target yet
        targetNodeId = "";
        targetIndex = undefined;
      } else {
        // Existing edge
        targetNodeId = props.targetData.kind === "node" ? props.targetData.nodeId : "";
        targetIndex = props.targetData.kind === "node" ? props.targetData.index : undefined;
      }

      // Try custom color function first with full context
      const customColors = injectedEdgeColors.customColor?.({
        sourceNodeId,
        sourceIndex,
        targetNodeId,
        targetIndex,
        isConnectable: props.isConnectable,
        isNewEdge,
        hasTarget,
      });

      // Return merged colors: custom > default > fallback
      const finalColors = {
        edge: customColors?.edge || injectedEdgeColors.edge || "red",
        hover: customColors?.hover || injectedEdgeColors.hover || "blue",
        notConnectable: injectedEdgeColors.notConnectable || "pink",
      };

      return finalColors;
    });

    return {
      edgePath,
      isHover,
      edgeColors,
    };
  },
});
</script>
