# SCBA Lifecycle v16.2

## Ready for Hydro — Supply Room inventory

- Source of truth changed from generic asset location fields to OperativeIQ **Supply Room inventory**.
- `Due for Hydro` is the hydro-staging supply room.
- `SCBA Warehouse` is the normal supply room.
- Positive on-hand inventory in `Due for Hydro` marks a cylinder `READY FOR HYDRO`.
- Matching supports item IDs plus exact serial, part/serial, UPC/asset number, asset tag, and description identifiers.
- Known validation cylinder: `OK655448` / `SCBA Bottle 390` / `SCBA Cylinder 390`.
- The Worker searches known supply-room inventory routes and compatible GET resources discovered from OperativeIQ Swagger metadata, including supply-room-scoped parameterized GET routes.
- If the supply-room inventory source cannot be resolved, the dashboard warns that Ready for Hydro may be incomplete rather than silently presenting the value as authoritative.
- Manual Refresh continues to bypass the dashboard edge cache.
- Read-only diagnostic route: `/api/scba/supply-room-debug?serial=OK655448` (admin authorization required).
- No OperativeIQ records are modified by this application.
