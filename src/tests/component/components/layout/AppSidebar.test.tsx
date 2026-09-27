import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AppSidebar } from "../../../../components/layout/AppSidebar";
import { renderWithRouter } from "../../../utils/renderWithRouter";

const checkNowMock = vi.fn();
const logoutMock = vi.fn();
let loginEnabled: boolean | undefined = true;
let connectivityStatus = "offline";

vi.mock("../../../../hooks/useAuth", () => ({
    useAuthContext: () => ({
        user: { email: "user@example.com", name: "User" },
        logout: logoutMock,
    }),
}));

vi.mock("../../../../hooks/useFeatures", () => ({
    useAppConfig: () => ({ data: { login_enabled: loginEnabled } }),
}));

vi.mock("../../../../hooks/useTheme", () => ({
    useTheme: () => ({ themeMode: "system", setThemeMode: vi.fn() }),
}));

vi.mock("../../../../hooks/connectivity/useServerConnectivity", () => ({
    useServerConnectivity: () => ({
        isDesktop: true,
        status: connectivityStatus,
        checkNow: checkNowMock,
    }),
}));

describe("AppSidebar", () => {
    beforeEach(() => {
        loginEnabled = true;
        connectivityStatus = "offline";
        checkNowMock.mockReset();
        checkNowMock.mockResolvedValue(undefined);
        logoutMock.mockReset();
        logoutMock.mockResolvedValue(undefined);
    });

    it("places disconnected status beside the profile control", () => {
        // Given/When: an authenticated desktop screen loses server connectivity.
        const { container } = renderWithRouter(
            <AppSidebar expanded={false} onToggleExpanded={() => undefined} />,
            "/settings",
        );

        // Then: the compact status and profile control share the sidebar footer.
        const actions = container.querySelector(".app-sidebar__footer");
        expect(actions).toContainElement(screen.getByRole("status"));
        expect(actions).toContainElement(screen.getByRole("button", { name: "Open profile menu" }));
    });

    it("keeps the disconnected label stable during a manual retry", async () => {
        // Given: the server is disconnected and the manual retry takes time.
        let resolveRetry: () => void = () => undefined;
        checkNowMock.mockReturnValue(
            new Promise<void>((resolve) => {
                resolveRetry = resolve;
            }),
        );
        const user = userEvent.setup();
        renderWithRouter(
            <AppSidebar expanded={false} onToggleExpanded={() => undefined} />,
            "/settings",
        );

        // When: the user clicks the sidebar status button.
        const retryButton = screen.getByRole("button", { name: "Retry now" });
        await user.click(retryButton);

        // Then: the compact pill stays visually anchored instead of flashing to a reconnecting state.
        expect(retryButton).toHaveTextContent("Server disconnected");
        expect(screen.queryByText("Reconnecting")).not.toBeInTheDocument();
        expect(retryButton).toBeDisabled();

        resolveRetry();
        await waitFor(() => expect(retryButton).not.toBeDisabled());
    });

    it("blocks logout while the desktop server is disconnected", async () => {
        // Given: an authenticated desktop user is offline on the main page.
        const user = userEvent.setup();
        renderWithRouter(
            <AppSidebar expanded={false} onToggleExpanded={() => undefined} />,
            "/show-case",
        );

        // When: the user opens the profile menu.
        await user.click(screen.getByRole("button", { name: "Open profile menu" }));

        // Then: logout is unavailable instead of clearing local session and routing to login.
        const logoutButton = screen.getByRole("button", { name: "Sign out" });
        expect(logoutButton).toBeDisabled();
        await user.click(logoutButton);
        expect(logoutMock).not.toHaveBeenCalled();
    });
    it.each([false, undefined])(
        "hides account switching when login availability is %s",
        async (enabled) => {
            // Given: a bootstrap/cached identity with login disabled or config unavailable.
            loginEnabled = enabled;
            const user = userEvent.setup();
            renderWithRouter(<AppSidebar expanded={false} onToggleExpanded={() => undefined} />);
            // When: opening the profile menu.
            await user.click(screen.getByRole("button", { name: "Open profile menu" }));
            // Then: identity and settings remain, but account authentication actions are absent.
            expect(screen.getByText("user@example.com")).toBeInTheDocument();
            expect(screen.getByRole("link", { name: "Settings" })).toBeInTheDocument();
            expect(
                screen.queryByRole("button", { name: "Switch account" }),
            ).not.toBeInTheDocument();
            expect(screen.queryByText("Add account")).not.toBeInTheDocument();
            expect(screen.queryByText("Sign out")).not.toBeInTheDocument();
        },
    );

    it("retains switching and add account when login is enabled", async () => {
        // Given: login is explicitly enabled.
        const user = userEvent.setup();
        renderWithRouter(<AppSidebar expanded={false} onToggleExpanded={() => undefined} />);
        // When: opening account switching.
        await user.click(screen.getByRole("button", { name: "Open profile menu" }));
        await user.click(screen.getByRole("button", { name: "Switch account" }));
        // Then: the existing add-account route remains available.
        expect(screen.getByRole("link", { name: "Add account" })).toHaveAttribute(
            "href",
            "/login?switch=1",
        );
    });
});
