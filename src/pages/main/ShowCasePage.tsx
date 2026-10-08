import { AccountDeletionPreview } from "../../components/features/showcase/AccountDeletionPreview";
import { ToastPreview } from "../../components/features/showcase/ToastPreview";
import { ApiKeyPreview } from "../../components/features/showcase/ApiKeyPreview";
import { ConnectedOAuthProvidersCard } from "../../components/features/auth/ConnectedOAuthProvidersCard";
import { RecentAccountList } from "../../components/features/auth/RecentAccountList";
import type { RecentAccount } from "../../utils/recentAccounts";
import { MainPageTemplate } from "../../components/layout/MainPageTemplate";
import { AuthPageFrame } from "../../components/layout/AuthPageFrame";
import { useTranslation } from "react-i18next";
import {
    Pencil,
    X,
    Check,
    ChevronRight,
    KeyRound,
    SlidersHorizontal,
    Trash2,
    UserRound,
} from "lucide-react";
import { useToast } from "../../hooks/useToast";
import { lazy, Suspense, useRef, useState } from "react";
import {
    ShowcaseItem,
    ShowcaseQuery,
    getShowcaseNames,
} from "../../components/features/showcase/ShowcaseItem";
import { useNavigate } from "react-router-dom";

import { ErrorCard, InfoCard, WarningCard } from "../../components/ui/status/StatusCard";
import { OAuthProviderButton } from "../../components/features/auth/OAuthProviderButton";
import { useCollectionQuery } from "../../hooks/collections/useCollectionQuery";
import { useClientPagination } from "../../hooks/collections/useClientPagination";
import { useTheme } from "../../hooks/useTheme";
import {
    ColorPicker,
    NumberField,
    AvatarUploadField,
    CopyField,
    UserAvatar,
    PrimaryCard,
    SelectionCard,
    SegmentedControl,
    BrandMark,
    BrandBanner,
    StatusCard,
    Button,
    DropdownMenu,
    FormCheckbox,
    InlineMessage,
    InputField,
    TextareaField,
    EditableAvatar,
    KeyValueCard,
    MenuList,
    Modal,
    ModalButton,
    Pagination,
    PanelCard,
    Spinner,
    StatusBadge,
    ThemePreviewSelector,
    KeyboardShortcut,
    CodeBadge,
    ThemeToggleButton,
    Tooltip,
    ToggleSwitch,
    ValidationCard,
} from "../../components/ui";

const StyleStudio = __STYLE_STUDIO__ ? lazy(() => import("../development/StyleStudio")) : null;

