import { StrictMode } from "react";
import { Link } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import { act, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import i18n from "../../../../i18n";
import { VerifyEmailPage } from "../../../../pages/login/VerifyEmailPage";
import { renderWithRouter } from "../../../utils/renderWithRouter";

const verifyEmail = vi.fn();
const extractApiDetail = vi.fn();
const resolveAuthErrorMessage = vi.fn(() => "Expired token");
vi.mock("../../../../hooks/api/auth/useAuthApi", () => ({
    useAuthApi: () => ({ verifyEmail, extractApiDetail, resolveAuthErrorMessage }),
}));

describe("email verification request lifetime", () => {
    beforeEach(async () => {
        verifyEmail.mockReset();
        await i18n.changeLanguage("en");
    });

    it("consumes once under StrictMode and keeps success when the language changes", async () => {
        verifyEmail.mockResolvedValueOnce({}).mockRejectedValue(new Error("Already consumed"));
        renderWithRouter(
            <StrictMode>
                <VerifyEmailPage />
            </StrictMode>,
            "/verify-email?token=sample",
        );
        await screen.findByRole("heading", { name: i18n.t("verifyEmail.successTitle") });
        expect(verifyEmail).toHaveBeenCalledTimes(1);
        await act(() => i18n.changeLanguage("ko"));
        await screen.findByRole("heading", { name: i18n.t("verifyEmail.successTitle") });
        expect(verifyEmail).toHaveBeenCalledTimes(1);
        expect(screen.queryByText("Expired token")).not.toBeInTheDocument();
        await act(() => i18n.changeLanguage("en"));
    });
    it("ignores an older token failure after navigation to a successful token", async () => {
        let rejectOld!: (reason: Error) => void;
        verifyEmail.mockImplementation((token: string) =>
            token === "old"
                ? new Promise((_, reject) => {
                      rejectOld = reject;
                  })
                : Promise.resolve({}),
        );
        renderWithRouter(
            <>
                <VerifyEmailPage />
                <Link to="/verify-email?token=new">Next token</Link>
            </>,
            "/verify-email?token=old",
        );
        await userEvent.click(screen.getByRole("link", { name: "Next token" }));
        await screen.findByRole("heading", { name: i18n.t("verifyEmail.successTitle") });
        await act(async () => {
            rejectOld(new Error("Old token expired"));
        });
        expect(
            screen.getByRole("heading", { name: i18n.t("verifyEmail.successTitle") }),
        ).toBeInTheDocument();
        expect(verifyEmail).toHaveBeenCalledTimes(2);
        expect(screen.queryByText("Expired token")).not.toBeInTheDocument();
    });
});
