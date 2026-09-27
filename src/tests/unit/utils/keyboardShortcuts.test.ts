import { describe, expect, it } from "vitest";
import {
    isShortcutBlocked,
    matchesShortcut,
    orderedShortcutKeys,
    shortcutAriaKeys,
    shortcutKeyDisplay,
} from "../../../utils/keyboardShortcuts";

describe("keyboard shortcuts", () => {
    it("formats native modifier order and accessible key names", () => {
        // Given/When: the same portable shortcut on each platform.
        for (const platform of ["macos", "windows", "linux"] as const) {
            const keys = orderedShortcutKeys(["mod", "shift", "s"], platform);
            // Then: Mac symbols and Windows/Linux named modifiers agree with ARIA.
            expect(keys.map((key) => shortcutKeyDisplay(key, platform)).join("")).toBe(
                platform === "macos" ? "⇧⌘S" : "CtrlShiftS",
            );
            expect(shortcutAriaKeys(["mod", "b"], platform)).toBe(
                platform === "macos" ? "Meta+B" : "Control+B",
            );
        }
        expect(shortcutKeyDisplay("enter", "macos")).toBe("↵");
    });
    it("requires the correct platform modifier without extra modifiers", () => {
        // Given: browser keyboard events using each primary modifier.
        const mac = new KeyboardEvent("keydown", { key: "b", metaKey: true });
        const pc = new KeyboardEvent("keydown", { key: "B", ctrlKey: true });
        // When/Then: only an exact native chord matches.
        expect(matchesShortcut(mac, ["mod", "b"], "macos")).toBe(true);
        expect(matchesShortcut(pc, ["mod", "b"], "linux")).toBe(true);
        expect(matchesShortcut(pc, ["mod", "b"], "macos")).toBe(false);
        expect(
            matchesShortcut(
                new KeyboardEvent("keydown", { key: "b", ctrlKey: true, shiftKey: true }),
                ["mod", "b"],
                "windows",
            ),
        ).toBe(false);
    });
    it("protects typing, composition, repeated keys, and modal workflows", () => {
        // Given: an editable control receiving a bubbling keyboard event.
        const input = document.createElement("input");
        document.body.append(input);
        let blocked = false;
        input.addEventListener("keydown", (event) => {
            blocked = isShortcutBlocked(event);
        });
        input.dispatchEvent(new KeyboardEvent("keydown", { key: "b", bubbles: true }));
        // Then: editable, composing, repeat and modal events are excluded.
        expect(blocked).toBe(true);
        input.remove();
        expect(isShortcutBlocked(new KeyboardEvent("keydown", { isComposing: true }))).toBe(true);
        expect(isShortcutBlocked(new KeyboardEvent("keydown", { repeat: true }))).toBe(true);
        const modal = document.createElement("div");
        modal.setAttribute("role", "dialog");
        modal.setAttribute("aria-modal", "true");
        document.body.append(modal);
        expect(isShortcutBlocked(new KeyboardEvent("keydown"))).toBe(true);
        modal.remove();
        expect(isShortcutBlocked(new KeyboardEvent("keydown"))).toBe(false);
    });
});
