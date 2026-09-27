SHELL := /bin/bash
.DEFAULT_GOAL := help
NPM ?= npm
MERGE_METHOD ?= merge
ALLOW_NON_MERGE_METHOD ?= false
.PHONY: help init install dev build check test format api-generate api-check desktop-dev desktop-build git-governance-check
help: ## Show available targets
	@awk 'BEGIN {FS = ":.*##"} /^[a-zA-Z0-9_.-]+:.*##/ {printf "  %-24s %s\n", $$1, $$2}' $(MAKEFILE_LIST)
init: ## Initialize local configuration
	@test -f .env || cp .env.example .env
install: ## Install locked dependencies
	$(NPM) ci
dev: ## Start browser development server
	$(NPM) run dev
build: ## Build local dist artifacts
	$(NPM) run build
check: architecture-check api-check ## Check generated types, formatting, and TypeScript
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
git-governance-pr-check: ## Validate actual PR metadata and every authored commit
	bash ./scripts/validate-git-governance.sh --event-file "$(GITHUB_EVENT_PATH)"

.PHONY: architecture-check
architecture-check: ui-composition-check ## Check pages/components runtime dependency boundaries
	node scripts/check-architecture.mjs

.PHONY: test-ui
test-ui: ## Check component layout and tooltip behavior in Chromium
	$(NPM) run test:e2e -- tests/e2e/component-layout.spec.ts tests/e2e/auth-smoke.spec.ts tests/e2e/admin-panel.spec.ts tests/e2e/config-sharing.spec.ts

.PHONY: ui-composition-check
ui-composition-check: ## Verify shared styling and rendered showcase coverage
	node scripts/check-ui-composition.mjs
	node --test scripts/check-ui-composition.test.mjs
