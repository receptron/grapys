<template>
  <ul v-if="menuVisible" :style="menuStyle" class="fixed w-40 rounded-md border border-gray-300 bg-white py-2 shadow-md z-50">
    <slot />
  </ul>
</template>

<script lang="ts">
import { ref, defineComponent } from "vue";

import { getClientPos } from "../utils/gui/utils";

export default defineComponent({
  setup() {
    const menuVisible = ref(false);
    const menuStyle = ref({ top: "0px", left: "0px" });

    const openMenu = (event: MouseEvent | TouchEvent, rect?: DOMRect) => {
      event.preventDefault();
      const { clientX, clientY } = getClientPos(event);
      if (rect) {
        menuStyle.value = {
          top: `${clientY - rect.top}px`,
          left: `${clientX - rect.left}px`,
        };
      } else {
        // Use page coordinates if no rect provided
        menuStyle.value = {
          top: `${clientY}px`,
          left: `${clientX}px`,
        };
      }
      menuVisible.value = true;
    };

    const closeMenu = () => {
      menuVisible.value = false;
    };

    return {
      menuVisible,
      menuStyle,
      openMenu,
      closeMenu,
    };
  },
});
</script>
