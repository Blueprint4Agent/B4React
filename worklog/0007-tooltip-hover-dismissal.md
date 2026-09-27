# Commit Title

fix(ui): dismiss pointer tooltips after hover ends

# Changed File Scope

Tooltip.tsx, browser regression tests, English/Korean frontend guides, this worklog.

# Reason

A clicked control retains DOM focus; subsequent hover leaves a persistent tooltip.

# Design

Distinguish keyboard-visible focus from pointer-acquired focus. Pointer leave closes
hover tooltips, including window exits, while keyboard focus remains accessible.
Keep click/Escape dismissal and existing portal placement. Dismiss on window blur.

# Verification Plan

Reproduce click, re-hover, leave in Chromium before the fix. Run make test-ui,
make check/test/build and parent frontend-format-check/frontend-test.

# Impact

Shared tooltip lifecycle only; existing appearance, geometry, and APIs unchanged.

# Loop Alignment

UI composition uses the shared Tooltip and existing showcase. API state, realtime,
and desktop recovery loops are not applicable because data flow is unchanged.

# Verification

- Before the fix, both new browser cases failed: click/re-hover/leave retained a
  tooltip, and window blur retained a keyboard tooltip. Both pass after the fix.
- make test-ui: 8 passed, including existing placement/theme/scroll/mobile cases.
- make format/check/test/build: passed; 51 Vitest tests passed.
- Parent make frontend-format-check/frontend-test passed (51 tests).
- Browser runtime inspection used because DebugMCP startup timed out in the prior
  investigation. Native desktop was not launched; this changes DOM events only.
