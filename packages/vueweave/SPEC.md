# VueWeave API Specification

## Overview

VueWeave is a Vue 3 Pinia-based library for building node-based graph editors. It provides a minimal API surface with multiple approaches:

1. **Direct store access** (Recommended): Use `useFlowStore()` directly for the most straightforward approach
2. **Composable approach**: Use `useGraphCanvas()` for explicit prop management and custom validation
3. **Props-based approach**: Pass all props explicitly for complete control
4. **Customizable styling**: Use object-based or function-based node styling configuration

## Core Composable: `useGraphCanvas`

The main entry point for using VueWeave. It provides all necessary state and handlers for the `GraphCanvasBase` component.

### Basic Usage

```typescript
import { useGraphCanvas } from "vueweave";

const {
  nodes,              // Computed<GUINodeData[]> - reactive nodes array
  edges,              // Computed<GUIEdgeData[]> - reactive edges array
  nodeRecords,        // Computed<GUINodeDataRecord> - node lookup by ID
  updateNodePosition, // (index: number, position: NodePositionData) => void
  saveNodePosition,   // () => void
  validateConnection, // ValidateConnectionFn - default allows one edge per input
  initData,           // (nodes, edges, extra) => void
  pushNode,           // (node: GUINodeData) => void
  store,              // Direct access to Pinia store for advanced usage
} = useGraphCanvas();
```

### Options

```typescript
type UseGraphCanvasOptions = {
  validateConnection?: ValidateConnectionFn;
  onSavePosition?: () => void;
};

const graph = useGraphCanvas({
  // Custom validation logic
  validateConnection: (expectEdge, existingEdges) => {
    // Return true to allow connection, false to deny
    return customValidationLogic(expectEdge, existingEdges);
  },
  // Callback after position is saved
  onSavePosition: () => {
    console.log("Position saved!");
  },
});
```

## Components

### GraphCanvasBase

The main canvas component for rendering the graph.

#### Zero Configuration Usage

GraphCanvasBase works without any configuration:

```vue
<template>
  <GraphCanvasBase />
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { useFlowStore, GraphCanvasBase } from "vueweave";

const flowStore = useFlowStore();

onMounted(() => {
  flowStore.initData(
    [
      { type: "node", nodeId: "A", position: { x: 100, y: 100 }, data: { label: "Node A" } },
      { type: "node", nodeId: "B", position: { x: 400, y: 100 }, data: { label: "Node B" } },
    ],
    [
      { type: "edge", source: { nodeId: "A", index: 0 }, target: { nodeId: "B", index: 0 } },
    ],
    {}
  );
});
</script>
```

Default nodes automatically include:
- Single input and output port
- Node ID as header
- `data.label`, `type`, or "Node" as body

#### Custom Node Rendering

```vue
<template>
  <GraphCanvasBase
    :nodes="nodes"
    :edges="edges"
    :node-records="nodeRecords"
    :update-position="updateNodePosition"
    :save-position="saveNodePosition"
    :validate-connection="validateConnection"
  >
    <template #node="{ nodeData }">
      <!-- Custom node rendering -->
      <NodeBase :inputs="getInputs(nodeData)" :outputs="getOutputs(nodeData)">
        <template #header>
          <div>{{ nodeData.nodeId }}</div>
        </template>
        <template #body-main>
          <div>{{ nodeData.type }}</div>
        </template>
      </NodeBase>
    </template>
  </GraphCanvasBase>
</template>
```

#### Props

All props are optional. When not provided, `GraphCanvasBase` uses internal state management.

