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
