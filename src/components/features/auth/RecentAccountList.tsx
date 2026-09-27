import { X } from "lucide-react";
import { UserAvatar } from "../../ui";
import { useTranslation } from "react-i18next";
import { accountId, type RecentAccount } from "../../../utils/recentAccounts";

type RecentAccountListProps = {
    accounts: RecentAccount[];
    onSelect: (account: RecentAccount) => void;
    onRemove: (account: RecentAccount) => void;
    onClear: () => void;
    availableProviders?: string[];
};
export function RecentAccountList({
    accounts,
    onSelect,
    onRemove,
    onClear,
    availableProviders = ["email", "google", "github"],
}: RecentAccountListProps) {
    const { t } = useTranslation();
    if (!accounts.length) return null;
    return (
        <section className="recent-accounts" aria-label={t("recentAccounts.title")}>
            <div className="recent-accounts__header">
                <h3>{t("recentAccounts.title")}</h3>
                <button type="button" onClick={onClear}>
                    {t("recentAccounts.clear")}
                </button>
            </div>
            <ul>
                {accounts.map((account) => (
                    <li key={accountId(account)}>
                        <button
                            className="recent-accounts__select"
                            type="button"
                            onClick={() => onSelect(account)}
                            disabled={!availableProviders.includes(account.provider)}
                            aria-label={t("recentAccounts.select", {
                                email: account.email,
                                provider: t(`recentAccounts.providers.${account.provider}`),
                            })}
                        >
                            <UserAvatar
                                imageUrl={account.imageUrl}
                                label={account.name || account.email}
                            />
                            <span className="recent-accounts__identity">
                                <span>{account.name || account.email}</span>
                                <small>
                                    {account.name ? `${account.email} · ` : ""}
                                    {t(`recentAccounts.providers.${account.provider}`)}
                                </small>
                            </span>
                        </button>
                        <button
                            type="button"
                            className="recent-accounts__remove"
                            aria-label={t("recentAccounts.remove", {
                                email: account.email,
                                provider: t(`recentAccounts.providers.${account.provider}`),
                            })}
                            onClick={() => onRemove(account)}
                        >
                            <X aria-hidden="true" />
                        </button>
                    </li>
                ))}
            </ul>
            <p>{t("recentAccounts.note")}</p>
        </section>
    );
}
