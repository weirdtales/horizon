# Example Backlog

This is an example `backlog.md` for a note-taking app. Use this as a template for proper granularity and structure.

## AUTH-001: Email Signup Form

- **Status:** Todo
- **TRD Reference:** Section 2.1 - "Users sign up with email and password"
- **Priority:** High (blocking other auth features)
- **Effort Estimate:** 2 days
- **Acceptance Criteria:**
  - [ ] Signup page displays email and password input fields
  - [ ] Form validates email is valid format (regex: user@domain.com)
  - [ ] Form validates password: 8+ chars, 1 uppercase, 1 lowercase, 1 number
  - [ ] Submit button disabled until both fields valid
  - [ ] Server endpoint POST /api/auth/signup accepts email + password
  - [ ] Server returns HTTP 201 with user ID on success
  - [ ] Server returns HTTP 400 with specific error if validation fails
  - [ ] Server returns HTTP 409 if email already registered
  - [ ] Password is hashed with bcrypt (10+ rounds) before storage
  - [ ] No plaintext passwords logged anywhere

**Out of Scope:**
- [ ] Social login (Google, GitHub) — deferred to LATER
- [ ] Email verification — separate task (AUTH-002)
- [ ] 2FA — deferred to LATER

---

## AUTH-002: Email Verification

- **Status:** Todo
- **TRD Reference:** Section 2.1 - "Confirm account with email verification"
- **Priority:** High (must complete before user login)
- **Effort Estimate:** 1 day
- **Acceptance Criteria:**
  - [ ] After signup, confirmation email sent to user's email address
  - [ ] Email contains unique verification link valid for 24 hours
  - [ ] User clicks link to navigate to verification page
  - [ ] Verification endpoint GET /api/auth/verify?token=X validates token
  - [ ] Server returns HTTP 200 and marks account as verified
  - [ ] Server returns HTTP 400 if token expired or invalid
  - [ ] User cannot login until email verified (return 401)
  - [ ] Resend link available if email not received

**Out of Scope:**
- [ ] SMS verification — email only
- [ ] Backup verification methods — deferred

---

## AUTH-003: Login with Session

- **Status:** Todo
- **TRD Reference:** Section 2.1 - "User login creates session"
- **Priority:** High
- **Effort Estimate:** 2 days
- **Acceptance Criteria:**
  - [ ] Login form displays email and password fields
  - [ ] Form validates inputs match signup requirements
  - [ ] POST /api/auth/login accepts email + password
  - [ ] Server verifies password matches stored hash (bcrypt compare)
  - [ ] Server returns HTTP 401 if email not found or password wrong
  - [ ] Successful login creates HTTP-only session cookie
  - [ ] Cookie contains user ID, expires after 24 hours
  - [ ] Cookie valid only over HTTPS (secure flag set)
  - [ ] Subsequent requests automatically include session cookie
  - [ ] GET /api/auth/me returns current user from session (or 401 if no session)

**Out of Scope:**
- [ ] "Remember me" / longer sessions — login every 24 hours
- [ ] JWT tokens — using session cookies for simplicity

---

## AUTH-004: Password Reset

- **Status:** Todo
- **TRD Reference:** Section 2.1 - "Users can recover forgotten passwords"
- **Priority:** Medium (not blocking core features)
- **Effort Estimate:** 1.5 days
- **Acceptance Criteria:**
  - [ ] Login page has "Forgot password?" link
  - [ ] Link navigates to /password-reset form
  - [ ] Form accepts email address
  - [ ] POST /api/auth/reset-request generates unique reset token
  - [ ] Reset email sent with link valid for 1 hour
  - [ ] Reset link navigates to /password-reset/[token] form
  - [ ] Form validates new password meets requirements
  - [ ] POST /api/auth/reset accepts token + new password
  - [ ] Server invalidates old password, stores new one (bcrypt hashed)
  - [ ] User can login immediately with new password
  - [ ] Server returns HTTP 400 if token expired or invalid

**Out of Scope:**
- [ ] Security questions as backup — email reset only
- [ ] Admin password reset — user-initiated only

---

## NOTE-001: Create Note

- **Status:** Todo
- **TRD Reference:** Section 3.1 - "Users can create notes"
- **Priority:** High
- **Effort Estimate:** 1 day
- **Acceptance Criteria:**
  - [ ] Authenticated user can access /notes page
  - [ ] Page has "Create Note" button
  - [ ] Button navigates to /notes/new form
  - [ ] Form has title input (max 255 chars) and content area (max 1M chars)
  - [ ] Form validates title is not empty
  - [ ] POST /api/notes creates note in database
  - [ ] Server returns HTTP 201 with note ID
  - [ ] Note stored with: user_id, title, content, created_at, updated_at
  - [ ] User is automatically set as owner
  - [ ] Note redirects to /notes/[id] for editing

**Out of Scope:**
- [ ] Rich text formatting — plain text only
- [ ] Sharing at creation — separate task (SHARE-001)
- [ ] Tags/categories — deferred to LATER

