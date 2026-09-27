import { AuthPageFrame } from "../../components/layout/AuthPageFrame";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { InfoCard } from "../../components/ui/status/StatusCard";
import { Button } from "../../components/ui";

export function ResetPasswordSuccessPage({ embedded = false }: { embedded?: boolean }) {
    const { t } = useTranslation();
    const navigate = useNavigate();

    return (
        <AuthPageFrame
            embedded={embedded}
            title={t("resetPassword.successTitle")}
            subtitle={t("resetPassword.successSubtitle")}
        >
            <InfoCard
                title={t("cards.infoTitle")}
                message={t("resetPassword.successDescription")}
            />
            <div className="verify-email__actions">
                <Button
                    appearance={embedded ? "pill" : "default"}
                    type="button"
                    onClick={() => navigate("/login", { replace: true })}
                >
                    {t("resetPassword.backToLogin")}
                </Button>
            </div>
        </AuthPageFrame>
    );
}
