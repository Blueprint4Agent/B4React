import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { ToastProvider, useToast } from "../../../../hooks/useToast";

afterEach(() => vi.useRealTimers());
it("replaces notices without rerendering dispatch consumers and expires the newest message", () => {
    // Given: an ordinary consumer subscribes only to stable dispatch.
    vi.useFakeTimers();
    let renders = 0;
    function Consumer() {
        renders++;
        const showToast = useToast();
        return <button onClick={() => showToast("Saved.")}>Notify</button>;
    }
    render(
        <ToastProvider>
            <Consumer />
        </ToastProvider>,
    );
    // When: the same notification is requested again while the first timer is pending.
    fireEvent.click(screen.getByText("Notify"));
    act(() => vi.advanceTimersByTime(2500));
    fireEvent.click(screen.getByText("Notify"));
    act(() => vi.advanceTimersByTime(1000));
    // Then: one new notification survives the old deadline, with no consumer work.
    expect(screen.getAllByText("Saved.")).toHaveLength(1);
    expect(renders).toBe(1);
    act(() => vi.advanceTimersByTime(2180));
    expect(screen.queryByText("Saved.")).not.toBeInTheDocument();
    expect(renders).toBe(1);
});
