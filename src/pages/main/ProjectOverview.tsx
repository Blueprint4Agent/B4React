import {
    Activity,
    Coffee,
    CreditCard,
    Database,
    HardDrive,
    Mail,
    ArrowDown,
    ArrowRight,
    Layers3,
    Maximize2,
    ShieldCheck,
    Workflow,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../../hooks/useAuth";
import { useAppConfig } from "../../hooks/useFeatures";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { getCoffeeSupportUrl } from "../../utils/coffeeSupport";
import { Button, Modal } from "../../components/ui";

const previews = ["components", "users", "server", "billing"] as const;
const capabilities = [
    { key: "interface", icon: Layers3 },
    { key: "identity", icon: ShieldCheck },
    { key: "billing", icon: CreditCard },
    { key: "cache", icon: Database },
    { key: "email", icon: Mail },
    { key: "storage", icon: HardDrive },
    { key: "operations", icon: Activity },
    { key: "delivery", icon: Workflow },
] as const;

export function ProjectOverview() {
    const { t, i18n } = useTranslation();
    const [preview, setPreview] = useState<(typeof previews)[number]>("components");
    const [viewerOpen, setViewerOpen] = useState(false);
    const navigate = useNavigate();
    const { data: config } = useAppConfig();
    const { user } = useAuthContext();
    const destinations: Record<(typeof previews)[number], string | null> = {
        components: config?.app_mode === "development" ? "/show-case" : null,
        users: user?.role === "admin" || user?.role === "manager" ? "/admin" : null,
        server: user?.role === "admin" ? "/admin/server" : null,
        billing: config?.billing_enabled ? (user ? "/settings?section=billing" : "/plans") : null,
    };
    const destination = destinations[preview];
    const coffeeUrl = getCoffeeSupportUrl(
        config?.app_mode,
        import.meta.env.VITE_BUY_ME_A_COFFEE_ENABLED,
        import.meta.env.VITE_BUY_ME_A_COFFEE_URL,
    );
    const scrollToSection = (id: string) =>
        document.getElementById(id)?.scrollIntoView({
            behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
                ? "instant"
                : "smooth",
            block: "start",
        });
    const language = i18n.resolvedLanguage?.startsWith("ko") ? "ko" : "en";
    return (
        <div className="home-overview">
            <section className="home-hero" aria-labelledby="home-project-title">
                <div className="home-hero__topline">
                    <p className="home-eyebrow">{t("nav.brand")}</p>
                    {coffeeUrl ? (
                        <a
                            className="home-support-link"
                            href={coffeeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <Coffee size={14} aria-hidden="true" />
                            Buy Me a Coffee
                        </a>
                    ) : null}
                </div>
                <h2 id="home-project-title">
                    {t("home.project.title")}
                    <br />
                    <span>{t("home.project.titleAccent")}</span>
                </h2>
                <p className="home-hero__description">{t("home.project.description")}</p>
                <div className="home-hero__actions">
                    <Button onClick={() => scrollToSection("home-product-preview")}>
                        {t("home.project.explore")} <ArrowDown size={15} aria-hidden="true" />
                    </Button>
                    <Button onClick={() => scrollToSection("home-capabilities")}>
                        {t("home.project.included")} <ArrowDown size={15} aria-hidden="true" />
                    </Button>
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
                    <span className="home-preview__counter">
                        {String(previews.indexOf(preview) + 1).padStart(2, "0")} /{" "}
                        {String(previews.length).padStart(2, "0")}
                    </span>
                </div>
                <figure className="home-preview__figure">
                    <div className="home-preview__chrome" aria-hidden="true">
                        <span className="home-preview__dots">
                            <i />
                            <i />
                            <i />
                        </span>
                        <span>
                            {t("nav.brand")} / {t(`home.project.${preview}`)}
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
                        <span>{t("home.project.previewNote")}</span>
                        <Button appearance="text" onClick={() => setViewerOpen(true)}>
                            <Maximize2 size={14} aria-hidden="true" /> {t("home.project.enlarge")}
                        </Button>
                    </figcaption>
                </figure>
                <div
                    className="home-preview__thumbnails"
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
                            <img
                                src={`${import.meta.env.BASE_URL}home-previews/${item}-${language}.webp`}
                                alt=""
                                width="1360"
                                height="900"
                                loading="lazy"
                                decoding="async"
                            />
                            <span>{t(`home.project.${item}`)}</span>
                        </Button>
                    ))}
                </div>
                <div className="home-preview__details">
                    <div>
                        <h4>{t(`home.project.${preview}Caption`)}</h4>
                        <p>{t(`home.project.${preview}Detail`)}</p>
                    </div>
                    {destination ? (
                        <Button appearance="text" onClick={() => navigate(destination)}>
                            {t("home.project.openScreen")}{" "}
                            <ArrowRight size={14} aria-hidden="true" />
                        </Button>
                    ) : null}
                </div>
                <Modal
                    open={viewerOpen}
                    onClose={() => setViewerOpen(false)}
                    title={`${t("nav.brand")} · ${t(`home.project.${preview}`)}`}
                    description={t("home.project.previewNote")}
                    keyboardDismissible
                    className="home-preview-viewer"
                >
                    <img
                        src={`${import.meta.env.BASE_URL}home-previews/${preview}-${language}.webp`}
                        width="1360"
                        height="900"
                        alt={t(`home.project.${preview}Alt`)}
                        decoding="async"
                    />
                </Modal>
            </section>
            <section
                id="home-capabilities"
                className="home-capabilities"
                aria-labelledby="home-capabilities-title"
            >
                <div className="home-section-heading">
                    <div>
                        <h3 id="home-capabilities-title">{t("home.project.capabilitiesTitle")}</h3>
                        <p className="home-capabilities__note">
                            {t("home.project.capabilitiesNote")}
                        </p>
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
                <span>{t("nav.brand")}</span>
                <p>{t("home.project.footer")}</p>
            </div>
        </div>
    );
}
