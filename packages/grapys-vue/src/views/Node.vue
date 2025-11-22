<template>
  <NodeBase
    :inputs="inputs"
    :outputs="outputs"
    @open-node-menu="(e) => $emit('openNodeMenu', e)"
    @open-node-edit-menu="
      (e) => {
        if (outerMenu) {
          $emit('openNodeEditMenu', e);
        }
      }
    "
  >
    <template #header="{ nodeData: slotNodeData, expectNearNode }">
      <div class="w-full rounded-t-md py-1 text-center leading-none" :class="nodeHeaderClass(expectNearNode, slotNodeData)">
        {{ slotNodeData.nodeId }}
      </div>
      <div class="w-full py-1 text-center text-xs leading-none" v-if="slotNodeData.type === 'computed'" :class="nodeHeaderClass(expectNearNode, slotNodeData)">
        {{ slotNodeData.data.guiAgentId?.replace(/Agent$/, "") }}
      </div>
    </template>

    <template #body-head>
      <div v-if="agentProfile.agents && innerMenu">
        <select v-model="agentIndex" @change="updateAgentIndex">
          <option :value="key" v-for="(agent, key) in agentProfile.agents" :key="key">{{ agent }}</option>
        </select>
      </div>
    </template>

    <template #body-main="{ focusEvent, blurEvent }">
      <div class="flex w-full flex-col gap-1 p-2" v-if="nodeData.type === 'static' && innerMenu">
        <NodeStaticValue :node-data="nodeData" @focus-event="focusEvent" @blur-event="blurEvent" @update-static-value="updateStaticValue" />
      </div>
      <div class="flex w-full flex-col gap-1 p-2" v-if="nodeData.type === 'computed' && innerMenu">
        <NodeComputedParams :node-data="nodeData" @focus-event="focusEvent" @blur-event="blurEvent" :node-index="nodeIndex" />
      </div>
      <div class="flex w-full flex-col gap-1 p-2">
        <NodeResult :node-data="nodeData" />
      </div>
      <div v-if="(agentProfile.isNestedGraph || agentProfile.isMap) && innerMenu">
        <select v-model="nestedGraphIndex" @change="updateNestedGraphIndex">
          <option :value="key" v-for="(graph, key) in nestedGraphs" :key="key">{{ graph.name }}</option>
        </select>
      </div>
    </template>
  </NodeBase>
</template>

<script lang="ts">
import { defineComponent, ref, computed, PropType, watch } from "vue";
import { useStore } from "../store";
import type { GUINodeData, UpdateStaticValue } from "../utils/gui/type";
import { nestedGraphInputs } from "../utils/gui/utils";
import { agentProfiles, staticNodeParams } from "../utils/gui/data";
import { nodeHeaderClass } from "../package/utils/classUtils";

import NodeBase from "../package/components/NodeBase.vue";
import NodeStaticValue from "./NodeStaticValue.vue";
import NodeComputedParams from "./NodeComputedParams.vue";
import NodeResult from "./NodeResult.vue";

export default defineComponent({
  name: "Node",
  components: {
    NodeBase,
    NodeStaticValue,
    NodeComputedParams,
    NodeResult,
  },
  props: {
    nodeData: {
      type: Object as PropType<GUINodeData>,
      required: true,
    },
    nodeIndex: {
      type: Number,
      required: true,
    },
  },
  emits: ["updateStaticNodeValue", "updateNestedGraph", "openNodeMenu", "openNodeEditMenu"],
  setup(props, { emit }) {
    const store = useStore();

    // Agent profile
    const agentProfile = props.nodeData.type === "computed" ? agentProfiles[props.nodeData.data.guiAgentId ?? ""] : staticNodeParams;

    // State
    const innerMenu = ref(false);
    const outerMenu = ref(true);
    const agentIndex = ref(props.nodeData.data.agentIndex ?? 0);
    const nestedGraphIndex = ref(props.nodeData.data.nestedGraphIndex ?? 0);

    // Agent selection handlers
    const updateAgentIndex = () => {
      const agent = agentProfile?.agents?.[agentIndex.value];
      emit("updateStaticNodeValue", { agentIndex: agentIndex.value, agent });
    };

    watch(
      () => props.nodeData.data.agentIndex,
      (value) => {
        if (value !== undefined) {
          agentIndex.value = value;
        }
      },
    );

    // Nested graph handlers
    const nestedGraph = computed(() => {
      return store.nestedGraphs[nestedGraphIndex.value];
    });

    const updateNestedGraphIndex = () => {
      emit("updateNestedGraph", { nestedGraphIndex: nestedGraphIndex.value, nestedGraphId: nestedGraph.value.id });
    };

    watch(
      () => props.nodeData.data.nestedGraphIndex,
      (value) => {
        if (value !== undefined) {
          nestedGraphIndex.value = value;
        }
      },
    );

    // Static value update handler
    const updateStaticValue = (value: UpdateStaticValue) => {
      emit("updateStaticNodeValue", value);
    };

    // Inputs/outputs computation
    const inputs = computed(() => {
      if (agentProfile.isNestedGraph) {
        return nestedGraphInputs(nestedGraph.value.graph).map((inp) => {
          return {
            ...inp,
            key: [nestedGraph.value.id, inp.name].join("-"),
          };
        });
      }
      return agentProfile.inputs;
    });

    const outputs = computed(() => {
      if (agentProfile.isNestedGraph) {
        return nestedGraph.value.graph?.metadata?.forNested?.outputs ?? agentProfile.outputs;
      }
      return agentProfile.outputs;
    });

    return {
      // State
      innerMenu,
      outerMenu,
      agentProfile,
      agentIndex,
      nestedGraphIndex,

      // Computed
      inputs,
      outputs,
      nestedGraph,
      nestedGraphs: store.nestedGraphs,

      // Handlers
      updateAgentIndex,
      updateNestedGraphIndex,
      updateStaticValue,

      // Helper classes
      nodeHeaderClass,
    };
  },
});
</script>
