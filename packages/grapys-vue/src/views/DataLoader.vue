<template>
  <div
    @dragover.prevent="handleDragOver"
    @dragleave.prevent="handleDragLeave"
    @drop.prevent="handleDrop"
    class="mx-auto my-3 max-w-lg rounded-md border-2 border-dashed px-5 py-3 text-center transition-colors"
    :class="isDragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-400'"
  >
    <p v-if="!fileName" class="py-8 text-sm">Drop JSON file here.</p>

    <div v-if="fileName" class="mt-2">
      <p class="mb-1 text-left text-xs text-gray-600">File:</p>
      <p class="mb-1 line-clamp-3 overflow-hidden text-left text-sm break-words">{{ fileName }}</p>
      <SideMenuButton variant="primary" rounded="full" @click="loadFile"> Load </SideMenuButton>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import { useStore } from "../store";
import SideMenuButton from "../components/SideMenuButton.vue";

export default defineComponent({
  name: "JsonDropLoader",
  components: {
    SideMenuButton,
  },
  setup() {
    const store = useStore();

    let file: null | File = null;
    const fileName = ref<string | null>("");
    const isDragOver = ref(false);

    const handleDragOver = () => {
      isDragOver.value = true;
    };

    const handleDragLeave = () => {
      isDragOver.value = false;
    };

    const handleDrop = (event: DragEvent) => {
      isDragOver.value = false;
      file = event?.dataTransfer?.files[0] as File | null;
      if (!file || file.type !== "application/json") {
        file = null;
        alert("JSONファイルをドロップしてください");
        return;
      }
      fileName.value = file.name;
    };

    const loadFile = () => {
      if (!file) {
        return;
      }
      const reader = new FileReader();
      reader.onload = (event: ProgressEvent<FileReader>) => {
        try {
          const json = JSON.parse(event?.target?.result as string);
          store.initFromGraphData(json);
          file = null;
          fileName.value = null;
        } catch (err) {
          console.log(err);
          alert("Failed JSON load");
        }
      };
      reader.readAsText(file);
    };

    return {
      fileName,
      isDragOver,
      handleDragOver,
      handleDragLeave,
      handleDrop,
      loadFile,
    };
  },
});
</script>
