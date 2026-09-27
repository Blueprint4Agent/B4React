import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { PageStateFrame } from "../../components/layout/PageStateFrame";
import { BrandMark, Button, Spinner } from "../../components/ui";

type LoadingPageProps = { message?: string; preview?: boolean };

export function LoadingPage({ message, preview = false }: LoadingPageProps) {
    const { t } = useTranslation();
    const navigate = useNavigate();
    return (
        <PageStateFrame
            title={t("app.loadingTitle")}
            description={t("app.loadingSubtitle")}
            illustration={<BrandMark />}
            actions={
                preview ? (
                    <Button
                        appearance="pill-secondary"
                        onClick={() => navigate("/show-case", { replace: true })}
                    >
                        {t("pageState.back")}
                    </Button>
                ) : undefined
            }
        >
            <Spinner size="sm" label={message ?? t("app.loadingSession")} />
        </PageStateFrame>
    );
}
