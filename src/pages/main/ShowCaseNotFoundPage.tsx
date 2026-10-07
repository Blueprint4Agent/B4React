import { useAppConfig } from "../../hooks/useFeatures";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { SearchX } from "lucide-react";
import { PageStateFrame } from "../../components/layout/PageStateFrame";
import { Button } from "../../components/ui";

export function ShowCaseNotFoundPage() {
    const navigate = useNavigate();
    const { data: config } = useAppConfig();
    const { t } = useTranslation();
    return (
        <PageStateFrame
            title={t("pageState.notFoundTitle")}
            description={t("pageState.notFoundDescription")}
            illustration={
                <>
                    <span className="page-state__symbol">
                        <SearchX aria-hidden="true" />
                    </span>
                    <span className="page-state__code">404</span>
                </>
            }
            actions={
                <Button appearance="pill" onClick={() => navigate("/show-case", { replace: true })}>
                    {t(config?.app_mode === "development" ? "pageState.back" : "nav.home")}
                </Button>
            }
        />
    );
}
