<script lang="ts">
import { defineComponent, computed } from "vue";
import "highlight.js/styles/intellij-light.css";
import hljs from "highlight.js/lib/core";
import json from "highlight.js/lib/languages/json";

hljs.registerLanguage("json", json);

export default defineComponent({
  name: "JsonViewer",
  props: {
    jsonData: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    const code = computed(() => {
      return hljs.highlight(JSON.stringify(props.jsonData, null, 2), { language: "json" }).value;
    });
    return {
      code,
    };
  },
});
</script>

<template>
  <div class="relative box-border h-full overflow-auto rounded-md border-4 border-gray-200 bg-white">
    <pre v-html="code"></pre>
  </div>
</template>
