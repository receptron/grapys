<template>
  <div class="flex h-screen w-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900">
    <DebugPanel github-url="https://github.com/receptron/graphai/blob/main/packages/vueweave/src/views/ValidationExample.vue" />
    <div class="flex-1">
      <GraphCanvasBase :node-styles="nodeStyleOptions" :validate-connection="validateConnection">
        <template #node="{ nodeData }">
          <NodeBase :inputs="getInputs(nodeData)" :outputs="getOutputs(nodeData)">
            <template #header>
              <div class="w-full rounded-t-lg py-3 text-center font-semibold text-white shadow-lg">
                {{ nodeData.nodeId }}
              </div>
            </template>
            <template #body-main>
              <div class="p-2 text-xs text-white">
                <div class="mb-1 text-center font-bold text-[11px]">{{ nodeData.type }}</div>
                <div class="space-y-1 text-[9px] leading-tight">
                  <div v-for="line in getDescription(nodeData.type)" :key="line" class="opacity-90">
                    {{ line }}
                  </div>
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
import { GraphCanvasBase, NodeBase, useFlowStore, type NodeColorConfig, type NodeStyleOptions, type GUIEdgeData } from "../package";
import DebugPanel from "../components/DebugPanel.vue";

const store = useFlowStore();

// Node types with different validation rules
const nodeColors: NodeColorConfig = {
  singleInput: {
    main: "bg-gradient-to-br from-rose-400 to-pink-500",
    header: "bg-gradient-to-r from-rose-600 to-pink-700",
    mainHighlight: "bg-gradient-to-br from-rose-300 to-pink-400",
    headerHighlight: "bg-gradient-to-r from-rose-500 to-pink-600",
  },
  onePerPort: {
    main: "bg-gradient-to-br from-red-400 to-rose-500",
    header: "bg-gradient-to-r from-red-600 to-rose-700",
    mainHighlight: "bg-gradient-to-br from-red-300 to-rose-400",
    headerHighlight: "bg-gradient-to-r from-red-500 to-rose-600",
  },
  multiple: {
    main: "bg-gradient-to-br from-emerald-400 to-teal-500",
    header: "bg-gradient-to-r from-emerald-600 to-teal-700",
    mainHighlight: "bg-gradient-to-br from-emerald-300 to-teal-400",
    headerHighlight: "bg-gradient-to-r from-emerald-500 to-teal-600",
  },
  typeA: {
    main: "bg-gradient-to-br from-blue-400 to-cyan-500",
    header: "bg-gradient-to-r from-blue-600 to-cyan-700",
    mainHighlight: "bg-gradient-to-br from-blue-300 to-cyan-400",
    headerHighlight: "bg-gradient-to-r from-blue-500 to-cyan-600",
  },
  typeB: {
    main: "bg-gradient-to-br from-amber-400 to-orange-500",
    header: "bg-gradient-to-r from-amber-600 to-orange-700",
    mainHighlight: "bg-gradient-to-br from-amber-300 to-orange-400",
    headerHighlight: "bg-gradient-to-r from-amber-500 to-orange-600",
  },
  output: {
    main: "bg-gradient-to-br from-purple-400 to-violet-500",
    header: "bg-gradient-to-r from-purple-600 to-violet-700",
    mainHighlight: "bg-gradient-to-br from-purple-300 to-violet-400",
    headerHighlight: "bg-gradient-to-r from-purple-500 to-violet-600",
  },
};

