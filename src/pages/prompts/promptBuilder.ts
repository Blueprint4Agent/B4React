import type { TFunction } from "i18next";

export type PromptMode = "feature" | "project";
export const SCOPE_OPTIONS = [
    "backend",
    "frontend",
    "ui",
    "api",
    "database",
    "auth",
    "realtime",
    "background",
    "storage",
    "billing",
    "tests",
    "deployment",
] as const;
export type PromptScope = (typeof SCOPE_OPTIONS)[number];
export const CAPABILITIES = [
    "crud",
    "search",
    "notification",
    "dashboard",
    "approval",
    "upload",
] as const;
export type Capability = (typeof CAPABILITIES)[number];
export const ROLES = ["guest", "user", "manager", "admin"] as const;
export const ACTIONS = ["read", "create", "update", "delete"] as const;
export type Role = (typeof ROLES)[number];
export type Action = (typeof ACTIONS)[number];
export type Permission = { actions: Action[]; ownership: "own" | "all" };
export type PromptDraft = {
    title: string;
    scope: PromptScope[];
    capabilities: Capability[];
    permissions: Record<Role, Permission>;
    notes: string;
    finish: "local" | "pr" | "merge" | "deploy";
    deployment: string;
};
export type FieldId = "title" | "scope" | "capabilities" | "finish";
export type Question = {
    id: FieldId;
    group: FieldId;
    required?: boolean;
    options?: readonly string[];
};
export function emptyDraft(): PromptDraft {
    return {
        title: "",
        scope: [],
        capabilities: [],
        notes: "",
        finish: "pr",
        deployment: "",
        permissions: {
            guest: { actions: [], ownership: "all" },
            user: { actions: [...ACTIONS], ownership: "own" },
            manager: { actions: ["read"], ownership: "all" },
            admin: { actions: [...ACTIONS], ownership: "all" },
        },
    };
}
export function questionsFor(_mode: PromptMode, draft: PromptDraft): Question[] {
    return [
        { id: "title", group: "title", required: true },
        { id: "scope", group: "scope", required: true, options: SCOPE_OPTIONS },
        { id: "capabilities", group: "capabilities", options: CAPABILITIES },
        {
            id: "finish",
            group: "finish",
            required: draft.finish === "deploy",
            options: ["local", "pr", "merge", "deploy"],
        },
    ];
}
export function permissionSummary(draft: PromptDraft, t: TFunction): string {
    return ROLES.map((role) => {
        const permission = draft.permissions[role];
        const actions = permission.actions.length
            ? permission.actions
                  .map((action) => t(`promptBuilder.rbac.actions.${action}`))
                  .join(", ")
            : t("promptBuilder.rbac.denied");
        return `${t(`promptBuilder.rbac.roles.${role}`)}: ${actions}${permission.actions.length ? ` (${role === "guest" ? t("promptBuilder.rbac.public") : t(`promptBuilder.rbac.ownership.${permission.ownership}`)})` : ""}`;
    }).join("\n");
}
export function answerFor(question: Question, draft: PromptDraft, t: TFunction): string {
    if (question.id === "scope")
        return (
            draft.scope.map((value) => t(`promptBuilder.options.scope.${value}`)).join(", ") ||
            t("promptBuilder.unspecified")
        );
    if (question.id === "capabilities")
        return [
            draft.capabilities
                .map((value) => t(`promptBuilder.options.capabilities.${value}`))
                .join(", ") || t("promptBuilder.defaults.capabilities"),
            permissionSummary(draft, t),
            ...(draft.notes.trim() ? [`${t("promptBuilder.notes")}: ${draft.notes.trim()}`] : []),
        ].join("\n\n");
    if (question.id === "finish")
        return (
            t(`promptBuilder.options.finish.${draft.finish}`) +
            (draft.finish === "deploy"
                ? `\n${t("promptBuilder.deployment")}: ${draft.deployment.trim() || t("promptBuilder.unspecified")}`
                : "")
        );
    return draft.title.trim();
}
export function isAnswered(question: Question, draft: PromptDraft): boolean {
    if (question.id === "scope") return draft.scope.length > 0;
    if (question.id === "finish")
        return draft.finish !== "deploy" || Boolean(draft.deployment.trim());
    if (question.id === "capabilities")
        return (
            draft.capabilities.length > 0 ||
            Boolean(draft.notes.trim()) ||
            ROLES.some(
                (role) =>
                    draft.permissions[role].ownership !==
                        emptyDraft().permissions[role].ownership ||
                    ACTIONS.some(
                        (action) =>
                            draft.permissions[role].actions.includes(action) !==
                            emptyDraft().permissions[role].actions.includes(action),
                    ),
            )
        );
    return Boolean(draft.title.trim());
}
export function missingQuestions(mode: PromptMode, draft: PromptDraft): Question[] {
    return questionsFor(mode, draft).filter((q) => q.required && !isAnswered(q, draft));
}
export function buildPrompt(mode: PromptMode, draft: PromptDraft, t: TFunction): string {
    const sections = questionsFor(mode, draft).map(
        (q) => `### ${t(`promptBuilder.fields.${q.id}.label`)}\n${answerFor(q, draft, t)}`,
    );
    return (
        [
            `# ${draft.title.trim()} — ${t(`promptBuilder.modes.${mode}.title`)}`,
            t("promptBuilder.output.intro"),
            `## ${t("promptBuilder.output.requirements")}\n\n${sections.join("\n\n")}`,
            `## ${t("promptBuilder.fields.scope.label")}\n${t("promptBuilder.output.scopeRule")}\n${draft.scope.map((scope) => "- " + t(`promptBuilder.output.scopes.${scope}`)).join("\n")}`,
            `## ${t("promptBuilder.rbac.title")}\n${t("promptBuilder.output.rbac")}`,
            `## ${t("promptBuilder.output.acceptanceTitle")}\n${t("promptBuilder.output.acceptanceBase")}\n${draft.capabilities.map((capability) => "- " + t(`promptBuilder.output.capabilities.${capability}`)).join("\n")}`,
            ...[
                "analysis",
                "design",
                ...(draft.scope.includes("backend") && draft.scope.includes("frontend")
                    ? ["implementation"]
                    : []),
                "verification",
                "integration",
                "report",
            ].map(
                (section) =>
                    `## ${t(`promptBuilder.output.${section}.title`)}\n${t(`promptBuilder.output.${section}.body`)}`,
            ),
            `## ${t("promptBuilder.output.boundary")}\n${t(`promptBuilder.output.endpoints.${draft.finish}`)}`,
        ].join("\n\n") + "\n"
    );
}
