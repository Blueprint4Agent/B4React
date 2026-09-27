import { act, render, waitFor } from "@testing-library/react";
import { beforeEach, expect, it, vi } from "vitest";
import { AppConfigProvider } from "../../../hooks/AppConfigProvider";
import { ConnectivityRecovery } from "../../../hooks/connectivity/ConnectivityRecovery";
const getConfig = vi.fn();
const revalidateSession = vi.fn();
let status = "offline";
vi.mock("../../../hooks/api/config/useConfigApi", () => ({ useConfigApi: () => ({ getConfig }) }));
vi.mock("../../../hooks/useAuth", () => ({ useAuthContext: () => ({ revalidateSession }) }));
vi.mock("../../../hooks/connectivity/useServerConnectivity", () => ({
    useServerConnectivity: () => ({ isDesktop: true, status }),
}));
beforeEach(() => {
    status = "offline";
    getConfig.mockReset();
    revalidateSession.mockReset();
});
it("refreshes shared configuration before restoring the desktop session", async () => {
    // Given: startup completed, then the desktop reconnects with configuration pending.
    getConfig.mockResolvedValueOnce({ login_enabled: true });
    let resolve: (value: object) => void = () => undefined;
    getConfig.mockImplementationOnce(
        () =>
            new Promise((done) => {
                resolve = done;
            }),
    );
    const view = render(
        <AppConfigProvider>
            <ConnectivityRecovery />
        </AppConfigProvider>,
    );
    await waitFor(() => expect(getConfig).toHaveBeenCalledTimes(1));
    status = "online";
    view.rerender(
        <AppConfigProvider>
            <ConnectivityRecovery />
        </AppConfigProvider>,
    );
    await waitFor(() => expect(getConfig).toHaveBeenCalledTimes(2));
    expect(revalidateSession).not.toHaveBeenCalled();
    // When/Then: only successful refreshed configuration permits session revalidation.
    await act(async () => resolve({ login_enabled: false }));
    expect(revalidateSession).toHaveBeenCalledTimes(1);
});
it("does not clear/revalidate a session when recovery configuration fails", async () => {
    // Given: the first request succeeds, but reconnect config fails.
    getConfig
        .mockResolvedValueOnce({ login_enabled: true })
        .mockRejectedValueOnce(new Error("offline"));
    const view = render(
        <AppConfigProvider>
            <ConnectivityRecovery />
        </AppConfigProvider>,
    );
    await waitFor(() => expect(getConfig).toHaveBeenCalledTimes(1));
    // When/Then: a failed config refresh leaves auth recovery untouched.
    status = "online";
    view.rerender(
        <AppConfigProvider>
            <ConnectivityRecovery />
        </AppConfigProvider>,
    );
    await waitFor(() => expect(getConfig).toHaveBeenCalledTimes(2));
    expect(revalidateSession).not.toHaveBeenCalled();
});
