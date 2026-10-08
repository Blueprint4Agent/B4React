# Personal profile and account

[한국어](ko/account-profile.md)

Profile is a standalone `/profile` route inside the persistent AppShell, linked from
the sidebar profile dropdown and Account Go to profile action. It owns personal name, managed
photo, optional Bio (100 characters), location (a country:region identifier), and read-only signup
date. Account owns current name (inline editing), email, linked providers, signup date, password change and deletion.
There is no public profile or automatic geolocation.

Reuse AuthProvider's GET/PATCH /auth/me snapshot and photo APIs. Successful mutations
update the sidebar; failures retain confirmed data. Drafts reset on account/section
changes. No new store, polling or realtime events; other clients refresh on their next
existing reload. Existing desktop auth recovery remains the owner.

Password changes request a six-digit code at the registered email before submitting
code and new password. No current-password input is required. Codes last ten minutes,
are single-use and have a one-minute resend cooldown. Surface server issuance/attempt
limits and errors. Deletion codes cannot authorize a password change. Disabled email
blocks change/reset/deletion with an explanation. OAuth-only accounts manage passwords
with their provider. Refresh sessions are revoked on change; access tokens keep their
normal expiry. Late responses after navigation/account changes do not update old forms.

Account uses General's settings shell/header/rows. Profile uses a centered identity
hero and metadata strip within the persistent app shell.
Bio uses the showcased TextareaField. Compare mobile/desktop and both themes.

Location options use a pinned MIT country-region-data snapshot (249 countries,
4,387 subdivisions), not an exhaustive world-city database. Country names use
Intl.DisplayNames; Korean regions have native Korean labels. Country changes clear
the region draft, and Save requires a valid pair or no location. Where upstream
shortcodes are absent, stable internal hashed IDs are used. Backend validates the
same adopted pairs. Source and license:
https://github.com/country-regions/country-region-data/tree/e65e124da5e846a833eba68e228b6d50aad42817

Both Account and Profile show the current plan from the existing account-owned
subscription snapshot, with unknown/error and retry states. Billing-disabled
instances display Free and no management action. Navigation does not create a
second subscription cache or trigger a fresh read for a confirmed snapshot.

Bio is limited to 100 Unicode code points on both client and API. The editor shows n/100; the profile body preserves line breaks and grows naturally without truncation. Photo add/remove use the shared rectangular Button.

Name, Bio and location can also be edited in place on Profile. Name has a stable minimum width independent of spaces; Bio starts with a 96px
three-line editing area and scrolls internally. Save/cancel use backgroundless icons. Location opens
an anchored popover without expanding the metadata strip. Each inline save patches
only that field, and failed writes retain the draft. Account name editing uses the
same AuthProvider mutation path. Password and deletion share AccountEmailVerification
for recipient, code/send row and lifetime hint, plus the same compact Modal frame.

Country and region menus float above the page with a bounded height and internal scrolling.
