import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, expect, it, vi } from "vitest";
import { BillingProfileDialog } from "../../../../../components/features/billing/BillingProfileDialog";

const mocks = vi.hoisted(() => ({ getValue: vi.fn(), ready: true }));
vi.mock("../../../../../components/features/billing/BillingAddressFields", async () => {
    const { useEffect } = await import("react");
    return {
        default: ({
            onReady,
            onError,
        }: {
            onReady: (element: unknown) => void;
            onError: () => void;
        }) => {
            useEffect(() => {
                if (mocks.ready) onReady({ getValue: mocks.getValue });
            }, []);
            return (
                <button type="button" onClick={onError}>
                    Simulate address load failure
                </button>
            );
        },
    };
});
const address = {
    country: "US",
    state: "NY",
    city: "New York",
    line1: "123 Test Street",
    line2: null,
    postal_code: "10001",
};
const props = {
    publicKey: "pk_test_fixture",
    profile: null,
    email: "billing@example.com",
    busy: false,
    error: null,
    onClose: vi.fn(),
};
beforeEach(() => {
    mocks.getValue.mockReset();
    mocks.ready = true;
});

it("keeps saving disabled until hosted address fields are ready", async () => {
    // Given: Stripe has not mounted its address fields.
    mocks.ready = false;
    const save = vi.fn();
    render(<BillingProfileDialog {...props} onSave={save} />);
    await screen.findByRole("button", { name: "Simulate address load failure" });
    // When/Then: neither the button nor direct form submission bypasses readiness.
    expect(screen.getByRole("button", { name: "Save" })).toBeDisabled();
    fireEvent.submit(document.getElementById("billing-profile-form")!);
    expect(save).not.toHaveBeenCalled();
});

it("validates the country-specific address and saves the latest provider value once", async () => {
    // Given: incomplete address must not reach the profile API.
    mocks.getValue.mockResolvedValueOnce({
        complete: false,
        value: { name: "Test User", address },
    });
    const save = vi.fn().mockResolvedValue(undefined);
    render(<BillingProfileDialog {...props} onSave={save} />);
    const button = screen.getByRole("button", { name: "Save" });
    await waitFor(() => expect(button).toBeEnabled());
    fireEvent.click(button);
    await waitFor(() => expect(mocks.getValue).toHaveBeenCalledTimes(1));
    expect(save).not.toHaveBeenCalled();
    // When: country/address changes and validation resolves after repeated submission.
    let resolve!: (value: unknown) => void;
    mocks.getValue.mockReturnValue(
        new Promise((done) => {
            resolve = done;
        }),
    );
    await waitFor(() => expect(button).toBeEnabled());
    fireEvent.click(button);
    fireEvent.submit(document.getElementById("billing-profile-form")!);
    resolve({ complete: true, value: { name: "Test User", address } });
    // Then: latest structured address is saved once with optional line2 normalized.
    await waitFor(() => expect(save).toHaveBeenCalledTimes(1));
    expect(save).toHaveBeenCalledWith({
        email: "billing@example.com",
        name: "Test User",
        address: { ...address, line2: "" },
    });
    expect(mocks.getValue).toHaveBeenCalledTimes(2);
});

it("shows provider load failure in the dialog and permits a fresh load", async () => {
    // Given: the hosted address fields fail to load.
    const save = vi.fn();
    render(<BillingProfileDialog {...props} onSave={save} />);
    fireEvent.click(await screen.findByRole("button", { name: "Simulate address load failure" }));
    // Then: saving stays blocked and the existing modal exposes recovery.
    expect(screen.getByRole("alert")).toBeVisible();
    expect(screen.getByRole("button", { name: "Save" })).toBeDisabled();
    // When: reloading the fields succeeds, the save action recovers.
    fireEvent.click(screen.getByRole("button", { name: "Refresh" }));
    await waitFor(() => expect(screen.getByRole("button", { name: "Save" })).toBeEnabled());
    expect(save).not.toHaveBeenCalled();
});
