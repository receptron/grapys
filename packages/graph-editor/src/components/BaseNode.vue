<template>
  <div
    class="absolute flex w-36 cursor-grab flex-col rounded-md text-center text-white select-none"
    :class="nodeMainClass(expectNearNode, nodeData)"
    :style="transform"
    ref="thisRef"
    @mousedown="onStartNode"
    @touchstart="onStartNode"
    @dblclick="(e) => $emit('openNodeMenu', e)"
    @click="(e) => openNodeEditMenu(e)"
  >
    <!-- Header slot -->
    <slot name="header">
      <div class="w-full rounded-t-md py-1 text-center leading-none" :class="nodeHeaderClass(expectNearNode, nodeData)">
        {{ nodeData.nodeId }}
      </div>
    </slot>

    <!-- Output ports -->
    <div class="mt-1 flex flex-col items-end">
      <div v-for="(output, index) in outputs" :key="['out', output.name, index].join('-')" class="relative flex items-center" ref="outputsRef">
        <span class="mr-2 text-xs whitespace-nowrap">{{ output.name }}</span>
        <div
          class="absolute right-[-10px] h-4 w-4 min-w-[12px] rounded-full"
          :class="nodeOutputClass(isExpectNearButton('inbound', index), nodeData, isConnectable)"
          @click.stop
          @mousedown.stop.prevent="(e) => onStartEdge(e, 'outbound', index)"
          @touchstart.stop.prevent="(e) => onStartEdge(e, 'outbound', index)"
        ></div>
      </div>
    </div>

    <!-- Input ports -->
    <div class="mt-1 mb-1 flex flex-col items-start">
      <div v-for="(input, index) in inputs" :key="['in', input.name, index].join('-')" class="relative flex items-center" ref="inputsRef">
        <div
          class="absolute left-[-10px] h-4 w-4 min-w-[12px] rounded-full"
          :class="nodeInputClass(isExpectNearButton('outbound', index), nodeData, input, isConnectable)"
          @click.stop
          @mousedown.stop.prevent="(e) => onStartEdge(e, 'inbound', index)"
          @touchstart.stop.prevent="(e) => onStartEdge(e, 'inbound', index)"
        ></div>
        <span class="ml-2 text-xs whitespace-nowrap">{{ input.name }}</span>
      </div>
    </div>

    <!-- Body slot -->
    <div class="flex w-full flex-col gap-1 p-2">
      <slot name="body"></slot>
    </div>

    <!-- Footer slot -->
    <div class="flex w-full flex-col gap-1 p-2">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watchEffect, computed, PropType, onMounted } from "vue";
import type { GUINodeData, GUINearestData, NewEdgeEventDirection, PortDefinition } from "../types";
import { getClientPos, getNodeSize, getTransformStyle, nodeMainClass, nodeHeaderClass, nodeOutputClass, nodeInputClass } from "../utils";

export default defineComponent({
  name: "BaseNode",
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
    isConnectable: {
      type: Boolean,
      required: false,
      default: true,
    },
    inputs: {
      type: Array as PropType<PortDefinition[]>,
      default: () => [],
    },
    outputs: {
      type: Array as PropType<PortDefinition[]>,
      default: () => [],
    },
  },
  emits: [
    "updatePosition",
    "savePosition",
    "newEdgeStart",
    "newEdge",
    "newEdgeEnd",
    "openNodeMenu",
    "openNodeEditMenu",
    "nodeDragStart",
    "nodeDragEnd",
  ],
  setup(props, ctx) {
    const thisRef = ref<HTMLElement | null>(null);
    const inputsRef = ref<HTMLElement[]>([]);
    const outputsRef = ref<HTMLElement[]>([]);

    const isDragging = ref(false);
    const isNewEdge = ref(false);
    const offset = ref({ x: 0, y: 0 });

    const startPosition = { x: 0, y: 0 };
    let deltaDistance = 0;
    const deltaDistanceThreshold = 4;

    const onStartNode = (event: MouseEvent | TouchEvent) => {
      if (isNewEdge.value) {
        return;
      }
      isDragging.value = true;
      ctx.emit("nodeDragStart");
      const { clientX, clientY } = getClientPos(event);
      const position = props.nodeData.position;
      offset.value.x = clientX - position.x;
      offset.value.y = clientY - position.y;

      startPosition.x = position.x;
      startPosition.y = position.y;
      deltaDistance = 0;
    };

    const sortedInputs = computed(() => {
      return [...inputsRef.value].sort((aa, bb) => (aa.getBoundingClientRect().top > bb.getBoundingClientRect().top ? 1 : -1));
    });

    const sortedOutputs = computed(() => {
      return [...outputsRef.value].sort((aa, bb) => (aa.getBoundingClientRect().top > bb.getBoundingClientRect().top ? 1 : -1));
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
      ctx.emit("nodeDragEnd");
      if (deltaDistance > deltaDistanceThreshold) {
        ctx.emit("savePosition");
      }
    };

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

    const openNodeEditMenu = (event: MouseEvent) => {
      if (isDragging.value || isNewEdge.value) return;
      if (deltaDistance > deltaDistanceThreshold) return;
      ctx.emit("openNodeEditMenu", event);
    };

    return {
      transform,
      onStartNode,
      isDragging,
      thisRef,
      isNewEdge,
      onStartEdge,

      inputsRef,
      outputsRef,

      expectNearNode,
      isExpectNearButton,

      openNodeEditMenu,

      // Helper functions
      nodeMainClass,
      nodeHeaderClass,
      nodeOutputClass,
      nodeInputClass,
    };
  },
});
</script>
