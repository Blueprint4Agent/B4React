import { useEffect, useState, type RefObject } from "react";
import { useTranslation } from "react-i18next";
import { useStyleStudioApi, type StyleScope } from "../../hooks/api/styleStudio/useStyleStudioApi";
import { SlidersHorizontal, PanelRightClose, RotateCcw } from "lucide-react";
import { createPortal } from "react-dom";
import {
    Button,
    NumberField,
    DropdownMenu,
    ColorPicker,
    ThemePreviewSelector,
    Tooltip,
} from "../../components/ui";
import type { ThemeMode, ResolvedTheme } from "../../hooks/useTheme";
import fields from "../../dev/styleTokens.json";
import i18n from "../../i18n";
import en from "../../locales/styleStudio.en.json";
import ko from "../../locales/styleStudio.ko.json";
i18n.addResourceBundle("en", "translation", en, true, true);
i18n.addResourceBundle("ko", "translation", ko, true, true);
type StyleStudioProps = {
    previewRoot: RefObject<HTMLElement | null>;
    themeMode: ThemeMode;
    theme: ResolvedTheme;
    onChangeTheme: (mode: ThemeMode) => void;
};
export default function StyleStudio({
    previewRoot,
    themeMode,
    theme,
    onChangeTheme,
}: StyleStudioProps) {
    const { t } = useTranslation();
    const studio = useStyleStudioApi();
    const [open, setOpen] = useState(() => window.innerWidth >= 1100);
    const [present, setPresent] = useState(open);
    useEffect(() => {
        if (open) {
            setPresent(true);
            return;
        }
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            setPresent(false);
            return;
        }
        const timer = window.setTimeout(() => setPresent(false), 180);
        return () => window.clearTimeout(timer);
    }, [open]);
    useEffect(() => {
        const root = previewRoot.current;
        if (!root || !studio.draft) return;
        const values = {
            ...studio.snapshot?.preview?.[theme],
            ...studio.draft.shared,
            ...studio.draft[theme],
        };
        const previous = Object.fromEntries(
            Object.keys(values).map((key) => [key, root.style.getPropertyValue(key)]),
        );
        const main = root.closest<HTMLElement>(".app-main");
        const previousBackground = main?.style.getPropertyValue("--style-preview-bg") ?? "";
        if (main && values["--bg"]) main.style.setProperty("--style-preview-bg", values["--bg"]);
        root.dataset.stylePreview = theme;
        for (const [key, value] of Object.entries(values)) root.style.setProperty(key, value);
        return () => {
            for (const [key, value] of Object.entries(previous)) {
                if (value) root.style.setProperty(key, value);
                else root.style.removeProperty(key);
            }
            delete root.dataset.stylePreview;
            if (main) {
                if (previousBackground)
                    main.style.setProperty("--style-preview-bg", previousBackground);
                else main.style.removeProperty("--style-preview-bg");
            }
        };
    }, [studio.draft, studio.snapshot, theme, previewRoot]);
    useEffect(() => {
        const catalogue = previewRoot.current?.closest<HTMLElement>(".showcase-catalog");
        if (catalogue) catalogue.dataset.styleStudioOpen = String(open);
        return () => {
            if (catalogue) delete catalogue.dataset.styleStudioOpen;
        };
    }, [open, previewRoot]);
    const renderFields = (scope: StyleScope, group: string) =>
        fields
            .filter((field) =>
                group === "colors"
                    ? field.scope === "theme"
                    : group === "shape"
                      ? field.key.includes("radius") || field.key === "--control-height"
                      : group === "typography"
                        ? field.key.startsWith("--font") || field.key === "--line-height"
                        : field.key.startsWith("--space"),
            )
            .map((field) => {
                const value = studio.draft?.[scope][field.key] ?? "";
                if (field.kind === "choice") {
                    const items = (field.options ?? []).map((option, index) => ({
                        id: option,
                        label:
                            field.key === "--font-family"
                                ? t(`styleStudio.fonts.${index}`)
                                : option,
                    }));
                    return (
                        <DropdownMenu
                            key={field.key}
                            className="style-studio__dropdown"
                            fieldLabel={t(`styleStudio.fields.${field.label}`)}
                            label={t(`styleStudio.fields.${field.label}`)}
                            triggerLabel={items.find((item) => item.id === value)?.label ?? value}
                            items={items}
                            onSelect={(next) => {
                                if (!studio.busy) studio.edit(scope, field.key, next);
                            }}
                            disabled={studio.busy}
                        />
                    );
                }
                if (field.kind === "color")
                    return (
                        <ColorPicker
                            key={field.key}
                            label={t(`styleStudio.fields.${field.label}`)}
                            value={value}
                            disabled={studio.busy}
                            onValueChange={(next) => studio.edit(scope, field.key, next)}
                        />
                    );
                return (
                    <NumberField
                        key={field.key}
                        label={t(`styleStudio.fields.${field.label}`)}
                        value={value.replace(/rem$/, "")}
                        min={field.min}
                        max={field.max}
                        step={field.kind === "length" ? 0.125 : 0.1}
                        unit={field.kind === "length" ? "rem" : "×"}
                        disabled={studio.busy}
                        onValueChange={(next) =>
                            studio.edit(
                                scope,
                                field.key,
                                next && field.kind === "length" ? `${next}rem` : next,
                            )
                        }
                    />
                );
            });
    return createPortal(
        <>
            {!present && (
                <Button className="style-studio-launcher" onClick={() => setOpen(true)}>
                    <SlidersHorizontal size={16} aria-hidden="true" />
                    <span>{t("styleStudio.open")}</span>
                    {studio.changes.length ? ` · ${studio.changes.length}` : ""}
                </Button>
            )}
            {present && (
                <aside
                    className={`style-studio${!open ? " style-studio--closing" : ""}`}
                    role="region"
                    aria-label={t("styleStudio.title")}
                    onKeyDown={(event) => {
                        if (event.key === "Escape") setOpen(false);
                    }}
                >
                    <header className="style-studio__header">
                        <div>
                            <h2>{t("styleStudio.title")}</h2>
                            <p>{t("styleStudio.description")}</p>
                        </div>
                        <div className="style-studio__header-actions">
                            <Tooltip content={t("styleStudio.reload")} side="left">
                                <Button
                                    className="style-studio__icon-button"
                                    aria-label={t("styleStudio.reload")}
                                    disabled={studio.busy}
                                    onClick={() => void studio.load()}
                                >
                                    <RotateCcw size={16} aria-hidden="true" />
                                </Button>
                            </Tooltip>
                            <Tooltip content={t("styleStudio.close")} side="left">
                                <Button
                                    className="style-studio__icon-button"
                                    aria-label={t("styleStudio.close")}
                                    onClick={() => setOpen(false)}
                                >
                                    <PanelRightClose size={16} aria-hidden="true" />
                                </Button>
                            </Tooltip>
                        </div>
                    </header>
                    <div className="style-studio__themes">
                        <ThemePreviewSelector themeMode={themeMode} onChangeTheme={onChangeTheme} />
                    </div>
                    <div className="style-studio__body">
                        {studio.error && <p role="alert">{t(studio.error)}</p>}
                        {studio.saved && <p role="status">{t("styleStudio.saved")}</p>}
                        {studio.snapshot &&
                            studio.draft &&
                            (["colors", "shape", "typography", "spacing"] as const).map((group) => (
                                <details
                                    className="style-studio__group"
                                    key={group}
                                    open={group === "colors" ? true : undefined}
                                >
                                    <summary>{t(`styleStudio.groups.${group}`)}</summary>
                                    <div className="style-studio__grid">
                                        {renderFields(group === "colors" ? theme : "shared", group)}
                                    </div>
                                </details>
                            ))}
                        <details className="style-studio__group">
                            <summary>
                                {t("styleStudio.changes", { count: studio.changes.length })}
                            </summary>
                            <ul>
                                {studio.changes.map((change) => (
                                    <li key={`${change.scope}:${change.key}`}>
                                        <code>
                                            {change.scope} {change.key}:{" "}
                                            {studio.snapshot?.values[change.scope][change.key]} →{" "}
                                            {change.value}
                                        </code>
                                    </li>
                                ))}
                            </ul>
                        </details>
                    </div>
                    <footer className="style-studio__footer">
                        <span>{t("styleStudio.pending", { count: studio.changes.length })}</span>
                        <div className="style-studio__actions">
                            <Button
                                disabled={studio.busy || !studio.changes.length}
                                onClick={studio.reset}
                            >
                                {t("styleStudio.reset")}
                            </Button>
                            <Button
                                loading={studio.busy}
                                disabled={!studio.changes.length}
                                onClick={() => void studio.apply()}
                            >
                                {t("styleStudio.apply")}
                            </Button>
                        </div>
                    </footer>
                </aside>
            )}
        </>,
        document.body,
    );
}
