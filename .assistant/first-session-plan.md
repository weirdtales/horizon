# First Session Plan

Goal: continue development from the normalized `.assistant/` migration with the corrected demo-first product direction.

## Start Here

1. Pick P-002 and P-009 from `.assistant/backlog.md`.
2. Choose one concrete module to convert to intentional sample mode. Recommended first candidate: `unifi`, because it is representative of service widgets but should still be useful without a real controller.
3. Trace the module path:
   - `modules/<id>/module.json`
   - `lib/settings.ts`
   - `lib/types.ts`
   - `app/api/<id>/route.ts`
   - `modules/<id>/widget.tsx`
   - optional `modules/<id>/view.tsx`
4. Replace ad hoc dummy/placeholder behavior with a shared sample-data path.
5. Verify the module renders a polished no-credentials state and can later support real connector mode without changing the widget contract.
6. Update the canvas docs if the sample-data location or route mode shape is decided.

## Checks

- Run `node scripts/generate-registry.mjs` after module shape changes.
- Run `npm run lint` if dependencies are installed.
- Update `.assistant/status.md` and `.assistant/history.md` at the end of the session.

## Watch Items

- Do not make real service credentials required for first-run usefulness.
- Do not expose service credentials in client components when optional connector mode is added.
- Keep module config keys consistent between manifest, settings defaults, and TypeScript types.
- Preserve existing user changes in `data/settings.json`.
