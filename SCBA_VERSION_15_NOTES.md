# SCBA Version 15

- Integrates authoritative Planned Decommission Date values from the OperativeIQ `SCBA Cylinders Decommission Planning` report.
- De-duplicates the 283 report rows to 203 unique SCBA cylinders.
- Joins planned dates by Part UPC with Part Description fallback.
- Planned dates now drive the replacement timeline and Planned Dates KPI.
- Estimated in-service-date + planning-age dates are used only for unmatched cylinders.
- Asset class remains locked to 41; hydro form remains 37; maintenance type remains 32.
- Planning report snapshot used for this build: 2026-08-06.
