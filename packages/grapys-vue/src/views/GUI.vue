<script lang="ts">
import { defineComponent, computed, onMounted, onBeforeUnmount, ref } from "vue";
import Node2 from "./Node2.vue";
import NodeEditorPanel from "./NodeEditorPanel.vue";
import Edge from "./Edge.vue";
import Loop from "./Loop.vue";

import ContextEdgeMenu from "./ContextEdgeMenu.vue";
import ContextNodeMenu from "./ContextNodeMenu.vue";

import GraphRunner from "./GraphRunner.vue";
import JsonViewer from "./JsonViewer.vue";

import SideMenu from "./SideMenu.vue";

import { EdgeData, NodePosition, UpdateStaticValue } from "../utils/gui/type";

import { graphChat } from "../graph/chat_tinyswallow";

import { useNewEdge } from "../composable/gui";
import { usePanAndScroll } from "../composable/usePanAndScroll";
import { guiEdgeData2edgeData } from "../utils/gui/utils";
import { useStore } from "../store";

export default defineComponent({
  components: {
    SideMenu,
    Node2,
    Edge,
    Loop,
    ContextEdgeMenu,
    ContextNodeMenu,
    NodeEditorPanel,
    GraphRunner,
    JsonViewer,
  },
  setup() {
    const store = useStore();
    const contextEdgeMenu = ref();
    const contextNodeMenu = ref();
    const selectedNodeIndex = ref<number | null>(null);
    const isNodeEditorOpen = computed(() => selectedNodeIndex.value !== null);
    const panelKey = ref(0);
    const mainContainer = ref();
    store.initFromGraphData(graphChat);

    // ノードドラッグ状態の管理
    const isNodeDragging = ref(false);

    const handleNodeDragStart = () => {
      isNodeDragging.value = true;
    };

    const handleNodeDragEnd = () => {
      isNodeDragging.value = false;
    };

    onMounted(() => {
      saveNodePosition();
      setupPanAndScroll();
    });

    // Global keyboard shortcuts: Undo / Redo
    const isEditableTarget = (target: EventTarget | null): boolean => {
      const element = target as HTMLElement | null;
      if (!element) return false;
      const tag = element.tagName;
      return tag === "INPUT" || tag === "TEXTAREA" || element.isContentEditable === true;
    };

    const uaDataPlatform = (navigator as any).userAgentData?.platform as string | undefined;
    const isMac = uaDataPlatform ? /mac|ios/i.test(uaDataPlatform) : /(Mac|iPhone|iPod|iPad)/i.test(navigator.userAgent);
    const handleKeydown = (event: KeyboardEvent) => {
      if (isEditableTarget(event.target)) return;

      const mod = isMac ? event.metaKey : event.ctrlKey;
      if (!mod) return;

      // Undo: Cmd/Ctrl + Z (without Shift)
      if (event.key.toLowerCase() === "z" && !event.shiftKey) {
        event.preventDefault();
        if (store.undoable) {
          store.undo();
        }
        return;
      }

      // Redo: Cmd/Ctrl + Shift + Z
      if (event.key.toLowerCase() === "z" && event.shiftKey) {
        event.preventDefault();
        if (store.redoable) {
          store.redo();
        }
        return;
      }
    };

    onMounted(() => {
      window.addEventListener("keydown", handleKeydown);
    });

    onBeforeUnmount(() => {
      window.removeEventListener("keydown", handleKeydown);
    });

    const updateNodePosition = (index: number, pos: NodePosition) => {
      store.updateNodePosition(index, pos);
    };
    const saveNodePosition = () => {
      store.saveNodePositionData();
    };
    const updateStaticNodeValue = (index: number, value: UpdateStaticValue, saveHistory: boolean) => {
      store.updateStaticNodeValue(index, value, saveHistory);
    };
    const updateNestedGraph = (index: number, value: UpdateStaticValue) => {
      store.updateNestedGraph(index, value);
    };

    const edgeDataList = computed<EdgeData[]>(() => {
      return guiEdgeData2edgeData(store.edges, store.nodeRecords);
    });

    const { svgRef, newEdgeData, onNewEdgeStart, onNewEdge, onNewEdgeEnd, nearestData, edgeConnectable } = useNewEdge();

    // パン（掴んで動かす）とスクロール機能のセットアップ
    const { setupPanAndScroll } = usePanAndScroll(mainContainer, isNodeDragging, newEdgeData);

    const openEdgeMenu = (event: MouseEvent, edgeIndex: number) => {
      const rect = svgRef.value.getBoundingClientRect();
      contextEdgeMenu.value.openMenu(event, rect, edgeIndex);
    };
    const closeMenu = () => {
      contextEdgeMenu.value.closeMenu();
      contextNodeMenu.value.closeMenu();
    };
    const openNodeMenu = (event: MouseEvent, nodeIndex: number) => {
      const rect = svgRef.value.getBoundingClientRect();
      contextNodeMenu.value.openMenu(event, rect, nodeIndex);
    };
    const openNodeEditor = (_event: MouseEvent, nodeIndex: number) => {
      // remount only if different node is clicked
      if (selectedNodeIndex.value === nodeIndex) return;
      selectedNodeIndex.value = nodeIndex;
      panelKey.value += 1;
    };

    const showJsonView = ref(false);
    const showChat = ref(false);

    return {
      updateNodePosition,
      saveNodePosition,
      updateStaticNodeValue,
      updateNestedGraph,

      store,

      edgeDataList,
      onNewEdgeStart,
      onNewEdge,
      onNewEdgeEnd,
      newEdgeData,
      svgRef,
      nearestData,

      contextEdgeMenu,
      contextNodeMenu,
      openEdgeMenu,
      openNodeMenu,
      openNodeEditor,
      closeMenu,

      edgeConnectable,

      showJsonView,
      showChat,
      mainContainer,
      selectedNodeIndex,
      isNodeEditorOpen,
      panelKey,

      handleNodeDragStart,
      handleNodeDragEnd,
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
        <div
          ref="mainContainer"
          class="relative overflow-auto rounded-md border-4 border-gray-200"
          style="width: calc(100vw - 192px); height: calc(100vh - 40px)"
          @click="closeMenu"
        >
          <div class="relative" style="width: 2000px; height: 1500px">
            <Loop />
            <svg x="0" y="0" class="pointer-events-none absolute h-full w-full" ref="svgRef">
              <Edge
                v-for="(edge, index) in edgeDataList"
                :key="['edge', edge.source, edge.target, index].join('-')"
                :source-data="edge.source"
                :target-data="edge.target"
                class="pointer-events-auto"
                @dblclick="(e: MouseEvent) => openEdgeMenu(e, index)"
              />
              <Edge
                v-if="newEdgeData"
                :source-data="newEdgeData.source"
                :target-data="newEdgeData.target"
                class="pointer-events-auto"
                :is-connectable="edgeConnectable"
              />
            </svg>
            <Node2
              v-for="(node, index) in store.nodes"
              :key="[node.nodeId, index].join('-')"
              :node-index="index"
              :node-data="node"
              :nearest-data="nearestData"
              :is-connectable="edgeConnectable"
              @update-position="(pos: NodePosition) => updateNodePosition(index, pos)"
              @update-static-node-value="updateStaticNodeValue(index, $event, true)"
              @update-nested-graph="updateNestedGraph(index, $event)"
              @save-position="saveNodePosition"
              @new-edge-start="onNewEdgeStart"
              @new-edge="onNewEdge"
              @new-edge-end="onNewEdgeEnd"
              @open-node-menu="(e: MouseEvent) => openNodeMenu(e, index)"
              @open-node-edit-menu="(e: MouseEvent) => openNodeEditor(e, index)"
              @node-drag-start="handleNodeDragStart"
              @node-drag-end="handleNodeDragEnd"
            />
            <ContextEdgeMenu ref="contextEdgeMenu" />
            <ContextNodeMenu ref="contextNodeMenu" />
          </div>
        </div>
        <div class="h-100vh pointer-events-none absolute top-0 right-0 z-10 flex max-h-screen flex-col items-end space-y-4 pt-4 pr-4 pb-4">
          <div class="flex flex-row items-start space-x-4">
            <button
              class="pointer-events-auto m-1 cursor-pointer items-center rounded-full border-1 border-gray-300 bg-gray-100 px-4 py-2 text-black"
              @click="showJsonView = !showJsonView"
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
            <JsonViewer v-if="showJsonView" :json-data="store.graphData" :is-open="showJsonView" @close="showJsonView = false" />
            <GraphRunner :class="{ hidden: !showChat }" :graph-data="store.graphData" :is-open="showChat" @close="showChat = false" />
            <NodeEditorPanel
              :key="panelKey"
              :is-open="isNodeEditorOpen"
              v-if="isNodeEditorOpen"
              :node-index="selectedNodeIndex as number"
              @close="selectedNodeIndex = null"
              @update-static-node-value="(v: UpdateStaticValue) => updateStaticNodeValue(selectedNodeIndex as number, v, true)"
              @update-nested-graph="(v: UpdateStaticValue) => updateNestedGraph(selectedNodeIndex as number, v)"
            />
          </div>
        </div>
      </main>
    </div>
  </div>
</template>
