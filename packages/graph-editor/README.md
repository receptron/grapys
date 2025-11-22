# @receptron/vue-flow

A flexible, plugin-based graph editor component for Vue 3, inspired by React Flow.

## Features

- 🎨 **Flexible Node System** - Create custom nodes with slots
- 🔌 **Plugin Architecture** - Extend functionality with plugins
- 🎯 **Drag & Drop** - Intuitive node placement and edge creation
- 📱 **Touch Support** - Works on mobile devices
- ↩️ **Undo/Redo** - Built-in history management
- 🎨 **Customizable** - Full control over styling and behavior
- 📦 **TypeScript** - Full type safety
- 🚀 **Lightweight** - No heavy dependencies

## Installation

```bash
npm install @receptron/vue-flow pinia
# or
yarn add @receptron/vue-flow pinia
# or
pnpm add @receptron/vue-flow pinia
```

## Quick Start

```vue
<script setup>
import { GraphCanvas, useGraphStore } from '@receptron/vue-flow';
import { createPinia } from 'pinia';

const pinia = createPinia();
const store = useGraphStore(pinia);

// Add some nodes
store.pushNode({
  nodeId: 'node1',
  type: 'custom',
  position: { x: 100, y: 100 },
  data: {},
  profile: {
    id: 'custom',
    inputs: [{ name: 'in' }],
    outputs: [{ name: 'out' }],
  },
});

store.pushNode({
  nodeId: 'node2',
  type: 'custom',
  position: { x: 300, y: 100 },
  data: {},
  profile: {
    id: 'custom',
    inputs: [{ name: 'in' }],
    outputs: [{ name: 'out' }],
  },
});
</script>

<template>
  <div class="h-screen">
    <GraphCanvas />
  </div>
</template>
```

## Core Concepts

### Nodes

Nodes are the building blocks of your graph. Each node has:

- `nodeId`: Unique identifier
- `type`: Node type (for custom rendering)
- `position`: {x, y} coordinates
- `data`: Custom data payload
- `profile`: Optional node profile (defines inputs/outputs)

### Edges

Edges connect nodes together. Each edge has:

- `source`: { nodeId, index } - Source node and output port index
- `target`: { nodeId, index } - Target node and input port index

### Store

The graph store manages all state:

```ts
import { useGraphStore } from '@receptron/vue-flow';

const store = useGraphStore();

// Add nodes
store.pushNode(nodeData);

// Add edges
store.pushEdge(edgeData);

// Delete
store.deleteNode(index);
store.deleteEdge(index);

// History
store.undo();
store.redo();
```

## Customization

### Custom Nodes

Use slots to customize node rendering:

```vue
<GraphCanvas>
  <template #node-body="{ node }">
    <div>Custom body for {{ node.nodeId }}</div>
  </template>
  <template #node-footer="{ node }">
    <div>Custom footer</div>
  </template>
</GraphCanvas>
```

### Custom Node Component

Pass a completely custom node component:

```vue
<script setup>
import MyCustomNode from './MyCustomNode.vue';
</script>

<template>
  <GraphCanvas :node-component="MyCustomNode" />
</template>
```

## Plugin System

Extend functionality with plugins:

```ts
import { GraphEditorPlugin } from '@receptron/vue-flow';

const myPlugin: GraphEditorPlugin = {
  name: 'my-plugin',
  version: '1.0.0',

  onInit() {
    console.log('Plugin initialized');
  },

  onNodeAdd(node) {
    console.log('Node added:', node);
  },

  validateEdge(source, target, nodes, edges) {
    // Custom edge validation logic
    return true;
  },

  exportData(payload) {
    // Export to custom format
    return customFormat;
  },

  importData(data) {
    // Import from custom format
    return { nodes, edges, metadata };
  },
};

// Register plugin
store.registerPlugin(myPlugin);
```

## API Reference

### GraphCanvas Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `nodeComponent` | Component | `BaseNode` | Custom node component |

### GraphCanvas Events

| Event | Payload | Description |
|-------|---------|-------------|
| `open-node-editor` | `nodeIndex: number` | Node clicked (single click) |
| `node-click` | `{ event, nodeIndex }` | Node context menu (double click) |
| `edge-click` | `{ event, edgeIndex }` | Edge clicked (double click) |
| `canvas-click` | - | Empty canvas clicked |

### GraphCanvas Slots

| Slot | Props | Description |
|------|-------|-------------|
| `node-header` | `{ node, index }` | Custom node header |
| `node-body` | `{ node, index }` | Custom node body |
| `node-footer` | `{ node, index }` | Custom node footer |
| `content` | - | Custom canvas content (for overlays) |
| `context-menus` | - | Custom context menus |

### Store Methods

```ts
// Node operations
pushNode(node: GUINodeData): void
updateNodePosition(index: number, pos: NodePosition): void
updateNodeData(index: number, data: Partial<GUINodeData>): void
deleteNode(index: number): void

// Edge operations
pushEdge(edge: GUIEdgeData): void
deleteEdge(index: number): void

// History
undo(): void
redo(): void

// Data
loadData(payload: HistoryPayload): void
exportData(): unknown
importData(data: unknown): void

// Plugins
registerPlugin(plugin: GraphEditorPlugin): void
getPlugin(name: string): GraphEditorPlugin | undefined
```

## Examples

### Example: Custom Validation

```ts
const validationPlugin: GraphEditorPlugin = {
  name: 'validation',
  version: '1.0.0',

  validateEdge(source, target, nodes, edges) {
    const sourceNode = nodes.find(n => n.nodeId === source.nodeId);
    const targetNode = nodes.find(n => n.nodeId === target.nodeId);

    // Don't allow connecting same type nodes
    if (sourceNode?.type === targetNode?.type) {
      return false;
    }

    return true;
  },
};

store.registerPlugin(validationPlugin);
```

### Example: Data Import/Export

```ts
const dataPlugin: GraphEditorPlugin = {
  name: 'data-io',
  version: '1.0.0',

  exportData(payload) {
    return {
      version: '1.0',
      graph: payload,
      timestamp: Date.now(),
    };
  },

  importData(data: any) {
    return data.graph;
  },
};

store.registerPlugin(dataPlugin);

// Export
const data = store.exportData();

// Import
store.importData(data);
```

## TypeScript Support

Full TypeScript support with exported types:

```ts
import type {
  GUINodeData,
  GUIEdgeData,
  NodePosition,
  PortDefinition,
  NodeProfile,
  GraphEditorPlugin,
} from '@receptron/vue-flow';
```

## Styling

The package uses Tailwind CSS classes. Make sure to include them in your project or provide custom classes via node data:

```ts
store.pushNode({
  nodeId: 'custom-styled',
  type: 'custom',
  position: { x: 100, y: 100 },
  data: {
    customClass: 'bg-purple-500',
    customHeaderClass: 'bg-purple-700',
  },
  profile: { /* ... */ },
});
```

## License

MIT

## Contributing

Contributions are welcome! Please see the [main repository](https://github.com/receptron/grapys) for guidelines.
