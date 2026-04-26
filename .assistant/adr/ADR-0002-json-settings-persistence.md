# ADR-0002: JSON Settings Persistence

Date: 2026-04-26
Status: Proposed

## Context

Horizon needs simple self-hosted persistence for service credentials, dashboard layout, navigation, bookmarks, appearance, and module enablement.

## Decision

Persist runtime settings in `data/settings.json`, with defaults defined in `lib/settings.ts` and access mediated through `/api/settings`.

## Alternatives

- SQLite.
- PostgreSQL or another external database.
- Environment variables only.
- Browser local storage only.

## Consequences

- Docker deployments only need to mount `/app/data`.
- Backup and restore are simple.
- There is no schema migration layer yet.
- Settings files can contain credentials and must be treated as sensitive.
- Type drift must be controlled as settings grow.

