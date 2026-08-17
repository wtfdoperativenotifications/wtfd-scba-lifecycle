# SCBA Cylinder Lifecycle v16

## Ready for Hydro workflow

- Uses the cylinder's current OperativeIQ warehouse/location as a workflow signal.
- Any cylinder whose resolved warehouse name is **Due for Hydro** is automatically marked **READY FOR HYDRO**.
- Hydro compliance remains independent (Current, Due ≤1 year, Due ≤90 days, Overdue, etc.).
- Added a Ready for Hydro KPI on the Lifecycle Overview.
- Added a Ready for Hydro filter on the Hydrostatic Testing page.
- Added workflow and warehouse visibility to testing, inventory, and the cylinder detail drawer.
- Returning a cylinder to the normal SCBA Warehouse automatically clears the Ready for Hydro workflow status.
- No long-term "Out for Hydro" state was added because vendor turnaround is typically next day.

## Location compatibility

The Worker resolves warehouse/location from direct item fields when present and can also map common OperativeIQ location/room/supply-room/warehouse IDs through lookup endpoints.
