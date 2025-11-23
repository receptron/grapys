<template>
  <AddNode />

  <hr class="my-1 border-t border-gray-400" />
  <h2 class="text-left font-bold">History</h2>

  <div class="mb-1 flex space-x-1">
    <button
      @click="store.undo"
      :disabled="!store.undoable"
      class="flex-1 rounded-l-full px-2.5 py-2 text-sm font-medium text-white transition-colors duration-200"
      :class="store.undoable ? 'bg-sky-500 hover:bg-sky-700' : 'cursor-not-allowed bg-sky-200'"
    >
      Undo
    </button>
    <button
      @click="store.redo"
      :disabled="!store.redoable"
      class="flex-1 rounded-r-full px-2.5 py-2 text-sm font-medium text-white transition-colors duration-200"
      :class="store.redoable ? 'bg-sky-500 hover:bg-sky-700' : 'cursor-not-allowed bg-sky-200'"
    >
      Redo
    </button>
  </div>
  <hr class="my-1 border-t border-gray-400" />

  <SideMenuSaveFirebase v-if="enableFirebase && firebaseStore.isSignedIn" />
  <SideMenuSaveBrowser v-else />

  <hr class="my-1 border-t border-gray-400" />

  <TemplateGraph @set-graph="setGraph" />
  <hr class="my-1 border-t border-gray-400" />
  <h2 class="text-left font-bold">Download</h2>
  <div>
    <button
      @click="() => handleDownload(graphData)"
      class="mb-1 w-full cursor-pointer items-center rounded-full bg-sky-500 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700"
    >
      GraphData
    </button>
  </div>

  <hr class="my-1 border-t border-gray-400" />
  <div>
    <button
      @click="store.reset({ loop: { loopType: 'none' } })"
      class="mb-1 w-full cursor-pointer items-center rounded-full bg-red-400 px-4 py-2 text-sm font-medium text-white hover:bg-red-500"
    >
      Clear Graph
    </button>
  </div>
  <div>
    <div v-if="firebaseStore.isSignedIn">
      <button @click="logout" class="mb-1 w-full cursor-pointer items-center rounded-full bg-red-400 px-4 py-2 text-sm font-medium text-white hover:bg-red-500">
        Logout
      </button>
    </div>
    <div v-if="firebaseStore.isSignedIn === false">
      <GoogleSignin />
    </div>
  </div>

  <hr class="my-1 border-t border-gray-400" />
  <DataLoader />
  <hr class="my-1 border-t border-gray-400" />

  <h2 class="text-left font-bold">API Key</h2>
  <div class="text-left">OpenAI</div>
  <ApiKey key-name="OpenAI" storage-key="GRAPYS_OPENAI_KEY" />

  <div class="text-left">Anthropic</div>
  <ApiKey key-name="ANTHROPIC" storage-key="GRAPYS_ANTHROPIC_KEY" />

  <div class="text-left">Google</div>
  <ApiKey key-name="GoogleGenAI" storage-key="GRAPYS_GOOGLE_GENAI_KEY" />
</template>

<script lang="ts">
import { defineComponent, nextTick, computed } from "vue";
import type { GraphData } from "graphai";
import { useFlowStore } from "vueweave";
import { signOut } from "firebase/auth";

import { useGraphAIStore } from "../store/graphai";
import { useFirebaseStore } from "../store/firebase";
import { useNodeUpdate } from "../composable/useNodeUpdate";

import AddNode from "./AddNode.vue";
import SideMenuSaveBrowser from "./SideMenuSaveBrowser.vue";
import SideMenuSaveFirebase from "./SideMenuSaveFirebase.vue";
import DataLoader from "./DataLoader.vue";
import TemplateGraph from "./TemplateGraph.vue";
import ApiKey from "./ApiKey.vue";

import GoogleSignin from "../components/SigninButton.vue";
import { handleDownload } from "../utils/gui/utils";
import { auth } from "../utils/firebase/firebase";

import { enableFirebase } from "../config/project";

export default defineComponent({
  components: {
    AddNode,
    ApiKey,
    SideMenuSaveBrowser,
    SideMenuSaveFirebase,
    TemplateGraph,
    GoogleSignin,
    DataLoader,
  },
  setup() {
    const store = useFlowStore();
    const graphAIStore = useGraphAIStore();
    const firebaseStore = useFirebaseStore();
    const { initFromGraphData } = useNodeUpdate();

    const graphData = computed(() => {
      return graphAIStore.createGraphData(store.currentData);
    });

    const setGraph = async (graph: GraphData) => {
      store.reset({ loop: { loopType: "none" } });
      await nextTick(); // to reset edge position. Due to duplicate edge keys, the position will be incorrect.
      initFromGraphData(graph);
    };

    const logout = () => {
      if (window.confirm(`Really Logout??`)) {
        signOut(auth);
      }
    };

    return {
      store,
      firebaseStore,
      handleDownload,
      setGraph,
      enableFirebase,
      logout,
      graphData,
    };
  },
});
</script>
