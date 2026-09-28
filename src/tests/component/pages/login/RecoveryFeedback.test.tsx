import { act, fireEvent, screen } from "@testing-library/react";
import { beforeEach, expect, it, vi } from "vitest";
import { Routes, Route } from "react-router-dom";
import { ForgotPasswordPage } from "../../../../pages/login/ForgotPasswordPage";
import { SignupPage } from "../../../../pages/login/SignupPage";
import { renderWithRouter } from "../../../utils/renderWithRouter";

const request = vi.fn();
vi.mock("../../../../hooks/useAuth", () => ({
    useAuthContext: () => ({ signup: request, user: null }),
}));
vi.mock("../../../../hooks/useFeatures", () => ({
    useAppConfig: () => ({ data: { email_enabled: true }, loading: false }),
}));
vi.mock("../../../../hooks/api/auth/useAuthApi", () => ({
    useAuthApi: () => ({
        requestPasswordReset: request,
        extractApiDetail: () => null,
        resolveAuthErrorMessage: () => "Please retry the request.",
    }),
}));
beforeEach(() => request.mockReset());

it.each(["signup", "forgot-password"])(
    "keeps %s pending, shows failure and carries retry success across navigation",
    async (path) => {
        // Given: a request that has not completed must not show a sent confirmation.
        let reject!: (reason: Error) => void;
        request.mockReturnValueOnce(
            new Promise((_, fail) => {
                reject = fail;
            }),
        );
        renderWithRouter(
            <Routes>
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/:action/email-sent" element={<div>Confirmation page</div>} />
            </Routes>,
            `/${path}`,
        );
        fireEvent.change(screen.getByLabelText("Email"), {
            target: { value: "person@example.com" },
        });
        if (path === "signup") {
            fireEvent.change(screen.getByLabelText("Name"), { target: { value: "Person" } });
            fireEvent.change(screen.getByLabelText("Password"), {
                target: { value: "GoodPass1!" },
            });
            fireEvent.change(screen.getByLabelText("Confirm password"), {
                target: { value: "GoodPass1!" },
            });
        }
        const submit = document.querySelector('button[type="submit"]')!;
        fireEvent.click(submit);
        expect(submit).toBeDisabled();
        expect(screen.queryByText("Confirmation page")).not.toBeInTheDocument();
        // When: the server rejects, retain the form and persistent recovery details.
        await act(async () => reject(new Error("unavailable")));
        expect(screen.getByText("Please retry the request.")).toBeInTheDocument();
        expect(document.querySelectorAll(".ui-toast-card")).toHaveLength(1);
        expect(screen.queryByText("Confirmation page")).not.toBeInTheDocument();
        // Then: successful retry navigates with exactly one surviving success notification.
        request.mockResolvedValueOnce(undefined);
        await act(async () => fireEvent.click(submit));
        expect(screen.getByText("Confirmation page")).toBeInTheDocument();
        expect(document.querySelectorAll(".ui-toast-card")).toHaveLength(1);
        expect(document.querySelector(".ui-toast-card")).toHaveTextContent(
            path === "signup" ? "Registration completed." : "Email request received.",
        );
    },
);
