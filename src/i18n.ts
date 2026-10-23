import { storageKey } from "./utils/basePath";
import { normalizeLanguageId, resolveLanguage } from "./utils/language";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "./locales/en.json";
import ko from "./locales/ko.json";

const project = __PROJECT_BRAND__;
if (project) {
    for (const locale of [en, ko]) {
        locale.landing.eyebrow = project.name;
        locale.nav.brand = project.short_name;
        for (const key of ["componentsAlt", "usersAlt", "serverAlt", "billingAlt"] as const) {
            locale.home.project[key] = locale.home.project[key].replace(
                "B4A",
                locale === en ? "Original template" : "원본 템플릿",
            );
        }
    }
    en.home.project.previewNote = "Original template screens · demo data";
    ko.home.project.previewNote = "원본 템플릿 화면 · 예시 데이터";
}

const LANGUAGE_STORAGE_KEY = storageKey("b4a_language");
let storedLanguage: string | null = null;
try {
    storedLanguage = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
} catch {
    // Blocked storage still permits an in-memory language selection.
}
const initialLanguage = resolveLanguage({
    stored: storedLanguage,
    projectDefault: project?.default_language,
    browserLanguages: [...(window.navigator.languages ?? []), window.navigator.language],
});
document.documentElement.lang = initialLanguage;

void i18n.use(initReactI18next).init({
    resources: {
        en: {
            translation: en,
        },
        ko: {
            translation: ko,
        },
    },
    lng: initialLanguage,
    fallbackLng: "en",
    interpolation: {
        escapeValue: false,
        defaultVariables: { brand: project?.name ?? "B4A" },
    },
});

i18n.on("languageChanged", (nextLanguage) => {
    if (typeof window === "undefined") {
        return;
    }
    const normalized = normalizeLanguageId(nextLanguage);
    if (!normalized) {
        return;
    }
    document.documentElement.lang = normalized;
    try {
        window.localStorage.setItem(LANGUAGE_STORAGE_KEY, normalized);
    } catch {
        // Keep the active language usable when persistence is unavailable.
    }
});

export default i18n;
