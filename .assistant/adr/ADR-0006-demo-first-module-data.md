# ADR-0006: Demo-First Module Data

Date: 2026-04-26
Status: Proposed

## Context

The initial backlog over-prioritized connecting modules to real homelab services. The product direction changed: Horizon should work for everybody first, including users who do not have private services or credentials available during evaluation.

## Decision

Modules should support an intentional sample/demo mode by default. Real service connectors are optional enhancements that can be enabled later through settings.

## Alternatives

- Require real service credentials before widgets show useful data.
- Keep scattered hardcoded dummy values inside widget components.
- Remove service-shaped modules until real connectors are ready.

## Consequences

- The first-run experience can be polished and broadly usable.
- Sample payloads need a shared location and stable shape.
- Widgets should render sample and connected data through the same contract where possible.
- Future connector work must preserve the no-credentials experience.

