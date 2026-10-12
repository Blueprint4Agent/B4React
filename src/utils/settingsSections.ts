export type SettingsSection =
    | "keyboard"
    | "account"
    | "general"
    | "appearance"
    | "developers"
    | "billing"
    | "support";

export function resolveSettingsSection(
    section: string | null,
    hasAccount: boolean,
): SettingsSection {
    if (section === "general" || section === "appearance" || section === "keyboard") return section;
    if (!hasAccount) return "general";
    if (section === "support") return "support";
    return section === "billing" ? "billing" : section === "developers" ? "developers" : "account";
}
