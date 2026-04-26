# Status

**Last updated:** 2026-04-26
**Overall health:** Yellow - usable project foundation, but the roadmap needed a demo-first correction.

## Focus

Shift Horizon toward public, demo-first usability and UI-driven module ownership. Immediate engineering focus is P-002, P-009, P-014, P-011, and P-013: modules should work without credentials, make demo mode visible as intentional product behavior, be configurable through the UI, and have a clear custom module workflow.

Plan pointer: `.assistant/plan.md`

## Now / Next / Later

- **Now:** P-001, P-002, P-014, P-010, P-004, P-011, P-013
- **Next:** P-003, P-005, P-006, P-007, P-012
- **Later:** P-008 and broader regression/security policy work

## Risks

| Risk | Likelihood | Mitigation |
| --- | --- | --- |
| Roadmap still implies users need real homelab credentials before Horizon is useful | High | Prioritize P-002, P-009, and P-010 |
| Module upload/delete UI cannot work because routes require bearer auth but the browser calls do not send it | Medium | Resolve P-003 before promoting plugin upload as usable |
| Type definitions drift from persisted settings and manifests | Medium | Resolve P-004 before adding more modules |
| Widgets can look fake if sample data is scattered or unlabeled | Medium | Use shared sample data and visible demo-mode states |
| Custom module creation can become unsafe if the UI writes arbitrary paths or code | Medium | Gate P-012 behind strict id/path validation and starter templates |
| Module settings can become confusing if sample mode and connector credentials are mixed together | Medium | Separate display/layout, sample mode, and connector settings in P-011 |
| Future real connector routes may leak raw upstream behavior or hang on slow services | Medium | Resolve P-006 with timeout and sanitized error patterns |
| `.docs/` was deleted while `.assistant/canvas/` is untracked | Medium | Commit normalized `.assistant/` migration intentionally |

## Artifacts

- Canvas index: `.assistant/canvas/README.md`
- Architecture: `.assistant/canvas/architecture.md`
- API routes: `.assistant/canvas/api-routes.md`
- Configuration: `.assistant/canvas/configuration.md`
- Deployment: `.assistant/canvas/deployment.md`
- Development: `.assistant/canvas/development.md`
- Modules: `.assistant/canvas/modules.md`
- Module UI workflows: `.assistant/canvas/module-ui-workflows.md`
- Security and operations: `.assistant/canvas/security-and-operations.md`
- Questions: `.assistant/canvas/questions.md`
- Backlog: `.assistant/backlog.md`
- Plan: `.assistant/plan.md`
- History: `.assistant/history.md`
- ADRs: `.assistant/adr/`
- First session plan: `.assistant/first-session-plan.md`

## Open Questions Synced From Canvas

`canvas/questions.md` contains an earlier answered Q&A about connecting module options to real services. That answer remains technically useful for future connector mode, but it is no longer the immediate product priority.

| Question | Owner | Status |
| --- | --- | --- |
| How do module options connect to actual services? | Project | Answered for future connector mode in `.assistant/canvas/questions.md` |
| Should Horizon require real services on first run? | Project | Answered: no, demo/sample mode first |

## Changelog

- 2026-04-26 - Reframed backlog and status around demo-first public usability instead of immediate real-service integration.
- 2026-04-26 - Added P-014 to make demo/sample mode a visible product feature instead of a fallback.
- 2026-04-26 - Completed P-009 with `lib/sample-data.ts`, `/api/unifi`, and a UniFi widget wired to sample-mode data.
- 2026-04-26 - Added ADR-0006 for demo-first module data and updated architecture/development docs around sample mode.
- 2026-04-26 - Added planning for configuring built-in modules through the UI and adding custom modules.
- 2026-04-26 - Migrated Horizon planning state into `.assistant/backlog.md`, `.assistant/plan.md`, `.assistant/status.md`, and `.assistant/history.md`.
- 2026-04-26 - Added ADR stubs for generated registry, JSON settings persistence, server-side integration routes, Docker standalone deployment, and MD3 client dashboard architecture.
- 2026-04-26 - Synced answered Q&A from canvas into status.
