<template>
  <div class="text-left">
    NodeId:<input type="text" v-model="nodeId" class="w-full rounded-md border-2 border-gray-300 p-1 text-black" :class="isError ? 'border-red-600' : ''" />
    <select class="mt-2 w-full resize-none rounded-md border-2 border-gray-300 p-1 text-black" v-model="agent">
      <option>StaticNode</option>

      <optgroup :label="category" v-for="(category, categoryKey) in Object.keys(agentProfilesCategory)" :key="categoryKey">
        <option v-for="(agentName, agentKey) in Object.keys(agentProfilesCategory[category])" :key="agentKey">
          {{ agentName }}
        </option>
      </optgroup>
    </select>
  </div>
  <div>
    <button @click="addNode" class="m-1 cursor-pointer items-center rounded-full bg-sky-500 px-4 py-2 font-bold text-white hover:bg-sky-700">Add node</button>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from "vue";
import { useStore } from "../store";
import { agentProfilesCategory, agentProfiles } from "../utils/gui/data";
import { getDefaultParams } from "../utils/gui/utils";
// import { graphs } from "../graph";

export default defineComponent({
  components: {},
  setup() {
    const nodesKey = Object.keys(agentProfiles);
    const nodeId = ref("");
    const agent = ref(nodesKey[0]);
    const isError = ref(false);

    const store = useStore();

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
            ...(targetAgent.isNestedGraph || targetAgent.isMap ? { nestedGraphIndex: 0, nestedGraphId: store.nestedGraphs[0].id } : {}),
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
