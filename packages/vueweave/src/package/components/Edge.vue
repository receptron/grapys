<template>
  <path
    :d="edgePath"
    :stroke="isConnectable ? (isHover ? edgeColors.hover : edgeColors.edge) : edgeColors.notConnectable"
    fill="none"
    :stroke-width="isHover ? 4 : 2"
    @mouseover="isHover = true"
    @mouseleave="isHover = false"
  />
</template>

<script lang="ts">
import { defineComponent, ref, computed, inject, PropType } from "vue";
import { EdgeData2 } from "../utils/type";
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
      // Get source and target node IDs
      const sourceNodeId = props.sourceData.kind === "node" ? props.sourceData.nodeId : "";
      const targetNodeId = props.targetData.kind === "node" ? props.targetData.nodeId : "";

      // Try custom color function first
      const customColors = injectedEdgeColors.customColor?.(sourceNodeId, targetNodeId);

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
