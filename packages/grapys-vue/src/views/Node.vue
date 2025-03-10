<template>
  <div
    class="absolute flex w-36 cursor-grab flex-col rounded-md text-center text-white select-none"
    :class="nodeMainClass(expectNearNode, nodeData)"
    :style="transform"
    ref="thisRef"
    @mousedown="onStartNode"
    @touchstart="onStartNode"
  >
    <div @dblclick="(e) => openNodeMenu(e)">
      <div class="w-full rounded-t-md py-1 text-center leading-none" :class="nodeHeaderClass(expectNearNode, nodeData)">
        {{ nodeData.nodeId }}
      </div>
      <div class="w-full py-1 text-center text-xs leading-none" v-if="nodeData.type === 'computed'" :class="nodeHeaderClass(expectNearNode, nodeData)">
        {{ nodeData.data.guiAgentId?.replace(/Agent$/, "") }}
      </div>
    </div>
    <div v-if="agentProfile.agents">
      <select v-model="agentIndex" @change="updateAgentIndex">
        <option :value="key" v-for="(agent, key) in agentProfile.agents" :key="key">{{ agent }}</option>
      </select>
    </div>
    <div class="mt-1 flex flex-col items-end">
      <div v-for="(output, index) in agentProfile.outputs" :key="['out', output.name, index].join('-')" class="relative flex items-center" ref="outputsRef">
        <span class="mr-2 text-xs whitespace-nowrap">{{ output.name }}</span>
        <div
          class="absolute right-[-10px] h-4 w-4 min-w-[12px] rounded-full"
          :class="nodeOutputClass(isExpectNearButton('inbound', index), nodeData)"
          @mousedown="(e) => onStartEdge(e, 'outbound', index)"
          @touchstart="(e) => onStartEdge(e, 'outbound', index)"
        ></div>
      </div>
    </div>

    <div class="mt-1 mb-1 flex flex-col items-start">
      <div
        v-for="(input, index) in inputs"
        :key="['in', input.name, index, nestedGraph?.id ?? ''].join('-')"
        class="relative flex items-center"
        ref="inputsRef"
      >
        <div
          class="absolute left-[-10px] h-4 w-4 min-w-[12px] rounded-full"
          :class="nodeInputClass(isExpectNearButton('outbound', index), nodeData)"
          @mousedown="(e) => onStartEdge(e, 'inbound', index)"
          @touchstart="(e) => onStartEdge(e, 'inbound', index)"
        ></div>
        <span class="ml-2 text-xs whitespace-nowrap">{{ input.name }}</span>
      </div>
    </div>
    <div class="flex w-full flex-col gap-1 p-2" v-if="nodeData.type === 'static'">
      <NodeStaticValue :node-data="nodeData" @focus-event="focusEvent" @blur-event="blurEvent" @update-static-value="updateStaticValue" />
    </div>
    <div class="flex w-full flex-col gap-1 p-2" v-if="nodeData.type === 'computed'">
      <NodeComputedParams :node-data="nodeData" @focus-event="focusEvent" @blur-event="blurEvent" :node-index="nodeIndex" />
    </div>
    <div class="flex w-full flex-col gap-1 p-2">
      <NodeResult :node-data="nodeData" />
    </div>
    <div v-if="agentProfile.isNestedGraph || agentProfile.isMap">
      <select v-model="nestedGraphIndex" @change="updateNestedGraphIndex">
        <option :value="key" v-for="(graph, key) in nestedGraphs" :key="key">{{ graph.name }}</option>
      </select>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watchEffect, computed, PropType, onMounted, watch } from "vue";
import { useStore } from "../store";
import type { GUINodeData, GUINearestData, NewEdgeEventDirection, UpdateStaticValue } from "../utils/gui/type";
import { getClientPos, getNodeSize, getTransformStyle, nestedGraphInputs } from "../utils/gui/utils";
import { agentProfiles, staticNodeParams } from "../utils/gui/data";
import { nodeMainClass, nodeHeaderClass, nodeOutputClass, nodeInputClass } from "../utils/gui/classUtils";
// import { graphs } from "../graph";

