import { useEffect, useState, type RefObject } from "react";
import { useTranslation } from "react-i18next";
import { useStyleStudioApi, type StyleScope } from "../../hooks/api/styleStudio/useStyleStudioApi";
import { Button, InputField } from "../../components/ui";
import fields from "../../dev/styleTokens.json";
import i18n from "../../i18n";
import en from "../../locales/styleStudio.en.json";
import ko from "../../locales/styleStudio.ko.json";
i18n.addResourceBundle("en", "translation", en, true, true);
i18n.addResourceBundle("ko", "translation", ko, true, true);
function colorHex(value: string): string {
    if (/^#[0-9a-fA-F]{6}$/.test(value)) return value;
    const rgb = /^rgba\((\d+),\s*(\d+),\s*(\d+),/.exec(value);
    return rgb
        ? `#${rgb
              .slice(1, 4)
              .map((channel) => Math.min(255, Number(channel)).toString(16).padStart(2, "0"))
              .join("")}`
        : "#000000";
}

type StyleStudioProps = { previewRoot: RefObject<HTMLElement | null> };
export default function StyleStudio({ previewRoot }: StyleStudioProps) {
    const { t } = useTranslation();
    const studio = useStyleStudioApi();
    const [theme, setTheme] = useState<"light" | "dark">("light");
    useEffect(() => {
        const root = previewRoot.current;
        if (!root || !studio.draft) return;
        const values = { ...studio.draft.shared, ...studio.draft[theme] };
        const previous = Object.fromEntries(
            Object.keys(values).map((key) => [key, root.style.getPropertyValue(key)]),
        );
        root.dataset.stylePreview = theme;
        for (const [key, value] of Object.entries(values)) root.style.setProperty(key, value);
        return () => {
            for (const [key, value] of Object.entries(previous)) {
                if (value) root.style.setProperty(key, value);
                else root.style.removeProperty(key);
            }
            delete root.dataset.stylePreview;
        };
    }, [studio.draft, theme, previewRoot]);
    const renderFields = (scope: StyleScope) =>
        fields
            .filter((field) => (field.scope === "shared") === (scope === "shared"))
            .map((field) => {
                const value = studio.draft?.[scope][field.key] ?? "";
                return field.kind === "choice" ? (
                    <label className="form-field" key={field.key}>
                        {t(`styleStudio.fields.${field.label}`)}
                        <select
                            value={value}
                            disabled={studio.busy}
                            onChange={(event) => studio.edit(scope, field.key, event.target.value)}
                        >
                            {field.options?.map((option) => (
                                <option key={option} value={option}>
                                    {option}
                                </option>
                            ))}
                        </select>
                    </label>
                ) : field.kind === "color" ? (
                    <div className="style-studio__color" key={field.key}>
                        <InputField
                            label={t(`styleStudio.fields.${field.label}`)}
                            value={value}
                            disabled={studio.busy}
                            onValueChange={(next) => studio.edit(scope, field.key, next)}
                        />
                        <InputField
                            className="style-studio__picker"
                            type="color"
                            label={t("styleStudio.picker", {
                                label: t(`styleStudio.fields.${field.label}`),
                            })}
                            value={colorHex(value)}
                            disabled={studio.busy}
                            onValueChange={(next) => studio.edit(scope, field.key, next)}
                        />
                    </div>
                ) : (
                    <InputField
                        key={field.key}
                        label={t(`styleStudio.fields.${field.label}`)}
                        value={value}
                        disabled={studio.busy}
                        onValueChange={(next) => studio.edit(scope, field.key, next)}
                    />
                );
            });
    return (
        <section className="style-studio" aria-label={t("styleStudio.title")}>
            <h2>{t("styleStudio.title")}</h2>
            <p>{t("styleStudio.description")}</p>
            {studio.snapshot && (
                <p className="style-studio__path">
                    {t("styleStudio.connected")}:{" "}
                    <code>
                        {studio.snapshot.root}/{studio.snapshot.file}
                    </code>
                </p>
            )}
            {studio.error && <p role="alert">{t(studio.error)}</p>}
            {studio.saved && <p role="status">{t("styleStudio.saved")}</p>}
            {studio.snapshot && studio.draft && (
                <>
                    <div className="style-studio__actions">
                        {(["light", "dark"] as const).map((mode) => (
                            <Button
                                key={mode}
                                aria-pressed={theme === mode}
                                onClick={() => setTheme(mode)}
                            >
                                {t(`styleStudio.${mode}`)}
                            </Button>
                        ))}
                    </div>
                    <p>{t("styleStudio.colorHelp")}</p>
                    <div className="style-studio__grid">{renderFields(theme)}</div>
                    <h3>{t("styleStudio.shared")}</h3>
                    <p>{t("styleStudio.lengthHelp")}</p>
                    <div className="style-studio__grid">{renderFields("shared")}</div>
                    <div className="style-studio__samples">
                        <div className="style-studio__sample-panel">
                            <span>{t("styleStudio.sample")}</span>
                            <Button>{t("styleStudio.sampleButton")}</Button>
                        </div>
                        <div className="style-studio__sample-hover">
                            {t("styleStudio.hoverSample")}
                        </div>
                    </div>
                    <details>
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
                </>
            )}
            <div className="style-studio__actions">
                <Button
                    loading={studio.busy}
                    disabled={!studio.changes.length}
                    onClick={() => void studio.apply()}
                >
                    {t("styleStudio.apply")}
                </Button>
                <Button disabled={studio.busy || !studio.changes.length} onClick={studio.reset}>
                    {t("styleStudio.reset")}
                </Button>
                <Button disabled={studio.busy} onClick={() => void studio.load()}>
                    {t("styleStudio.reload")}
                </Button>
            </div>
        </section>
    );
}
