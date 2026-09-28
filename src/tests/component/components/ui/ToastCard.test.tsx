import { StrictMode } from "react";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ToastCard } from "../../../../components/ui";
import { ToastPreview } from "../../../../components/features/showcase/ToastPreview";

beforeEach(() => vi.useFakeTimers());
afterEach(() => {
    cleanup();
    vi.useRealTimers();
});

describe("ToastCard lifecycle", () => {
    it("announces a short message, waits three seconds and exits once in StrictMode", () => {
        // Given: a mounted toast with a polite status region.
        const dismissed = vi.fn();
        render(
            <StrictMode>
                <ToastCard message="Saved." onDismiss={dismissed} />
            </StrictMode>,
        );
        expect(screen.getByRole("status")).toHaveAttribute("aria-live", "polite");
        expect(screen.getByRole("status")).toHaveTextContent("Saved.");
        // When: the display interval elapses, retain the message through the exit animation.
        act(() => vi.advanceTimersByTime(2999));
        expect(screen.getByText("Saved.")).not.toHaveClass("ui-toast-card--closing");
        act(() => vi.advanceTimersByTime(1));
        expect(screen.getByText("Saved.")).toHaveClass("ui-toast-card--closing");
        expect(dismissed).not.toHaveBeenCalled();
        act(() => vi.advanceTimersByTime(180));
        // Then: content is removed and completion fires only once.
        expect(screen.queryByText("Saved.")).not.toBeInTheDocument();
        expect(dismissed).toHaveBeenCalledTimes(1);
        act(() => vi.advanceTimersByTime(10000));
        expect(dismissed).toHaveBeenCalledTimes(1);
    });

    it("replays the same message with a new key and cancels all old/unmounted timers", () => {
        // Given: a toast about to expire.
        const oldDismissed = vi.fn();
        const newDismissed = vi.fn();
        const { rerender, unmount } = render(
            <ToastCard key={1} message="Saved." onDismiss={oldDismissed} />,
        );
        act(() => vi.advanceTimersByTime(2500));
        // When: a fresh notification replaces it rather than stacking.
        rerender(<ToastCard key={2} message="Saved." onDismiss={newDismissed} />);
        act(() => vi.advanceTimersByTime(1000));
        // Then: only the fresh timer is live, and unmount prevents later callbacks.
        expect(screen.getAllByText("Saved.")).toHaveLength(1);
        expect(screen.getByText("Saved.")).not.toHaveClass("ui-toast-card--closing");
        expect(oldDismissed).not.toHaveBeenCalled();
        unmount();
        expect(vi.getTimerCount()).toBe(0);
        act(() => vi.advanceTimersByTime(10000));
        expect(newDismissed).not.toHaveBeenCalled();
    });

    it("uses the latest completion callback without prolonging an unchanged notification", () => {
        // Given: a toast whose parent rerenders during its lifetime.
        const oldDismissed = vi.fn();
        const newDismissed = vi.fn();
        const { rerender } = render(<ToastCard message="Saved." onDismiss={oldDismissed} />);
        act(() => vi.advanceTimersByTime(2000));
        // When: only the callback identity changes.
        rerender(<ToastCard message="Saved." onDismiss={newDismissed} />);
        act(() => vi.advanceTimersByTime(1180));
        // Then: the original deadline is honored with the current callback.
        expect(oldDismissed).not.toHaveBeenCalled();
        expect(newDismissed).toHaveBeenCalledTimes(1);
        expect(screen.queryByText("Saved.")).not.toBeInTheDocument();
    });

    it("ignores blank messages and bounds custom display durations", () => {
        // Given: no useful message to announce.
        const dismissed = vi.fn();
        const { rerender } = render(<ToastCard message="   " onDismiss={dismissed} />);
        expect(screen.queryByRole("status")).not.toBeInTheDocument();
        expect(vi.getTimerCount()).toBe(0);
        // When: a caller supplies a duration that is too short.
        rerender(<ToastCard message="  Saved.  " durationMs={0} onDismiss={dismissed} />);
        act(() => vi.advanceTimersByTime(999));
        expect(screen.getByText("Saved.")).not.toHaveClass("ui-toast-card--closing");
        act(() => vi.advanceTimersByTime(181));
        // Then: the minimum display time is one second, plus the exit phase.
        expect(dismissed).toHaveBeenCalledTimes(1);
    });

    it("keeps replay and expiry updates inside the preview instead of rerendering its catalogue", () => {
        // Given: a parent whose render count represents the surrounding catalogue.
        let renders = 0;
        function Catalogue() {
            renders++;
            return <ToastPreview />;
        }
        render(<Catalogue />);
        // When: triggering and replaying, then allowing automatic dismissal.
        fireEvent.click(screen.getByRole("button"));
        fireEvent.click(screen.getByRole("button"));
        expect(document.querySelectorAll(".ui-toast-card")).toHaveLength(1);
        act(() => vi.advanceTimersByTime(3180));
        // Then: local transient state never rerenders the parent.
        expect(document.querySelector(".ui-toast-card")).not.toBeInTheDocument();
        expect(renders).toBe(1);
    });
});