export function ShowCasePage() {
    const showToast = useToast();
    const previewRoot = useRef<HTMLDivElement>(null);
    const [sampleSelection, setSampleSelection] = useState("first");
    const [sampleNumber, setSampleNumber] = useState("1");
    const [sampleColor, setSampleColor] = useState("#3b82f6");
    const { t } = useTranslation();
    const {
        input: query,
        setInput: setQuery,
        search,
        filters,
        setFilters,
        reset,
    } = useCollectionQuery({ initialFilters: { category: "all" }, searchMode: "immediate" });
    const { category } = filters;
    const user = { id: 1, name: "Designer", email: "designer@example.com" };
    const [avatar, setAvatar] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [sampleDropdown, setSampleDropdown] = useState("item-1");
    const navigate = useNavigate();
    const { themeMode, resolvedTheme, setThemeMode } = useTheme();
    const [sampleInput, setSampleInput] = useState("");
    const [sampleChecked, setSampleChecked] = useState(true);
    const [sampleUnchecked, setSampleUnchecked] = useState(false);
    const [sampleMenu, setSampleMenu] = useState("profile");
    const [sampleToggle, setSampleToggle] = useState(true);
    const [sampleCurrency, setSampleCurrency] = useState("krw");
    const [sampleAccounts, setSampleAccounts] = useState<RecentAccount[]>([
        {
            email: "designer@example.com",
            name: "Designer",
            provider: "email",
            lastUsed: Date.now(),
        },
        {
            email: "developer@example.com",
            name: "Developer",
            provider: "github",
            lastUsed: Date.now(),
        },
    ]);
    const [authPreviewOpen, setAuthPreviewOpen] = useState(false);
    const [previewEmail, setPreviewEmail] = useState("");
    const [sampleModalOpen, setSampleModalOpen] = useState(false);
    const sampleCards = Array.from({ length: 13 }, (_, index) => ({
        id: index + 1,
        title: t("showCase.demo.card", { count: index + 1 }),
        meta: t("showCase.demo.item", { count: index + 1 }),
    }));
    const sampleCardPageSize = 6;
    const {
        page: sampleCardPage,
        setPage: setSampleCardPage,
        totalPages: sampleCardTotalPages,
        visibleItems: visibleSampleCards,
    } = useClientPagination(sampleCards, sampleCardPageSize);
    const sampleCardPlaceholderCount = Math.max(0, sampleCardPageSize - visibleSampleCards.length);
    const sampleMenuItems = [
        { key: "profile", label: t("settings.menu.profile"), icon: UserRound },
        { key: "general", label: t("settings.menu.general"), icon: SlidersHorizontal },
        { key: "apiKey", label: t("settings.menu.developers"), icon: KeyRound },
    ];

    const sections = [
        {
            id: "account",
            content: (
                <div className="showcase-catalog__row">
                    <ShowcaseItem component="UserAvatar">
                        <div className="showcase-avatar-row">
                            <UserAvatar label="Designer" imageUrl={avatar} />
                            <UserAvatar label="B4A" imageUrl="/icons/b4a-mark.svg" />
                            <UserAvatar label="Designer" />
                        </div>
                    </ShowcaseItem>
                    <ShowcaseItem component="AvatarUploadField">
                        <AvatarUploadField
                            selectButtonText={t("settings.profile.photoSelect")}
                            clearButtonText={t("settings.profile.photoClear")}
                            canClear={Boolean(avatar)}
                            onClear={() => setAvatar(null)}
                            onSelectFile={(file) => {
                                if (
                                    !file ||
                                    ![
                                        "image/png",
                                        "image/jpeg",
                                        "image/webp",
                                        "image/gif",
                                    ].includes(file.type) ||
                                    file.size > 8 * 1024 * 1024
                                )
                                    return;
                                const reader = new FileReader();
                                reader.onload = () => setAvatar(String(reader.result));
                                reader.readAsDataURL(file);
                            }}
                            helperText={t("showCase.catalog.localOnly")}
                        />
                    </ShowcaseItem>
                    <ShowcaseItem component="ConnectedOAuthProvidersCard">
                        <ConnectedOAuthProvidersCard
                            title={t("settings.profile.oauthConnectedTitle")}
                            providers={["google", "github"]}
                            emptyText={t("showCase.catalog.empty")}
                            getProviderLabel={(provider) =>
                                provider === "google" ? "Google" : "GitHub"
                            }
                        />
                    </ShowcaseItem>
                </div>
            ),
        },
        {
            id: "api",
            content: (
                <div className="showcase-catalog__stack">
                    <ShowcaseItem component="CopyField">
                        <CopyField
                            value="demo_only_not_a_real_api_key"
                            inputAriaLabel={t("showCase.catalog.sampleKey")}
                            copyLabel={t("showCase.catalog.copy")}
                            copiedLabel={t("showCase.catalog.copied")}
                            copied={copied}
                            onCopy={() => {
                                void navigator.clipboard
                                    .writeText("demo_only_not_a_real_api_key")
                                    .then(() => setCopied(true))
                                    .catch(() => setCopied(false));
                            }}
                        />
                    </ShowcaseItem>
                    <ShowcaseItem component="DeveloperApiKeysSection">
                        <ApiKeyPreview />
                    </ShowcaseItem>
                </div>
            ),
        },
        {
            id: "brand",
            content: (
                <>
                    <div className="showcase-catalog__row">
                        <ShowcaseItem component="CodeBadge">
                            <div className="showcase-code-badges">
                                <CodeBadge>APP_MODE</CodeBadge>
                                <CodeBadge>development</CodeBadge>
                                <CodeBadge>true</CodeBadge>
                                <CodeBadge>localhost:5432</CodeBadge>
                            </div>
                        </ShowcaseItem>
                        <ShowcaseItem component="KeyboardShortcut">
                            <div className="showcase-shortcut-examples">
                                <span>
                                    {t("shortcuts.platform.current")}
                                    <KeyboardShortcut keys={["mod", "shift", "s"]} />
                                </span>
                                <span>
                                    macOS
                                    <KeyboardShortcut
                                        keys={["mod", "shift", "s"]}
                                        platform="macos"
                                    />
                                </span>
                                <span>
                                    Windows / Linux
                                    <KeyboardShortcut
                                        keys={["mod", "shift", "s"]}
                                        platform="windows"
                                    />
                                </span>
                            </div>
                        </ShowcaseItem>
                        <ShowcaseItem component="BrandBanner">
                            <BrandBanner />
                        </ShowcaseItem>
                        <ShowcaseItem component="BrandMark" className="brand-showcase">
                            <BrandMark />

                            {(["light", "dark"] as const).map((tone) => (
                                <div className={`brand-preview brand-preview--${tone}`} key={tone}>
                                    <BrandMark variant="plain" tone={tone} />
                                    <BrandMark variant="tile" tone={tone} />
                                    <BrandBanner tone={tone} />
                                </div>
                            ))}
                        </ShowcaseItem>
                        <ShowcaseItem component="ThemeToggleButton">
                            <ThemeToggleButton themeMode={themeMode} onChangeTheme={setThemeMode} />
                        </ShowcaseItem>
                        <ShowcaseItem component="ThemePreviewSelector">
                            <ThemePreviewSelector
                                themeMode={themeMode}
                                onChangeTheme={setThemeMode}
                            />
                        </ShowcaseItem>
                    </div>
                </>
            ),
        },
        {
            id: "buttons",
            content: (
                <>
                    <div className="showcase-catalog__row">
                        <ShowcaseItem component="Button">
                            <div className="showcase-catalog__stack">
                                <Button>{t("showCase.demo.text0")}</Button>
                                <DropdownMenu
                                    label="DropdownMenu"
                                    triggerLabel={t("showCase.demo.text0")}
                                    items={[{ id: "example", label: t("showCase.demo.text0") }]}
                                    onSelect={() => {}}
                                />
                            </div>
                        </ShowcaseItem>
                        <ShowcaseItem component="Button (pill variants)">
                            <div className="showcase-catalog__stack">
                                <Button appearance="pill">{t("authDialog.buttonPrimary")}</Button>
                                <Button appearance="pill-secondary">
                                    {t("authDialog.buttonSecondary")}
                                </Button>
                                <Button appearance="pill" loading>
                                    {t("authDialog.buttonLoading")}
                                </Button>
                                <Button appearance="pill-secondary" disabled>
                                    {t("authDialog.buttonDisabled")}
                                </Button>
                            </div>
                        </ShowcaseItem>
                        <ShowcaseItem component="SegmentedControl">
                            <div className="showcase-catalog__stack">
                                {[false, true].map((disabled) => (
                                    <SegmentedControl
                                        key={String(disabled)}
                                        label={t("billing.plans.currency")}
                                        options={[
                                            {
                                                value: "usd",
                                                label: "$",
                                                accessibleLabel: t("billing.plans.usd"),
                                            },
                                            {
                                                value: "krw",
                                                label: "₩",
                                                accessibleLabel: t("billing.plans.krw"),
                                            },
                                        ]}
                                        value={sampleCurrency}
                                        onChange={setSampleCurrency}
                                        disabled={disabled}
                                    />
                                ))}
                            </div>
                        </ShowcaseItem>
                        <ShowcaseItem component="Button (text section actions)">
                            <div className="showcase-catalog__stack">
                                <header className="section-action-header">
                                    <h2>{t("billing.history")}</h2>
                                    <Button
                                        appearance="text"
                                        onClick={() => showToast(t("showCase.catalog.localOnly"))}
                                    >
                                        {t("billing.details.viewAll")}
                                        <ChevronRight aria-hidden="true" />
                                    </Button>
                                </header>
                                <Button appearance="text" loading>
                                    {t("authDialog.buttonLoading")}
                                </Button>
                                <Button appearance="text" disabled>
                                    {t("authDialog.buttonDisabled")}
                                </Button>
                            </div>
                        </ShowcaseItem>
                        <ShowcaseItem component="Button (loading)">
                            <Button loading>{t("showCase.demo.text1")}</Button>
                        </ShowcaseItem>
                        <ShowcaseItem component="Button (disabled)">
                            <Button disabled>{t("showCase.demo.text2")}</Button>
                        </ShowcaseItem>
                        <ShowcaseItem component="OAuthProviderButton (google/github)">
                            <div className="showcase-catalog__oauth-row">
                                <OAuthProviderButton
                                    provider="google"
                                    label={t("showCase.demo.text3")}
                                    startPath="/show-case"
                                    onPreview={() => setAuthPreviewOpen(true)}
                                />
                                <OAuthProviderButton
                                    provider="github"
                                    label={t("showCase.demo.text4")}
                                    startPath="/show-case"
                                    onPreview={() => setAuthPreviewOpen(true)}
                                />
                            </div>
                        </ShowcaseItem>
                    </div>
                </>
            ),
        },
        {
            id: "overlays",
            content: (
                <>
                    <div className="showcase-catalog__row">
                        <ShowcaseItem component="DropdownMenu">
                            <DropdownMenu
                                triggerLabel={t(`showCase.demo.${sampleDropdown}`)}
                                onSelect={setSampleDropdown}
                                label={t("showCase.demo.text5")}
                                items={[
                                    { id: "item-1", label: t("showCase.demo.text6") },
                                    { id: "item-2", label: t("showCase.demo.text7") },
                                    { id: "item-3", label: t("showCase.demo.text8") },
                                ]}
                            />
                        </ShowcaseItem>
                        <ShowcaseItem component="DropdownMenu actions">
                            <DropdownMenu
                                compact
                                triggerLabel="···"
                                label={t("billing.details.manageMethod")}
                                items={[
                                    {
                                        id: "default",
                                        label: t("billing.native.setDefault"),
                                        icon: <Check />,
                                    },
                                    {
                                        id: "remove",
                                        label: t("billing.native.remove"),
                                        icon: <Trash2 />,
                                        tone: "danger",
                                    },
                                ]}
                                onSelect={(id) =>
                                    showToast(
                                        t(
                                            id === "remove"
                                                ? "billing.native.removed"
                                                : "billing.native.defaultSaved",
                                        ),
                                    )
                                }
                            />
                        </ShowcaseItem>
                        <ShowcaseItem component="Tooltip">
                            <Tooltip content={t("showCase.tooltip.demoContent")} side="top">
                                <Button type="button">{t("showCase.tooltip.demoTrigger")}</Button>
                            </Tooltip>
                        </ShowcaseItem>
                    </div>
                </>
            ),
        },
        {
            id: "navigation",
            content: (
                <>
                    <div className="showcase-catalog__row">
                        <ShowcaseItem component="MenuList" className="showcase-catalog__menu-demo">
                            <MenuList
                                items={sampleMenuItems}
                                activeKey={sampleMenu}
                                onSelect={setSampleMenu}
                                ariaLabel={t("showCase.demo.text9")}
                            />
                        </ShowcaseItem>
                    </div>
                </>
            ),
        },
        {
            id: "inputs",
            content: (
                <>
                    <div className="showcase-catalog__stack">
                        <ShowcaseItem component="NumberField">
                            <NumberField
                                label={t("numberField.example")}
                                value={sampleNumber}
                                onValueChange={setSampleNumber}
                                min={0}
                                max={4}
                                step={0.125}
                                unit="rem"
                            />
                        </ShowcaseItem>
                        <ShowcaseItem component="ColorPicker">
                            <ColorPicker
                                label={t("colorPicker.example")}
                                value={sampleColor}
                                onValueChange={setSampleColor}
                            />
                        </ShowcaseItem>

                        <ShowcaseItem component="EditableAvatar">
                            <EditableAvatar
                                name="B4A"
                                label={t("settings.profile.photoSelect")}
                                onSelect={() => undefined}
                            />
                        </ShowcaseItem>
                        <ShowcaseItem component="Button">
                            <Button iconOnly aria-label={t("settings.profile.save")}>
                                <Check aria-hidden="true" />
                            </Button>
                        </ShowcaseItem>
                        <ShowcaseItem component="Button (transparent icons)">
                            <Button
                                iconOnly
                                appearance="text"
                                aria-label={t("settings.profile.editName")}
                            >
                                <Pencil aria-hidden="true" />
                            </Button>
                            <Button
                                iconOnly
                                appearance="text"
                                aria-label={t("settings.profile.save")}
                            >
                                <Check aria-hidden="true" />
                            </Button>
                            <Button
                                iconOnly
                                appearance="text"
                                aria-label={t("settings.account.cancel")}
                            >
                                <X aria-hidden="true" />
                            </Button>
                        </ShowcaseItem>
                        <ShowcaseItem component="TextareaField">
                            <TextareaField
                                autoGrow
                                label={t("settings.profile.bio")}
                                value={sampleInput}
                                onValueChange={setSampleInput}
                                rows={3}
                            />
                        </ShowcaseItem>
                        <ShowcaseItem component="InputField">
                            <InputField
                                label={t("showCase.demo.text10")}
                                value={sampleInput}
                                onValueChange={setSampleInput}
                                placeholder={t("showCase.demo.text11")}
                            />
                        </ShowcaseItem>
                        <div className="showcase-catalog__row">
                            <ShowcaseItem component="FormCheckbox (checked)">
                                <FormCheckbox
                                    checked={sampleChecked}
                                    onCheckedChange={setSampleChecked}
                                    label={t("showCase.demo.text12")}
                                />
                            </ShowcaseItem>
                            <ShowcaseItem component="FormCheckbox (unchecked)">
                                <FormCheckbox
                                    checked={sampleUnchecked}
                                    onCheckedChange={setSampleUnchecked}
                                    label={t("showCase.demo.text13")}
                                />
                            </ShowcaseItem>
                        </div>
                        <ShowcaseItem component="ToggleSwitch">
                            <ToggleSwitch
                                checked={sampleToggle}
                                onCheckedChange={setSampleToggle}
                                label={t("showCase.demo.text14")}
                            />
                        </ShowcaseItem>
                    </div>
                </>
            ),
        },
        {
            id: "data",
            content: (
                <>
                    <div className="showcase-catalog__stack">
                        <ShowcaseItem component="StatusBadge">
                            <div className="showcase-catalog__badge-row">
                                <StatusBadge tone="active">{t("showCase.demo.text15")}</StatusBadge>
                                <StatusBadge tone="inactive">
                                    {t("showCase.demo.text16")}
                                </StatusBadge>
                                <StatusBadge tone="danger">{t("showCase.demo.text39")}</StatusBadge>
                                <StatusBadge tone="info">{t("showCase.demo.text17")}</StatusBadge>
                            </div>
                        </ShowcaseItem>
                        <ShowcaseItem component="ToastCard">
                            <ToastPreview />
                        </ShowcaseItem>
                        <ShowcaseItem component="InlineMessage">
                            <div className="showcase-catalog__stack">
                                <InlineMessage tone="info">
                                    {t("showCase.demo.text18")}
                                </InlineMessage>
                                <InlineMessage>{t("showCase.demo.text19")}</InlineMessage>
                            </div>
                        </ShowcaseItem>
                        <ShowcaseItem
                            component="Card list + Pagination"
                            className="showcase-catalog__paginated-card-demo"
                        >
                            <div className="showcase-paginated-cards">
                                <div className="showcase-paginated-cards__grid">
                                    {visibleSampleCards.map((item) => (
                                        <article key={item.id} className="showcase-paginated-card">
                                            <h4>{item.title}</h4>
                                            <p>{item.meta}</p>
                                        </article>
                                    ))}
                                    {Array.from(
                                        { length: sampleCardPlaceholderCount },
                                        (_, index) => (
                                            <article
                                                key={`placeholder-${index}`}
                                                className="showcase-paginated-card showcase-paginated-card--placeholder"
                                                aria-hidden="true"
                                            />
                                        ),
                                    )}
                                </div>
                                <Pagination
                                    currentPage={sampleCardPage}
                                    totalPages={sampleCardTotalPages}
                                    ariaLabel={t("showCase.demo.text20")}
                                    previousLabel={t("showCase.demo.text21")}
                                    nextLabel={t("showCase.demo.text22")}
                                    onPageChange={setSampleCardPage}
                                />
                            </div>
                        </ShowcaseItem>
                    </div>
                </>
            ),
        },
        {
            id: "dialogs",
            content: (
                <>
                    <div className="showcase-catalog__row">
                        <ShowcaseItem component="AccountDeletionDialog + InputField">
                            <AccountDeletionPreview />
                        </ShowcaseItem>
                        <ShowcaseItem component="AuthPageFrame + Modal">
                            <Button
                                appearance="pill-secondary"
                                onClick={() => setAuthPreviewOpen(true)}
                            >
                                {t("authDialog.preview")}
                            </Button>
                        </ShowcaseItem>
                        <ShowcaseItem component="Modal + ModalButton">
                            <ModalButton
                                variant="save"
                                onClick={() => {
                                    setSampleModalOpen(true);
                                }}
                            >
                                {t("showCase.demo.text23")}
                            </ModalButton>
                            <Modal
                                open={sampleModalOpen}
                                title={t("showCase.demo.text24")}
                                description={t("showCase.demo.text25")}
                                onClose={() => {
                                    setSampleModalOpen(false);
                                }}
                                footer={
                                    <>
                                        <ModalButton
                                            variant="cancel"
                                            onClick={() => {
                                                setSampleModalOpen(false);
                                            }}
                                        >
                                            {t("showCase.demo.text26")}
                                        </ModalButton>
                                        <ModalButton
                                            variant="save"
                                            onClick={() => {
                                                setSampleModalOpen(false);
                                            }}
                                        >
                                            {t("showCase.demo.text27")}
                                        </ModalButton>
                                    </>
                                }
                            >
                                <p className="muted">{t("showCase.demo.text28")}</p>
                            </Modal>
                        </ShowcaseItem>
                    </div>
                </>
            ),
        },
        {
            id: "loading",
            content: (
                <>
                    <div className="showcase-catalog__row">
                        <ShowcaseItem component="Spinner (sm)">
                            <Spinner size="sm" label={t("showCase.demo.text29")} hideLabel />
                        </ShowcaseItem>
                        <ShowcaseItem component="Spinner (md)">
                            <Spinner size="md" label={t("showCase.demo.text30")} />
                        </ShowcaseItem>
                        <ShowcaseItem component="Spinner (lg)">
                            <Spinner size="lg" label={t("showCase.demo.text31")} />
                        </ShowcaseItem>
                    </div>
                </>
            ),
        },
        {
            id: "pages",
            content: (
                <>
                    <div className="showcase-catalog__row">
                        <ShowcaseItem component="LoadingPage">
                            <Button type="button" onClick={() => navigate("/show-case/loading")}>
                                {t("showCase.demo.text32")}
                            </Button>
                        </ShowcaseItem>
                        <ShowcaseItem component="ShowCaseNotFoundPage">
                            <Button type="button" onClick={() => navigate("/show-case/404")}>
                                {t("showCase.demo.text33")}
                            </Button>
                        </ShowcaseItem>
                    </div>
                </>
            ),
        },
        {
            id: "cards",
            content: (
                <div className="showcase-catalog__cards">
                    <ShowcaseItem component="SelectionCard">
                        <div
                            className="selection-card-group"
                            role="group"
                            aria-label={t("showCase.selectionCard.label")}
                        >
                            {["first", "second"].map((option) => (
                                <SelectionCard
                                    key={option}
                                    selected={sampleSelection === option}
                                    onClick={() => setSampleSelection(option)}
                                >
                                    {t(`showCase.selectionCard.${option}`)}
                                </SelectionCard>
                            ))}
                            <SelectionCard selected={false} disabled>
                                {t("showCase.selectionCard.disabled")}
                            </SelectionCard>
                        </div>
                    </ShowcaseItem>
                    <ShowcaseItem
                        component="MainPageTemplate"
                        className="showcase-catalog__template-demo"
                    >
                        <MainPageTemplate
                            title={t("nav.home")}
                            description={t("home.templateDescription")}
                            actions={
                                <Button
                                    appearance="text"
                                    onClick={() => showToast(t("home.templateActionFeedback"))}
                                >
                                    {t("home.templateAction")}
                                </Button>
                            }
                            menuLabel={t("home.shortcuts")}
                            menuLayout="grid"
                            menuItems={[
                                {
                                    id: "account",
                                    title: t("home.account.title"),
                                    description: t("home.account.description"),
                                    icon: <UserRound />,
                                    to: "/settings?section=account",
                                },
                                {
                                    id: "preferences",
                                    title: t("home.preferences.title"),
                                    description: t("home.preferences.description"),
                                    icon: <SlidersHorizontal />,
                                    to: "/settings?section=general",
                                },
                            ]}
                        >
                            <div className="settings-row">
                                <h2>{t("home.templateContent")}</h2>
                                <span className="muted">{t("home.templateContentHint")}</span>
                            </div>
                        </MainPageTemplate>
                    </ShowcaseItem>
                    <ShowcaseItem component="PrimaryCard">
                        <PrimaryCard>
                            <p>{t("showCase.catalog.container")}</p>
                        </PrimaryCard>
                    </ShowcaseItem>
                    <ShowcaseItem component="PanelCard" className="showcase-catalog__panel-demo">
                        <PanelCard
                            title={t("showCase.demo.text34")}
                            subtitle={t("showCase.demo.text35")}
                        >
                            <p className="muted">{t("showCase.demo.text36")}</p>
                        </PanelCard>
                    </ShowcaseItem>
                    <ShowcaseItem component="KeyValueCard">
                        <dl className="meta">
                            <KeyValueCard
                                label={t("showCase.labels.userId")}
                                value={user?.id ?? "-"}
                            />
                            <KeyValueCard
                                label={t("showCase.labels.name")}
                                value={user?.name ?? "-"}
                            />
                            <KeyValueCard
                                label={t("showCase.labels.email")}
                                value={user?.email ?? "-"}
                            />
                        </dl>
                    </ShowcaseItem>
                    <ShowcaseItem component="RecentAccountList">
                        <RecentAccountList
                            accounts={sampleAccounts}
                            onSelect={(account) => {
                                setPreviewEmail(account.email);
                                setAuthPreviewOpen(true);
                            }}
                            onRemove={(account) =>
                                setSampleAccounts((items) =>
                                    items.filter((item) => item !== account),
                                )
                            }
                            onClear={() => setSampleAccounts([])}
                        />
                    </ShowcaseItem>
                    <ShowcaseItem component="StatusCard">
                        <StatusCard tone="info" message={t("showCase.catalog.localOnly")} />
                    </ShowcaseItem>
                    <ShowcaseItem component="StatusCard (retry action)">
                        <StatusCard
                            tone="error"
                            message={t("billing.errors.unknown")}
                            action={
                                <Button
                                    appearance="text"
                                    onClick={() => showToast(t("showCase.catalog.localOnly"))}
                                >
                                    {t("billing.native.retry")}
                                </Button>
                            }
                        />
                    </ShowcaseItem>
                    <ShowcaseItem component="InfoCard">
                        <InfoCard
                            title={t("showCase.demo.text17")}
                            message={t("showCase.demo.text37")}
                        />
                    </ShowcaseItem>
                    <ShowcaseItem component="WarningCard">
                        <WarningCard
                            title={t("showCase.demo.text38")}
                            message={t("showCase.demo.text39")}
                        />
                    </ShowcaseItem>
                    <ShowcaseItem component="ErrorCard">
                        <ErrorCard
                            title={t("showCase.demo.text40")}
                            message={t("showCase.demo.text41")}
                        />
                    </ShowcaseItem>
                    <ShowcaseItem component="ValidationCard">
                        <ValidationCard
                            title={t("showCase.demo.text42")}
                            rules={[
                                { isValid: true, label: t("showCase.demo.text43") },
                                { isValid: true, label: t("showCase.demo.text44") },
                                { isValid: false, label: t("showCase.demo.text45") },
                            ]}
                        />
                    </ShowcaseItem>
                </div>
            ),
        },
    ];
    const categoryOrder = [
        "brand",
        "buttons",
        "inputs",
        "overlays",
        "navigation",
        "data",
        "cards",
        "account",
        "api",
        "dialogs",
        "loading",
        "pages",
    ];
    const catalogSections = sections
        .map((section) => ({ ...section, names: getShowcaseNames(section.content) }))
        .sort((a, b) => categoryOrder.indexOf(a.id) - categoryOrder.indexOf(b.id));
    const normalizedQuery = search.toLocaleLowerCase();
    const visibleSections = catalogSections.filter(
        (section) =>
            (category === "all" || category === section.id) &&
            (!normalizedQuery ||
                t(`showCase.catalog.categories.${section.id}`)
                    .toLocaleLowerCase()
                    .includes(normalizedQuery) ||
                section.names.some((name) => name.toLocaleLowerCase().includes(normalizedQuery))),
    );
    return (
        <section className="showcase-catalog showcase-preview" ref={previewRoot}>
            {StyleStudio && (
                <Suspense fallback={null}>
                    <StyleStudio
                        previewRoot={previewRoot}
                        themeMode={themeMode}
                        theme={resolvedTheme}
                        onChangeTheme={setThemeMode}
                    />
                </Suspense>
            )}
            <header className="showcase-catalog__header">
                <h1>{t("showCase.title")}</h1>
                <p>{t("showCase.subtitle")}</p>
            </header>
            <div className="showcase-browser">
                <InputField
                    label={t("showCase.catalog.search")}
                    type="search"
                    value={query}
                    onValueChange={setQuery}
                    placeholder={t("showCase.catalog.searchPlaceholder")}
                />
                <nav
                    className="showcase-categories"
                    aria-label={t("showCase.catalog.categoriesLabel")}
                >
                    {["all", ...catalogSections.map((section) => section.id)].map((id) => (
                        <SelectionCard
                            key={id}
                            className="showcase-category"
                            selected={category === id}
                            onClick={() => setFilters({ category: id })}
                        >
                            {t(`showCase.catalog.categories.${id}`)}
                        </SelectionCard>
                    ))}
                </nav>
                <p className="showcase-result-count" role="status">
                    {t("showCase.catalog.results", { count: visibleSections.length })}
                </p>
            </div>
            {visibleSections.length === 0 ? (
                <div className="showcase-empty">
                    <p>{t("showCase.catalog.empty")}</p>
                    <Button onClick={reset}>{t("showCase.catalog.reset")}</Button>
                </div>
            ) : null}
            <div className="showcase-preview__components">
                {visibleSections.map((section) => (
                    <section
                        key={section.id}
                        className="showcase-catalog__section-card"
                        id={`catalog-${section.id}`}
                        aria-labelledby={`catalog-title-${section.id}`}
                    >
                        <header className="showcase-section-heading">
                            <h2 id={`catalog-title-${section.id}`}>
                                {t(`showCase.catalog.categories.${section.id}`)}
                            </h2>
                            <p>{t(`showCase.catalog.descriptions.${section.id}`)}</p>
                        </header>
                        <ShowcaseQuery.Provider
                            value={
                                t(`showCase.catalog.categories.${section.id}`)
                                    .toLocaleLowerCase()
                                    .includes(normalizedQuery)
                                    ? ""
                                    : normalizedQuery
                            }
                        >
                            {section.content}
                        </ShowcaseQuery.Provider>
                    </section>
                ))}
            </div>
            {authPreviewOpen ? (
                <AuthPageFrame
                    embedded
                    title={t("authDialog.title")}
                    subtitle={t("authDialog.subtitle")}
                    onClose={() => setAuthPreviewOpen(false)}
                >
                    <div className="form">
                        <InputField
                            label={t("login.fields.email")}
                            type="email"
                            value={previewEmail}
                            onValueChange={setPreviewEmail}
                        />
                        <WarningCard
                            title={t("cards.warningTitle")}
                            message={t("auth.errors.invalidEmail")}
                        />
                        <Button appearance="pill" onClick={() => setAuthPreviewOpen(false)}>
                            {t("authDialog.continue")}
                        </Button>
                    </div>
                </AuthPageFrame>
            ) : null}
        </section>
    );
}
