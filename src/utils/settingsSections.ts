export type SettingsSection = "account" | "general" | "appearance" | "developers";

export function resolveSettingsSection(
    section: string | null,
    hasAccount: boolean,
): SettingsSection {
    if (section === "general" || section === "appearance") return section;
    if (!hasAccount) return "general";
    return section === "developers" ? "developers" : "account";
}
