<template>
  <div
    class="absolute flex w-36 cursor-grab flex-col rounded-md text-center text-white select-none"
    :class="nodeMainClass(expectNearNode, nodeData)"
    :style="transform"
    ref="thisRef"
    @mousedown="onStartNode"
    @touchstart="onStartNode"
    @dblclick="handleOpenNodeMenu"
    @click="(e) => openNodeEditMenu(e)"
  >
    <!-- HEAD -->
    <div>
      <slot name="header" :node-data="nodeData" :expect-near-node="expectNearNode"></slot>
    </div>

    <!-- Body -->
    <div>
      <!-- body head -->
      <div>
        <slot name="body-head" :node-data="nodeData"></slot>
      </div>

      <!-- right output -->
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

      <!-- left input -->
      <div class="mt-1 mb-1 flex flex-col items-start">
        <div v-for="(input, index) in inputs" :key="['in', input.key ?? input.name, index].join('-')" class="relative flex items-center" ref="inputsRef">
          <div
            class="absolute left-[-10px] h-4 w-4 min-w-[12px] rounded-full"
            :class="nodeInputClass(isExpectNearButton('outbound', index), nodeData, input as any, isConnectable)"
            @click.stop
            @mousedown.stop.prevent="(e) => onStartEdge(e, 'inbound', index)"
            @touchstart.stop.prevent="(e) => onStartEdge(e, 'inbound', index)"
          ></div>
          <span class="ml-2 text-xs whitespace-nowrap">{{ input.name }}</span>
        </div>
      </div>

      <!-- Body -->
      <div>
        <slot name="body-main" :node-data="nodeData" :focus-event="focusEvent" :blur-event="blurEvent"></slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watchEffect, computed, onMounted, inject } from "vue";
import type { NewEdgeEventDirection } from "../utils/type";
import { getClientPos, getNodeSize, getTransformStyle } from "../utils/gui";
import { nodeMainClass as defaultNodeMainClass, nodeHeaderClass as defaultNodeHeaderClass, nodeOutputClass as defaultNodeOutputClass, nodeInputClass as defaultNodeInputClass } from "../utils/classUtils";
import { NODE_STYLE_KEY } from "../utils/nodeStyles";
import { useNodeContext } from "../composable/useNodeContext";

// Props
interface Props {
  inputs: { name: string; key?: string }[];
  outputs: { name: string }[];
}

defineProps<Props>();

// Emits
const emit = defineEmits<{
  openNodeEditMenu: [event: MouseEvent];
}>();

// Node context
const nodeContext = useNodeContext();
const nodeData = computed(() => nodeContext.value.nodeData);
const nodeIndex = computed(() => nodeContext.value.nodeIndex);
const thisRef = ref<HTMLElement | null>(null);
const inputsRef = ref<HTMLElement[]>([]);
const outputsRef = ref<HTMLElement[]>([]);

// Inject style functions with defaults
const providedStyles = inject<{
  nodeMainClass?: typeof defaultNodeMainClass;
  nodeHeaderClass?: typeof defaultNodeHeaderClass;
  nodeOutputClass?: typeof defaultNodeOutputClass;
  nodeInputClass?: typeof defaultNodeInputClass;
}>(NODE_STYLE_KEY, {});
const nodeMainClass = providedStyles.nodeMainClass ?? defaultNodeMainClass;
const nodeOutputClass = providedStyles.nodeOutputClass ?? defaultNodeOutputClass;
const nodeInputClass = providedStyles.nodeInputClass ?? defaultNodeInputClass;

const isDragging = ref(false);
const isNewEdge = ref(false);
const offset = ref({ x: 0, y: 0 });

const startPosition = { x: 0, y: 0 };
// If it moves only a little, the data will not be saved because it stack much more histories.
let deltaDistance = 0; // square
const deltaDistanceThredhold = 4;

