# Commit Title

feat(ui): add capsule toast feedback for user actions

# Changed File Scope

Shared ToastCard/provider/showcase preview, auth and settings action handlers, epoch-guarded API-key result callbacks, common CSS, locales, component/browser tests and bilingual docs. Parent owns only the pinned frontend gitlink and integration worklog.

# Reason

Provide a compact fullscreen-notification-style capsule with a short message that appears briefly and disappears automatically, with an interactive showcase example.

# Design

Mount-driven ToastCard portals to body at viewport top center, uses a single plain-text message and a polite status region, defaults to three seconds then a short exit animation, and cleans timers on unmount. A keyed isolated ToastPreview replaces/replays the current toast instead of stacking. Reuse Button, inverse theme tokens and shared CSS; preserve focus and pointer access to the underlying page. Respect reduced motion. A stable dispatch-only provider owns one route-persistent action notification. No fullscreen API is introduced.

# Verification Plan

Root frontend-format-check and frontend-test. Child make check/test/build/test-ui. Fake-timer component cases cover expiry, replay/unmount and callback changes; browser cases cover actual delayed dismissal, focus, mobile/desktop placement, theme contrast and reduced motion. Inspect screenshots. Validate staged governance before commit.

# Impact

No API contract, dependency or persisted state change. Signup and reset-email navigation now waits for success and preserves errors on failure. Toast is transient feedback, not a place for required actions or critical persistent errors.

# Loop Alignment

UI composition uses shared Button/CSS and rendered catalogue coverage. API state stays in domain hooks; pages notify explicit action results. API-key callbacks use the existing epoch guard. Realtime and desktop recovery continue using existing persistent feedback without repeated toasts. Backend request/event/background loops are not changed.

# State Ownership

ToastCard owns its display phase/timers. ToastPreview owns only the current replay key; the catalogue does not own notification state. ToastProvider owns the current application notice; pages consume stable dispatch only. No notification persistence.

# Memoization

ToastCard is a tiny text portal with phase changes; no expensive stable-prop subtree benefits from React.memo. Isolating preview state prevents catalogue rerenders on toast lifecycle updates.

# Performance Evidence

Observed: a dispatch consumer renders once across two notifications and expiry; isolated showcase parent also stays at one render. Timer cleanup/replay tests pass. Production entry JS is 403.63 kB (gzip 125.48 kB). No latency or throughput claim.

# Verification

Child make check, test (93 cases), build, test-ui (65 browser cases) and test-routes (6 production cases) passed. Parent make frontend-format-check frontend-test passed (93 cases). Capsule screenshots inspected in light desktop/dark mobile during initial layout validation; expanded action wiring preserves the same geometry and browser contrast/focus/expiry checks pass. Signup/reset-email pending/failure/retry navigation and provider render isolation pass; API-key lifecycle and clipboard denial retain secret/manual recovery. No required checks skipped. Staged Git governance validates commit/PR metadata before submission.

# Expanded Implementation Plan

Review user-triggered authentication, recovery, profile, API-key and clipboard outcomes. Add a route-persistent provider with a stable dispatch-only context and one replaceable notice. Keep detailed inline errors and field validation; background refresh/SSE/bootstrap errors do not generate notifications. Await signup/reset-email responses before confirmation navigation, fixing silent failures. API-key mutation callbacks remain epoch-guarded and UI-independent. Add outcome, route persistence and render-isolation regression coverage.
