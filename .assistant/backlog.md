# Backlog

Source documents: README, CHANGELOG, DEVELOPING_PLUGINS, `.assistant/canvas/*`, current code, and local git history.

## P-001: Normalize Assistant Workspace

- **Status:** Done
- **Priority:** Now
- **Tags:** docs, migration, workflow
- **Reference:** Migration instructions; canvas docs generated from repository review
- **Effort Estimate:** 1 day
- **Depends on:** none

**Acceptance Criteria:**

- [x] `.assistant/backlog.md`, `.assistant/plan.md`, `.assistant/status.md`, and `.assistant/history.md` contain Horizon-specific content.
- [x] Existing architecture, module, API, deployment, configuration, and operations docs are available under `.assistant/canvas/`.
- [x] Open questions from `.assistant/canvas/questions.md` are reflected in `.assistant/status.md`.

**Out of Scope:**

- Runtime code changes.

## P-002: Make Modules Work Without Real Services

- **Status:** Todo
- **Priority:** Now
- **Tags:** modules, demo-data, onboarding, api
- **Reference:** `.assistant/canvas/questions.md`; `.assistant/canvas/api-routes.md`; `.assistant/canvas/modules.md`
- **Effort Estimate:** 2-3 days
- **Depends on:** P-001

**Acceptance Criteria:**

- [ ] The default dashboard renders useful, polished module states without requiring private service credentials.
- [ ] Widgets/views fetch Horizon API routes or local sample-data helpers rather than embedding ad hoc dummy literals in UI components.
- [ ] API routes support a documented demo/sample mode when service settings are missing.
- [ ] At least one representative module is verified end to end in no-credentials mode.

**Out of Scope:**

- Full real-service connector implementation for every built-in module.

## P-003: Fix Plugin Upload And Delete Authorization Flow

- **Status:** Todo
- **Priority:** Now
- **Tags:** security, plugins, settings-ui
- **Reference:** `.assistant/canvas/security-and-operations.md`; `app/api/modules/upload/route.ts`; `app/api/modules/delete/[id]/route.ts`
- **Effort Estimate:** 1-2 days
- **Depends on:** P-001

**Acceptance Criteria:**

- [ ] Settings UI either sends a bearer token for module upload/delete or the product explicitly removes browser upload/delete.
- [ ] Server authorization behavior is documented in canvas and status.
- [ ] Failed authorization produces an actionable UI message.
- [ ] Existing route path validation and registry regeneration remain intact.

**Out of Scope:**

- Plugin marketplace or remote plugin discovery.

## P-004: Align Settings And Module Types

- **Status:** Todo
- **Priority:** Now
- **Tags:** types, settings, modules
- **Reference:** `.assistant/canvas/security-and-operations.md` known caveats
- **Effort Estimate:** 1 day
- **Depends on:** P-001

**Acceptance Criteria:**

- [ ] `dashboard.widgetVisuals` is represented in the exported settings types or removed from persisted writes.
- [ ] Module config field types consistently include observed values such as `select` and `url`.
- [ ] `lib/modules.ts` and `lib/types.ts` do not drift on manifest/config definitions.
- [ ] `npm run lint` passes after type cleanup.

**Out of Scope:**

- Large settings migration framework.

## P-005: Add Demo Contract Tests Or Smoke Checks

- **Status:** Todo
- **Priority:** Next
- **Tags:** tests, api, demo-data, reliability
- **Reference:** `.assistant/canvas/api-routes.md`; `.assistant/canvas/security-and-operations.md`
- **Effort Estimate:** 2-3 days
- **Depends on:** P-002

**Acceptance Criteria:**

- [ ] Settings route masking and masked-secret preservation are covered by automated or scripted checks.
- [ ] Registry generation is checked in CI or a documented local smoke command.
- [ ] At least one module route has sample-mode success and missing-config coverage.
- [ ] The documented verification path is added to `.assistant/canvas/development.md`.

**Out of Scope:**

- Full browser end-to-end test suite.

## P-006: Define Real Connector Boundary

- **Status:** Todo
- **Priority:** Next
- **Tags:** connectors, reliability, security, integrations
- **Reference:** CHANGELOG 1.3.0 safety work; service API route inventory
- **Effort Estimate:** 2-3 days
- **Depends on:** P-002

**Acceptance Criteria:**

- [ ] The product has a clear distinction between demo/sample mode and opt-in real connector mode.
- [ ] Real connector routes use bounded timeouts or abort signals where appropriate.
- [ ] Connector errors avoid leaking credentials, host internals, or raw upstream payloads.
- [ ] Widgets render demo, connected, loading, offline, and misconfigured states consistently.
- [ ] Operational caveats are captured in `.assistant/canvas/security-and-operations.md`.

**Out of Scope:**

- Central observability platform.

## P-007: Define Module Packaging And Distribution Policy

- **Status:** Todo
- **Priority:** Next
- **Tags:** plugins, distribution, docs
- **Reference:** DEVELOPING_PLUGINS; module upload route behavior
- **Effort Estimate:** 1-2 days
- **Depends on:** P-003

**Acceptance Criteria:**

- [ ] Module zip structure is documented with accepted and rejected examples.
- [ ] Hidden/internal module behavior is documented.
- [ ] Upload size, id rules, and registry regeneration behavior are documented in user-facing language.
- [ ] Security tradeoffs of installing local code are explicit.

**Out of Scope:**

- Signed plugin packages.

## P-008: Create A Product TRD From Current Implementation

- **Status:** Todo
- **Priority:** Later
- **Tags:** trd, product, architecture
- **Reference:** README, CHANGELOG, canvas docs
- **Effort Estimate:** 2 days
- **Depends on:** P-001

**Acceptance Criteria:**

