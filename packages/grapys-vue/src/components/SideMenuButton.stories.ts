import type { Meta, StoryObj } from "@storybook/vue3";

import SideMenuButton from "./SideMenuButton.vue";

const meta = {
  title: "Components/SideMenuButton",
  component: SideMenuButton,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["primary", "danger"],
    },
    rounded: {
      control: "select",
      options: ["none", "left", "right", "full"],
    },
  },
  args: {
    variant: "primary",
    rounded: "full",
    fullWidth: true,
    disabled: false,
    type: "button",
  },
} satisfies Meta<typeof SideMenuButton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    variant: "primary",
  },
  render: (args) => ({
    components: { SideMenuButton },
    setup: () => ({ args }),
    template: '<SideMenuButton v-bind="args">Primary Action</SideMenuButton>',
  }),
};

export const Danger: Story = {
  args: {
    variant: "danger",
  },
  render: (args) => ({
    components: { SideMenuButton },
    setup: () => ({ args }),
    template: '<SideMenuButton v-bind="args">Danger Action</SideMenuButton>',
  }),
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
  render: (args) => ({
    components: { SideMenuButton },
    setup: () => ({ args }),
    template: '<SideMenuButton v-bind="args">Disabled</SideMenuButton>',
  }),
};

