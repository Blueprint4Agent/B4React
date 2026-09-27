# Commit Title

feat(branding): support project-local app identity

# Changed File Scope

Public project config reader, Vite HTML/define integration, shared brand assets/i18n, Tauri launcher, tests and EN/KO docs.

# Reason

Make a copied blueprint configurable from one public project manifest instead of manually replacing names, branding, desktop identity and feature flags.

# Design

Parent owns a validated project manifest and plan/apply/check CLI. Reuse env parsing/rendering and back up modified local files; preserve unrelated settings and credentials. Generate a public child-local project.local.json plus optional logo assets. B4React consumes only its own local config through Vite and the Tauri launcher; no source or package-lock rewriting. Defaults retain the template identity. Backend feature switches remain the existing config authority. Reject invalid manifests before writes; repeated initialization is idempotent.

# Verification Plan

Fixture tests for manifest validation, env preservation, fresh initialization, idempotence, drift detection and write failures; child branding/HTML/Tauri configuration tests and configured production browser smoke. Root make check test build, child check/test/build/test-ui/test-routes, staged governance and required CI. Native bundle compilation is not required for configuration-only launcher changes; verify merged Tauri config directly.

# Impact

Opt-in initialization for fresh copied projects. No automatic configuration of this working application's real env, no schema or API change. Existing make init remains env-only. Native package identifier/product name are configurable; source package/crate/module names stay stable.

# Loop Alignment

Existing API/auth feature/recovery loops remain authoritative. Build-time brand data is immutable, no new API/global state. Shared BrandMark/BrandBanner compose existing UI and showcase. Backend domain/event/task loops are not applicable to setup tooling.

# State Ownership

Brand identity is validated immutable build-time configuration local to B4React. Existing Context and domain hooks keep runtime state; no Zustand/Redux or additional config HTTP requests.

# Memoization

No new changing props or expensive render boundary: BrandMark renders two static images and existing shared text. React.memo/useMemo wrappers offer no identified benefit for this startup configuration change; protected admin memo remains unchanged.

# Performance Evidence

Default entry remains 390.76 kB (gzip 121.26 kB). Default and custom production builds pass title/favicon, translated brand, logo and mobile-width assertions with one /config call. Existing memo/config/route regressions pass; no added state provider or config request.

# Verification

Passed make check/test/build (79 Vitest tests, 4 public config fixtures), production route/branding tests (5), and browser UI suite (54). Parent make check/test/build and temporary configured frontend build passed: Korean/English custom name, custom logo and favicon, 79 component/unit tests and 5 production browser tests. Default entry remains 390.76 kB (gzip 121.26 kB). Native binary packaging was not run: this change only merges launcher configuration, covered by command/window/override fixtures; platform packaging still requires its own toolchain. Required PR CI will run before merge.