- [ ] `.assistant/trd/horizon-core.md` captures product goals and technical constraints.
- [ ] Backlog items reference the TRD after creation.
- [ ] Non-goals and release boundaries are explicit.

**Out of Scope:**

- New feature implementation.

## P-009: Create Shared Sample Data Layer

- **Status:** Done
- **Priority:** Now
- **Tags:** demo-data, architecture, modules
- **Reference:** New product direction: works for everybody before real service setup
- **Effort Estimate:** 1-2 days
- **Depends on:** P-001

**Acceptance Criteria:**

- [x] Shared sample data lives in a predictable location rather than being scattered inside widget components.
- [x] Sample payloads match the normalized shapes used by widgets and views.
- [x] Modules can clearly indicate demo/sample mode in UI without looking broken.
- [x] Adding a new module includes a sample-data expectation in docs.

**Out of Scope:**

- Realistic synchronization with external services.

## P-010: Update Onboarding For Public Demo-First Use

- **Status:** Todo
- **Priority:** Now
- **Tags:** onboarding, ux, docs
- **Reference:** README; `.assistant/canvas/vision.md`; `.assistant/canvas/configuration.md`
- **Effort Estimate:** 1-2 days
- **Depends on:** P-002

**Acceptance Criteria:**

- [ ] First run explains that Horizon works immediately with demo/sample data.
- [ ] Settings clearly label real service connections as optional advanced configuration.
- [ ] README and canvas docs no longer imply real credentials are required for a useful experience.
- [ ] Users can discover how to switch from sample mode to a real connector later.

**Out of Scope:**

- Guided multi-step setup wizard.

## P-014: Make Demo Mode A Visible Product Feature

- **Status:** In Progress
- **Priority:** Now
- **Tags:** demo-data, ux, product, modules
- **Reference:** `.assistant/suggestions.md`; ADR-0006; `.assistant/canvas/modules.md`
- **Effort Estimate:** 1-2 days
- **Depends on:** P-009

**Acceptance Criteria:**

- [ ] Sample/demo mode is visibly represented in module widgets and module settings without feeling like an error state.
- [ ] Modules expose a consistent mode label or badge for `sample` and future `connected` states.
- [ ] Empty credentials keep modules in sample mode instead of showing failure by default.
- [ ] The dashboard communicates that sample data is intentional and editable/configurable.
- [ ] At least one representative module demonstrates the complete visible sample-mode pattern.

**Out of Scope:**

- Full connected-mode implementation for all modules.

## P-015: Polish First-Build Dashboard Defaults

- **Status:** Done
- **Priority:** Now
- **Tags:** first-run, dashboard, layout, ux
- **Reference:** User screenshot from first build; `lib/settings.ts`; `data/settings.json`; `app/page.tsx`
- **Effort Estimate:** 1 day
- **Depends on:** P-009

**Acceptance Criteria:**

- [x] Fresh default settings use explicit React Grid Layout objects instead of bare widget id strings.
- [x] Legacy string layouts are normalized before rendering so older settings do not collapse widgets.
- [x] First-build dashboard uses widgets that render without private service credentials.
- [x] Bundled `data/settings.json` matches the first-run sample dashboard.

**Out of Scope:**

- Full sample-mode migration for every module.

## P-011: Configure Built-In Modules Through The UI

- **Status:** Todo
- **Priority:** Now
- **Tags:** modules, settings-ui, configuration, ux
- **Reference:** `.assistant/canvas/modules.md`; `.assistant/canvas/configuration.md`; settings page module gallery
- **Effort Estimate:** 2-3 days
- **Depends on:** P-004, P-009

**Acceptance Criteria:**

- [ ] Every built-in visible module can be opened from the settings UI and configured from its manifest-defined fields.
- [ ] Users can choose module mode where applicable: sample/demo first, connected later.
- [ ] Saving module settings updates `data/settings.json` through `/api/settings` without exposing secrets back to the UI.
- [ ] The UI clearly separates display/layout settings from optional connector credentials.
- [ ] A module with no saved credentials still renders a useful sample state.

**Out of Scope:**

- Full real connector implementation for every module.

## P-012: Add Custom Modules Through The UI

- **Status:** Todo
- **Priority:** Now
- **Tags:** modules, custom-modules, settings-ui, plugin-authoring
- **Reference:** `.assistant/canvas/modules.md`; `DEVELOPING_PLUGINS.md`; module upload route behavior
- **Effort Estimate:** 3 days
- **Depends on:** P-003, P-007, P-009

**Acceptance Criteria:**

- [ ] Users can add a custom module from the UI by providing required manifest metadata: id, name, icon, color, and capabilities.
- [ ] The UI can create a starter module that works in sample mode without external credentials.
- [ ] Custom modules appear in the module registry after creation or upload.
- [ ] Custom module validation prevents invalid ids, missing required fields, and path traversal.
- [ ] Users get clear next steps for editing module files locally or packaging/uploading a module.

**Out of Scope:**

- Browser-based arbitrary code editing.
- Remote module marketplace.

## P-013: Document Module Setup And Custom Module Workflows

- **Status:** Todo
- **Priority:** Now
- **Tags:** docs, modules, onboarding
- **Reference:** This planning session; `.assistant/canvas/modules.md`; `.assistant/canvas/configuration.md`
- **Effort Estimate:** 1 day
- **Depends on:** P-011, P-012

**Acceptance Criteria:**

- [ ] Docs describe configuring built-in modules through the UI.
- [ ] Docs describe adding a custom module through the UI.
- [ ] Docs describe the local file contract for custom modules.
- [ ] Docs explain sample mode, connected mode, and when credentials are optional.

**Out of Scope:**

- Full public website documentation rewrite.
