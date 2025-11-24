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
        <div class="border-l border-gray-300 pl-2">
          <button @click="flowStore.undo()" :disabled="!flowStore.undoable" class="rounded bg-gray-500 px-4 py-2 text-white hover:bg-gray-600 disabled:cursor-not-allowed disabled:bg-gray-300">Undo</button>
          <button @click="flowStore.redo()" :disabled="!flowStore.redoable" class="ml-2 rounded bg-gray-500 px-4 py-2 text-white hover:bg-gray-600 disabled:cursor-not-allowed disabled:bg-gray-300">Redo</button>
        </div>
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
  // Clear existing data and load complex sample
  flowStore.initData(
    [
      // Source nodes - demonstrate multiple sources
      {
        type: "source",
        nodeId: "input1",
        position: { x: 80, y: 100 },
        data: { value: "Data A" },
      },
      {
        type: "source",
        nodeId: "input2",
        position: { x: 80, y: 220 },
        data: { value: "Data B" },
      },
      {
        type: "source",
        nodeId: "input3",
        position: { x: 80, y: 340 },
        data: { value: "Data C" },
      },

      // Processor with multiple inputs
      {
        type: "processor",
        nodeId: "merger",
        position: { x: 320, y: 200 },
        data: { name: "Merge 3 Inputs" },
      },

      // Processor with multiple outputs
      {
        type: "processor",
        nodeId: "splitter",
        position: { x: 560, y: 200 },
        data: { name: "Split to 3" },
      },

      // Output nodes
      {
        type: "output",
        nodeId: "result1",
        position: { x: 800, y: 100 },
        data: { name: "Output A" },
      },
      {
        type: "output",
        nodeId: "result2",
        position: { x: 800, y: 220 },
        data: { name: "Output B" },
      },
      {
        type: "output",
        nodeId: "result3",
        position: { x: 800, y: 340 },
        data: { name: "Output C" },
      },
    ],
    [
      // Multiple inputs to merger
      { type: "edge", source: { nodeId: "input1", index: 0 }, target: { nodeId: "merger", index: 0 } },
      { type: "edge", source: { nodeId: "input2", index: 0 }, target: { nodeId: "merger", index: 1 } },
      { type: "edge", source: { nodeId: "input3", index: 0 }, target: { nodeId: "merger", index: 2 } },

      // Single connection between processors
      { type: "edge", source: { nodeId: "merger", index: 0 }, target: { nodeId: "splitter", index: 0 } },

      // Multiple outputs from splitter
      { type: "edge", source: { nodeId: "splitter", index: 0 }, target: { nodeId: "result1", index: 0 } },
      { type: "edge", source: { nodeId: "splitter", index: 1 }, target: { nodeId: "result2", index: 0 } },
      { type: "edge", source: { nodeId: "splitter", index: 2 }, target: { nodeId: "result3", index: 0 } },
    ],
    {},
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

  // Merger nodes have multiple inputs (3 inputs)
  if (nodeData.nodeId === "merger" || nodeData.nodeId.includes("merger")) {
    return [{ name: "in1" }, { name: "in2" }, { name: "in3" }];
  }

  // Processor node has 2 inputs (for backward compatibility)
  if (nodeData.nodeId === "processor") {
    return [{ name: "input1" }, { name: "input2" }];
  }

  // All other processor/output nodes have single input
  return [{ name: "input" }];
};

const getOutputs = (nodeData: GUINodeData) => {
  // Splitter nodes have multiple outputs (3 outputs)
  if (nodeData.nodeId === "splitter" || nodeData.nodeId.includes("splitter")) {
    return [{ name: "out1" }, { name: "out2" }, { name: "out3" }];
  }

  // All other nodes have single output
  return [{ name: "output" }];
};
</script>
