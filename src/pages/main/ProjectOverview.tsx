import { publicPath } from "../../utils/basePath";
import {
    Pause,
    Play,
    UsersRound,
    ChartNoAxesCombined,
    PanelsTopLeft,
    Box,
    BookOpen,
    ArrowRight,
    Maximize2,
    ShieldCheck,
    UserRound,
    CreditCard,
    MessageSquare,
    Layers3,
    Bell,
    Radio,
    HardDrive,
    Database,
    Mail,
    Activity,
    Workflow,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import { useAppLayout } from "../../hooks/useAppLayout";
import { useAuthContext } from "../../hooks/useAuth";
import { useAppConfig } from "../../hooks/useFeatures";
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Button, Modal, Tooltip } from "../../components/ui";

const previews = ["components", "users", "server", "billing"] as const;
const capabilities = [
    { key: "identity", icon: ShieldCheck },
    { key: "profile", icon: UserRound },
    { key: "billing", icon: CreditCard },
    { key: "interface", icon: Layers3 },
    { key: "notifications", icon: Bell },
    { key: "support", icon: MessageSquare },
    { key: "realtime", icon: Radio },
    { key: "storage", icon: HardDrive },
    { key: "cache", icon: Database },
    { key: "email", icon: Mail },
    { key: "operations", icon: Activity },
    { key: "delivery", icon: Workflow },
] as const;
const useCases = [
    { key: "saas", icon: UsersRound },
    { key: "internal", icon: ChartNoAxesCombined },
    { key: "portal", icon: PanelsTopLeft },
    { key: "prototype", icon: Box },
] as const;
const sections = [
    { id: "home-product-preview", key: "preview" },
    { id: "home-capabilities", key: "features" },
    { id: "home-workflow", key: "workflow" },
    { id: "home-use-cases", key: "useCases" },
] as const;

