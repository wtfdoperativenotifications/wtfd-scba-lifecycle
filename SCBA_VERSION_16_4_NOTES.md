# SCBA Cylinder Lifecycle v16.4

- Sends both `.ASPXAUTH` and `ASP.NET_SessionId` to OperativeIQ's authenticated supply-room XML feed.
- Requires Cloudflare Worker secrets `OPERATIVE_WEB_ASPXAUTH` and `OPERATIVE_WEB_SESSIONID`.
- Improves diagnostics for missing secrets versus an OperativeIQ login redirect.
- Retains Due for Hydro room 39 matching and existing SCBA lifecycle logic.
- Bumps dashboard and cache namespace to v16.4.
