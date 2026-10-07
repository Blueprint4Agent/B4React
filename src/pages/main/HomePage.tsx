import { CreditCard, Home, Settings2, UserRound, Users } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { MainPageTemplate } from "../../components/layout/MainPageTemplate";
import { Button } from "../../components/ui";
import { useAuthContext } from "../../hooks/useAuth";
import { useAppConfig } from "../../hooks/useFeatures";
import { LoadingPage } from "./LoadingPage";

export function HomePage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { user, loading } = useAuthContext();
    const { data: config } = useAppConfig();
    if (loading) return <LoadingPage />;
    const loginEnabled = config?.login_enabled === true;
    const destinations = [
        ...(user || loginEnabled
            ? [
                  {
                      key: "account",
                      to: user ? "/settings?section=account" : "/login",
                      icon: UserRound,
                  },
                  {
                      key: "billing",
                      to: user ? "/settings?section=billing" : "/plans",
                      icon: CreditCard,
                  },
              ]
            : []),
        { key: "preferences", to: "/settings?section=general", icon: Settings2 },
        ...(user?.role === "admin" || user?.role === "manager"
            ? [{ key: "directory", to: "/admin", icon: Users }]
            : []),
    ];
    return (
        <MainPageTemplate
            title={t("nav.home")}
            description={
                user
                    ? t("home.welcome", { name: user.name.trim() || user.email })
                    : t("home.guestWelcome")
            }
            icon={<Home />}
            actions={
                !user && loginEnabled ? (
                    <Button appearance="text" onClick={() => navigate("/login")}>
                        {t("home.signIn")}
                    </Button>
                ) : undefined
            }
            menuLabel={t("home.shortcuts")}
            menuItems={destinations.map(({ key, to, icon: Icon }) => ({
                id: key,
                to,
                icon: <Icon />,
                title: t(`home.${key}.title`),
                description: t(`home.${key}.description`),
            }))}
        />
    );
}
