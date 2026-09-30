import { useClientPagination } from "../../../hooks/collections/useClientPagination";
import { Plus, Trash2 } from "lucide-react";
import type { TFunction } from "i18next";
import { useTranslation } from "react-i18next";

import type { APIKeyRecord } from "../../../hooks/api/apiKey/useApiKeyApi";
import { formatDateYYYYMMDD, isDateTimeExpired } from "../../../utils/date";
import {
    Button,
    CopyField,
    DropdownMenu,
    InlineMessage,
    InputField,
    Modal,
    ModalButton,
    Pagination,
    StatusBadge,
    ToggleSwitch,
    Tooltip,
} from "../../ui";

const API_KEY_PAGE_SIZE = 6;

function formatRequestCount(value: number | null | undefined): string {
    if (typeof value !== "number" || Number.isNaN(value)) {
        return "0";
    }
    return value.toLocaleString();
}

type DeveloperApiKeyListProps = {
    items: APIKeyRecord[];
    slotCount: number;
    toggleBusyId: number | null;
    onToggleStatus: (apiKeyId: number, enabled: boolean) => void;
    onRequestDelete: (item: APIKeyRecord) => void;
    t: TFunction;
};

function DeveloperApiKeyList({
    items,
    slotCount,
    toggleBusyId,
    onToggleStatus,
    onRequestDelete,
    t,
}: DeveloperApiKeyListProps) {
    const placeholderCount = Math.max(0, slotCount - items.length);

    return (
        <div
            className="developer-key-list"
            role="region"
            aria-label={t("settings.developers.listTitle")}
            tabIndex={0}
        >
            <table className="developer-key-table">
                <caption className="sr-only">{t("settings.developers.listTitle")}</caption>
                <thead>
                    <tr>
                        <th scope="col">{t("settings.developers.columns.name")}</th>
                        <th scope="col">{t("settings.developers.columns.status")}</th>
                        <th scope="col">{t("settings.developers.meta.requestCount")}</th>
                        <th scope="col">{t("settings.developers.meta.expiresAt")}</th>
                        <th scope="col">{t("settings.developers.columns.actions")}</th>
                    </tr>
                </thead>
                <tbody>
                    {items.map((item) => {
                        const isActive = !item.revoked_at;
                        const isExpired = isDateTimeExpired(item.expires_at);
                        return (
                            <tr key={item.id} className="developer-key-row">
                                <td className="developer-key-row__identity">
                                    <span className="developer-key-row__name">{item.name}</span>
                                    <code>{item.key_prefix}…</code>
                                    <small>
                                        {t("settings.developers.meta.created")}:{" "}
                                        {formatDateYYYYMMDD(item.created_at)}
                                    </small>
                                </td>
                                <td>
                                    <StatusBadge
                                        tone={
                                            isExpired ? "danger" : isActive ? "active" : "inactive"
                                        }
                                    >
                                        {t(
                                            isExpired
                                                ? "settings.developers.status.expired"
                                                : isActive
                                                  ? "settings.developers.status.active"
                                                  : "settings.developers.status.inactive",
                                        )}
                                    </StatusBadge>
                                </td>
                                <td>
                                    <span className="developer-key-row__count">
                                        {formatRequestCount(item.request_count)}
                                    </span>
                                    <small>
                                        {t("settings.developers.meta.lastUsed")}:{" "}
                                        {formatDateYYYYMMDD(item.last_used_at)}
                                    </small>
                                </td>
                                <td>
                                    {item.expires_at
                                        ? formatDateYYYYMMDD(item.expires_at)
                                        : t("settings.developers.meta.noExpiration")}
                                </td>
                                <td>
                                    <div className="developer-key-row__actions">
                                        <Tooltip content={t("settings.developers.columns.enabled")}>
                                            <ToggleSwitch
                                                checked={isActive}
                                                disabled={toggleBusyId !== null}
                                                onCheckedChange={(nextChecked) =>
                                                    onToggleStatus(item.id, nextChecked)
                                                }
                                                label={`${t("settings.developers.columns.enabled")}: ${item.name}`}
                                            />
                                        </Tooltip>
                                        <Tooltip content={t("settings.developers.actions.delete")}>
                                            <Button
                                                type="button"
                                                className="developer-delete-inline-btn"
                                                aria-label={t(
                                                    "settings.developers.actions.deleteNamed",
                                                    { name: item.name },
                                                )}
                                                onClick={() => onRequestDelete(item)}
                                            >
                                                <Trash2 aria-hidden="true" />
                                            </Button>
                                        </Tooltip>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                    {Array.from({ length: placeholderCount }, (_, index) => (
                        <tr
                            key={`placeholder-${index}`}
                            className="developer-key-row developer-key-row--placeholder"
                            aria-hidden="true"
                        >
                            <td colSpan={5} />
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

type CreateApiKeyModalProps = {
    open: boolean;
    apiKeyName: string;
    apiKeyExpiryOption: "7d" | "30d" | "90d" | "never";
    busy: boolean;
    errorMessage: string | null;
    onNameChange: (value: string) => void;
    onExpiryOptionChange: (value: "7d" | "30d" | "90d" | "never") => void;
    onClose: () => void;
    onSubmit: () => void;
    t: TFunction;
};

const EXPIRY_OPTION_IDS = ["7d", "30d", "90d", "never"] as const;
type ExpiryOptionId = (typeof EXPIRY_OPTION_IDS)[number];

function buildExpiryOptionItems(t: TFunction): Array<{ id: ExpiryOptionId; label: string }> {
    return [
        { id: "7d", label: t("settings.developers.createModal.expiryOptions.sevenDays") },
        { id: "30d", label: t("settings.developers.createModal.expiryOptions.thirtyDays") },
        { id: "90d", label: t("settings.developers.createModal.expiryOptions.ninetyDays") },
        { id: "never", label: t("settings.developers.createModal.expiryOptions.never") },
    ];
}

function CreateApiKeyModal({
    open,
    apiKeyName,
    apiKeyExpiryOption,
    busy,
    errorMessage,
    onNameChange,
    onExpiryOptionChange,
    onClose,
    onSubmit,
    t,
}: CreateApiKeyModalProps) {
    const expiryOptionItems = buildExpiryOptionItems(t);
    const selectedExpiryOptionLabel =
        expiryOptionItems.find((item) => item.id === apiKeyExpiryOption)?.label ??
        expiryOptionItems[0].label;

    return (
        <Modal
            size="compact"
            open={open}
            title={t("settings.developers.createModal.title")}
            description={t("settings.developers.createModal.description")}
            onClose={onClose}
            footer={
                <>
                    <ModalButton variant="cancel" onClick={onClose}>
                        {t("settings.developers.actions.cancel")}
                    </ModalButton>
                    <ModalButton
                        variant="save"
                        disabled={!apiKeyName.trim() || busy}
                        loading={busy}
                        onClick={onSubmit}
                    >
                        {t("settings.developers.actions.save")}
                    </ModalButton>
                </>
            }
        >
            {errorMessage ? <InlineMessage>{errorMessage}</InlineMessage> : null}
            <InputField
                label={t("settings.developers.createModal.nameLabel")}
                value={apiKeyName}
                onValueChange={onNameChange}
                placeholder={t("settings.developers.createModal.namePlaceholder")}
            />
            <label className="developer-create-modal__field-label">
                {t("settings.developers.createModal.expiryLabel")}
                <DropdownMenu
                    className="developer-create-modal__dropdown"
                    label={t("settings.developers.createModal.expiryLabel")}
                    triggerLabel={selectedExpiryOptionLabel}
                    items={expiryOptionItems}
                    onSelect={(id) => {
                        onExpiryOptionChange(id as ExpiryOptionId);
                    }}
                />
            </label>
            {apiKeyExpiryOption === "never" ? (
                <InlineMessage tone="warning">
                    {t("settings.developers.createModal.neverExpiryWarning")}
                </InlineMessage>
            ) : null}
        </Modal>
    );
}

type CreatedSecretModalProps = {
    secret: string | null;
    copied: boolean;
    onCopy: () => void;
    onClose: () => void;
    t: TFunction;
};

function CreatedSecretModal({ secret, copied, onCopy, onClose, t }: CreatedSecretModalProps) {
    return (
        <Modal
            size="compact"
            open={Boolean(secret)}
            title={t("settings.developers.revealModal.title")}
            description={t("settings.developers.revealModal.description")}
            onClose={onClose}
            footer={
                <ModalButton variant="close" onClick={onClose}>
                    {t("settings.developers.actions.close")}
                </ModalButton>
            }
        >
            <CopyField
                value={secret ?? ""}
                inputAriaLabel={t("settings.developers.revealModal.title")}
                copyLabel={t("settings.developers.revealModal.copy")}
                copiedLabel={t("settings.developers.revealModal.copied")}
                copied={copied}
                disabled={!secret}
                onCopy={onCopy}
            />
        </Modal>
    );
}

type DeleteApiKeyModalProps = {
    target: APIKeyRecord | null;
    busy: boolean;
    onClose: () => void;
    onConfirmDelete: () => void;
    t: TFunction;
};

function DeleteApiKeyModal({ target, busy, onClose, onConfirmDelete, t }: DeleteApiKeyModalProps) {
    return (
        <Modal
            size="compact"
            open={Boolean(target)}
            title={t("settings.developers.deactivateModal.title")}
            description={t("settings.developers.deactivateModal.description")}
            onClose={onClose}
            footer={
                <>
                    <ModalButton variant="cancel" onClick={onClose}>
                        {t("settings.developers.actions.cancel")}
                    </ModalButton>
                    <ModalButton variant="danger" loading={busy} onClick={onConfirmDelete}>
                        {t("settings.developers.actions.delete")}
                    </ModalButton>
                </>
            }
        />
    );
}

type DeveloperApiKeysSectionProps = {
    controller: {
        items: APIKeyRecord[];
        loading: boolean;
        errorMessage: string | null;
        createModalOpen: boolean;
        newApiKeyName: string;
        newApiKeyExpiryOption: "7d" | "30d" | "90d" | "never";
        createBusy: boolean;
        createErrorMessage: string | null;
        createdSecret: string | null;
        copied: boolean;
        deactivateTarget: APIKeyRecord | null;
        deactivateBusy: boolean;
        toggleBusyId: number | null;
        setNewApiKeyName: (value: string) => void;
        setNewApiKeyExpiryOption: (value: "7d" | "30d" | "90d" | "never") => void;
        openCreateModal: () => void;
        closeCreateModal: () => void;
        handleCreateApiKey: () => void;
        handleToggleStatus: (apiKeyId: number, enabled: boolean) => void;
        setDeactivateTarget: (item: APIKeyRecord | null) => void;
        closeDeleteModal: () => void;
        confirmDelete: () => void;
        closeSecretModal: () => void;
        copySecret: () => void;
    };
};

export function DeveloperApiKeysSection({ controller }: DeveloperApiKeysSectionProps) {
    const { t } = useTranslation();
    const {
        page: currentPage,
        totalPages,
        visibleItems,
        setPage: setCurrentPage,
    } = useClientPagination(controller.items, API_KEY_PAGE_SIZE, controller.items.length);

    return (
        <section className="developer-section" aria-label={t("settings.developers.title")}>
            <div className="developer-section__actions">
                <h2>
                    {t("settings.developers.listTitle")}{" "}
                    <span className="developer-section__count">{controller.items.length}</span>
                </h2>
                <Button onClick={controller.openCreateModal}>
                    <Plus aria-hidden="true" />
                    {t("settings.developers.createButton")}
                </Button>
            </div>

            {controller.errorMessage ? (
                <InlineMessage>{controller.errorMessage}</InlineMessage>
            ) : null}

            {controller.loading ? (
                <p className="developer-section__loading">{t("settings.developers.loading")}</p>
            ) : controller.items.length === 0 ? (
                <p className="developer-section__loading">{t("settings.developers.empty")}</p>
            ) : (
                <div className="developer-section__list-shell">
                    <DeveloperApiKeyList
                        items={visibleItems}
                        slotCount={totalPages > 1 ? API_KEY_PAGE_SIZE : visibleItems.length}
                        toggleBusyId={controller.toggleBusyId}
                        onToggleStatus={controller.handleToggleStatus}
                        onRequestDelete={controller.setDeactivateTarget}
                        t={t}
                    />
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        ariaLabel={t("settings.developers.pagination.label")}
                        previousLabel={t("settings.developers.pagination.previous")}
                        nextLabel={t("settings.developers.pagination.next")}
                        onPageChange={setCurrentPage}
                    />
                </div>
            )}

            <CreateApiKeyModal
                open={controller.createModalOpen}
                apiKeyName={controller.newApiKeyName}
                apiKeyExpiryOption={controller.newApiKeyExpiryOption}
                busy={controller.createBusy}
                errorMessage={controller.createErrorMessage}
                onNameChange={controller.setNewApiKeyName}
                onExpiryOptionChange={controller.setNewApiKeyExpiryOption}
                onClose={controller.closeCreateModal}
                onSubmit={controller.handleCreateApiKey}
                t={t}
            />
            <CreatedSecretModal
                secret={controller.createdSecret}
                copied={controller.copied}
                onCopy={controller.copySecret}
                onClose={controller.closeSecretModal}
                t={t}
            />
            <DeleteApiKeyModal
                target={controller.deactivateTarget}
                busy={controller.deactivateBusy}
                onClose={controller.closeDeleteModal}
                onConfirmDelete={controller.confirmDelete}
                t={t}
            />
        </section>
    );
}
