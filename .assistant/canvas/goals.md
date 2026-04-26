# Goals

## Short-Term

- Complete the `.assistant/` migration so future sessions have current backlog, plan, status, history, and ADR context.
- Make the default dashboard and modules useful without real service credentials.
- Centralize sample/demo data so widgets are not filled with scattered placeholder literals.
- Update onboarding and docs to make real service connections optional advanced configuration.
- Align settings and module TypeScript types with the data the app actually persists.
- Resolve the module upload/delete authorization mismatch between the settings UI and API routes.

## Mid-Term

- Establish repeatable smoke checks for registry generation, settings persistence, and representative sample-mode module routes.
- Define the boundary between demo/sample mode and optional real connector mode.
- Harden future external integration routes with consistent timeouts, sanitized errors, and offline states.
- Document module packaging and installation policy clearly enough for external contributors.
- Create a consolidated TRD for Horizon Core from the current implementation and product goals.

## Long-Term

- Maintain a stable, extensible module architecture for built-in dashboard modules and optional homelab integrations.
- Keep deployment simple through Docker and persistent `data/settings.json`.
- Preserve a polished MD3-style UX while improving operational reliability and test coverage.
- Evaluate stricter plugin distribution, CSP, and settings migration strategies as the project matures.
