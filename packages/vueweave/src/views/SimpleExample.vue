<template>
  <div class="h-screen w-screen">
    <GraphCanvasBase
      :nodes="nodes"
      :edges="edges"
      :node-records="nodeRecords"
      :update-position="updateNodePosition"
      :save-position="saveNodePosition"
      :validate-connection="validateConnection"
    >
      <template #node="{ nodeData, nodeIndex }">
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
import { computed } from "vue";
import { GraphCanvasBase, NodeBase, useFlowStore, type GUINodeData } from "vueweave";

const store = useFlowStore();

// Initialize with sample data
store.initData(
  [
    {
      type: "static",
      nodeId: "input1",
      position: { x: 100, y: 100 },
      data: { value: "Hello" },
    },
    {
      type: "computed",
      nodeId: "process1",
      position: { x: 400, y: 100 },
      data: { name: "Process" },
    },
    {
      type: "static",
      nodeId: "output1",
      position: { x: 700, y: 100 },
      data: { value: "" },
    },
  ],
  [
    {
      type: "edge",
      source: { nodeId: "input1", index: 0 },
      target: { nodeId: "process1", index: 0 },
    },
    {
      type: "edge",
      source: { nodeId: "process1", index: 0 },
      target: { nodeId: "output1", index: 0 },
    },
  ]
);

const nodes = computed(() => store.nodes);
const edges = computed(() => store.edges);
const nodeRecords = computed(() => store.nodeRecords);

function updateNodePosition(index: number, position: any) {
  store.updateNodePosition(index, position);
}

function saveNodePosition() {
  store.savePosition();
}

function validateConnection() {
  return true;
}

function getInputs(nodeData: GUINodeData) {
  if (nodeData.type === "computed") {
    return [{ name: "input" }];
  }
  return [];
}

function getOutputs(nodeData: GUINodeData) {
  return [{ name: "output" }];
}
</script>
