# Dependency review

[한국어](ko/dependency-review.md)

Use Node.js 24 and `npm ci` with the committed lockfile. The October 2026 publication
review found 13 npm audit findings in the previous lockfile, including development
test tooling. Compatible dependency updates and an explicit Vitest 4.x migration
remove the findings reported at review time. React and state ownership remain unchanged.

Run `npm audit` and `npm audit --omit=dev` to distinguish the whole toolchain from
production dependencies. Audit counts change over time and do not prove application
exploitability or the absence of unknown vulnerabilities. Review fixes, commit the
lockfile and run `make verify-plan` followed by `make verify`; do not apply forced
major upgrades to a release without regression evidence.

Vitest 4 supports the project's Vite 6 and Node 24 toolchain. Keep the explicit test
include patterns and the current mock/reset setup; see the official
[migration guide](https://v4.vitest.dev/guide/migration.html). The update is verified
through existing unit/integration, browser UI, route recovery and Style Studio suites.

The admin render-isolation test delegates its constructor spy to native Intl.DateTimeFormat. This retains real formatter instances under Vitest 4 constructor mocking and preserves the existing skipped-render assertions.
