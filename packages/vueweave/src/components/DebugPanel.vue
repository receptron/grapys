<template>
  <div class="w-80 overflow-auto border-r bg-gray-50 p-4">
    <div class="mb-4">
      <router-link
        to="/"
        class="flex items-center gap-1 rounded bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700"
      >
        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        <span>Back to Examples</span>
      </router-link>
      <div class="mb-2 flex items-center justify-between">
        <h2 class="text-lg font-bold">Internal State</h2>
        <a
          v-if="githubUrl"
          :href="githubUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="flex items-center gap-1 rounded bg-gray-800 px-2 py-1 text-xs text-white hover:bg-gray-700"
          title="View source on GitHub"
        >
          <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill-rule="evenodd"
              d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
              clip-rule="evenodd"
            />
          </svg>
          <span>Source</span>
        </a>
      </div>
    </div>

    <div class="mb-4">
      <h3 class="mb-2 text-sm font-semibold">Nodes ({{ nodes.length }})</h3>
      <div class="space-y-2">
        <details v-for="(node, index) in nodes" :key="index" class="rounded bg-white p-2 text-xs">
          <summary class="cursor-pointer font-medium">{{ node.nodeId }}</summary>
          <pre class="mt-2 overflow-auto text-xs">{{ JSON.stringify(node, null, 2) }}</pre>
        </details>
      </div>
    </div>

    <div class="mb-4">
      <h3 class="mb-2 text-sm font-semibold">Edges ({{ edges.length }})</h3>
      <div class="space-y-2">
        <div v-for="(edge, index) in edges" :key="index" class="rounded bg-white p-2 text-xs">
          <div class="font-medium">{{ edge.source.nodeId }}[{{ edge.source.index }}] → {{ edge.target.nodeId }}[{{ edge.target.index }}]</div>
          <pre class="mt-1 overflow-auto text-xs">{{ JSON.stringify(edge, null, 2) }}</pre>
        </div>
      </div>
    </div>

    <div class="mb-4">
      <h3 class="mb-2 text-sm font-semibold">Node Records</h3>
      <pre class="overflow-auto rounded bg-white p-2 text-xs">{{ JSON.stringify(nodeRecords, null, 2) }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { RouterLink } from "vue-router";
import { useFlowStore } from "../package";

interface Props {
  githubUrl?: string;
}

defineProps<Props>();

const flowStore = useFlowStore();

// Access reactive state via computed
const nodes = computed(() => flowStore.nodes);
const edges = computed(() => flowStore.edges);
const nodeRecords = computed(() => flowStore.nodeRecords);
</script>
