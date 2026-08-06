# WTFD SCBA Cylinder Lifecycle — Version 1

Adapted from the hose lifecycle dashboard.

## Core logic
- Live, read-only OperativeIQ inventory retrieval
- Automatic SCBA cylinder asset-class discovery
- Clickable KPI cards and filtered worklists
- Hydrostatic-test history and next-test visibility
- 15-year retirement planning (configurable)
- Missing manufacturer, manufacture/in-service date, next hydro date, and history quality checks

## Required Cloudflare secrets / variables
- OPERATIVE_CLIENT_ID
- OPERATIVE_CLIENT_SECRET
- SYNC_ADMIN_TOKEN
- Optional SCBA_INVENTORY_PATH
- Optional SCBA_TESTING_PATH

The first deployment should use the discovery endpoints to confirm the exact OperativeIQ SCBA asset class and hydrostatic maintenance linkage.
