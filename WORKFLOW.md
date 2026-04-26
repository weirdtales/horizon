# Complete Workflow

## Phase 1: Planning (Days 1-2)

```
START
  │
  ├─ Generate TRD in ChatGPT
  │  └─ Download .md file
  │  └─ Save to .assistant/trd/
  │
  ├─ Run: make init
  │  └─ Verify environment and structure
  │
  ├─ Run: make project-start
  │  └─ Review startup prompts
  │
  ├─ Fill Canvas Files (.assistant/canvas/)
  │  ├─ vision.md — What are we building?
  │  ├─ goals.md — Why? What success looks like?
  │  ├─ stakeholders.md — Who's involved?
  │  ├─ questions.md — What don't we know?
  │  ├─ ideas.md — Brainstorming
  │  └─ notes.md — General notes
  │
  ├─ Run: make planning
  │  └─ Full planning workflow review
  │
  ├─ Create .assistant/plan.md
  │  └─ Map TRD requirements to Now/Next/Later
  │
  ├─ Create .assistant/backlog.md
  │  └─ Break plan into granular tasks with acceptance criteria
  │
  ├─ Create .assistant/status.md
  │  └─ Set initial Focus, Risks, Artifacts, Open Questions
  │
  ├─ Optional: Create ADR stubs (.assistant/adr/)
  │  └─ For major technical decisions
  │
  ├─ Run: make planning-checklist
  │  └─ Verify all planning artifacts exist
  │
  └─ Run: make requirements-review
     └─ Cross-reference TRD with backlog
```

**Output:** Ready to start development with clear plan

---

## Phase 2: Development (Iterative)

```
FOR EACH WORK SESSION:

  ┌─────────────────────────────────────┐
  │ SESSION START                       │
  │                                     │
  ├─ Run: make session-start            │
  │  └─ Review kickoff prompts          │
  │                                     │
  ├─ Run: make review                   │
  │  └─ Check current status            │
  │                                     │
  └─ Copy kickoff into ChatGPT          │
     (Provide context for AI assistant) │
  │                                     │
  ├─ WORK                               │
  │  ├─ Code implementation             │
  │  ├─ Tests                           │
  │  ├─ Documentation                   │
  │  └─ Update status.md as you go      │
  │                                     │
  ├─ TRACK                              │
  │  ├─ Update backlog.md (mark done)   │
  │  ├─ Update history.md (decisions)   │
  │  └─ Update task_log.md (complete)   │
  │                                     │
  │ SESSION END                         │
  │                                     │
  ├─ Run: make session-end              │
  │  └─ Review closure prompts          │
  │                                     │
  ├─ Copy end session into ChatGPT      │
  │  └─ Provide end-of-session context  │
  │                                     │
  └─ Commit & push                      │
     (Backlog, history, status updates) │
  └─────────────────────────────────────┘
       │
       ├─ More work? → Loop back to SESSION START
       │
       └─ Done? → Continue to Phase 3
```

**Ongoing:**
- `make audit-docs` — Verify all docs kept up-to-date
- `make show-completed` — View progress
- `make list-decisions` — Check architectural decisions

---

## Phase 3: Deployment/Migration

```
DEPLOYMENT READY
  │
  ├─ Run: make migration
  │  └─ Review migration prompts
  │
  ├─ Copy migration prompts into ChatGPT
  │  └─ Get deployment guidance
  │
  ├─ Execute migration steps
  │
  ├─ Update status.md
  │  └─ Note deployment completion
  │
  └─ Archive session
     └─ Commit final state
```

---

## Command Reference by Phase

### PLANNING PHASE
```bash
make init                   # Full initialization check
make project-start          # Start planning
make planning               # Planning workflow
make planning-checklist     # Verify planning artifacts
make requirements-review    # Cross-ref TRD to backlog
make trd                    # List TRD files
```

### DEVELOPMENT PHASE
```bash
make session-start          # Start work session
make session-end            # End work session
make review                 # Quick status check
make audit-docs             # Verify docs are up-to-date
make show-completed         # View completed tasks
make list-decisions         # View architectural decisions
```

### OPERATIONS PHASE
```bash
make migration              # Handle migrations/deployments
```

### UTILITY
```bash
make help                   # Show all commands
make verify-env             # Check environment
```

---

## Documentation Flow

```
TRD (ChatGPT)
  ↓
Canvas (Clarify context)
  ↓
Plan (Map timeline)
  ↓
Backlog (Granular tasks)
  ↓
[DEVELOPMENT LOOP]
  ├─ Code implementation
  ├─ Update status.md
  ├─ Update history.md
  ├─ Mark tasks complete in backlog
  └─ Update task_log.md
  ↓
Status (Track health)
  ↓
History (Log decisions)
  ↓
ADR (Document "why")
```

---

## Checklist for New Project

- [ ] TRD generated and saved to `.assistant/trd/`
- [ ] `make init` passes
- [ ] Canvas files created (vision, goals, stakeholders, questions)
- [ ] `plan.md` created with Now/Next/Later
- [ ] `backlog.md` created from TRD requirements
- [ ] `status.md` created with Focus, Risks, Artifacts, Questions
- [ ] `make planning-checklist` shows all green ✓
- [ ] Ready for first `make session-start`

---

## Tips

1. **Keep TRD in front:** Reference it during planning and development
2. **Update status daily:** Catch issues early
3. **Log decisions:** Future you will thank you
4. **Mark tasks complete:** Visibility into progress
5. **Review canvas often:** Stay aligned on vision
6. **Use ADRs for design:** Explains why not just what
