<template>
  <div class="flex h-screen w-screen">
    <!-- Debug Panel -->
    <DebugPanel github-url="https://github.com/receptron/grapys/blob/main/packages/vueweave/src/views/MinimalExample.vue" />

    <!-- Canvas -->
    <div class="flex-1">
      <GraphCanvasBase />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { useFlowStore, GraphCanvasBase } from "../package";
import DebugPanel from "../components/DebugPanel.vue";

const flowStore = useFlowStore();

onMounted(() => {
  flowStore.initData(
    [
      { type: "node", nodeId: "A", position: { x: 100, y: 100 }, data: { label: "Node A" } },
      { type: "node", nodeId: "B", position: { x: 400, y: 100 }, data: { label: "Node B" } },
    ],
    [
      {
        type: "edge",
        source: { nodeId: "A", index: 0 },
        target: { nodeId: "B", index: 0 },
      },
    ],
    {},
  );
});
</script>
