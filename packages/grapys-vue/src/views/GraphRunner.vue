<template>
  <div class="pointer-events-auto flex max-h-[calc(100vh-90px)] w-100 flex-col">
    <!-- header -->
    <div class="flex cursor-pointer items-center justify-between rounded-t-lg border border-gray-300 bg-gray-100 p-3">
      <div class="flex items-center font-bold">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z"
          />
        </svg>
        <span>Chat</span>
        <span v-if="messages.length > 0" class="ml-2 rounded-full bg-blue-500 px-2 py-1 text-xs text-white">
          {{ messages.length }}
        </span>
      </div>
      <div class="flex items-center space-x-2">
        <button
          @click.stop="run"
          class="rounded-md px-3 py-1 font-medium text-white"
          :class="isRunning || !ready ? 'cursor-not-allowed bg-gray-400' : 'bg-green-500 hover:bg-green-600'"
          :disabled="isRunning || !ready"
        >
          {{ ready ? "Run" : "Loading..." }}
        </button>
        <button
          @click.stop="abort"
          class="rounded-md px-3 py-1 font-medium text-white"
          :class="!isRunning ? 'cursor-not-allowed bg-gray-400' : 'bg-red-500 hover:bg-red-600'"
          :disabled="!isRunning"
        >
          Stop
        </button>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6" @click="onClickClose">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
        </svg>
      </div>
    </div>

    <!-- content -->
    <div class="overflow-hidden border border-gray-300 bg-white shadow-lg transition-all duration-300 ease-in-out">
      <div class="flex h-[calc(100vh-160px)] flex-col">
        <!-- message area -->
        <div ref="chatContainerRef" class="flex-1 space-y-2 overflow-y-auto p-6" style="scroll-behavior: smooth">
          <!-- loading -->
          <div v-if="!ready" class="flex h-full flex-col items-center justify-center text-gray-500">
            <div class="mb-2 animate-pulse">Loading...</div>
            <div class="text-sm">{{ loading }}</div>
          </div>

          <!-- ready and no messages -->
          <div v-else-if="ready && messages.length === 0 && !isRunning" class="flex h-full flex-col items-center justify-center text-gray-500">
            <div class="text-center">
              <div class="mb-2 text-lg">Chat is ready</div>
              <div class="text-sm">Click the "Run" button to start the conversation</div>
            </div>
          </div>

          <!-- messages -->
          <chat v-else :messages="messages" :is-streaming="isStreaming" :stream-data="streamData" :stream-node-ids="streamNodes" />
        </div>

        <!-- input area -->
        <div class="border-t border-gray-300 bg-gray-50 p-3">
          <div class="flex items-center">
            <input
              v-model="userInput"
              @keypress="handleKeyPress"
              :placeholder="events.length > 0 ? 'Enter your message...' : 'Chat is ready'"
              class="flex-1 rounded-l-lg border border-gray-300 p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              :disabled="events.length === 0"
            />
            <button
              class="rounded-r-lg px-4 py-3 font-medium text-white"
              :class="events.length === 0 ? 'cursor-not-allowed bg-gray-300' : 'bg-blue-500 hover:bg-blue-600'"
              @click="events.length > 0 && submitText(events[0])"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z"
                  clip-rule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch, PropType } from "vue";
import { GraphAI, GraphData, AgentFilterInfo, NodeState } from "graphai";

import { useFlowStore } from "../package";
import { useGraphAIStore } from "../store/graphai";

import { useStreamData } from "../utils/vue-plugin/stream";
import { useChatPlugin } from "../utils/vue-plugin/chat";
import { useGraphAIResult } from "../utils/vue-plugin/result";

import Chat from "../components/Chat.vue";

import * as agents from "@graphai/vanilla";
import { openAIAgent, openAIImageAgent } from "@graphai/openai_agent";
import { geminiAgent } from "@graphai/gemini_agent";
import { anthropicAgent } from "@graphai/anthropic_agent";
import { browserlessAgent } from "@graphai/browserless_agent";

