<template>
  <div class="flex h-screen w-screen">
    <!-- Debug Panel -->
    <DebugPanel github-url="https://github.com/receptron/grapys/blob/main/packages/vueweave/src/views/InteractiveExample.vue" />

    <!-- Main Content -->
    <div class="flex flex-1 flex-col">
      <div class="flex gap-2 border-b bg-gray-100 p-4">
      <button @click="addSourceNode" class="rounded bg-purple-500 px-4 py-2 text-white hover:bg-purple-600">Add Source</button>
      <button @click="addProcessorNode" class="rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600">Add Processor</button>
      <button @click="addOutputNode" class="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600">Add Output</button>
      <button @click="loadSampleGraph" class="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600">Load Sample</button>
      <button @click="clearAll" class="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600">Clear All</button>
      <div class="ml-auto flex items-center gap-4">
        <span class="text-sm text-gray-600">Nodes: {{ flowStore.nodes.length }}</span>
        <span class="text-sm text-gray-600">Edges: {{ flowStore.edges.length }}</span>
      </div>
    </div>

    <div class="flex-1">
      <GraphCanvasBase :node-styles="{ colors: nodeColors }">
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
import { ref, onMounted } from "vue";
import { useFlowStore, GraphCanvasBase, NodeBase, type GUINodeData, type NodeColorConfig } from "../package";
import DebugPanel from "../components/DebugPanel.vue";

const flowStore = useFlowStore();

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
  flowStore.initData([], [], {});
});

const nodeCounter = ref(1);

const addSourceNode = () => {
  const currentCount = nodeCounter.value;
  nodeCounter.value = currentCount + 1;
  const nodeId = `source${currentCount}`;

  flowStore.pushNode({
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

  flowStore.pushNode({
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

  flowStore.pushNode({
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
  flowStore.initData(
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
  flowStore.initData([], [], {});
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
