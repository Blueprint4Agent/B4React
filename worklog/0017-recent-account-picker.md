# Commit Title

feat(auth): add opt-in browser recent account picker

# Changed File Scope

Recent account storage and shared picker, auth session hook/login integration,
OAuth intent handling, showcase, locales, tests and bilingual guides.

# Reason

Offer previous account choices without treating local history as authentication or
storing passwords/tokens in the account list.

# Design

Honor existing remember-email consent; retain up to five accounts for 90 days using
email, display name, provider, last-used timestamp and optional profile image.
Large uploaded data URLs become 64px thumbnails; URLs/small images are validated.
Refresh metadata on authenticated profile load/update without recreating deleted records. Write after successful
email login or authenticated OAuth return; a short-lived sessionStorage OAuth intent
carries provider/consent across redirects. Validate stored data and tolerate blocked
storage. Email selection fills the email/password step; OAuth selection starts that
configured provider without claiming to force its account. Authenticated profile identity opens a separate body-portal account popover with
viewport-aware right/left placement, current-account marking and Add account.
All avatars are circular with center cropping and initials on image failure.
Switch-mode login preserves the old session until a new authentication succeeds;
OAuth clears only the stale access-token cache before provider navigation so the
return restores the new cookie session. History follows the social buttons and
precedes the remember-account checkbox. Support individual and
all-record removal, and synchronize across tabs. Reuse picker in showcase.

Guests may open General/Appearance settings; shared section resolution hides account-only
sections and normalizes direct guest links without invoking account APIs.

# Verification Plan

Run child check/test/build/test-ui and root checks. Unit-test bounds, malformed
storage, expiry and removal; test login/OAuth consent writes, picker selection,
delete controls and responsive modal layout. Preserve auth/session regression tests.

# Impact

History is local to this browser/origin and independent of active login. Existing
login validity, remember-me cookies and backend API contract remain unchanged.

# Loop Alignment

AuthProvider owns successful auth results; UI only receives record/action props.
Shared picker follows composition loop. Realtime/desktop recovery are unchanged.

# Verification

Child make check/test/build/test-ui passed: 62 Vitest and 39 browser cases.
Root make check/test passed: 74 backend and 62 frontend tests. Browser checks cover
guest section restrictions, no account requests, separate body-portal placement,
circular avatars and account history consent/selection. Reviewed popup/login screenshots.
External provider authentication was not performed; provider intent is covered with fixtures.
