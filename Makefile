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
check: api-check ## Check generated types, formatting, and TypeScript
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
	COMMIT_TITLE="$(COMMIT_TITLE)" COMMIT_BODY_FILE="$(COMMIT_BODY_FILE)" PR_TITLE="$(PR_TITLE)" PR_BODY_FILE="$(PR_BODY_FILE)" MERGE_METHOD="$(MERGE_METHOD)" ALLOW_NON_MERGE_METHOD="$(ALLOW_NON_MERGE_METHOD)" bash ./scripts/validate-git-governance.sh
