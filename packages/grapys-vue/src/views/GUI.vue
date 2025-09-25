<script lang="ts">
import { defineComponent, computed, onMounted, ref, nextTick } from "vue";

import NodeEditorPanel from "./NodeEditorPanel.vue";
import GraphCanvas from "./GraphCanvas.vue";

import GraphRunner from "./GraphRunner.vue";
import JsonViewer from "./JsonViewer.vue";

import SideMenu from "./SideMenu.vue";

import { UpdateStaticValue } from "../utils/gui/type";

import { graphChat } from "../graph/chat_tinyswallow";

import { useKeyboardShortcuts } from "../composable/useKeyboardShortcuts";
import { useStore } from "../store";

export default defineComponent({
  components: {
    SideMenu,
    NodeEditorPanel,
    GraphRunner,
    JsonViewer,
    GraphCanvas,
  },
  setup() {
    const store = useStore();
    const selectedNodeIndex = ref<number | null>(null);
    const isNodeEditorOpen = computed(() => selectedNodeIndex.value !== null);
    const panelKey = ref(0);
    store.initFromGraphData(graphChat);

    const graphRunnerRef = ref();
    const { addShortcut } = useKeyboardShortcuts();

    const viewerMode = ref<string>("graph");

    onMounted(() => {
      // Run GraphRunner: Ctrl + R
      addShortcut({
        combo: "ctrl+r",
        handler: () => {
          nextTick(() => {
            try {
              graphRunnerRef.value?.run?.();
            } catch (error) {
              console.error(error);
            }
          });
        },
      });

      // Toggle Chat Viewer: Cmd/Ctrl + L
      addShortcut({
        combo: "mod+l",
        handler: () => {
          showChat.value = !showChat.value;
        },
      });

      // Undo: Cmd/Ctrl + Z
      addShortcut({
        combo: "mod+z",
        handler: () => {
          if (store.undoable) {
            store.undo();
          }
        },
      });

      // Redo: Cmd/Ctrl + Shift + Z
      addShortcut({
        combo: "mod+shift+z",
        handler: () => {
          if (store.redoable) {
            store.redo();
          }
        },
      });
    });

    const updateStaticNodeValue = (index: number, value: UpdateStaticValue, saveHistory: boolean) => {
      store.updateStaticNodeValue(index, value, saveHistory);
    };
    const updateNestedGraph = (index: number, value: UpdateStaticValue) => {
      store.updateNestedGraph(index, value);
    };

    const openNodeEditor = (nodeIndex: number) => {
      // remount only if different node is clicked
      if (selectedNodeIndex.value === nodeIndex) return;
      selectedNodeIndex.value = nodeIndex;
      panelKey.value += 1;
    };

    const showChat = ref(false);

    const switchViewerMode = () => {
      viewerMode.value = viewerMode.value === "graph" ? "json" : "graph";
    };

    return {
      updateStaticNodeValue,
      updateNestedGraph,

      store,

      openNodeEditor,

      showChat,
      selectedNodeIndex,
      isNodeEditorOpen,
      panelKey,

      graphRunnerRef,
      viewerMode,
      switchViewerMode,
    };
  },
});
</script>

<template>
  <div>
    <div class="flex h-screen">
      <aside class="w-48 p-4 text-center">
        <SideMenu />
      </aside>
      <main class="flex-1">
        <GraphCanvas v-if="viewerMode === 'graph'" @open-node-editor="openNodeEditor" />
        <JsonViewer v-if="viewerMode === 'json'" :json-data="store.graphData" />
        <div class="h-100vh pointer-events-none absolute top-0 right-0 z-10 flex max-h-screen flex-col items-end space-y-4 pt-4 pr-4 pb-4">
          <div class="flex flex-row items-start space-x-4">
            <button
              class="pointer-events-auto m-1 cursor-pointer items-center rounded-full border-1 border-gray-300 bg-gray-100 px-4 py-2 text-black"
              @click="switchViewerMode"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M14.25 9.75 16.5 12l-2.25 2.25m-4.5 0L7.5 12l2.25-2.25M6 20.25h12A2.25 2.25 0 0 0 20.25 18V6A2.25 2.25 0 0 0 18 3.75H6A2.25 2.25 0 0 0 3.75 6v12A2.25 2.25 0 0 0 6 20.25Z"
                />
              </svg>
            </button>
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
            <NodeEditorPanel
              :key="panelKey"
              v-if="isNodeEditorOpen"
              :node-index="selectedNodeIndex as number"
              @close="selectedNodeIndex = null"
              @update-static-node-value="(v: UpdateStaticValue) => updateStaticNodeValue(selectedNodeIndex as number, v, true)"
              @update-nested-graph="(v: UpdateStaticValue) => updateNestedGraph(selectedNodeIndex as number, v)"
            />
            <GraphRunner ref="graphRunnerRef" :class="{ hidden: !showChat }" :graph-data="store.graphData" @close="showChat = false" />
          </div>
        </div>
      </main>
    </div>
  </div>
</template>