- `nodes`: Array of node data (optional)
- `edges`: Array of edge data (optional)
- `node-records`: Node lookup by ID (optional)
- `update-position`: Handler for node drag operations (optional)
- `save-position`: Handler for node drag end (optional)
- `validate-connection`: Handler for edge creation validation (optional)
- `node-styles`: Node styling configuration (optional) - See [Node Styling System](#node-styling-system)
  - `colors`: Object-based color mapping
  - `functions`: Function-based style configuration
- `get-node-key`: Custom key function for node rendering (optional, default: `${nodeId}-${index}`)

#### Slots

- `#node="{ nodeData, nodeIndex }"`: Custom node rendering
  - **If not provided**: Automatically renders default nodes with single input/output
- `#head`: Optional content above canvas

#### Default Node Rendering

When no `#node` slot is provided, GraphCanvasBase automatically renders nodes using NodeBase with:
- Single input port: `{ name: "in" }`
- Single output port: `{ name: "out" }`
- Header: Displays `nodeData.nodeId`
- Body: Displays `nodeData.data.label`, `nodeData.type`, or "Node" (in that priority)

### NodeBase

Base component for rendering individual nodes.

```vue
<NodeBase
  :inputs="[{ name: 'input1' }, { name: 'input2' }]"
  :outputs="[{ name: 'output' }]"
  @open-node-edit-menu="handleNodeClick"
>
  <template #header>
    <div class="node-header">{{ title }}</div>
  </template>
  <template #body-main>
    <div class="node-body">{{ content }}</div>
  </template>
</NodeBase>
```

#### Props

- `inputs`: Array of input port definitions `{ name: string }[]`
- `outputs`: Array of output port definitions `{ name: string }[]`

#### Events

- `@open-node-edit-menu`: Emitted on node click

#### Slots

- `#header`: Node header content
- `#body-main`: Node body content

## Node Styling System

VueWeave provides a flexible styling system that supports three levels of customization:

1. **Default styling** - Works out of the box without configuration (blue theme)
2. **Object-based configuration** - Simple color mapping for node types
3. **Function-based configuration** - Full control over styling logic

### Default Styling (Zero Configuration)

By default, all nodes use a blue color scheme. No configuration needed:

```vue
<template>
  <GraphCanvasBase ref="graphCanvas">
    <template #node="{ nodeData }">
      <NodeBase :inputs="getInputs(nodeData)" :outputs="getOutputs(nodeData)">
        <template #header>
          <div class="w-full rounded-t-md py-2 text-center text-white">
            {{ nodeData.nodeId }}
          </div>
        </template>
      </NodeBase>
    </template>
  </GraphCanvasBase>
</template>
```

### Object-Based Color Configuration (Recommended)

Define colors for each node type using a simple object:

```typescript
import { type NodeColorConfig } from "vueweave";

const nodeColors: NodeColorConfig = {
  // Custom colors for 'source' node type
  source: {
    main: "bg-purple-400",           // Normal body background
    header: "bg-purple-500",         // Normal header background
    mainHighlight: "bg-purple-200",  // Highlighted body (during drag)
    headerHighlight: "bg-purple-300", // Highlighted header (during drag)
  },
  // Custom colors for 'processor' node type
  processor: {
    main: "bg-green-400",
    header: "bg-green-500",
    mainHighlight: "bg-green-200",
    headerHighlight: "bg-green-300",
  },
  // Custom colors for 'output' node type
  output: {
    main: "bg-blue-400",
    header: "bg-blue-500",
    mainHighlight: "bg-blue-200",
    headerHighlight: "bg-blue-300",
  },
  // Optional default for unmatched types
  default: {
    main: "bg-gray-400",
    header: "bg-gray-500",
    mainHighlight: "bg-gray-200",
    headerHighlight: "bg-gray-300",
  },
};
```

Pass to GraphCanvasBase:

```vue
<template>
  <GraphCanvasBase :node-styles="{ colors: nodeColors }">
    <!-- node template -->
  </GraphCanvasBase>
</template>
```

**Benefits:**
- Simple object-based configuration
- No need to write functions
- Tailwind CSS class names
- Automatic fallback to default colors

### Function-Based Configuration (Advanced)

For complete control, provide custom style functions:

```typescript
import { type NodeStyleConfig } from "vueweave";

const customStyles: NodeStyleConfig = {
  // Custom main body class
  nodeMainClass: (expectNearNode, nodeData) => {
    if (nodeData.type === "important") {
      return expectNearNode ? "bg-red-200" : "bg-red-500";
    }
    return expectNearNode ? "bg-blue-200" : "bg-blue-400";
  },

  // Custom header class
  nodeHeaderClass: (expectNearNode, nodeData) => {
    if (nodeData.type === "important") {
      return expectNearNode ? "bg-red-300" : "bg-red-600";
    }
    return expectNearNode ? "bg-blue-300" : "bg-blue-500";
  },

  // Custom output port class
  nodeOutputClass: (expectNearNode, nodeData, isConnectable) => {
    return expectNearNode
      ? (isConnectable ? "bg-green-200" : "bg-red-600")
      : "bg-green-500";
  },

  // Custom input port class
  nodeInputClass: (expectNearNode, nodeData, input, isConnectable) => {
    // Special styling for mapTo inputs
    if (input.mapTo) {
      return expectNearNode
        ? (isConnectable ? "bg-red-200" : "bg-red-700")
        : "bg-red-400";
    }
    return expectNearNode
      ? (isConnectable ? "bg-blue-200" : "bg-red-600")
      : "bg-blue-500";
  },
};
```

Pass to GraphCanvasBase:

```vue
<template>
  <GraphCanvasBase :node-styles="{ functions: customStyles }">
    <!-- node template -->
  </GraphCanvasBase>
</template>
```

### Type Definitions

```typescript
// Simple object-based configuration
type NodeColorConfig = {
  [nodeType: string]: {
    main?: string;              // Main body background
    header?: string;            // Header background
    mainHighlight?: string;     // Body when highlighted
    headerHighlight?: string;   // Header when highlighted
  };
};

// Function-based configuration
type NodeStyleFn = (expectNearNode: boolean, nodeData: GUINodeData) => string;
type NodeOutputStyleFn = (expectNearNode: boolean, nodeData: GUINodeData, isConnectable?: boolean) => string;
type NodeInputStyleFn = (expectNearNode: boolean, nodeData: GUINodeData, input: InputOutputData, isConnectable?: boolean) => string;

type NodeStyleConfig = {
  nodeMainClass?: NodeStyleFn;
  nodeHeaderClass?: NodeStyleFn;
  nodeOutputClass?: NodeOutputStyleFn;
  nodeInputClass?: NodeInputStyleFn;
};

// Combined configuration
type NodeStyleOptions = {
  colors?: NodeColorConfig;      // Simple approach
  functions?: NodeStyleConfig;   // Advanced approach
};
```

### Complete Styling Example

```vue
<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { GraphCanvasBase, NodeBase, type GUINodeData, type NodeColorConfig } from "vueweave";

const graphCanvas = ref<InstanceType<typeof GraphCanvasBase>>();

// Simple object-based color configuration
const nodeColors: NodeColorConfig = {
  source: {
    main: "bg-purple-400",
    header: "bg-purple-500",
    mainHighlight: "bg-purple-200",
    headerHighlight: "bg-purple-300",
  },
  processor: {
    main: "bg-green-400",
    header: "bg-green-500",
    mainHighlight: "bg-green-200",
    headerHighlight: "bg-green-300",
  },
  output: {
    main: "bg-blue-400",
    header: "bg-blue-500",
    mainHighlight: "bg-blue-200",
    headerHighlight: "bg-blue-300",
  },
};

onMounted(() => {
  graphCanvas.value?.initData(
    [
      { type: "source", nodeId: "input1", position: { x: 50, y: 100 }, data: { value: "Data A" } },
      { type: "processor", nodeId: "process1", position: { x: 300, y: 100 }, data: { name: "Process" } },
      { type: "output", nodeId: "output1", position: { x: 550, y: 100 }, data: { name: "Output" } },
    ],
    [
      { type: "edge", source: { nodeId: "input1", index: 0 }, target: { nodeId: "process1", index: 0 } },
      { type: "edge", source: { nodeId: "process1", index: 0 }, target: { nodeId: "output1", index: 0 } },
    ],
    {}
  );
});

const getInputs = (nodeData: GUINodeData) => {
  return nodeData.type === "source" ? [] : [{ name: "input" }];
};

const getOutputs = () => [{ name: "output" }];
</script>

<template>
  <GraphCanvasBase ref="graphCanvas" :node-styles="{ colors: nodeColors }">
    <template #node="{ nodeData }">
      <NodeBase :inputs="getInputs(nodeData)" :outputs="getOutputs()">
        <template #header>
          <div class="w-full rounded-t-md py-2 text-center text-white">
            {{ nodeData.nodeId }}
          </div>
        </template>
        <template #body-main>
          <div class="p-2 text-center">
            <div class="font-semibold">{{ nodeData.type }}</div>
          </div>
        </template>
      </NodeBase>
    </template>
  </GraphCanvasBase>
</template>
```

### Styling Implementation Details

The styling system uses Vue's provide/inject pattern:

1. **GraphCanvasBase** receives `nodeStyles` prop
2. Resolves configuration (colors → functions or uses provided functions)
3. Provides resolved functions via `NODE_STYLE_KEY`
4. **NodeBase** injects style functions with default fallback
5. Applies classes dynamically based on node state

This architecture allows:
- Zero configuration (defaults work automatically)
- Global style configuration via props
- No prop drilling to child components
- Complete style customization without modifying components

## Usage Approaches

### Approach 1: Direct Store Access (Recommended)

The recommended way to use VueWeave. Use `useFlowStore()` directly.

```vue
<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useFlowStore, GraphCanvasBase, NodeBase, type GUINodeData } from "vueweave";

const flowStore = useFlowStore();

// Access reactive state
const nodes = computed(() => flowStore.nodes);
const edges = computed(() => flowStore.edges);

onMounted(() => {
  flowStore.initData(
    [
      { type: "source", nodeId: "input", position: { x: 50, y: 100 }, data: { value: "Hello" } },
      { type: "output", nodeId: "output", position: { x: 300, y: 100 }, data: { name: "Output" } },
    ],
    [
      { type: "edge", source: { nodeId: "input", index: 0 }, target: { nodeId: "output", index: 0 } },
    ],
    {}
  );
});

const getInputs = (nodeData: GUINodeData) => {
  return nodeData.type === "output" ? [{ name: "input" }] : [];
};

const getOutputs = () => [{ name: "output" }];
</script>

<template>
  <div>
    <div>Nodes: {{ nodes.length }}</div>
    <GraphCanvasBase>
      <template #node="{ nodeData }">
        <NodeBase :inputs="getInputs(nodeData)" :outputs="getOutputs()">
          <template #header>{{ nodeData.nodeId }}</template>
          <template #body-main>{{ nodeData.type }}</template>
        </NodeBase>
      </template>
    </GraphCanvasBase>
  </div>
</template>
```

**Key benefits:**
- No component refs needed
- Direct store access - most straightforward
- Clean and simple
- Reactive state for UI updates

### Approach 2: Using `useGraphCanvas` Composable

For more control over state or to access reactive computed values.

```vue
<script setup lang="ts">
import { computed } from "vue";
import { GraphCanvasBase, NodeBase, useGraphCanvas, type GUINodeData } from "vueweave";

const {
  nodes, edges, nodeRecords,
  updateNodePosition, saveNodePosition, validateConnection,
  initData, pushNode
} = useGraphCanvas();

initData(
  [
    { type: "static", nodeId: "input", position: { x: 50, y: 100 }, data: { value: "Hello" } },
  ],
  [],
  {}
);

// Access reactive state
const nodeCount = computed(() => nodes.value.length);

const getInputs = (nodeData: GUINodeData) => {
  return nodeData.type === "computed" ? [{ name: "input" }] : [];
};
</script>

<template>
  <div>
    <div>Nodes: {{ nodeCount }}</div>
    <GraphCanvasBase
      :nodes="nodes"
      :edges="edges"
      :node-records="nodeRecords"
      :update-position="updateNodePosition"
      :save-position="saveNodePosition"
      :validate-connection="validateConnection"
    >
      <template #node="{ nodeData }">
        <NodeBase :inputs="getInputs(nodeData)" :outputs="getOutputs()">
          <template #header>{{ nodeData.nodeId }}</template>
        </NodeBase>
      </template>
    </GraphCanvasBase>
  </div>
</template>
```

**Key benefits:**
- Full access to reactive computed state
- Can combine with other composables
- Explicit prop passing for clarity

### Approach 3: Direct Store Access (Most Flexible)

Use `useFlowStore()` directly for the most straightforward approach.

```vue
<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useFlowStore, GraphCanvasBase, NodeBase, type GUINodeData } from "vueweave";

const flowStore = useFlowStore();

// Access reactive state via computed
const nodes = computed(() => flowStore.nodes);
const edges = computed(() => flowStore.edges);

onMounted(() => {
  flowStore.initData([], [], {});
});

const addNode = () => {
  flowStore.pushNode({
    type: "processor",
    nodeId: `node${nodes.value.length + 1}`,
    position: { x: 100, y: 100 },
    data: { name: "New Node" },
  });
};

const getInputs = (nodeData: GUINodeData) => {
  return nodeData.type === "output" ? [{ name: "input" }] : [];
};
</script>

<template>
  <div>
    <button @click="addNode">Add Node (Count: {{ nodes.length }})</button>
    <GraphCanvasBase>
      <template #node="{ nodeData }">
        <NodeBase :inputs="getInputs(nodeData)" :outputs="getOutputs()">
          <template #header>{{ nodeData.nodeId }}</template>
        </NodeBase>
      </template>
    </GraphCanvasBase>
  </div>
</template>
```

**Key benefits:**
- No component refs needed
- Direct store access - most straightforward
- Clean and simple
- Works great with reactive computed properties

## Complete Example

These examples are now at the top of the document under "Usage Approaches".

## Type Definitions

### GUINodeData

```typescript
type GUINodeData<T = unknown> = {
  type: string;  // Fully customizable - use any string value for node types
  nodeId: string;
  position: NodePositionData;
  data: T;
};
```

**Note:** The `type` field is fully customizable and accepts any string value. This allows you to define your own node types like `"source"`, `"processor"`, `"output"`, `"llm"`, `"database"`, etc. There are no restrictions on node type names.

### NodePositionData

```typescript
type NodePositionData = {
  x: number;
  y: number;
  width?: number;
  height?: number;
  inputCenters?: number[];
  outputCenters?: number[];
};
```

### GUIEdgeData

```typescript
type GUIEdgeData = {
  type: "edge";
  source: EdgeEndPointData;
  target: EdgeEndPointData;
};

type EdgeEndPointData = {
  nodeId: string;
  index: number;
};
```

### ValidateConnectionFn

```typescript
type ValidateConnectionFn = (
  expectEdge: GUIEdgeData,
  existingEdges: GUIEdgeData[]
) => boolean;
```

## Advanced Usage

### History Management (Undo/Redo)

VueWeave includes built-in history management:

```vue
<script setup lang="ts">
import { useFlowStore } from "vueweave";

const flowStore = useFlowStore();

// Undo/Redo operations
const handleUndo = () => {
  if (flowStore.undoable) {
    flowStore.undo();
  }
};

const handleRedo = () => {
  if (flowStore.redoable) {
    flowStore.redo();
  }
};
</script>

<template>
  <div>
    <button @click="handleUndo" :disabled="!flowStore.undoable">Undo</button>
    <button @click="handleRedo" :disabled="!flowStore.redoable">Redo</button>
  </div>
</template>
```

**History is automatically tracked for:**
- Node addition (`pushNode`)
- Node deletion (`deleteNode`)
- Edge addition (`pushEdge`)
- Edge deletion (`deleteEdge`)
- Node position changes (on drag end via `saveNodePositionData`)
- Data initialization (`initData`, `loadData`)
- Extra data updates (`updateExtra`)

**Store properties:**
- `undoable` (computed): `true` if undo is available
- `redoable` (computed): `true` if redo is available
- `histories`: Array of history states
- `currentData`: Current graph state

### Direct Store Access

For advanced use cases, you can access the Pinia store directly:

```typescript
const { store } = useGraphCanvas();

// Access store methods
store.updateNodeAt(index, updateFn, actionName, saveHistory);
store.updateNodesAndEdges(nodeUpdateFn, edgeUpdateFn, actionName, saveHistory);

// Access raw state
console.log(store.nodes);
console.log(store.edges);
```

### Custom Edge Validation Examples

#### Validation Example Demo

VueWeave includes a comprehensive Validation Example (`/validation` route) demonstrating different connection rules:

**Node Types:**
- **singleInput**: Only ONE connection allowed across ALL ports
  - Has 2 ports (input1, input2) but only one can have a connection
  - Use case: Exclusive selection, single source nodes
- **onePerPort**: ONE connection per port (multiple ports can have connections)
  - Has 3 ports (port1, port2, port3), each can have one connection
  - Use case: Multiple independent inputs
- **multiple**: Unlimited connections to the same port
  - Has 1 port (data) that accepts unlimited connections
  - Use case: Aggregation, fan-in patterns
- **typeA / typeB**: Type matching with multiple connections allowed
  - Only accepts connections from same type
  - Allows multiple connections if types match
  - Use case: Type-safe data flow
- **output**: Accepts any input type with no restrictions

**Implementation Example:**

```typescript
const validateConnection = (expectEdge: GUIEdgeData, existingEdges: GUIEdgeData[]): boolean => {
  const sourceNode = store.nodes.find((n) => n.nodeId === expectEdge.source.nodeId);
  const targetNode = store.nodes.find((n) => n.nodeId === expectEdge.target.nodeId);

  // Rule 1: Single input nodes - only one connection total
  if (targetNode.type === "singleInput") {
    const allEdgesToThisNode = store.edges.filter((edge) => edge.target.nodeId === expectEdge.target.nodeId);
    return allEdgesToThisNode.length === 0;
  }

  // Rule 2: One per port - one connection per port
  if (targetNode.type === "onePerPort") {
    const existingToSamePort = existingEdges.filter((edge) => edge.target.index === expectEdge.target.index);
    return existingToSamePort.length === 0;
  }

  // Rule 3: Multiple - unlimited connections
  if (targetNode.type === "multiple") {
    return true;
  }

  // Rule 4: Type matching - only same type, multiple OK
  if (sourceNode.type === "typeA" || sourceNode.type === "typeB") {
    if (targetNode.type !== "output" && sourceNode.type !== targetNode.type) {
      return false; // Type mismatch
    }
    return true; // Multiple connections OK
  }

  return true;
};
```

#### Simple Custom Validation

The default validation allows one edge per target input. You can customize this:

```typescript
const { validateConnection } = useGraphCanvas({
  validateConnection: (expectEdge, existingEdges) => {
    // Allow multiple edges to same target
    return true;

    // Or implement custom logic
    // Check node types, port types, prevent cycles, etc.
  },
});
```

### Edge Validation with Node Type Checking

```typescript
const { validateConnection, nodeRecords } = useGraphCanvas({
  validateConnection: (expectEdge, existingEdges) => {
    const sourceNode = nodeRecords.value[expectEdge.source.nodeId];
    const targetNode = nodeRecords.value[expectEdge.target.nodeId];

    // Only allow connections from static to computed nodes
    if (sourceNode.type === "static" && targetNode.type === "computed") {
      return existingEdges.length === 0;
    }

    return false;
  },
});
```

## Migration Guide

### From Component Refs to Direct Store Access

If you were using component refs, switch to direct store access:

#### Before (using component refs - NOT RECOMMENDED)

```vue
<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { GraphCanvasBase } from "vueweave";

const graphCanvas = ref<InstanceType<typeof GraphCanvasBase>>();

const nodes = computed(() => graphCanvas.value?.store.nodes ?? []);

onMounted(() => {
  graphCanvas.value?.initData(myNodes, myEdges, {});
});

const addNode = () => {
  graphCanvas.value?.pushNode(newNode);
};
</script>

<template>
  <GraphCanvasBase ref="graphCanvas">
    <!-- node template -->
  </GraphCanvasBase>
</template>
```

#### After (using useFlowStore - RECOMMENDED)

```vue
<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useFlowStore, GraphCanvasBase } from "vueweave";

const flowStore = useFlowStore();

const nodes = computed(() => flowStore.nodes);

onMounted(() => {
  flowStore.initData(myNodes, myEdges, {});
});

const addNode = () => {
  flowStore.pushNode(newNode);
};
</script>

<template>
  <GraphCanvasBase>
    <!-- node template -->
  </GraphCanvasBase>
</template>
```

**Benefits:**
- No component refs needed
- Cleaner code
- Direct access to store
- Better for testing

## Best Practices

1. **Use `useFlowStore()` directly** - Most straightforward approach for most use cases
2. **Access store state via computed** - Always wrap store access in `computed()` for reactivity
3. **Use `useGraphCanvas` composable when you need**:
   - Custom validation logic
   - Explicit prop passing for full control
   - Integration with other state management
4. **Avoid component refs** - Don't use `ref<GraphCanvasBase>()` unless absolutely necessary
5. **Implement custom `validateConnection`** - For application-specific edge rules (pass as option or prop)
6. **Keep node rendering logic in components** - Use slots for flexibility
7. **Use TypeScript generics for node data** - `GUINodeData<MyDataType>` for type safety
8. **Node Styling Best Practices**:
   - Start with default styling (no configuration needed)
   - Use object-based `colors` config for simple color customization
   - Only use function-based styling when you need complex logic
   - Define node types that match your domain (e.g., "source", "processor", "sink")
   - Keep Tailwind classes in your safelist if using dynamic generation
9. **Node Type Naming**:
   - Use descriptive, domain-specific type names
   - Consider namespacing for complex apps (e.g., "data:source", "llm:completion")
   - Avoid generic names like "node1", "node2" - use meaningful types

## Error Handling

VueWeave validates edges at runtime and logs errors to console:

```
[VueWeave] Invalid edge: missing node. Source: node1, Target: node2
[VueWeave] Invalid edge: source node "node1" does not have output at index 0. Available outputs: 2
[VueWeave] Invalid edge: target node "node2" does not have input at index 1. Available inputs: 1
```

**Validation behavior:**
- Missing nodes: Always triggers error
- Port index validation: Only checked after nodes are rendered and ports are initialized
- During initialization: Port validation is skipped (ports not yet rendered)
- After rendering: Full validation including port index checks

Invalid edges are automatically filtered out from rendering.

**Note:** You may see port validation warnings during initial page load. These are harmless and occur because edge validation runs before nodes finish rendering their ports. The edges will display correctly once nodes are fully rendered.