// Edge color configuration with custom colors per node pair
const nodeStyleOptions: NodeStyleOptions = {
  colors: nodeColors,
  edgeColors: {
    edge: "#6366f1", // indigo-500 - default
    hover: "#818cf8", // indigo-400 - default hover
    notConnectable: "#f87171", // red-400
    customColor: (context) => {
      const { sourceNodeId, targetNodeId, isNewEdge, hasTarget, isConnectable } = context;

      // Handle new edges first (being drawn)
      if (isNewEdge) {
        // New edge without target (mouse in empty space): gray color
        if (!hasTarget) {
          return {
            edge: "#9ca3af", // gray-400
            hover: "#9ca3af",
          };
        }

        // New edge with invalid target (cannot connect): red color
        if (!isConnectable) {
          return {
            edge: "#f87171", // red-400
            hover: "#fca5a5", // red-300
          };
        }

        // New edge with valid target: continue to check node type colors below
      }

      // Type A nodes: blue edges
      if (sourceNodeId.includes("typeA") || targetNodeId.includes("typeA")) {
        return {
          edge: "#3b82f6", // blue-500
          hover: "#60a5fa", // blue-400
        };
      }
      // Type B nodes: orange edges
      if (sourceNodeId.includes("typeB") || targetNodeId.includes("typeB")) {
        return {
          edge: "#f97316", // orange-500
          hover: "#fb923c", // orange-400
        };
      }
      // Multiple nodes: green edges
      if (sourceNodeId.includes("Multi") || targetNodeId.includes("multiple")) {
        return {
          edge: "#10b981", // emerald-500
          hover: "#34d399", // emerald-400
        };
      }
      // SingleInput/OnePerPort: pink/rose edges
      if (sourceNodeId.includes("source") && (targetNodeId.includes("single") || targetNodeId.includes("perPort"))) {
        return {
          edge: "#ec4899", // pink-500
          hover: "#f472b6", // pink-400
        };
      }
      // Default: use default colors
      return undefined;
    },
  },
};

const getDescription = (type: string): string[] => {
  switch (type) {
    case "singleInput":
      return [
        "Input: Only ONE connection allowed",
        "across ALL ports (input1 OR input2)",
        "Try: Connect to input1, then try",
        "connecting to input2 - it will fail",
      ];
    case "onePerPort":
      return [
        "Input: ONE connection per port",
        "Multiple ports can have connections",
        "Try: Connect to port1, port2, port3",
        "Second edge to same port fails",
      ];
    case "multiple":
      return [
        "Input: UNLIMITED connections",
        "to the same port allowed",
        "Try: Connect multiple sources",
        "to the 'data' port",
      ];
    case "typeA":
      return [
        "Type Matching: Only accepts typeA",
        "Multiple connections allowed",
        "Try: Connect from typeA sources",
        "Connecting from typeB will fail",
      ];
    case "typeB":
      return [
        "Type Matching: Only accepts typeB",
        "Multiple connections allowed",
        "Try: Connect from typeB sources",
        "Connecting from typeA will fail",
      ];
    case "output":
      return [
        "Output: Accepts any input type",
        "No restrictions on connections",
        "Try: Connect from any node",
      ];
    default:
      return [];
  }
};

// Custom validation function
const validateConnection = (expectEdge: GUIEdgeData, existingEdges: GUIEdgeData[]): boolean => {
  const sourceNode = store.nodes.find((node) => node.nodeId === expectEdge.source.nodeId);
  const targetNode = store.nodes.find((node) => node.nodeId === expectEdge.target.nodeId);

  if (!sourceNode || !targetNode) return false;

  // Rule 1: Single input nodes can only have ONE input total across all ports
  if (targetNode.type === "singleInput") {
    // Check ALL edges to this target node (not just same port)
    const allEdgesToThisNode = store.edges.filter((edge) => edge.target.nodeId === expectEdge.target.nodeId);
    // Already has an input, no more allowed
    return allEdgesToThisNode.length === 0;
  }

  // Rule 2: One per port nodes can have one input per port (but multiple ports can have inputs)
  if (targetNode.type === "onePerPort") {
    const existingToSamePort = existingEdges.filter((edge) => edge.target.index === expectEdge.target.index);
    return existingToSamePort.length === 0;
  }

  // Rule 3: Multiple nodes allow multiple inputs to the SAME port
  if (targetNode.type === "multiple") {
    // Multiple connections to same port are allowed
    return true;
  }

  // Rule 4: Type matching - typeA can only connect to typeA, typeB to typeB
  // Type matching nodes also allow multiple connections
  if (sourceNode.type === "typeA" || sourceNode.type === "typeB") {
    return targetNode.type === "output" || sourceNode.type === targetNode.type;
  }

  // Rule 5: Default behavior for other nodes - one input per port
  const existingToSamePort = existingEdges.filter((edge) => edge.target.index === expectEdge.target.index);
  if (existingToSamePort.length > 0) {
    return false; // Already has an input on this port
  }

  return true;
};

