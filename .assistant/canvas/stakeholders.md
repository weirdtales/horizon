# Stakeholders

## Roles

| Role | Name / Team | Responsibility |
| --- | --- | --- |
| Product owner | Project maintainer | Sets scope and release priorities |
| Tech lead | Project maintainer / contributor | Owns architecture, integration patterns, and review standards |
| Developer(s) | Contributors and AI-assisted coding sessions | Implement modules, API routes, UI changes, tests, and docs |
| QA | Maintainer / contributors | Verify deployment, settings, module behavior, and regressions |
| Design | Maintainer / contributors | Preserve MD3-inspired UX and responsive behavior |
| External | Upstream service APIs | Cloudflare, Loopia, Plex, UniFi, Proxmox, Google Workspace, media apps, and monitoring tools |

## Decision Authority

The project maintainer owns final decisions on product scope, release readiness, security posture, and architecture direction. ADRs should capture durable technical choices before they are treated as settled.

## Communication Cadence

Use `.assistant/status.md` at the start and end of each work session. Update `.assistant/history.md` after meaningful implementation or decision sessions. Promote architectural decisions into `.assistant/adr/`.

