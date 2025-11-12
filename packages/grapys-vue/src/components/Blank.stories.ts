import type { Meta, StoryObj } from "@storybook/vue3";
import { createMemoryHistory, createRouter } from "vue-router";

import Blank from "./Blank.vue";

const meta = {
  title: "Components/Blank",
  component: Blank,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
} satisfies Meta<typeof Blank>;

export default meta;

type Story = StoryObj<typeof meta>;

export const RouterView: Story = {
  render: (_args, { app }) => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        {
          path: "/",
          component: {
            template:
              '<div class="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-slate-700">This content is rendered via <code>&lt;router-view&gt;</code>.</div>',
          },
        },
      ],
    });

    app.use(router);
    router.push("/");

    return {
      components: { Blank },
      template: "<Blank />",
    };
  },
};

