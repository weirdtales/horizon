# API Routes

API routes live under `app/api`. They keep credentials server-side and provide normalized JSON to widgets and views.

## Route Inventory

| Route | Method | Purpose |
| --- | --- | --- |
| `/api/settings` | `GET` | Return settings with secrets masked |
| `/api/settings` | `POST` | Merge and persist settings |
| `/api/modules/upload` | `POST` | Install a zipped module |
| `/api/modules/delete/[id]` | `DELETE` | Delete an installed module |
| `/api/cloudflare` | route-defined | Cloudflare account or zone data |
| `/api/cloudflare/zones/[id]/dns` | route-defined | Cloudflare DNS records for a zone |
| `/api/loopia/domains` | route-defined | Loopia domain listing |
| `/api/loopia/subdomains` | route-defined | Loopia subdomain listing or mutation |
| `/api/loopia/subdomains/rename` | route-defined | Rename a Loopia subdomain |
| `/api/loopia/records` | route-defined | Loopia DNS record operations |
| `/api/npm/stats` | route-defined | Nginx Proxy Manager status/statistics |
| `/api/npm/proxy-hosts` | route-defined | Nginx Proxy Manager proxy host data |
| `/api/plex` | route-defined | Plex server/session data |
| `/api/plex/debug` | route-defined | Plex diagnostics |
| `/api/plex/image` | route-defined | Plex image proxy |
| `/api/plex/library/[id]` | route-defined | Plex library detail |
| `/api/plex/resources` | route-defined | Plex resource discovery |
| `/api/proxmox` | route-defined | Proxmox data |
| `/api/radarr` | route-defined | Radarr data |
| `/api/sonarr` | route-defined | Sonarr data |
| `/api/weather/geocode` | route-defined | Weather location lookup |
| `/api/workspace` | route-defined | Google Workspace data |
| `/api/workspace/auth` | route-defined | Google OAuth start/auth helper |
| `/api/workspace/callback` | route-defined | Google OAuth callback |

Route-defined methods should be checked in each `route.ts` file before calling directly.

## Settings Route Behavior

`GET /api/settings`:

- Loads `data/settings.json` or defaults.
- Returns `{ settings }`.
- Masks credential-like string values.
- Returns a generic 500 error on failure.

`POST /api/settings`:

- Requires a top-level JSON object with a `settings` object.
- Applies a production Origin/Host check.
- Sanitizes prototype pollution keys.
- Preserves existing secrets when the client sends `********`.
- Writes to `data/settings.json`.

## Module Management Routes

`POST /api/modules/upload`:

- Requires `Authorization: Bearer <UPLOAD_API_KEY or MODULE_API_KEY>`.
- Expects `multipart/form-data` with field `plugin`.
- Enforces a 10 MB file limit.
- Extracts with `adm-zip`.
- Requires `module.json`.
- Allows module ids matching `^[A-Za-z0-9-]+$`.
- Copies the module into `modules/<id>/`.
- Regenerates `lib/registry.ts`.

`DELETE /api/modules/delete/[id]`:

- Requires `Authorization: Bearer <UPLOAD_API_KEY or MODULE_API_KEY>`.
- Allows ids matching `^[A-Za-z0-9-]+$`.
- Removes `modules/<id>/`.
- Regenerates `lib/registry.ts`.

## Client Fetch Pattern

Widgets generally use `app/hooks/useService.ts`:

```ts
const { data, loading, error, refetch } = useService('sonarr', 45000);
```

The hook requests `/api/<endpoint>`, treats non-2xx responses as errors, treats returned `json.error` or `json.status === 'offline'` as service failures, and refreshes on an interval.

## Adding A Service API

Recommended shape:

```ts
import { getSettings } from '@/lib/settings';
import { NextResponse } from 'next/server';

export async function GET() {
    const settings = getSettings();
    const config = settings['my-module'] as { url?: string; apiKey?: string };

    if (!config?.url || !config?.apiKey) {
        return NextResponse.json({ status: 'offline', error: 'Missing configuration' }, { status: 400 });
    }

    try {
        // Fetch external service here.
        return NextResponse.json({ status: 'online' });
    } catch {
        return NextResponse.json({ status: 'offline', error: 'Service unavailable' }, { status: 502 });
    }
}
```

