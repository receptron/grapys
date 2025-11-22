<template>
  <GraphCanvasBase
    :nodes="store.nodes"
    :edges="store.edges"
    :node-records="store.nodeRecords"
    :update-position="updateNodePosition"
    :save-position="saveNodePosition"
  >
    <template #head>
      <Loop />
    </template>

    <template #node="{ nodeData, nodeIndex }">
      <Node
        :node-index="nodeIndex"
        :node-data="nodeData"
        @update-static-node-value="updateStaticNodeValue(nodeIndex, $event, true)"
        @update-nested-graph="updateNestedGraph(nodeIndex, $event)"
        @open-node-edit-menu="openNodeEditor(nodeIndex)"
      />
    </template>
  </GraphCanvasBase>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import GraphCanvasBase from "../package/components/GraphCanvasBase.vue";
import Node from "./Node.vue";
import Loop from "./Loop.vue";

import { useStore } from "../store";
import type { NodePosition, UpdateStaticValue } from "../utils/gui/type";

export default defineComponent({
  name: "GraphCanvas",
  components: {
    GraphCanvasBase,
    Node,
    Loop,
  },
  emits: ["open-node-editor"],
  setup(props, { emit }) {
    const store = useStore();

    const updateNodePosition = (index: number, pos: NodePosition) => {
      store.updateNodePosition(index, pos);
    };
    const saveNodePosition = () => {
      store.saveNodePositionData();
    };
    const updateStaticNodeValue = (index: number, value: UpdateStaticValue, saveHistory: boolean) => {
      store.updateStaticNodeValue(index, value, saveHistory);
    };
    const updateNestedGraph = (index: number, value: UpdateStaticValue) => {
      store.updateNestedGraph(index, value);
    };

    const openNodeEditor = (nodeIndex: number) => {
      emit("open-node-editor", nodeIndex);
    };

    return {
      updateNodePosition,
      saveNodePosition,
      updateStaticNodeValue,
      updateNestedGraph,
      openNodeEditor,
      store,
    };
  },
});
</script>
