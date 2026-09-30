import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AppConfigProvider } from "../../../hooks/AppConfigProvider";
import { AuthProvider, useAuthContext } from "../../../hooks/useAuth";
import { FULL_SYSTEM_SCENARIO } from "../../fixtures/fullSystemScenarioData";

const getConfigMock = vi.fn();
const refreshMock = vi.fn();
const meMock = vi.fn();
const loginMock = vi.fn();
const signupMock = vi.fn();
const updateMeMock = vi.fn();
const logoutApiMock = vi.fn();
const deleteMeMock = vi.fn();

vi.mock("../../../hooks/api/config/useConfigApi", () => ({
    useConfigApi: () => ({
        getConfig: getConfigMock,
    }),
}));

vi.mock("../../../hooks/api/auth/useAuthApi", () => ({
    useAuthApi: () => ({
        refresh: refreshMock,
        me: meMock,
        login: loginMock,
        signup: signupMock,
        updateMe: updateMeMock,
        logout: logoutApiMock,
        deleteMe: deleteMeMock,
    }),
}));

function AuthProbe() {
    const { loading, user, logout, deleteAccount, updateProfile } = useAuthContext();

    return (
        <section>
            <button
                onClick={() => {
                    void deleteAccount(FULL_SYSTEM_SCENARIO.principal.email, "123456").catch(
                        () => undefined,
                    );
                }}
            >
                delete
            </button>
            <button
                onClick={() => {
                    void updateProfile({ name: "Updated" });
                }}
            >
                update
            </button>
            <p data-testid="loading">{String(loading)}</p>
            <p data-testid="email">{user?.email ?? ""}</p>
            <button
                type="button"
                onClick={() => {
                    void logout().catch(() => undefined);
                }}
            >
                logout
            </button>
        </section>
    );
}

