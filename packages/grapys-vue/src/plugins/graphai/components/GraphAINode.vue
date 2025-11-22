<template>
  <BaseNode
    :node-data="nodeData"
    :nearest-data="nearestData"
    :node-index="nodeIndex"
    :is-connectable="isConnectable"
    :inputs="computedInputs"
    :outputs="computedOutputs"
    v-bind="$attrs"
    @update-position="$emit('updatePosition', $event)"
    @save-position="$emit('savePosition')"
    @new-edge-start="$emit('newEdgeStart', $event)"
    @new-edge="$emit('newEdge', $event)"
    @new-edge-end="$emit('newEdgeEnd')"
    @open-node-menu="$emit('openNodeMenu', $event)"
    @open-node-edit-menu="$emit('openNodeEditMenu', $event)"
    @node-drag-start="$emit('nodeDragStart')"
    @node-drag-end="$emit('nodeDragEnd')"
  >
    <!-- GraphAI-specific header -->
    <template #header>
      <div class="w-full rounded-t-md py-1 text-center leading-none" :class="nodeHeaderClass(expectNearNode, nodeData)">
        {{ nodeData.nodeId }}
      </div>
      <div v-if="nodeData.type === 'computed'" class="w-full py-1 text-center text-xs leading-none" :class="nodeHeaderClass(expectNearNode, nodeData)">
        {{ nodeData.data.guiAgentId?.replace(/Agent$/, "") }}
      </div>
    </template>

    <!-- GraphAI-specific body -->
    <template #body>
      <!-- Static node editor -->
      <NodeStaticValue
        v-if="nodeData.type === 'static'"
        :node-data="nodeData"
        @update-static-value="(value) => store.updateStaticNodeValue(nodeIndex, value, true)"
        @focus-event="focusEvent"
        @blur-event="blurEvent"
      />

      <!-- Computed node params editor -->
      <NodeComputedParams
        v-if="nodeData.type === 'computed' && agentProfile?.params"
        :node-data="nodeData"
        :node-index="nodeIndex"
        @focus-event="focusEvent"
        @blur-event="blurEvent"
      />

      <!-- Agent selector (if multiple agents) -->
      <div v-if="agentProfile?.agents && agentProfile.agents.length > 1" class="w-full p-2">
        <select
          v-model="agentIndex"
          @change="updateAgentIndex"
          class="w-full rounded-md border border-gray-300 p-1 text-black"
          @mousedown.stop
          @touchstart.stop
        >
          <option v-for="(agent, i) in agentProfile.agents" :key="i" :value="i">
            {{ agent }}
          </option>
        </select>
      </div>

      <!-- Nested graph selector -->
      <div v-if="agentProfile?.isNestedGraph" class="w-full p-2">
        <select
          v-model="nestedGraphIndex"
          @change="updateNestedGraphIndex"
          class="w-full rounded-md border border-gray-300 p-1 text-black"
          @mousedown.stop
          @touchstart.stop
        >
          <option v-for="(ng, i) in nestedGraphs" :key="i" :value="i">
            {{ ng.name }}
          </option>
        </select>
      </div>
    </template>

    <!-- GraphAI-specific footer (results) -->
    <template #footer>
      <div class="flex w-full flex-col gap-1 p-2">
        <NodeResult :node-data="nodeData" />
      </div>
    </template>
  </BaseNode>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import BaseNode from '@receptron/vue-flow/src/components/BaseNode.vue';
import NodeStaticValue from './NodeStaticValue.vue';
import NodeComputedParams from './NodeComputedParams.vue';
import NodeResult from '../../../views/NodeResult.vue';
import { agentProfiles, staticNodeParams } from '../../../utils/gui/data';
import { nestedGraphInputs } from '../../../utils/gui/utils';
import { nodeHeaderClass } from '../../../utils/gui/classUtils';
import { useStore } from '../../../store';
import type { GUINodeData, GUINearestData } from '../../../utils/gui/type';

interface Props {
  nodeData: GUINodeData;
  nearestData?: GUINearestData;
  nodeIndex: number;
  isConnectable?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  isConnectable: true,
});

const emit = defineEmits([
  'updatePosition',
  'savePosition',
  'newEdgeStart',
  'newEdge',
  'newEdgeEnd',
  'openNodeMenu',
  'openNodeEditMenu',
  'nodeDragStart',
  'nodeDragEnd',
]);

const store = useStore();

// GraphAI-specific logic
const agentProfile = computed(() =>
  props.nodeData.type === 'computed'
    ? agentProfiles[props.nodeData.data.guiAgentId ?? '']
    : staticNodeParams
);

const agentIndex = ref(props.nodeData.data.agentIndex ?? 0);
const nestedGraphIndex = ref(props.nodeData.data.nestedGraphIndex ?? 0);

// Get nested graphs from store
const nestedGraphs = computed(() => store.nestedGraphs);

// Compute inputs/outputs based on agent profile or nested graph
const computedInputs = computed(() => {
  console.log('computedInputs - nodeData:', props.nodeData);
  console.log('computedInputs - agentProfile:', agentProfile.value);
  if (agentProfile.value?.isNestedGraph) {
    const nestedGraph = nestedGraphs.value[nestedGraphIndex.value];
    return nestedGraphInputs(nestedGraph?.graph);
  }
  const result = agentProfile.value?.inputs ?? [];
  console.log('computedInputs result:', result);
  return result;
});

const computedOutputs = computed(() => {
  console.log('computedOutputs - agentProfile:', agentProfile.value);
  if (agentProfile.value?.isNestedGraph) {
    const nestedGraph = nestedGraphs.value[nestedGraphIndex.value];
    return nestedGraph?.graph?.metadata?.forNested?.outputs ?? agentProfile.value?.outputs ?? [];
  }
  const result = agentProfile.value?.outputs ?? [];
  console.log('computedOutputs result:', result);
  return result;
});

const expectNearNode = computed(() => {
  return props.nodeData.nodeId === props.nearestData?.nodeId;
});

// Agent selection
const updateAgentIndex = () => {
  const agent = agentProfile.value?.agents?.[agentIndex.value];
  store.updateStaticNodeValue(props.nodeIndex, { agentIndex: agentIndex.value, agent } as any, true);
};

watch(() => props.nodeData.data.agentIndex, (value) => {
  if (value !== undefined) {
    agentIndex.value = value;
  }
});

// Nested graph selection
const nestedGraph = computed(() => nestedGraphs.value[nestedGraphIndex.value]);

const updateNestedGraphIndex = () => {
  store.updateNestedGraph(props.nodeIndex, {
    nestedGraphIndex: nestedGraphIndex.value,
    nestedGraphId: nestedGraph.value?.id
  } as any);
};

watch(() => props.nodeData.data.nestedGraphIndex, (value) => {
  if (value !== undefined) {
    nestedGraphIndex.value = value;
  }
});

// Focus/blur events for preventing canvas drag during editing
const focusEvent = () => {
  // TODO: Implement focus behavior if needed
};

const blurEvent = () => {
  // TODO: Implement blur behavior if needed
};
</script>
