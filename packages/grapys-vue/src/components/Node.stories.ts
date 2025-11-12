import type { Meta, StoryObj } from "@storybook/vue3";
import { action } from "@storybook/addon-actions";
import { computed, toRef, watch } from "vue";
import { createPinia, setActivePinia } from "pinia";

import Node from "./Node";
import { useStore } from "../store";
import type { GUINodeData, UpdateNodePositionData, UpdateStaticValue } from "../utils/gui/type";

const meta: Meta<typeof Node> = {
  title: "Components/Node",
  component: Node,
  tags: ["autodocs"],
  argTypes: {
    nodeData: { control: false },
    nearestData: { control: false },
    resultUrl: {
      control: "text",
      description: "Optional image URL to showcase Node result rendering.",
    },
  } as any,
};

export default meta;

type Story = StoryObj<typeof meta>;

const cloneNodeData = (node: GUINodeData): GUINodeData =>
  JSON.parse(JSON.stringify(node)) as GUINodeData;

const createRender = (): Story["render"] =>
  (args, { app }) => {
    const storyArgs = args as {
      nodeData: GUINodeData;
      nodeIndex: number;
      isConnectable: boolean;
      nearestData?: unknown;
      resultUrl?: string;
    };

    const pinia = createPinia();
    app.use(pinia);
    setActivePinia(pinia);

    const store = useStore();
    const baseNode = cloneNodeData(storyArgs.nodeData);
    store.initData([baseNode], [], { loopType: "none" });

    const currentNode = computed(() => store.nodes[storyArgs.nodeIndex] ?? baseNode);

    const handleUpdatePosition = (position: UpdateNodePositionData) => {
      store.updateNodePosition(storyArgs.nodeIndex, position);
    };
    const handleSavePosition = () => {
      store.saveNodePositionData();
    };
    const handleStaticNodeValue = (payload: Record<string, unknown>) => {
      store.updateStaticNodeValue(storyArgs.nodeIndex, payload as UpdateStaticValue, true);
    };
    const handleNestedGraph = (payload: Record<string, unknown>) => {
      store.updateNestedGraph(storyArgs.nodeIndex, payload as UpdateStaticValue);
    };

    const onNewEdgeStart = action("newEdgeStart");
    const onNewEdge = action("newEdge");
    const onNewEdgeEnd = action("newEdgeEnd");
    const onOpenMenu = action("openNodeMenu");
    const onOpenEditMenu = action("openNodeEditMenu");
    const onDragStart = action("nodeDragStart");
    const onDragEnd = action("nodeDragEnd");

    return {
      components: { Node },
      setup() {
        if (Object.prototype.hasOwnProperty.call(storyArgs, "resultUrl")) {
          const resultUrl = toRef(storyArgs, "resultUrl");
          watch(
            resultUrl,
            (url) => {
              if (url) {
                store.setResult(baseNode.nodeId, { url });
                return;
              }
              store.setResult(baseNode.nodeId, undefined);
            },
            { immediate: true },
          );
        }

        return {
          args: storyArgs,
          currentNode,
          handleUpdatePosition,
          handleSavePosition,
          handleStaticNodeValue,
          handleNestedGraph,
          onNewEdgeStart,
          onNewEdge,
          onNewEdgeEnd,
          onOpenMenu,
          onOpenEditMenu,
          onDragStart,
          onDragEnd,
        };
      },
      template: `
        <div class="relative h-[360px] w-[360px] bg-slate-900 p-6">
          <Node
            :node-data="currentNode"
            :node-index="args.nodeIndex"
            :nearest-data="args.nearestData"
            :is-connectable="args.isConnectable"
            @update-position="handleUpdatePosition"
            @save-position="handleSavePosition"
            @update-static-node-value="handleStaticNodeValue"
            @update-nested-graph="handleNestedGraph"
            @new-edge-start="onNewEdgeStart"
            @new-edge="onNewEdge"
            @new-edge-end="onNewEdgeEnd"
            @open-node-menu="onOpenMenu"
            @open-node-edit-menu="onOpenEditMenu"
            @node-drag-start="onDragStart"
            @node-drag-end="onDragEnd"
          />
        </div>
      `,
    };
  };

const languageModelNode: GUINodeData = {
  type: "computed",
  nodeId: "assistant",
  position: { x: 24, y: 24 },
  data: {
    guiAgentId: "openAIAgent",
    params: {
      system: "You are a helpful assistant.",
      stream: true,
      temperature: 0.7,
    },
    agentIndex: 0,
  },
};

export const LanguageModelNode: Story = {
  args: {
    nodeData: languageModelNode,
    nodeIndex: 0,
    isConnectable: true,
  },
  render: createRender(),
};

const staticValueNode: GUINodeData = {
  type: "static",
  nodeId: "prompt",
  position: { x: 24, y: 24 },
  data: {
    staticNodeType: "text",
    value: "Tell me a story about Storybook.",
  },
};

export const StaticValueNode: Story = {
  args: {
    nodeData: staticValueNode,
    nodeIndex: 0,
    isConnectable: true,
  },
  render: createRender(),
};

const imageNode: GUINodeData = {
  type: "computed",
  nodeId: "imageGenerator",
  position: { x: 24, y: 24 },
  data: {
    guiAgentId: "openAIImageAgent",
    params: {
      prompt: "A neon llama visiting Storybook City",
    },
  },
};

export const ImageResultNode: Story = {
  args: {
    nodeData: imageNode,
    nodeIndex: 0,
    isConnectable: true,
    resultUrl: "https://placekitten.com/320/200",
  } as any,
  render: createRender(),
};

