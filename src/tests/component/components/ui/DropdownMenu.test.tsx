import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { DropdownMenu, Modal } from "../../../../components/ui";

beforeEach(() => {
    // JSDOM has no geometry; browser tests own clipping/placement assertions.
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({
        x: 20,
        y: 20,
        top: 20,
        left: 20,
        bottom: 60,
        right: 120,
        width: 100,
        height: 40,
        toJSON: () => ({}),
    });
    vi.spyOn(HTMLElement.prototype, "getClientRects").mockReturnValue({ length: 1 } as DOMRectList);
});
afterEach(() => vi.restoreAllMocks());

it("keeps portal menu selection and focus inside a keyboard-dismissible dialog", () => {
    const close = vi.fn();
    const select = vi.fn();
    render(
        <Modal open keyboardDismissible title="Create key" onClose={close}>
            <DropdownMenu
                triggerLabel="30 days"
                items={[
                    { id: "never", label: "No expiration" },
                    { id: "90d", label: "90 days" },
                ]}
                onSelect={select}
            />
        </Modal>,
    );
    const trigger = screen.getByRole("button", { name: "30 days" });
    fireEvent.click(trigger);
    const option = screen.getByRole("menuitem", { name: "No expiration" });
    option.focus();
    // Tab between portaled options is not mistaken for focus outside the dialog.
    const tab = new KeyboardEvent("keydown", {
        key: "Tab",
        bubbles: true,
        cancelable: true,
    });
    expect(option.dispatchEvent(tab)).toBe(true);
    fireEvent.click(option);
    expect(select).toHaveBeenCalledWith("never");
    expect(trigger).toHaveFocus();
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    expect(close).not.toHaveBeenCalled();
    fireEvent.click(trigger);
    fireEvent.keyDown(trigger, { key: "Escape" });
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    expect(close).not.toHaveBeenCalled();
    expect(trigger).toHaveFocus();
    fireEvent.keyDown(trigger, { key: "Escape" });
    expect(close).toHaveBeenCalledTimes(1);
});
