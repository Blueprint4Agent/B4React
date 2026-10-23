import { defineConfig } from "@playwright/test";

export default defineConfig({
    testDir: "./tests/discovery",
    timeout: 30_000,
    use: {
        screenshot: "only-on-failure",
        baseURL: "http://127.0.0.1:4176",
        trace: "retain-on-failure",
    },
    webServer: {
        command:
            "npm run preview -- --outDir .discovery-dist --host 127.0.0.1 --port 4176 --strictPort",
        url: "http://127.0.0.1:4176",
        reuseExistingServer: false,
    },
});
