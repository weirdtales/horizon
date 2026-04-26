# Questions And Answers

## 2026-04-26

### Question

How do I connect the module options to the actual service, right now its dummy data?

### Answer

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

