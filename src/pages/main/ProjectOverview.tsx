import { ArrowDown, ArrowUpRight, Layers3, ShieldCheck, Workflow } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "../../components/ui";

const previews = ["components", "settings"] as const;
const capabilities = [
    { key: "interface", icon: Layers3 },
    { key: "identity", icon: ShieldCheck },
    { key: "delivery", icon: Workflow },
] as const;

export function ProjectOverview() {
    const { t, i18n } = useTranslation();
    const [preview, setPreview] = useState<(typeof previews)[number]>("components");
    const language = i18n.resolvedLanguage?.startsWith("ko") ? "ko" : "en";
    return (
        <div className="home-overview">
            <section className="home-hero" aria-labelledby="home-project-title">
                <p className="home-eyebrow">B4FastAPI</p>
                <h2 id="home-project-title">
                    {t("home.project.title")}
                    <br />
                    <span>{t("home.project.titleAccent")}</span>
                </h2>
                <p className="home-hero__description">{t("home.project.description")}</p>
                <div className="home-hero__actions">
                    <Button
                        onClick={() =>
                            document
                                .getElementById("home-product-preview")
                                ?.scrollIntoView({ behavior: "instant", block: "start" })
                        }
                    >
                        {t("home.project.explore")} <ArrowDown size={15} aria-hidden="true" />
                    </Button>
                    <a className="home-text-link" href="#home-capabilities">
                        {t("home.project.included")} <ArrowUpRight size={15} aria-hidden="true" />
                    </a>
                </div>
                <div className="home-stack" aria-label={t("home.project.stack")}>
                    <span>FastAPI</span>
                    <span>React</span>
                    <span>TypeScript</span>
                    <span>Docker</span>
                </div>
            </section>
            <section
                id="home-product-preview"
                className="home-preview"
                aria-labelledby="home-preview-title"
            >
                <div className="home-section-heading">
                    <div>
                        <h3 id="home-preview-title">{t("home.project.previewTitle")}</h3>
                    </div>
                    <div
                        className="home-preview__switch"
                        role="group"
                        aria-label={t("home.project.previewSelect")}
                    >
                        {previews.map((item) => (
                            <Button
                                key={item}
                                appearance="text"
                                aria-pressed={preview === item}
                                onClick={() => setPreview(item)}
                            >
                                {t(`home.project.${item}`)}
                            </Button>
                        ))}
                    </div>
                </div>
                <figure className="home-preview__figure">
                    <div className="home-preview__chrome" aria-hidden="true">
                        <span className="home-preview__dots">
                            <i />
                            <i />
                            <i />
                        </span>
                        <span>
                            Blueprint4Agent /{" "}
                            {preview === "components" ? "UI components" : "Preferences"}
                        </span>
                        <span className="home-preview__mode">LIGHT</span>
                    </div>
                    <img
                        src={`${import.meta.env.BASE_URL}home-previews/${preview}-${language}.webp`}
                        width="1360"
                        height="900"
                        alt={t(`home.project.${preview}Alt`)}
                        decoding="async"
                    />
                    <figcaption>
                        <span>{t(`home.project.${preview}Caption`)}</span>
                        <span>{t("home.project.previewNote")}</span>
                    </figcaption>
                </figure>
            </section>
            <section
                id="home-capabilities"
                className="home-capabilities"
                aria-labelledby="home-capabilities-title"
            >
                <div className="home-section-heading">
                    <div>
                        <h3 id="home-capabilities-title">{t("home.project.capabilitiesTitle")}</h3>
                    </div>
                </div>
                <div className="home-capabilities__grid">
                    {capabilities.map(({ key, icon: Icon }) => (
                        <article key={key} className="home-capability">
                            <div className="home-capability__top">
                                <Icon size={20} aria-hidden="true" />
                            </div>
                            <h4>{t(`home.project.${key}Title`)}</h4>
                            <p>{t(`home.project.${key}Description`)}</p>
                        </article>
                    ))}
                </div>
            </section>
            <div className="home-overview__footer">
                <span>Blueprint4Agent</span>
                <p>{t("home.project.footer")}</p>
            </div>
        </div>
    );
}
