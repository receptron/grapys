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
import { defineComponent, ref, computed, PropType } from "vue";
import { EdgeData2 } from "../../utils/gui/type";
import { convEdgePath } from "../utils/gui";

import { edgeColors } from "../utils/classUtils";

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
      return convEdgePath(props.sourceData.index, props.sourceData.data.position, props.targetData.index, props.targetData.data.position);
    });

    return {
      edgePath,
      isHover,
      edgeColors,
    };
  },
});
</script>
