# Template Philosophy & Structure Guide

## Why This Structure?

This template is built on several key principles:

### 1. **TRD-First Development**
- All planning starts from a Technical Requirements Document
- Generated in ChatGPT for clarity and structure
- Stored in `.assistant/trd/` for easy reference and versioning
- Prevents building the wrong thing

### 2. **Canvas Pattern for Context**
- Before planning, clarify the context
- Canvas files answer: Who? What? Why? What questions?
- Lives in `.assistant/canvas/` with separate files for each dimension
- Creates shared understanding across team

### 3. **Decision Tracking with ADRs**
- Architecture Decision Records capture the "why" behind technical choices
- Stored in `.assistant/adr/` as they're made
- Future team members understand context and rationale
- Prevents repeating the same debates

### 4. **Session-Based Documentation**
- Each work session is logged
- History.md captures decisions and progress
- Task_log.md tracks completed work
- Creates accountability and continuity

### 5. **Status Transparency**
- Current project health always visible in status.md
- Includes: Focus, Risks, Artifacts, Open Questions
- Quick check-in point (via `make review`)
- Prevents surprises and misalignment

### 6. **Executable Planning**
- Plan.md maps to actual work (Now/Next/Later)
- Backlog.md contains granular tasks with acceptance criteria
- Every task links back to TRD requirements
- Prevents feature creep and scope drift

## Key Files & Their Purpose

### `.assistant/trd/`
**What:** Technical Requirements Documents from ChatGPT  
**Why:** Single source of truth for what to build  
**When:** Created before planning, referenced throughout  
**Example:** "User authentication system", "Payment processing"

### `.assistant/canvas/`
**What:** Project context and stakeholder alignment  
**Contains:**
- `vision.md` — Long-term vision
- `goals.md` — Specific, measurable objectives
- `stakeholders.md` — Who's involved and why
- `questions.md` — Unknowns and open questions
- `ideas.md` — Brainstorming and inspiration
- `notes.md` — General project notes

**Why:** Creates shared understanding before design  
**When:** Filled early in planning phase

### `.assistant/prompts/`
**What:** AI prompts for different project phases  
**Contains:**
- `project_startup.md` — Project initialization prompt
- `kickoff.md` — Session startup prompt
- `end_session.md` — Session closure prompt
- `migration.md` — Deployment/migration prompt

**Why:** Consistent AI guidance across phases  
**When:** Referenced via `make` commands

### `.assistant/adr/`
**What:** Architecture Decision Records  
**Format:** Markdown files with decisions and rationale  
**Why:** Explains technical choices for future developers  
**When:** Created whenever making significant decisions

### `.assistant/plan.md`
**What:** Project roadmap organized by timeline  
**Format:**
```
## Now (This Sprint/Week)
- Feature A
- Bug fix B

## Next (Coming Up)
- Feature C
- Infrastructure D

## Later (Future Consideration)
- Feature E
- Performance optimization
```

**Why:** Maps vision to executable timeline  
**When:** Created after TRD review, updated weekly

### `.assistant/backlog.md`
**What:** Detailed work items with acceptance criteria  
**Format:**
```
## FEATURE-001: User Authentication
- Status: Todo
- TRD Reference: TRD requires user authentication
- Acceptance Criteria:
  - Users can sign up with email
  - Users can reset password
  - Sessions persist for 24 hours
```

**Why:** Granular tasks from high-level plan  
**When:** Created during planning, updated as work progresses

### `.assistant/status.md`
**What:** Current project health snapshot  
**Contains:**
- **Focus:** What we're working on now
- **Risks:** What could go wrong
- **Artifacts:** Key documents and deliverables
- **Open Questions:** Unresolved decisions
- **Recent Changes:** What changed since last update

**Why:** Quick reference for project state  
**When:** Updated after each session

### `.assistant/history.md`
**What:** Session notes and decision log  
**Format:**
```
## Session 2024-12-10
- Decided to use PostgreSQL over MongoDB (see ADR-003)
- Completed user authentication module
- Identified performance issue with image processing
```

**Why:** Continuity between team members and sessions  
**When:** Updated at end of each session

### `.assistant/task_log.md`
**What:** Completed work tracker  
**Format:**
```
- 2024-12-10: Completed user authentication (FEATURE-001)
- 2024-12-09: Set up database schema
- 2024-12-08: Created project structure
```

**Why:** Visibility into progress  
**When:** Updated when tasks complete

## Workflow Dependencies

```
TRD (ChatGPT)
    ↓
Canvas (Context)
    ↓
Plan.md (Now/Next/Later)
    ↓
Backlog.md (Granular tasks)
    ↓
Status.md (Current health)
    ↓
History.md (Decisions & progress)
    ↓
ADR.md (Why we chose X)
```

Each layer depends on understanding the previous layer.

## Benefits

1. **Clarity:** TRD-first prevents scope creep
2. **Accountability:** Every decision documented
3. **Continuity:** History survives team changes
4. **Speed:** Templates reduce setup time
5. **Quality:** Canvas pattern catches misalignment early
6. **Flexibility:** Modular structure adapts to project needs

## When to Update Each File

| File | When | Frequency |
|------|------|-----------|
| TRD | Start of project | Once, rarely updated |
| Canvas | During planning | During planning phase |
| Plan | After planning | Weekly |
| Backlog | During planning, continuously | As work progresses |
| Status | End of session | After each session |
| History | End of session | After each session |
| Task Log | When task completes | Per completed task |
| ADR | When making decisions | As needed |
