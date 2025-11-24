<template>
  <div class="flex h-screen w-screen">
    <!-- Debug Panel -->
    <div class="w-80 overflow-auto border-r bg-gray-50 p-4">
      <div class="mb-4 flex items-center justify-between">
        <h2 class="text-lg font-bold">Internal State</h2>
        <a
          href="https://github.com/receptron/grapys/blob/main/packages/vueweave/src/views/SimpleExample.vue"
          target="_blank"
          rel="noopener noreferrer"
          class="flex items-center gap-1 rounded bg-gray-800 px-2 py-1 text-xs text-white hover:bg-gray-700"
          title="View source on GitHub"
        >
          <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path fill-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clip-rule="evenodd" />
          </svg>
          <span>Source</span>
        </a>
      </div>

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
      <GraphCanvasBase :node-styles="{ colors: nodeColors }">
      <template #node="{ nodeData }">
        <NodeBase :inputs="getInputs(nodeData)" :outputs="getOutputs(nodeData)">
          <template #header>
            <div class="w-full rounded-t-md py-2 text-center text-white">
              {{ nodeData.nodeId }}
            </div>
          </template>
          <template #body-main>
            <div class="p-2 text-sm">
              <div class="font-semibold">{{ getNodeTypeLabel(nodeData.type) }}</div>
              <div class="text-xs text-gray-600">Type: {{ nodeData.type }}</div>
            </div>
          </template>
        </NodeBase>
      </template>
    </GraphCanvasBase>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useFlowStore, GraphCanvasBase, NodeBase, type GUINodeData, type NodeColorConfig } from "../package";

const flowStore = useFlowStore();

// Access reactive internal state for debugging
const nodes = computed(() => flowStore.nodes);
const edges = computed(() => flowStore.edges);
const nodeRecords = computed(() => flowStore.nodeRecords);

// Simple object-based color configuration
const nodeColors: NodeColorConfig = {
  source: {
    main: "bg-purple-400",
    header: "bg-purple-500",
    mainHighlight: "bg-purple-200",
    headerHighlight: "bg-purple-300",
  },
  processor: {
    main: "bg-green-400",
    header: "bg-green-500",
    mainHighlight: "bg-green-200",
    headerHighlight: "bg-green-300",
  },
  output: {
    main: "bg-blue-400",
    header: "bg-blue-500",
    mainHighlight: "bg-blue-200",
    headerHighlight: "bg-blue-300",
  },
};

// Initialize with sample data - Data Processing Pipeline
// Note: node.type can be any string value - fully customizable!
onMounted(() => {
  flowStore.initData(
  [
    // Input nodes - using "source" type
    {
      type: "source",
      nodeId: "dataSource1",
      position: { x: 50, y: 100 },
      data: { value: "Data A" },
    },
    {
      type: "source",
      nodeId: "dataSource2",
      position: { x: 50, y: 250 },
      data: { value: "Data B" },
    },
    // Processing nodes - using "processor" type
    {
      type: "processor",
      nodeId: "merger",
      position: { x: 300, y: 150 },
      data: { name: "Merge" },
    },
    {
      type: "processor",
      nodeId: "transformer",
      position: { x: 550, y: 150 },
      data: { name: "Transform" },
    },
    // Output nodes - using "output" type
    {
      type: "output",
      nodeId: "validator",
      position: { x: 800, y: 100 },
      data: { name: "Validate" },
    },
    {
      type: "output",
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

const getNodeTypeLabel = (type: string) => {
  switch (type) {
    case "source":
      return "Data Source";
    case "processor":
      return "Processor";
    case "output":
      return "Output";
    default:
      return type;
  }
};

const getInputs = (nodeData: GUINodeData) => {
  // Source nodes have no inputs
  if (nodeData.type === "source") {
    return [];
  }
  // Merger node has 2 inputs
  if (nodeData.nodeId === "merger") {
    return [{ name: "input1" }, { name: "input2" }];
  }
  // Other processor/output nodes have 1 input
  return [{ name: "input" }];
};

const getOutputs = (__nodeData: GUINodeData) => {
  // All nodes have outputs in this example
  return [{ name: "output" }];
};
</script>
