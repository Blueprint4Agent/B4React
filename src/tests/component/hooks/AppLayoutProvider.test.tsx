import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AppLayoutProvider, useAppLayout } from "../../../hooks/useAppLayout";
import { serviceConfig, type AppLayoutMode } from "../../../service.config";

let deploymentLayout: string | undefined;
let appMode: string | undefined = "development";
vi.mock("../../../hooks/useFeatures", () => ({
    useAppConfig: () => ({
        data: appMode ? { app_mode: appMode, app_layout: deploymentLayout } : null,
    }),
}));
function Probe() {
    const { mode, canPreview, isPreviewing, setMode, resetPreview } = useAppLayout();
    return (
        <>
            <output>{mode}</output>
            <button disabled={!isPreviewing} onClick={resetPreview}>
                Reset
            </button>
            <input aria-label="Draft" defaultValue="" />
            <button disabled={!canPreview} onClick={() => setMode("focused")}>
                Preview
            </button>
        </>
    );
}
afterEach(() => {
    appMode = "development";
    deploymentLayout = undefined;
    serviceConfig.layout = "sidebar";
    vi.restoreAllMocks();
});
describe("service layout ownership", () => {
    it.each(["sidebar", "topnav", "focused"] as AppLayoutMode[])(
        "uses service default %s in production, ignoring previews",
        (defaultMode) => {
            // Given: service author chooses a default and a development preview exists.
            serviceConfig.layout = defaultMode;
            appMode = "production";
            localStorage.setItem("blueprint_layout_preview", "focused");
            // When: the runtime mounts.
            render(
                <AppLayoutProvider>
                    <Probe />
                </AppLayoutProvider>,
            );
            // Then: production is controlled solely by the service default.
            expect(screen.getByRole("status")).toHaveTextContent(defaultMode);
            expect(screen.getByRole("button", { name: "Preview" })).toBeDisabled();
        },
    );
    it.each(["sidebar", "topnav", "focused"] as AppLayoutMode[])(
        "uses server layout %s over source defaults and saved production previews",
        (layout) => {
            appMode = "production";
            deploymentLayout = layout;
            serviceConfig.layout = "focused";
            localStorage.setItem("blueprint_layout_preview", "topnav");
            render(
                <AppLayoutProvider>
                    <Probe />
                </AppLayoutProvider>,
            );
            expect(screen.getByRole("status")).toHaveTextContent(layout);
            expect(screen.getByRole("button", { name: "Preview" })).toBeDisabled();
        },
    );
    it("clears a saved preview and follows later deployment defaults", () => {
        deploymentLayout = "topnav";
        localStorage.setItem("blueprint_layout_preview", "sidebar");
        const { rerender } = render(
            <AppLayoutProvider>
                <Probe />
            </AppLayoutProvider>,
        );
        expect(screen.getByRole("status")).toHaveTextContent("sidebar");
        fireEvent.click(screen.getByRole("button", { name: "Reset" }));
        expect(screen.getByRole("status")).toHaveTextContent("topnav");
        expect(localStorage.getItem("blueprint_layout_preview")).toBeNull();
        expect(screen.getByRole("button", { name: "Reset" })).toBeDisabled();
        deploymentLayout = "focused";
        rerender(
            <AppLayoutProvider>
                <Probe />
            </AppLayoutProvider>,
        );
        expect(screen.getByRole("status")).toHaveTextContent("focused");
    });
    it("resets for the session when storage removal is blocked", () => {
        deploymentLayout = "topnav";
        localStorage.setItem("blueprint_layout_preview", "sidebar");
        vi.spyOn(Storage.prototype, "removeItem").mockImplementation(() => {
            throw new Error("blocked");
        });
        render(
            <AppLayoutProvider>
                <Probe />
            </AppLayoutProvider>,
        );
        fireEvent.click(screen.getByRole("button", { name: "Reset" }));
        expect(screen.getByRole("status")).toHaveTextContent("topnav");
    });
    it("refreshes the deployment default without remounting a draft", () => {
        appMode = "production";
        deploymentLayout = "topnav";
        const { rerender } = render(
            <AppLayoutProvider>
                <Probe />
            </AppLayoutProvider>,
        );
        fireEvent.change(screen.getByRole("textbox"), { target: { value: "unsaved" } });
        deploymentLayout = "focused";
        rerender(
            <AppLayoutProvider>
                <Probe />
            </AppLayoutProvider>,
        );
        expect(screen.getByRole("status")).toHaveTextContent("focused");
        expect(screen.getByRole("textbox")).toHaveValue("unsaved");
    });
    it("lets development preview override the server without mutating its default", () => {
        deploymentLayout = "topnav";
        const { rerender } = render(
            <AppLayoutProvider>
                <Probe />
            </AppLayoutProvider>,
        );
        expect(screen.getByRole("status")).toHaveTextContent("topnav");
        fireEvent.click(screen.getByRole("button", { name: "Preview" }));
        expect(screen.getByRole("status")).toHaveTextContent("focused");
        appMode = "production";
        rerender(
            <AppLayoutProvider>
                <Probe />
            </AppLayoutProvider>,
        );
        expect(screen.getByRole("status")).toHaveTextContent("topnav");
    });
    it("falls back for an invalid remote layout", () => {
        appMode = "production";
        deploymentLayout = "invalid";
        render(
            <AppLayoutProvider>
                <Probe />
            </AppLayoutProvider>,
        );
        expect(screen.getByRole("status")).toHaveTextContent("sidebar");
    });
    it("preserves child drafts when switching and stops applying previews if server mode changes", () => {
        // Given: an active page draft in development.
        const { rerender } = render(
            <AppLayoutProvider>
                <Probe />
            </AppLayoutProvider>,
        );
        fireEvent.change(screen.getByRole("textbox"), { target: { value: "unsaved" } });
        // When: selecting a preview.
        fireEvent.click(screen.getByRole("button", { name: "Preview" }));
        // Then: one shared selection is persisted without remounting page state.
        expect(screen.getByRole("status")).toHaveTextContent("focused");
        expect(screen.getByRole("textbox")).toHaveValue("unsaved");
        expect(localStorage.getItem("blueprint_layout_preview")).toBe("focused");
        appMode = "production";
        rerender(
            <AppLayoutProvider>
                <Probe />
            </AppLayoutProvider>,
        );
        expect(screen.getByRole("status")).toHaveTextContent("sidebar");
        expect(screen.getByRole("textbox")).toHaveValue("unsaved");
    });
    it.each([undefined, "unknown"])(
        "does not apply previews with unavailable or invalid server mode %s",
        (mode) => {
            // Given: config is not explicitly development.
            appMode = mode;
            localStorage.setItem("blueprint_layout_preview", "topnav");
            // When/Then: fail back to the service default without editing controls.
            render(
                <AppLayoutProvider>
                    <Probe />
                </AppLayoutProvider>,
            );
            expect(screen.getByRole("status")).toHaveTextContent("sidebar");
            expect(screen.getByRole("button", { name: "Preview" })).toBeDisabled();
        },
    );
    it("ignores corrupt storage and allows session previews with storage blocked", () => {
        // Given: invalid persisted content and a browser blocking writes.
        localStorage.setItem("blueprint_layout_preview", "other");
        vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
            throw new Error("blocked");
        });
        // When: opening Appearance and selecting a valid mode.
        render(
            <AppLayoutProvider>
                <Probe />
            </AppLayoutProvider>,
        );
        expect(screen.getByRole("status")).toHaveTextContent("sidebar");
        fireEvent.click(screen.getByRole("button", { name: "Preview" }));
        // Then: session state still switches.
        expect(screen.getByRole("status")).toHaveTextContent("focused");
    });
});
