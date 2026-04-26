# ========================================
# PROJECT STARTUP TEMPLATE
# ========================================
# Workflow: TRD → Canvas → Plan → Backlog → Status → History
# Docs: TEMPLATE_GUIDE.md, WORKFLOW.md, QUICK_START.md
# ========================================

PROMPTS_DIR   ?= .assistant/prompts
TRD_DIR       ?= .assistant/trd
CANVAS_DIR    ?= .assistant/canvas
TEMPLATE_REPO ?= https://github.com/Puttrix/AI_TEMPLATE.git

.PHONY: project-start session-start session-end migration \
        trd planning requirements-review planning-checklist \
        review status verify-env init update-template help

# ========================================
# PLANNING PHASE
# ========================================

project-start: verify-env planning-checklist
	@echo ""
	@echo "=== Project Startup Prompt ==="
	@cat $(PROMPTS_DIR)/project_startup.md
	@echo ""
	@echo ">>> Copy the prompt above into your AI assistant to begin planning."

trd:
	@echo "=== Technical Requirements Documents ==="
	@ls -la $(TRD_DIR)/ 2>/dev/null || echo "No TRDs found. Add .md files to $(TRD_DIR)/"

planning:
	@echo "=== Planning Phase ==="
	@echo ""
	@echo "1. TRD files:"
	@ls $(TRD_DIR)/ 2>/dev/null || echo "   (none — add .md files to $(TRD_DIR)/)"
	@echo ""
	@echo "2. Canvas files:"
	@ls $(CANVAS_DIR)/ 2>/dev/null || echo "   (none)"
	@echo ""
	@echo "3. Next: fill canvas, then create plan.md and backlog.md from TRD"

requirements-review:
	@echo "=== TRD Requirements Coverage ==="
	@echo "TRDs in $(TRD_DIR)/:"
	@ls $(TRD_DIR)/ 2>/dev/null || echo "  (none)"
	@echo ""
	@echo "Cross-reference with .assistant/backlog.md to ensure all requirements are tracked."

planning-checklist:
	@echo "=== Planning Checklist ==="
	@echo "TRD present:         $$(test -n "$$(ls -A $(TRD_DIR) 2>/dev/null)" && echo '✓' || echo '✗  add .md files to $(TRD_DIR)/')"
	@echo "vision.md filled:    $$(test -s $(CANVAS_DIR)/vision.md && echo '✓' || echo '✗  fill in $(CANVAS_DIR)/vision.md')"
	@echo "goals.md filled:     $$(test -s $(CANVAS_DIR)/goals.md && echo '✓' || echo '✗  fill in $(CANVAS_DIR)/goals.md')"
	@echo "stakeholders filled: $$(test -s $(CANVAS_DIR)/stakeholders.md && echo '✓' || echo '✗  fill in $(CANVAS_DIR)/stakeholders.md')"
	@echo "questions.md filled: $$(test -s $(CANVAS_DIR)/questions.md && echo '✓' || echo '✗  fill in $(CANVAS_DIR)/questions.md')"
	@echo "plan.md exists:      $$(test -s .assistant/plan.md && echo '✓' || echo '✗  create .assistant/plan.md')"
	@echo "backlog.md exists:   $$(test -s .assistant/backlog.md && echo '✓' || echo '✗  create .assistant/backlog.md')"
	@echo "status.md exists:    $$(test -s .assistant/status.md && echo '✓' || echo '✗  create .assistant/status.md')"

# ========================================
# DEVELOPMENT PHASE
# ========================================

session-start:
	@echo "=== Session Kickoff Prompt ==="
	@cat $(PROMPTS_DIR)/kickoff.md
	@echo ""
	@echo ">>> Copy the prompt above into your AI assistant to begin this session."

session-end:
	@echo "=== End Session Prompt ==="
	@cat $(PROMPTS_DIR)/end_session.md
	@echo ""
	@echo ">>> Copy the prompt above into your AI assistant to close this session."

# ========================================
# OPERATIONS
# ========================================

