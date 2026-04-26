# Modules

Modules are self-contained dashboard extensions. They live in `modules/<id>/`, declare metadata in `module.json`, and can provide a widget, a native full-page view, or both. The current product direction is demo-first: modules should render useful states without requiring real service credentials.

## Module Folder

```text
modules/my-module/
  module.json
  widget.tsx
  view.tsx
  components/
  icon.png
```

Only `module.json` is mandatory. `widget.tsx` and `view.tsx` are registered automatically when present.

## Manifest Contract

Required fields:

```json
{
  "id": "my-module",
  "name": "My Module",
  "icon": "Zap",
  "color": "#818cf8"
}
```

Common optional fields:

```json
{
  "version": "1.0.0",
  "author": "Horizon Team",
  "description": "Short module description",
  "hasWidget": true,
  "hasView": true,
  "hidden": false,
  "configFields": []
}
```

Rules enforced by `scripts/generate-registry.mjs`:

- `id`, `name`, `icon`, and `color` must be present.
- Folder name must exactly match `id`.
- Invalid JSON skips the module.
- `widget.tsx` registers a widget even if `hasWidget` is false.
- `view.tsx` registers a view even if `hasView` is false.
- Missing files are warned when `hasWidget` or `hasView` says they should exist.

## Config Fields

Supported field shapes are declared in `lib/types.ts` and used by the settings UI.

Typical field:

```json
{
  "key": "apiKey",
  "label": "API Key",
  "type": "password",
  "placeholder": "Paste token"
}
```

Observed field types:

- `text`
- `password`
- `number`
- `url`
- `select`

For `select`, include `options`:

```json
{
  "key": "units",
  "label": "Temperature Units",
  "type": "select",
  "options": [
    { "value": "metric", "label": "Metric" },
    { "value": "imperial", "label": "Imperial" }
  ]
}
```

## Built-In Module Setup In The UI

The settings UI should be the primary place to set up built-in modules.

Expected workflow:

1. Open Settings.
2. Go to the modules/plugins area.
3. Select a built-in module.
4. Review its current mode:
   - `sample`: default mode; no credentials required.
   - `connected`: optional future mode; uses saved connector settings.
   - `offline` or `misconfigured`: only applies after connected mode is enabled.
5. Edit manifest-defined fields from `configFields`.
6. Save through `/api/settings`.
7. Return to the dashboard and see the module render with either sample or connected data.

UI requirements:

- Field labels and placeholders come from `module.json`.
- Secret fields are masked when loaded back from `/api/settings`.
- Sample mode must remain available even when connector fields are empty.
- The user should not need to edit `data/settings.json` manually for normal setup.
- Module layout placement and module connector settings should be visually distinct.

## Custom Module Setup In The UI

Users should be able to add their own modules without editing framework code.

Minimum UI-created custom module flow:

1. Open Settings.
2. Choose Add Custom Module.
3. Enter required manifest fields:
   - id
   - name
   - icon
   - color
   - hasWidget
   - hasView
4. Optionally add config fields.
5. Create a starter module in `modules/<id>/`.
6. Regenerate the module registry.
7. Show the new module in the settings module list.

The starter module should:

- Render useful sample content immediately.
- Use the same sample/connected data contract as built-in modules.
- Include a minimal `module.json`.
- Include a minimal `widget.tsx`.
- Include `view.tsx` only if requested.

The UI should validate:

- `id` uses only safe module id characters.
- `id` does not conflict with an existing module.
- Required manifest fields are present.
- Config field keys are safe and unique.
- Generated files remain inside `modules/<id>/`.

Uploading a packaged custom module remains a separate workflow from generating a starter module. Both workflows need clear validation and error messages.

## Widget Contract

Widgets are React components loaded dynamically from `MODULE_WIDGETS`.

Example:

```tsx
'use client';

import { useService } from '@/app/hooks/useService';

export default function MyWidget({ settings }: { settings?: { url?: string } }) {
    const { data, loading, error } = useService('my-module', 60000);

    if (loading) return <div>Loading</div>;
    if (error) return <div>{error}</div>;

    return <div>{JSON.stringify(data)}</div>;
}
```

For module data, create a matching API route such as `app/api/my-module/route.ts` and call it with `useService('my-module')`. The route should return sample data by default and connected data only when optional connector settings are configured.

## Sample Data Contract

Every user-facing module should have an intentional no-credentials state.

Preferred behavior:

- Sample data is centralized in a predictable helper or data file.
- Sample payload shape matches connected payload shape.
- Widgets can show a subtle demo/sample indicator without looking broken.
- Missing connector settings are not treated as an error for first-run usage.
- Real service failures should not prevent the module from showing a useful fallback when appropriate.

## View Contract

Views are React components loaded dynamically from `MODULE_VIEWS` and rendered by `/view/[id]`.

Views should use the existing layout language and shared components where useful:

```tsx
'use client';

import { BackButton } from '@/app/components/BackButton';

export default function MyView() {
    return (
        <main>
            <BackButton />
            <h1>My Module</h1>
        </main>
    );
}
```

Native views appear in navigation only when the module is enabled in settings and is not hidden.

## Built-In Modules

| Module | Widget | View | Hidden | Purpose |
| --- | --- | --- | --- | --- |
| `adguard` | yes | no | no | AdGuard Home summary |
| `cloudflare` | yes | yes | no | Cloudflare account and DNS data |
| `dockge` | yes | no | no | Dockge status |
| `example-hello` | yes | yes | yes | Template module |
| `glances` | yes | no | no | Glances host metrics |
| `homeassistant` | yes | no | no | Home Assistant status |
| `immich` | yes | no | no | Immich media summary |
| `loopia` | yes | yes | no | Loopia domains, subdomains, and records |
| `npm` | yes | no | no | Nginx Proxy Manager stats |
| `pihole` | yes | no | no | Pi-hole status |
| `plex` | yes | yes | no | Plex server, sessions, libraries, images |
| `proxmox` | yes | no | no | Proxmox VE data |
| `radarr` | yes | yes | no | Radarr movie monitoring |
| `scrypted` | yes | no | no | Scrypted status |
| `sonarr` | yes | yes | no | Sonarr series monitoring |
| `unifi` | yes | no | no | UniFi Network status |
| `uptimekuma` | yes | no | no | Uptime Kuma status |
| `weather` | yes | no | no | Weather and clock |
| `workspace` | yes | no | no | Google Workspace OAuth-backed data |

## Upload And Delete

`POST /api/modules/upload` accepts a zip file form field named `plugin`. It validates the manifest and copies the extracted module into `modules/<id>/`.

`DELETE /api/modules/delete/<id>` removes a module folder.

Both routes expect a bearer token matching `UPLOAD_API_KEY` or `MODULE_API_KEY`. The current settings UI calls these endpoints without adding that authorization header, so browser-based upload and delete require wiring auth into the client or relaxing the server behavior intentionally.
