import { OAuthProviderIcon } from "./OAuthProviderIcon";
import { Button } from "../../ui";

type ConnectedOAuthProvidersCardProps = {
    title: string;
    providers: string[];
    emptyText: string;
    getProviderLabel: (provider: string) => string;
};

export function ConnectedOAuthProvidersCard({
    title,
    providers,
    emptyText,
    getProviderLabel,
}: ConnectedOAuthProvidersCardProps) {
    return (
        <article className="settings-profile-field-card">
            <h2>{title}</h2>
            {providers.length > 0 ? (
                <div className="settings-oauth-provider-list">
                    {providers.map((provider) => (
                        <Button
                            key={provider}
                            className="settings-oauth-provider-button"
                            type="button"
                            disabled
                        >
                            <span className="settings-oauth-provider-button__content">
                                <OAuthProviderIcon provider={provider} />
                                <span className="settings-oauth-provider-button__label">
                                    {getProviderLabel(provider)}
                                </span>
                            </span>
                        </Button>
                    ))}
                </div>
            ) : (
                <p>{emptyText}</p>
            )}
        </article>
    );
}
