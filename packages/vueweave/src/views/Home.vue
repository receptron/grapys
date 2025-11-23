<template>
  <div class="flex h-screen items-center justify-center bg-gray-50">
    <div class="w-full max-w-2xl rounded-lg bg-white p-8 shadow-lg">
      <h1 class="mb-2 text-3xl font-bold text-gray-800">VueWeave Examples</h1>
      <p class="mb-8 text-gray-600">Interactive node-based graph editor examples</p>

      <div class="space-y-4">
        <router-link
          to="/simple"
          class="block rounded-lg border-2 border-blue-200 bg-blue-50 p-6 transition-all hover:border-blue-400 hover:bg-blue-100"
        >
          <h2 class="mb-2 text-xl font-semibold text-blue-800">Simple Example</h2>
          <p class="text-sm text-blue-600">Basic graph with three nodes connected by edges. Shows the fundamental usage of VueWeave.</p>
        </router-link>

        <router-link
          to="/interactive"
          class="block rounded-lg border-2 border-green-200 bg-green-50 p-6 transition-all hover:border-green-400 hover:bg-green-100"
        >
          <h2 class="mb-2 text-xl font-semibold text-green-800">Interactive Example</h2>
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
