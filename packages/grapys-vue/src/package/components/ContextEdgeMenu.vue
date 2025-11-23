<template>
  <ContextMenu ref="contextMenu">
    <li class="cursor-pointer px-4 py-2 hover:bg-gray-100" @click="deleteEdge()">Delete</li>
  </ContextMenu>
</template>

<script lang="ts">
import { ref, defineComponent } from "vue";

import ContextMenu from "./ContextMenu.vue";
import { useFlowStore } from "../../store";

export default defineComponent({
  components: {
    ContextMenu,
  },
  setup() {
    const contextMenu = ref();

    const store = useFlowStore();
    const selectedEdgeIndex = ref(0);

    const openMenu = (event: MouseEvent | TouchEvent, rect: DOMRect, edgeIndex: number) => {
      event.preventDefault();
      contextMenu.value.openMenu(event, rect);
      selectedEdgeIndex.value = edgeIndex;
    };

    const closeMenu = () => {
      contextMenu.value.closeMenu();
    };

    const deleteEdge = () => {
      store.deleteEdge(selectedEdgeIndex.value);
    };
    return {
      contextMenu,
      openMenu,
      closeMenu,
      deleteEdge,
    };
  },
});
</script>