import NodeStaticValue from "./NodeStaticValue.vue";
import NodeComputedParams from "./NodeComputedParams.vue";
import NodeResult from "./NodeResult.vue";

export default defineComponent({
  components: {
    NodeStaticValue,
    NodeComputedParams,
    NodeResult,
  },
  props: {
    nodeData: {
      type: Object as PropType<GUINodeData>,
      required: true,
    },
    nearestData: {
      type: Object as PropType<GUINearestData>,
      default: undefined,
    },
    nodeIndex: {
      type: Number,
      required: true,
    },
  },
  emits: ["updatePosition", "savePosition", "newEdgeStart", "newEdge", "newEdgeEnd", "updateStaticNodeValue", "openNodeMenu"],
  setup(props, ctx) {
    const store = useStore();

    const agentProfile = props.nodeData.type === "computed" ? agentProfiles[props.nodeData.data.guiAgentId ?? ""] : staticNodeParams;

    const thisRef = ref<HTMLElement | null>(null);
    const inputsRef = ref<HTMLElement[]>([]);
    const outputsRef = ref<HTMLElement[]>([]);

    const isDragging = ref(false);
    const isNewEdge = ref(false);
    const offset = ref({ x: 0, y: 0 });

    const agentIndex = ref(props.nodeData.data.agentIndex ?? 0);
    const nestedGraphIndex = ref(0);

    const startPosition = { x: 0, y: 0 };
    // If it moves only a little, the data will not be saved because it stack much more histories.
    let deltaDistance = 0; // square
    const deltaDistanceThredhold = 4;

    const onStartNode = (event: MouseEvent | TouchEvent) => {
      if (isNewEdge.value) {
        return;
      }
      isDragging.value = true;
      const { clientX, clientY } = getClientPos(event);
      const position = props.nodeData.position;
      offset.value.x = clientX - position.x;
      offset.value.y = clientY - position.y;

      // for update detection
      startPosition.x = position.x;
      startPosition.y = position.y;
      deltaDistance = 0;
    };

    // some time inputsRef/outputsRef order is broken when nestedGraph change.
    const sortedInputs = computed(() => {
      return inputsRef.value.sort((a, b) => (a.getBoundingClientRect().top > b.getBoundingClientRect().top ? 1 : -1));
    });
    const sortedOutputs = computed(() => {
      return outputsRef.value.sort((a, b) => (a.getBoundingClientRect().top > b.getBoundingClientRect().top ? 1 : -1));
    });
    const getWH = () => {
      return getNodeSize(thisRef.value, sortedInputs.value, sortedOutputs.value);
    };
    onMounted(() => {
      ctx.emit("updatePosition", getWH());
    });

    const onMoveNode = (event: MouseEvent | TouchEvent) => {
      if (!isDragging.value) return;
      const { clientX, clientY } = getClientPos(event);
      const x = clientX - offset.value.x;
      const y = clientY - offset.value.y;
      const newPosition = { ...getWH(), x, y };
      ctx.emit("updatePosition", newPosition);
      deltaDistance = (startPosition.x - x) ** 2 + (startPosition.y - y) ** 2;
    };

    const onEndNode = () => {
      isDragging.value = false;
      if (deltaDistance > deltaDistanceThredhold) {
        ctx.emit("savePosition");
      }
    };

    // edge event
    const onStartEdge = (event: MouseEvent | TouchEvent, direction: NewEdgeEventDirection, index: number) => {
      isNewEdge.value = true;
      const { clientX, clientY } = getClientPos(event);
      ctx.emit("newEdgeStart", {
        nodeId: props.nodeData.nodeId,
        x: clientX,
        y: clientY,
        index,
        direction,
      });
    };
    const onEndEdge = () => {
      isNewEdge.value = false;
      ctx.emit("newEdgeEnd");
    };
    const onMoveEdge = (event: MouseEvent | TouchEvent) => {
      if (!isNewEdge.value) return;
      const { clientX, clientY } = getClientPos(event);
      ctx.emit("newEdge", { x: clientX, y: clientY });
    };
    // end of edge event

    watchEffect((onCleanup) => {
      if (isDragging.value) {
        window.addEventListener("mousemove", onMoveNode);
        window.addEventListener("mouseup", onEndNode);
        window.addEventListener("touchmove", onMoveNode, { passive: false });
        window.addEventListener("touchend", onEndNode);
        onCleanup(() => {
          window.removeEventListener("mousemove", onMoveNode);
          window.removeEventListener("mouseup", onEndNode);
          window.removeEventListener("touchmove", onMoveNode);
          window.removeEventListener("touchend", onEndNode);
        });
      }
    });

    watchEffect((onCleanup) => {
      if (isNewEdge.value) {
        window.addEventListener("mousemove", onMoveEdge);
        window.addEventListener("mouseup", onEndEdge);
        window.addEventListener("touchmove", onMoveEdge, { passive: false });
        window.addEventListener("touchend", onEndEdge);
        onCleanup(() => {
          window.removeEventListener("mousemove", onMoveEdge);
          window.removeEventListener("mouseup", onEndEdge);
          window.removeEventListener("touchmove", onMoveEdge);
          window.removeEventListener("touchend", onEndEdge);
        });
      }
    });

    const transform = computed(() => {
      return getTransformStyle(props.nodeData, isDragging.value);

      // return `translate(${props.nodeData.position.x}px, ${props.nodeData.position.y}px)`;
    });
    const expectNearNode = computed(() => {
      return props.nodeData.nodeId === props.nearestData?.nodeId;
    });

    const isExpectNearButton = (direction: NewEdgeEventDirection, index: number) => {
      if (!expectNearNode.value) {
        return false;
      }
      return props.nearestData?.direction === direction && props.nearestData?.index === index;
    };

    let currentWidth = 0;
    let currentHeight = 0;
    const focusEvent = () => {
      if (thisRef.value) {
        currentWidth = thisRef.value.offsetWidth;
        currentHeight = thisRef.value.offsetHeight;
        thisRef.value.style.width = currentWidth * 3 + "px";
        thisRef.value.style.height = currentHeight * 3 + "px";
      }
      ctx.emit("updatePosition", getWH());
    };
    const blurEvent = () => {
      if (thisRef.value) {
        thisRef.value.style.width = currentWidth + "px";
        thisRef.value.style.height = currentHeight + "px";
      }
      ctx.emit("updatePosition", getWH());
    };
    const updateStaticValue = (value: UpdateStaticValue) => {
      ctx.emit("updateStaticNodeValue", value);
    };
    const openNodeMenu = (event: MouseEvent) => {
      ctx.emit("openNodeMenu", event);
    };
    const updateAgentIndex = () => {
      const agent = agentProfile?.agents?.[agentIndex.value];
      // this is not static node value, but it works
      ctx.emit("updateStaticNodeValue", { agentIndex: agentIndex.value, agent });
    };
    watch(
      () => props.nodeData.data.agentIndex,
      (value) => {
        if (value !== undefined) {
          agentIndex.value = value;
        }
      },
    );

    const nestedGraph = computed(() => {
      return store.nestedGraphs[nestedGraphIndex.value];
    });
    const updateNestedGraphIndex = (e) => {
      ctx.emit("updateStaticNodeValue", { nestedGraphIndex: nestedGraphIndex.value, nestedGraphId: nestedGraph.value.id });
      ctx.emit("updatePosition", getWH());
      // TODO remove Edge
    };

    const inputs = computed(() => {
      if (agentProfile.isNestedGraph) {
        // not map
        return nestedGraphInputs(nestedGraph.value.graph);
      } else {
        return agentProfile.inputs;
      }
    });

    return {
      focusEvent,
      blurEvent,

      transform,
      onStartNode,
      isDragging,
      agentProfile,
      thisRef,
      isNewEdge,
      onStartEdge,

      inputsRef,
      inputs,
      outputsRef,

      expectNearNode,
      isExpectNearButton,

      updateStaticValue,
      openNodeMenu,
      // helper
      nodeMainClass,
      nodeHeaderClass,
      nodeOutputClass,
      nodeInputClass,

      agentIndex,
      updateAgentIndex,

      nestedGraphs: store.nestedGraphs,
      nestedGraphIndex,
      nestedGraph,
      updateNestedGraphIndex,
    };
  },
});
</script>
