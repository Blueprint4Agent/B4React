# Commit Title

feat(sidebar): share the optional B4A support link

# Changed File Scope

AppSidebar, home top support link and scoped styles, coffee URL validation and regression tests, support visibility browser tests, EN/KO home documentation and worklog.

# Reason

Show the configured Buy Me a Coffee link in the sidebar as well as the home, per user request.

# Design

Reuse the sidebar footer external-link rows and collapsed Tooltip. Both locations use the same validated opt-in URL helper and server development-only gate. Move home support to a small link beside the top brand label, removing the bottom support block. Accept dots in creator usernames: the configured choi.hyk account was incorrectly rejected by the shared validator.

# Verification Plan

Run make verify-plan and make verify, testing two home-route links in development, collapsed/expanded sidebar behavior, persistence on settings and absence in production. Verify the actual configured dotted account on localhost:5173 without API mocks.

# Impact

No new configuration, API requests or external embeds. Production remains excluded.

# Loop Alignment

Existing sidebar UI composition and config provider are reused; no mutations, realtime or recovery changes.

# State Ownership

Derived configuration only, using existing provider and build-time variables; no new state or persistence.

# Memoization

One static link in an existing small list has no expensive render boundary; no additional memoization needed.

# Performance Evidence

Reuses the same helper and local icon; no API or tracking requests. Live localhost:5173 showed both configured links. Home link is 113px wide and 32px high at 1440px, and remains within the first viewport at 390px. Coarse pointers retain a 44px target.

# Verification

VERIFY_BASE=0ca65773 make verify-plan and make verify passed with frontend=full: 165 unit/component/integration tests and 191 browser cases. Matching unchanged receipts reused 10 production route and 3 style-studio checks. Live localhost:5173 verified the configured dotted creator URL in both sidebar and top home link at 390/1440px. No backend loop changes; no omitted checks outside classifier/receipt policy.

# Page Family

## Family

Persistent AppSidebar footer external links.

## Reference

Existing GitHub and User guide links immediately above ProfileDropdown.

## Shared Rules

Same row dimensions, icon, expanded label, collapsed Tooltip, target and rel attributes; no new CSS.

## Exceptions

None; the new item uses the existing footer link composition directly.

## Evidence

Verified the live sidebar Coffee tooltip alongside existing GitHub/User guide rows. Home support uses a small muted text link beside the brand, with no additional card. Live 390px and 1440px screenshots confirm top placement and no overflow.
