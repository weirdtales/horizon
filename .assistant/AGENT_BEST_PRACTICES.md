# Agent Best Practices & Patterns

Proven patterns for AI agents to effectively use this template.

## Pattern 1: The TRD Deep Dive

When you receive a TRD, don't just skim it. Follow this pattern:

### **First Read: Extract Structure**
- What are the major sections?
- What's core vs. nice-to-have?
- What success metrics are defined?

### **Second Read: Find Gaps**
- What's ambiguous?
- What's missing (constraints, scalability, security)?
- What assumptions are hidden?

### **Third Read: Identify Risks**
- What requirements conflict?
- What's technically risky?
- What scope is unclear?

### **Create a TRD Summary**
```markdown
## TRD Summary

### Core Requirements
1. User authentication (email/password)
2. Note creation and editing
3. Share notes with others

### Nice-to-Have
- Rich text formatting
- Mobile app

### Ambiguities
- How many concurrent users?
- Real-time or eventual consistency?
- Maximum note size?

### Risks
- Real-time collaboration could be complex
- Scaling to 1M+ users (not in scope?)
```

**Use this summary when creating the plan.**

---

## Pattern 2: Canvas-Driven Planning

Canvas first, plan second. Pattern:

### **Vision Clarity**
Ask: "In 2 years, what does success look like?"

```markdown
# Vision

This note-taking app becomes the default choice for teams that need 
to collaborate in real-time. Used by 100K+ teams, 1M+ users, with 
99.9% uptime and sub-second collaboration latency.
```

### **Goals Specificity**
Make goals measurable:

```markdown
# Goals (6-month)

- 10K users signed up
- 1K daily active users
- 95%+ test coverage
- < 500ms note sync latency
- Zero critical security issues
```

### **Stakeholder Alignment**
Know who decides:

```markdown
# Stakeholders

- **Product Owner:** Alice (sets priorities)
- **Tech Lead:** Bob (architecture decisions)
- **Users:** Teams of 2-10 people
- **Investors:** (funding constraint?)
```

### **Open Questions Clarity**
Explicit unknowns:

```markdown
# Open Questions

- How many concurrent users in Year 1? (impacts infrastructure)
- Should we support offline-first? (architecture decision)
- What's our auth provider? (OAuth, email, SAML?)
```

**Only after canvas is aligned, create the plan.**

---

## Pattern 3: TRD-to-Backlog Tracing

Every backlog item must trace back to TRD. Use this pattern:

```markdown
## FEATURE-001: Email Signup
- **TRD Reference:** Section 2.1 - "Users sign up with email and password"
- **Acceptance Criteria:**
  - [ ] User enters email (must be valid format)
  - [ ] User enters password (8+ chars, mixed case, special char)
  - [ ] Server validates email isn't already registered
  - [ ] Confirmation email sent with verification link
  - [ ] User must click link to activate account
  - [ ] HTTP 400 on invalid input, 409 on duplicate email
```

**Check:** Can you draw a line from each criterion back to TRD text?

---

## Pattern 4: Right-Sized Backlog Items

This is the most common agent mistake. **Items are too big.**

### ❌ Wrong Size
```markdown
## FEATURE-001: Authentication System
- Acceptance Criteria: (10+ items)
```
^ This is 2-3 weeks of work. Break it down.

### ✅ Right Size
```markdown
## AUTH-001: Email Signup Form
- Acceptance Criteria: 3-4 items
- Effort: 1-2 days

## AUTH-002: Email Verification
- Acceptance Criteria: 3-4 items
- Effort: 1 day

## AUTH-003: Login with Session
- Acceptance Criteria: 3-4 items
- Effort: 1 day

## AUTH-004: Password Reset Flow
- Acceptance Criteria: 3-4 items
- Effort: 1-2 days
```

**Rule:** If an item takes > 3 days, break it into smaller pieces.

---

## Pattern 5: Acceptance Criteria Template

Use this template for consistent, testable criteria:

```markdown
## [ITEM-ID]: [Feature Name]
- **Status:** Todo / In Progress / Done
- **TRD Reference:** [Section X.Y - exact text]
- **Effort Estimate:** [1-3 days]

**Acceptance Criteria:**
- [ ] User can [do thing]
- [ ] System validates [constraint]
- [ ] Error case: [specific error with code]
- [ ] Response includes [specific data]
- [ ] Performance: [metric if applicable]

**Out of Scope:**
- [ ] [What this item does NOT include]
```

**Test:** Can a developer read this and implement without asking questions?

---

## Pattern 6: Decision-Making with ADRs

Whenever you make an architectural choice, document it immediately.

### **Decision Types That Need ADRs:**
- Technology selection (database, framework, auth provider)
- Architecture pattern (monolith, microservices, serverless)
- Data model (relational vs. document store)
- Scaling approach (horizontal vs. vertical)
- Authentication method (OAuth, JWT, session-based)

### **ADR Template:**
```markdown
# ADR-001: Database Selection

## Status
Proposed / Accepted / Deprecated

## Context
We need persistent storage for user accounts and notes.
Requirements from TRD:
- Support millions of users
- ACID transactions for payment (future)
- Real-time collaboration features

## Decision
Use PostgreSQL as our primary database.

## Rationale
- ACID guarantees match requirements
- JSON support for flexible note schemas
- Strong replication for high availability
- Team expertise with PostgreSQL

## Consequences
- Must manage database scaling ourselves (no serverless option)
- Setup/maintenance overhead
- Vertical scaling limits (won't scale to 10B+ users)

## Alternatives Considered
1. MongoDB — Better horizontal scaling, weaker ACID
2. DynamoDB — Fully managed, but expensive at scale
3. Firebase — Managed, real-time built-in, but lock-in risk
```

