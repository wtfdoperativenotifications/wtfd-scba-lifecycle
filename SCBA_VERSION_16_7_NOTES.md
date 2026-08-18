# SCBA Cylinder Lifecycle v16.7

- Rebuilds automatic OperativeIQ web authentication to match the confirmed browser login sequence.
- GETs the OperativeIQ login page to capture current ASP.NET WebForms tokens (`__VIEWSTATE`, `__VIEWSTATEGENERATOR`, `__EVENTVALIDATION`, and `tokenHdn`).
- POSTs `Login.aspx?action=checkDefaultApp&LoginType=` first to establish the login-service ASP.NET session.
- POSTs `Login.aspx?action=login&ReturnUrl=&LoginType=` with the configured encrypted login ID/password and parses the returned `logIdentity` and tenant URL.
- Navigates to the returned tenant entry URL and then POSTs `/Security/Login.aspx?action=ai_login&guid=<logIdentity>` with no form payload, matching the captured OperativeIQ request.
- Captures the tenant `.ASPXAUTH` and ASP.NET session cookies automatically, caches them in-memory, and renews the session when the room feed requires login.
- Keeps the v16.5 workflow behavior: Ready-for-Hydro bottles are excluded from the Hydro Overdue KPI but remain in the Priority Worklist, which leads with Part Description.

Required encrypted Cloudflare Worker secrets remain:
- `OPERATIVE_WEB_LOGIN_ID`
- `OPERATIVE_WEB_PASSWORD`

`OPERATIVE_WEB_IDENTIFIER` is optional and defaults to `wtfd`.
