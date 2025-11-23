<template>
  <ContextMenu ref="contextMenu" class="z-100">
    <li class="cursor-pointer px-4 py-2 hover:bg-gray-100" @click="deleteNode()">Delete</li>
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
    const selectedNodeIndex = ref(0);

    const openMenu = (event: MouseEvent | TouchEvent, rect: DOMRect, nodeIndex: number) => {
      event.preventDefault();
      contextMenu.value.openMenu(event, rect);
      selectedNodeIndex.value = nodeIndex;
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
