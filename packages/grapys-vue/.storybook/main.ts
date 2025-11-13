import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import tailwindcss from "@tailwindcss/vite";
import type { StorybookConfig } from "@storybook/vue3-vite";
import { mergeConfig } from "vite";

const projectRoot = dirname(fileURLToPath(new URL("../vite.config.ts", import.meta.url)));
const config: StorybookConfig = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|ts|tsx)"],
  addons: ["@storybook/addon-essentials", "@storybook/addon-interactions"],
  framework: {
    name: "@storybook/vue3-vite",
    options: {},
  },
  docs: {
    autodocs: "tag",
  },
  viteFinal: async (config) =>
    mergeConfig(config, {
      plugins: [tailwindcss()],
      resolve: {
        alias: [
          { find: "@", replacement: resolve(projectRoot, "src") },
          {
            find: /^.*config\/project$/,
            replacement: resolve(projectRoot, "src/config/game-dev.ts"),
          },
          {
            find: /^.*utils\/firebase\/SocialLogin$/,
            replacement: resolve(projectRoot, "src/storybook/mocks/SocialLogin.ts"),
          },
          {
            find: /^.*utils\/firebase\/firebase$/,
            replacement: resolve(projectRoot, "src/storybook/mocks/firebase.ts"),
          },
        ],
      },
    }),
};

export default config;
