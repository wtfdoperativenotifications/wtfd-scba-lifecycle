# WTFD SCBA Cylinder Lifecycle — Version 11

## Confirmed OperativeIQ configuration
- Asset class ID: 41 (`SCBA Cylinder`)
- Hydrostatic maintenance form ID: 37
- Hydrostatic maintenance type: 32
- Inventory endpoint: `/api/items`
- Maintenance endpoint: `/api/fixed-assets`

## Version 11 changes
- Uses OperativeIQ `preventativeMaintenanceNextPmdate` as the authoritative hydro due date.
- Uses OperativeIQ `decommissionOrOutOfServiceDate` as the authoritative planned decommission date when populated.
- Falls back to an explicitly labeled estimate of in-service date + selected planning age only when planned decommission is blank.
- Adds clickable cards for overdue hydro, due within 90 days, due within one year, planned decommission, and replacement value.
- Adds planned-versus-estimated retirement source reporting.
- Adds annual replacement count and cost forecasting.
- Corrects the production dashboard maintenance filter to form 37 / type 32.
- Defaults to SCBA asset class 41 when the environment variable is not set.
