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
      // vite-plugin-dts v5 renamed "outDir" to "outDirs" and no longer derives
      // the declaration rootDir from entryRoot, so pin rootDir explicitly to keep
      // .d.ts emitting to lib/package (matching package.json "types").
      outDirs: "lib/package",
      entryRoot: "src/package",
      compilerOptions: { rootDir: resolve(__dirname, "src/package") },
      insertTypesEntry: false,
      copyDtsFiles: true,
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, "src/package/index.ts"),
      formats: ["es"],
      // Bundle the SFCs into a single entry. Under preserveModules, vite emits
      // "?vue&type=script" sub-module references into the published output, which
      // a consumer's vite/rolldown cannot resolve (the .vue sources are not shipped).
      fileName: () => "package/index.js",
    },
    outDir: "lib",
    rollupOptions: {
      external: ["vue", "pinia"],
      output: {
        assetFileNames: (assetInfo) => {
          return assetInfo.name || "assets/[name][extname]";
        },
      },
    },
    emptyOutDir: true,
  },
});
