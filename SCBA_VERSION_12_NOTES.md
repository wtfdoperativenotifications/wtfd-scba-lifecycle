# WTFD SCBA Cylinder Lifecycle — Version 12

## Critical correction

- Corrected `SCBA_ASSET_CLASS_ID` from 16 to the confirmed OperativeIQ SCBA Cylinder asset class **41**.
- The production dashboard resolver now defaults directly to asset class 41 so an old Worker variable cannot redirect the dashboard to another asset class.
- Diagnostic SCBA endpoints may still accept an explicit `?assetClassId=` query parameter.
- Hydrostatic maintenance linkage remains restricted to form **37** and maintenance type **32**.
- OperativeIQ `preventativeMaintenanceNextPmdate` remains the authoritative next hydro date.

This build is read-only with respect to OperativeIQ.
