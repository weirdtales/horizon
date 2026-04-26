# Project Setup Checklist

Use this checklist when setting up a new project with this template.

## Prerequisites
- [ ] This template cloned or copied to your project directory
- [ ] `make` installed on your system
- [ ] Text editor or IDE ready

## Initial Setup
- [ ] Run `make verify-env` to confirm environment
- [ ] Run `make init` to verify full structure
- [ ] View `make help` to see all available commands

## Planning Phase (Day 1-2)

### Step 1: Create TRD
- [ ] Go to ChatGPT and generate a Technical Requirements Document
  - Prompt: "Generate a comprehensive TRD for [your project description]"
  - Include: Scope, requirements, constraints, success metrics
- [ ] Download the .md file from ChatGPT
- [ ] Save to `.assistant/trd/` directory
- [ ] Run `make trd` to verify it appears

### Step 2: Create Canvas (Context Clarification)
- [ ] Create `.assistant/canvas/vision.md` — Long-term vision
- [ ] Create `.assistant/canvas/goals.md` — Specific objectives
- [ ] Create `.assistant/canvas/stakeholders.md` — Who's involved
- [ ] Create `.assistant/canvas/questions.md` — Unknowns
- [ ] Create `.assistant/canvas/ideas.md` — Brainstorming
- [ ] Create `.assistant/canvas/notes.md` — General notes
- [ ] Run `make review` to see current status

### Step 3: Create Plan
- [ ] Create `.assistant/plan.md`
- [ ] Map TRD requirements to Now/Next/Later sections
- [ ] Be specific about what's in scope for each phase
- [ ] Run `make planning` to review structure

### Step 4: Create Backlog
- [ ] Create `.assistant/backlog.md`
- [ ] Convert plan items to granular tasks
- [ ] Add IDs (FEATURE-001, BUG-001, etc.)
- [ ] Add acceptance criteria for each task
- [ ] Link back to TRD section that requires it
- [ ] Run `make requirements-review` to verify coverage

### Step 5: Create Status Document
- [ ] Create `.assistant/status.md`
- [ ] Set current **Focus** (what phase are we in?)
- [ ] List initial **Risks** (what could go wrong?)
- [ ] List key **Artifacts** (TRD, plan, backlog, etc.)
- [ ] Capture **Open Questions** from canvas/questions.md
- [ ] Add today's date

### Step 6: Optional - Create ADR Stubs
- [ ] If major architectural decisions exist, create `.assistant/adr/` files
  - Example: `ADR-001-database-choice.md`
  - Example: `ADR-002-authentication-strategy.md`
- [ ] Include: Context, decision, rationale, consequences
- [ ] Run `make list-decisions` to see them

### Step 7: Verification
- [ ] Run `make planning-checklist` — All should show YES
- [ ] Run `make audit-docs` — Verify all docs exist
- [ ] Manually review each file for completeness
- [ ] Get stakeholder sign-off on plan and backlog

## Pre-Development Checklist
- [ ] TRD reviewed and understood by team
- [ ] Canvas documents align team on vision
- [ ] Plan has clear Now/Next/Later phases
- [ ] Backlog is granular and has acceptance criteria
- [ ] Status document reflects current state
- [ ] All planning artifacts committed to version control
- [ ] Ready to start first `make session-start`

## During Development

### Each Work Session
- [ ] Run `make session-start` before beginning
  - Copy the kickoff prompt into your AI assistant
- [ ] Work on backlog items
- [ ] Update status.md with progress and blockers
- [ ] Update history.md with decisions made
- [ ] Mark tasks complete in backlog.md
- [ ] Update task_log.md when work finishes
- [ ] Run `make session-end` when done
  - Copy the end-of-session prompt into your AI assistant

### Regular Checks
- [ ] Weekly: Run `make review` to check status
- [ ] Weekly: Update plan.md with any timeline changes
- [ ] After decisions: Create ADR if architectural choice made
- [ ] After sessions: Verify history.md and task_log.md updated

### Ongoing Documentation
- [ ] Canvas updated if understanding changes
- [ ] Plan updated if timeline shifts
- [ ] Backlog updated as new work discovered
- [ ] Status updated after each session
- [ ] History logged for all decisions
- [ ] ADRs recorded for all major choices

## Deployment/Migration

### When Ready to Deploy
- [ ] Run `make migration` to review migration prompts
- [ ] Copy migration prompts into your AI assistant
- [ ] Execute migration steps
- [ ] Update status.md to note deployment
- [ ] Update history.md with deployment notes
- [ ] Archive session/documents

## Post-Project

### Documentation Handoff
- [ ] Review all documents one final time
- [ ] Update status.md with final state
- [ ] Archive history.md for future reference
- [ ] Create summary document if needed
- [ ] Commit all final changes
- [ ] Document any lessons learned

### For Future Projects
- [ ] Copy this template to new project directory
- [ ] Keep working documents from this project for reference
- [ ] Use pattern from history.md for next project's decisions

## Quick Reference

| Command | When | Purpose |
|---------|------|---------|
| `make help` | Anytime | See all commands |
| `make init` | Start | Full initialization |
| `make project-start` | Begin planning | Start planning phase |
| `make planning-checklist` | During planning | Verify planning complete |
| `make session-start` | Start work day | Begin development session |
| `make session-end` | End work day | End development session |
| `make review` | Anytime | Quick status check |
| `make audit-docs` | Weekly | Check docs are up-to-date |
| `make migration` | Deployment | Handle deployment |

## Notes

- Keep documents in sync — don't let docs drift from reality
- Update status.md frequently to catch issues early
- Log decisions in history.md — future you needs this
- Reference TRD often — it's your north star
- Use canvas for alignment — especially with stakeholders
