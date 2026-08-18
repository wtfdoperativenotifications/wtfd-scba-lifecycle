# SCBA Lifecycle Version 16.3

## Ready for Hydro source

- Confirmed source: `https://wtfd.operativeiq.com/rooms/SupplyRoomPartListXml.ashx?id=39`
- Room 39: **Due for Hydro**
- Normal room: **SCBA Warehouse**
- XML rows with `OnHand > 0` are matched to lifecycle cylinders.
- Matching uses `ItemId` first, then exact identifiers such as `PartNumber` / serial and `PartUPC` / asset number.
- Known validation row: SCBA Cylinder 390 / `OK655448` / `SCBA Bottle 390` / `ItemId=1393`.

## Authentication

This OperativeIQ handler uses web-session Forms Authentication rather than the Frontline API OAuth token. Configure `OPERATIVE_WEB_ASPXAUTH` as an encrypted Cloudflare Worker secret. Do not put the cookie in `wrangler.toml`, GitHub, or any source file.

If the cookie is missing or expired, the dashboard shows a warning and does not claim that Ready for Hydro is authoritative.
