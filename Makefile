SHELL := /bin/bash
.DEFAULT_GOAL := help
NPM ?= npm
MERGE_METHOD ?= merge
ALLOW_NON_MERGE_METHOD ?= false
.PHONY: help init install dev build check test format api-generate api-check desktop-dev desktop-build git-governance-check
help: ## Show available targets
	@awk 'BEGIN {FS = ":.*##"} /^[a-zA-Z0-9_.-]+:.*##/ {printf "  %-24s %s\n", $$1, $$2}' $(MAKEFILE_LIST)
init: hooks-install ## Initialize local configuration
	@test -f .env || cp .env.example .env
install: ## Install locked dependencies
	$(NPM) ci
dev: ## Start browser development server
	$(NPM) run dev
build: ## Build local dist artifacts
	$(NPM) run build
check: architecture-check api-check project-config-check style-studio-check ## Check generated types, formatting, and TypeScript
	$(NPM) run format:check
	$(NPM) run typecheck
test: ## Run unit, component, and integration tests
	$(NPM) test
format: ## Format source and documentation
	$(NPM) run format
api-generate: ## Generate types from the pinned local contract
	$(NPM) run generate:api
api-check: ## Verify generated types are current
	$(NPM) run api:check
desktop-dev: ## Run Tauri development shell
	$(NPM) run tauri:dev
desktop-build: ## Build Tauri packages (requires Rust and platform dependencies)
	$(NPM) run tauri -- build
git-governance-check: ## Validate branch, commit, worklog, and PR metadata
	bash ./scripts/validate-git-governance.sh

export COMMIT_TITLE COMMIT_BODY_FILE PR_TITLE PR_BODY_FILE MERGE_METHOD ALLOW_NON_MERGE_METHOD

.PHONY: git-governance-pr-check
git-governance-pr-check: ## Validate actual PR metadata locally (PR_NUMBER) or a supplied event
	@if [ -n "$(PR_NUMBER)" ]; then python3 scripts/git_hooks.py pr-check "$(PR_NUMBER)"; elif [ -n "$(GITHUB_EVENT_PATH)" ]; then bash ./scripts/validate-git-governance.sh --event-file "$(GITHUB_EVENT_PATH)"; else echo 'Set PR_NUMBER or GITHUB_EVENT_PATH' >&2; exit 1; fi

.PHONY: architecture-check
architecture-check: ui-composition-check react-performance-check ## Check pages/components runtime dependency boundaries
	node scripts/check-architecture.mjs

.PHONY: test-ui
test-ui: ## Check component layout and tooltip behavior in Chromium
	$(NPM) run test:e2e -- tests/e2e/component-layout.spec.ts tests/e2e/auth-smoke.spec.ts tests/e2e/admin-panel.spec.ts tests/e2e/admin-server.spec.ts tests/e2e/config-sharing.spec.ts tests/e2e/billing.spec.ts tests/e2e/runtime-modes.spec.ts tests/e2e/profile-photo.spec.ts

.PHONY: ui-composition-check
ui-composition-check: ## Verify shared styling and rendered showcase coverage
	node scripts/check-ui-composition.mjs
	node --test scripts/check-ui-composition.test.mjs

.PHONY: test-routes
test-routes: build ## Verify production lazy-route loading and recovery in Chromium
	$(NPM) run test:e2e -- --config playwright.production.config.ts

.PHONY: react-performance-check
react-performance-check: ## Guard config ownership, route splitting, memo boundaries and review policy
	node scripts/check-react-performance.mjs
	node --test scripts/check-react-performance.test.mjs
	python3 -m unittest discover -s scripts -p 'test_*.py'

.PHONY: project-config-check
project-config-check: ## Validate optional public app branding and Tauri identity
	node --input-type=module -e 'import { readProjectConfig } from "./scripts/project-config.mjs"; readProjectConfig();'
	node --test scripts/project-config.test.mjs

.PHONY: style-studio style-studio-check test-style-studio
style-studio: ## Run explicitly enabled loopback-only local style editor
	B4F_STYLE_STUDIO=1 $(NPM) run dev -- --host 127.0.0.1
style-studio-check: ## Verify local file access and style application fixtures
	node --test scripts/style-studio.test.mjs
test-style-studio: style-studio-check ## Verify style preview and apply UI in Chromium
	$(NPM) run test:e2e -- --config playwright.style-studio.config.ts

export VERIFY_BASE VERIFY_HEAD VERIFY_FULL
.PHONY: verify-plan verify verify-light verification-test
verify-plan: ## Show change-scoped checks (VERIFY_BASE defaults to HEAD)
	python3 scripts/verification.py plan
verify: ## Run checks selected by change scope; VERIFY_FULL=1 forces full checks
	python3 scripts/verification.py run
verify-light: ## Validate changed text and JSON without installing dependencies
	python3 scripts/verification.py light
verification-test: ## Test change classification and verification selection
	python3 -m unittest discover -s scripts -p 'test_verification.py'

.PHONY: hooks-install hooks-test
hooks-install: ## Install commit-msg and pre-push hooks in this clone
	python3 scripts/git_hooks.py install
hooks-test: ## Test Git hooks and verification receipt invalidation
	python3 -m unittest discover -s scripts -p 'test_git_hooks.py'
	python3 -m unittest discover -s scripts -p 'test_verification_cache.py'

.PHONY: test-selected test-ui-selected
test-selected: ## Run classifier-selected unit/component/integration suites
	@test -n "$(TEST_FILES)" || (echo 'TEST_FILES is required' >&2; exit 1)
	$(NPM) test -- $(TEST_FILES)
test-ui-selected: ## Run classifier-selected browser suites/cases
	@test -n "$(TEST_FILES)" || (echo 'TEST_FILES is required' >&2; exit 1)
	$(NPM) run test:e2e -- --fully-parallel $(TEST_FILES)

.PHONY: check-affected
check-affected: ## Static policy/type checks plus formatting for mapped changed files
	@test -n "$(CHECK_FILES)" || (echo 'CHECK_FILES is required' >&2; exit 1)
	node scripts/check-architecture.mjs
	node scripts/check-ui-composition.mjs
	node scripts/check-react-performance.mjs
	$(NPM) exec prettier -- --check $(CHECK_FILES)
	$(NPM) run typecheck
