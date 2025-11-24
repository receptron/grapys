<template>
  <div class="flex h-screen w-screen">
    <!-- Debug Panel -->
    <div class="w-80 overflow-auto border-r bg-gray-50 p-4">
      <h2 class="mb-4 text-lg font-bold">Internal State</h2>

      <div class="mb-4">
        <h3 class="mb-2 font-semibold text-sm">Nodes ({{ nodes.length }})</h3>
        <div class="space-y-2">
          <details v-for="(node, index) in nodes" :key="index" class="rounded bg-white p-2 text-xs">
            <summary class="cursor-pointer font-medium">{{ node.nodeId }}</summary>
            <pre class="mt-2 overflow-auto text-xs">{{ JSON.stringify(node, null, 2) }}</pre>
          </details>
        </div>
      </div>

      <div class="mb-4">
        <h3 class="mb-2 font-semibold text-sm">Edges ({{ edges.length }})</h3>
        <div class="space-y-2">
          <div v-for="(edge, index) in edges" :key="index" class="rounded bg-white p-2 text-xs">
            <div class="font-medium">{{ edge.source.nodeId }}[{{ edge.source.index }}] → {{ edge.target.nodeId }}[{{ edge.target.index }}]</div>
            <pre class="mt-1 overflow-auto text-xs">{{ JSON.stringify(edge, null, 2) }}</pre>
          </div>
        </div>
      </div>

      <div class="mb-4">
        <h3 class="mb-2 font-semibold text-sm">Node Records</h3>
        <pre class="overflow-auto rounded bg-white p-2 text-xs">{{ JSON.stringify(nodeRecords, null, 2) }}</pre>
      </div>
    </div>

    <!-- Canvas -->
    <div class="flex-1">
      <GraphCanvasBase ref="graphCanvas">
      <template #node="{ nodeData }">
        <NodeBase :inputs="getInputs(nodeData)" :outputs="getOutputs(nodeData)">
          <template #header>
            <div class="w-full rounded-t-md bg-blue-500 py-2 text-center text-white">
              {{ nodeData.nodeId }}
            </div>
          </template>
          <template #body-main>
            <div class="p-2 text-sm">
              {{ nodeData.type === "computed" ? "Computed Node" : "Static Node" }}
            </div>
          </template>
        </NodeBase>
      </template>
    </GraphCanvasBase>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { GraphCanvasBase, NodeBase, type GUINodeData } from "../package";
import type { GraphCanvasBaseExposed } from "../package/components/GraphCanvasBase.types";

const graphCanvas = ref<GraphCanvasBaseExposed>();

// Access reactive internal state for debugging
const nodes = computed(() => graphCanvas.value?.store.nodes ?? []);
const edges = computed(() => graphCanvas.value?.store.edges ?? []);
const nodeRecords = computed(() => graphCanvas.value?.store.nodeRecords ?? {});

// Initialize with sample data - Data Processing Pipeline
onMounted(() => {
  graphCanvas.value?.initData(
  [
    // Input nodes
    {
      type: "static",
      nodeId: "dataSource1",
      position: { x: 50, y: 100 },
      data: { value: "Data A" },
    },
    {
      type: "static",
      nodeId: "dataSource2",
      position: { x: 50, y: 250 },
      data: { value: "Data B" },
    },
    // Processing nodes
    {
      type: "computed",
      nodeId: "merger",
      position: { x: 300, y: 150 },
      data: { name: "Merge" },
    },
    {
      type: "computed",
      nodeId: "transformer",
      position: { x: 550, y: 150 },
      data: { name: "Transform" },
    },
    // Output nodes
    {
      type: "computed",
      nodeId: "validator",
      position: { x: 800, y: 100 },
      data: { name: "Validate" },
    },
    {
      type: "computed",
      nodeId: "logger",
      position: { x: 800, y: 250 },
      data: { name: "Log" },
    },
  ],
  [
    // Connect data sources to merger
    {
      type: "edge",
      source: { nodeId: "dataSource1", index: 0 },
      target: { nodeId: "merger", index: 0 },
    },
    {
      type: "edge",
      source: { nodeId: "dataSource2", index: 0 },
      target: { nodeId: "merger", index: 1 },
    },
    // Connect merger to transformer
    {
      type: "edge",
      source: { nodeId: "merger", index: 0 },
      target: { nodeId: "transformer", index: 0 },
    },
    // Connect transformer to outputs
    {
      type: "edge",
      source: { nodeId: "transformer", index: 0 },
      target: { nodeId: "validator", index: 0 },
    },
    {
      type: "edge",
      source: { nodeId: "transformer", index: 0 },
      target: { nodeId: "logger", index: 0 },
    },
  ],
  {}
  );
});

const getInputs = (nodeData: GUINodeData) => {
  if (nodeData.type === "computed") {
    // Merger node has 2 inputs
    if (nodeData.nodeId === "merger") {
      return [{ name: "input1" }, { name: "input2" }];
    }
    // Other computed nodes have 1 input
    return [{ name: "input" }];
  }
  return [];
};

const getOutputs = (__nodeData: GUINodeData) => {
  return [{ name: "output" }];
};
</script>
