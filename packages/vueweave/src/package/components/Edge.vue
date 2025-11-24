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
    const edgeColors = inject<EdgeColorConfig>(EDGE_COLOR_KEY, defaultEdgeColors);

    return {
      edgePath,
      isHover,
      edgeColors,
    };
  },
});
</script>
