# ADR-0004: Docker Standalone Deployment

Date: 2026-04-26
Status: Proposed

## Context

Horizon targets self-hosted homelab deployment where Docker Compose is the expected operational path.

## Decision

Use Next.js standalone output in a multi-stage Dockerfile, run as a non-root `nextjs` user, expose port `3000`, and persist settings through `/app/data`.

## Alternatives

- Run `next dev` in production.
- Ship a static export.
- Require bare-metal Node.js deployment only.

## Consequences

- Production images are smaller than full source images.
- Compose deployments are straightforward.
- File permissions for `/app/data` must remain correct.
- Runtime code that writes outside `/app/data`, `tmp`, or expected paths needs review.

