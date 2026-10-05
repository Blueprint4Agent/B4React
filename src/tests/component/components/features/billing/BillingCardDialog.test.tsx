import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, expect, it, vi } from "vitest";
import BillingCardDialog from "../../../../../components/features/billing/BillingCardDialog";
const mocks = vi.hoisted(() => ({ confirm: vi.fn() }));
vi.mock("@stripe/stripe-js/pure", () => ({ loadStripe: () => Promise.resolve({}) }));
vi.mock("@stripe/react-stripe-js", async () => {
    const { useEffect } = await import("react");
    return {
        Elements: ({ children }: { children: React.ReactNode }) => children,
        useStripe: () => ({ confirmSetup: mocks.confirm }),
        useElements: () => ({}),
        PaymentElement: ({ onReady }: { onReady: () => void }) => {
            useEffect(onReady, [onReady]);
            return <div>Stripe secure fields</div>;
        },
    };
});
beforeEach(() => mocks.confirm.mockReset());
const setup = { id: "seti_example", client_secret: "seti_example_secret_fixture" };
it("verifies successful setup with the server and retries verification without reconfirming", async () => {
    mocks.confirm.mockResolvedValue({ setupIntent: { status: "succeeded" } });
    const registered = vi.fn().mockResolvedValueOnce(false).mockResolvedValueOnce(true);
    window.history.replaceState({}, "", "/prefix/settings?section=billing");
    render(
        <BillingCardDialog
            setup={setup}
            publicKey="pk_test_fixture"
            error={null}
            onClose={vi.fn()}
            onRegistered={registered}
        />,
    );
    const save = screen.getByRole("button", { name: "Save card" });
    await waitFor(() => expect(save).toBeEnabled());
    fireEvent.click(save);
    await screen.findByText("Card registration is not confirmed yet. Please try again shortly.");
    expect(registered).toHaveBeenCalledWith("seti_example");
    const params = mocks.confirm.mock.calls[0][0];
    expect(new URL(params.confirmParams.return_url).pathname).toBe("/prefix/settings");
    expect(new URL(params.confirmParams.return_url).searchParams.get("billing_card_setup")).toBe(
        "seti_example",
    );
    expect(params.redirect).toBe("if_required");
    fireEvent.click(save);
    await waitFor(() => expect(registered).toHaveBeenCalledTimes(2));
    expect(mocks.confirm).toHaveBeenCalledTimes(1);
});
it("retains provider validation errors in the dialog without claiming registration", async () => {
    mocks.confirm.mockResolvedValue({ error: { message: "Your card is incomplete." } });
    const registered = vi.fn();
    render(
        <BillingCardDialog
            setup={setup}
            publicKey="pk_test_fixture"
            error={null}
            onClose={vi.fn()}
            onRegistered={registered}
        />,
    );
    const save = screen.getByRole("button", { name: "Save card" });
    await waitFor(() => expect(save).toBeEnabled());
    fireEvent.click(save);
    await screen.findByText("Your card is incomplete.");
    expect(registered).not.toHaveBeenCalled();
});
