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
import { EDGE_COLOR_KEY, EDGE_COLOR_OPTIONS_KEY, type EdgeColorConfig, type EdgeColorOptions } from "../utils/nodeStyles";

const defaultEdgeColors: EdgeColorConfig = {
  edge: "red",
  hover: "blue",
  notConnectable: "pink",
};

const defaultEdgeColorOptions: EdgeColorOptions = {
  default: defaultEdgeColors,
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

    // Inject edge color options (new API) with defaults
    const edgeColorOptions = inject<EdgeColorOptions>(EDGE_COLOR_OPTIONS_KEY, defaultEdgeColorOptions);

    // Inject legacy edge colors for backward compatibility
    const legacyEdgeColors = inject<EdgeColorConfig>(EDGE_COLOR_KEY, defaultEdgeColors);

    // Compute actual edge colors based on source/target nodes
    const edgeColors = computed(() => {
      // Get source and target node IDs
      const sourceNodeId = props.sourceData.kind === "node" ? props.sourceData.nodeId : "";
      const targetNodeId = props.targetData.kind === "node" ? props.targetData.nodeId : "";

      // Try custom color function first
      const customColors = edgeColorOptions.customColor?.(sourceNodeId, targetNodeId);

      // Return merged colors: custom > options.default > legacy > fallback
      return {
        edge: customColors?.edge || edgeColorOptions.default?.edge || legacyEdgeColors.edge || "red",
        hover: customColors?.hover || edgeColorOptions.default?.hover || legacyEdgeColors.hover || "blue",
        notConnectable: edgeColorOptions.default?.notConnectable || legacyEdgeColors.notConnectable || "pink",
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
