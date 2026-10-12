import { spawnSync } from "node:child_process";
import { readProjectConfig } from "./project-config.mjs";
import { discoveryOptions } from "./public-discovery.mjs";

const project = readProjectConfig();
const env = {
    ...process.env,
    VITE_PUBLIC_DISCOVERY: "true",
    VITE_PUBLIC_SITE_URL: "https://discovery.example.test",
    VITE_INDEXNOW_KEY: "b4a-test-public-key",
};
if (project) {
    let rejected = false;
    try {
        discoveryOptions(project, env);
    } catch {
        rejected = true;
    }
    if (!rejected) throw new Error("Custom identity must not publish B4A discovery content.");
    console.log("Custom identity guard passed; B4A-only browser fixture does not apply.");
} else {
    for (const args of [
        ["exec", "--", "vite", "build", "--outDir", ".discovery-dist"],
        ["run", "test:e2e", "--", "--config", "playwright.discovery.config.ts"],
    ]) {
        const result = spawnSync("npm", args, { env, stdio: "inherit" });
        if (result.error) throw result.error;
        if (result.status !== 0) process.exit(result.status ?? 1);
    }
}
