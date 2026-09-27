import { Profiler, useRef } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";
import StyleStudio from "../../pages/development/StyleStudio";
import { readStyles, applyStyles } from "../../api/styleStudio/styleStudioApi";

vi.mock("../../api/styleStudio/styleStudioApi", () => ({
    readStyles: vi.fn(),
    applyStyles: vi.fn(),
}));
it("keeps draft input local, does not write before apply, and cleans preview on unmount", async () => {
    // Given: a fixed snapshot and an expensive sibling catalogue that must not rerender on input.
    vi.mocked(readStyles).mockResolvedValue({
        root: "/fixture",
        file: "src/styles/app.css",
        revision: "a".repeat(64),
        values: {
            light: { "--panel": "#ffffff" },
            dark: { "--panel": "#000000" },
            shared: { "--radius-control": "0.5rem" },
        },
    });
    const siblingRender = vi.fn();
    function Catalogue() {
        siblingRender();
        return <p>Existing catalogue</p>;
    }
    function Page() {
        const root = useRef<HTMLElement>(null);
        return (
            <section ref={root} data-testid="preview">
                <StyleStudio previewRoot={root} />
                <Profiler id="catalogue" onRender={() => undefined}>
                    <Catalogue />
                </Profiler>
            </section>
        );
    }
    const view = render(<Page />);
    await screen.findByLabelText("Panel background");
    const renders = siblingRender.mock.calls.length;
    // When: editing a style token.
    const user = userEvent.setup();
    await user.clear(screen.getByLabelText("Panel background"));
    await user.type(screen.getByLabelText("Panel background"), "#123456");
    const root = screen.getByTestId("preview");
    await waitFor(() => expect(root.style.getPropertyValue("--panel")).toBe("#123456"));
    // Then: no backend write or sibling rerender occurs, and preview leaves no residue.
    expect(applyStyles).not.toHaveBeenCalled();
    expect(siblingRender).toHaveBeenCalledTimes(renders);
    view.unmount();
    expect(root.style.getPropertyValue("--panel")).toBe("");
});
