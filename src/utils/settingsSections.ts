export type SettingsSection =
    | "keyboard"
    | "account"
    | "general"
    | "appearance"
    | "developers"
    | "billing";

export function resolveSettingsSection(
    section: string | null,
    hasAccount: boolean,
): SettingsSection {
    if (section === "general" || section === "appearance" || section === "keyboard") return section;
    if (!hasAccount) return "general";
    return section === "billing" ? "billing" : section === "developers" ? "developers" : "account";
}
