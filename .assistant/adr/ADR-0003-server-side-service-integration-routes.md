# ADR-0003: Server-Side Service Integration Routes

Date: 2026-04-26
Status: Proposed

## Context

Modules may eventually display data from services that require tokens, passwords, or local network access. Client-side direct calls would expose credentials and fail for many private services. The default product experience, however, should not require those services to exist.

## Decision

Widgets and views fetch local Horizon API routes such as `/api/cloudflare`. Those routes return normalized JSON. By default they may return sample-mode data; when optional connector settings are present, they can read saved settings with `getSettings()` and call upstream services server-side.

## Alternatives

- Direct browser calls from widgets to upstream services.
- A single generic proxy endpoint.
- Per-module client secrets stored in browser storage.

## Consequences

- Credentials stay server-side.
- API routes become the data contract for modules across sample and connected modes.
- Each service route needs validation, timeout behavior, and sanitized errors.
- The settings-to-service flow must be kept consistent across manifests, types, defaults, routes, widgets, and views when connector mode is implemented.
- The sample-mode experience must remain useful when no connector settings exist.
