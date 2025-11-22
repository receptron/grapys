<template>
  <ul v-if="menuVisible" :style="menuStyle" class="absolute w-40 rounded-md border border-gray-300 bg-white py-2 shadow-md">
    <slot />
  </ul>
</template>

<script lang="ts">
import { ref, defineComponent } from "vue";

import { getClientPos } from "../package/utils/gui";

export default defineComponent({
  setup() {
    const menuVisible = ref(false);
    const menuStyle = ref({ top: "0px", left: "0px" });

    const openMenu = (event: MouseEvent | TouchEvent, rect: DOMRect) => {
      event.preventDefault();
      const { clientX, clientY } = getClientPos(event);
      menuStyle.value = {
        top: `${clientY - rect.top}px`,
        left: `${clientX - rect.left}px`,
      };
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
