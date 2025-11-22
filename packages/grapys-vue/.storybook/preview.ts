import type { Preview } from "@storybook/vue3";
import { setup } from "@storybook/vue3";
import { createPinia, setActivePinia } from "pinia";

import "../src/index.css";

setup((app) => {
  const pinia = createPinia();
  setActivePinia(pinia);
  app.use(pinia);
});

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
  },
};

export default preview;

