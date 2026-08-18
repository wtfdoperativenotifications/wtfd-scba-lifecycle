# WTFD SCBA Cylinder Lifecycle

## Version 16.3

Version 16.3 replaces supply-room API discovery with the confirmed OperativeIQ web feed for **Due for Hydro**: `/rooms/SupplyRoomPartListXml.ashx?id=39`. The XML rows are matched to SCBA cylinders by `ItemId`, `PartNumber`, `PartUPC`, and part name. Any row with `OnHand > 0` in room 39 is automatically marked **READY FOR HYDRO**.

The room feed is protected by OperativeIQ Forms Authentication, so the Worker requires the encrypted Cloudflare secret `OPERATIVE_WEB_ASPXAUTH`. Store only the cookie value in Cloudflare; never commit it to the repository. The dashboard reports a clear warning if the secret is missing or the session has expired.

Validation case from OperativeIQ: `ItemId=1393`, `PartNumber=OK655448`, `PartUPC=SCBA Bottle 390`, `PartName=SCBA Cylinder 390`, `RoomId=39`, `OnHand=1`.


Version 16.2 drives the hydro workflow from **OperativeIQ Supply Room inventory**, not the cylinder asset-location field. A cylinder with positive on-hand inventory in **Due for Hydro** is automatically labeled **READY FOR HYDRO**; transferring it back to **SCBA Warehouse** clears that workflow status. Hydro compliance remains independent. The Worker automatically discovers compatible supply-room inventory resources from OperativeIQ Swagger metadata and includes a read-only diagnostic route for validation.

Version 15

A standalone Cloudflare Worker and static dashboard for Washington Township Fire Department SCBA cylinder lifecycle management.

Version 15 introduces a generic read-only asset lifecycle engine using live OperativeIQ data. SCBA Cylinders is the first configured module.

## Cloudflare secrets

Keep the existing encrypted secrets:

- `OPERATIVE_CLIENT_ID`
- `OPERATIVE_CLIENT_SECRET`
- `SYNC_ADMIN_TOKEN`

No D1 binding is used in Version 15.

## Deploy

```bash
npm install
npx wrangler deploy
```

## Health check

`/api/health` should report phase `4` and mode `READ_ONLY_ASSET_LIFECYCLE_ENGINE_V4`.

## Recommended test

Open the Worker `/api/health` page, open the browser console, and run:

```javascript
(async () => {
  const token = window.prompt('Enter your SYNC_ADMIN_TOKEN');
  if (!token) return;
  const response = await fetch('/api/scba/class-discovery', {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' }
  });
  const data = await response.json();
  console.log(data);
  await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
})();
```

After confirming the returned class ID, run `/api/scba/engine-preview?assetClassId=ID` in the same manner.
## Version 15 UI update

Version 15 adds official department branding and interactive overview KPI cards that navigate to pre-filtered inventory, annual-testing, and replacement-planning worklists.


## Version 15 planned decommission integration

Version 15 joins the OperativeIQ `SCBA Cylinders Decommission Planning` report to live SCBA inventory using Part UPC / Part Description. The report contains 283 maintenance/report rows but 203 unique cylinders; each cylinder is counted once. Planned dates are authoritative for the 203 matched active cylinders. Unmatched cylinders continue to use the clearly labeled planning-age estimate.


## OperativeIQ automatic web login (v16.6)
Configure `OPERATIVE_WEB_LOGIN_ID` and `OPERATIVE_WEB_PASSWORD` as encrypted Cloudflare Worker secrets. The Worker uses the traditional OperativeIQ login page, defaults the client identifier to `wtfd`, establishes its own authenticated session, and automatically renews that session when required. `OPERATIVE_WEB_IDENTIFIER` is optional. Do not commit login credentials or session cookies to GitHub.
