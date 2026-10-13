import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, expect, it } from "vitest";
import i18n from "../../../../i18n";
import { PromptBuilderPage } from "../../../../pages/prompts/PromptBuilderPage";
import { renderWithRouter } from "../../../utils/renderWithRouter";

beforeEach(async () => {
    await i18n.changeLanguage("en");
});
it("starts from a capsule, validates required input and keeps separate path drafts", async () => {
    const user = userEvent.setup();
    renderWithRouter(<PromptBuilderPage />);
    await user.click(screen.getByRole("button", { name: "Start with Blueprint?" }));
    await user.click(screen.getByRole("button", { name: /Add a feature/ }));
    expect(screen.getByRole("button", { name: "Continue" })).toBeDisabled();
    await user.type(screen.getByRole("textbox"), "   ");
    expect(screen.getByRole("button", { name: "Continue" })).toBeDisabled();
    await user.clear(screen.getByRole("textbox"));
    await user.type(screen.getByRole("textbox"), "Search resources");
    await user.click(screen.getByRole("button", { name: "Back" }));
    await user.click(screen.getByRole("button", { name: /Start a project/ }));
    expect(screen.getByRole("textbox")).toHaveValue("");
    await user.click(screen.getByRole("button", { name: "Back" }));
    await user.click(screen.getByRole("button", { name: /Add a feature/ }));
    expect(screen.getByRole("textbox")).toHaveValue("Search resources");
    expect(screen.getByRole("heading", { name: "What is the feature called?" })).toHaveFocus();
});
