<script lang="ts">
import { defineComponent, ref } from 'vue';

export default defineComponent({
  props: {
    jsonData: {
      type: Object,
      required: true
    },
    width: {
      type: String,
      default: '400px'
    }
  },
  setup() {
    const isOpen = ref(false);
    
    return {
      isOpen
    };
  }
});
</script>

<template>
  <div class="pointer-events-none" :style="{ width }">
    <div class="flex flex-col pointer-events-auto">
      <!-- ヘッダー -->
      <div 
        class="flex items-center justify-between bg-gray-100 p-3 border border-gray-300 rounded-t-lg cursor-pointer"
        @click="isOpen = !isOpen"
      >
        <div class="font-bold flex items-center">
          <span>JSON データ</span>
        </div>
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          class="h-5 w-5 transition-transform duration-300"
          :class="{ 'rotate-180': isOpen }" 
          viewBox="0 0 20 20" 
          fill="currentColor"
        >
          <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
        </svg>
      </div>
      
      <!-- JSON内容 -->
      <div 
        class="bg-white border border-gray-300 shadow-lg overflow-hidden transition-all duration-300 ease-in-out"
        :class="{ 'max-h-[calc(100vh-90px)]': isOpen, 'max-h-0': !isOpen }"
        :style="{ 'pointer-events': isOpen ? 'auto' : 'none' }"
      >
        <div class="overflow-auto p-6" style="max-height: calc(100vh - 40px)">
          <pre class="text-xs font-mono whitespace-pre-wrap break-words">{{ JSON.stringify(jsonData, null, 2) }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>