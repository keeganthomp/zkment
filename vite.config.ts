import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import tailwindcss from "tailwindcss";
import { nodePolyfills } from "vite-plugin-node-polyfills";

// https://vitejs.dev/config/
export default defineConfig(({ command }) => {
  const plugins = [react()];
  if (command === "build") {
    plugins.push(nodePolyfills() as any);
  }
  return {
    plugins,
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    define: {
      "process.env": process.env,
    },
    build: {
      modulePreload: true,
    },
    css: {
      postcss: {
        plugins: [tailwindcss()],
      },
    },
  };
});
