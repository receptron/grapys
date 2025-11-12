import { defineConfig } from "vitest/config";
import vue from "@vitejs/plugin-vue";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = dirname(fileURLToPath(new URL("./vite.config.ts", import.meta.url)));
const storybookDir = resolve(projectRoot, ".storybook");

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
        replacement: resolve(storybookDir, "mocks/SocialLogin.ts"),
      },
      {
        find: /^.*utils\/firebase\/firebase$/,
        replacement: resolve(storybookDir, "mocks/firebase.ts"),
      },
    ],
  },
});
