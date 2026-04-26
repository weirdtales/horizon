# Agent Instructions & Guide

This guide is specifically for AI/coding agents using this template to plan and execute projects.

## Your Role as an AI Agent

You are assisting in project planning and execution using a structured, TRD-driven approach. Your job is to:

1. **Understand** the Technical Requirements Document (TRD)
2. **Clarify** project context via the Canvas
3. **Plan** work using Now/Next/Later timeline
4. **Execute** by breaking plan into backlog items
5. **Track** progress and decisions

## The TRD is Your North Star

**Everything** flows from the TRD. Before doing anything:
- [ ] Read the entire TRD carefully
- [ ] Identify core requirements vs nice-to-haves
- [ ] Flag ambiguities or missing information
- [ ] Ask clarifying questions

**Red flags to catch:**
- Conflicting requirements
- Missing scope boundaries
- Undefined success metrics
- Technical constraints not mentioned

## Canvas: Understand the Context

Help the human complete these files:
- **vision.md** — What success looks like in 12 months
- **goals.md** — Specific, measurable objectives for this project
- **stakeholders.md** — Who benefits? Who decides? Who builds?
- **questions.md** — What don't we know yet?

**Your job:** Ask probing questions to fill gaps. Don't assume.

## Plan: Map Requirements to Timeline

Create `plan.md` with three sections:

### **NOW (This Sprint/Week)**
- What can realistically be done first?
- What's blocking other work?
- What validates the core idea?
- Typically 3-5 items

### **NEXT (Coming Up)**
- What depends on NOW being done?
- What's medium-term value?
- Typically 5-8 items

### **LATER (Future)**
- What's lower priority or dependent?
- What's nice-to-have?
- Typically 5-10 items

**Rules:**
- Every item should trace back to TRD section
- Be specific (not "authentication" but "implement login with email/password")
- Estimate effort (1-3 days for NOW items)

## Backlog: Granular, Actionable Work

Create `backlog.md` from your plan. Each item must have:

```markdown
## FEATURE-001: User Email Signup
- **Status:** Todo / In Progress / Done
- **TRD Reference:** Section 2.1 - User Authentication
- **Priority:** High
- **Effort Estimate:** 2 days
- **Acceptance Criteria:**
  - [ ] User can enter email and password
  - [ ] Email validation happens before signup
  - [ ] Confirmation email is sent
  - [ ] User receives 401 if email already exists
  - [ ] Passwords meet security requirements (8+ chars, mixed case)
```

**Critical rules for agents:**
- [ ] Every item has a TRD reference
- [ ] Acceptance criteria are testable
- [ ] Item scope is 1-3 days of work
- [ ] No item is vague (avoid "implement auth" — too broad)
- [ ] Items don't overlap

## Status: Track Current Health

Update `status.md` with:

### **Focus**
What are you working on RIGHT NOW? Be specific.
```
Currently: Designing authentication system based on TRD section 2.1
```

### **Risks**
What could go wrong? How likely?
```
- Authentication service vendor rate limits (Medium risk)
- Database scaling with many users (Low risk, addressed in TRD)
```

### **Artifacts**
What key documents exist?
```
- TRD: authentication.md
- ADR-001: Database choice (PostgreSQL)
- Plan: plan.md (Now/Next/Later)
- Backlog: backlog.md (11 items, 3 done)
```

### **Open Questions**
What's not decided yet?
```
- Should we support OAuth or email-only? (TRD ambiguous)
- How many concurrent users expected? (Impacts scaling)
```

## Decisions: Use ADRs

When making architectural choices, create an ADR (Architecture Decision Record):

**File:** `.assistant/adr/ADR-001-[decision-name].md`

**Format:**
```markdown
# ADR-001: Database Choice

## Status
Accepted

## Context
TRD requires persistent user storage with user authentication. We need:
- Fast lookups by email
- Support for millions of users
- Transaction support for payment processing

## Decision
We will use PostgreSQL as our primary database.

## Rationale
1. Proven reliability at scale
2. Strong ACID transaction support (needed for payments)
3. Excellent JSON support for flexible schemas
4. Team experience with PostgreSQL

## Consequences
- Setup time for database administration
- Need to manage backups and scaling
- No native horizontal scaling (must shard later if needed)
```

**When to create ADRs:**
- Choosing technology stack
- Picking authentication strategy
- Deciding data storage approach
- Making architectural tradeoffs
- Resolving conflicting requirements

