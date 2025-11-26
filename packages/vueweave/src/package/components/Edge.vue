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
import { defineComponent, ref, computed, inject, PropType } from "vue";
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

    // Helper: Get source node ID and index based on edge direction
    const getSourceInfo = () => {
      const isInbound = props.isNewEdge && props.edgeDirection === "inbound";
      const data = isInbound ? props.targetData : props.sourceData;

      return {
        sourceNodeId: data.kind === "node" ? data.nodeId : "",
        sourceIndex: data.kind === "node" ? data.index : undefined,
      };
    };

    // Helper: Get target node ID and index
    const getTargetInfo = () => {
      if (props.nearestData) {
        return {
          targetNodeId: props.nearestData.nodeId,
          targetIndex: props.nearestData.index,
        };
      }

      if (props.isNewEdge) {
        return { targetNodeId: "", targetIndex: undefined };
      }

      return {
        targetNodeId: props.targetData.kind === "node" ? props.targetData.nodeId : "",
        targetIndex: props.targetData.kind === "node" ? props.targetData.index : undefined,
      };
    };

    // Compute actual edge colors based on source/target nodes
    const edgeColors = computed(() => {
      const { sourceNodeId, sourceIndex } = getSourceInfo();
      const { targetNodeId, targetIndex } = getTargetInfo();
      const hasTarget = Boolean(props.nearestData);
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
      return {
        edge: customColors?.edge || injectedEdgeColors.edge || "red",
        hover: customColors?.hover || injectedEdgeColors.hover || "blue",
        notConnectable: injectedEdgeColors.notConnectable || "pink",
      };
    });

    return {
      edgePath,
      isHover,
      edgeColors,
    };
  },
});
</script>
