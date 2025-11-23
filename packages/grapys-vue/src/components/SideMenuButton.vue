<template>
  <button
    @click="$emit('click')"
    :disabled="disabled"
    :type="type"
    class="mb-1 cursor-pointer items-center py-2 text-sm font-medium text-white transition-colors duration-200"
    :class="dynamicClasses"
  >
    <slot></slot>
  </button>
</template>

<script lang="ts">
import { defineComponent, computed, type PropType } from "vue";
import { buttonColorVariants, buttonRoundedClasses } from "../package";

type ColorVariant = keyof typeof buttonColorVariants;
type RoundedVariant = keyof typeof buttonRoundedClasses;

export default defineComponent({
  name: "SideMenuButton",
  emits: ["click"],
  props: {
    variant: {
      type: String as PropType<ColorVariant>,
      default: "primary",
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    rounded: {
      type: String as PropType<RoundedVariant>,
      default: "full",
    },
    fullWidth: {
      type: Boolean,
      default: true,
    },
    type: {
      type: String as PropType<"submit" | "reset" | "button">,
      default: "button",
    },
    customClass: {
      type: String,
      default: "",
    },
  },
  setup(props) {
    const dynamicClasses = computed(() => [
      // 幅
      props.fullWidth ? "w-full" : "",
      // 角丸
      buttonRoundedClasses[props.rounded],
      // 状態別カラー
      props.disabled
        ? `cursor-not-allowed ${buttonColorVariants[props.variant].disabled}`
        : `${buttonColorVariants[props.variant].default} ${buttonColorVariants[props.variant].hover}`,
      // カスタムクラス
      props.customClass,
    ]);

    return {
      dynamicClasses,
    };
  },
});
</script>
