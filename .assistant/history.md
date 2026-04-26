# History

## Session: 2026-04-26

**Focus:** Migrate existing Horizon project knowledge into the `.assistant/` workflow.

### Completed

- P-001: Normalized `.assistant/backlog.md`, `.assistant/plan.md`, `.assistant/status.md`, and `.assistant/history.md`.
- Added `.assistant/first-session-plan.md` for the next development session.
- Added ADR stubs for key architecture decisions already made in the project.
- Confirmed `.assistant/canvas/questions.md` contains the answered service-connection Q&A.

### Decisions Captured

- Generated module registry is an accepted architectural direction. See ADR-0001.
- Runtime settings persist in `data/settings.json`. See ADR-0002.
- Widgets and views should call local Next.js API routes rather than external services directly. See ADR-0003.
- Docker standalone output is the production packaging path. See ADR-0004.
- The dashboard UI follows a client-rendered MD3-inspired App Router model. See ADR-0005.

### Risks / Carry-over

- P-002 remains the main implementation focus, but it has been reframed: modules should work without real services first, and real connectors are optional future behavior.
- P-003 is a product/security mismatch: upload/delete endpoints require bearer auth but the current settings UI does not provide it.
- P-004 should be handled before expanding module config fields further.

### Questions Resolved

- Q: How do module options connect to actual services?
  A: Module manifest config fields are saved through `/api/settings` into `data/settings.json`; server-side API routes read those settings with `getSettings()` and call external services; widgets/views fetch local Horizon API routes. See `.assistant/canvas/questions.md`.

### Next Session

- Start with P-002 on one module, preferably UniFi or another module currently suspected of dummy/incomplete behavior.
- Check whether the module has a clean sample-data path, matching payload shape, settings defaults/types, API route, and widget fetch path.

## Session Update: 2026-04-26

**Focus:** Reframe backlog and docs for a public demo-first product direction.

### Completed

- Changed P-002 from real-service wiring to making modules work without real services.
- Added P-009 for a shared sample data layer.
- Added P-010 for public demo-first onboarding.
- Updated plan, status, vision, goals, API route docs, module docs, configuration docs, and first-session plan.

### Decision

- Horizon should not require real service credentials for first-run usefulness. Sample/demo mode is the baseline; connected real service mode is optional and later.

## Session Update: 2026-04-26

**Focus:** Plan UI-driven module setup and custom module creation.

### Completed

- Added P-011 for configuring built-in modules through the UI.
- Added P-012 for adding custom modules through the UI.
- Added P-013 for documenting module setup and custom module workflows.
- Updated module and configuration canvas docs with UI setup expectations.

### Decision

- Horizon should let users configure built-in modules from the UI and should support creating starter custom modules from the UI. Custom modules still resolve to normal source files under `modules/<id>/` and the generated registry remains the app's module discovery mechanism.

## Session Update: 2026-04-26

**Focus:** Promote visible demo/sample mode into the backlog.

### Completed

- Added P-014 for making demo mode a visible product feature.
- Updated plan and status to include P-014 in Now.

### Decision

- Demo/sample mode should be treated as intentional product behavior in widgets and settings, not as a hidden fallback for missing credentials.

## Session Update: 2026-04-26

**Focus:** Implement P-009 shared sample data layer.

### Completed

- Added `lib/sample-data.ts` with shared module sample data types and UniFi sample payload.
- Added `/api/unifi` to return sample-mode UniFi data and connector readiness.
- Updated `modules/unifi/widget.tsx` to fetch `/api/unifi`, fall back to shared sample data, and render a sample badge.
- Updated module and API canvas docs with the initial sample-data pattern.
- Marked P-009 Done in backlog and plan.

### Next

- Continue P-002 by migrating more modules away from scattered placeholder literals.
- Continue P-014 by formalizing the sample/connected mode visual treatment beyond UniFi.

## Session Update: 2026-04-26

**Focus:** Fix first-build dashboard presentation.

### Completed

- Added explicit grid layout objects to `defaultSettings.dashboard`.
- Normalized legacy string-based dashboard layouts before rendering.
- Updated bundled `data/settings.json` to use the first-run sample dashboard.
- Added P-015 and marked it Done.

### Decision

- First-build defaults should include only widgets that render cleanly without private credentials until broader sample-mode coverage is complete.

## Condensed Project Milestones

- 2026-04-15: Horizon Core 1.0.0 launched with customizable bento dashboard, dark/light themes, global settings search, and initial Loopia, Cloudflare, Plex, Immich, and Home Assistant support.
- 2026-04-18: Version 1.1.0 added Material 3 surface system, glass theme variant, Plex SSO, searchable service gallery, custom sidebar icons, and grid/mobile improvements.
- 2026-04-22: Version 1.2.0 improved Plex server naming, weather contrast handling, MD3 semantic tokens, settings release notes, and XSS sanitization for labels.
- 2026-04-23: Version 1.3.0 prepared the project for open source with MIT licensing, host header validation, safer async behavior, geocoding support, accessibility improvements, and stability fixes.
- 2026-04-26: Documentation migration began, moving maintainer docs and planning state into `.assistant/`.
