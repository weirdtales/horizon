# ADR-001: Authentication Strategy

**Date:** 2024-11-15  
**Status:** Accepted  
**Author:** Copilot (with team approval)

## Context

From TRD Section 2.1: "Users must sign up and login with email and password. The system should securely manage user authentication and sessions."

**Requirements from TRD:**
- User signup with email + password
- Email verification to prevent fake accounts
- Session-based authentication
- Secure password storage
- Account recovery (password reset)

**Constraints:**
- No external dependencies on OAuth providers initially (simplicity)
- Must scale to 1M+ users
- Must support GDPR compliance (right to deletion)
- 99.9% uptime requirement

**Alternative approaches considered:**
1. OAuth only (Google, GitHub sign-in)
2. JWT tokens (stateless)
3. Passwordless (magic links)
4. Email + password with sessions (chosen)

## Decision

**We will use email + password authentication with HTTP-only session cookies.**

This means:
- Users sign up with email + password
- Password hashed with bcrypt (10+ rounds)
- Email verified via confirmation link (24-hour expiration)
- Login creates HTTP-only session cookie (24-hour expiration)
- No JWT tokens (sessions simpler for small team)
- Sessions stored in database with user_id + expiration

## Rationale

### Why Email + Password?
- **Simplicity** — No external dependencies at launch
- **User Control** — Users manage credentials, not dependent on 3rd parties
- **Compliance** — Full control over user data (GDPR friendly)
- **Future-proof** — Can add OAuth later without major refactoring

### Why Not OAuth-only?
- Adds complexity (multiple provider integrations)
- Dependent on external services (reliability risk)
- Users may not want Google/GitHub accounts
- Can add later as enhancement

### Why Sessions over JWT?
- **Server-controlled logout** — Can invalidate sessions immediately
- **Simpler scaling** — Redis can store sessions cheaply
- **Revocation** — Can revoke access instantly (important for security)
- **Stateless isn't always better** — Sessions are simpler for our scale

### Why Not Passwordless?
- Users expect password-based auth (familiar)
- Magic links require email delivery reliability
- Can add passwordless as future enhancement
- Keep MVP simple

### Why HTTP-only Cookies?
- **CSRF protection** — Can't be accessed via JavaScript
- **Automatic transmission** — Sent with every request
- **Familiar pattern** — Works with traditional web apps
- **Simpler than Bearer tokens** — Less to manage on client

## Implementation

### User Signup
```
1. User enters email + password
2. Validate: email format, password strength (8+ mixed case)
3. Check: email not already registered (409 Conflict)
4. Hash password with bcrypt (10 rounds)
5. Create user record in database
6. Send verification email with link (24h expiration)
7. Respond with 201 Created
```

### Email Verification
```
1. User clicks link in email
2. Verify token is valid + not expired
3. Mark user.email_verified = true
4. User can now login
```

### Login
```
1. User enters email + password
2. Find user by email
3. Hash provided password, compare with stored hash
4. If mismatch: return 401 Unauthorized
5. If verified: create session record with 24h expiration
6. Return session cookie (HTTP-only, Secure, SameSite=Strict)
7. Respond with 200 OK
```

### Session Validation
```
1. Incoming request includes session cookie
2. Look up session in database
3. If not found or expired: return 401 Unauthorized
4. If valid: attach user_id to request context
5. Allow request to proceed
```

### Logout
```
1. Delete session record from database
2. Return instruction to clear cookie
3. User is logged out
```

### Password Reset
```
1. User clicks "Forgot Password"
2. Enters email
3. Generate reset token (1-hour expiration)
4. Send email with reset link
5. User clicks link, enters new password
6. Validate password strength
7. Hash new password, update user record
8. Invalidate all existing sessions (force re-login)
```

## Consequences

### Positive
- ✅ No external dependencies (control our destiny)
- ✅ Can revoke access immediately (server-controlled)
- ✅ Simple to understand and implement
- ✅ Works well for web and native apps
- ✅ GDPR-friendly (full data control)

### Negative
- ❌ Requires database lookup on every request (mitigated with Redis caching)
- ❌ Can't be used for stateless serverless (but we're using traditional servers)
- ❌ Users must remember password (users prefer familiar patterns)

### Tradeoffs
- **Simplicity vs. Features** — No OAuth initially, but can add later
- **Stateful vs. Stateless** — Sessions are stateful but simpler than JWT
- **User Experience** — Users type passwords, not magic links (familiar)

## Future Enhancements

Not in scope for MVP, but planned:

1. **Add OAuth** (Google, GitHub) — TRD deferred to LATER
2. **2FA** — LATER phase (AUTH-005)
3. **Passwordless** — LATER phase
4. **SAML** — Enterprise feature (LATER)
5. **Biometric** — Mobile app (LATER)

## Validation

This decision should be revisited if:
- [ ] Users frequently lose passwords (maybe add passwordless?)
- [ ] We need to scale beyond session DB capacity (migrate to Redis)
- [ ] Users request OAuth integration (add in LATER phase)
- [ ] Security breach exposes password hashes (implement additional measures)

## Related ADRs

- ADR-002: Database choice (PostgreSQL) — Sessions stored in db
- ADR-003: Real-time protocol (WebSocket) — Needs session auth
