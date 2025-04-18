<template>
  <div class="pointer-events-auto flex w-100 flex-col">
    <!-- header -->
    <div class="flex cursor-pointer items-center justify-between rounded-t-lg border border-gray-300 bg-gray-100 p-3" @click="chatToggle = !chatToggle">
      <div class="flex items-center font-bold">
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
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5 transition-transform duration-300"
          :class="chatToggle ? 'rotate-180' : ''"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fill-rule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clip-rule="evenodd"
          />
        </svg>
      </div>
    </div>

    <!-- content -->
    <div
      class="overflow-hidden border border-gray-300 bg-white shadow-lg transition-all duration-300 ease-in-out"
      :class="chatToggle ? 'max-h-[calc(100vh-100px)]' : 'max-h-0'"
    >
      <div class="flex h-[calc(100vh-100px)] flex-col">
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

import { useStore } from "../store";

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
  setup(props) {
    const isRunning = ref(false);
    const chatToggle = ref(false);
    const chatContainerRef = ref<HTMLElement | null>(null);
    const store = useStore();

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
      chatToggle.value = true;
      console.log(getGraphConfigs());
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
      graphai.registerCallback(streamPlugin(store.streamNodes));
      graphai.registerCallback(chatMessagePlugin(store.resultNodes));
      graphai.registerCallback(graphAIResultPlugin(store.setResult));
      graphai.onLogCallback = ({ nodeId, state, inputs, result, errorMessage }) => {
        if (state === NodeState.Failed) {
          messages.value.push({ role: "error", content: errorMessage ?? '', nodeId });
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
      return store.streamNodes;
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

    return {
      run,
      abort,
      isRunning,
      chatToggle,
      chatContainerRef,

      streamData,
      isStreaming,

      submitText,
      userInput,
      messages,
      events,
      streamNodes,
      handleKeyPress,

      loading,
      ready,
    };
  },
});
</script>
