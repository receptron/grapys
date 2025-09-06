<template>
  <div v-if="isOpen" class="pointer-events-auto rounded-md border border-gray-300 bg-white shadow-md w-80 p-4">
    <div class="flex items-center justify-between mb-3">
      <h3 class="text-lg font-semibold">Node Editor</h3>
      <button
        class="cursor-pointer rounded-full p-1 text-gray-600 hover:bg-gray-100"
        @click="$emit('close')"
        aria-label="Close"
        title="Close"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="size-5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <div v-if="currentNode?.type === 'computed' && agentProfile?.agents" class="space-y-1 mb-3">
      <label class="block text-xs text-gray-600">Agent</label>
      <select class="w-full border rounded px-2 py-1" v-model.number="agentIndex" @change="onChangeAgent">
        <option :value="key" v-for="(agent, key) in agentProfile.agents" :key="key">{{ agent }}</option>
      </select>
    </div>

    <div v-if="agentProfile?.isNestedGraph || agentProfile?.isMap" class="space-y-1">
      <label class="block text-xs text-gray-600">Nested Graph</label>
      <select class="w-full border rounded px-2 py-1" v-model.number="nestedGraphIndex" @change="onChangeNestedGraph">
        <option :value="key" v-for="(graph, key) in store.nestedGraphs" :key="key">{{ graph.name }}</option>
      </select>
    </div>

    <div class="mt-4">
      <div v-if="currentNode?.type === 'static'">
        <NodeStaticValue :node-data="currentNode" @update-static-value="onUpdateStaticValue" />
      </div>
      <div v-else-if="currentNode?.type === 'computed'">
        <NodeComputedParams :node-data="currentNode" :node-index="panelNodeIndex" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch } from 'vue';
import { useStore } from '../store';
import { agentProfiles, staticNodeParams } from '../utils/gui/data';
import type { GUINodeData, AgentProfile, UpdateStaticValue } from '../utils/gui/type';
import NodeStaticValue from './NodeStaticValue.vue';
import NodeComputedParams from './NodeComputedParams.vue';

export default defineComponent({
  name: 'NodeEditorPanel',
  components: {
    NodeStaticValue,
    NodeComputedParams,
  },
  props: {
    nodeIndex: { type: Number, required: true },
    isOpen: { type: Boolean, required: true },
  },
  emits: ['close'],
  setup(props) {
    const store = useStore();

    const currentNode = computed<GUINodeData | undefined>(() => store.nodes[props.nodeIndex]);
    const agentProfile = computed<AgentProfile | typeof staticNodeParams | undefined>(() => {
      const node = currentNode.value;
      if (!node) return undefined;
      return node.type === 'computed' ? agentProfiles[node.data.guiAgentId ?? ''] : staticNodeParams;
    });

    const agentIndex = ref<number>(0);
    const nestedGraphIndex = ref<number>(0);

    // props.nodeIndex が変わったら初期値を反映
    watch(
      () => props.nodeIndex,
      () => {
        agentIndex.value = (currentNode.value?.data.agentIndex as number) ?? 0;
        nestedGraphIndex.value = (currentNode.value?.data.nestedGraphIndex as number) ?? 0;
      },
      { immediate: true },
    );

    const onChangeAgent = () => {
      const profile = agentProfile.value;
      const agent = profile?.agents?.[agentIndex.value];
      store.updateStaticNodeValue(props.nodeIndex, { agentIndex: agentIndex.value, agent }, true);
    };

    const onChangeNestedGraph = () => {
      const graph = store.nestedGraphs[nestedGraphIndex.value];
      if (!graph) return;
      store.updateNestedGraph(props.nodeIndex, { nestedGraphIndex: nestedGraphIndex.value, nestedGraphId: graph.id });
    };

    // static/computed params editing
    const onUpdateStaticValue = (value: UpdateStaticValue) => {
      store.updateStaticNodeValue(props.nodeIndex, value, true);
    };

    const panelNodeIndex = computed(() => props.nodeIndex);

    return {
      store,
      currentNode,
      agentProfile,
      agentIndex,
      nestedGraphIndex,
      onChangeAgent,
      onChangeNestedGraph,
      onUpdateStaticValue,
      panelNodeIndex,
    };
  },
});
</script>
