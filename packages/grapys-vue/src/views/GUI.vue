<script lang="ts">
import { defineComponent, computed, onMounted, ref, nextTick } from "vue";
import Node from "./Node.vue";
import Edge from "./Edge.vue";
import Loop from "./Loop.vue";

import AddNode from "./AddNode.vue";
import ContextEdgeMenu from "./ContextEdgeMenu.vue";
import ContextNodeMenu from "./ContextNodeMenu.vue";

import GraphRunner from "./GraphRunner.vue";
import TemplateGraph from "./TemplateGraph.vue";
import HideableJsonViewer from "./HideableJsonViewer.vue";

import { EdgeData, NodePosition, UpdateStaticValue } from "../utils/gui/type";

import { graphChat } from "../graph/chat_tinyswallow";

import { useNewEdge } from "../composable/gui";
import { graphToGUIData, guiEdgeData2edgeData, handleDownload } from "../utils/gui/utils";
import { GraphData } from "graphai";
import { useStore } from "../store";

export default defineComponent({
  components: {
    Node,
    Edge,
    Loop,
    AddNode,
    ContextEdgeMenu,
    ContextNodeMenu,
    GraphRunner,
    TemplateGraph,
    HideableJsonViewer,
  },
  setup() {
    const store = useStore();
    const contextEdgeMenu = ref();
    const contextNodeMenu = ref();

    const updateGraph = (graph: GraphData) => {
      const { rawEdge, rawNode, loop } = graphToGUIData(graph);
      store.initData(rawNode, rawEdge, loop);
    };
    updateGraph(graphChat);

    const setGraph = async (graph: GraphData) => {
      resetGraph();
      await nextTick(); // to reset edge position. Due to duplicate edge keys, the position will be incorrect.
      updateGraph(graph);
    };
    onMounted(() => {
      saveNodePosition();
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

    const resetGraph = () => {
      store.reset();
    };

    const save = () => {
      const dataStr = JSON.stringify(store.graphData);
      window.localStorage.setItem("GRAPHAIGUI", dataStr);
    };

    const load = () => {
      const data = window.localStorage.getItem("GRAPHAIGUI");
      try {
        if (data) {
          const graphData = JSON.parse(data);
          store.loadData(graphData.metadata.data);
        }
      } catch (error) {
        console.log(error);
      }
    };

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
      closeMenu,

      edgeConnectable,

      resetGraph,
      save,
      load,

      setGraph,
      handleDownload,
    };
  },
});
</script>

<template>
  <div>
    <div class="flex h-screen">
      <aside class="w-48 p-4 text-center">
        <h2 class="text-lg font-bold">Menu</h2>

        <AddNode />
        <hr />
        <button
          @click="store.undo"
          class="m-1 cursor-pointer items-center rounded-full px-4 py-2 font-bold text-white"
          :class="store.undoable ? 'bg-sky-500 hover:bg-sky-700' : 'bg-sky-200'"
        >
          Undo
        </button>
        <button
          @click="store.redo"
          class="m-1 cursor-pointer items-center rounded-full px-4 py-2 font-bold text-white"
          :class="store.redoable ? 'bg-sky-500 hover:bg-sky-700' : 'bg-sky-200'"
        >
          Redo
        </button>
        <hr />
        <div>
          <button @click="resetGraph" class="m-1 cursor-pointer items-center rounded-full bg-sky-500 px-4 py-2 font-bold text-white">Clear Graph</button>
        </div>
        <hr />

        <div>
          <button @click="save" class="m-1 cursor-pointer items-center rounded-full bg-sky-500 px-4 py-2 font-bold text-white">Save Graph</button>
        </div>
        <div>
          <button @click="load" class="m-1 cursor-pointer items-center rounded-full bg-sky-500 px-4 py-2 font-bold text-white">Load Graph</button>
        </div>
        <div>
          <button @click="() => handleDownload(store.graphData)" class="m-1 cursor-pointer items-center rounded-full bg-sky-500 px-4 py-2 font-bold text-white">
            Download
          </button>
        </div>
        <hr />
        <TemplateGraph @set-graph="setGraph" />
      </aside>
      <main class="flex-1">
        <div class="relative h-[100vh] overflow-hidden rounded-md border-4 border-gray-200" @click="closeMenu">
          <Loop />
          <svg x="0" y="0" class="pointer-events-none absolute h-[100%] w-full" ref="svgRef">
            <Edge
              v-for="(edge, index) in edgeDataList"
              :key="['edge', edge.source, edge.target, index].join('-')"
              :source-data="edge.source"
              :target-data="edge.target"
              class="pointer-events-auto"
              @dblclick="(e) => openEdgeMenu(e, index)"
            />
            <Edge
              v-if="newEdgeData"
              :source-data="newEdgeData.source"
              :target-data="newEdgeData.target"
              class="pointer-events-auto"
              :is-connectable="edgeConnectable"
            />
          </svg>
          <Node
            v-for="(node, index) in store.nodes"
            :key="[node.nodeId, index].join('-')"
            :node-index="index"
            :node-data="node"
            :nearest-data="nearestData"
            :is-connectable="edgeConnectable"
            @update-position="(pos) => updateNodePosition(index, pos)"
            @update-static-node-value="(value) => updateStaticNodeValue(index, value, true)"
            @update-nested-graph="(value) => updateNestedGraph(index, value)"
            @save-position="saveNodePosition"
            @new-edge-start="onNewEdgeStart"
            @new-edge="onNewEdge"
            @new-edge-end="onNewEdgeEnd"
            @open-node-menu="(event) => openNodeMenu(event, index)"
          />
          <ContextEdgeMenu ref="contextEdgeMenu" />
          <ContextNodeMenu ref="contextNodeMenu" />
        </div>
      </main>
    </div>
    <!-- <div>
      <GraphRunner />
    </div> -->
    <div class="absolute top-0 right-0 z-10 pr-4 pt-4 pb-4 flex flex-row justify-top items-start space-x-4">
      <HideableJsonViewer :json-data="store.graphData" width="400px" />
      <GraphRunner :graph-data="store.graphData" />
    </div>
    <!-- <div>
      <div class="text-left">
        <pre>
        {{ JSON.stringify(store.graphData, null, 2) }}
        </pre>
      </div>
    </div> -->
  </div>
</template>
