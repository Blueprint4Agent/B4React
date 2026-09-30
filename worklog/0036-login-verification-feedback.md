# Commit Title

fix(auth): place verification recovery below login and localize resend feedback

# Changed File Scope

Login and signup-email-sent pages, EN/KO locale strings, frontend guides and login tests.

# Reason

The resend button interrupts email/password entry and raw server success prose stays English in Korean UI.

# Design

Group unverified-account notice and existing secondary Button below the login action. Keep field validation beside fields. Render resend confirmation from a shared translation key, never backend prose, on both resend surfaces.

# Verification Plan

Run Make verify-plan/verify, check mocked unverified login and resend at mobile/desktop widths in light/dark themes, and verify Korean confirmation despite English backend payload.

# Impact

Presentation only; no endpoint, account, queue or authentication policy changes.

# Loop Alignment

Existing page-owned API hooks and UI components retained. Realtime and desktop recovery loops unchanged/not applicable to this layout/copy change.

# State Ownership

Form and request state remain page-local; no new store or context. Existing email edits clear recovery feedback.

# Memoization

No repeated expensive boundary is added; trivial conditional composition does not benefit from memoization.

# Performance Evidence

No optimization claimed; existing request-count tests and browser layout checks will verify behavior without new requests or subscriptions.

# Verification

Make verify-plan and make verify selected full frontend verification; check/test, 69 browser tests, six production route cases and style-studio checks passed. No selected checks skipped. Mocked browser verification at 390/1440px confirms recovery follows login and Korean confirmation replaces English server prose without real mail requests. Existing request-count assertion remains valid.