**Always:** Reference the ADR in status.md when it affects current focus.

## Validation Checklist for Agents

Before declaring a phase complete, verify:

### **Planning Phase Complete?**
- [ ] TRD thoroughly understood (ask 5+ clarifying questions)
- [ ] Canvas files have substance (not placeholder content)
- [ ] Plan has Now/Next/Later with specific items
- [ ] Backlog created with TRD references for every item
- [ ] Status.md filled with Focus, Risks, Artifacts, Open Questions
- [ ] Every backlog item has acceptance criteria
- [ ] No backlog item is vague or too large

### **Backlog Item Ready to Work?**
- [ ] Has TRD reference
- [ ] Has acceptance criteria (all testable)
- [ ] Is small enough for 1-3 days work
- [ ] Doesn't duplicate other items
- [ ] Dependencies are clear

### **Decision Well-Made?**
- [ ] ADR created for major choices
- [ ] Rationale explains "why" not just "what"
- [ ] Consequences are realistic
- [ ] Referenced in status.md

## Common Agent Mistakes to Avoid

❌ **Don't:**
- Skip reading the TRD thoroughly
- Create backlog without TRD references
- Make items too large (full "authentication" instead of "email signup")
- Forget acceptance criteria on items
- Make architectural decisions without ADRs
- Assume context — ask instead

✅ **Do:**
- Ask clarifying questions when TRD is ambiguous
- Make backlog items small and specific
- Every item traces back to TRD
- Document decisions in ADRs
- Update status.md regularly
- Keep canvas aligned with reality

## When to Ask Clarifying Questions

Ask the human when:
- TRD is vague on requirements
- Timeline assumptions differ from reality
- Success metrics aren't defined
- Stakeholder roles aren't clear
- Technical constraints aren't specified
- Priority conflicts exist

**Example good question:**
"The TRD mentions 'user authentication' but doesn't specify if we support social login (Google, GitHub) or email-only. What's the requirement?"

## Red Flags for Scope Creep

Stop and ask before proceeding:
- "This requirement wasn't in the TRD — where should it go?"
- "This adds 2 weeks to NOW — move to NEXT?"
- "This requires a decision we haven't made — create ADR?"
- "This conflicts with earlier decision — escalate?"

## Example Workflow

### Step 1: Analyze TRD
```
Human provides: "Build a note-taking app with collaboration"
Agent reads TRD carefully, identifies:
- Core: Notes, real-time collaboration, user accounts
- Out of scope: Mobile app, offline mode
- Ambiguous: How many concurrent users? How large can notes be?
```

### Step 2: Ask Clarifying Questions
```
Agent asks:
1. Expected users in first 6 months? (impacts architecture)
2. Must edits be real-time or eventual consistency OK?
3. Maximum note size?
4. Who are the stakeholders/decision makers?
```

### Step 3: Complete Canvas
```
Agent helps fill:
- vision.md: Where will note-taking be in 2 years?
- goals.md: What does success look like in 3 months?
- stakeholders.md: Who's building, who's using?
- questions.md: Remaining unknowns
```

### Step 4: Create Plan
```
Agent maps TRD to Now/Next/Later:
NOW:
- User signup/login (TRD 2.1)
- Basic note CRUD (TRD 3.1)
- Database schema (enables all above)

NEXT:
- Real-time collaboration (TRD 2.3)
- Rich text editing (TRD 3.2)

LATER:
- Mobile app (out of scope but noted)
- Performance optimization
```

### Step 5: Create Backlog
```
Agent creates granular items:
- AUTH-001: Email signup with validation
- AUTH-002: Email login with session
- NOTE-001: Create note endpoint
- NOTE-002: List user's notes
- COLLAB-001: Real-time websocket connection
(etc.)
```

### Step 6: Track & Decide
```
Agent creates status.md:
- Focus: Building user authentication
- Risks: Email service reliability
- Artifacts: TRD, plan.md, backlog.md, ADR-001-auth-strategy
- Questions: How to handle 2FA? (ask human)
```

## Key Philosophy for Agents

1. **TRD-driven** — Everything must trace back
2. **Specific** — Not "implement auth" but "email signup with validation"
3. **Small** — Backlog items are 1-3 days work, not weeks
4. **Traceable** — Every decision has ADR, every backlog item has TRD ref
5. **Verified** — Use checklists, don't assume

When in doubt, ask the human. Better to clarify than build wrong thing.
