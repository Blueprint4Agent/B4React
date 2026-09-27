# Commit Title

feat(auth): unify recovery dialogs and compact feedback cards

# Changed File Scope

Shared auth frame, all account/recovery page composition and routing, StatusCard,
ValidationCard, styles, showcase, tests and bilingual documentation.

# Reason

Bring account creation and password recovery into the same compact auth experience,
with quieter, readable validation and warning/error feedback.

# Design

Extract one AuthPageFrame that composes the existing Modal/PanelCard. Pages retain
API hooks and dynamic titles while routes retain the showcase background. Extend
the frame through sent/reset/verification states without changing request semantics.
Make status cards icon-led and compact; validation criteria stay neutral until met.
Preserve error messages and password rules, with accessible rule state labels.
Extract pill/secondary button appearances into Button and expose all variants,
loading/disabled states, OAuth buttons and AuthPageFrame in the showcase.
Use a dedicated localized login/signup entry label instead of Guest for anonymous
users when authentication is enabled.

# Verification Plan

Run child check/test/build/test-ui and parent frontend-format-check/frontend-test.
Exercise recovery validation and sent state, signup rules, missing-token feedback,
modal close/focus and existing authentication/API-key tests. Inspect light/dark and
mobile layouts.

# Impact

Presentation-only changes to auth recovery and feedback. Existing API and session
behavior remains unchanged; shared card appearance also updates the showcase.

# Loop Alignment

Shared UI/frame follows composition loop. Pages retain auth domain hook ownership.
Realtime and desktop recovery are unchanged because no transport work is added.

# Verification

Child make check/test/build passed, with 55 Vitest tests and 33 browser cases.
Root frontend-format-check/frontend-test passed. Reviewed signup/recovery/reset
feedback at 390px/1440px in light/dark appearance. Browser checks cover shared
showcase variants and login/signup entry label. A status-icon assertion was scoped
to its dialog after the showcase correctly rendered additional shared examples.