---

## NOTE-002: List Notes

- **Status:** Todo
- **TRD Reference:** Section 3.2 - "Users can view their notes"
- **Priority:** High
- **Effort Estimate:** 1.5 days
- **Acceptance Criteria:**
  - [ ] GET /api/notes returns list of current user's notes
  - [ ] Response includes: id, title, content preview (first 100 chars), created_at, updated_at
  - [ ] List sorted by updated_at (newest first)
  - [ ] Pagination: supports ?limit=20&offset=0
  - [ ] Each note shows owner and member count (if shared)
  - [ ] Clicking note navigates to /notes/[id] for editing
  - [ ] Search: GET /api/notes?search=query filters title and content
  - [ ] Filter: GET /api/notes?mine=true shows only owned notes

**Out of Scope:**
- [ ] Advanced filters (by date, by tag) — deferred
- [ ] Sorting options — newest first only

---

## NOTE-003: Edit Note

- **Status:** Todo
- **TRD Reference:** Section 3.3 - "Users can edit their notes"
- **Priority:** High
- **Effort Estimate:** 1.5 days
- **Acceptance Criteria:**
  - [ ] Authenticated user can navigate to /notes/[id]
  - [ ] Page displays note title and content (editable)
  - [ ] User can only edit if owner or has edit permission
  - [ ] PATCH /api/notes/[id] accepts title and/or content updates
  - [ ] Server validates authorization (user owns or has edit permission)
  - [ ] Server returns HTTP 403 if not authorized
  - [ ] Server updates note, increments version number
  - [ ] updated_at timestamp changes automatically
  - [ ] Auto-save: POST every 10 seconds while editing
  - [ ] Unsaved indicator shows if changes not saved

**Out of Scope:**
- [ ] Version history — deferred to NOTE-004
- [ ] Collaborative editing — deferred to REALTIME-001
- [ ] Undo/redo — deferred to LATER

---

## SHARE-001: Share Note

- **Status:** Todo
- **TRD Reference:** Section 2.2 - "Users can share notes with team members"
- **Priority:** High (enables collaboration)
- **Effort Estimate:** 2 days
- **Acceptance Criteria:**
  - [ ] Note page has "Share" button
  - [ ] Share modal displays member list with permissions
  - [ ] User can add new member by email address
  - [ ] Permissions options: Viewer (read-only), Editor (read+write)
  - [ ] POST /api/notes/[id]/share accepts email + permission
  - [ ] Server sends invite email to recipient
  - [ ] Recipient can accept/decline invite
  - [ ] Accepted member appears in note's member list
  - [ ] Viewer cannot edit note content (API rejects PATCH)
  - [ ] Editor can modify note and see real-time updates

**Out of Scope:**
- [ ] Comment mentions — deferred
- [ ] Permission levels beyond Viewer/Editor — keep simple
- [ ] Invite expiration — no expiration required

---

## REALTIME-001: WebSocket Connection

- **Status:** Todo
- **TRD Reference:** Section 2.3 - "Real-time collaboration updates"
- **Priority:** High (enables live editing)
- **Effort Estimate:** 2 days
- **Acceptance Criteria:**
  - [ ] Frontend establishes WebSocket connection on note load
  - [ ] Connection authenticates using session cookie
  - [ ] Server returns HTTP 101 upgrade on successful auth
  - [ ] Server rejects connection (401) if not authenticated
  - [ ] Client subscribes to /notes/[id] channel
  - [ ] Server sends user list when member joins/leaves
  - [ ] Client sends edit events: { action: "edit", content: "..." }
  - [ ] Server broadcasts edit to all other connected members
  - [ ] Broadcast includes: editor user_id, timestamp, content delta
  - [ ] Connection auto-reconnects if dropped (exponential backoff)
  - [ ] Client reconnect re-synchronizes note state from server

**Out of Scope:**
- [ ] Operational transformation for conflict resolution — separate (REALTIME-002)
- [ ] Presence cursors — deferred to LATER
- [ ] Message history — deferred

---

## Backlog Management Notes

**Total NOW items:** 8 items, ~13 days of work (leaves buffer in 2-week sprint)

**Dependencies:**
- AUTH-001 → AUTH-002 → AUTH-003 (sequential, auth foundation)
- AUTH-003 → NOTE-001 (must be authenticated to create)
- NOTE-001 → NOTE-002, NOTE-003 (CRUD foundation)
- NOTE-003 → SHARE-001 (editing must work before sharing)
- SHARE-001 → REALTIME-001 (members must exist for real-time)

**Definition of Done (for each item):**
- Code written and self-reviewed
- All acceptance criteria met
- Automated tests pass (unit + integration)
- Manual testing confirmed
- No console errors/warnings
- Documented (API endpoint, schema changes, etc.)

**How to use this example:**
1. Copy structure for your project
2. Replace with your TRD sections
3. Keep items 1-3 days of work (break larger items)
4. Every item must have TRD reference
5. Every item must have testable acceptance criteria