const getInputs = (nodeData: { type: string }) => {
  switch (nodeData.type) {
    case "singleInput":
      return [{ name: "input1" }, { name: "input2" }];
    case "onePerPort":
      return [{ name: "port1" }, { name: "port2" }, { name: "port3" }];
    case "multiple":
      return [{ name: "data" }];
    case "typeA":
    case "typeB":
      return [{ name: "in" }];
    case "output":
      return [{ name: "result" }];
    default:
      return [];
  }
};

const getOutputs = (nodeData: { type: string }) => {
  switch (nodeData.type) {
    case "singleInput":
    case "onePerPort":
    case "multiple":
    case "typeA":
    case "typeB":
      return [{ name: "out" }];
    case "output":
      return [];
    default:
      return [];
  }
};

// Initialize sample graph
const loadSampleGraph = () => {
  store.initData(
    [
      // Left column - Sources (spacing: 220px)
      { nodeId: "sourceA1", type: "typeA", position: { x: 100, y: 50 }, data: {} },
      { nodeId: "sourceA2", type: "typeA", position: { x: 100, y: 270 }, data: {} },
      { nodeId: "sourceB1", type: "typeB", position: { x: 100, y: 490 }, data: {} },
      { nodeId: "sourceB2", type: "typeB", position: { x: 100, y: 710 }, data: {} },
      { nodeId: "sourceMulti", type: "multiple", position: { x: 100, y: 930 }, data: {} },

      // Middle column - Validation nodes (spacing: 280px)
      { nodeId: "single1", type: "singleInput", position: { x: 450, y: 50 }, data: {} },
      { nodeId: "perPort1", type: "onePerPort", position: { x: 450, y: 330 }, data: {} },
      { nodeId: "multiple1", type: "multiple", position: { x: 450, y: 610 }, data: {} },
      { nodeId: "typeA1", type: "typeA", position: { x: 450, y: 890 }, data: {} },

      // Right column - More typeA/B for testing
      { nodeId: "typeA2", type: "typeA", position: { x: 800, y: 190 }, data: {} },
      { nodeId: "typeB1", type: "typeB", position: { x: 800, y: 750 }, data: {} },

      // Far right - Output
      { nodeId: "output", type: "output", position: { x: 1150, y: 470 }, data: {} },
    ],
    [
      // Initial connections to demonstrate validation
      { type: "edge", source: { nodeId: "sourceA1", index: 0 }, target: { nodeId: "single1", index: 0 } },
      { type: "edge", source: { nodeId: "sourceB1", index: 0 }, target: { nodeId: "perPort1", index: 0 } },
      { type: "edge", source: { nodeId: "sourceB2", index: 0 }, target: { nodeId: "perPort1", index: 1 } },
      { type: "edge", source: { nodeId: "sourceMulti", index: 0 }, target: { nodeId: "multiple1", index: 0 } },
      { type: "edge", source: { nodeId: "sourceA2", index: 0 }, target: { nodeId: "typeA1", index: 0 } },
      { type: "edge", source: { nodeId: "typeA1", index: 0 }, target: { nodeId: "typeA2", index: 0 } },
    ],
    {}
  );
};

loadSampleGraph();
</script>
