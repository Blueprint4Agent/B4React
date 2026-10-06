import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { AppLayout } from "../../components/layout/AppLayout";
import { Button, PanelCard } from "../../components/ui";

type ServerUnavailablePageProps = {
    checking: boolean;
    error: unknown | null;
    onRetry: () => void;
};

const CHECKING_INDICATOR_DELAY_MS = 350;

export function ServerUnavailablePage({ checking, error, onRetry }: ServerUnavailablePageProps) {
    const { t } = useTranslation();
    const [showChecking, setShowChecking] = useState(false);

    useEffect(() => {
        if (!checking) {
            setShowChecking(false);
            return undefined;
        }

        const timerId = window.setTimeout(() => setShowChecking(true), CHECKING_INDICATOR_DELAY_MS);
        return () => window.clearTimeout(timerId);
    }, [checking]);

    return (
        <AppLayout>
            <div className="page server-unavailable-page">
                <PanelCard
                    title={t("serverUnavailable.title")}
                    subtitle={t("serverUnavailable.subtitle")}
                >
                    <p className="muted" role="status">
                        {error
                            ? t("serverUnavailable.configError")
                            : t("serverUnavailable.waiting")}
                    </p>
                    <div className="status-card__actions">
                        <Button loading={showChecking} disabled={checking} onClick={onRetry}>
                            {showChecking
                                ? t("serverUnavailable.retrying")
                                : t("serverUnavailable.retry")}
                        </Button>
                    </div>
                </PanelCard>
            </div>
        </AppLayout>
    );
}
