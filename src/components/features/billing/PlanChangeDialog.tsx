import { useTranslation } from "react-i18next";
import { Modal, ModalButton, InlineMessage } from "../../ui";
export type PlanChangeSelection = {
    plan: "free" | "monthly" | "annual" | "pro_monthly" | "pro_annual" | "keep";
    version: string;
    effectiveAt: number;
    price?: string;
    immediate?: boolean;
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
                    : t(
                          selection?.immediate
                              ? "billing.manage.immediateDescription"
                              : "billing.manage.description",
                          {
                              date: new Date(
                                  (selection?.effectiveAt ?? 0) * 1000,
                              ).toLocaleDateString(),
                              plan: t(`billing.plans.${selection?.plan ?? "free"}.name`),
                          },
                      )
            }
            footer={
                <>
                    <ModalButton variant="cancel" disabled={busy} onClick={onClose}>
                        {t("billing.manage.cancel")}
                    </ModalButton>
                    <ModalButton
                        variant={selection?.plan === "free" ? "danger" : "save"}
                        loading={busy}
                        onClick={onConfirm}
                    >
                        {t("billing.manage.confirm")}
                    </ModalButton>
                </>
            }
        >
            {selection?.price && <p>{t("billing.manage.newPrice", { price: selection.price })}</p>}
            {error && <InlineMessage>{t(error)}</InlineMessage>}
        </Modal>
    );
}
