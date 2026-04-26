# Deployment

Horizon supports Docker and bare-metal Node.js deployment.

## Docker Compose

The repository includes:

```yaml
services:
  dashboard:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: horizon-dashboard
    restart: unless-stopped
    ports:
      - "3000:3000"
    volumes:
      - ./data:/app/data
    environment:
      - NODE_ENV=production
      - NEXT_TELEMETRY_DISABLED=1
```

Start:

```bash
docker compose up -d --build
```

Open:

```text
http://localhost:3000
```

## Dockerfile

The Dockerfile uses a three-stage build:

1. `deps`: installs dependencies with `npm ci`.
2. `builder`: copies the repository and runs `npm run build`.
3. `runner`: copies Next.js standalone output, static assets, and public assets.

Production runtime:

- Runs as non-root user `nextjs`.
- Exposes port `3000`.
- Sets `HOSTNAME=0.0.0.0`.
- Uses `node server.js`.
- Creates `/app/data` with the correct ownership.

## Persistence

Persist this path:

```text
/app/data
```

The compose file maps it to:

```text
./data
```

This is where `settings.json` is stored. Without a persistent volume, settings are lost when the container is replaced.

## Bare Metal

```bash
npm install
npm run build
npm run start
```

The app listens on the Next.js default production port unless `PORT` is set.

## Environment Variables

Known variables:

- `NODE_ENV=production`: enables production behavior, including settings API Origin checks.
- `NEXT_TELEMETRY_DISABLED=1`: disables Next.js telemetry.
- `PORT`: production server port.
- `HOSTNAME`: host binding for standalone server.
- `UPLOAD_API_KEY`: bearer token for module upload/delete routes.
- `MODULE_API_KEY`: fallback bearer token for module upload/delete routes.

Google Workspace and service credentials are stored in `data/settings.json` through the settings UI, not environment variables.

## Reverse Proxy Notes

When placing Horizon behind a reverse proxy:

- Forward the original `Host` header correctly because `/api/settings` uses Origin/Host comparison in production.
- Ensure WebSocket or streaming support is available if future Next.js features need it.
- Keep Horizon on HTTPS when it manages credentials for other services.

## Backup And Restore

Back up:

```text
data/settings.json
```

Restore by stopping the app, replacing `data/settings.json`, and starting the app again.

