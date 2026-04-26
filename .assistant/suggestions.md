# Suggestions

## Product Direction

1. Make demo/sample mode a visible product feature, not a fallback.
   - Label sample data subtly in widgets and module settings.
   - Let users switch between sample and connected modes per module.
   - Keep the first-run dashboard polished even with zero credentials.

2. Add a "Module Studio" area in Settings.
   - Configure built-in modules.
   - Create starter custom modules.
   - Upload packaged modules.
   - View validation errors and registry status.

3. Separate module concerns clearly.
   - Dashboard placement and size.
   - Module display preferences.
   - Sample vs connected mode.
   - Connector credentials.
   - Native view/navigation enablement.

## Custom Modules

1. Provide starter templates.
   - Basic widget-only module.
   - Widget plus full-page view.
   - Module with config fields.
   - Module with sample API route.

2. Add module validation before registry generation.
   - Safe id format.
   - Required manifest fields.
   - Unique config field keys.
   - Valid Lucide icon name or graceful fallback.
   - No path traversal.

3. Keep browser-created modules safe.
   - Let the UI scaffold known templates.
   - Do not allow arbitrary code editing in the browser.
   - Show local file paths for users who want to edit code.

## Architecture

1. Create a shared sample data layer.
   - Suggested location: `lib/sample-data/` or `modules/<id>/sample.ts`.
   - Keep sample payloads shaped like connected payloads.
   - Add a common `mode: "sample" | "connected"` convention.

2. Normalize module API responses.
   - `status`: `online`, `offline`, `misconfigured`
   - `mode`: `sample`, `connected`
   - `data`: module payload
   - `error`: sanitized error when relevant

3. Consolidate module type definitions.
   - Avoid drift between `lib/modules.ts` and `lib/types.ts`.
   - Include all observed field types: `text`, `password`, `number`, `url`, `select`.

## UX

1. Add first-run onboarding.
   - Explain that Horizon works immediately with sample data.
   - Point users to module setup.
   - Explain optional connected mode.

2. Add clear module states.
   - Sample
   - Connected
   - Needs setup
   - Offline
   - Error

3. Improve empty states.
   - Empty settings should feel intentional.
   - Missing credentials should not look like a broken app.

## Security And Operations

1. Resolve plugin upload/delete authorization.
   - Either add a proper UI auth flow or disable browser upload/delete until configured.

2. Treat installed modules as trusted local code.
   - Document this plainly.
   - Keep upload validation strict.

3. Add basic smoke checks.
   - Registry generation.
   - Settings save/load.
   - Sample mode route.
   - One module settings flow.

## Suggested Build Order

1. P-004: Align settings and module types.
2. P-009: Create shared sample data layer.
3. P-002: Make modules work without real services.
4. P-011: Configure built-in modules through the UI.
5. P-013: Document module setup workflows.
6. P-003: Fix plugin upload/delete authorization.
7. P-012: Add custom modules through the UI.

