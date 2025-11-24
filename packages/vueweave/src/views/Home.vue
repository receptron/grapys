<template>
  <div class="flex h-screen items-center justify-center bg-gray-50">
    <div class="w-full max-w-2xl rounded-lg bg-white p-8 shadow-lg">
      <h1 class="mb-2 text-3xl font-bold text-gray-800">VueWeave Examples</h1>
      <p class="mb-8 text-gray-600">Interactive node-based graph editor examples</p>

      <div class="space-y-4">
        <router-link to="/minimal" class="block rounded-lg border-2 border-purple-200 bg-purple-50 p-6 transition-all hover:border-purple-400 hover:bg-purple-100">
          <div class="mb-2 flex items-center justify-between">
            <h2 class="text-xl font-semibold text-purple-800">Minimal Example</h2>
            <a
              href="https://github.com/receptron/grapys/blob/main/packages/vueweave/src/views/MinimalExample.vue"
              target="_blank"
              rel="noopener noreferrer"
              class="flex items-center gap-1 rounded bg-purple-700 px-2 py-1 text-xs text-white hover:bg-purple-800"
              title="View source on GitHub"
              @click.stop
            >
              <svg class="h-3 w-3" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill-rule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                  clip-rule="evenodd"
                />
              </svg>
              <span>Code</span>
            </a>
          </div>
          <p class="text-sm text-purple-600">Absolutely minimal: Just GraphCanvasBase with two nodes and one edge. Perfect starting point.</p>
        </router-link>

        <router-link to="/simple" class="block rounded-lg border-2 border-blue-200 bg-blue-50 p-6 transition-all hover:border-blue-400 hover:bg-blue-100">
          <div class="mb-2 flex items-center justify-between">
            <h2 class="text-xl font-semibold text-blue-800">Simple Example</h2>
            <a
              href="https://github.com/receptron/grapys/blob/main/packages/vueweave/src/views/SimpleExample.vue"
              target="_blank"
              rel="noopener noreferrer"
              class="flex items-center gap-1 rounded bg-blue-700 px-2 py-1 text-xs text-white hover:bg-blue-800"
              title="View source on GitHub"
              @click.stop
            >
              <svg class="h-3 w-3" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill-rule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                  clip-rule="evenodd"
                />
              </svg>
              <span>Code</span>
            </a>
          </div>
          <p class="text-sm text-blue-600">Basic graph with three nodes connected by edges. Shows the fundamental usage of VueWeave.</p>
        </router-link>

        <router-link
          to="/interactive"
          class="block rounded-lg border-2 border-green-200 bg-green-50 p-6 transition-all hover:border-green-400 hover:bg-green-100"
        >
          <div class="mb-2 flex items-center justify-between">
            <h2 class="text-xl font-semibold text-green-800">Interactive Example</h2>
            <a
              href="https://github.com/receptron/grapys/blob/main/packages/vueweave/src/views/InteractiveExample.vue"
              target="_blank"
              rel="noopener noreferrer"
              class="flex items-center gap-1 rounded bg-green-700 px-2 py-1 text-xs text-white hover:bg-green-800"
              title="View source on GitHub"
              @click.stop
            >
              <svg class="h-3 w-3" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill-rule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                  clip-rule="evenodd"
                />
              </svg>
              <span>Code</span>
            </a>
          </div>
          <p class="text-sm text-green-600">Dynamic graph where you can add nodes, edit values, and create connections interactively.</p>
        </router-link>
      </div>

      <div class="mt-8 rounded-md bg-gray-100 p-4">
        <h3 class="mb-2 font-semibold text-gray-700">Getting Started</h3>
        <ul class="list-inside list-disc space-y-1 text-sm text-gray-600">
          <li>Drag nodes to move them around</li>
          <li>Click and drag from output ports to input ports to create edges</li>
          <li>Right-click edges to delete them</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { RouterLink } from "vue-router";
</script>
