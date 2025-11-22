<template>
  <label class="text-xs text-gray-300">Value</label>
  <select v-model="dataType" class="w-full resize-none rounded-md border border-gray-300 p-1 text-black" @change="dataTypeUpdate">
    <option v-for="(option, k) in staticNodeOptions" :value="option.value" :key="k">
      {{ option.name }}
    </option>
  </select>
  <div v-show="['text', 'data'].includes(dataType)">
    <textarea
      placeholder="Enter the text"
      class="w-full resize-none rounded-md border border-gray-300 p-1 text-black"
      v-model="textAreaValue"
      ref="textareaRef"
      :rows="rows"
      @mousedown.stop
      @touchstart.stop
      @wheel.stop
    ></textarea>
    <div v-if="['data'].includes(dataType)">
      {{ isValidData ? "valid" : "invalid" }}
    </div>
  </div>
  <div v-show="['number'].includes(dataType)">
    <input
      type="number"
      class="w-full resize-none rounded-md border border-gray-300 p-1 text-black"
      v-model="numberValue"
      ref="inputRef"
      @mousedown.stop
      @touchstart.stop
    />
  </div>
  <div v-show="['boolean'].includes(dataType)">
    <select v-model="booleanValue" ref="selectFormRef" @change="selectUpdate">
      <option value="true">True</option>
      <option value="false">False</option>
    </select>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, PropType, onMounted, onBeforeUnmount, watch } from "vue";
import type { GUINodeData } from "../utils/gui/type";
import { staticNodeOptions } from "../utils/gui/classUtils";

export default defineComponent({
  props: {
    nodeData: {
      type: Object as PropType<GUINodeData>,
      required: true,
    },
  },
  emits: ["focusEvent", "blurEvent", "updateStaticValue"],
  setup(props, ctx) {
    const textareaRef = ref();
    const inputRef = ref();
    const selectFormRef = ref();
    const rows = ref(3);

    const dataType = ref(props.nodeData.data.staticNodeType ?? "text");
    const numberValue = ref(props.nodeData.data.staticNodeType === "number" ? String(props.nodeData.data.value ?? "0") : "0");
    const booleanValue = ref(props.nodeData.data.staticNodeType === "boolean" ? (props.nodeData.data.value === true ? "true" : "false") : "false");
    const textAreaValue = ref(
      String(props.nodeData.data.staticNodeType === "data" ? JSON.stringify(props.nodeData.data.value, null, 2) : (props.nodeData.data.value ?? "")),
    );

    const focusEvent = (event: FocusEvent) => {
      if (event.target instanceof HTMLTextAreaElement) {
        ctx.emit("focusEvent");
        rows.value = 10;
      }
    };

    // update func
    const updateData = () => {
      const value = (() => {
        if (dataType.value === "data" && isValidData.value) {
          return JSON.parse(textAreaValue.value);
        }
        return textAreaValue.value;
      })();

      ctx.emit("updateStaticValue", {
        value,
        staticNodeType: dataType.value,
      });
    };
    const updateNumber = () => {
      const value = (() => {
        if (dataType.value === "number") {
          return Number(numberValue.value ?? "0");
        }
      })();
      ctx.emit("updateStaticValue", {
        value,
        staticNodeType: dataType.value,
      });
    };
    const updateBoolean = () => {
      ctx.emit("updateStaticValue", {
        value: booleanValue.value === "true",
        staticNodeType: dataType.value,
      });
    };
    // end of update func

    const blurTextareaEvent = (event: FocusEvent) => {
      if (event.target instanceof HTMLTextAreaElement) {
        rows.value = 3;
        ctx.emit("blurEvent");
        updateData();
      }
    };
    const blurInputEvent = () => {
      updateNumber();
    };

    const dataTypeUpdate = () => {
      if (["data", "text"].includes(dataType.value)) {
        updateData();
      }
      if (dataType.value === "boolean") {
        updateBoolean();
      }
      if (dataType.value === "number") {
        updateNumber();
      }
    };
    const selectUpdate = () => {
      if (dataType.value === "boolean") {
        updateBoolean();
      }
    };
    // for redo
    watch(
      () => props.nodeData.data.value,
      (value) => {
        if (dataType.value === "boolean") {
          booleanValue.value = value ? "true" : "false";
        } else if (["data", "text"].includes(dataType.value)) {
          if (value !== null && typeof value === "object") {
            textAreaValue.value = JSON.stringify(value, null, 2);
          } else {
            textAreaValue.value = value as string;
          }
        } else if (dataType.value === "number") {
          numberValue.value = String(value);
        } else {
          // nothing
        }
      },
    );
    watch(
      () => props.nodeData.data.staticNodeType,
      (staticNodeType) => {
        if (staticNodeType && dataType.value !== staticNodeType) {
          dataType.value = staticNodeType;
        }
      },
    );

    const isValidData = computed(() => {
      if (dataType.value === "data") {
        try {
          JSON.parse(textAreaValue.value);
        } catch (__e) {
          return false;
        }
      }
      return true;
    });

    onMounted(() => {
      textareaRef.value.addEventListener("focus", focusEvent);
      textareaRef.value.addEventListener("blur", blurTextareaEvent);
      inputRef.value.addEventListener("blur", blurInputEvent);
    });
    onBeforeUnmount(() => {
      textareaRef.value.removeEventListener("focus", focusEvent);
      textareaRef.value.removeEventListener("blur", blurTextareaEvent);
      inputRef.value.removeEventListener("blur", blurInputEvent);
    });
    return {
      inputRef,
      textareaRef,
      selectFormRef,
      dataType,
      rows,
      booleanValue,
      numberValue,
      textAreaValue,
      staticNodeOptions,
      isValidData,
      selectUpdate,
      dataTypeUpdate,
    };
  },
});
</script>
