import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { brandHtml, readProjectConfig } from "./scripts/project-config.mjs";

const project = readProjectConfig();

const tauriDevHost = process.env.TAURI_DEV_HOST;

export default defineConfig({
    plugins: [
        react(),
        { name: "project-branding", transformIndexHtml: (html) => brandHtml(html, project) },
    ],
    define: { __PROJECT_BRAND__: JSON.stringify(project) },
    clearScreen: false,
    server: {
        port: 5173,
        strictPort: true,
        host: tauriDevHost || false,
        hmr: tauriDevHost
            ? {
                  protocol: "ws",
                  host: tauriDevHost,
                  port: 1421,
              }
            : undefined,
        watch: {
            ignored: ["**/src-tauri/**"],
        },
    },
    envPrefix: ["VITE_", "TAURI_ENV_*"],
    build: {
        target: process.env.TAURI_ENV_PLATFORM === "windows" ? "chrome105" : "safari13",
        minify: process.env.TAURI_ENV_DEBUG ? false : "esbuild",
        sourcemap: Boolean(process.env.TAURI_ENV_DEBUG),
    },
    test: {
        globals: true,
        environment: "jsdom",
        setupFiles: "./src/tests/setup.ts",
        css: true,
        include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    },
});
