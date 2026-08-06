# WTFD SCBA Cylinder Lifecycle — Version 9

A standalone Cloudflare Worker and static dashboard for Washington Township Fire Department SCBA cylinder lifecycle management.

Version 7 introduces a generic read-only asset lifecycle engine using live OperativeIQ data. SCBA Cylinders is the first configured module.

## Cloudflare secrets

Keep the existing encrypted secrets:

- `OPERATIVE_CLIENT_ID`
- `OPERATIVE_CLIENT_SECRET`
- `SYNC_ADMIN_TOKEN`

No D1 binding is used in Version 7.

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
## Version 10 UI update

Version 10 adds official department branding and interactive overview KPI cards that navigate to pre-filtered inventory, annual-testing, and replacement-planning worklists.
