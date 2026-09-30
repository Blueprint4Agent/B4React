# Commit Title

fix(auth): reuse email verification requests across effect replays

# Changed File Scope

VerifyEmailPage, component regression tests and EN/KO frontend guides.

# Reason

React StrictMode replays effects; the one-time token was submitted twice and the failure replaced a successful verification. Language changes could also resend the consumed token.

# Design

Retain the current token request promise in a component ref and subscribe from each effect lifetime. Cleanup ignores stale completion without cancelling the shared request. Language changes rerender translated state without issuing another mutation.

# Verification Plan

Exercise StrictMode request count, language change and stale-token resolution in component tests, then run Make verify-plan/verify and browser UI checks.

# Impact

No token persistence or backend bypass. Each new token creates a request; used/expired tokens still fail on a fresh visit.

# Loop Alignment

Page-owned auth API hook remains the mutation boundary. UI state updates only for the active effect. Realtime and desktop recovery are unchanged and not applicable.

# State Ownership

Request lifetime belongs to VerifyEmailPage; a ref holds only the current token and promise until unmount. No global cache/store or persistent token storage.

# Memoization

No expensive repeated child boundary. A promise ref provides correctness, not render optimization.

# Performance Evidence

Regression test must observe one API call under StrictMode and after language changes, and no stale result overwrite.

# Verification

Full Make verify-plan/verify passed (check/test, 69 browser UI cases, six production route cases and style-studio checks). Final component test run passed 97 tests including StrictMode/locale one-call proof and stale-token rejection after navigation. No selected checks omitted; unchanged browser/build content was not rerun after adding the final test only.
