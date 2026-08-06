# Phase 1 Notes

## New routes

- `GET /api/health` — public configuration check; returns no secrets.
- `GET /api/hose/discovery` — searches Swagger path and model metadata.
- `GET /api/hose/probe` — performs read-only `$top=5` checks against likely resources.
- `GET /api/hose/raw?path=/api/...&limit=25` — protected raw diagnostic preview.
- `GET /api/hose/inventory-preview` — normalized hose inventory.
- `GET /api/hose/testing-preview` — normalized hose testing records.
- `GET /api/hose/combined-preview` — inventory/testing tag comparison.

## Environment variables

Encrypted secrets:

- `OPERATIVE_CLIENT_ID`
- `OPERATIVE_CLIENT_SECRET`
- `SYNC_ADMIN_TOKEN`

Optional text variables after endpoint confirmation:

- `HOSE_INVENTORY_PATH`
- `HOSE_TESTING_PATH`

## Intentionally deferred

- D1 storage and synchronization
- public live dashboard API
- scheduled refresh
- replacement cost configuration
- production dashboard conversion from embedded JSON to live API
