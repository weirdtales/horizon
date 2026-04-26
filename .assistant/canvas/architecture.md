# Architecture

Horizon is a Next.js App Router application with client-rendered dashboard screens, server-side API routes, and a generated registry that binds module manifests to React widgets and views.

## Runtime Shape

```text
Browser UI
  |
  | fetch /api/settings and /api/<module>
  v
Next.js App Router
  |
  | reads/writes data/settings.json
  | imports generated lib/registry.ts
  | returns sample data by default
  | optionally proxies real services from connector routes
  v
Sample data or configured connectors
```

Important runtime files:

- `app/layout.tsx`: global shell, navigation, theme application, module view navigation.
- `app/page.tsx`: main editable dashboard with rows, sections, widgets, bookmarks, and visual settings.
- `app/settings/page.tsx`: settings UI for appearance, navigation, bookmarks, module config, module enablement, upload, and delete.
- `app/view/[id]/page.tsx`: renders registered native module views from `MODULE_VIEWS`.
- `app/view/page.tsx`: iframe wrapper for configured external links.
- `app/api/*/route.ts`: server-side API boundaries for settings, sample module data, and optional integrations.
- `lib/settings.ts`: default settings and JSON persistence.
- `lib/registry.ts`: generated module manifest, widget, and view imports.
- `scripts/generate-registry.mjs`: scans `modules/*` and rewrites `lib/registry.ts`.

## Module Registry

Modules live under `modules/<id>/` and are discovered by `scripts/generate-registry.mjs`.

The generator:

- Requires a `module.json`.
- Requires manifest fields `id`, `name`, `icon`, and `color`.
- Requires the folder name to match `module.json.id`.
- Imports all valid manifests into `MODULE_MANIFESTS`.
- Registers `widget.tsx` in `MODULE_WIDGETS` when present.
- Registers `view.tsx` in `MODULE_VIEWS` when present.
- Warns when manifest flags and files disagree.

The registry is intentionally generated code. After adding, removing, or renaming modules, run:

```bash
node scripts/generate-registry.mjs
```

The normal `npm run dev` and `npm run build` commands do this automatically.

## Settings Boundary

Settings are stored in `data/settings.json` through `lib/settings.ts`.

The central API boundary is `/api/settings`:

- `GET` returns settings with secrets masked as `********`.
- `POST` merges supplied settings into the current settings file.
- Arrays such as `navigation` and `bookmarks` are overwritten.
- Masked secret placeholders are ignored on write, preserving the stored secret.
- Prototype pollution keys are removed recursively.

Client screens should treat `/api/settings` as the source of truth and should not read the file directly.

## Module Data Boundary

The current product direction is demo-first:

- Modules should render useful sample/local data without requiring credentials.
- API routes should return compatible payload shapes for sample and connected modes.
- Real external services are optional connector behavior, not the baseline first-run requirement.
- Widgets should not contain scattered hardcoded dummy literals; sample data should be centralized as implementation work proceeds.

## Navigation

Navigation is composed from two sources:

- User-managed `settings.navigation`.
- Enabled native module views from `MODULE_MANIFESTS` and `MODULE_VIEWS`.

A module appears in navigation only when:

- It has a native `view.tsx` registered in `MODULE_VIEWS`.
- `settings.modules[id].enabled === true`.
- The manifest is not marked `hidden: true`.

External links can be wrapped by `/view?url=<encoded-url>` when configured as iframe links.

## Dashboard Model

The dashboard is built from:

- Rows: `DashboardRow[]`
- Sections inside each row: `DashboardSection[]`
- Layout entries inside each section: strings or React Grid Layout item objects
- Widget size overrides: `dashboard.widgetSizes`
- Widget visual overrides: currently used by the dashboard UI as `dashboard.widgetVisuals`
- Bookmarks: `bookmarks[]`

`app/page.tsx` uses `react-grid-layout/legacy` for responsive desktop grid behavior and has separate mobile-oriented controls through `useMobile`.

## Styling Model

The application uses Material Design 3-inspired CSS variables in `app/globals.css`, plus dynamic theme attributes on `<html>`:

- `data-theme`: `light`, `dark`, or derived value from `system` and `time`.
- `data-accent`: selected accent color name.

Global layout reads appearance settings, sanitizes background URLs, and applies the theme on page load and settings updates.
