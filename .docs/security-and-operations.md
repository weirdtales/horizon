# Security And Operations

## Security Controls

### Settings API

`/api/settings` includes:

- Credential masking on `GET`.
- Basic production CSRF protection using Origin/Host comparison on `POST`.
- Recursive removal of `__proto__`, `constructor`, and `prototype`.
- Preservation of existing secrets when the client sends masked placeholders.
- Generic error responses for server failures.

### URL Sanitization

`lib/url.ts` provides:

- `sanitizeUrl()`: blocks `javascript:`, `data:`, `vbscript:`, `file:`, and `blob:` protocols, limits URL length, allows HTTP(S), internal paths, localhost, and IPv4-style addresses.
- `sanitizeText()`: strips unsafe characters from display text.

Use `sanitizeUrl()` before rendering or navigating to user-provided URLs.

### HTTP Headers

`next.config.ts` sets global headers:

- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- `X-XSS-Protection: 1; mode=block`
- `Content-Security-Policy`

The CSP currently allows broad image sources and frame sources to support dashboards and embedded services. Tighten it for locked-down deployments.

### Module Upload And Delete

Module management routes require a bearer token matching `UPLOAD_API_KEY` or `MODULE_API_KEY`.

Upload protections include:

- 10 MB limit.
- Filename sanitization.
- Manifest validation.
- Module id allowlist.
- Destination path check.
- JavaScript zip extraction through `adm-zip`.
- Temporary file cleanup.

Deleting a module validates the id and removes only `modules/<id>`.

## Operational Checks

### Validate Registry

```bash
node scripts/generate-registry.mjs
```

Expected result is a success message with the number of registered modules. Warnings usually mean a manifest and files disagree.

### Validate Build

```bash
npm run build
```

This checks registry generation, TypeScript compilation through Next.js, and standalone output generation.

### Validate Lint

```bash
npm run lint
```

Run this before opening a pull request.

### Check Runtime Settings

The runtime settings file is:

```text
data/settings.json
```

If the app behaves unexpectedly after settings changes, compare this file with `defaultSettings` in `lib/settings.ts`.

## Known Caveats

- The settings UI currently calls module upload/delete routes without an Authorization header, while the server requires one. Browser-based plugin installation and deletion will return `401` until the client sends a bearer token or the route policy is changed intentionally.
- `dashboard.widgetVisuals` is used by `app/page.tsx` but is not declared on `AppSettings.dashboard` in `lib/types.ts`.
- `lib/modules.ts` has a `ConfigField` type that does not include `select`, while `lib/types.ts` and the weather manifest use `select`.
- Several service pages exist outside the generic `/view/[id]` module view flow. Check `app/layout.tsx` before changing managed service navigation behavior.
- `data/settings.json` can contain service credentials. Treat backups and logs carefully.

## Incident Response Basics

If credentials are exposed:

1. Rotate credentials in the upstream service.
2. Update Horizon settings.
3. Remove old values from `data/settings.json` backups if applicable.
4. Rebuild or restart only after settings are corrected.

If module upload is abused:

1. Stop the app.
2. Inspect and remove suspicious folders under `modules/`.
3. Rotate `UPLOAD_API_KEY` or `MODULE_API_KEY`.
4. Regenerate the registry.
5. Rebuild and redeploy.

