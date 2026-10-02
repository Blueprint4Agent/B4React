# Billing settings and plans

Korean: [결제 화면](ko/billing.md).

The profile menu's **Upgrade plan** opens the lazy `/plans` route. Free, Monthly and
Annual cards support URL-backed selection and KRW/USD display. Example template prices
are monthly ₩3,990 / US$3.99 and annual ₩39,900 / US$39.99; these are independently
chosen illustrations, not FX conversions or configured Stripe prices. Paid subscriptions,
entitlements, invoices, billing-address editing and cancellation are not implemented.
Free is the baseline for this registration-only template, not a fetched subscription status.
Do not reuse that baseline as a paid entitlement check when adding subscriptions.

Plan selection stays on this screen. A compact currency dropdown sits above the cards at
their upper right. Card/Link registration is available only in Settings → Billing;
the plans screen has no registration action. Authenticated/bootstrap identities can
open Billing from the settings sidebar. Guests can browse plans. Selection is not a
purchase and cannot change a user's plan. There are no business/team tiers yet.

The page owns `useBilling`, which calls the typed `useBillingApi` adapter. It checks config,
lists card and Link methods separately, and offers cursor-based load-more for each.
Loading, disabled, empty, failure/retry, test mode and desktop-offline states are explicit.
Registration uses a UUID retained across failed retries in that mounted account page and
blocks duplicate clicks. The only outbound registration destination accepted is HTTPS
`checkout.stripe.com`. No card data or credentials are persisted by this UI.

Configure hosted return URLs to `/settings?billing_setup={CHECKOUT_SESSION_ID}` and
`/settings?billing_setup=cancelled` on the deployed frontend origin. These existing default
paths automatically select Billing, even without `section=billing`. The session ID is
checked against the status API: only `registered=true` produces confirmation. Query text,
`status=complete`, or the selected plan alone cannot prove completion. A refresh retries
pending or failed confirmation. Browsers return to the same app origin/session; native
external-browser/deep-link registration recovery is not implemented or verified.

The billing page is keyed by owner, clears transient state on account changes, and ignores
obsolete loads/mutations after switching/unmount. Browser focus/online and desktop
connectivity recovery refetch data; no billing SSE events exist in this contract. No requests
run just from visiting unrelated settings or viewing plan prices. The UUID is in memory;
leaving/reloading before an ambiguous attempt resolves starts a new UI action, so it is not
a durable deduplication guarantee. Backend customer reservation still protects identity.

UI uses shared Button/PrimaryCard/InlineMessage and existing profile/sidebar navigation.
Appearance lives in app.css; no global store, new icon library or shared control API is added.
Three small plan cards need no memo wrapper; URL/language/currency are their meaningful
update sources. Hook request-count and stale-owner tests plus browser/production route tests
protect refresh behavior, navigation and lazy loading.

The plans screen starts directly with its heading and currency control. No back-to-billing button, decorative card icon/headline or alert-style pricing disclosure is shown; the example-price disclosure remains readable below the cards.

`/plans` is a standalone full-window route outside AppLayout, with its own scroll surface and a top-right close button. Closing returns to the originating app/settings/admin route when supplied by the profile menu; direct visits fall back to billing for signed-in users or the showcase for guests. The native desktop title bar inset remains reserved.

Signed-in users see the Free template baseline as **Current plan**, with a disabled action. Selecting a monthly/annual candidate never updates that label; future real subscriptions must supply the current plan from the server. Guests retain normal plan selection without claiming a current subscription.

Billing settings reuse the shared settings header/content spacing and settings-row surfaces. Keep billing-specific CSS limited to internal arrangement; compare actual General/Billing geometry in browser checks when changing these layouts.
