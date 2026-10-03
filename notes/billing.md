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

Card/Link setup remains exclusively in Settings Billing using `useBilling`, the existing
typed adapter and `/setup-sessions`; return URLs use `billing_setup`. Only `registered=true`
confirms setup. Card/Link pagination, retry, test-mode and disabled/offline states remain.
Recent invoices and billing profile are read from Stripe; View all/Edit/payment-method management opens the restricted customer portal.
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

Settings follows Current plan / Transactions / Billing information / Payment methods / Cancel plan. Grouped rows reuse settings-row surfaces; compact dropdowns reuse the shared DropdownMenu variant and its showcase. Current plan stays active until the effective date; the shared confirmation modal captures the version/date and successful changes use a toast. Existing paid plans retain billing currency. Unknown/unsupported plans fail closed. The domain hooks own profile/invoices/portal and plan mutations, pause during desktop outages and ignore stale owners. Card data editing stays in Stripe.

Saved cards show provider-supplied brand, last four digits and expiry. A `link` payment method does not expose the wallet card details; its official Link logo and wallet link identify where to view/manage those cards. Settings and enabled pricing display the official Powered by Stripe badge. Assets are local; see `public/payment-brands/README.md` for provenance.

Subscription cancellation reuses the account-deletion section and danger action, including the Free confirmation. Undo remains neutral. Payment lists omit empty groups; official black/white Stripe badges follow the selected theme.
