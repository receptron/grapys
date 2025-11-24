<template>
  <h2 class="text-left font-bold">Add Node</h2>
  <div class="text-left">
    <label class="mb-0.5 block text-xs text-gray-600">Node Name (custom ID):</label>
    <input
      type="text"
      v-model="nodeId"
      class="mb-1 w-full rounded-md border-2 border-gray-300 px-2 py-1 text-sm text-black"
      :class="isError ? 'border-red-600' : ''"
      placeholder="Enter Node name..."
    />

    <label class="mb-0.5 block text-xs text-gray-600">Select agent type:</label>
    <select class="mb-1 w-full resize-none rounded-md border-2 border-gray-300 px-2 py-1 text-black" v-model="agent">
      <option>StaticNode</option>

      <optgroup :label="category" v-for="(category, categoryKey) in Object.keys(agentProfilesCategory)" :key="categoryKey">
        <option v-for="(agentName, agentKey) in Object.keys(agentProfilesCategory[category])" :key="agentKey">
          {{ agentName }}
        </option>
      </optgroup>
    </select>
  </div>
  <div>
    <SideMenuButton @click="addNode"> Add node </SideMenuButton>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from "vue";
import { useFlowStore } from "vueweave";
import { useGraphAIStore } from "../store/graphai";
import { agentProfilesCategory, agentProfiles } from "../utils/gui/data";
import { getDefaultParams } from "../utils/gui/utils";
import SideMenuButton from "../components/SideMenuButton.vue";
// import { graphs } from "../graph";

export default defineComponent({
  components: { SideMenuButton },
  setup() {
    const nodesKey = Object.keys(agentProfiles);
    const nodeId = ref("");
    const agent = ref(nodesKey[0]);
    const isError = ref(false);

    const store = useFlowStore();
    const graphAIStore = useGraphAIStore();

    watch(nodeId, () => {
      isError.value = false;
    });

    const addNode = () => {
      if (nodeId.value === "") {
        isError.value = true;
        return;
      }
      if (store.nodeRecords[nodeId.value]) {
        isError.value = true;
        return;
      }

      const isStatic = agent.value === "StaticNode";
      const targetAgent = agentProfiles[agent.value] ?? {};
      const params = getDefaultParams(targetAgent.params ?? []);

      const data = isStatic
        ? {}
        : {
            agent: targetAgent.agents ? targetAgent.agents[0] : targetAgent.agent,
            guiAgentId: agent.value,
            params,
            ...(targetAgent.agents ? { agentIndex: 0 } : {}),
            ...(targetAgent.isNestedGraph || targetAgent.isMap ? { nestedGraphIndex: 0, nestedGraphId: graphAIStore.nestedGraphs?.[0]?.id } : {}),
          };

      store.pushNode({
        data,
        nodeId: nodeId.value,
        type: isStatic ? "static" : "computed",
        position: { x: Math.random() * 200, y: Math.random() * 200 },
      });

      nodeId.value = "";
    };
    return {
      addNode,
      agentProfilesCategory,
      nodesKey,
      nodeId,
      agent,

      isError,
    };
  },
});
</script>
