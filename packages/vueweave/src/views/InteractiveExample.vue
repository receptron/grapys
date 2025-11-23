<template>
  <div class="flex h-screen w-screen flex-col">
    <div class="flex gap-2 border-b bg-gray-100 p-4">
      <button @click="addNode" class="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600">Add Node</button>
      <button @click="clearAll" class="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600">Clear All</button>
      <div class="ml-4 flex items-center gap-2">
        <span class="text-sm text-gray-600">Nodes: {{ nodes.length }}</span>
        <span class="text-sm text-gray-600">Edges: {{ edges.length }}</span>
      </div>
    </div>

    <div class="flex-1">
      <GraphCanvasBase
        :nodes="nodes"
        :edges="edges"
        :node-records="nodeRecords"
        :update-position="updateNodePosition"
        :save-position="saveNodePosition"
        :validate-connection="validateConnection"
      >
        <template #node="{ nodeData, nodeIndex }">
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
                    v-model="(nodeData.data as any).value"
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
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { GraphCanvasBase, NodeBase, useFlowStore, type GUINodeData } from "vueweave";

const store = useFlowStore();

// Initialize with empty data
store.initData([], []);

const nodeCounter = ref(1);

const nodes = computed(() => store.nodes);
const edges = computed(() => store.edges);
const nodeRecords = computed(() => store.nodeRecords);

function addNode() {
  const nodeId = `node${nodeCounter.value++}`;
  const nodeType = nodeCounter.value % 2 === 0 ? "computed" : "static";

  store.pushNode({
    type: nodeType,
    nodeId,
    position: {
      x: 100 + (nodeCounter.value % 5) * 150,
      y: 100 + Math.floor(nodeCounter.value / 5) * 150,
    },
    data: nodeType === "static" ? { value: `Value ${nodeCounter.value}` } : { name: `Node ${nodeCounter.value}` },
  });
}

function clearAll() {
  store.initData([], []);
  nodeCounter.value = 1;
}

function updateNodePosition(index: number, position: any) {
  store.updateNodePosition(index, position);
}

function saveNodePosition() {
  store.savePosition();
}

function validateConnection() {
  return true;
}

function handleNodeClick(nodeData: GUINodeData) {
  console.log("Node clicked:", nodeData.nodeId);
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
