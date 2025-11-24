# VueWeave API Specification

## Overview

VueWeave is a Vue 3 composable-based library for building node-based graph editors. It provides a minimal API surface with two approaches:

1. **Zero-config approach**: Use `GraphCanvasBase` component directly with built-in state management
2. **Flexible approach**: Use `useGraphCanvas` composable for custom state management or pass props explicitly

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

- `nodes`: Array of node data
- `edges`: Array of edge data
- `node-records`: Node lookup by ID
- `update-position`: Handler for node drag operations
- `save-position`: Handler for node drag end
- `validate-connection`: Handler for edge creation validation

#### Slots

- `#node="{ nodeData, nodeIndex }"`: Custom node rendering
- `#head`: Optional content above canvas

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

## Usage Approaches

### Approach 1: Zero-Config (Recommended for Simple Cases)

The simplest way to use VueWeave. `GraphCanvasBase` has built-in state management using Pinia store.

```vue
<script setup lang="ts">
import { ref, onMounted } from "vue";
import { GraphCanvasBase, NodeBase, type GUINodeData } from "vueweave";

const graphCanvas = ref<InstanceType<typeof GraphCanvasBase>>();

onMounted(() => {
  graphCanvas.value?.initData(
    [
      { type: "static", nodeId: "input", position: { x: 50, y: 100 }, data: { value: "Hello" } },
      { type: "computed", nodeId: "output", position: { x: 300, y: 100 }, data: { name: "Output" } },
    ],
    [
      { type: "edge", source: { nodeId: "input", index: 0 }, target: { nodeId: "output", index: 0 } },
    ],
    {}
  );
});

const getInputs = (nodeData: GUINodeData) => {
  return nodeData.type === "computed" ? [{ name: "input" }] : [];
};

const getOutputs = () => [{ name: "output" }];
</script>

<template>
  <GraphCanvasBase ref="graphCanvas">
    <template #node="{ nodeData }">
      <NodeBase :inputs="getInputs(nodeData)" :outputs="getOutputs()">
        <template #header>{{ nodeData.nodeId }}</template>
        <template #body-main>{{ nodeData.type }}</template>
      </NodeBase>
    </template>
  </GraphCanvasBase>
</template>
```

**Key benefits:**
- No props required on `GraphCanvasBase`
- Access store operations via ref: `graphCanvas.value.initData()`, `graphCanvas.value.pushNode()`, `graphCanvas.value.store`
- Perfect for simple use cases

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

### Approach 3: Hybrid (Zero-config + Reactive Access)

Access the store for reactive values while keeping the component API simple.

```vue
<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { GraphCanvasBase, NodeBase, type GUINodeData } from "vueweave";

const graphCanvas = ref<InstanceType<typeof GraphCanvasBase>>();

// Access reactive state via store
const nodes = computed(() => graphCanvas.value?.store.nodes ?? []);
const edges = computed(() => graphCanvas.value?.store.edges ?? []);

onMounted(() => {
  graphCanvas.value?.initData([], [], {});
});

const addNode = () => {
  graphCanvas.value?.pushNode({
    type: "computed",
    nodeId: `node${nodes.value.length + 1}`,
    position: { x: 100, y: 100 },
    data: { name: "New Node" },
  });
};

const getInputs = (nodeData: GUINodeData) => {
  return nodeData.type === "computed" ? [{ name: "input" }] : [];
};
</script>

<template>
  <div>
    <button @click="addNode">Add Node (Count: {{ nodes.length }})</button>
    <GraphCanvasBase ref="graphCanvas">
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
- Simple component API
- Reactive state access for UI updates
- Best of both worlds

## Complete Example

These examples are now at the top of the document under "Usage Approaches".

## Type Definitions

### GUINodeData

```typescript
type GUINodeData<T = unknown> = {
  type: string;
  nodeId: string;
  position: NodePositionData;
  data: T;
};
```

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

### Custom Edge Validation

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

### From Direct Store Usage to Zero-Config

#### Before (verbose with store)

```vue
<script setup lang="ts">
import { computed } from "vue";
import { GraphCanvasBase, useFlowStore } from "vueweave";

const store = useFlowStore();

const nodes = computed(() => store.nodes);
const edges = computed(() => store.edges);
const nodeRecords = computed(() => store.nodeRecords);

const updateNodePosition = (index: number, position: NodePositionData) => {
  store.updateNodePosition(index, position);
};

const saveNodePosition = () => {
  store.saveNodePositionData();
};

const validateConnection = () => {
  return true;
};

store.initData(myNodes, myEdges, {});
</script>

<template>
  <GraphCanvasBase
    :nodes="nodes"
    :edges="edges"
    :node-records="nodeRecords"
    :update-position="updateNodePosition"
    :save-position="saveNodePosition"
    :validate-connection="validateConnection"
  >
    <!-- node template -->
  </GraphCanvasBase>
</template>
```

#### After (zero-config)

```vue
<script setup lang="ts">
import { ref, onMounted } from "vue";
import { GraphCanvasBase } from "vueweave";

const graphCanvas = ref<InstanceType<typeof GraphCanvasBase>>();

onMounted(() => {
  graphCanvas.value?.initData(myNodes, myEdges, {});
});
</script>

<template>
  <GraphCanvasBase ref="graphCanvas">
    <!-- node template -->
  </GraphCanvasBase>
</template>
```

### From Props to Zero-Config

If you were passing all props explicitly, you can now remove them:

#### Before

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
    <!-- content -->
  </GraphCanvasBase>
</template>
```

#### After

```vue
<template>
  <GraphCanvasBase ref="graphCanvas">
    <!-- content -->
  </GraphCanvasBase>
</template>
```

## Best Practices

1. **Start with zero-config approach** - Use `GraphCanvasBase` without props for simple cases
2. **Use hybrid approach for dynamic UIs** - Access `graphCanvas.value.store` for reactive state while keeping API simple
3. **Use `useGraphCanvas` composable when you need**:
   - Multiple graph canvases with separate state
   - Custom validation logic
   - Integration with other composables
4. **Only pass props explicitly when you need custom handlers** - Props override default behavior
5. **Implement custom `validateConnection`** - For application-specific edge rules (pass as option or prop)
6. **Keep node rendering logic in components** - Use slots for flexibility
7. **Use TypeScript generics for node data** - `GUINodeData<MyDataType>` for type safety

## Error Handling

VueWeave validates edges at runtime and logs errors to console:

```
[VueWeave] Invalid edge: missing node. Source: node1, Target: node2
[VueWeave] Invalid edge: source node "node1" does not have output at index 0. Available outputs: 0
[VueWeave] Invalid edge: target node "node2" does not have input at index 1. Available inputs: 1
```

Invalid edges are automatically filtered out from rendering.
