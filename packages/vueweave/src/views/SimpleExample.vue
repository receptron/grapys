<template>
  <div class="h-screen w-screen">
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
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { GraphCanvasBase, NodeBase, type GUINodeData } from "../package";
import type { GraphCanvasBaseExposed } from "../package/components/GraphCanvasBase.types";

const graphCanvas = ref<GraphCanvasBaseExposed>();

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