**Pattern:** Context → Decision → Rationale → Consequences

---

## Pattern 7: Status Updates That Matter

Don't just list what's done. Use status for health & alignment.

### ✅ Good Status Update
```markdown
# Status (2024-12-10)

## Focus
Building real-time collaboration for notes (ADR-002).
Currently: WebSocket connection and basic sync protocol.

## Risks
- WebSocket scaling: Need load balancer at 10K+ concurrent users
- Data consistency: Last-write-wins might conflict with simultaneous edits
- Action: Implementing operational transformation (OT) to handle conflicts

## Artifacts
- TRD: collaboration-requirements.md
- ADR-001: PostgreSQL choice
- ADR-002: WebSocket protocol design
- Plan: 3/15 items in NOW complete, on track
- Backlog: 2 items in progress, 1 blocked on AUTH-004 completion

## Open Questions
- How to handle offline edits? (TRD doesn't specify)
- Do we need conflict resolution UI? (test with users first?)
```

### ❌ Bad Status Update
```markdown
# Status
Did authentication work. Now doing collaboration.
5 bugs fixed. Ready for more.
```
^ Too vague, doesn't explain health or decisions.

---

## Pattern 8: Asking Good Clarifying Questions

When TRD is ambiguous, ask specific questions.

### ❌ Bad Question
"What do you want for authentication?"

### ✅ Good Question
"TRD says 'user authentication' but doesn't specify:
1. Email-only or also social login (Google, GitHub)?
2. Should we support 2FA from day 1?
3. What's the target for account creation per day?

This affects both architecture and backlog scope. What should we prioritize?"

### Pattern: Specific, Options, Impact
1. **Specific:** Which part of TRD needs clarification?
2. **Options:** What are 2-3 reasonable approaches?
3. **Impact:** How does the choice affect the plan?

---

## Pattern 9: Backlog Grooming Checklist

Before calling a backlog complete:

- [ ] Every item has TRD reference
- [ ] No item is larger than 3 days
- [ ] Each item has 3-5 acceptance criteria
- [ ] Acceptance criteria are testable
- [ ] Items don't overlap
- [ ] Dependencies are clear (which items block others?)
- [ ] Effort estimates are realistic
- [ ] Priority is clear (NOW/NEXT/LATER)
- [ ] No vague language ("implement feature X" → specific actions)

**Run this check before handing off to developers.**

---

## Pattern 10: Preventing Scope Creep

Use this pattern when new requirements appear:

1. **Pause** — Don't immediately add to backlog
2. **Map** — Is this in the TRD? (Yes/No/Ambiguous)
3. **Assess** — If new, what does it displace? (what moves to LATER?)
4. **Decide** — Human chooses priority, not you
5. **Document** — Update status.md with the decision

### Example
```
New requirement: "Add dark mode"

1. Pause — Team suggests adding dark mode
2. Map — Not in TRD, suggested by designer
3. Assess — Would take 3 days, moves feature X from NOW to NEXT
4. Decide → "Let's table this for LATER. Core collaboration first."
5. Document → Status.md: "Dark mode requested, deferred to LATER phase"
```

---

## Pattern 11: Communication with Humans

When updating humans on progress:

### Daily/Weekly Update Template
```markdown
## Progress Update

**What's Done:**
- FEATURE-001: Email signup (acceptance criteria met)
- FEATURE-002: Email verification (95% done, need SMS backup)

**What's In Progress:**
- AUTH-003: Login system (50% done, architecture finalized)

**Blockers:**
- FEATURE-004: Notes sharing (waiting on user permission model decision)

**Next 3 Days:**
- Complete login system
- Start notes CRUD
- Decision needed: Share by email link or login invite?

**Questions for You:**
- Should permissions be granular (view/edit/admin) or simple (shared/not)?
- Expected concurrent users in Month 1?
```

**Pattern:** Done → In Progress → Blockers → Next → Questions

---

## Pattern 12: Learning from Mistakes

When you make a mistake:

1. **Acknowledge** — Be explicit about what went wrong
2. **Root Cause** — Why did this happen?
3. **Fix** — What's the correction?
4. **Prevent** — How to avoid next time?

### Example
```markdown
## Mistake: Backlog Item Too Large

**What:** AUTH-001 was scoped at 5 days, should be 1-2

**Why:** I didn't break down "authentication" into sub-tasks

**Fix:** Split into:
- AUTH-001: Email signup (1 day)
- AUTH-002: Email verification (1 day)
- AUTH-003: Login (1 day)

**Prevent:** Use checklist: "Is this > 3 days? Break it down."
```

---

## Key Principles for Agent Success

1. **TRD is canonical** — When in doubt, return to TRD
2. **Small is better** — Smaller backlog items are easier to track
3. **Specific beats vague** — Use exact language, not abstractions
4. **Questions are OK** — Ask rather than assume
5. **Trace everything** — Every decision and item links back to source
6. **Document decisions** — ADRs make decisions repeatable
7. **Verify completion** — Use checklists, not just "feels done"
8. **Stay aligned** — Regular status updates catch drift early

---

## Quick Reference: Agent Checklist

- [ ] Read TRD 3 times (structure, gaps, risks)
- [ ] Ask clarifying questions for ambiguities
- [ ] Canvas filled by human, aligned on vision/goals/stakeholders
- [ ] Plan created: Now/Next/Later with TRD references
- [ ] Backlog created: small items (1-3 days), all with TRD refs
- [ ] Backlog groomed: every item has acceptance criteria
- [ ] Status.md filled: Focus, Risks, Artifacts, Questions
- [ ] ADRs created for major decisions
- [ ] Validate: Every item traces back to TRD

When done, you're ready to hand off to execution.
