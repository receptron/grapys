<template>
  <div>
    <div v-for="(m, k) in messages" :key="k" :class="`mb-4 ${m.role === 'user' ? 'text-right' : 'text-left'}`">
      <div
        :class="`inline-block max-w-[80%] rounded-lg px-4 py-2 ${
          m.role === 'user'
            ? 'bg-blue-500 text-white'
            : 'bg-gray-200 text-gray-800'
        }`"
      >
        <div class="text-sm font-semibold mb-1">
          {{ m.role === 'user' ? 'You' : `AI (${m.nodeId})` }}
        </div>
        <div class="whitespace-pre-wrap break-words">{{ m.content }}</div>
      </div>
    </div>
    <div v-for="(nodeId, k) in streamNodeIds" :key="`stream-${k}`" class="text-left mb-4">
      <div v-if="isStreaming[nodeId]" class="inline-block max-w-[80%] rounded-lg bg-gray-200 px-4 py-2 text-gray-800">
        <div class="text-sm font-semibold mb-1">AI ({{ nodeId }})</div>
        <div class="whitespace-pre-wrap break-words">{{ streamData[nodeId] }}</div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, PropType } from "vue";
import { GUIMessage } from "../utils/gui/type";

export default defineComponent({
  props: {
    messages: {
      type: Array<GUIMessage>,
      default: () => [],
    },
    isStreaming: {
      type: Object as PropType<Record<string, boolean>>,
      default: () => {
        return {};
      },
    },
    streamData: {
      type: Object as PropType<Record<string, string>>,
      default: () => {
        return {};
      },
    },
    streamNodeIds: {
      type: Array<string>,
      default: () => [],
    },
  },
});
</script>
