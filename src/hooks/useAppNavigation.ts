import {
    FilePenLine,
    ArrowLeft,
    Blocks,
    Home,
    CreditCard,
    Users,
    Server,
    MessageSquare,
    Code2,
    SlidersHorizontal,
    Sun,
    UserRound,
    Keyboard,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useLocation, useSearchParams } from "react-router-dom";
import { useAuthContext } from "./useAuth";
import { useAppConfig } from "./useFeatures";
import { profileSidebarPath } from "../utils/profileNavigation";
import { resolveSettingsSection } from "../utils/settingsSections";

export function useAppNavigation() {
    const { t } = useTranslation();
    const location = useLocation();
    const { user } = useAuthContext();
    const { data: appConfig } = useAppConfig();
    const development = appConfig?.app_mode === "development";
    const sidebarPath = profileSidebarPath(location);
    const isSettings = sidebarPath === "/settings";
    const [searchParams] = useSearchParams();
    const section = searchParams.has("billing_setup") ? "billing" : searchParams.get("section");
    const activeSection = resolveSettingsSection(section, Boolean(user));
    const homePath = "/home";
    const isDemoPanel = appConfig?.demo_enabled === true && sidebarPath.startsWith("/demo/admin");
    const adminPath = isDemoPanel ? "/demo/admin" : "/admin";
    const isAdminPanel =
        isDemoPanel ||
        (sidebarPath.startsWith("/admin") && (user?.role === "admin" || user?.role === "manager"));
    const items = isAdminPanel
        ? [
              {
                  path: homePath,
                  label: t("settings.backToApp"),
                  icon: ArrowLeft,
                  section: "back",
              },
              ...(isDemoPanel || user?.role === "admin"
                  ? [
                        {
                            path: `${adminPath}/inquiries`,
                            label: t("support.adminTitle"),
                            icon: MessageSquare,
                            section: "inquiries",
                        },
                    ]
                  : []),
              { path: adminPath, label: t("admin.users"), icon: Users, section: "users" },
              ...(isDemoPanel || user?.role === "admin"
                  ? [
                        {
                            path: `${adminPath}/server`,
                            label: t("serverStatus.title"),
                            icon: Server,
                            section: "server",
                        },
                    ]
                  : []),
          ]
        : isSettings
          ? [
                {
                    path: homePath,
                    label: t("settings.backToApp"),
                    icon: ArrowLeft,
                    section: "back",
                },
                {
                    path: "/settings?section=general",
                    label: t("settings.menu.general"),
                    icon: SlidersHorizontal,
                    section: "general",
                },
                {
                    path: "/settings?section=appearance",
                    label: t("settings.menu.appearance"),
                    icon: Sun,
                    section: "appearance",
                },
                {
                    path: "/settings?section=account",
                    label: t("settings.menu.account"),
                    icon: UserRound,
                    section: "account",
                },
                {
                    path: "/settings?section=keyboard",
                    label: t("settings.menu.keyboard"),
                    icon: Keyboard,
                    section: "keyboard",
                },
                {
                    path: "/settings?section=billing",
                    label: t("billing.title"),
                    icon: CreditCard,
                    section: "billing",
                },
                {
                    path: "/settings?section=support",
                    label: t("support.title"),
                    icon: MessageSquare,
                    section: "support",
                },
                {
                    path: "/settings?section=developers",
                    label: t("settings.menu.developers"),
                    icon: Code2,
                    section: "developers",
                },
            ]
          : [
                {
                    path: homePath,
                    label: t("nav.home"),
                    icon: Home,
                    section: "",
                },
                {
                    path: "/prompt-builder",
                    label: t("promptBuilder.title"),
                    icon: FilePenLine,
                    section: "prompts",
                },
                ...(development
                    ? [
                          {
                              path: "/show-case",
                              label: t("nav.sidebar.showCase"),
                              icon: Blocks,
                              section: "showcase",
                          },
                      ]
                    : []),
            ];

    const visibleItems = items.filter(
        (item) =>
            (user || !["account", "developers", "billing", "support"].includes(item.section)) &&
            (item.section !== "billing" || appConfig?.billing_enabled === true),
    );
    const globalItems = [
        { path: homePath, label: t("nav.home"), icon: Home, section: "" },
        {
            path: "/prompt-builder",
            label: t("promptBuilder.title"),
            icon: FilePenLine,
            section: "prompts",
        },
        ...(development
            ? [
                  {
                      path: "/show-case",
                      label: t("nav.sidebar.showCase"),
                      icon: Blocks,
                      section: "showcase",
                  },
              ]
            : []),
    ];
    const isSectionActive = (section: string) =>
        isSettings &&
        location.pathname !== "/profile" &&
        location.pathname !== "/notifications" &&
        section === activeSection;
    const label = t(
        isAdminPanel ? "admin.title" : isSettings ? "settings.menu.title" : "nav.sidebar.aria",
    );
    return {
        items: visibleItems,
        globalItems,
        isSettings,
        isAdminPanel,
        isSectionActive,
        label,
        hasSections: isSettings || isAdminPanel,
    };
}
