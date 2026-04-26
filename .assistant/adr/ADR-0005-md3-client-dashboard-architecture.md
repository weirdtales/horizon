# ADR-0005: MD3 Client Dashboard Architecture

Date: 2026-04-26
Status: Proposed

## Context

Horizon is an interactive dashboard with editable layout, module widgets, dynamic appearance settings, and responsive behavior.

## Decision

Use a client-rendered Next.js App Router UI with MD3-inspired CSS variables, `react-grid-layout` for dashboard layout, Lucide icons, and shared components for navigation, dialogs, icons, and toast feedback.

## Alternatives

- Server-rendered static dashboard pages.
- A separate SPA outside Next.js.
- A minimal link-page UI without rich module widgets.

## Consequences

- Client components own dashboard editing and live settings refresh.
- Consistent design depends on shared CSS variables and component conventions.
- Browser regression checks are important for layout and responsive behavior.
- API routes remain responsible for module data, including sample data by default and credentials/external service calls only for optional connector mode.
