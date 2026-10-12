import { afterEach, expect, it, vi } from "vitest";
import { getBasePath, publicPath, storageKey } from "../../../utils/basePath";
import { resolveDefaultApiBase } from "../../../utils/apiBase";

afterEach(() => vi.unstubAllEnvs());

it("keeps root URLs and existing storage compatible", () => {
    vi.stubEnv("BASE_URL", "/");
    expect(getBasePath()).toBe("");
    expect(publicPath("/icons/logo.svg")).toBe("/icons/logo.svg");
    expect(storageKey("template_access_token")).toBe("template_access_token");
});

it("keeps assets, API and persistence inside a nested deployment", () => {
    vi.stubEnv("BASE_URL", "/demos/alpha/");
    expect(publicPath("/icons/logo.svg")).toBe("/demos/alpha/icons/logo.svg");
    const first = storageKey("template_access_token");
    expect(
        resolveDefaultApiBase(
            {
                hostname: "example.test",
                origin: "https://example.test",
                protocol: "https:",
                port: "",
            },
            false,
        ),
    ).toBe("https://example.test/demos/alpha");
    vi.stubEnv("BASE_URL", "/demos/beta/");
    expect(storageKey("template_access_token")).not.toBe(first);
});

it("retains the API prefix when resolving an OAuth start path", async () => {
    vi.stubEnv("VITE_API_BASE_URL", "https://example.test/demos/alpha");
    vi.resetModules();
    const { getApiUrl } = await import("../../../utils/apiBase");
    expect(getApiUrl("/api/v1/auth/oauth/google/start")).toBe(
        "https://example.test/demos/alpha/api/v1/auth/oauth/google/start",
    );
});
