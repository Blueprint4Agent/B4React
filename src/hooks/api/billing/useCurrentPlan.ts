import { useTranslation } from "react-i18next";
import { useAppConfig } from "../../useFeatures";
import { useSubscription } from "./useSubscription";

export function useCurrentPlan(ownerId?: number) {
    const { t } = useTranslation();
    const { data } = useAppConfig();
    const billing = useSubscription(ownerId);
    const enabled = data?.billing_enabled === true;
    return {
        label: !enabled
            ? t("billing.plans.free.name")
            : billing.error
              ? t("billing.subscriptionStatus.unknown")
              : billing.subscription
                ? t(`billing.plans.${billing.subscription.plan}.name`)
                : t("app.loadingSession"),
        enabled,
        error: billing.error ? t(billing.error) : null,
        reload: () => void billing.reload(),
    };
}
export type CurrentPlan = ReturnType<typeof useCurrentPlan>;
