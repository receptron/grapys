<template>
  <div>
    <div v-if="nodeData.data.guiAgentId === 'openAIImageAgent' && result?.url">
      <img :src="result?.url" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, PropType } from "vue";
import { GUINodeData } from "../utils/gui/type";
import { useGraphAIStore } from "../store/graphai";

export default defineComponent({
  props: {
    nodeData: {
      type: Object as PropType<GUINodeData>,
      required: true,
    },
  },
  setup(props) {
    const graphAIStore = useGraphAIStore();
    const result = computed(() => {
      return graphAIStore.graphAIResults[props.nodeData.nodeId] as { url?: string };
    });
    return {
      result,
    };
  },
});
</script>
