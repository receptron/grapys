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
      // Get source node ID and index
      // For new edges, we need to consider the direction:
      // - outbound: source is the node, target is mouse
      // - inbound: target is the node, source is mouse
      const sourceNodeId = props.isNewEdge && props.edgeDirection === "inbound"
        ? (props.targetData.kind === "node" ? props.targetData.nodeId : "")
        : (props.sourceData.kind === "node" ? props.sourceData.nodeId : "");

      const sourceIndex = props.isNewEdge && props.edgeDirection === "inbound"
        ? (props.targetData.kind === "node" ? props.targetData.index : undefined)
        : (props.sourceData.kind === "node" ? props.sourceData.index : undefined);

      // For new edge (when nearestData is provided), use nearestData for stable color
      // Otherwise use targetData
      const hasTarget = Boolean(props.nearestData);

      // For new edges, nearestData contains the hover target (if any)
      // For existing edges, use targetData
      const targetNodeId = props.nearestData
        ? props.nearestData.nodeId
        : (props.isNewEdge
          ? ""
          : (props.targetData.kind === "node" ? props.targetData.nodeId : ""));

      const targetIndex = props.nearestData
        ? props.nearestData.index
        : (props.isNewEdge
          ? undefined
          : (props.targetData.kind === "node" ? props.targetData.index : undefined));

      const isNewEdge = props.isNewEdge;

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
