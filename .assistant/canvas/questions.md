# Questions And Answers

## 2026-04-26

### Question

How do I connect the module options to the actual service, right now its dummy data?

### Answer

Update after the next question: this is still the right pattern for optional future connector mode, but it is no longer the immediate baseline. Horizon should now work with sample/demo data first and only use real service settings when a user opts into a connector.

The connection path in Horizon is:

```text
modules/<id>/module.json configFields
  -> Settings UI
  -> POST /api/settings
  -> data/settings.json
  -> app/api/<id>/route.ts reads getSettings()
  -> external service API
  -> widget/view fetches /api/<id>
```

In other words, module options do not connect directly from the browser widget to the service. They are saved as settings, then server-side API routes read those settings and call the real service.

Example using Cloudflare:

1. `modules/cloudflare/module.json` declares config fields:

```json
[
  { "key": "token", "label": "API Token", "type": "password" },
  { "key": "accountId", "label": "Account ID", "type": "text" }
]
```

2. The settings page renders those fields and saves them under:

```json
{
  "cloudflare": {
    "token": "...",
    "accountId": "..."
  }
}
```

3. `app/api/cloudflare/route.ts` reads them:

```ts
const settings = getSettings();
const cf = settings.cloudflare;
```

4. The route calls the actual Cloudflare API:

```ts
await fetch('https://api.cloudflare.com/client/v4/zones', {
    headers: {
        Authorization: `Bearer ${cf.token}`,
        'Content-Type': 'application/json',
    },
});
```

5. The widget fetches the local Horizon API route, not Cloudflare directly:

```ts
const { data, loading, error } = useService('cloudflare', 60000);
```

So to replace dummy data for a module:

1. Add the needed fields to `modules/<id>/module.json`.
2. Make sure the matching top-level settings key exists in `lib/settings.ts` and `lib/types.ts`.
3. Create or update `app/api/<id>/route.ts`.
4. In that route, call `getSettings()`, validate required config, then fetch the real external service.
5. Return normalized JSON that your widget/view can render.
6. Update `modules/<id>/widget.tsx` or `view.tsx` to use `useService('<id>')` or direct `fetch('/api/<id>')`.

Keep credentials in API routes only. Do not call authenticated homelab services directly from client components, because that exposes tokens and passwords in the browser.

## 2026-04-26

### Question

This service is going to be built to work for everybody, not real services now. How should the backlog and docs change?

### Answer

Horizon should be planned as a demo-first product. The default user experience should not require Cloudflare, UniFi, Plex, Sonarr, Radarr, or any other private service to be available.

The updated direction is:

```text
module widget/view
  -> local Horizon route or sample-data helper
  -> sample payload by default
  -> optional real connector later
```

Backlog impact:

1. P-002 is now "Make Modules Work Without Real Services".
2. P-009 adds a shared sample data layer.
3. P-010 adds public demo-first onboarding.
4. Real service connectors move to later boundary work instead of immediate implementation.

Documentation impact:

1. API routes should return useful sample payloads when connector settings are missing.
2. Modules should avoid scattered dummy literals and use a shared sample-data path.
3. Settings should treat service credentials as optional connector configuration.
4. The first-run product promise is "works immediately", not "configure services first".

Real services are still a future capability, but not the baseline requirement for the first public usable version.

## 2026-04-26

### Question

Can we start planning for setting up the different modules using the UI and adding custom modules?

### Answer

Yes. This should become a first-class product area.

Planning changes:

1. Add P-011 for configuring built-in modules through the UI.
2. Add P-012 for adding custom modules through the UI.
3. Add P-013 for documenting module setup and custom module workflows.
4. Keep demo/sample mode as the default for built-in and custom modules.

Built-in module setup should let users open Settings, select a module, enable it, choose sample or connected mode, edit manifest-defined fields, and save through `/api/settings`.

Custom module setup should let users create a starter module from the UI by entering manifest metadata. The server should generate safe starter files under `modules/<id>/`, regenerate `lib/registry.ts`, and make the module appear in the normal settings/module list.

Important boundary: the UI can scaffold safe starter files, but it should not become a browser-based arbitrary code editor. Users can edit generated module files locally after creation.
