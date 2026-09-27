import "@testing-library/jest-dom/vitest";

import "../i18n";

import { afterAll, afterEach, beforeAll } from "vitest";
import { cleanup } from "@testing-library/react";

import { server } from "./mocks/server";

Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: (query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: () => undefined,
        removeListener: () => undefined,
        addEventListener: () => undefined,
        removeEventListener: () => undefined,
        dispatchEvent: () => false,
    }),
});

// JSDOM has no layout observer; geometry is covered by Playwright.
class TestResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
}
Object.defineProperty(window, "ResizeObserver", { writable: true, value: TestResizeObserver });

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => {
    cleanup();
    server.resetHandlers();
    window.localStorage.clear();
});
afterAll(() => server.close());
