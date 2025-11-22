import type { Meta, StoryObj } from "@storybook/vue3";

import Chat from "./Chat.vue";

type ChatArgs = InstanceType<typeof Chat>["$props"];

const baseMessages: NonNullable<ChatArgs["messages"]> = [
  { role: "user", content: "Hello!", nodeId: "user" },
  { role: "assistant", content: "Hi there! How can I support you today?", nodeId: "planner" },
  {
    role: "assistant",
    content: "I'm reviewing the latest project graph to recommend a few next steps…",
    nodeId: "planner",
  },
  {
    role: "user",
    content: "Great. Please summarize the edge cases I should focus on.",
    nodeId: "user",
  },
  {
    role: "error",
    content: "Summarizer agent failed to fetch latest metrics.",
    nodeId: "summarizer",
  },
];

const meta = {
  title: "Components/Chat",
  component: Chat,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
  args: {
    messages: baseMessages,
    isStreaming: {},
    streamData: {},
    streamNodeIds: [],
  },
} satisfies Meta<typeof Chat>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Conversation: Story = {};

export const WithStreamingMessage: Story = {
  args: {
    streamNodeIds: ["writer"],
    isStreaming: { writer: true },
    streamData: {
      writer: "Working on a detailed response…",
    },
  },
};