import tinyswallowAgent, { modelLoad, loadEngine, CallbackReport } from "../agents/tinyswallow";
import { textInputEvent } from "../agents/event";

import { getGraphConfigs } from "../graph";
//import { buildFirebaseStreamFilter } from "./firebase";
import { buildFirebaseStreamFilter } from "@receptron/firebase-tools";
import { firebaseApp } from "../utils/firebase/firebase";
import { enableOnCall } from "../config/project";

export default defineComponent({
  components: {
    Chat,
  },
  props: {
    graphData: {
      type: Object as PropType<GraphData>,
      required: true,
    },
  },
  emits: ["close"],
  setup(props, { emit }) {
    const isRunning = ref(false);
    const chatContainerRef = ref<HTMLElement | null>(null);
    const store = useFlowStore();
    const graphAIStore = useGraphAIStore();

    const { eventAgent, userInput, events, submitText, clearEvents } = textInputEvent();
    const { messages, chatMessagePlugin } = useChatPlugin();
    const { streamData, streamAgentFilter, streamPlugin, isStreaming } = useStreamData();
    const { graphAIResultPlugin } = useGraphAIResult();

    const { firebaseStreamFilter } = buildFirebaseStreamFilter(firebaseApp, "asia-northeast1", "agent");

    const agentFilters: AgentFilterInfo[] = [
      {
        name: "streamAgentFilter",
        agent: streamAgentFilter,
      },
    ];

    if (enableOnCall) {
      agentFilters.push({
        name: "firebaseStreamFilter",
        agent: firebaseStreamFilter,
        agentIds: ["openAIAgent"],
      });
    }

    let graphai: GraphAI | null = null;
    const run = async () => {
      isRunning.value = true;
      // console.log(getGraphConfigs());
      graphai = new GraphAI(
        props.graphData,
        {
          ...agents,
          openAIAgent,
          openAIImageAgent,
          anthropicAgent,
          geminiAgent,
          eventAgent,
          tinyswallowAgent,
          browserlessAgent,
        },
        {
          agentFilters,
          config: getGraphConfigs(),
        },
      );
      graphai.registerCallback(streamPlugin(graphAIStore.getStreamNodes(store.nodes)));
      graphai.registerCallback(chatMessagePlugin(graphAIStore.getResultNodes(store.nodes)));
      graphai.registerCallback(graphAIResultPlugin(graphAIStore.setResult));
      graphai.onLogCallback = ({ nodeId, state, inputs, result, errorMessage }) => {
        if (state === NodeState.Failed) {
          messages.value.push({ role: "error", content: errorMessage ?? "", nodeId });
        }
        console.log({ nodeId, state, inputs, result, errorMessage });
      };

      try {
        await graphai.run();
      } catch (error) {
        console.log(error);
      } finally {
        isRunning.value = false;
      }
    };

    const abort = () => {
      try {
        if (isRunning.value && graphai) {
          graphai.abort();
          clearEvents();
          graphai = null;
        }
      } catch (error) {
        console.log(error);
      } finally {
        isRunning.value = false;
      }
    };

    const streamNodes = computed(() => {
      return graphAIStore.getStreamNodes(store.nodes);
    });

    const loading = ref("");
    const ready = ref(false);

    loadEngine();

    modelLoad((report: CallbackReport) => {
      if (report.progress === 1) {
        ready.value = true;
      }
      loading.value = report.text;
      console.log(report.text);
    });

    // Automatically scroll when a message is updated
    watch(
      [messages, streamData],
      () => {
        if (chatContainerRef.value) {
          chatContainerRef.value.scrollTop = chatContainerRef.value.scrollHeight;
        }
      },
      { deep: true },
    );

    // Send message with Enter key
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === "Enter" && events.value.length > 0) {
        submitText(events.value[0]);
      }
    };

    const onClickClose = () => {
      emit("close");
    };

    return {
      run,
      abort,
      isRunning,
      chatContainerRef,

      streamData,
      isStreaming,

      submitText,
      userInput,
      messages,
      events,
      streamNodes,
      handleKeyPress,
      onClickClose,
      loading,
      ready,
    };
  },
});
</script>
