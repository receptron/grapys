import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";
import dts from "vite-plugin-dts";
import { resolve } from "path";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
    dts({
      include: ["src/package/**/*"],
      outDir: "lib/package",
      entryRoot: "src/package",
      insertTypesEntry: false,
      copyDtsFiles: true,
      rollupTypes: false,
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, "src/package/index.ts"),
      formats: ["es"],
    },
    outDir: "lib",
    rollupOptions: {
      external: ["vue", "pinia"],
      output: {
        preserveModules: true,
        preserveModulesRoot: "src",
        entryFileNames: ({ name }) => {
          return `${name}.js`;
        },
        assetFileNames: (assetInfo) => {
          return assetInfo.name || "assets/[name][extname]";
        },
      },
    },
    emptyOutDir: true,
  },
});
