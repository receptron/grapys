<template>
  <ContextMenu ref="contextMenu" class="z-100">
    <li class="cursor-pointer px-4 py-2 hover:bg-gray-100" @click="deleteNode()">Delete</li>
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
    const selectedNodeIndex = ref(0);

    const openMenu = (event: MouseEvent | TouchEvent, nodeIndexOrRect: number | DOMRect, nodeIndex?: number) => {
      event.preventDefault();
      // Support both old (event, rect, index) and new (event, index) signatures
      if (typeof nodeIndexOrRect === 'number') {
        // New signature: (event, index)
        contextMenu.value.openMenu(event);
        selectedNodeIndex.value = nodeIndexOrRect;
      } else {
        // Old signature: (event, rect, index)
        contextMenu.value.openMenu(event, nodeIndexOrRect);
        selectedNodeIndex.value = nodeIndex!;
      }
    };

    const closeMenu = () => {
      contextMenu.value.closeMenu();
    };

    const deleteNode = () => {
      store.deleteNode(selectedNodeIndex.value);
    };
    return {
      contextMenu,
      openMenu,
      closeMenu,
      deleteNode,
    };
  },
});
</script>