const onStartNode = (event: MouseEvent | TouchEvent) => {
  if (isNewEdge.value) {
    return;
  }
  isDragging.value = true;
  nodeContext.value.onNodeDragStart();
  const { clientX, clientY } = getClientPos(event);
  const position = nodeData.value.position;
  offset.value.x = clientX - position.x;
  offset.value.y = clientY - position.y;

  // for update detection
  startPosition.x = position.x;
  startPosition.y = position.y;
  deltaDistance = 0;
};

// some time inputsRef/outputsRef order is broken when nestedGraph change.
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
  const position = { ...getWH(), x: nodeData.value.position.x, y: nodeData.value.position.y };
  nodeContext.value.updatePosition(nodeIndex.value, position);
});

const onMoveNode = (event: MouseEvent | TouchEvent) => {
  if (!isDragging.value) return;
  const { clientX, clientY } = getClientPos(event);
  const x = clientX - offset.value.x;
  const y = clientY - offset.value.y;
  const newPosition = { ...getWH(), x, y };
  nodeContext.value.updatePosition(nodeIndex.value, newPosition);
  deltaDistance = (startPosition.x - x) ** 2 + (startPosition.y - y) ** 2;
};

const onEndNode = () => {
  isDragging.value = false;
  nodeContext.value.onNodeDragEnd();
  if (deltaDistance > deltaDistanceThredhold) {
    nodeContext.value.savePosition();
  }
};

// edge event
const onStartEdge = (event: MouseEvent | TouchEvent, direction: NewEdgeEventDirection, index: number) => {
  isNewEdge.value = true;
  const { clientX, clientY } = getClientPos(event);
  nodeContext.value.onNewEdgeStart({
    nodeId: nodeData.value.nodeId,
    x: clientX,
    y: clientY,
    index,
    direction,
  });
};
const onEndEdge = () => {
  isNewEdge.value = false;
  nodeContext.value.onNewEdgeEnd();
};
const onMoveEdge = (event: MouseEvent | TouchEvent) => {
  if (!isNewEdge.value) return;
  const { clientX, clientY } = getClientPos(event);
  nodeContext.value.onNewEdge({ x: clientX, y: clientY });
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
  return getTransformStyle(nodeData.value, isDragging.value);
});
const expectNearNode = computed(() => {
  return nodeData.value.nodeId === nodeContext.value.nearestData?.nodeId;
});

const isExpectNearButton = (direction: NewEdgeEventDirection, index: number) => {
  if (!expectNearNode.value) {
    return false;
  }
  return nodeContext.value.nearestData?.direction === direction && nodeContext.value.nearestData?.index === index;
};

const isConnectable = computed(() => nodeContext.value.isConnectable);

let currentWidth = 0;
let currentHeight = 0;
const focusEvent = () => {
  if (thisRef.value) {
    currentWidth = thisRef.value.offsetWidth;
    currentHeight = thisRef.value.offsetHeight;
    thisRef.value.style.width = currentWidth * 3 + "px";
    thisRef.value.style.height = currentHeight * 3 + "px";
    thisRef.value.style.zIndex = "100";
  }
  const position = { ...getWH(), x: nodeData.value.position.x, y: nodeData.value.position.y };
  nodeContext.value.updatePosition(nodeIndex.value, position);
};
const blurEvent = () => {
  if (thisRef.value) {
    thisRef.value.style.width = currentWidth + "px";
    thisRef.value.style.height = currentHeight + "px";
    thisRef.value.style.zIndex = "auto";
  }
  const position = { ...getWH(), x: nodeData.value.position.x, y: nodeData.value.position.y };
  nodeContext.value.updatePosition(nodeIndex.value, position);
};
const openNodeEditMenu = (event: MouseEvent) => {
  if (isDragging.value || isNewEdge.value) return;
  if (deltaDistance > deltaDistanceThredhold) return;
  emit("openNodeEditMenu", event);
};
const handleOpenNodeMenu = (event: MouseEvent) => {
  nodeContext.value.openNodeMenu(event, nodeIndex.value);
};
</script>
