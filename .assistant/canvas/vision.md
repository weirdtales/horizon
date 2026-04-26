# Vision

## Problem Statement

People evaluating a dashboard should not need a full homelab, private credentials, or several upstream services just to see value. Horizon aims to provide a polished, self-hosted dashboard experience that works immediately with sample/local data, while still leaving room for optional real service connectors later.

## Target Users

- Users who want a polished personal dashboard that is useful on first run.
- Homelab enthusiasts who may later connect services such as Plex, Sonarr, Radarr, Cloudflare, Loopia, UniFi, Proxmox, Home Assistant, Pi-hole, AdGuard, Immich, and Nginx Proxy Manager.
- Technical users who prefer self-hosted tools and Docker-based deployment, but should not need credentials to evaluate the product.
- Contributors who want to add their own dashboard widgets or service views through a module system.

## Product Direction

Horizon should feel like a premium, modular dashboard rather than a static link page. The default experience should be complete enough for any user to understand the product immediately. Real service data should be an enhancement, not a prerequisite.

## Definition Of Success

- Users can deploy Horizon with Docker and see a useful dashboard without configuring real services.
- Sample/demo data is centralized, intentional, and visibly distinct from connected real data.
- Users can later configure real services and see live data without editing source code.
- Developers can add a module by creating a folder, manifest, widget, optional view, and optional API route.
- Credentials remain server-side and are not exposed in browser components.
- The dashboard remains usable on both desktop and mobile.

## Non-Goals

- Horizon is not a SaaS-hosted dashboard.
- Horizon is not initially a full replacement for each upstream service's administration UI.
- Horizon does not require real service connectors for the first public usable version.
- Horizon is not currently a signed plugin marketplace.
- Horizon should not require a database until JSON settings become a clear bottleneck.
