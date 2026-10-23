import { defineConfig } from "@playwright/test";

export default defineConfig({
    fullyParallel: true,
    testDir: "./tests/e2e",
    timeout: 30_000,
    use: {
        baseURL: "http://127.0.0.1:4173",
        trace: "on-first-retry",
        screenshot: "only-on-failure",
    },
    webServer: {
        env: {
            VITE_API_BASE_URL: "http://127.0.0.1:4173",
            VITE_BUY_ME_A_COFFEE_ENABLED: "true",
            VITE_BUY_ME_A_COFFEE_URL: "https://buymeacoffee.com/b4a-test-fixture",
        },
        command: "npm run dev -- --host 127.0.0.1 --port 4173",
        url: "http://127.0.0.1:4173",
        reuseExistingServer: false,
        timeout: 120_000,
    },
});
