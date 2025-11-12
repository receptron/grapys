import type { Meta, StoryObj } from "@storybook/vue3";

import Signin from "./Signin.vue";

const meta = {
  title: "Components/Signin",
  component: Signin,
  tags: ["autodocs"],
  parameters: {
    actions: { handles: ["click a"] },
  },
} satisfies Meta<typeof Signin>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => ({
    components: { Signin },
    template: "<Signin />",
  }),
};

