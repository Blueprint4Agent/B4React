import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AdminPage } from "../../../../pages/admin/AdminPage";
import type { AdminUserList } from "../../../../hooks/api/auth/useAdminUsers";
import i18n from "../../../../i18n";

vi.mock("../../../../hooks/useAuth", () => ({
    useAuthContext: () => ({ user: { id: 1, role: "admin" }, loading: false }),
}));
const response = vi.hoisted(() => ({
    value: {} as { data: AdminUserList; loading: boolean; error: string | null },
}));
vi.mock("../../../../hooks/api/auth/useAdminUsers", () => ({
    useAdminUsers: () => ({ ...response.value, available: true, reload: () => undefined }),
}));
function payload(): AdminUserList {
    return {
        page: 1,
        page_size: 10,
        total: 10,
        summary: { total_users: 10, active_users: 10, admin_users: 1 },
        items: Array.from({ length: 10 }, (_, id) => ({
            id,
            name: `Person ${id}`,
            email: `person${id}@example.com`,
            role: "user",
            is_active: true,
            is_verified: true,
            login_providers: ["email"],
            created_at: "2026-01-01T00:00:00Z",
            last_login_at: "2026-09-01T00:00:00Z",
        })),
    };
}
afterEach(async () => {
    vi.restoreAllMocks();
    await act(async () => {
        await i18n.changeLanguage("en");
    });
});

describe("admin table render isolation", () => {
    it("does no additional date formatting during unrelated search typing", async () => {
        // Given: ten loaded rows with two dates each.
        response.value = { data: payload(), loading: false, error: null };
        const formats = vi.spyOn(
            Intl.DateTimeFormat.prototype as unknown as { readonly format: unknown },
            "format",
            "get",
        );
        const constructors = vi.spyOn(Intl, "DateTimeFormat");
        render(<AdminPage />);
        const initial = formats.mock.calls.length;
        expect(initial).toBe(20);
        expect(constructors).toHaveBeenCalledTimes(1);
        // When: six characters update only the page's draft search state.
        await userEvent.setup().type(screen.getByRole("searchbox"), "person");
        // Then: the actual table skips six otherwise redundant passes (120 format calls).
        expect(screen.getByRole("searchbox")).toHaveValue("person");
        expect(formats).toHaveBeenCalledTimes(initial);
        expect(constructors).toHaveBeenCalledTimes(1);
    });
    it("still renders changed rows, language and loading/error states", async () => {
        // Given: a loaded memoized table.
        response.value = { data: payload(), loading: false, error: null };
        const { rerender } = render(<AdminPage />);
        // When: a fresh API snapshot and locale arrive.
        response.value = {
            ...response.value,
            data: { ...payload(), items: [{ ...payload().items[0], name: "Updated person" }] },
        };
        rerender(<AdminPage />);
        expect(screen.getByText("Updated person")).toBeVisible();
        expect(screen.queryByText("Person 1")).not.toBeInTheDocument();
        await act(async () => {
            await i18n.changeLanguage("ko");
        });
        // Then: context changes invalidate memo and empty/loading/error props remain live.
        expect(screen.getByRole("region", { name: i18n.t("admin.users") })).toBeVisible();
        expect(screen.getByText(i18n.t("recentAccounts.providers.email"))).toBeVisible();
        response.value = { data: { ...payload(), items: [] }, loading: true, error: null };
        rerender(<AdminPage />);
        expect(screen.getByRole("table")).toHaveTextContent(i18n.t("admin.loading"));
        response.value = { ...response.value, loading: false, error: "request failed" };
        rerender(<AdminPage />);
        expect(screen.getByRole("table")).toHaveTextContent(i18n.t("admin.loadError"));
    });
});
