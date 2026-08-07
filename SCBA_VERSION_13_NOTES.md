# WTFD SCBA Cylinder Lifecycle — Version 13

Production SCBA-native rebuild.

- Hard-locks dashboard inventory to OperativeIQ asset class 41 (SCBA Cylinder).
- Hard-locks hydro history to form 37 and maintenance type 32.
- Uses a new versioned cache key so old hose payloads cannot be reused.
- Adds dataset-integrity checks and de-duplicates cylinders by OperativeIQ item ID.
- Includes serial number and SCBA-specific fields in dashboard payload.
- Frontend refuses to render any payload that is not SCBA_CYLINDER / asset class 41.
- UI identifies build v13 and displays unique-cylinder count in the live status line.
