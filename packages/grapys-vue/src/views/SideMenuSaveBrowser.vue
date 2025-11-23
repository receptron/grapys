<template>
  <h2 class="text-left font-bold">Save to LocalStorage</h2>
  <div class="mb-1 space-y-1">
    <button @click="save" class="w-full cursor-pointer items-center rounded-full bg-sky-500 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700">
      Save Graph
    </button>
    <button @click="load" class="w-full cursor-pointer items-center rounded-full bg-sky-500 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700">
      Load Graph
    </button>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useFlowStore } from "vueweave";
import { useGraphAIStore } from "../store/graphai";

export default defineComponent({
  components: {},
  setup() {
    const store = useFlowStore();
    const graphAIStore = useGraphAIStore();

    const save = () => {
      const graphData = graphAIStore.createGraphData(store.currentData);
      const dataStr = JSON.stringify(graphData);
      window.localStorage.setItem("GRAPHAIGUI", dataStr);
    };

    const load = () => {
      const data = window.localStorage.getItem("GRAPHAIGUI");
      try {
        if (data) {
          const graphData = JSON.parse(data);
          // BACKWARD COMPATIBILITY: Support old format where loop was at root level
          const loadedData = graphData.metadata.data;
          store.loadData(loadedData);
        }
      } catch (error) {
        console.log(error);
      }
    };

    return {
      save,
      load,
    };
  },
});
</script>
