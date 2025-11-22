<template>
  <ContextMenu ref="contextMenu">
    <li class="cursor-pointer px-4 py-2 hover:bg-gray-100" @click="deleteEdge()">Delete</li>
  </ContextMenu>
</template>

<script lang="ts">
import { ref, defineComponent } from "vue";

import ContextMenu from "./ContextMenu.vue";
import { useStore } from "../store";

export default defineComponent({
  components: {
    ContextMenu,
  },
  setup() {
    const contextMenu = ref();

    const store = useStore();
    const selectedEdgeIndex = ref(0);

    const openMenu = (event: MouseEvent | TouchEvent, edgeIndexOrRect: number | DOMRect, edgeIndex?: number) => {
      event.preventDefault();
      // Support both old (event, rect, index) and new (event, index) signatures
      if (typeof edgeIndexOrRect === 'number') {
        // New signature: (event, index)
        contextMenu.value.openMenu(event);
        selectedEdgeIndex.value = edgeIndexOrRect;
      } else {
        // Old signature: (event, rect, index)
        contextMenu.value.openMenu(event, edgeIndexOrRect);
        selectedEdgeIndex.value = edgeIndex!;
      }
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
