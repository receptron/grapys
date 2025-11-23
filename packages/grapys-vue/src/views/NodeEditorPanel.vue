<template>
  <div class="pointer-events-auto w-80 rounded-md border border-gray-300 bg-white p-4 shadow-md">
    <div class="mb-3 flex items-center justify-between">
      <div class="flex flex-col">
        <h3 class="text-lg leading-tight font-semibold">
          {{ currentNode?.nodeId ?? "Node Editor" }}
        </h3>
        <div v-if="currentNode?.type === 'computed' && headerAgentName" class="mt-0.5 text-xs leading-none text-gray-500">
          {{ headerAgentName }}
        </div>
      </div>

      <button class="cursor-pointer rounded-full p-1 text-gray-600 hover:bg-gray-100" @click="$emit('close')" aria-label="Close" title="Close">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="size-5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <div v-if="currentNode?.type === 'computed' && agentProfile?.agents" class="mb-3 space-y-1">
      <label class="block text-xs text-gray-600">Agent</label>
      <select class="w-full rounded border px-2 py-1" v-model.number="agentIndex" @change="onChangeAgent">
        <option :value="key" v-for="(agent, key) in agentProfile.agents" :key="key">{{ agent }}</option>
      </select>
    </div>

    <div v-if="agentProfile?.isNestedGraph || agentProfile?.isMap" class="space-y-1">
      <label class="block text-xs text-gray-600">Nested Graph</label>
      <select class="w-full rounded border px-2 py-1" v-model.number="nestedGraphIndex" @change="onChangeNestedGraph">
        <option :value="key" v-for="(graph, key) in graphAIStore.nestedGraphs" :key="key">{{ graph.name }}</option>
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
import { defineComponent, ref, computed, watch } from "vue";
import { useFlowStore, GUINodeData } from "vueweave";
import { useGraphAIStore } from "../store/graphai";
import { agentProfiles, staticNodeParams } from "../utils/gui/data";
import type { AgentProfile, UpdateStaticValue } from "../utils/gui/type";
import NodeStaticValue from "./NodeStaticValue.vue";
import NodeComputedParams from "./NodeComputedParams.vue";

export default defineComponent({
  name: "NodeEditorPanel",
  components: {
    NodeStaticValue,
    NodeComputedParams,
  },
  props: {
    nodeIndex: { type: Number, required: true },
  },
  emits: ["close", "updateStaticNodeValue", "updateNestedGraph"],
  setup(props, ctx) {
    const store = useFlowStore();
    const graphAIStore = useGraphAIStore();

    const currentNode = computed<GUINodeData | undefined>(() => store.nodes[props.nodeIndex]);
    const agentProfile = computed<AgentProfile | typeof staticNodeParams | undefined>(() => {
      const node = currentNode.value;
      if (!node) return undefined;
      return node.type === "computed" ? agentProfiles[node.data.guiAgentId ?? ""] : staticNodeParams;
    });

    const headerAgentName = computed(() => {
      const node = currentNode.value;
      if (!node || node.type !== "computed") return "";
      return node.data.guiAgentId?.replace(/Agent$/, "") ?? "";
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
      ctx.emit("updateStaticNodeValue", { agentIndex: agentIndex.value, agent });
    };

    const onChangeNestedGraph = () => {
      const graph = graphAIStore.nestedGraphs[nestedGraphIndex.value];
      if (!graph) return;
      ctx.emit("updateNestedGraph", { nestedGraphIndex: nestedGraphIndex.value, nestedGraphId: graph.id });
    };

    // static/computed params editing
    const onUpdateStaticValue = (value: UpdateStaticValue) => {
      ctx.emit("updateStaticNodeValue", value);
    };

    const panelNodeIndex = computed(() => props.nodeIndex);

    return {
      store,
      graphAIStore,
      currentNode,
      agentProfile,
      headerAgentName,
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
