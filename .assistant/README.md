# Project Assistant Workspace

This is your AI-assisted project workspace. It contains all project planning, tracking, and decision documentation.

## Directory Structure

### `trd/` — Technical Requirements
- **Purpose:** Store Technical Requirements Documents from ChatGPT
- **Files:** `.md` files, one per major requirement or system component
- **When:** Created at project start, reference throughout
- **Example:** `authentication.md`, `payment-system.md`, `api-design.md`

### `canvas/` — Project Context & Alignment
- **Purpose:** Clarify vision, goals, stakeholders before building
- **Files:**
  - `vision.md` — Long-term vision and success state
  - `goals.md` — Specific, measurable objectives
  - `stakeholders.md` — Who's involved and their roles
  - `questions.md` — Open questions and unknowns
  - `ideas.md` — Brainstorming and inspiration
  - `notes.md` — General project notes and observations
- **When:** Created during planning phase, reference when aligning team

### `prompts/` — AI Assistant Prompts
- **Purpose:** Consistent prompts for different project phases
- **Files:**
  - `project_startup.md` — Project initialization guidance
  - `kickoff.md` — Work session startup prompt
  - `end_session.md` — Work session closure prompt
  - `migration.md` — Deployment/migration guidance
- **When:** Used via `make` commands, pasted into AI assistant

### `adr/` — Architecture Decision Records
- **Purpose:** Document the "why" behind technical choices
- **Format:** One `.md` file per decision
  - Status (Proposed, Accepted, Deprecated)
  - Context (Why this decision?)
  - Decision (What did we choose?)
  - Consequences (Tradeoffs and impacts)
- **When:** Created when making significant architectural choices
- **Example:** `ADR-001-database-postgresql.md`, `ADR-002-auth-oauth.md`

### `plan.md` — Project Roadmap
- **Purpose:** Map vision to executable timeline
- **Format:**
  ```
  ## Now (This Sprint/Week)
  - Work item A
  - Work item B

  ## Next (Coming Up)
  - Work item C
  - Work item D

  ## Later (Future)
  - Work item E
  ```
- **When:** Created during planning, updated weekly
- **Owner:** Product/Project lead

### `backlog.md` — Work Items & Acceptance Criteria
- **Purpose:** Granular tasks derived from plan and TRD
- **Format:**
  ```
  ## FEATURE-001: User Authentication
  - Status: Todo / In Progress / Done
  - TRD Reference: TRD section X
  - Priority: High
  - Acceptance Criteria:
    - [ ] Users can sign up
    - [ ] Users can reset password
    - [ ] Sessions persist 24 hours
  ```
- **When:** Created during planning, updated daily
- **Owner:** Development team
- **Note:** Every item should trace back to TRD requirement

### `status.md` — Project Health Snapshot
- **Purpose:** Current state of project at a glance
- **Sections:**
  - **Focus** — What are we working on now?
  - **Risks** — What could go wrong?
  - **Artifacts** — Key documents and deliverables
  - **Open Questions** — Unresolved decisions
  - **Recent Changes** — What changed since last update?
- **When:** Updated after each work session
- **Owner:** Project lead
- **Use:** `make review` to view quickly

### `history.md` — Session Log & Decisions
- **Purpose:** Record of sessions, decisions, and learning
- **Format:**
  ```
  ## Session 2024-12-10
  - **Decisions Made:**
    - Chose PostgreSQL over MongoDB (see ADR-003)
    - Decided to use OAuth for auth
  - **Work Completed:**
    - Implemented user authentication module (FEATURE-001)
    - Set up database schema
  - **Issues Found:**
    - Performance issue with image processing
  - **Next Session Focus:**
    - Optimize image processing
    - Begin payment integration
  ```
- **When:** Updated at end of each work session
- **Owner:** Development team
- **Note:** This survives team changes and provides continuity

### `task_log.md` — Completed Work Tracker
- **Purpose:** Visible record of what's been completed
- **Format:**
  ```
  - 2024-12-10: Completed user authentication (FEATURE-001)
  - 2024-12-09: Set up database schema
  - 2024-12-08: Created project structure and planning docs
  ```
- **When:** Updated when tasks complete
- **Owner:** Development team
- **Use:** `make show-completed` to view

### `assistant.yaml` — Configuration (Optional)
- **Purpose:** Configuration for any project assistants
- **When:** Created if using assistant tools
- **Note:** Can be extended as project grows

### `backlog.md`, `plan.md`, `status.md`, `history.md` — Version Control
- **Recommendation:** Commit these frequently
- **Reason:** Tracks decision history and project evolution
- **Pattern:** One commit per session/decision

## Workflow: How These Files Connect

```
START
  │
  ├─ TRD/ (What to build)
  │  └─ Informs
  │
  ├─ Canvas/ (Why we're building it)
  │  └─ Guides
  │
  ├─ Plan.md (Timeline)
  │  └─ Breaks into
  │
  ├─ Backlog.md (Tasks)
  │  └─ Updated during
  │
  ├─ Sessions
  │  ├─ Updates
  │  │  ├─ status.md (Health)
  │  │  ├─ history.md (Decisions)
  │  │  └─ task_log.md (Completion)
  │  └─ Creates
  │     └─ ADR/ (Decision rationale)
  │
  └─ Archive (Final state)
```

## Using This Workspace

### Quick View
- `make trd` — List TRD files
- `make review` — Check status (top of status.md)
- `make audit-docs` — See which docs exist
- `make show-completed` — View completed tasks

### Planning
- Create canvas files for alignment
- Create plan.md with Now/Next/Later
- Create backlog.md from plan
- Create status.md with current state

### Development
- Each session: `make session-start`
- Work on backlog items
- Update status.md, history.md, task_log.md
- Each session end: `make session-end`

### Decisions
- Create ADR when making architectural choice
- Record decision in history.md
- Reference ADR in status.md if it impacts current focus

## Best Practices

1. **Keep documents in sync** — Don't let backlog drift from status
2. **Update status daily** — Catch issues early
3. **Log decisions** — Future you will thank you
4. **Reference TRD often** — It's your north star
5. **Use canvas for alignment** — Especially with stakeholders
6. **Mark tasks complete** — Visibility into progress
7. **Commit frequently** — Preserve decision history
8. **Review weekly** — Via `make review`

## File Update Frequency

| File | Update Frequency | When |
|------|------------------|------|
| TRD/ | Once (rarely) | Project start |
| Canvas/ | During planning | Planning phase |
| Plan.md | Weekly | After standup/planning |
| Backlog.md | Daily | During development |
| Status.md | Per session | End of each session |
| History.md | Per session | End of each session |
| Task_log.md | Per completion | When task finishes |
| ADR/ | Per decision | When decision made |

## Getting Help

- See `../README.md` for overview
- See `../TEMPLATE_GUIDE.md` for philosophy
- See `../WORKFLOW.md` for full workflow
- See `../SETUP_CHECKLIST.md` for onboarding
- Run `make help` for command reference
