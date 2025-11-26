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

### 2. Minimal Setup (Zero Configuration)

VueWeave works out of the box with zero configuration:

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

**GraphCanvasBase automatically renders:**
- Default nodes with single input/output ports
- Node ID as header
- `data.label`, `data.type`, or "Node" as body text

### 3. Custom Node Rendering

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

### 4. Using the Store

VueWeave includes a Pinia store for managing graph state:

```typescript
import { useFlowStore } from 'vueweave';

const flowStore = useFlowStore();

// Access nodes and edges
const nodes = flowStore.nodes;
const edges = flowStore.edges;

// Initialize data
flowStore.initData(nodes, edges, extra);

// Add/remove nodes
flowStore.pushNode(node);
flowStore.deleteNode(nodeIndex);

// Add/remove edges
flowStore.pushEdge(edge);
flowStore.deleteEdge(edgeIndex);

// Update node position
flowStore.updateNodePosition(index, position);
flowStore.saveNodePositionData();

// Undo/Redo
flowStore.undo();
flowStore.redo();
const canUndo = flowStore.undoable;
const canRedo = flowStore.redoable;
```

## Examples

VueWeave includes several examples demonstrating different features:

### Validation Example

The Validation Example (`/validation` route) demonstrates custom edge connection validation with different node types:

- **singleInput**: Only ONE connection allowed across ALL ports
- **onePerPort**: ONE connection per port (multiple ports can have connections)
- **multiple**: Unlimited connections to the same port
- **typeA / typeB**: Type matching - only accepts same type, multiple connections allowed
- **output**: Accepts any input type

Each node displays its validation rules and behavior directly in the node UI, making it easy for developers to understand how custom validation works.

```typescript
// Custom validation function example
const validateConnection = (expectEdge: GUIEdgeData, existingEdges: GUIEdgeData[]): boolean => {
  const sourceNode = store.nodes.find((n) => n.nodeId === expectEdge.source.nodeId);
  const targetNode = store.nodes.find((n) => n.nodeId === expectEdge.target.nodeId);

  // Rule 1: Single input nodes - only one connection total
  if (targetNode.type === "singleInput") {
    const allEdgesToThisNode = store.edges.filter((edge) => edge.target.nodeId === expectEdge.target.nodeId);
    return allEdgesToThisNode.length === 0;
  }

  // Rule 2: Type matching
  if (sourceNode.type === "typeA" || sourceNode.type === "typeB") {
    if (targetNode.type !== "output" && sourceNode.type !== targetNode.type) {
      return false; // Type mismatch
    }
    return true; // Multiple connections OK
  }

  return true;
};
```

## Components

### GraphCanvasBase

The main canvas component for rendering the graph.

**Props (all optional):**
- `nodes`: Array of node data (defaults to store)
- `edges`: Array of edge connections (defaults to store)
- `nodeRecords`: Record of node positions and metadata (defaults to store)
- `updatePosition`: Function to update node positions (defaults to store)
- `savePosition`: Function to save positions (defaults to store)
- `validateConnection`: Function to validate edge connections (defaults to store)
- `nodeStyles`: Node styling configuration (colors or functions)
- `getNodeKey`: Custom key function for node rendering

**Slots:**
- `head`: Content to render above the canvas
- `node`: Node template (receives `nodeData` and `nodeIndex`)
  - **If not provided**: Automatically renders default nodes with NodeBase

**Default Rendering:**
When no `#node` slot is provided, GraphCanvasBase automatically renders:
- Single input and output port per node
- Node ID as header
- `nodeData.data.label`, `nodeData.type`, or "Node" as body content

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

## Styling

### Edge Colors

VueWeave provides flexible edge color customization with two approaches:

#### Simple Approach: Default Colors

```vue
<GraphCanvasBase
  :node-styles="{
    edgeColors: {
      edge: '#ec4899',        // pink-500 - normal edge
      hover: '#8b5cf6',       // violet-500 - on hover
      notConnectable: '#ef4444' // red-500 - invalid connection
    }
  }"
/>
```

#### Advanced Approach: Custom Colors per Node Pair

```vue
<script setup>
import { GraphCanvasBase, type NodeStyleOptions } from 'vueweave';

const nodeStyleOptions: NodeStyleOptions = {
  edgeColorOptions: {
    default: {
      edge: '#6366f1',        // Default color
      hover: '#818cf8',       // Default hover color
      notConnectable: '#f87171'
    },
    customColor: (sourceNodeId: string, targetNodeId: string) => {
      // Custom color for specific node pairs
      if (sourceNodeId === 'input' && targetNodeId === 'process') {
        return {
          edge: '#10b981',    // green-500
          hover: '#34d399'    // green-400
        };
      }
      // Return undefined to use default colors
      return undefined;
    }
  }
};
</script>

<template>
  <GraphCanvasBase :node-styles="nodeStyleOptions" />
</template>
```

**Features:**
- Set default edge colors globally
- Override colors for specific source/target node pairs
- Use any CSS color format (hex, rgb, hsl, color names)
- Separate hover states for better interactivity
- Fallback to defaults when custom function returns undefined

**Examples:**
- See `/validation` route for validation-based edge coloring
- See `/styled` route for data-flow-based edge coloring

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

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
