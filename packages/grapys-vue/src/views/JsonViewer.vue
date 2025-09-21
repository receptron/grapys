<script lang="ts">
import { defineComponent, computed } from "vue";

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
      return JSON.stringify(props.jsonData, null, 2);
    });
    return {
      code,
    };
  },
});
</script>

<template>
  <div class="relative box-border h-full overflow-auto rounded-md border-4 border-gray-200 bg-white">
    <highlightjs language="json" :code="code" class="h-full" />
  </div>
</template>
