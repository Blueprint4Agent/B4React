import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, ToastCard } from "../../ui";

export function ToastPreview() {
    const { t } = useTranslation();
    const [toastId, setToastId] = useState<number | null>(null);
    return (
        <>
            <Button onClick={() => setToastId((previous) => (previous ?? 0) + 1)}>
                {t("showCase.toast.trigger")}
            </Button>
            {toastId !== null ? (
                <ToastCard
                    key={toastId}
                    message={t("showCase.toast.message")}
                    onDismiss={() => setToastId(null)}
                />
            ) : null}
        </>
    );
}
