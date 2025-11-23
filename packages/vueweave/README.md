# VueWeave

A Vue 3 component library for building visual node-based graph editors with drag-and-drop functionality.

## Features

- 🎯 **Node-based Graph Editor**: Build interactive visual programming interfaces
- 🎨 **Customizable Components**: Flexible base components for nodes and canvas
- 🔗 **Edge Connections**: Visual connections between nodes with validation
- 📦 **TypeScript Support**: Full type definitions included
- 💅 **Styled with Tailwind CSS**: Pre-built styles with Tailwind v4

## Installation

```bash
npm install vueweave
# or
yarn add vueweave
```

## Usage

### 1. Import CSS

First, import the VueWeave styles in your application entry point (e.g., `main.ts`):

```typescript
import "vueweave/style.css";
```

### 2. Basic Setup

VueWeave provides two main components: `GraphCanvasBase` and `NodeBase`.

#### Setting up the Canvas

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
    <template #node="{ nodeData, nodeIndex }">
      <NodeBase
        :inputs="nodeData.inputs"
        :outputs="nodeData.outputs"
        @open-node-edit-menu="handleOpenMenu"
      >
        <template #header="{ nodeData }">
          <div>{{ nodeData.name }}</div>
        </template>
        <template #body-main>
          <!-- Your node content here -->
        </template>
      </NodeBase>
    </template>
  </GraphCanvasBase>
</template>

<script setup lang="ts">
import { GraphCanvasBase, NodeBase, useFlowStore } from 'vueweave';

const store = useFlowStore();
const nodes = store.nodes;
const edges = store.edges;
const nodeRecords = store.nodeRecords;

function updateNodePosition(index: number, position: any) {
  store.updateNodePosition(index, position);
}

function saveNodePosition() {
  store.savePosition();
}

function validateConnection(edge: any) {
  // Your validation logic
  return true;
}

function handleOpenMenu(event: MouseEvent) {
  // Handle node menu opening
}
</script>
```

### 3. Using the Store

VueWeave includes a Pinia store for managing graph state:

```typescript
import { useFlowStore } from 'vueweave';

const flowStore = useFlowStore();

// Access nodes and edges
const nodes = flowStore.nodes;
const edges = flowStore.edges;

// Update node position
flowStore.updateNodePosition(index, position);

// Add/remove edges
flowStore.addEdge(edge);
flowStore.removeEdge(edgeId);
```

## Components

### GraphCanvasBase

The main canvas component for rendering the graph.

**Props:**
- `nodes`: Array of node data
- `edges`: Array of edge connections
- `nodeRecords`: Record of node positions and metadata
- `updatePosition`: Function to update node positions
- `savePosition`: Function to save positions
- `validateConnection`: Function to validate edge connections

**Slots:**
- `head`: Content to render above the canvas
- `node`: Node template (receives `nodeData` and `nodeIndex`)

### NodeBase

The base component for individual nodes.

**Props:**
- `inputs`: Array of input ports `{ name: string, key?: string }[]`
- `outputs`: Array of output ports `{ name: string }[]`

**Events:**
- `openNodeEditMenu`: Emitted when the node is clicked

**Slots:**
- `header`: Node header content
- `body-head`: Content at the top of the node body
- `body-main`: Main node body content

## Utilities

### Class Utilities

VueWeave provides utility functions for styling nodes:

```typescript
import {
  nodeMainClass,
  nodeHeaderClass,
  nodeOutputClass,
  nodeInputClass,
  buttonColorVariants,
  edgeColors
} from 'vueweave';
```

### Type Definitions

```typescript
import type {
  GUINodeData,
  GUIEdgeData,
  NodePosition,
  InputOutputData
} from 'vueweave';
```

## Development

### Building the Package

```bash
# Build the application
npm run build

# Build the package for distribution
npm run build:module
```

This will generate:
- JavaScript files in `lib/package/`
- Type definitions (`.d.ts`) in `lib/package/`
- CSS bundle at `lib/package/style.css`

### Project Structure

```
vueweave/
├── src/
│   ├── package/          # Package source code
│   │   ├── components/   # Vue components
│   │   ├── composable/   # Composables
│   │   ├── store/        # Pinia store
│   │   ├── utils/        # Utility functions
│   │   ├── index.ts      # Main entry point
│   │   └── style.css     # Styles
│   └── ...               # Application code
├── lib/                  # Build output
└── package.json
```

## License

[Your License Here]

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
