import { useTranslation } from "react-i18next";
import type { ThemeMode } from "../../../hooks/useTheme";

type ThemePreviewSelectorProps = {
    themeMode: ThemeMode;
    onChangeTheme: (mode: ThemeMode) => void;
};

export function ThemePreviewSelector({ themeMode, onChangeTheme }: ThemePreviewSelectorProps) {
    const { t } = useTranslation();
    return (
        <div className="theme-preview-selector" role="group" aria-label={t("theme.select")}>
            {(["system", "light", "dark"] as const).map((mode) => (
                <button
                    key={mode}
                    type="button"
                    className="theme-preview-option"
                    aria-pressed={themeMode === mode}
                    onClick={() => onChangeTheme(mode)}
                >
                    <span className={`theme-preview theme-preview--${mode}`} aria-hidden="true">
                        <span className="theme-preview__rail">
                            <i />
                            <i />
                            <i />
                        </span>
                        <span className="theme-preview__page">
                            <i />
                            <i />
                            <i />
                        </span>
                    </span>
                    <span>{t(`theme.${mode}`)}</span>
                </button>
            ))}
        </div>
    );
}
