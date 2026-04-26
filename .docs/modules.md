# Modules

Modules are self-contained dashboard extensions. They live in `modules/<id>/`, declare metadata in `module.json`, and can provide a widget, a native full-page view, or both.

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

For live service data, create a matching API route such as `app/api/my-module/route.ts` and call it with `useService('my-module')`.

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

