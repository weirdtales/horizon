# Development

## Requirements

- Node.js compatible with the project dependencies.
- npm.
- Docker, when building or running the containerized app.

The Dockerfile uses `node:24-alpine`. Local development should use a current Node version that supports Next.js 16 and React 19.

## Install

```bash
npm install
```

## Run Locally

```bash
npm run dev
```

This starts Next.js in development mode. The `predev` script runs `node scripts/generate-registry.mjs` first, so module additions are reflected in `lib/registry.ts`.

## Build

```bash
npm run build
npm run start
```

The `prebuild` script regenerates the module registry before Next.js builds the standalone output.

## Lint

```bash
npm run lint
```

`lint-staged` is configured for staged TypeScript, JavaScript, JSON, CSS, and Markdown files. Husky is installed through the `prepare` script.

## Generated Files

`lib/registry.ts` is generated from `modules/*/module.json`, `widget.tsx`, and `view.tsx`.

Regenerate manually when needed:

```bash
node scripts/generate-registry.mjs
```

Do not hand-edit registry entries for normal module work. Edit the module folder and regenerate.

## Adding A Page

Add App Router pages under `app/<route>/page.tsx`.

Use existing shared components where possible:

- `app/components/BackButton.tsx`
- `app/components/DashboardIcon.tsx`
- `app/components/MD3Toast.tsx`
- `app/components/ModuleSettingsDialog.tsx`
- `app/components/PageHeader.tsx`

## Adding An API Route

Add `app/api/<name>/route.ts`.

Preferred route behavior:

- Return a useful sample-mode payload when connector settings are missing.
- Read optional connector credentials through `getSettings()`.
- Validate required configuration before external calls when connected mode is enabled.
- Return normalized JSON for widgets and views.
- Avoid leaking internal errors to the client.
- Use `sanitizeUrl` for user-configured URLs before using them in UI-facing paths.
- Keep optional connector credentials server-side only.

## Adding A Module

Create:

```text
modules/<id>/
  module.json
  widget.tsx
  view.tsx        optional
```

Then run:

```bash
node scripts/generate-registry.mjs
```

See [Modules](./modules.md) for the full module contract.

## Local Data

Runtime settings are written to:

```text
data/settings.json
```

Delete or move this file to return to defaults. Preserve it when testing migrations or behavior that depends on existing settings.
