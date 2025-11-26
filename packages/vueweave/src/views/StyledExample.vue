<template>
  <div class="flex h-screen w-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
    <!-- Debug Panel -->
    <DebugPanel github-url="https://github.com/receptron/grapys/blob/main/packages/vueweave/src/views/StyledExample.vue" />

    <!-- Canvas -->
    <div class="flex-1">
      <GraphCanvasBase :node-styles="nodeStyleOptions">
        <template #node="{ nodeData }">
          <NodeBase :inputs="getInputs(nodeData)" :outputs="getOutputs(nodeData)">
            <template #header>
              <div class="w-full rounded-t-lg py-3 text-center font-semibold text-white shadow-lg">
                <div class="flex items-center justify-center gap-2">
                  <component :is="getIcon(nodeData.type)" class="h-5 w-5" />
                  <span>{{ nodeData.nodeId }}</span>
                </div>
              </div>
            </template>
            <template #body-main>
              <div class="p-4">
                <div class="mb-2 text-center text-sm font-medium text-gray-700">
                  {{ getNodeTypeLabel(nodeData.type) }}
                </div>
                <div v-if="nodeData.data.description" class="text-center text-xs text-gray-500">
                  {{ nodeData.data.description }}
                </div>
              </div>
            </template>
          </NodeBase>
        </template>
      </GraphCanvasBase>
    </div>
  </div>
</template>

<script setup lang="ts">
import { h, onMounted } from "vue";
import { useFlowStore, GraphCanvasBase, NodeBase, type GUINodeData, type NodeColorConfig, type PortColorConfig, type NodeStyleOptions } from "../package";
import DebugPanel from "../components/DebugPanel.vue";

const flowStore = useFlowStore();

// Modern gradient-based color configuration with shadows
const nodeColors: NodeColorConfig = {
  source: {
    main: "bg-gradient-to-br from-violet-400 to-purple-500 shadow-lg shadow-purple-500/50",
    header: "bg-gradient-to-r from-violet-600 to-purple-700",
    mainHighlight: "bg-gradient-to-br from-violet-300 to-purple-400 shadow-xl shadow-purple-400/60 ring-2 ring-purple-300",
    headerHighlight: "bg-gradient-to-r from-violet-500 to-purple-600",
  },
  processor: {
    main: "bg-gradient-to-br from-emerald-400 to-teal-500 shadow-lg shadow-emerald-500/50",
    header: "bg-gradient-to-r from-emerald-600 to-teal-700",
    mainHighlight: "bg-gradient-to-br from-emerald-300 to-teal-400 shadow-xl shadow-emerald-400/60 ring-2 ring-emerald-300",
    headerHighlight: "bg-gradient-to-r from-emerald-500 to-teal-600",
  },
  output: {
    main: "bg-gradient-to-br from-blue-400 to-cyan-500 shadow-lg shadow-blue-500/50",
    header: "bg-gradient-to-r from-blue-600 to-cyan-700",
    mainHighlight: "bg-gradient-to-br from-blue-300 to-cyan-400 shadow-xl shadow-blue-400/60 ring-2 ring-blue-300",
    headerHighlight: "bg-gradient-to-r from-blue-500 to-cyan-600",
  },
};

// Port colors - distinct and modern gradient style
const portColors: PortColorConfig = {
  // Input ports: Cool tones (cyan/blue) - receiving data
  input: "bg-gradient-to-br from-cyan-400 to-blue-500 shadow-md shadow-cyan-500/50 border-2 border-cyan-300",
  inputHighlight: "bg-gradient-to-br from-cyan-200 to-blue-300 shadow-xl shadow-cyan-300/80 ring-4 ring-cyan-200 scale-125",

  // Output ports: Warm tones (amber/orange) - sending data
  output: "bg-gradient-to-br from-amber-400 to-orange-500 shadow-md shadow-amber-500/50 border-2 border-amber-300",
  outputHighlight: "bg-gradient-to-br from-amber-200 to-orange-300 shadow-xl shadow-amber-300/80 ring-4 ring-amber-200 scale-125",

  // Not connectable: Red with strong visual feedback
  notConnectable: "bg-gradient-to-br from-red-500 to-rose-600 shadow-lg shadow-red-500/70 border-2 border-red-400 animate-pulse",
};

