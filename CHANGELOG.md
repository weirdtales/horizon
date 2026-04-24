# Changelog

All notable changes to this project will be documented in this file.

## [1.3.0] - 2026-04-23

### Added
- **Open Source Preparation**: Official release with MIT License and public documentation.
- **Security**: Comprehensive Host header validation in API routes to prevent injection attacks.
- **Security**: Added `hasChanges` confirmation prompts to settings to prevent accidental data loss during authentication flows.
- **Accessibility**: Added ARIA roles and keyboard navigation (Escape key) to `ModuleSettingsDialog`.
- **Infrastructure**: Added dynamic geocoding support for Open-Meteo weather integration (keyless mode).
- **Design**: Unified elevation levels (4 and 5) and consolidated global animations in `globals.css`.

### Changed
- **Plex Integration**: Unified `allowInsecure` behavior across connection probing and data fetching.
- **Resource Management**: Implemented `AbortController` in Radarr and Sonarr views for safer request cancellation.
- **UI/UX**: Standardized background opacities using `color-mix` for better theme support across color formats.
- **Loopia**: Added protection pulse animations and dynamic health-based footer states.

### Fixed
- **Stability**: Resolved "NaN TB" display issues in Radarr/Sonarr storage metrics.
- **Security**: Hardened async file I/O operations and sanitized dynamic labels.

## [1.2.0] - 2026-04-22

### Changed
- Overhauled Plex server name fetching logic to prioritize user-defined 'friendlyName'.
- Refactored Weather Widget with dynamic contrast engine for Light Mode legibility.
- Synchronized global design system with MD3 semantic tokens.
- Streamlined widget headers by removing redundant status labels.

### Added
- Centralized 'About & System' section in settings with release notes history.
- XSS sanitization for dynamic text labels.

## [1.1.0] - 2026-04-18

### Added
- **Material 3**: Full surface color system implementation across all widgets.
- **Themes**: Introduced 'Glass' theme variant with theme-aware opacities.
- **Auth**: Plex SSO (OAuth) support for secure server discovery.
- **UI**: Searchable service gallery and custom icons in sidebar.

### Fixed
- Improved dashboard grid stability and mobile layout responsiveness.

## [1.0.0] - 2026-04-15

### Added
- Initial launch of the Horizon Core dashboard.
- Support for Loopia, Cloudflare, Plex, Immich, and Home Assistant.
- Customizable bento grid layout with drag-and-drop.
- Global search for settings and navigation.
- Dark and Light mode with system syncing.
