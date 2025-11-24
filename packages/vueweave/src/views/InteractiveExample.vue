<template>
  <div class="flex h-screen w-screen">
    <!-- Debug Panel -->
    <div class="w-80 overflow-auto border-r bg-gray-50 p-4">
      <div class="mb-4 flex items-center justify-between">
        <h2 class="text-lg font-bold">Internal State</h2>
        <a
          href="https://github.com/receptron/grapys/blob/main/packages/vueweave/src/views/InteractiveExample.vue"
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

    <!-- Main Content -->
    <div class="flex flex-1 flex-col">
      <div class="flex gap-2 border-b bg-gray-100 p-4">
      <button @click="addSourceNode" class="rounded bg-purple-500 px-4 py-2 text-white hover:bg-purple-600">Add Source</button>
      <button @click="addProcessorNode" class="rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600">Add Processor</button>
      <button @click="addOutputNode" class="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600">Add Output</button>
      <button @click="loadSampleGraph" class="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600">Load Sample</button>
      <button @click="clearAll" class="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600">Clear All</button>
      <div class="ml-auto flex items-center gap-4">
        <span class="text-sm text-gray-600">Nodes: {{ nodes.length }}</span>
        <span class="text-sm text-gray-600">Edges: {{ edges.length }}</span>
      </div>
    </div>

    <div class="flex-1">
      <GraphCanvasBase ref="graphCanvas" :node-styles="{ colors: nodeColors }">
        <template #node="{ nodeData }">
          <NodeBase :inputs="getInputs(nodeData)" :outputs="getOutputs(nodeData)" @open-node-edit-menu="handleNodeClick(nodeData)">
            <template #header>
              <div class="w-full rounded-t-md py-2 text-center text-white">
                {{ nodeData.nodeId }}
              </div>
            </template>
            <template #body-main>
              <div class="p-2 text-center text-xs">
                <div v-if="nodeData.type === 'source'">
                  <input
                    v-model="(nodeData.data as { value?: string }).value"
                    @mousedown.stop
                    class="w-full rounded border px-2 py-1"
                    placeholder="Enter value"
                  />
                </div>
                <div v-else>
                  <div class="font-semibold">{{ getNodeTypeLabel(nodeData.type) }}</div>
                  <div class="text-xs text-gray-500">{{ nodeData.type }}</div>
                </div>
              </div>
            </template>
          </NodeBase>
        </template>
      </GraphCanvasBase>
    </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { GraphCanvasBase, NodeBase, type GUINodeData, type NodeColorConfig } from "../package";
import type { GraphCanvasBaseExposed } from "../package/components/GraphCanvasBase.types";

const graphCanvas = ref<GraphCanvasBaseExposed>();

// Computed properties for reactive display
const nodes = computed(() => graphCanvas.value?.store.nodes ?? []);
const edges = computed(() => graphCanvas.value?.store.edges ?? []);
const nodeRecords = computed(() => graphCanvas.value?.store.nodeRecords ?? {});

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

// Initialize with empty data
onMounted(() => {
  graphCanvas.value?.initData([], [], {});
});

const nodeCounter = ref(1);

const addSourceNode = () => {
  const currentCount = nodeCounter.value;
  nodeCounter.value = currentCount + 1;
  const nodeId = `source${currentCount}`;

  graphCanvas.value?.pushNode({
    type: "source",
    nodeId,
    position: {
      x: 100 + (currentCount % 5) * 150,
      y: 100 + Math.floor(currentCount / 5) * 150,
    },
    data: { value: `Data ${currentCount}` },
  });
};

const addProcessorNode = () => {
  const currentCount = nodeCounter.value;
  nodeCounter.value = currentCount + 1;
  const nodeId = `processor${currentCount}`;

  graphCanvas.value?.pushNode({
    type: "processor",
    nodeId,
    position: {
      x: 100 + (currentCount % 5) * 150,
      y: 100 + Math.floor(currentCount / 5) * 150,
    },
    data: { name: `Process ${currentCount}` },
  });
};

const addOutputNode = () => {
  const currentCount = nodeCounter.value;
  nodeCounter.value = currentCount + 1;
  const nodeId = `output${currentCount}`;

  graphCanvas.value?.pushNode({
    type: "output",
    nodeId,
    position: {
      x: 100 + (currentCount % 5) * 150,
      y: 100 + Math.floor(currentCount / 5) * 150,
    },
    data: { name: `Output ${currentCount}` },
  });
};

const loadSampleGraph = () => {
  // Clear existing data
  graphCanvas.value?.initData(
    [
      // Source nodes
      {
        type: "source",
        nodeId: "input1",
        position: { x: 50, y: 100 },
        data: { value: "Input A" },
      },
      {
        type: "source",
        nodeId: "input2",
        position: { x: 50, y: 250 },
        data: { value: "Input B" },
      },
      // Processing node
      {
        type: "processor",
        nodeId: "processor",
        position: { x: 300, y: 175 },
        data: { name: "Process" },
      },
      // Output node
      {
        type: "output",
        nodeId: "output",
        position: { x: 550, y: 175 },
        data: { name: "Output" },
      },
    ],
    [
      // Connect inputs to processor
      {
        type: "edge",
        source: { nodeId: "input1", index: 0 },
        target: { nodeId: "processor", index: 0 },
      },
      {
        type: "edge",
        source: { nodeId: "input2", index: 0 },
        target: { nodeId: "processor", index: 1 },
      },
      // Connect processor to output
      {
        type: "edge",
        source: { nodeId: "processor", index: 0 },
        target: { nodeId: "output", index: 0 },
      },
    ],
    {}
  );
  nodeCounter.value = 1;
};

const clearAll = () => {
  graphCanvas.value?.initData([], [], {});
  nodeCounter.value = 1;
};

const handleNodeClick = (nodeData: GUINodeData) => {
  console.log("Node clicked:", nodeData.nodeId);
};

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
  // Processor node has 2 inputs
  if (nodeData.nodeId === "processor") {
    return [{ name: "input1" }, { name: "input2" }];
  }
  // Other processor/output nodes have 1 input
  return [{ name: "input" }];
};

const getOutputs = (__nodeData: GUINodeData) => {
  // All nodes have outputs
  return [{ name: "output" }];
};
</script>
