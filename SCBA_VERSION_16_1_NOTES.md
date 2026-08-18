# SCBA Lifecycle v16.1

## Inventory transfer refresh fix

- Fixes a Cloudflare edge-cache bug in v16 that could leave SCBA warehouse assignments stale for up to 15 minutes.
- Manual **Refresh** now bypasses the dashboard cache and fetches current OperativeIQ inventory data.
- Routine dashboard loads use a short 60-second edge cache to limit unnecessary OperativeIQ API traffic.
- A successful manual refresh also replaces the shared cached dashboard so other viewers receive the current warehouse state.
- Existing **Due for Hydro** → **READY FOR HYDRO** workflow logic is unchanged.
