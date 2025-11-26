<template>
  <div class="flex h-screen w-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900">
    <DebugPanel github-url="https://github.com/receptron/graphai/blob/main/packages/vueweave/src/views/ValidationExample.vue" />
    <div class="flex-1">
      <GraphCanvasBase :node-styles="{ colors: nodeColors }" :validate-connection="validateConnection">
        <template #node="{ nodeData }">
          <NodeBase :inputs="getInputs(nodeData)" :outputs="getOutputs(nodeData)">
            <template #header>
              <div class="w-full rounded-t-lg py-3 text-center font-semibold text-white shadow-lg">
                {{ nodeData.nodeId }}
              </div>
            </template>
            <template #default>
              <div class="p-2 text-xs text-gray-700">
                <div class="font-semibold">{{ nodeData.type }}</div>
                <div class="mt-1 text-[10px]">{{ getValidationRule(nodeData.type) }}</div>
              </div>
            </template>
          </NodeBase>
        </template>
      </GraphCanvasBase>
    </div>
  </div>
</template>

<script setup lang="ts">
import { GraphCanvasBase, NodeBase, useFlowStore, type NodeColorConfig, type GUIEdgeData } from "../package";
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

const getValidationRule = (type: string): string => {
  switch (type) {
    case "singleInput":
      return "Only 1 input total (any port)";
    case "onePerPort":
      return "1 input per port (multiple ports OK)";
    case "multiple":
      return "Multiple inputs per port OK";
    case "typeA":
    case "typeB":
      return `Only same type, multiple OK`;
    case "output":
      return "Accepts any input";
    default:
      return "";
  }
};

// Custom validation function
const validateConnection = (expectEdge: GUIEdgeData, existingEdges: GUIEdgeData[]): boolean => {
  const sourceNode = store.nodes.find((n) => n.nodeId === expectEdge.source.nodeId);
  const targetNode = store.nodes.find((n) => n.nodeId === expectEdge.target.nodeId);

  if (!sourceNode || !targetNode) return false;

  // Rule 1: Single input nodes can only have ONE input total across all ports
  if (targetNode.type === "singleInput") {
    // Check ALL edges to this target node (not just same port)
    const allEdgesToThisNode = store.edges.filter((edge) => edge.target.nodeId === expectEdge.target.nodeId);
    console.log("singleInput validation:", {
      targetNodeId: expectEdge.target.nodeId,
      allEdgesToThisNode: allEdgesToThisNode.length,
      existingEdges: existingEdges.length,
      edges: allEdgesToThisNode,
    });
    // Already has an input, no more allowed
    return (allEdgesToThisNode.length === 0);
  }

  // Rule 2: One per port nodes can have one input per port (but multiple ports can have inputs)
  if (targetNode.type === "onePerPort") {
    const existingToSamePort = existingEdges.filter((edge) => edge.target.index === expectEdge.target.index);
    if (existingToSamePort.length > 0) {
      return false; // Already has an input on this specific port
    }
    return true;
  }

  // Rule 3: Multiple nodes allow multiple inputs to the SAME port
  if (targetNode.type === "multiple") {
    // Multiple connections to same port are allowed
    return true;
  }

  // Rule 4: Type matching - typeA can only connect to typeA, typeB to typeB
  // Type matching nodes also allow multiple connections
  if (sourceNode.type === "typeA" || sourceNode.type === "typeB") {
    if (targetNode.type !== "output" && sourceNode.type !== targetNode.type) {
      return false; // Type mismatch
    }
    // Type matches, allow connection (multiple connections OK)
    return true;
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
      // Left column - Sources
      { nodeId: "sourceA1", type: "typeA", position: { x: 100, y: 60 } },
      { nodeId: "sourceA2", type: "typeA", position: { x: 100, y: 160 } },
      { nodeId: "sourceB1", type: "typeB", position: { x: 100, y: 280 } },
      { nodeId: "sourceB2", type: "typeB", position: { x: 100, y: 380 } },
      { nodeId: "sourceMulti", type: "multiple", position: { x: 100, y: 500 } },

      // Middle column - Validation nodes
      { nodeId: "single1", type: "singleInput", position: { x: 400, y: 60 } },
      { nodeId: "perPort1", type: "onePerPort", position: { x: 400, y: 200 } },
      { nodeId: "multiple1", type: "multiple", position: { x: 400, y: 360 } },
      { nodeId: "typeA1", type: "typeA", position: { x: 400, y: 500 } },

      // Right column - More typeA/B for testing
      { nodeId: "typeA2", type: "typeA", position: { x: 700, y: 100 } },
      { nodeId: "typeB1", type: "typeB", position: { x: 700, y: 280 } },

      // Far right - Output
      { nodeId: "output", type: "output", position: { x: 1000, y: 200 } },
    ],
    [
      // Initial connections to demonstrate validation
      { source: { nodeId: "sourceA1", index: 0 }, target: { nodeId: "single1", index: 0 } },
      { source: { nodeId: "sourceB1", index: 0 }, target: { nodeId: "perPort1", index: 0 } },
      { source: { nodeId: "sourceB2", index: 0 }, target: { nodeId: "perPort1", index: 1 } },
      { source: { nodeId: "sourceMulti", index: 0 }, target: { nodeId: "multiple1", index: 0 } },
      { source: { nodeId: "sourceA2", index: 0 }, target: { nodeId: "typeA1", index: 0 } },
      { source: { nodeId: "typeA1", index: 0 }, target: { nodeId: "typeA2", index: 0 } },
    ],
    {}
  );
};

loadSampleGraph();
</script>
