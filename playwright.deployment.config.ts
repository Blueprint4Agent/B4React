import { defineConfig } from "@playwright/test";

if (!process.env.B4_DEPLOYMENT_TEST_URL)
    throw new Error("Use the isolated monolithic deployment harness");
export default defineConfig({
    testDir: "./tests/deployment",
    workers: 1,
    timeout: 60_000,
    use: {
        screenshot: "only-on-failure",
        baseURL: process.env.B4_DEPLOYMENT_TEST_URL,
        locale: "en-US",
        trace: "retain-on-failure",
    },
});
