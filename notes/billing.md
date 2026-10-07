# Billing settings and subscription checkout

[Korean](ko/billing.md)

The profile menu opens standalone `/plans`. Its Free/Plus/Pro cards retain the
existing fullscreen close/scroll layout and compact currency selector. Authenticated
users load `GET /billing/plans` and `/billing/subscription` through `useSubscription`.
Prices come from the server's Stripe allowlist, in minor currency units (KRW has no
fractional units). The Plus sandbox catalog is ₩3,990 / US$3.99 monthly and
₩43,092 / US$43.09 annually; the Pro prices are listed below. Currencies use independent
prices, not FX conversions.
Guests sign in first; missing pricing shows an unavailable state rather than a purchasable
hardcoded amount. A selected URL plan is never a current subscription or payment proof.

The current-plan button is disabled using the server snapshot, including Free only after
it is verified. Existing subscriptions block additional checkout; supported active subscriptions offer immediate paid upgrades and period-end downgrades/cancellation and undo. Paid-tier actions send
only plan, currency and an action UUID to `POST /billing/checkout-sessions`. The hook
locks repeated clicks and reuses an action UUID after failure. The server additionally
reserves a per-customer attempt across devices. The only accepted checkout destination
is credential-free HTTPS `checkout.stripe.com` without a custom port.

Hosted subscription return URLs use `/settings?billing_checkout={CHECKOUT_SESSION_ID}`
and `/settings?billing_checkout=cancelled`. These select Billing automatically. Only
`paid=true` from the owner-checked status API shows payment confirmation; complete/unpaid
remains pending. Refresh retries status reads. Current plan, status and renewal/end date
come from the subscription API. There is no local entitlement grant or webhook projection.
Unknown, failed and overdue subscriptions must not be displayed as Free.

Card registration stays in Settings Billing using `useBilling`, the typed adapter and embedded Stripe Elements. Hosted card/Link setup APIs and `billing_setup` returns remain compatible. Only server-verified `registered=true` confirms setup. Card/Link pagination, retry, test-mode and disabled/offline states remain.
Recent invoices and billing profile are read from Stripe; View all opens the restricted customer portal. Profile editing, card registration and saved-method management stay in the app.
Account deletion with subscription-checkout history requires operator reconciliation to
avoid orphaned recurring billing. The backend returns a localized actionable auth error.

Both hooks own snapshots for a mounted owner, ignore stale owner/request responses,
clear on owner changes, and refetch on browser focus/online and desktop connectivity
recovery. No billing SSE events exist. UUIDs are in-memory action hints; the backend owns
durable checkout reservations. No credentials or card data are persisted by the UI.
Native external-browser/deep-link return is not implemented or verified.

Settings use shared header/content spacing and `settings-row` surfaces; plans use their
separate family. Follow [page-family rules](page-families.md). Small cards need no new memo
boundary; URL/language/server snapshots are their meaningful changes. Hook race tests,
provider-mocked browser checkout/return tests, peer geometry comparisons and production
lazy-route checks protect these flows. Mocked tests do not prove a settled Stripe payment.

Cancellation returns show the shared transient toast once and replace the cancellation query with `section=billing`, preserving unrelated parameters. Billing/plan loading uses the shared spinner with an accessible name and no visible loading sentence; API key settings follows the same convention.

Server-verified payment and card registration success also use the shared transient toast, consuming the corresponding return query after verification. Pending results retain their query and inline status so refresh can verify completion; focus and reload do not replay a consumed success.

Settings follows Current plan / Transactions / Billing information / Payment methods / Cancel plan. Grouped rows reuse settings-row surfaces; compact dropdowns reuse the shared DropdownMenu variant and its showcase. Current plan stays active until the effective date; the shared confirmation modal captures the version/date and successful changes use a toast. Existing paid plans retain billing currency. Unknown/unsupported plans fail closed. The domain hooks own profile/invoices/portal and plan mutations, pause during desktop outages and ignore stale owners. Sensitive card entry is hosted by Stripe Elements inside the application dialog.

Saved cards show provider-supplied brand, last four digits and expiry. A `link` payment method does not expose the wallet card details; its official Link logo and wallet label identify the saved method without inventing card details. Settings and enabled pricing display the official Powered by Stripe badge. Assets are local; see `public/payment-brands/README.md` for provenance.

Subscription cancellation reuses the account-deletion section and danger action, including the Free confirmation. Undo remains neutral. Payment lists omit empty groups; official black/white Stripe badges follow the selected theme.

Page-level billing errors are translated, deduplicated and shown in one compact feedback slot. Subscription mutation errors remain in the open confirmation dialog. Hook error state and retry behavior are unchanged.

## In-app billing management

