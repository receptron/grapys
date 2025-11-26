<template>
  <div v-if="param.type" class="mb-2">
    <label class="text-xs text-gray-600">{{ param.name }}</label>

    <div v-if="param.type === 'string'">
      <input
        ref="inputRef"
        type="text"
        class="w-full rounded-md border border-gray-300 p-1 text-xs text-black"
        v-model="inputValue"
        @mousedown.stop
        @touchstart.stop
      />
    </div>
    <div v-else-if="param.type === 'text'">
      <textarea
        ref="textareaRef"
        :rows="rows"
        class="w-full resize-none rounded-md border border-gray-300 p-1 text-xs text-black"
        v-model="textAreaValue"
        @mousedown.stop
        @touchstart.stop
        @wheel.stop
      ></textarea>
    </div>
    <div v-else-if="param.type === 'number'">
      <input
        ref="inputRef"
        type="number"
        class="w-full rounded-md border border-gray-300 p-1 text-xs text-black"
        :step="param.step ?? 0.1"
        :min="param.min"
        :max="param.max"
        v-model="inputValue"
        @mousedown.stop
        @touchstart.stop
      />
    </div>
    <div v-else-if="param.type === 'boolean'">
      <select v-model="booleanValue" ref="selectFormRef" @change="selectUpdate" class="w-full rounded-md border border-gray-300 text-xs">
        <option value="true">True</option>
        <option value="false">False</option>
      </select>
    </div>
    <div v-else-if="param.type === 'enum'">
      <select v-model="enumValue" @change="enumUpdate" class="w-full rounded-md border border-gray-300 text-xs">
        <option :value="value" v-for="(value, k) in param.values" :key="k">{{ value }}</option>
      </select>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from "vue";

export interface ParamData {
  name: string;
  type: "string" | "text" | "number" | "boolean" | "enum";
  step?: number;
  min?: number;
  max?: number;
  values?: string[];
}

const props = defineProps<{
  param: ParamData;
  modelValue: unknown;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: unknown];
  focusEvent: [];
  blurEvent: [];
}>();

const textareaRef = ref<HTMLTextAreaElement>();
const inputRef = ref<HTMLInputElement>();
const selectFormRef = ref<HTMLSelectElement>();

const rows = ref(3);

const inputValue = ref(String(props.modelValue ?? ""));
const booleanValue = ref(props.modelValue === true ? "true" : "false");
const textAreaValue = ref(String(props.modelValue ?? ""));
const enumValue = ref(String(props.modelValue ?? (props.param.type === "enum" ? props.param?.values?.[0] : "")));

watch(
  () => props.modelValue,
  (updateValue) => {
    if (props.param.type === "text" && updateValue !== textAreaValue.value) {
      textAreaValue.value = String(updateValue ?? "");
    }
    if (props.param.type === "string" && updateValue !== inputValue.value) {
      inputValue.value = String(updateValue ?? "");
    }
    if (props.param.type === "number") {
      const numberValue = Number(inputValue.value);
      if (numberValue !== updateValue) {
        inputValue.value = String(updateValue ?? "");
      }
    }
    if (props.param.type === "boolean") {
      const booleanText = updateValue ? "true" : "false";
      if (booleanText !== booleanValue.value) {
        booleanValue.value = booleanText;
      }
    }
    if (props.param.type === "enum" && updateValue !== enumValue.value) {
      enumValue.value = String(updateValue ?? props.param?.values?.[0] ?? "");
    }
  }
);

const focusEvent = (event: FocusEvent) => {
  if (event.target instanceof HTMLTextAreaElement) {
    emit("focusEvent");
    rows.value = 10;
  }
};

const blurEvent = (event: FocusEvent) => {
  if (event.target instanceof HTMLTextAreaElement) {
    rows.value = 3;
    emit("blurEvent");
    emit("update:modelValue", textAreaValue.value);
  }
};

const blurUpdateEvent = () => {
  const value = props.param.type === "number" ? Number(inputValue.value) : inputValue.value;
  emit("update:modelValue", value);
};

const selectUpdate = () => {
  emit("update:modelValue", booleanValue.value === "true");
};

const enumUpdate = () => {
  emit("update:modelValue", enumValue.value);
};

onMounted(() => {
  if (textareaRef.value) {
    textareaRef.value.addEventListener("focus", focusEvent);
    textareaRef.value.addEventListener("blur", blurEvent);
  }
  if (inputRef.value) {
    inputRef.value.addEventListener("blur", blurUpdateEvent);
  }
});

onBeforeUnmount(() => {
  if (textareaRef.value) {
    textareaRef.value.removeEventListener("focus", focusEvent);
    textareaRef.value.removeEventListener("blur", blurEvent);
  }
  if (inputRef.value) {
    inputRef.value.removeEventListener("blur", blurUpdateEvent);
  }
});
</script>
