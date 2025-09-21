<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "JsonViewer",
  props: {
    jsonData: {
      type: Object,
      required: true,
    },
  },
});
</script>

<template>
  <div class="relative box-border h-full overflow-auto rounded-md border-4 border-gray-200">
    <pre class="p-6 font-mono text-xs break-words whitespace-pre-wrap">{{ JSON.stringify(jsonData, null, 2) }}</pre>
  </div>
</template>