describe("useAuth bootstrap and exception flows", () => {
    beforeEach(() => {
        sessionStorage.clear();
        getConfigMock.mockReset();
        refreshMock.mockReset();
        meMock.mockReset();
        loginMock.mockReset();
        signupMock.mockReset();
        updateMeMock.mockReset();
        logoutApiMock.mockReset();
        deleteMeMock.mockReset();
    });

    it("restores login from the session cookie after the tab-scoped token is lost", async () => {
        // Given: closing a tab removed its access token while the browser session cookie remains.
        getConfigMock.mockResolvedValue({ login_enabled: true });
        refreshMock.mockResolvedValue({ access_token: "refreshed-token" });
        meMock.mockResolvedValue(FULL_SYSTEM_SCENARIO.principal);

        // When: auth provider initializes.
        render(
            <AppConfigProvider>
                <AuthProvider>
                    <AuthProbe />
                </AuthProvider>
            </AppConfigProvider>,
        );

        // Then: refresh-based bootstrap restores the user and a new tab-scoped access token.
        await waitFor(() => {
            expect(screen.getByTestId("loading").textContent).toBe("false");
        });
        expect(screen.getByTestId("email").textContent).toBe(FULL_SYSTEM_SCENARIO.principal.email);
        expect(sessionStorage.getItem("template_access_token")).toBe("refreshed-token");
        expect(refreshMock).toHaveBeenCalledTimes(1);
        expect(meMock).toHaveBeenCalledTimes(1);
    });

    it("keeps existing session when stored token allows /me success", async () => {
        // Given: existing token in storage and successful /me lookup.
        sessionStorage.setItem("template_access_token", "existing-token");
        getConfigMock.mockResolvedValue({ login_enabled: true });
        meMock.mockResolvedValue(FULL_SYSTEM_SCENARIO.principal);

        // When: auth provider initializes.
        render(
            <AppConfigProvider>
                <AuthProvider>
                    <AuthProbe />
                </AuthProvider>
            </AppConfigProvider>,
        );

        // Then: provider uses existing token path without refresh call.
        await waitFor(() => {
            expect(screen.getByTestId("loading").textContent).toBe("false");
        });
        expect(screen.getByTestId("email").textContent).toBe(FULL_SYSTEM_SCENARIO.principal.email);
        expect(refreshMock).not.toHaveBeenCalled();
        expect(meMock).toHaveBeenCalledTimes(1);
        expect(sessionStorage.getItem("template_access_token")).toBe("existing-token");
    });

    it("clears session when /me fails and refresh also fails", async () => {
        // Given: existing token but both /me and refresh paths fail.
        sessionStorage.setItem("template_access_token", "stale-token");
        getConfigMock.mockResolvedValue({ login_enabled: true });
        meMock.mockRejectedValue(new Error("INVALID_TOKEN"));
        refreshMock.mockRejectedValue(new Error("INVALID_TOKEN"));

        // When: auth provider initializes.
        render(
            <AppConfigProvider>
                <AuthProvider>
                    <AuthProbe />
                </AuthProvider>
            </AppConfigProvider>,
        );

        // Then: provider falls back to logged-out state and clears token.
        await waitFor(() => {
            expect(screen.getByTestId("loading").textContent).toBe("false");
        });
        expect(screen.getByTestId("email").textContent).toBe("");
        expect(sessionStorage.getItem("template_access_token")).toBeNull();
        expect(refreshMock).toHaveBeenCalledTimes(1);
    });

    it("preserves the session on failed proof and ignores late profile data after deletion", async () => {
        // Given: an authenticated account and an unresolved profile response.
        sessionStorage.setItem("template_access_token", "existing-token");
        getConfigMock.mockResolvedValue({ login_enabled: true });
        meMock.mockResolvedValue(FULL_SYSTEM_SCENARIO.principal);
        deleteMeMock
            .mockRejectedValueOnce(new Error("invalid code"))
            .mockResolvedValueOnce(undefined);
        let finishUpdate!: (value: typeof FULL_SYSTEM_SCENARIO.principal) => void;
        updateMeMock.mockReturnValue(
            new Promise((resolve) => {
                finishUpdate = resolve;
            }),
        );
        render(
            <AppConfigProvider>
                <AuthProvider>
                    <AuthProbe />
                </AuthProvider>
            </AppConfigProvider>,
        );
        await waitFor(() => expect(screen.getByTestId("loading").textContent).toBe("false"));
        const user = userEvent.setup();
        await user.click(screen.getByRole("button", { name: "delete" }));
        expect(screen.getByTestId("email").textContent).toBe(FULL_SYSTEM_SCENARIO.principal.email);
        // When: successful deletion races a previously started profile mutation.
        await user.click(screen.getByRole("button", { name: "update" }));
        await user.click(screen.getByRole("button", { name: "delete" }));
        await act(async () => {
            finishUpdate(FULL_SYSTEM_SCENARIO.principal);
        });
        // Then: proof is passed to the API, and the old identity cannot be restored.
        expect(deleteMeMock).toHaveBeenLastCalledWith({
            email: FULL_SYSTEM_SCENARIO.principal.email,
            code: "123456",
        });
        expect(screen.getByTestId("email").textContent).toBe("");
        expect(sessionStorage.getItem("template_access_token")).toBeNull();
    });

    it("clears token and user even when logout API throws", async () => {
        // Given: bootstrap succeeds and logout endpoint later fails.
        sessionStorage.setItem("template_access_token", "existing-token");
        getConfigMock.mockResolvedValue({ login_enabled: true });
        meMock.mockResolvedValue(FULL_SYSTEM_SCENARIO.principal);
        logoutApiMock.mockRejectedValue(new Error("logout failed"));

        render(
            <AppConfigProvider>
                <AuthProvider>
                    <AuthProbe />
                </AuthProvider>
            </AppConfigProvider>,
        );

        await waitFor(() => {
            expect(screen.getByTestId("loading").textContent).toBe("false");
        });

        // When: logout action is triggered.
        const user = userEvent.setup();
        await user.click(screen.getByRole("button", { name: "logout" }));

        // Then: client session is cleared in finally branch.
        await waitFor(() => {
            expect(screen.getByTestId("email").textContent).toBe("");
        });
        expect(sessionStorage.getItem("template_access_token")).toBeNull();
        expect(logoutApiMock).toHaveBeenCalledTimes(1);
    });
});
