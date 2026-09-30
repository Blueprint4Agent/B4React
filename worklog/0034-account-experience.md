# Commit Title

feat(account): unify feedback and add verified deletion

# Changed File Scope

Shared InlineMessage/Modal CSS, account settings/navigation, typed auth API/hooks,
controlled AccountDeletionDialog and isolated showcase, EN/KO copy/guides, pinned
provider contract/generated types, browser and component/session tests.

# Reason

Reuse existing feedback while making authentication notices consistent. Present
Account settings with a safe email-code deletion flow, and fix protruding scrollbars,
transient entry scrolling and detached/clipped input focus outlines.

# Design

InlineMessage composes compact StatusCard. AccountDeletionDialog reuses InputField,
Modal and ModalButton in settings and showcase. The auth API/hook owns requests;
AuthProvider clears session/history only after confirmed deletion and ignores stale
profile/refresh results. Registered email, consequences and code expiry remain
persistent; send success/cooldown failures use the existing toast, invalid proof stays
inline. Modal clips its rounded frame; an inset body owns scrolling, stable gutters
and focus clearance. Nested PanelCard translate animation is disabled. Text input
focus joins its border with an inset two-pixel outline. Legacy profile links resolve
to Account. Adopt provider contract from c4939c276ecb0a7aea69df886bc0dc17999f3377.

# Verification Plan

Run make verify-plan / make verify; full check/test, UI, production routes and studio.
Assert short/long modal geometry, focus and last-action reachability, shared preview
with zero auth requests, proof failure/retry, session clear and stale-response denial.

# Impact

Deletion requires enabled email and a six-digit code. Showcase is API-free, uses
123456 and a shortened five-second sample resend delay. Existing theme is retained;
no new notification or OTP widget library. Backend contract must be deployed alongside
the consuming parent integration. No data mutations run from catalogue previews.

# Loop Alignment

API mutation uses page-owned auth hooks and existing wrappers/errors. Request epochs
reset on account changes; connectivity retains existing HTTP/recovery ownership and
errors are retryable. No polling or new realtime events are needed for explicit
account deletion. UI composition/catalog coverage uses existing shared components.

# State Ownership

Proof drafts/request state belong to useAccountDeletion; countdown ticks stay in the
small dialog. Session stays in AuthProvider. Preview state is isolated in its own
component and never enters a global store. No Zustand/Redux is needed.

# Memoization

Dialog and feedback controls are small and their relevant props change with input;
no expensive unchanged subtree merits a new memo boundary. Existing protected table
and config boundaries remain intact. Countdown does not rerender the catalogue or
settings parent, and toast dispatch retains its existing stable context.

# Performance Evidence

95 component/unit/integration tests passed, including proof request count, failure
retaining the session and a late profile response failing to restore a deleted user.
Browser preview asserted zero account requests. Actual runtime inspection reproduced
short-modal overflow at 166px scrollHeight versus 158px clientHeight during a 10px
translate animation; removing nested translation made both 166px at first/settled
frames. Production entry measured 411.19 kB (127.50 gzip); no latency claim is made.

# Verification

Full scope selected by make verify-plan and make verify. Initial test-only typing/
async assertions were corrected; final make check test passed (95 tests). make test-ui
passed 69 cases, including mobile/desktop modal spacing, inset focus, stationary close,
last button reachability and isolated deletion-code preview. Production test-routes
passed six cases and test-style-studio passed three through delegated Make targets.
Light/dark screenshots visually reviewed. Formatting and diff checks passed. No
selected checks omitted or scope downgraded; already-passing unchanged groups were
not rerun after test/documentation-only follow-ups. Required CI remains independent.
