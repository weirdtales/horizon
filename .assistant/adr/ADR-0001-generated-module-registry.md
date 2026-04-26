# ADR-0001: Generated Module Registry

Date: 2026-04-26
Status: Proposed

## Context

Horizon modules live under `modules/<id>/` and can provide manifests, widgets, and optional views. The app needs a predictable way to discover modules while still using static imports compatible with Next.js bundling.

## Decision

Use `scripts/generate-registry.mjs` to scan module folders and generate `lib/registry.ts` with manifest imports, dynamic widget imports, and dynamic view imports.

## Alternatives

- Runtime filesystem discovery in application code.
- Manual registry maintenance.
- Remote plugin registry as the primary source of truth.

## Consequences

- Module additions require registry regeneration.
- `npm run dev` and `npm run build` already run generation through lifecycle scripts.
- The generated file can be reviewed and committed for deterministic builds.
- Upload/delete routes must regenerate the registry after changing module files.

