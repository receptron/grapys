<script setup lang="ts">
import { ref } from 'vue';
import GraphCanvas from '@receptron/vue-flow/src/components/GraphCanvas.vue';
import GraphAINode from '../plugins/graphai/components/GraphAINode.vue';
import Loop from './Loop.vue';
import ContextEdgeMenu from './ContextEdgeMenu.vue';
import ContextNodeMenu from './ContextNodeMenu.vue';

const emit = defineEmits(['open-node-editor']);

const contextEdgeMenu = ref();
const contextNodeMenu = ref();

const openEdgeMenu = (data: { event: MouseEvent; edgeIndex: number }) => {
  const { event, edgeIndex } = data;
  contextEdgeMenu.value?.openMenu(event, edgeIndex);
};

const openNodeMenu = (data: { event: MouseEvent; nodeIndex: number }) => {
  const { event, nodeIndex } = data;
  contextNodeMenu.value?.openMenu(event, nodeIndex);
};

const openNodeEditor = (nodeIndex: number) => {
  emit('open-node-editor', nodeIndex);
};
</script>

<template>
  <GraphCanvas
    :node-component="GraphAINode"
    @open-node-editor="openNodeEditor"
    @node-click="openNodeMenu"
    @edge-click="openEdgeMenu"
  >
    <!-- Loop indicator in content slot -->
    <template #content>
      <Loop />
    </template>

    <!-- Context menus -->
    <template #context-menus>
      <ContextEdgeMenu ref="contextEdgeMenu" />
      <ContextNodeMenu ref="contextNodeMenu" />
    </template>
  </GraphCanvas>
</template>
