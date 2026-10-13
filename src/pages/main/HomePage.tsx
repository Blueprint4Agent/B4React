import { Bell, MessageSquare, CreditCard, Settings2, UserRound, Users } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { Button } from "../../components/ui";
import { useAuthContext } from "../../hooks/useAuth";
import { useAppConfig } from "../../hooks/useFeatures";
import { ProjectOverview } from "./ProjectOverview";
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
        ...(user
            ? [
                  { key: "notifications", to: "/notifications", icon: Bell },
                  { key: "support", to: "/settings?section=support", icon: MessageSquare },
              ]
            : []),
        { key: "preferences", to: "/settings?section=general", icon: Settings2 },
        ...(user?.role === "admin" || user?.role === "manager"
            ? [{ key: "directory", to: "/admin", icon: Users }]
            : []),
    ];
    return (
        <div className="home-landing">
            <ProjectOverview>
                <section className="home-account" aria-labelledby="home-account-title">
                    <div className="home-account__heading">
                        <div>
                            <h2 id="home-account-title">{t("home.shortcuts")}</h2>
                        </div>
                        {!user && loginEnabled ? (
                            <Button appearance="text" onClick={() => navigate("/login")}>
                                {t("home.signIn")}
                            </Button>
                        ) : null}
                    </div>
                    <nav aria-label={t("home.shortcuts")}>
                        {destinations
                            .filter(({ key }) => key !== "billing" || config?.billing_enabled)
                            .map(({ key, to, icon: Icon }) => (
                                <Link className="home-account__link" key={key} to={to}>
                                    <Icon size={16} aria-hidden="true" />
                                    {t(`home.${key}.title`)}
                                </Link>
                            ))}
                    </nav>
                </section>
            </ProjectOverview>
        </div>
    );
}