`PUT /billing/profile` saves email/name/structured address from the shared compact dialog. `POST /billing/payment-methods/{id}` sets the effective default or removes an owned method. Removing an active subscription default requires selecting a replacement first. The hook serializes mutations, reuses UUIDs after failure and refreshes the provider snapshot after success. The permanent refresh control is removed; errors expose a retry action. Mutation errors stay inside the active dialog.

Set optional `STRIPE_PUBLISHABLE_KEY` in the backend environment to enable embedded card entry. `POST /billing/card-setups` returns a card-only SetupIntent client secret used only in the lazy Stripe Element dialog; never persist or log it. Only owner/mode-checked `GET /billing/card-setups/{id}` with `registered=true` confirms registration. Required authentication returns preserve the settings base path, remove Stripe secret query fields and reverify the SetupIntent on the server. Existing hosted setup APIs remain compatible.

The shared `DropdownMenu` compact action variant uses an Ellipsis icon and a content-width floating menu, right alignment, viewport flipping/clamping and Escape focus restoration. Items support optional icons and `tone="danger"`. Billing uses Check/Trash2 icons; the searchable `DropdownMenu actions` showcase exercises default/delete selection without API calls. No page-specific menu styling is required.

### Country-specific billing addresses

With a configured publishable key, the profile dialog lazy-loads Stripe AddressElement in billing mode. Stripe owns country-specific field labels, regional choices and completeness checks; countries without a regional selector retain text entry. For example, Korea offers city/province choices, the US offers states and Japan offers prefectures. Email remains a native InputField. Save reads `getValue()` and sends only a complete structured snapshot through the existing profile mutation, normalizing optional line2 to an empty string. Provider fields use host appearance tokens inside the existing compact Modal. Loading/errors block saving and provide retry without leaving the dialog.

Profile address entry does not create a SetupIntent, require payment data or enable Google Maps address autocomplete. Without a publishable key, the existing manual form remains available; changing country clears city/state/postcode so stale regions cannot be submitted. Provider-hosted field rendering differs by country; city dropdowns are not universal.

Billing section headings group their secondary actions using the shared text Button and `section-action-header`; view-all, edit, add-card and receipt actions no longer use filled pills. Page errors are deduplicated in a single StatusCard above the current-plan section with its retry action inside the same surface. Dialog mutation errors stay in their dialog. The showcase covers text actions (normal/loading/disabled) and StatusCard retry.

## Tiers and billing intervals

Free, Plus and Pro are product tiers. Each paid pricing card owns an independent
monthly/annual SegmentedControl; currency remains a shared preview control.
The server-owned purchase keys `monthly`/`annual` represent Plus and
`pro_monthly`/`pro_annual` represent Pro. These preserve existing clients and
subscriptions while separating tier labels from billing intervals in the UI.

| Tier | Monthly KRW / USD | Annual KRW / USD |
| ---- | ----------------- | ---------------- |
| Plus | 3,990 / 3.99      | 43,092 / 43.09   |
| Pro  | 11,970 / 11.97    | 129,276 / 129.28 |

These are the configured sandbox examples, not hardcoded checkout amounts. Annual
billing is approximately 10% less than twelve monthly payments (USD rounds to cents).
The cards show a monthly equivalent, annual total and provider-derived discount.
`STRIPE_PLUS_{MONTHLY|ANNUAL}_{KRW|USD}_PRICE_ID` optionally overrides the legacy Plus
purchase prices. Keep legacy `STRIPE_{MONTHLY|ANNUAL}_{KRW|USD}_PRICE_ID` values so
existing subscriptions remain recognized and retain their price. Pro uses optional
`STRIPE_PRO_{MONTHLY|ANNUAL}_{KRW|USD}_PRICE_ID` values; unavailable options cannot be
purchased. Every configured price is checked for mode, currency and recurring interval.
No existing subscription is migrated by changing the catalog.

Plus → Pro applies immediately only after Stripe accepts payment, using
`payment_behavior=pending_if_incomplete` and `proration_behavior=always_invoice`.
Changing the interval during an upgrade can start a new billing cycle. A pending
payment retains the old plan, blocks further mutations and exposes an owner/mode-checked
hosted invoice link for payment/authentication. This explicit recovery action opens
Stripe; it is not the deferred in-app invoice-history modal. Focus/online recovery
reads the provider again; no client-side entitlement is granted. Pro → Plus, same-tier
interval changes and cancellation apply at period end, preserving paid time.
See [Stripe pending updates](https://docs.stripe.com/billing/subscriptions/pending-updates).

The route shell owns the sidebar subscription snapshot through the existing
hook and passes its tier through layout props. It resets on account changes and never maps roles or URL selections to a paid tier.
A successful mutation invalidates other mounted subscription consumers; each rereads
the server. Unknown/error states do not display a misleading Free badge. The collapsed
avatar shows an accessible compact tier mark; the expanded profile menu shows the
full name above email with stronger weight and tier text treatment. No new state store,
webhook, feature quota or tier-specific application entitlement is introduced here.
