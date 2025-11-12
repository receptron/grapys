import type { Meta, StoryObj } from "@storybook/vue3";
import SigninButton from "./SigninButton.vue";

const meta = {
  title: "Components/SigninButton",
  component: SigninButton,
  tags: ["autodocs"],
  parameters: {
    actions: { handles: ["click button"] },
  },
} satisfies Meta<typeof SigninButton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => ({
    components: { SigninButton },
    template: "<SigninButton />",
  }),
};

