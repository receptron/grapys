<script lang="ts">
import { defineComponent, computed, ref } from "vue";
import GraphRunner from "./GraphRunner.vue";
import SideMenu from "./SideMenu.vue";
import GraphCanvas from "./GraphCanvas.vue";

import { graphChat } from "../graph/chat_tinyswallow";
import { useStore } from "../store";

export default defineComponent({
  components: {
    SideMenu,
    GraphRunner,
    GraphCanvas,
  },
  setup() {
    const store = useStore();
    store.initFromGraphData(graphChat);

    // View mode: graph/split/json
    const viewMode = ref<"graph" | "split" | "json">("graph");
    const showChat = ref(false);

    // NOTE: view visibility is determined directly from viewMode in template

    // Pretty JSON text
    const prettyJsonText = computed(() => JSON.stringify(store.graphData, null, 2));

    return {
      store,

      viewMode,
      showChat,

      prettyJsonText,
    };
  },
});
</script>

<template>
  <div class="overflow-x-hidden">
    <div class="flex h-screen w-full overflow-x-hidden">
      <aside class="w-48 p-4 text-center">
        <SideMenu />
      </aside>
      <main class="flex-1 relative h-screen overflow-hidden">
        <!-- Top-right controls -->
        <div class="pointer-events-none absolute top-0 right-0 z-10 flex max-h-screen flex-col items-end space-y-4 pt-4 pr-4 pb-4">
          <div class="flex flex-row items-start space-x-2">
            <!-- View mode switch -->
            <div class="pointer-events-auto inline-flex overflow-hidden rounded-full border border-gray-300 bg-white text-sm text-gray-700 shadow-sm">
              <button
                class="px-4 py-2 hover:bg-gray-100"
                :class="{ 'bg-gray-200 font-semibold': viewMode === 'graph' }"
                @click="viewMode = 'graph'"
              >
                Graph
              </button>
              <button
                class="border-l border-gray-300 px-4 py-2 hover:bg-gray-100"
                :class="{ 'bg-gray-200 font-semibold': viewMode === 'split' }"
                @click="viewMode = 'split'"
              >
                Split
              </button>
              <button
                class="border-l border-gray-300 px-4 py-2 hover:bg-gray-100"
                :class="{ 'bg-gray-200 font-semibold': viewMode === 'json' }"
                @click="viewMode = 'json'"
              >
                JSON
              </button>
            </div>
            <!-- Chat toggle -->
            <button
              class="pointer-events-auto m-1 cursor-pointer items-center rounded-full border-1 border-gray-300 bg-gray-100 px-4 py-2 text-black"
              @click="showChat = !showChat"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z"
                />
              </svg>
            </button>
          </div>
          <div class="flex flex-row items-start space-x-4">
            <GraphRunner :class="{ hidden: !showChat }" :graph-data="store.graphData" :is-open="showChat" @close="showChat = false" />
          </div>
        </div>
        <!-- Content area: switch by mode -->
        <div class="h-full pt-16 overflow-hidden min-h-0">
          <!-- Graph only -->
          <div v-if="viewMode === 'graph'" class="h-full w-full">
            <GraphCanvas />
          </div>

          <!-- Split: left graph / right JSON -->
          <div v-else-if="viewMode === 'split'" class="grid h-full w-full grid-cols-2 min-h-0">
            <!-- Left: graph area -->
            <div class="h-full w-full min-h-0">
              <GraphCanvas />
            </div>
            <!-- Right: JSON text area -->
            <div class="h-full w-full min-h-0">
              <div class="h-full w-full overflow-hidden rounded-md border-4 border-gray-200 bg-white box-border min-h-0">
                <pre class="h-full w-full p-4 font-mono text-xs whitespace-pre break-words overflow-auto">{{ prettyJsonText }}</pre>
              </div>
            </div>
          </div>

          <!-- JSON only -->
          <div v-else class="h-full w-full">
            <div class="h-full w-full overflow-hidden rounded-md border-4 border-gray-200 bg-white box-border">
              <pre class="h-full w-full p-4 font-mono text-xs whitespace-pre break-words overflow-auto">{{ prettyJsonText }}</pre>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>
