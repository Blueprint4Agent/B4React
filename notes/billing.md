# Billing settings and subscription checkout

[Korean](ko/billing.md)

The profile menu opens standalone `/plans`. Its Free/Monthly/Annual cards retain the
existing fullscreen close/scroll layout and small currency dropdown. Authenticated
users load `GET /billing/plans` and `/billing/subscription` through `useSubscription`.
Prices come from the server's Stripe allowlist, in minor currency units (KRW has no
fractional units). The sandbox example catalog is ₩3,990 / US$3.99 monthly and
₩39,900 / US$39.99 annually; these are independent prices, not FX conversions.
Guests sign in first; missing pricing shows an unavailable state rather than a purchasable
hardcoded amount. A selected URL plan is never a current subscription or payment proof.

The current-plan button is disabled using the server snapshot, including Free only after
it is verified. Existing subscriptions block additional checkout; supported active subscriptions offer period-end plan changes/cancellation and undo. Monthly/Annual actions send
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
