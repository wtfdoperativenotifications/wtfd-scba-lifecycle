# SCBA Cylinder Lifecycle v16.6

- Replaces the fragile copied-cookie requirement with automatic OperativeIQ traditional web login.
- New encrypted Worker secrets: `OPERATIVE_WEB_LOGIN_ID` and `OPERATIVE_WEB_PASSWORD`.
- Uses client identifier `wtfd` by default; optional `OPERATIVE_WEB_IDENTIFIER` can override it.
- Parses the OperativeIQ ASP.NET login form dynamically, preserving hidden WebForms fields such as VIEWSTATE/EVENTVALIDATION.
- Maintains an in-memory cookie jar, follows login redirects, and refreshes the web session automatically when the Due for Hydro room redirects to login.
- Continues to read `/rooms/SupplyRoomPartListXml.ashx?id=39` and match Room 39 inventory to SCBA cylinders.
- Keeps v16.5 behavior: Ready-for-Hydro cylinders are removed from the Hydro Overdue KPI but remain in the Priority Worklist; worklist leads with Part Description.
- Existing `.ASPXAUTH` and `ASP.NET_SessionId` secrets are retained only as a fallback/bootstrap path and are no longer required when automatic login is configured.
