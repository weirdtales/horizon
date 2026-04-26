# GitHub Copilot Instructions

This project uses a TRD-driven, structured planning workflow. Follow these instructions in every session.

## On Session Start

1. Read `.assistant/status.md` first — it shows current project health and focus
2. Read `.assistant/plan.md` and `.assistant/backlog.md` to understand scope
3. If `status.md` is stale or missing, regenerate it from `plan.md`, `backlog.md`, and `task_log.md`

## Workspace Structure

```
.assistant/
├── status.md          # Current project health — always read first
├── plan.md            # Now / Next / Later roadmap
├── backlog.md         # Granular work items with acceptance criteria
├── task_log.md        # Completed work log
├── history.md         # Session notes and decisions
├── trd/               # Technical Requirements Documents (source of truth)
├── canvas/            # vision.md, goals.md, stakeholders.md, questions.md
├── adr/               # Architecture Decision Records
└── prompts/           # AI prompts for startup / kickoff / end-session
```

## Core Workflow

**Everything traces back to the TRD.** The workflow is:
TRD → Canvas → Plan → Backlog → Execute → ADRs + Status updates

### TRD Reading Pattern (do this before anything else)

Read TRDs in 3 passes:
1. **Structure** — Major sections, core vs. nice-to-have, success metrics
2. **Gaps** — What's ambiguous? Missing constraints, security, scale requirements?
3. **Risks** — Conflicting requirements, technical unknowns, unclear scope

Then write a brief TRD summary in `.assistant/trd/` (core reqs, ambiguities, risks) before creating any plan.

### Planning Phase
- Complete 3-pass TRD read and write summary
- Help fill canvas files before creating any plan
- Create `plan.md` with Now / Next / Later sections
- Break plan into `backlog.md` items of 1–3 days each
- Every backlog item must reference a TRD section

### During Development
- Work from `backlog.md` items in priority order
- Log completed work in `task_log.md`
- Update `status.md` after meaningful progress
- Create ADRs for architectural decisions — link them in `status.md`

### On Session End
- Update `backlog.md` (mark items done, adjust priorities)
- Update `status.md` (focus, risks, open questions)
- Log session notes in `history.md`

## Hard Rules

1. **Canvas before plan** — Never create `plan.md` before canvas files have substance
2. **TRD reference required** — Every backlog item must cite a TRD section
3. **Items ≤ 3 days** — Break down anything larger
4. **3+ acceptance criteria per item** — All must be testable and specific
5. **ADR for major decisions** — Database, auth method, architecture pattern, scaling approach
6. **Ask, don't assume** — When TRD is ambiguous, ask before proceeding
7. **Document plan changes** — Note why items moved between Now/Next/Later
8. **No scope creep into Now** — New requests go to Later unless explicitly reprioritized
9. **Resolve open questions** — Questions blocking Now work must be answered before proceeding
10. **No vague items** — Be specific: not "improve performance" but "paginate note list, <500ms for 1M rows"

## Backlog Item Format

```markdown
## FEAT-001: Email Signup Form
- **Status:** Todo
- **TRD Reference:** Section 2.1 — "Users sign up with email and password"
- **Effort Estimate:** 2 days
- **Acceptance Criteria:**
  - [ ] User enters email (validated format) and password (8+ chars)
  - [ ] HTTP 409 if email already registered
  - [ ] Confirmation email sent on success
  - [ ] HTTP 400 with field errors on invalid input
```

## ADR Format

File: `.assistant/adr/ADR-00N-decision-name.md`

```markdown
# ADR-00N: [Decision]
## Status: Proposed | Accepted | Deprecated
## Context: [Why a decision was needed, with TRD reference]
## Decision: [What was chosen]
## Rationale: [Why this over alternatives]
## Consequences: [Tradeoffs and implications]
```

## Scope Creep Pattern

When a new requirement appears mid-project:
1. **Pause** — Don't add it to the backlog immediately
2. **Map** — Is it in the TRD? (Yes / No / Ambiguous)
3. **Assess** — If new: what does it displace? What moves to Later?
4. **Decide** — Human chooses priority, not you
5. **Document** — Record the outcome in `status.md`

## Clarifying Questions Format

Structure questions as: **Specific → Options → Impact**

> "TRD says 'user authentication' but doesn't specify:
> 1. Email-only, or also social login (Google, GitHub)?
> 2. 2FA from day 1, or later?
> This affects both architecture and backlog scope — what should we prioritize?"

## Backlog Grooming Checklist

Before calling a backlog ready to execute:
- [ ] Every item has a TRD reference (exact section + quote)
- [ ] No item is larger than 3 days — break down anything bigger
- [ ] Each item has 3–5 testable acceptance criteria
- [ ] Items don't overlap each other
- [ ] Dependencies are clear (what blocks what)
- [ ] Priority is clear (Now / Next / Later)
- [ ] No vague language anywhere

## Common Violations

| Violation | Wrong | Right |
|-----------|-------|-------|
| Too large | "Auth system" | "Email signup", "Login", "Password reset" |
| No TRD ref | "Add nice feature" | "TRD 2.1: Users must sign up" |
| Vague criteria | "User can login" | "Session created, 401 on wrong password" |
| No ADR | "Use PostgreSQL" | ADR-002 documenting why PostgreSQL |
| Scope creep | Add to Now silently | Pause → Map → Decide → Document |

## Escalate to Human When

- TRD requirements conflict with each other
- Estimate significantly exceeds plan (timeline at risk)
- A major architectural decision is needed
- Scope of an item is unclear after reading TRD
- A new risk surfaces not captured in `status.md`
