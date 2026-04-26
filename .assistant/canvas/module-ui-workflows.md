# Module UI Workflows

This document describes the intended module setup workflows.

## Product Intent

Horizon should be useful immediately after clone/install, and users should be able to make it their own through the UI.

There are two related workflows:

- Configure built-in modules.
- Add custom modules.

Both workflows should preserve the demo-first rule: sample mode works without credentials, and connected mode is optional.

## Configure Built-In Modules

User goal: "I want to turn on and configure a module from the UI."

Flow:

1. User opens Settings.
2. User opens Modules/Plugins.
3. UI lists modules from `MODULE_MANIFESTS`, excluding `hidden` modules.
4. User selects a module.
5. UI shows module identity, enablement, mode, manifest-defined fields, and save/cancel actions.
6. User saves.
7. Settings are persisted through `/api/settings`.
8. Dashboard and navigation refresh from saved settings.

Acceptance expectations:

- Empty connector fields do not break the widget.
- Password/token fields remain masked on reload.
- Sample mode can be selected again after connected mode.
- Native views only appear in navigation when enabled and registered.

## Add Custom Module

User goal: "I want to create my own module."

Flow:

1. User opens Settings.
2. User opens Modules/Plugins.
3. User chooses Add Custom Module.
4. UI collects id, name, icon, color, description, capabilities, and optional config fields.
5. Server validates the request.
6. Server creates `modules/<id>/`.
7. Server writes starter files: `module.json`, `widget.tsx`, and optional `view.tsx`.
8. Server regenerates `lib/registry.ts`.
9. UI reloads module registry state and shows the new module.

Starter module expectations:

- Works in sample mode immediately.
- Does not require external credentials.
- Uses safe generated code, not arbitrary browser-submitted executable code.
- Gives users clear local file paths to edit next.

## Upload Custom Module

User goal: "I already have a packaged module and want to install it."

Flow:

1. User opens Settings.
2. User chooses Upload Module.
3. User selects a zip.
4. Server validates the archive.
5. Server installs it under `modules/<id>/`.
6. Server regenerates `lib/registry.ts`.
7. UI shows success or actionable validation errors.

Security expectations:

- Upload/delete requires an intentional authorization model.
- Module id validation prevents path traversal.
- Archive extraction cannot write outside `modules/<id>/`.
- Uploaded modules are trusted local code once installed; docs must say this plainly.

## Open Implementation Questions

- Should UI-created modules be available in production containers where source files may not be writable?
- Should module creation be disabled unless an admin/module API key is configured?
- Should starter module generation happen through a new API route separate from zip upload?
- Should custom modules be stored as source files only, or should metadata also be tracked in `data/settings.json`?

