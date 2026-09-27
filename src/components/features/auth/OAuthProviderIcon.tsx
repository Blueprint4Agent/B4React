export function OAuthProviderIcon({ provider }: { provider: string }) {
    if (provider !== "google" && provider !== "github") return null;
    return (
        <span className="oauth-provider-button__logo-wrap" aria-hidden="true">
            {(["dark", "light"] as const).map((tone) => (
                <img
                    key={tone}
                    src={`/icons/${provider}-mark-${tone}.svg`}
                    alt=""
                    className={`oauth-provider-button__logo oauth-provider-button__logo--${tone} oauth-provider-button__logo--${provider}`}
                />
            ))}
        </span>
    );
}
