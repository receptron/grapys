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

    <!-- Main Content -->
    <div class="flex flex-1 flex-col">
      <div class="flex gap-2 border-b bg-gray-100 p-4">
      <button @click="addStaticNode" class="rounded bg-purple-500 px-4 py-2 text-white hover:bg-purple-600">Add Static Node</button>
      <button @click="addComputedNode" class="rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600">Add Computed Node</button>
      <button @click="loadSampleGraph" class="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600">Load Sample</button>
      <button @click="clearAll" class="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600">Clear All</button>
      <div class="ml-auto flex items-center gap-4">
        <span class="text-sm text-gray-600">Nodes: {{ nodes.length }}</span>
        <span class="text-sm text-gray-600">Edges: {{ edges.length }}</span>
      </div>
    </div>

    <div class="flex-1">
      <GraphCanvasBase ref="graphCanvas">
        <template #node="{ nodeData }">
          <NodeBase :inputs="getInputs(nodeData)" :outputs="getOutputs(nodeData)" @open-node-edit-menu="handleNodeClick(nodeData)">
            <template #header>
              <div class="w-full rounded-t-md py-2 text-center text-white" :class="nodeData.type === 'computed' ? 'bg-green-500' : 'bg-purple-500'">
                {{ nodeData.nodeId }}
              </div>
            </template>
            <template #body-main>
              <div class="p-2 text-center text-xs">
                <div v-if="nodeData.type === 'static'">
                  <input
                    v-model="(nodeData.data as { value?: string }).value"
                    @mousedown.stop
                    class="w-full rounded border px-2 py-1"
                    placeholder="Enter value"
                  />
                </div>
                <div v-else>{{ nodeData.type }}</div>
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
import { GraphCanvasBase, NodeBase, type GUINodeData } from "../package";
import type { GraphCanvasBaseExposed } from "../package/components/GraphCanvasBase.types";

const graphCanvas = ref<GraphCanvasBaseExposed>();

// Computed properties for reactive display
const nodes = computed(() => graphCanvas.value?.store.nodes ?? []);
const edges = computed(() => graphCanvas.value?.store.edges ?? []);
const nodeRecords = computed(() => graphCanvas.value?.store.nodeRecords ?? {});

// Initialize with empty data
onMounted(() => {
  graphCanvas.value?.initData([], [], {});
});

const nodeCounter = ref(1);

const addStaticNode = () => {
  const currentCount = nodeCounter.value;
  nodeCounter.value = currentCount + 1;
  const nodeId = `static${currentCount}`;

  graphCanvas.value?.pushNode({
    type: "static",
    nodeId,
    position: {
      x: 100 + (currentCount % 5) * 150,
      y: 100 + Math.floor(currentCount / 5) * 150,
    },
    data: { value: `Value ${currentCount}` },
  });
};

const addComputedNode = () => {
  const currentCount = nodeCounter.value;
  nodeCounter.value = currentCount + 1;
  const nodeId = `computed${currentCount}`;

  graphCanvas.value?.pushNode({
    type: "computed",
    nodeId,
    position: {
      x: 100 + (currentCount % 5) * 150,
      y: 100 + Math.floor(currentCount / 5) * 150,
    },
    data: { name: `Node ${currentCount}` },
  });
};

const loadSampleGraph = () => {
  // Clear existing data
  graphCanvas.value?.initData(
    [
      // Input nodes
      {
        type: "static",
        nodeId: "input1",
        position: { x: 50, y: 100 },
        data: { value: "Input A" },
      },
      {
        type: "static",
        nodeId: "input2",
        position: { x: 50, y: 250 },
        data: { value: "Input B" },
      },
      // Processing node
      {
        type: "computed",
        nodeId: "processor",
        position: { x: 300, y: 175 },
        data: { name: "Process" },
      },
      // Output node
      {
        type: "computed",
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

const getInputs = (nodeData: GUINodeData) => {
  if (nodeData.type === "computed") {
    // Processor node has 2 inputs
    if (nodeData.nodeId === "processor") {
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
