import { defineConfig } from "@playwright/test";
export default defineConfig({
    testDir: "./tests/style-studio",
    use: { baseURL: "http://127.0.0.1:4175", locale: "en-US" },
    webServer: {
        env: { VITE_API_BASE_URL: "http://127.0.0.1:4175" },
        command: "B4F_STYLE_STUDIO=1 npm run dev -- --host 127.0.0.1 --port 4175",
        url: "http://127.0.0.1:4175",
        reuseExistingServer: false,
    },
});
