import { act, render, screen, waitFor } from "@testing-library/react";
import { StrictMode } from "react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AppConfigProvider } from "../../../hooks/AppConfigProvider";
import { useAppConfig } from "../../../hooks/useFeatures";

const getConfigMock = vi.fn();

vi.mock("../../../hooks/api/config/useConfigApi", () => ({
    useConfigApi: () => ({ getConfig: getConfigMock }),
}));

vi.mock("../../../hooks/connectivity/useServerConnectivity", () => ({
    useServerConnectivity: () => ({ isDesktop: true, status: "offline" }),
}));

function AppConfigProbe() {
    const { data, loading, error, reload } = useAppConfig();

    return (
        <section>
            <p data-testid="loading">{String(loading)}</p>
            <p data-testid="error">{String(Boolean(error))}</p>
            <p data-testid="login-enabled">{String(data?.login_enabled ?? "unknown")}</p>
            <button type="button" onClick={() => void reload().catch(() => undefined)}>
                reload
            </button>
        </section>
    );
}

describe("useAppConfig", () => {
    beforeEach(() => {
        getConfigMock.mockReset();
    });

    it("keeps missing configuration distinct from explicitly disabled login", async () => {
        // Given: initial configuration loading fails while the server is offline.
        getConfigMock
            .mockRejectedValueOnce(new Error("server unavailable"))
            .mockResolvedValueOnce({ login_enabled: true });

        render(
            <AppConfigProvider>
                <AppConfigProbe />
            </AppConfigProvider>,
        );

        // Then: missing data is exposed as an error, not login_enabled=false.
        await waitFor(() => {
            expect(screen.getByTestId("loading")).toHaveTextContent("false");
        });
        expect(screen.getByTestId("error")).toHaveTextContent("true");
        expect(screen.getByTestId("login-enabled")).toHaveTextContent("unknown");

        // When: the server recovers and configuration is requested again.
        const user = userEvent.setup();
        await user.click(screen.getByRole("button", { name: "reload" }));

        // Then: the successful server value replaces the unavailable state.
        await waitFor(() => {
            expect(screen.getByTestId("login-enabled")).toHaveTextContent("true");
        });
        expect(screen.getByTestId("error")).toHaveTextContent("false");
        expect(getConfigMock).toHaveBeenCalledTimes(2);
    });
    it("shares startup and concurrent reloads across StrictMode consumers", async () => {
        // Given: two consumers inside a single StrictMode provider.
        let resolve: (value: { login_enabled: boolean }) => void = () => undefined;
        getConfigMock.mockImplementation(
            () =>
                new Promise((done) => {
                    resolve = done;
                }),
        );
        render(
            <StrictMode>
                <AppConfigProvider>
                    <AppConfigProbe />
                    <AppConfigProbe />
                </AppConfigProvider>
            </StrictMode>,
        );
        await waitFor(() => expect(getConfigMock).toHaveBeenCalledTimes(1));
        // When: the shared initial request completes, both consumers receive its value.
        await act(async () => resolve({ login_enabled: true }));
        expect(
            screen
                .getAllByTestId("login-enabled")
                .every((element) => element.textContent === "true"),
        ).toBe(true);
        const user = userEvent.setup();
        await user.click(screen.getAllByRole("button", { name: "reload" })[0]);
        await user.click(screen.getAllByRole("button", { name: "reload" })[1]);
        expect(getConfigMock).toHaveBeenCalledTimes(2);
        // Then: concurrent reloads also share one response and update all consumers.
        await act(async () => resolve({ login_enabled: false }));
        expect(
            screen
                .getAllByTestId("login-enabled")
                .every((element) => element.textContent === "false"),
        ).toBe(true);
    });

    it("does not retain configuration between provider instances", async () => {
        // Given: an earlier application instance used bootstrap configuration.
        getConfigMock
            .mockResolvedValueOnce({ login_enabled: false })
            .mockResolvedValueOnce({ login_enabled: true });
        const old = render(
            <AppConfigProvider>
                <AppConfigProbe />
            </AppConfigProvider>,
        );
        await waitFor(() => expect(screen.getByTestId("login-enabled")).toHaveTextContent("false"));
        old.unmount();
        // When/Then: a fresh provider obtains its own snapshot instead of a global cache.
        render(
            <AppConfigProvider>
                <AppConfigProbe />
            </AppConfigProvider>,
        );
        await waitFor(() => expect(screen.getByTestId("login-enabled")).toHaveTextContent("true"));
        expect(getConfigMock).toHaveBeenCalledTimes(2);
    });
});
