<template>
  <div class="absolute flex w-36 cursor-grab flex-col rounded-md bg-green-400 text-center text-white select-none">
    <div class="w-full rounded-t-md bg-green-500 py-1 text-center leading-none">Loop</div>
    <div class="my-4 p-2">
      <select class="w-full resize-none rounded-md border border-gray-300 p-1 text-black" @change="updateType" :value="loopType">
        <option value="none">None</option>
        <option value="while">While</option>
        <option value="count">Count</option>
      </select>

      <div v-if="loopType === 'while'" class="mt-2">
        <select class="w-full resize-none rounded-md border border-gray-300 p-1 text-black" @change="updateWhile" :value="whileValue">
          <option v-for="item in whileSources" :key="item">{{ item }}</option>
        </select>
      </div>
      <div v-show="loopType === 'count'" class="mt-2">
        <input type="number" class="w-full rounded-md border border-gray-300 p-1 text-black" ref="countRef" v-model="countValue" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, onBeforeUnmount, watch } from "vue";
import { useFlowStore } from "../store";
import { useGraphAIStore } from "../store/graphai";
import { getLoopWhileSources } from "../utils/gui/utils";
import { LoopDataType, GUILoopData } from "../utils/gui/type";

export default defineComponent({
  setup() {
    const store = useFlowStore();
    const graphAIStore = useGraphAIStore();
    const whileSources = computed(() => {
      return getLoopWhileSources(store.nodes, graphAIStore.nestedGraphs);
    });

    const loop = computed(() => {
      return (store.extra.loop ?? { loopType: "none" }) as GUILoopData;
    });

    const loopType = ref<LoopDataType>(loop.value.loopType);
    const countValue = ref(loop.value && loop.value.loopType === "count" ? loop.value.count : "1");
    const whileValue = ref(loop.value && loop.value.loopType === "while" ? (loop.value.while === true ? "true" : loop.value.while) : whileSources.value[0]);
    const countRef = ref();

    const storeLoopData = computed<GUILoopData>(() => {
      if (loopType.value === "while") {
        return {
          loopType: "while",
          while: whileValue.value === "true" ? true : whileValue.value,
        };
      }
      if (loopType.value === "count") {
        return {
          loopType: "count",
          count: Number(countValue.value),
        };
      }
      return {
        loopType: "none",
      };
    });
    watch(
      () => loop.value,
      (value) => {
        loopType.value = value.loopType;
        if (value.loopType === "while") {
          whileValue.value = (value.while === true ? "true" : value.while) ?? "";
        }
        if (value.loopType === "count") {
          countValue.value = String(value.count ?? 1);
        }
      },
    );

    const updateLoop = () => {
      store.updateExtra({ ...store.extra, loop: storeLoopData.value });
    };

    const updateType = (event: Event) => {
      if (event.target instanceof HTMLSelectElement) {
        loopType.value = (event?.target?.value ?? "") as LoopDataType;
        updateLoop();
      }
    };
    const updateWhile = (event: Event) => {
      if (event.target instanceof HTMLSelectElement) {
        whileValue.value = event?.target?.value ?? "";
        updateLoop();
      }
    };
    const blurUpdateEvent = () => {
      updateLoop();
    };
    onMounted(() => {
      if (countRef.value) {
        countRef.value.addEventListener("blur", blurUpdateEvent);
      }
    });
    onBeforeUnmount(() => {
      if (countRef.value) {
        countRef.value.removeEventListener("blur", blurUpdateEvent);
      }
    });

    return {
      loopType,
      countValue,
      whileValue,

      whileSources,

      updateType,
      updateWhile,

      countRef,
      store,
    };
  },
});
</script>
