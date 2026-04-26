# Agent Guardrails & Red Lines

This document defines what agents should NOT do when using this template. These are hard constraints to maintain quality.

## The Hard Rules

### ❌ Rule 1: Never Skip the Canvas Phase

**What agents must NOT do:**
- Create a plan before canvas is complete
- Assume context without asking stakeholders
- Proceed with unclear vision/goals
- Skip the "open questions" document

**Red flag:** "The TRD is clear enough, let's start planning"

**Why:** Canvas clarifies assumptions early. Skipping it leads to building the wrong thing.

**Exception:** None. Canvas is mandatory.

---

### ❌ Rule 2: Never Create Backlog Without TRD References

**What agents must NOT do:**
- Add backlog items not in the TRD
- Reference TRD section without quoting exact text
- Create backlog items without justifying why they're needed
- Include items from canvas/brainstorming without TRD anchor

**Red flag:** "This would be nice to have" (if not in TRD, it's LATER, not NOW)

**Why:** TRD is the source of truth. Every item must trace back.

**Exception:** Bug fixes discovered during development can bypass TRD if they fix critical issues.

---

### ❌ Rule 3: Never Create Backlog Items Larger Than 3 Days

**What agents must NOT do:**
- Create "Authentication System" as one item (break it down)
- Make items so vague they take 1+ weeks
- Combine unrelated work into one task
- Skip breaking down large items because "we'll figure it out"

**Red flag:** 
- "This item has 10+ acceptance criteria"
- "Effort estimate is 1-2 weeks"
- "Can't break this down further"

**Why:** Large items are harder to track and estimate. Small items are predictable.

**How to fix:**
```
❌ AUTH: Build authentication system
✅ AUTH-001: Email signup form (2 days)
✅ AUTH-002: Email verification (1 day)
✅ AUTH-003: Login flow (2 days)
✅ AUTH-004: Password reset (1.5 days)
```

**Exception:** None. Always break down to 1-3 days.

---

### ❌ Rule 4: Never Skip Acceptance Criteria

**What agents must NOT do:**
- Create items without acceptance criteria
- Write vague acceptance criteria ("user can login")
- Write non-testable criteria ("system is secure")
- Have fewer than 3 criteria per item

**Red flag:**
- "Acceptance Criteria: Let developer figure it out"
- "User can do the thing"
- "No errors"

**Why:** Without clear criteria, you don't know when work is done.

**How to fix:**
```
❌ User can login
✅ User enters email and password
✅ Server validates credentials against database
✅ Session created with 24h expiration
✅ User can access protected endpoints with session cookie
```

**Exception:** None. Every item must have 3+ testable criteria.

---

### ❌ Rule 5: Never Make Architectural Decisions Without ADRs

**What agents must NOT do:**
- Choose database without documenting why
- Pick authentication method without considering alternatives
- Make technology choices without rationale
- Decide scaling approach without explaining tradeoffs

**Red flag:**
- "Let's use PostgreSQL"
- No ADR documenting this decision
- Team finds out later they'd have preferred MongoDB

**Why:** ADRs explain "why" for future developers. Decisions without rationale cause rework.

**What counts as an ADR-worthy decision:**
- Technology stack (framework, database, queue)
- Architecture pattern (monolith, microservices, serverless)
- Authentication method
- Data model (relational, document)
- Scaling approach

**What doesn't need an ADR:**
- Naming conventions (camelCase vs. snake_case)
- Code formatting
- UI component choices (usually)

**Exception:** Minor decisions can skip ADR if documented in code comments, but major ones always need ADR.

---

### ❌ Rule 6: Never Assume Context - Always Ask

**What agents must NOT do:**
- Guess at unclear requirements
- Proceed without asking for clarification
- Make assumptions about success metrics
- Assume stakeholder priorities

**Red flag:**
- "I think this means..."
- "Probably should..."
- "I'll decide" (when human hasn't decided)

**Why:** Assumptions waste time. One clarifying question saves days of rework.

**When to ask:**
- TRD is ambiguous (multiple interpretations possible)
- Success metrics undefined (what does "fast" mean?)
- Stakeholder roles unclear (who decides, who builds?)
- Timeline assumptions missing (3 months or 3 weeks?)

**Exception:** None. Ask when in doubt.

---

### ❌ Rule 7: Never Update Plan/Status Without Noting Changes

**What agents must NOT do:**
- Change plan dates without documenting why
- Update status without explaining what changed
- Move items between Now/Next without justification
- Skip the "recent changes" section

**Red flag:**
- Plan changed but no note explaining why
- Status says "on track" but risks increased
- Timeline slipped 2 weeks, no explanation

**Why:** Without change history, stakeholders get confused. Documentation prevents surprise slips.

**How to fix:**
```
✅ Plan Change (2024-12-10):
   Moved AUTH-005 (2FA) from NOW to LATER
   Reason: Security not required until Year 2 per product meeting
   Impact: Frees 2 days, lets us add SHARE-001 to NOW
```

**Exception:** None. Always document changes.

---

### ❌ Rule 8: Never Create Open Questions That Stay Open

**What agents must NOT do:**
- Leave ambiguities in TRD unaddressed
- Not ask for clarification on conflicting requirements
- Assume answers to design questions
- Proceed without resolving blocking questions

**Red flag:**
- Open Questions list has items > 2 weeks old
- Question is relevant to NOW work but unresolved
- "We'll figure this out during development"

**Why:** Unresolved questions become development blockers.

**How to fix:**
```
❌ Question: How many concurrent users?
   Status: Unresolved since Nov 15
   Blocker for: Scaling decisions

✅ Question: How many concurrent users?
   Status: Clarified Nov 20
   Answer: 1,000 concurrent Year 1 (from product)
   Impact: Single DB instance sufficient, re-partition in Year 2
```

**Exception:** Questions deferred to LATER can stay open if not blocking NOW.

---

### ❌ Rule 9: Never Let Scope Creep Into Now

**What agents must NOT do:**
- Add requirements not in TRD to NOW phase
- Let feature requests bypass planning process
- Move items into NOW without re-estimating impact
- Agree to "quick adds" that derail timeline

**Red flag:**
- "Can we also add..."
- "This is just a small thing"
- "Shouldn't take more than an hour"

**Why:** NOW is tight. Adding items either breaks timeline or squeezes quality.

**How to handle:**
```
Request: "Can we add dark mode?"

1. Pause — Don't add immediately
2. Assess — Not in TRD, ~3 days effort
3. Ask — "What should this displace from NOW?"
4. Decide — Human chooses: skip dark mode or move feature X to NEXT
5. Document — Status.md: "Dark mode requested, deferred to LATER"
```

**Exception:** Bug fixes that block development can be added. Feature requests go to LATER.

---

### ❌ Rule 10: Never Proceed With Ambiguous Backlog Items

**What agents must NOT do:**
- Hand off backlog items to developers when criteria are vague
- Use jargon instead of specifics
- Leave items open to interpretation

**Red flag:**
- "Improve performance"
- "Make more user-friendly"
- "Handle edge cases"

**How to fix:**
```
❌ NOTE-002: Improve note list performance
✅ NOTE-002: List notes with pagination
   - [ ] Endpoint returns max 20 notes per request
   - [ ] Supports ?page=1&limit=20 parameters
   - [ ] Response includes total count and page number
   - [ ] Query completes in < 500ms for 1M+ notes
```

**Exception:** None. Be specific.

---

## Escalation Rules

**When to escalate to human:**

1. **TRD is contradictory** — Two requirements conflict
2. **Timeline at risk** — Estimate significantly different from plan
3. **Major decision needed** — Database choice, architecture, scaling
4. **Scope unclear** — Can't determine if item is in scope
5. **Risk discovered** — New risk not in status.md

**How to escalate:**
```markdown
⚠️ **ESCALATION NEEDED**

Issue: TRD says "real-time" but real-time can mean:
- A) Live edits sync within 100ms (high complexity)
- B) Edits sync within 5s (low complexity)

Impact: Option A requires WebSocket + OT (5 days)
        Option B requires polling (1 day)

Recommendation: Clarify with product team

Blocking: Plan can't be finalized without this decision
```

---

## Validation Checklist Before Handing Off

Before an agent declares planning complete:

### Planning Phase Complete?
- [ ] TRD read and understood (ask 5+ questions if ambiguous)
- [ ] Canvas completed (vision, goals, stakeholders, questions all filled)
- [ ] Plan created with Now/Next/Later
- [ ] Every plan item traces to TRD section
- [ ] Backlog created with all items 1-3 days
- [ ] Every backlog item has TRD reference
- [ ] Every backlog item has 3+ acceptance criteria
- [ ] Status.md filled with Focus, Risks, Artifacts, Questions
- [ ] ADRs created for all major decisions (auth, database, etc.)
- [ ] No backlog item uses vague language
- [ ] No open questions blocking NOW
- [ ] All questions raised, not left unresolved

### Backlog Item Ready to Code?
- [ ] Item size: 1-3 days (not larger)
- [ ] Has TRD reference (exact quote from TRD)
- [ ] Has 3+ testable acceptance criteria
- [ ] Criteria doesn't assume developer knowledge
- [ ] Dependencies clear (what blocks this? what does this unblock?)
- [ ] No overlapping items

### Decision Well Made?
- [ ] Major decision? (database, auth, architecture)
- [ ] ADR exists and documents rationale
- [ ] Alternatives considered
- [ ] Consequences listed
- [ ] Status clear (Proposed/Accepted/Deprecated)

---

## Common Violations & How to Fix

| Violation | Bad | Good |
|-----------|-----|------|
| Too large | "Auth system" | "Email signup", "Email verify", "Login" |
| No TRD ref | "Add nice feature" | "TRD 2.1: Users must sign up" |
| Vague criteria | "User can login" | "User enters email/password, server validates, session created" |
| No decision docs | "Use PostgreSQL" | "ADR-002: Why PostgreSQL over MongoDB" |
| Ambiguous | "Handle edge cases" | "Return 400 if email invalid, 409 if duplicate" |
| Unresolved question | "TBD: real-time approach" | "Decision made: WebSocket + OT, documented in ADR-003" |
| Scope creep | "Add feature X to NOW" | "Feature X deferred to LATER, document in status.md" |
| Stale status | "Status last updated Oct" | "Status updated after each sprint" |

---

## Red Line Summary

**Never:**
1. Skip canvas
2. Create backlog without TRD refs
3. Make items > 3 days
4. Skip acceptance criteria
5. Make major decisions without ADRs
6. Assume context (ask instead)
7. Update without documenting changes
8. Leave open questions unresolved
9. Let scope creep into NOW
10. Proceed with vague items

**If you're about to violate one of these, escalate instead.**
