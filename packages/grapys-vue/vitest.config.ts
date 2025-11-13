import { defineConfig } from "vitest/config";
import vue from "@vitejs/plugin-vue";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = dirname(fileURLToPath(new URL("./vite.config.ts", import.meta.url)));

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: "happy-dom",
    globals: true,
    pool: "threads",
    include: ["src/**/*.spec.ts", "src/**/*.test.ts"],
  },
  resolve: {
    alias: [
      { find: "@", replacement: resolve(projectRoot, "src") },
      {
        find: /config\/project$/,
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
});
