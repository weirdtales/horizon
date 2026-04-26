# Horizon Documentation

This folder contains maintainer-oriented documentation for the Horizon Dashboard repository.

Horizon is a self-hosted Next.js dashboard for homelab services. The app is built around a generated module registry, persistent JSON settings, dashboard widgets, optional module views, and server-side API routes that proxy or normalize data from configured services.

## Documents

- [Architecture](./architecture.md): application structure, runtime flow, and important boundaries.
- [Development](./development.md): local setup, commands, code generation, and contribution workflow.
- [Configuration](./configuration.md): persisted settings model, dashboard layout, navigation, appearance, and secrets behavior.
- [Modules](./modules.md): built-in module inventory and module development contract.
- [API Routes](./api-routes.md): route inventory and how routes relate to settings and modules.
- [Deployment](./deployment.md): Docker, bare-metal, persistence, and production notes.
- [Security And Operations](./security-and-operations.md): security controls, operational checks, and known caveats.

## Repository At A Glance

```text
app/                    Next.js App Router pages, layouts, hooks, components, and API routes
lib/                    Shared settings, type definitions, URL utilities, integrations, and generated registry
modules/                Built-in and uploaded dashboard modules
public/                 Static assets
scripts/                Build-time registry generation
data/                   Runtime settings persistence, mounted into Docker
.docs/                  Maintainer documentation
```

## Primary Commands

```bash
npm install
npm run dev
npm run build
npm run start
npm run lint
```

`npm run dev` and `npm run build` both run `scripts/generate-registry.mjs` first through the `predev` and `prebuild` lifecycle scripts.

