import { describe, expect, it } from "vitest";
import i18n from "../../../i18n";
import {
    buildPrompt,
    emptyDraft,
    missingQuestions,
    questionsFor,
} from "../../../pages/prompts/promptBuilder";

describe("guided prompt boundaries", () => {
    it("uses four questions for both paths and validates required inputs", () => {
        for (const mode of ["feature", "project"] as const) {
            const draft = emptyDraft();
            expect(questionsFor(mode, draft).map((q) => q.id)).toEqual([
                "title",
                "scope",
                "capabilities",
                "finish",
            ]);
            draft.title = "   ";
            expect(missingQuestions(mode, draft).map((q) => q.id)).toEqual(["title", "scope"]);
            draft.title = "Library";
            draft.scope = ["backend", "api"];
            expect(missingQuestions(mode, draft)).toEqual([]);
            draft.finish = "deploy";
            expect(missingQuestions(mode, draft).map((q) => q.id)).toEqual(["finish"]);
            draft.deployment = "Staging";
            expect(missingQuestions(mode, draft)).toEqual([]);
        }
    });
    it("keeps defaults isolated and preserves explicit RBAC permissions", () => {
        const draft = emptyDraft();
        draft.permissions.user.actions = ["read"];
        draft.permissions.guest.actions = ["read"];
        expect(emptyDraft().permissions.user.actions).toHaveLength(4);
        const output = buildPrompt("feature", draft, i18n.getFixedT("en"));
        expect(output).toContain("User: Read (Own)");
        expect(output).toContain("Guest: Read (Public)");
        expect(output).toContain("Deny unchecked actions");
    });
    it("omits deselected scope and stale deployment target", () => {
        const draft = emptyDraft();
        draft.scope = ["ui"];
        draft.capabilities = ["search"];
        draft.deployment = "OLD_SERVER";
        const output = buildPrompt("feature", draft, i18n.getFixedT("en"));
        expect(output).not.toContain("OLD_SERVER");
        expect(output).not.toContain("Payments: reuse billing");
        expect(output).toContain(
            "do not change APIs, business logic, persistence or authorization policy",
        );
        expect(output).toContain("Verify search/filter behavior");
        expect(output).toContain("do not merge or deploy");
    });
    it.each(["en", "ko"])("localizes output and honors local stopping point in %s", (language) => {
        const draft = emptyDraft();
        draft.title = "Library";
        draft.scope = ["backend", "frontend"];
        draft.notes = "Keep existing data";
        draft.finish = "local";
        const output = buildPrompt("project", draft, i18n.getFixedT(language));
        expect(output).toContain("Keep existing data");
        expect(output).toContain("AGENTS.md");
        expect(output).toContain("VERIFY_BASE");
        expect(output).not.toContain("promptBuilder.");
        expect(output).not.toContain("undefined");
        expect(output).toContain(
            language === "ko"
                ? "원격 push, PR 생성, 병합, 배포는 수행하지 마라"
                : "Do not push, create PRs, merge or deploy",
        );
    });
});