// Node style options with custom edge colors per node pair
const nodeStyleOptions: NodeStyleOptions = {
  colors: nodeColors,
  portColors,
  edgeColors: {
    edge: "#ec4899", // pink-500 - default
    hover: "#8b5cf6", // violet-500 - default hover
    notConnectable: "#ef4444", // red-500
    customColor: (sourceNodeId: string, targetNodeId: string) => {
      // Data sources (Data Lake/API Stream) -> ETL: cyan edges
      if ((sourceNodeId === "Data Lake" || sourceNodeId === "API Stream") && targetNodeId === "ETL Pipeline") {
        return {
          edge: "#06b6d4", // cyan-500
          hover: "#22d3ee", // cyan-400
        };
      }
      // ETL -> outputs: green edges
      if (sourceNodeId === "ETL Pipeline" && (targetNodeId === "Dashboard" || targetNodeId === "Warehouse")) {
        return {
          edge: "#10b981", // emerald-500
          hover: "#34d399", // emerald-400
        };
      }
      // ML Model path: purple edges
      if (sourceNodeId === "API Stream" && targetNodeId === "ML Model") {
        return {
          edge: "#a855f7", // purple-500
          hover: "#c084fc", // purple-400
        };
      }
      if (sourceNodeId === "ML Model" && targetNodeId === "Alerts") {
        return {
          edge: "#d946ef", // fuchsia-500
          hover: "#e879f9", // fuchsia-400
        };
      }
      // Default: use default colors
      return undefined;
    },
  },
};

// Icon components
const DatabaseIcon = () =>
  h("svg", { fill: "none", stroke: "currentColor", viewBox: "0 0 24 24" }, [
    h("path", {
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
      "stroke-width": "2",
      d: "M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4",
    }),
  ]);

const CpuIcon = () =>
  h("svg", { fill: "none", stroke: "currentColor", viewBox: "0 0 24 24" }, [
    h("path", {
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
      "stroke-width": "2",
      d: "M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z",
    }),
  ]);

const MonitorIcon = () =>
  h("svg", { fill: "none", stroke: "currentColor", viewBox: "0 0 24 24" }, [
    h("path", {
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
      "stroke-width": "2",
      d: "M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
    }),
  ]);

const getIcon = (type: string) => {
  switch (type) {
    case "source":
      return DatabaseIcon;
    case "processor":
      return CpuIcon;
    case "output":
      return MonitorIcon;
    default:
      return DatabaseIcon;
  }
};

onMounted(() => {
  flowStore.initData(
    [
      {
        type: "source",
        nodeId: "Data Lake",
        position: { x: 80, y: 100 },
        data: { description: "Raw data ingestion" },
      },
      {
        type: "source",
        nodeId: "API Stream",
        position: { x: 80, y: 280 },
        data: { description: "Real-time events" },
      },
      {
        type: "processor",
        nodeId: "ETL Pipeline",
        position: { x: 380, y: 140 },
        data: { description: "Transform & validate" },
      },
      {
        type: "processor",
        nodeId: "ML Model",
        position: { x: 380, y: 380 },
        data: { description: "Inference engine" },
      },
      {
        type: "output",
        nodeId: "Dashboard",
        position: { x: 680, y: 100 },
        data: { description: "Analytics view" },
      },
      {
        type: "output",
        nodeId: "Warehouse",
        position: { x: 680, y: 280 },
        data: { description: "Long-term storage" },
      },
      {
        type: "output",
        nodeId: "Alerts",
        position: { x: 680, y: 460 },
        data: { description: "Notification system" },
      },
    ],
    [
      { type: "edge", source: { nodeId: "Data Lake", index: 0 }, target: { nodeId: "ETL Pipeline", index: 0 } },
      { type: "edge", source: { nodeId: "API Stream", index: 0 }, target: { nodeId: "ETL Pipeline", index: 1 } },
      { type: "edge", source: { nodeId: "ETL Pipeline", index: 0 }, target: { nodeId: "Dashboard", index: 0 } },
      { type: "edge", source: { nodeId: "ETL Pipeline", index: 1 }, target: { nodeId: "Warehouse", index: 0 } },
      { type: "edge", source: { nodeId: "API Stream", index: 0 }, target: { nodeId: "ML Model", index: 0 } },
      { type: "edge", source: { nodeId: "ML Model", index: 0 }, target: { nodeId: "Alerts", index: 0 } },
    ],
    {},
  );
});

const getNodeTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    source: "Data Source",
    processor: "Processing",
    output: "Output",
  };
  return labels[type] ?? type;
};

const getInputs = (nodeData: GUINodeData) => {
  if (nodeData.type === "source") {
    return [];
  }
  if (nodeData.nodeId === "ETL Pipeline") {
    return [{ name: "raw" }, { name: "stream" }];
  }
  return [{ name: "input" }];
};

const getOutputs = (nodeData: GUINodeData) => {
  if (nodeData.nodeId === "ETL Pipeline") {
    return [{ name: "clean" }, { name: "archive" }];
  }
  return [{ name: "output" }];
};
</script>
