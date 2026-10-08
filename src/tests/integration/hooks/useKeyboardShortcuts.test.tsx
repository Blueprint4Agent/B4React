import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { beforeEach, expect, it, vi } from "vitest";
import { AppConfigProvider } from "../../../hooks/AppConfigProvider";
import { AuthProvider, useAuthContext } from "../../../hooks/useAuth";
import {
    KeyboardShortcutsProvider,
    useKeyboardShortcuts,
} from "../../../hooks/useKeyboardShortcuts";
import { server } from "../../mocks/server";
import { clearAccessToken } from "../../../store/session";

const account = {
    id: 41,
    email: "keys@example.com",
    name: "Keys",
    role: "user",
    is_verified: true,
    created_at: "2026-01-01T00:00:00Z",
    keyboard_shortcuts: null,
};
const keys = {
    toggleSidebar: ["b"],
    openSettings: ["mod", ","],
    openProfile: ["mod", "shift", "p"],
};
function Probe() {
    const { bindings, update, reset, disabled } = useKeyboardShortcuts();
    const { logout, login, user } = useAuthContext();
    return (
        <>
            <span data-testid="account">{user?.email}</span>
            <output>{JSON.stringify(bindings)}</output>
            <button disabled={disabled} onClick={() => void update("toggleSidebar", ["b"])}>
                save
            </button>
            <button disabled={disabled} onClick={() => void reset()}>
                reset
            </button>
            <button onClick={() => void logout()}>logout</button>
            <button
                onClick={() =>
                    void login({
                        email: "second@example.com",
                        password: "password",
                        remember_me: false,
                    })
                }
            >
                switch
            </button>
        </>
    );
}
function mount() {
    return render(
        <AppConfigProvider>
            <AuthProvider>
                <KeyboardShortcutsProvider>
                    <Probe />
                </KeyboardShortcutsProvider>
            </AuthProvider>
        </AppConfigProvider>,
    );
}
beforeEach(() => {
    clearAccessToken();
    localStorage.clear();
    server.use(
        http.get(/.*\/config$/, () =>
            HttpResponse.json({
                app_mode: "development",
                login_enabled: false,
                bootstrap_user: account,
                bootstrap_access_token: "bootstrap",
            }),
        ),
        http.post(/.*\/auth\/logout$/, () => HttpResponse.json({ message: "ok" })),
        http.post(/.*\/auth\/login$/, () =>
            HttpResponse.json({
                user: { ...account, id: 42, email: "second@example.com" },
                access_token: "second",
            }),
        ),
    );
});
it("uses server-confirmed account bindings, saves/reset through the API and never reads browser preferences", async () => {
    // Given: legacy browser keys and a server-backed profile, without a separate shortcut fetch.
    localStorage.setItem("b4react.keyboard-shortcuts.v1", JSON.stringify(keys));
    const writes = vi.fn();
    server.use(
        http.patch(/.*\/auth\/me$/, async ({ request }) => {
            const body = (await request.json()) as { keyboard_shortcuts: typeof keys | null };
            writes(body);
            return HttpResponse.json({ ...account, ...body });
        }),
    );
    mount();
    await waitFor(() => expect(screen.getByText("save")).toBeEnabled());
    expect(screen.getByRole("status")).toHaveTextContent('"toggleSidebar":["mod","b"]');
    expect(writes).not.toHaveBeenCalled();
    // When: explicitly saving and resetting.
    fireEvent.click(screen.getByText("save"));
    await waitFor(() =>
        expect(screen.getByRole("status")).toHaveTextContent('"toggleSidebar":["b"]'),
    );
    expect(writes).toHaveBeenCalledExactlyOnceWith({ keyboard_shortcuts: keys });
    fireEvent.click(screen.getByText("reset"));
    // Then: only confirmed server values are applied; reset is a durable null update.
    await waitFor(() =>
        expect(screen.getByRole("status")).toHaveTextContent('"toggleSidebar":["mod","b"]'),
    );
    expect(writes).toHaveBeenLastCalledWith({ keyboard_shortcuts: null });
    expect(localStorage.getItem("b4react.keyboard-shortcuts.v1")).toBe(JSON.stringify(keys));
});
it("preserves bindings on failed writes and allows retry", async () => {
    // Given: a failing database-backed profile update.
    server.use(
        http.patch(/.*\/auth\/me$/, () =>
            HttpResponse.json({ detail: { error: "PROFILE_UPDATE_FAILED" } }, { status: 500 }),
        ),
    );
    mount();
    await waitFor(() => expect(screen.getByText("save")).toBeEnabled());
    // When: saving fails.
    fireEvent.click(screen.getByText("save"));
    await waitFor(() => expect(screen.getByText("save")).toBeEnabled());
    // Then: no optimistic or browser-persisted binding replaces the confirmed value.
    expect(screen.getByRole("status")).toHaveTextContent('"toggleSidebar":["mod","b"]');
    expect(localStorage.getItem("b4react.keyboard-shortcuts.v1")).toBeNull();
});
it("ignores an old account's delayed save and guests retain read-only defaults", async () => {
    // Given: a pending save owned by the initial account.
    let finish!: () => void;
    const pending = new Promise<void>((resolve) => {
        finish = resolve;
    });
    const started = vi.fn();
    server.use(
        http.patch(/.*\/auth\/me$/, async () => {
            started();
            await pending;
            return HttpResponse.json({ ...account, keyboard_shortcuts: keys });
        }),
    );
    mount();
    await waitFor(() => expect(screen.getByText("save")).toBeEnabled());
    fireEvent.click(screen.getByText("save"));
    await waitFor(() => expect(started).toHaveBeenCalledOnce());
    // When: switching users before the old save resolves.
    fireEvent.click(screen.getByText("switch"));
    await waitFor(() =>
        expect(screen.getByTestId("account")).toHaveTextContent("second@example.com"),
    );
    await act(async () => finish());
    await waitFor(() => expect(screen.getByText("save")).toBeEnabled());
    // Then: new account defaults survive the stale response; logout disables writes.
    expect(screen.getByRole("status")).toHaveTextContent('"toggleSidebar":["mod","b"]');
    fireEvent.click(screen.getByText("logout"));
    await waitFor(() => expect(screen.getByText("save")).toBeDisabled());
    expect(screen.getByRole("status")).toHaveTextContent('"toggleSidebar":["mod","b"]');
});
