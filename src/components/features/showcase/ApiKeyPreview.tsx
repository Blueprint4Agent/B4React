import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { APIKeyRecord } from "../../../hooks/api/apiKey/useApiKeyApi";
import { DeveloperApiKeysSection } from "../apiKey/DeveloperApiKeysSection";

export function ApiKeyPreview() {
    const { t } = useTranslation();
    const [items, setItems] = useState<APIKeyRecord[]>([
        {
            id: 1,
            name: "Showcase",
            key_prefix: "demo_preview",
            created_at: "2026-01-01T00:00:00Z",
            expires_at: null,
            revoked_at: null,
            last_used_at: null,
            request_count: 12,
        },
    ]);
    const [open, setOpen] = useState(false);
    const [name, setName] = useState("");
    const [expiry, setExpiry] = useState<"7d" | "30d" | "90d" | "never">("30d");
    const [target, setTarget] = useState<APIKeyRecord | null>(null);
    const [secret, setSecret] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    return (
        <div className="showcase-feature-preview">
            <p className="muted">{t("showCase.catalog.localOnly")}</p>
            <DeveloperApiKeysSection
                controller={{
                    items,
                    loading: false,
                    errorMessage: null,
                    createModalOpen: open,
                    newApiKeyName: name,
                    newApiKeyExpiryOption: expiry,
                    createBusy: false,
                    createErrorMessage: null,
                    createdSecret: secret,
                    copied,
                    deactivateTarget: target,
                    deactivateBusy: false,
                    toggleBusyId: null,
                    setNewApiKeyName: setName,
                    setNewApiKeyExpiryOption: setExpiry,
                    openCreateModal: () => {
                        setName("");
                        setOpen(true);
                    },
                    closeCreateModal: () => setOpen(false),
                    handleCreateApiKey: () => {
                        if (!name.trim()) return;
                        setItems((previous) => [
                            ...previous,
                            {
                                id: Date.now(),
                                name: name.trim(),
                                key_prefix: "demo_preview",
                                created_at: new Date().toISOString(),
                                expires_at:
                                    expiry === "never"
                                        ? null
                                        : new Date(
                                              Date.now() + parseInt(expiry) * 86400000,
                                          ).toISOString(),
                                revoked_at: null,
                                last_used_at: null,
                                request_count: 0,
                            },
                        ]);
                        setOpen(false);
                        setSecret("demo_only_not_a_real_api_key");
                        setCopied(false);
                    },
                    handleToggleStatus: (id, enabled) =>
                        setItems((previous) =>
                            previous.map((item) =>
                                item.id === id
                                    ? {
                                          ...item,
                                          revoked_at: enabled ? null : new Date().toISOString(),
                                      }
                                    : item,
                            ),
                        ),
                    setDeactivateTarget: setTarget,
                    closeDeleteModal: () => setTarget(null),
                    confirmDelete: () => {
                        setItems((previous) => previous.filter((item) => item.id !== target?.id));
                        setTarget(null);
                    },
                    closeSecretModal: () => setSecret(null),
                    copySecret: () => {
                        void navigator.clipboard
                            .writeText(secret ?? "")
                            .then(() => setCopied(true))
                            .catch(() => setCopied(false));
                    },
                }}
            />
        </div>
    );
}
