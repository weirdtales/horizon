# Example Plan

This is an example `plan.md` for a note-taking app. Use this as a template.

## Now (Sprint 1: Weeks 1-2)

Focus: Core infrastructure and user authentication

- **Infra-001:** Database schema for users and notes
  - TRD reference: Section 1.2 (data model)
  - Effort: 1 day
  
- **Auth-001:** Email signup with validation
  - TRD reference: Section 2.1 (user authentication)
  - Effort: 2 days
  
- **Auth-002:** Email verification flow
  - TRD reference: Section 2.1 (confirm account)
  - Effort: 1 day
  
- **Auth-003:** Login with persistent session
  - TRD reference: Section 2.1 (user sessions)
  - Effort: 2 days
  
- **Note-001:** Create note endpoint (basic CRUD)
  - TRD reference: Section 3.1 (note creation)
  - Effort: 1 day

## Next (Sprint 2-3: Weeks 3-6)

Focus: Rich features and collaboration

- **Note-002:** List notes with filtering and search
  - TRD reference: Section 3.2 (note management)
  - Effort: 2 days
  
- **Note-003:** Edit notes with version history
  - TRD reference: Section 3.3 (edit tracking)
  - Effort: 2 days
  
- **Note-004:** Delete with soft delete recovery
  - TRD reference: Section 3.4 (data safety)
  - Effort: 1 day
  
- **Share-001:** Share notes with team members
  - TRD reference: Section 2.2 (collaboration)
  - Effort: 3 days
  
- **Realtime-001:** WebSocket connection for real-time updates
  - TRD reference: Section 2.3 (live collaboration)
  - Effort: 2 days
  
- **Auth-004:** Password reset via email
  - TRD reference: Section 2.1 (account recovery)
  - Effort: 1 day

## Later (Future sprints)

Lower priority items for future consideration

- **Realtime-002:** Operational transformation for conflict resolution
  - TRD reference: Section 2.3 (simultaneous edits)
  - Effort: 5 days
  
- **Rich-001:** Rich text editor with formatting
  - TRD reference: Section 3.5 (text features)
  - Effort: 3 days
  
- **Auth-005:** Two-factor authentication
  - TRD reference: Section 2.1 (security)
  - Effort: 2 days
  
- **Perf-001:** Caching strategy for large notes
  - TRD reference: Section 4.2 (performance)
  - Effort: 3 days
  
- **Mobile-001:** Mobile app (iOS/Android)
  - TRD reference: Section 5 (multiplatform)
  - Effort: 20+ days (defer)

## Plan Notes

- **NOW is achievable** — 10 days of work, 14-day sprint = comfortable pace
- **Dependencies clear** — Auth must complete before Share features
- **Every item in TRD** — Can trace each to TRD section
- **NEXT builds on NOW** — Collaboration features depend on basic CRUD working
- **LATER is intentional** — Mobile deferred, rich text nice-to-have
