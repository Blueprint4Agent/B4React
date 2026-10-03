import { useTranslation } from "react-i18next";
import { Modal, ModalButton, InlineMessage } from "../../ui";
export type PlanChangeSelection = {
    plan: "free" | "monthly" | "annual" | "keep";
    version: string;
    effectiveAt: number;
    price?: string;
};
type Props = {
    selection: PlanChangeSelection | null;
    busy: boolean;
    error: string | null;
    onClose: () => void;
    onConfirm: () => void;
};
export function PlanChangeDialog({ selection, busy, error, onClose, onConfirm }: Props) {
    const { t } = useTranslation();
    return (
        <Modal
            open={!!selection}
            title={t("billing.manage.title")}
            size="compact"
            keyboardDismissible
            onClose={() => {
                if (!busy) onClose();
            }}
            description={
                selection?.plan === "keep"
                    ? t("billing.manage.undoDescription")
                    : t("billing.manage.description", {
                          date: new Date((selection?.effectiveAt ?? 0) * 1000).toLocaleDateString(),
                          plan: t(`billing.plans.${selection?.plan ?? "free"}.name`),
                      })
            }
            footer={
                <>
                    <ModalButton variant="cancel" disabled={busy} onClick={onClose}>
                        {t("billing.manage.cancel")}
                    </ModalButton>
                    <ModalButton loading={busy} onClick={onConfirm}>
                        {t("billing.manage.confirm")}
                    </ModalButton>
                </>
            }
        >
            {selection?.price && <p>{selection.price}</p>}
            {error && <InlineMessage>{t(error)}</InlineMessage>}
        </Modal>
    );
}