export function ProjectOverview({ children }: { children?: ReactNode }) {
    const { t, i18n } = useTranslation();
    const [preview, setPreview] = useState<(typeof previews)[number]>("components");
    const [viewerOpen, setViewerOpen] = useState(false);
    const previewRef = useRef<HTMLElement>(null);
    const { mode } = useAppLayout();
    const [headerTarget, setHeaderTarget] = useState<HTMLElement | null>(null);
    useLayoutEffect(() => {
        setHeaderTarget(
            mode === "sidebar" ? null : document.querySelector<HTMLElement>(".app-header"),
        );
    }, [mode]);
    const elapsed = useRef(0);
    const previousPreview = useRef(preview);
    const [rotationEnabled, setRotationEnabled] = useState(true);

    const [inView, setInView] = useState(false);
    const [pageVisible, setPageVisible] = useState(() => !document.hidden);
    const [reducedMotion, setReducedMotion] = useState(
        () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    );
    useEffect(() => {
        const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
        const updateMotion = () => setReducedMotion(motion.matches);
        const updateVisibility = () => setPageVisible(!document.hidden);
        const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting));
        if (previewRef.current) observer.observe(previewRef.current);
        motion.addEventListener("change", updateMotion);
        document.addEventListener("visibilitychange", updateVisibility);
        return () => {
            observer.disconnect();
            motion.removeEventListener("change", updateMotion);
            document.removeEventListener("visibilitychange", updateVisibility);
        };
    }, []);
    const rotating = rotationEnabled && !reducedMotion && !viewerOpen && inView && pageVisible;
    useEffect(() => {
        if (previousPreview.current !== preview) {
            elapsed.current = 0;
            previousPreview.current = preview;
        }
        if (!rotating) return;
        const startedAt = performance.now();
        const timer = window.setTimeout(
            () => setPreview(previews[(previews.indexOf(preview) + 1) % previews.length]),
            Math.max(0, 6000 - elapsed.current),
        );
        return () => {
            window.clearTimeout(timer);
            elapsed.current = Math.min(6000, elapsed.current + performance.now() - startedAt);
        };
    }, [preview, rotating]);
    const navigate = useNavigate();
    const { data: config } = useAppConfig();
    const { user } = useAuthContext();
    const destinations: Record<(typeof previews)[number], string | null> = {
        components: config?.app_mode === "development" ? "/show-case" : null,
        users:
            user?.role === "admin" || user?.role === "manager"
                ? "/admin"
                : config?.demo_enabled
                  ? "/demo/admin"
                  : null,
        server:
            user?.role === "admin"
                ? "/admin/server"
                : config?.demo_enabled
                  ? "/demo/admin/server"
                  : null,
        billing: config?.billing_enabled ? (user ? "/settings?section=billing" : "/plans") : null,
    };
    const destination = destinations[preview];
    const language = i18n.resolvedLanguage?.startsWith("ko") ? "ko" : "en";
    const sectionNavigation = (
        <nav className="home-section-nav" aria-label={t("home.project.sectionNav")}>
            {sections.map(({ id, key }) => (
                <a key={id} href={`${publicPath("/home")}#${id}`}>
                    {t(`home.project.sections.${key}`)}
                </a>
            ))}
        </nav>
    );
    return (
        <div className="home-overview">
            {headerTarget ? createPortal(sectionNavigation, headerTarget) : sectionNavigation}
            <div className="home-intro">
                <section className="home-hero" aria-labelledby="home-project-title">
                    <div className="home-hero__topline">
                        <p className="home-eyebrow">{t("nav.brand")}</p>
                    </div>
                    <h1 id="home-project-title">
                        {t("home.project.title")}
                        <br />
                        <span>{t("home.project.titleAccent")}</span>
                    </h1>
                    <p className="home-hero__description">{t("home.project.description")}</p>
                    <div className="home-hero__actions">
                        <a
                            className="home-resource-pill"
                            href="https://github.com/Blueprint4Agent/B4FastAPI"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <span className="home-github-mark" aria-hidden="true" /> GitHub{" "}
                            <ArrowRight size={15} aria-hidden="true" />
                        </a>
                        <a
                            className="home-resource-pill home-resource-pill--secondary"
                            href="https://blueprint4agent.github.io/docs"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <BookOpen size={17} aria-hidden="true" /> {t("home.project.docs")}{" "}
                            <ArrowRight size={15} aria-hidden="true" />
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
                    ref={previewRef}
                    id="home-product-preview"
                    tabIndex={-1}
                    className="home-preview"
                    aria-labelledby="home-preview-title"
                >
                    <div className="home-section-heading">
                        <div>
                            <h2 id="home-preview-title">{t("home.project.previewTitle")}</h2>
                        </div>
                        <span className="home-preview__counter">
                            {String(previews.indexOf(preview) + 1).padStart(2, "0")} /{" "}
                            {String(previews.length).padStart(2, "0")}
                        </span>
                    </div>
                    <figure className="home-preview__figure">
                        <div className="home-preview__images">
                            {previews.map((item) => (
                                <img
                                    key={`${item}-${language}`}
                                    src={publicPath(`home-previews/${item}-${language}.webp`)}
                                    width="1360"
                                    height="900"
                                    alt={preview === item ? t(`home.project.${item}Alt`) : ""}
                                    aria-hidden={preview !== item}
                                    data-active={preview === item}
                                    decoding="async"
                                />
                            ))}
                        </div>
                        <figcaption>
                            <span>{t("home.project.previewNote")}</span>
                            <Button appearance="text" onClick={() => setViewerOpen(true)}>
                                <Maximize2 size={14} aria-hidden="true" />{" "}
                                {t("home.project.enlarge")}
                            </Button>
                        </figcaption>
                    </figure>
                    <div className="home-preview__controls" data-rotating={rotating}>
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
                                    <span>{t(`home.project.${item}`)}</span>
                                    {preview === item && !reducedMotion ? (
                                        <span
                                            key={preview}
                                            className="home-preview__progress"
                                            aria-hidden="true"
                                        />
                                    ) : null}
                                </Button>
                            ))}
                        </div>
                        {!reducedMotion ? (
                            <Tooltip
                                content={t(
                                    rotationEnabled
                                        ? "home.project.pausePreview"
                                        : "home.project.playPreview",
                                )}
                            >
                                <Button
                                    appearance="text"
                                    iconOnly
                                    aria-label={t(
                                        rotationEnabled
                                            ? "home.project.pausePreview"
                                            : "home.project.playPreview",
                                    )}
                                    onClick={() => setRotationEnabled((enabled) => !enabled)}
                                >
                                    {rotationEnabled ? (
                                        <Pause size={15} aria-hidden="true" />
                                    ) : (
                                        <Play size={15} aria-hidden="true" />
                                    )}
                                </Button>
                            </Tooltip>
                        ) : null}
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
                            src={publicPath(`home-previews/${preview}-${language}.webp`)}
                            width="1360"
                            height="900"
                            alt={t(`home.project.${preview}Alt`)}
                            decoding="async"
                        />
                    </Modal>
                </section>
            </div>
            <section
                id="home-capabilities"
                tabIndex={-1}
                className="home-capabilities"
                aria-labelledby="home-capabilities-title"
            >
                <div className="home-section-heading">
                    <div>
                        <p className="home-eyebrow">{t("home.project.sections.features")}</p>
                        <h2 id="home-capabilities-title">{t("home.project.capabilitiesTitle")}</h2>
                        <p className="home-capabilities__note">
                            {t("home.project.capabilitiesNote")}
                        </p>
                    </div>
                </div>
                <div className="home-feature-grid">
                    {capabilities.map(({ key, icon: Icon }) => (
                        <article key={key} className="home-capability">
                            <Icon size={24} aria-hidden="true" />
                            <h3>{t(`home.project.${key}Title`)}</h3>
                            <p>{t(`home.project.${key}Description`)}</p>
                        </article>
                    ))}
                </div>
            </section>
            <section
                id="home-workflow"
                tabIndex={-1}
                className="home-workflow"
                aria-labelledby="home-workflow-title"
            >
                <div className="home-section-heading">
                    <div>
                        <p className="home-eyebrow">{t("home.project.sections.workflow")}</p>
                        <h2 id="home-workflow-title">{t("home.project.workflowTitle")}</h2>
                        <p className="home-capabilities__note">
                            {t("home.project.workflowDescription")}
                        </p>
                    </div>
                </div>
                <ol className="home-workflow__steps">
                    {["prepare", "build", "ship"].map((key, index) => (
                        <li key={key}>
                            <span className="home-workflow__number" aria-hidden="true">
                                {String(index + 1).padStart(2, "0")}
                            </span>
                            <h3>{t(`home.project.workflow.${key}.title`)}</h3>
                            <p>{t(`home.project.workflow.${key}.description`)}</p>
                        </li>
                    ))}
                </ol>
            </section>
            <section
                id="home-use-cases"
                tabIndex={-1}
                className="home-use-cases"
                aria-labelledby="home-use-cases-title"
            >
                <div className="home-section-heading">
                    <div>
                        <p className="home-eyebrow">{t("home.project.sections.useCases")}</p>
                        <h2 id="home-use-cases-title">{t("home.project.useCasesTitle")}</h2>
                        <p className="home-capabilities__note">
                            {t("home.project.useCasesDescription")}
                        </p>
                    </div>
                </div>
                <div className="home-use-cases__grid">
                    {useCases.map(({ key, icon: Icon }) => (
                        <article key={key}>
                            <span className="home-use-case-icon">
                                <Icon size={23} aria-hidden="true" />
                            </span>
                            <div>
                                <h3>{t(`home.project.useCases.${key}.title`)}</h3>
                                <p>{t(`home.project.useCases.${key}.description`)}</p>
                            </div>
                        </article>
                    ))}
                </div>
            </section>
            <footer className="home-footer">
                <div className="home-footer__grid">
                    <div className="home-footer__brand">
                        <strong>{t("nav.brand")}</strong>
                        <p>{t("home.project.footerDescription")}</p>
                    </div>
                    <nav aria-label={t("home.project.footerProduct")}>
                        <h2>{t("home.project.footerProduct")}</h2>
                        {sections.map(({ id, key }) => (
                            <a key={id} href={`${publicPath("/home")}#${id}`}>
                                {t(`home.project.sections.${key}`)}
                            </a>
                        ))}
                    </nav>
                    <nav aria-label={t("home.project.footerResources")}>
                        <h2>{t("home.project.footerResources")}</h2>
                        <a
                            href="https://github.com/Blueprint4Agent/B4FastAPI"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            GitHub
                        </a>
                        <a
                            href="https://blueprint4agent.github.io/docs"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            {t("home.project.docs")}
                        </a>
                        {import.meta.env.VITE_PUBLIC_DISCOVERY === "true" ||
                        (import.meta.env.DEV && !__PROJECT_BRAND__) ? (
                            <a href={publicPath(language === "ko" ? "/about/ko/" : "/about/")}>
                                {t("discovery.about")}
                            </a>
                        ) : null}
                    </nav>
                    {children}
                </div>
                <div className="home-footer__bottom">
                    <span>
                        © {new Date().getFullYear()} {t("nav.brand")}
                    </span>
                    <span>{t("home.project.footer")}</span>
                </div>
            </footer>
        </div>
    );
}
