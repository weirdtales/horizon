# Example Status Document

This is an example `status.md` for a note-taking app in progress. Use this as a template.

## Project: Note-Taking App with Real-Time Collaboration

**Last Updated:** 2024-12-10  
**Sprint:** 1 of 3 (Week 2 of 14)  
**Overall Progress:** 25% (auth + basic CRUD in progress)

---

## Focus

**Current Phase:** Sprint 1 - Core Authentication & CRUD

We are building the authentication foundation and basic note CRUD operations. This unblocks all collaborative features.

**What we're working on THIS WEEK:**
- AUTH-001: Email signup (70% done, password validation complete)
- AUTH-002: Email verification (in progress, mail service integration)
- NOTE-001: Create note endpoint (queued, waiting for AUTH-002)

**Completed THIS WEEK:**
- Database schema finalized (users, notes, sharing tables)
- Authentication ADR (ADR-001: Email/password + sessions)
- Password hashing implementation tested

---

## Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| Email service rate limits | Medium | High | Switch to SendGrid (currently dev-only) |
| Session cookie security issues | Low | Critical | Code review before AUTH-003, add security tests |
| Database scaling with 1M+ users | Low (future) | High | Addressed in ADR-002, partition strategy ready |
| Scope creep on "collaboration" | Medium | High | Stay strict to TRD, LATER all nice-to-haves |
| Team underestimated auth complexity | Medium | Medium | Adjust timeline if AUTH-003 runs long |

**Action Items:**
- [ ] Set up production email service (Sendgrid/SendinBlue)
- [ ] Code review security checklist before AUTH-003
- [ ] Weekly timeline check-in (Wednesday)

---

## Artifacts

**TRD & Planning:**
- `.assistant/trd/` — Note-taking app requirements
  - `core-features.md` — User auth, notes, sharing
  - `collab-requirements.md` — Real-time editing
  - `scale-requirements.md` — 1M+ users, 99.9% uptime
  
**Architecture Decisions:**
- `ADR-001-auth-strategy.md` — Email/password + sessions
- `ADR-002-database-choice.md` — PostgreSQL
- `ADR-003-realtime-protocol.md` — WebSocket + OT

**Planning:**
- `.assistant/plan.md` — Sprint breakdown (NOW/NEXT/LATER)
- `.assistant/backlog.md` — 20 items (3 in progress, 17 queued)

**Tracking:**
- `.assistant/history.md` — Session notes (5 entries so far)
- `.assistant/task_log.md` — Completed tasks
  - Infra-001: Database schema ✓
  - AUTH infrastructure setup ✓

---

## Open Questions

**Questions we're still resolving:**

1. **TRD Ambiguity: 2FA Support?**
   - TRD Section 2.1 doesn't specify if 2FA required from day 1
   - **Status:** Deferred to LATER (AUTH-005)
   - **Owner:** Ask product owner next planning meeting

2. **Design Decision: OAuth Social Login?**
   - TRD says "user authentication" but doesn't specify if email-only or support Google/GitHub
   - **Status:** Going email-only for NOW (ADR-001), social in LATER
   - **Owner:** Confirm with product owner before coding

3. **Scale Question: Concurrent Users Year 1?**
   - Affects database sizing, WebSocket infrastructure
   - Current assumption: < 1000 concurrent (single DB sufficient)
   - **Status:** Waiting for product team estimate
   - **Owner:** Follow up by Friday

4. **Collaboration: Conflict Resolution Strategy?**
   - TRD requires "simultaneous edits" but doesn't specify how
   - **Status:** Will implement operational transformation (ADR-003, REALTIME-002)
   - **Owner:** Spike on OT complexity (2 days, Sprint 2)

5. **Data: Maximum Note Size?**
   - TRD doesn't specify upper limit on note content
   - Current assumption: 1M chars (can revise)
   - **Status:** Implement with assumption, test at 1M
   - **Owner:** Performance testing in Sprint 2

---

## Timeline

**Sprint 1 (Weeks 1-2):** ✓ In Progress
- Auth foundation (signup, verify, login)
- Basic note CRUD
- Database + schema

**Sprint 2 (Weeks 3-4):** → Planned
- Note management (list, search, delete)
- Password reset
- Initial sharing (no real-time yet)

**Sprint 3 (Weeks 5-6):** → Planned
- Real-time WebSocket protocol
- Conflict resolution (OT)
- Performance optimization

**Later:** Backlog
- Rich text editor
- 2FA authentication
- Mobile app

---

## Health

**Overall:** 🟢 GREEN (on track)

**Metrics:**
- Sprint velocity: 13 story points (Auth-001 + Auth-002 + Note-001)
- Planned capacity: 20 story points
- Utilization: 65% (good buffer for unknowns)
- Bugs discovered: 0 critical, 2 minor (already fixed)
- Test coverage: 78% (Auth 95%, API 65%)

**What's Working Well:**
- ✓ ADRs clarified major decisions early
- ✓ TRD was specific enough to plan
- ✓ Small backlog items (1-2 days each) are trackable
- ✓ Weekly check-ins catching issues early

**What Needs Attention:**
- ⚠ Email service setup delayed by 2 days (non-blocking)
- ⚠ Need product clarification on 2 TRD ambiguities (doesn't block NOW)
- ⚠ Test environment database slower than expected (not impacting dev)

---

## Next Steps

**This Week (Remaining):**
- [ ] Complete AUTH-002 email verification
- [ ] Get product approval on social login decision
- [ ] Complete AUTH-003 (session management)
- [ ] Start NOTE-001 (create note endpoint)

**Next Week:**
- [ ] Complete NOTE-001, NOTE-002, NOTE-003
- [ ] Spike: Real-time protocol options (WebSocket vs gRPC)
- [ ] Set up performance baseline testing

**Questions for Product Team:**
- Do we need 2FA from day 1 or LATER?
- Expected concurrent users Year 1?
- Social login required or email-only is OK?

---

## Key Information for New Team Members

**Get up to speed by reading:**
1. `AGENT_INSTRUCTIONS.md` (this is how we work)
2. `.assistant/trd/core-features.md` (what we're building)
3. `.assistant/plan.md` (when we're building it)
4. `.assistant/backlog.md` (the work items)

**Ask questions:**
- Ping the team in Slack #project-notes
- Check ADR folder for "why" behind decisions
- Review history.md for recent decisions

**Key contacts:**
- **Product:** Alice (alice@company.com)
- **Tech Lead:** Bob (bob@company.com)
- **Current Dev:** Carol (carol@company.com)

---

## Template Notes

This status document is updated after each sprint/week:
- ✅ **Focus** — What we're doing RIGHT NOW
- ✅ **Risks** — What could go wrong + mitigations
- ✅ **Artifacts** — Key files/decisions
- ✅ **Open Questions** — What we're still deciding
- ✅ **Timeline** — What's next
- ✅ **Health** — Are we on track?

Use as a quick reference when jumping into the project mid-sprint.
