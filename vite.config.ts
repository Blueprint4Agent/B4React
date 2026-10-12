import { normalizeBasePath } from "./scripts/base-path.mjs";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { styleStudioPlugin } from "./scripts/style-studio.mjs";
import { brandHtml, readProjectConfig, sharingHtml } from "./scripts/project-config.mjs";

import { publicDiscoveryPlugin } from "./scripts/public-discovery.mjs";

const project = readProjectConfig();

const tauriDevHost = process.env.TAURI_DEV_HOST;

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), "VITE_");
    const basePath = normalizeBasePath(env.VITE_BASE_PATH);
    return {
        base: `${basePath}/`,
        plugins: [
            react(),
            {
                name: "deployment-path",
                generateBundle() {
                    this.emitFile({
                        type: "asset",
                        fileName: "deployment-path.json",
                        source: JSON.stringify({ basePath }),
                    });
                },
            },
            publicDiscoveryPlugin(project, env),
            styleStudioPlugin(process.env.B4F_STYLE_STUDIO === "1"),
            {
                name: "project-branding",
                transformIndexHtml: (html) =>
                    brandHtml(html, project).replace(
                        "</head>",
                        () => `${sharingHtml(project, env)}\n</head>`,
                    ),
            },
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
    };
});
