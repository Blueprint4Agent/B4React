export type SupportedLanguageId = "en" | "ko";

export function normalizeLanguageId(value: string | null | undefined): SupportedLanguageId | null {
    const normalized = value?.split("-")[0]?.toLowerCase();
    return normalized === "en" || normalized === "ko" ? normalized : null;
}

export function resolveLanguage(options: {
    stored?: string | null;
    projectDefault?: SupportedLanguageId;
    browserLanguages?: readonly string[];
}): SupportedLanguageId {
    return (
        normalizeLanguageId(options.stored) ??
        options.projectDefault ??
        options.browserLanguages
            ?.map(normalizeLanguageId)
            .find((value): value is SupportedLanguageId => value !== null) ??
        "en"
    );
}