migration:
	@echo "=== Migration Prompt ==="
	@cat $(PROMPTS_DIR)/migration.md
	@echo ""
	@echo ">>> Copy the prompt above into your AI assistant to run the migration."

# ========================================
# UTILITY
# ========================================

status:
	@echo "=== Current Project Status ==="
	@cat .assistant/status.md 2>/dev/null || echo "status.md not found — run 'make project-start' first"

review: status

verify-env:
	@echo "=== Environment Check ==="
	@command -v node  >/dev/null 2>&1 && echo "node:  ✓ $$(node --version)"  || echo "node:  ✗  not found (required for MCP servers)"
	@command -v npx   >/dev/null 2>&1 && echo "npx:   ✓ $$(npx --version)"   || echo "npx:   ✗  not found (required for MCP servers)"
	@command -v git   >/dev/null 2>&1 && echo "git:   ✓ $$(git --version)"   || echo "git:   ✗  not found"
	@test -f .mcp.json && echo "mcp:   ✓ .mcp.json found" || echo "mcp:   –  no .mcp.json (optional)"
	@test -f .env      && echo "env:   ✓ .env found"      || echo "env:   –  no .env (add if using MCP env vars)"

update-template:
	@test -n "$(TEMPLATE_REPO)" || ( \
	  echo "❌  TEMPLATE_REPO not set."; \
	  echo "    Edit the Makefile and set TEMPLATE_REPO, or run:"; \
	  echo "    make update-template TEMPLATE_REPO=https://github.com/you/AI_TEMPLATE.git"; \
	  exit 1)
	@command -v git >/dev/null 2>&1 || (echo "❌  git not found"; exit 1)
	@test -f .template-manifest || ( \
	  echo "❌  .template-manifest not found."; \
	  echo "    Copy .template-manifest from the template repo first, then re-run."; \
	  exit 1)
	@echo "Fetching template from $(TEMPLATE_REPO)..."
	@tmpdir=$$(mktemp -d) && \
	  git clone --quiet --depth 1 $(TEMPLATE_REPO) $$tmpdir && \
	  echo "" && \
	  echo "Updating template files:" && \
	  while IFS= read -r file || [ -n "$$file" ]; do \
	    [ -z "$$file" ] && continue; \
	    case "$$file" in \#*) continue ;; esac; \
	    if [ -f "$$tmpdir/$$file" ]; then \
	      mkdir -p "$$(dirname $$file)" && \
	      cp "$$tmpdir/$$file" "$$file" && \
	      echo "  ✓ $$file"; \
	    else \
	      echo "  – $$file (not in template, skipped)"; \
	    fi; \
	  done < .template-manifest && \
	  rm -rf $$tmpdir
	@echo ""
	@echo "✓ Template updated."
	@echo "  Review changes : git diff"
	@echo "  Project files  : .assistant/trd, adr, canvas, plan, backlog — not touched"

init: verify-env planning-checklist
	@echo ""
	@echo "✓ Initialization check complete."
	@echo "  Run 'make project-start' to begin planning."

help:
	@echo ""
	@echo "PROJECT STARTUP TEMPLATE"
	@echo "========================"
	@echo ""
	@echo "PLANNING PHASE"
	@echo "  make project-start       Initialize project (env check + prompt)"
	@echo "  make trd                 List TRD files"
	@echo "  make planning            Show planning overview"
	@echo "  make planning-checklist  Check all planning artifacts exist"
	@echo "  make requirements-review Cross-reference TRD with backlog"
	@echo ""
	@echo "DEVELOPMENT PHASE"
	@echo "  make session-start       Print session kickoff prompt"
	@echo "  make session-end         Print session closure prompt"
	@echo ""
	@echo "OPERATIONS"
	@echo "  make migration           Print migration prompt"
	@echo ""
	@echo "UTILITY"
	@echo "  make status              Show current status.md"
	@echo "  make verify-env          Check required tools are installed"
	@echo "  make init                Full initialization check"
	@echo "  make update-template     Pull latest template files from GitHub"
	@echo "  make help                Show this message"
	@echo ""
