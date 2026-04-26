# Configuration

Horizon stores runtime configuration in `data/settings.json`. Defaults are defined in `lib/settings.ts`.

## Persistence

`getSettings()`:

- Reads `data/settings.json` when it exists.
- Falls back to `defaultSettings` when it does not.
- Backfills `dashboard`, `navigation`, and `bookmarks` when older settings are missing those keys.

`saveSettings()`:

- Merges a partial settings object over the current settings object.
- Creates the `data/` directory when missing.
- Writes formatted JSON to `data/settings.json`.

In Docker, `./data:/app/data` preserves settings across container rebuilds.

## Settings API

`GET /api/settings` returns:

```json
{
  "settings": {}
}
```

Secrets are masked in the response. Keys containing password, token, secret, key, or apiKey-like names are returned as `********`.

`POST /api/settings` expects:

```json
{
  "settings": {}
}
```

Write behavior:

- Root arrays, such as `navigation` and `bookmarks`, are overwritten.
- Object sections are merged field by field.
- `********` values are skipped so previously saved secrets are preserved.
- Dangerous keys `__proto__`, `constructor`, and `prototype` are removed.
- In production, cross-origin mutation requests are rejected when the `Origin` header does not match `Host`.

## Core Settings Sections

### Module And Connector Settings

Each module can have a top-level settings object keyed by module id:

```json
{
  "sonarr": {
    "url": "http://192.168.1.10:8989",
    "apiKey": "..."
  }
}
```

These values are defined by each module manifest's `configFields`. For the current demo-first direction, these settings are optional connector settings. Missing credentials should not make the default dashboard unusable; modules should fall back to sample/local data where possible.

Recommended mode model:

```json
{
  "sonarr": {
    "mode": "sample",
    "url": "",
    "apiKey": ""
  }
}
```

The exact persisted shape still needs implementation, but product behavior should distinguish:

- `sample`: works for everyone without credentials.
- `connected`: uses saved connector settings to call a real service.
- `offline` or `misconfigured`: only applies after the user opts into real connector mode.

### Module UI Setup

Normal users should configure modules through the settings UI, not by manually editing `data/settings.json`.

Expected setup behavior:

- Built-in modules are listed from the generated registry.
- The settings UI renders module fields from each manifest's `configFields`.
- Users can save connector settings per module.
- Secrets returned by `/api/settings` remain masked.
- Empty connector settings keep the module in sample mode instead of producing a broken dashboard.
- Module enablement controls whether native views appear in navigation.

### Custom Module Metadata

Custom modules created through the UI should persist source files under `modules/<id>/`, not only settings data.

Settings can track UI-level state for custom modules:

```json
{
  "modules": {
    "my-module": {
      "enabled": true,
      "mode": "sample"
    }
  }
}
```

The module source contract remains:

```text
modules/my-module/
  module.json
  widget.tsx
  view.tsx
```

The UI should create or upload module files, regenerate `lib/registry.ts`, and then allow normal configuration through the same module settings surface.

### Dashboard

```json
{
  "dashboard": {
    "rows": [],
    "widgetSizes": {}
  }
}
```

Rows contain sections. Sections contain `layout` entries. A layout entry can be a simple widget id string or a React Grid Layout object with at least `i`, `x`, `y`, `w`, and `h`.

The current dashboard UI also stores visual overrides under `dashboard.widgetVisuals` even though that key is not declared in the exported `AppSettings` type.

### Navigation

```json
{
  "navigation": [
    {
      "id": "home",
      "label": "Dashboard",
      "icon": "Home",
      "path": "/",
      "visible": true
    }
  ]
}
```

Fields:

- `id`: stable identifier.
- `label`: display name.
- `icon`: Lucide icon name.
- `path`: internal path or external URL.
- `visible`: whether to show in navigation.
- `isIframe`: when true, external links can open through `/view?url=...`.

Enabled native module views are appended dynamically by `app/layout.tsx`.

### Appearance

```json
{
  "appearance": {
    "theme": "dark",
    "accentColor": "blue",
    "showHeaderStats": false
  }
}
```

Supported theme modes:

- `light`
- `dark`
- `system`
- `time`

Optional appearance keys include `userName`, `bgType`, `backgroundColor`, `backgroundImage`, `dayStart`, and `nightStart`.

### Bookmarks

```json
{
  "bookmarks": [
    {
      "id": "docs",
      "name": "Docs",
      "url": "https://example.com",
      "icon": "Globe",
      "color": "#64B5F6",
      "size": "square"
    }
  ]
}
```

`size` may be `square` or `wide`.

### Module Enablement

```json
{
  "modules": {
    "plex": {
      "enabled": true
    }
  }
}
```

Enablement controls module navigation. Widgets can still be placed on the dashboard if they are registered and present in layout data.
