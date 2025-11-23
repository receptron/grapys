import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "path";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [tailwindcss()],
  build: {
    outDir: "lib/package",
    emptyOutDir: false,
    rollupOptions: {
      input: {
        style: resolve(__dirname, "src/package/style.css"),
      },
      output: {
        assetFileNames: "[name].[ext]",
      },
    },
  },
});
