<template>
  <div class="flex h-screen w-screen">
    <!-- Debug Panel -->
    <DebugPanel github-url="https://github.com/receptron/grapys/blob/main/packages/vueweave/src/views/SimpleExample.vue" />

    <!-- Canvas -->
    <div class="flex-1">
      <GraphCanvasBase :node-styles="{ colors: nodeColors }">
        <template #node="{ nodeData }">
          <NodeBase :inputs="getInputs(nodeData)" :outputs="getOutputs(nodeData)">
            <template #header>
              <div class="w-full rounded-t-md bg-blue-700 py-2 text-center text-white" v-if="nodeData.type === 'output'">
                {{ nodeData.nodeId }}
              </div>
              <div class="w-full rounded-t-md bg-purple-700 py-2 text-center text-white" v-else-if="nodeData.type === 'source'">
                {{ nodeData.nodeId }}
              </div>
              <div class="w-full rounded-t-md py-2 text-center text-white" v-else>
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
import { onMounted } from "vue";
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

// Initialize with sample data - Complex Data Processing Pipeline
// Demonstrates: single input, multiple inputs, multiple outputs
onMounted(() => {
  flowStore.initData(
    [
      // Source nodes - single output
      {
        type: "source",
        nodeId: "sensor1",
        position: { x: 50, y: 80 },
        data: { value: "Temperature" },
      },
      {
        type: "source",
        nodeId: "sensor2",
        position: { x: 50, y: 230 },
        data: { value: "Humidity" },
      },
      {
        type: "source",
        nodeId: "sensor3",
        position: { x: 50, y: 380 },
        data: { value: "Pressure" },
      },
      {
        type: "source",
        nodeId: "config",
        position: { x: 50, y: 530 },
        data: { value: "Settings" },
      },

      // Processor with multiple inputs (3 sensor inputs + 1 config)
      {
        type: "processor",
        nodeId: "aggregator",
        position: { x: 300, y: 200 },
        data: { name: "Aggregator" },
      },

      // Processor with single input, multiple outputs
      {
        type: "processor",
        nodeId: "analyzer",
        position: { x: 550, y: 200 },
        data: { name: "Analyzer" },
      },

      // Output nodes - single input each
      {
        type: "output",
        nodeId: "dashboard",
        position: { x: 800, y: 80 },
        data: { name: "Dashboard" },
      },
      {
        type: "output",
        nodeId: "database",
        position: { x: 800, y: 230 },
        data: { name: "Database" },
      },
      {
        type: "output",
        nodeId: "alert",
        position: { x: 800, y: 380 },
        data: { name: "Alert System" },
      },
      {
        type: "output",
        nodeId: "logger",
        position: { x: 800, y: 530 },
        data: { name: "Logger" },
      },
    ],
    [
      // Multiple inputs to aggregator (4 inputs)
      {
        type: "edge",
        source: { nodeId: "sensor1", index: 0 },
        target: { nodeId: "aggregator", index: 0 },
      },
      {
        type: "edge",
        source: { nodeId: "sensor2", index: 0 },
        target: { nodeId: "aggregator", index: 1 },
      },
      {
        type: "edge",
        source: { nodeId: "sensor3", index: 0 },
        target: { nodeId: "aggregator", index: 2 },
      },
      {
        type: "edge",
        source: { nodeId: "config", index: 0 },
        target: { nodeId: "aggregator", index: 3 },
      },

      // Single input to analyzer
      {
        type: "edge",
        source: { nodeId: "aggregator", index: 0 },
        target: { nodeId: "analyzer", index: 0 },
      },

      // Multiple outputs from analyzer (4 outputs)
      {
        type: "edge",
        source: { nodeId: "analyzer", index: 0 },
        target: { nodeId: "dashboard", index: 0 },
      },
      {
        type: "edge",
        source: { nodeId: "analyzer", index: 1 },
        target: { nodeId: "database", index: 0 },
      },
      {
        type: "edge",
        source: { nodeId: "analyzer", index: 2 },
        target: { nodeId: "alert", index: 0 },
      },
      {
        type: "edge",
        source: { nodeId: "analyzer", index: 3 },
        target: { nodeId: "logger", index: 0 },
      },
    ],
    {},
  );
});

const getNodeTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    source: "Data Source",
    processor: "Processor",
    output: "Output",
  };
  return labels[type] ?? type;
};

const getInputs = (nodeData: GUINodeData) => {
  // Source nodes have no inputs
  if (nodeData.type === "source") {
    return [];
  }

  // Aggregator has 4 inputs (multiple inputs example)
  if (nodeData.nodeId === "aggregator") {
    return [{ name: "temp" }, { name: "humidity" }, { name: "pressure" }, { name: "config" }];
  }

  // All other processor/output nodes have single input
  return [{ name: "input" }];
};

const getOutputs = (nodeData: GUINodeData) => {
  // Analyzer has 4 outputs (multiple outputs example)
  if (nodeData.nodeId === "analyzer") {
    return [{ name: "display" }, { name: "store" }, { name: "notify" }, { name: "log" }];
  }

  // All other nodes have single output
  return [{ name: "output" }];
};
</script>
