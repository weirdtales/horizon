# ADR-002: Database Choice

**Date:** 2024-11-14  
**Status:** Accepted  
**Author:** Copilot (with team approval)

## Context

From TRD Section 1: "The system must support 1M+ users with 99.9% uptime and handle real-time note collaboration."

**Requirements:**
- Persistent user and note storage
- Fast queries (< 500ms for note list)
- ACID transactions (payment processing in LATER phase)
- Real-time collaboration support (frequent updates)
- Scalable to 1M+ users
- 99.9% uptime SLA

**Database options evaluated:**
1. PostgreSQL (relational, ACID, mature)
2. MongoDB (document, flexible schema)
3. DynamoDB (AWS managed, pay-per-request)
4. Firebase (fully managed, real-time built-in)

## Decision

**We will use PostgreSQL as our primary database.**

Specifically:
- PostgreSQL 14+
- Hosted on AWS RDS with Multi-AZ deployment
- Connection pooling via pgBouncer
- Automated backups (daily) with 30-day retention
- Read replicas for reporting/analytics

## Rationale

### Why PostgreSQL?
- **ACID guarantees** — Critical for payment processing (future)
- **Proven at scale** — Powers Instagram, Spotify, Airbnb (1B+ records)
- **JSON support** — Notes can be stored as JSONB for flexibility
- **Replication** — Built-in for high availability
- **Team experience** — Team knows SQL and PostgreSQL well

### Why not MongoDB?
- Weaker ACID guarantees (eventual consistency)
- Not ideal for relational data (users ↔ notes ↔ shares)
- Document model adds complexity for our data structure
- Less mature transaction support

### Why not DynamoDB?
- Expensive at scale (pay-per-request too high for our volume)
- Limited query flexibility (must plan access patterns upfront)
- Cold start penalties (not relevant for web app, but avoid complexity)
- Overkill for initial scale

### Why not Firebase?
- Vendor lock-in risk (hard to migrate away)
- Pricing unpredictable at scale
- Limited offline support needed (we're web-first)
- Real-time is nice but not essential (can add WebSocket later)

## Schema Overview

**Core tables:**

```sql
users
├─ id (PK)
├─ email (UNIQUE)
├─ password_hash
├─ email_verified
├─ created_at
└─ deleted_at (soft delete for GDPR)

notes
├─ id (PK)
├─ user_id (FK)
├─ title
├─ content (JSONB for rich content)
├─ version
├─ created_at
├─ updated_at
└─ deleted_at (soft delete)

note_shares
├─ id (PK)
├─ note_id (FK)
├─ shared_with_user_id (FK)
├─ permission (ENUM: viewer, editor)
├─ accepted_at
└─ created_at

sessions
├─ id (PK)
├─ user_id (FK)
├─ expires_at
├─ created_at
└─ last_activity_at
```

**Indexes:**
```sql
CREATE INDEX idx_notes_user_id ON notes(user_id);
CREATE INDEX idx_notes_updated_at ON notes(updated_at DESC);
CREATE INDEX idx_note_shares_user ON note_shares(shared_with_user_id);
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
```

## Scaling Strategy

### Phase 1: MVP (Weeks 1-6)
- Single PostgreSQL instance
- Handles up to 10K concurrent users easily
- Backups to S3 for disaster recovery

### Phase 2: Growth (Months 3-6)
- Add read replica for reporting
- Connection pooling with pgBouncer
- Cache layer (Redis) for hot data
- Expected: 100K concurrent users

### Phase 3: Scale (Months 6+)
- Evaluate sharding if needed (probably not until 1M+ users)
- Consider Citus (PostgreSQL sharding) or separate databases per tenant
- Estimated cost still under $10K/month at 1M users

## Consequences

### Positive
- ✅ Proven technology, large community
- ✅ Strong consistency guarantees
- ✅ Powerful query language (SQL is universal)
- ✅ Easy to back up and restore
- ✅ Affordable until very large scale
- ✅ Can run on-prem or cloud easily

### Negative
- ❌ Vertical scaling limits (eventually need horizontal)
- ❌ Setup/maintenance overhead (compared to managed services)
- ❌ Cold start for new instances (not relevant for us)
- ❌ Must plan schema upfront (migration cost)

### Tradeoffs
- **Simplicity vs. Flexibility** — SQL schema is rigid, but that's good for reliability
- **Managed vs. Control** — RDS managed, but we control schema + migrations
- **Cost vs. Features** — Cheaper than DynamoDB initially, more expensive at 100M+ records

## Future Decisions

This database choice enables:
- ✅ ACID transactions (payment, later)
- ✅ Complex queries (analytics, later)
- ✅ Row-level security (per-user encryption, later)

This decision constrains:
- ❌ Horizontal scaling (if needed, would require sharding)
- ❌ Schema migrations (can't change schema without downtime, need blue-green deployment)

## Operations

### Backup Strategy
- Automated daily backups (retained 30 days)
- Weekly snapshots to S3
- Point-in-time recovery (PITR) enabled
- Test restore quarterly

### Monitoring
- CloudWatch alarms for:
  - CPU > 80%
  - Connections > 800
  - Replication lag > 1 second
  - Free storage < 20%

### Scaling Thresholds
- Connection pool at 80% → add read replica
- Disk usage at 80% → investigate size growth
- Query latency > 1s → add index or cache

## Related ADRs

- ADR-001: Session storage (PostgreSQL sessions table)
- ADR-003: Real-time protocol (WebSocket with DB polling as fallback)

## References

- [PostgreSQL 14 Docs](https://www.postgresql.org/docs/14/)
- [AWS RDS Best Practices](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/CHAP_BestPractices.html)
- [Sharding Decisions](https://wiki.postgresql.org/wiki/Sharding)
