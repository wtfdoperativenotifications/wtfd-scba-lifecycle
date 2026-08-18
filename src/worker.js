const AUTH_URL = 'https://auth.operativeiqfrontline.com/FrontlineV_live/token';
const RESOURCE_ROOT = 'https://client.operativeiqfrontline.com/FrontlineV_live';
const PAGE_SIZE = 200;
const MAX_RECORDS = 20000;

// Authoritative planned decommission dates exported from the OperativeIQ
// "SCBA Cylinders Decommission Planning" report on 2026-08-06.
// The report contains 283 maintenance/report rows representing 203 unique cylinders.
// Values are keyed by Part UPC first and Part Description second so maintenance history
// rows never duplicate a cylinder in the lifecycle forecast.
const SCBA_PLANNED_DECOMMISSION_BY_PART_UPC = Object.freeze({"SCBA Bottle 37":"2025-11-27","SCBA Bottle 40":"2025-11-27","SCBA Bottle 281":"2027-06-28","SCBA Bottle 282":"2027-06-28","SCBA Bottle 283":"2027-06-28","SCBA Bottle 284":"2027-06-28","SCBA Bottle 285":"2027-06-28","SCBA Bottle 286":"2027-06-28","SCBA Bottle 287":"2027-07-29","SCBA Bottle 288":"2027-07-29","SCBA Bottle 289":"2027-06-28","SCBA Bottle 290":"2027-06-28","SCBA Bottle 292":"2028-04-27","SCBA Bottle 293":"2028-04-27","SCBA Bottle 294":"2028-04-27","SCBA Bottle 295":"2028-05-28","SCBA Bottle 296":"2028-04-27","SCBA Bottle 297":"2028-04-27","SCBA Bottle 298":"2028-04-27","SCBA Bottle 299":"2028-05-28","SCBA Bottle 25":"2030-04-11","SCBA Bottle 27":"2030-03-28","SCBA Bottle 30":"2030-03-28","SCBA Bottle 36":"2030-03-28","SCBA Bottle 10":"2031-03-13","SCBA Bottle 11":"2031-02-26","SCBA Bottle 12":"2031-02-26","SCBA Bottle 13":"2031-02-26","SCBA Bottle 14":"2031-02-26","SCBA Bottle 15":"2031-02-26","SCBA Bottle 16":"2031-02-26","SCBA Bottle 116":"2032-10-28","SCBA Bottle 117":"2032-10-28","SCBA Bottle 118":"2032-10-28","SCBA Bottle 119":"2032-10-28","SCBA Bottle 20":"2032-01-14","SCBA Bottle 314":"2036-03-17","SCBA Bottle 315":"2036-04-17","SCBA Bottle 316":"2036-03-17","SCBA Bottle 317":"2036-03-17","SCBA Bottle 318":"2036-03-17","SCBA Bottle 319":"2036-03-17","SCBA Bottle 320":"2036-04-17","SCBA Bottle 321":"2036-03-17","SCBA Bottle 322":"2036-03-17","SCBA Bottle 323":"2036-03-17","SCBA Bottle 324":"2036-03-17","SCBA Bottle 325":"2036-03-17","SCBA Bottle 326":"2036-03-28","SCBA Bottle 327":"2036-03-28","SCBA Bottle 328":"2036-03-17","SCBA Bottle 329":"2036-03-17","SCBA Bottle 330":"2036-03-28","SCBA Bottle 331":"2036-03-17","SCBA Bottle 332":"2036-03-17","SCBA Bottle 333":"2036-03-17","SCBA Bottle 334":"2036-03-17","SCBA Bottle 335":"2036-03-17","SCBA Bottle 336":"2036-03-17","SCBA Bottle 337":"2036-03-17","SCBA Bottle 338":"2036-03-17","SCBA Bottle 339":"2036-03-17","SCBA Bottle 340":"2036-03-17","SCBA Bottle 341":"2036-03-28","SCBA Bottle 342":"2036-03-17","SCBA Bottle 343":"2036-03-17","SCBA Bottle 344":"2036-03-17","SCBA Bottle 345":"2036-03-28","SCBA Bottle 346":"2036-03-17","SCBA Bottle 347":"2036-03-28","SCBA Bottle 348":"2036-03-17","SCBA Bottle 349":"2036-03-17","SCBA Bottle 350":"2036-03-17","SCBA Bottle 351":"2036-03-28","SCBA Bottle 352":"2036-03-28","SCBA Bottle 353":"2036-03-17","SCBA Bottle 354":"2036-03-17","SCBA Bottle 355":"2036-03-28","SCBA Bottle 356":"2036-03-28","SCBA Bottle 357":"2036-03-28","SCBA Bottle 358":"2036-03-17","SCBA Bottle 359":"2036-03-28","SCBA Bottle 360":"2036-03-28","SCBA Bottle 361":"2036-03-28","SCBA Bottle 362":"2036-03-28","SCBA Bottle 363":"2036-03-17","SCBA Bottle 364":"2036-03-17","SCBA Bottle 365":"2036-03-17","SCBA Bottle 366":"2036-03-17","SCBA Bottle 367":"2036-03-17","SCBA Bottle 368":"2036-03-17","SCBA Bottle 369":"2036-03-17","SCBA Bottle 370":"2036-03-17","SCBA Bottle 371":"2036-03-28","SCBA Bottle 372":"2036-03-17","SCBA Bottle 373":"2036-03-17","SCBA Bottle 374":"2036-03-28","SCBA Bottle 375":"2036-03-17","SCBA Bottle 376":"2036-03-17","SCBA Bottle 377":"2036-03-28","SCBA Bottle 378":"2036-03-17","SCBA Bottle 379":"2036-03-17","SCBA Bottle 380":"2036-03-17","SCBA Bottle 381":"2036-03-28","SCBA Bottle 382":"2036-03-17","SCBA Bottle 383":"2036-03-17","SCBA Bottle 384":"2036-03-17","SCBA Bottle 385":"2036-03-28","SCBA Bottle 386":"2036-03-17","SCBA Bottle 387":"2036-03-28","SCBA Bottle 388":"2036-03-17","SCBA Bottle 389":"2036-03-17","SCBA Bottle 390":"2036-03-28","SCBA Bottle 391":"2036-03-17","SCBA Bottle 392":"2036-03-17","SCBA Bottle 393":"2036-03-17","SCBA Bottle 394":"2036-03-17","SCBA Bottle 395":"2036-03-17","SCBA Bottle 86":"2038-09-19","SCBA Bottle 87":"2038-09-19","SCBA Bottle 88":"2038-09-19","SCBA Bottle 89":"2038-09-19","SCBA Bottle 90":"2038-09-19","SCBA Bottle 91":"2038-09-19","SCBA Bottle 92":"2038-09-19","SCBA Bottle 1":"2039-03-21","SCBA Bottle 100":"2039-02-20","SCBA Bottle 101":"2039-02-20","SCBA Bottle 102":"2039-02-20","SCBA Bottle 103":"2039-02-20","SCBA Bottle 104":"2039-02-20","SCBA Bottle 105":"2039-02-20","SCBA Bottle 107":"2039-02-20","SCBA Bottle 108":"2039-02-20","SCBA Bottle 109":"2039-02-20","SCBA Bottle 110":"2039-02-20","SCBA Bottle 111":"2039-02-20","SCBA Bottle 112":"2039-02-20","SCBA Bottle 114":"2039-02-20","SCBA Bottle 115":"2039-02-20","SCBA Bottle 2":"2039-02-20","SCBA Bottle 21":"2039-02-20","SCBA Bottle 22":"2039-03-21","SCBA Bottle 23":"2039-02-20","SCBA Bottle 24":"2039-02-20","SCBA Bottle 251":"2039-02-20","SCBA Bottle 29":"2039-02-20","SCBA Bottle 3":"2039-02-20","SCBA Bottle 32":"2039-03-21","SCBA Bottle 33":"2039-02-20","SCBA Bottle 34":"2039-02-20","SCBA Bottle 35":"2039-02-20","SCBA Bottle 4":"2039-02-20","SCBA Bottle 41":"2039-02-20","SCBA Bottle 42":"2039-02-20","SCBA Bottle 44":"2039-02-20","SCBA Bottle 45":"2039-02-20","SCBA Bottle 46":"2039-02-20","SCBA Bottle 47":"2039-02-20","SCBA Bottle 48":"2039-02-20","SCBA Bottle 49":"2039-02-20","SCBA Bottle 5":"2039-02-20","SCBA Bottle 50":"2039-02-20","SCBA Bottle 51":"2039-02-20","SCBA Bottle 52":"2039-02-20","SCBA Bottle 53":"2039-02-20","SCBA Bottle 57":"2039-02-20","SCBA Bottle 59":"2039-02-20","SCBA Bottle 6":"2039-03-21","SCBA Bottle 60":"2039-02-20","SCBA Bottle 61":"2039-02-20","SCBA Bottle 63":"2039-02-20","SCBA Bottle 64":"2039-02-20","SCBA Bottle 65":"2039-02-20","SCBA Bottle 66":"2039-02-20","SCBA Bottle 67":"2039-02-20","SCBA Bottle 68":"2039-02-20","SCBA Bottle 69":"2039-02-20","SCBA Bottle 7":"2039-03-21","SCBA Bottle 70":"2039-02-20","SCBA Bottle 71":"2039-02-20","SCBA Bottle 72":"2039-02-20","SCBA Bottle 73":"2039-02-20","SCBA Bottle 74":"2039-02-20","SCBA Bottle 75":"2039-02-20","SCBA Bottle 77":"2039-02-20","SCBA Bottle 78":"2039-02-20","SCBA Bottle 79":"2039-02-20","SCBA Bottle 8":"2039-02-20","SCBA Bottle 80":"2039-03-21","SCBA Bottle 81":"2039-02-20","SCBA Bottle 82":"2039-02-20","SCBA Bottle 83":"2039-02-20","SCBA Bottle 84":"2039-02-20","SCBA Bottle 85":"2039-02-20","SCBA Bottle 9":"2039-02-20","SCBA Bottle 93":"2039-03-21","SCBA Bottle 94":"2039-02-20","SCBA Bottle 95":"2039-02-20","SCBA Bottle 96":"2039-03-21","SCBA Bottle 97":"2039-02-20","SCBA Bottle 98":"2039-02-20","SCBA Bottle 99":"2039-02-20"});
const SCBA_PLANNED_DECOMMISSION_BY_DESCRIPTION = Object.freeze({"SCBA Cylinder 37":"2025-11-27","SCBA Cylinder 40":"2025-11-27","SCBA Cylinder 281":"2027-06-28","SCBA Cylinder 282":"2027-06-28","SCBA Cylinder 283":"2027-06-28","SCBA Cylinder 284":"2027-06-28","SCBA Cylinder 285":"2027-06-28","SCBA Cylinder 286":"2027-06-28","SCBA Cylinder 287":"2027-07-29","SCBA Cylinder 288":"2027-07-29","SCBA Cylinder 289":"2027-06-28","SCBA Cylinder 290":"2027-06-28","SCBA Cylinder 292":"2028-04-27","SCBA Cylinder 293":"2028-04-27","SCBA Cylinder 294":"2028-04-27","SCBA Cylinder 295":"2028-05-28","SCBA Cylinder 296":"2028-04-27","SCBA Cylinder 297":"2028-04-27","SCBA Cylinder 298":"2028-04-27","SCBA Cylinder 299":"2028-05-28","SCBA Cylinder 25":"2030-04-11","SCBA Cylinder 27":"2030-03-28","SCBA Cylinder 30":"2030-03-28","SCBA Cylinder 36":"2030-03-28","SCBA Cylinder 10":"2031-03-13","SCBA Cylinder 11":"2031-02-26","SCBA Cylinder 12":"2031-02-26","SCBA Cylinder 13":"2031-02-26","SCBA Cylinder 14":"2031-02-26","SCBA Cylinder 15":"2031-02-26","SCBA Cylinder 16":"2031-02-26","SCBA Cylinder 116":"2032-10-28","SCBA Cylinder 117":"2032-10-28","SCBA Cylinder 118":"2032-10-28","SCBA Cylinder 119":"2032-10-28","SCBA Cylinder 20":"2032-01-14","SCBA Cylinder 314":"2036-03-17","SCBA Cylinder 315":"2036-04-17","SCBA Cylinder 316":"2036-03-17","SCBA Cylinder 317":"2036-03-17","SCBA Cylinder 318":"2036-03-17","SCBA Cylinder 319":"2036-03-17","SCBA Cylinder 320":"2036-04-17","SCBA Cylinder 321":"2036-03-17","SCBA Cylinder 322":"2036-03-17","SCBA Cylinder 323":"2036-03-17","SCBA Cylinder 324":"2036-03-17","SCBA Cylinder 325":"2036-03-17","SCBA Cylinder 326":"2036-03-28","SCBA Cylinder 327":"2036-03-28","SCBA Cylinder 328":"2036-03-17","SCBA Cylinder 329":"2036-03-17","SCBA Cylinder 330":"2036-03-28","SCBA Cylinder 331":"2036-03-17","SCBA Cylinder 332":"2036-03-17","SCBA Cylinder 333":"2036-03-17","SCBA Cylinder 334":"2036-03-17","SCBA Cylinder 335":"2036-03-17","SCBA Cylinder 336":"2036-03-17","SCBA Cylinder 337":"2036-03-17","SCBA Cylinder 338":"2036-03-17","SCBA Cylinder 339":"2036-03-17","SCBA Cylinder 340":"2036-03-17","SCBA Cylinder 341":"2036-03-28","SCBA Cylinder 342":"2036-03-17","SCBA Cylinder 343":"2036-03-17","SCBA Cylinder 344":"2036-03-17","SCBA Cylinder 345":"2036-03-28","SCBA Cylinder 346":"2036-03-17","SCBA Cylinder 347":"2036-03-28","SCBA Cylinder 348":"2036-03-17","SCBA Cylinder 349":"2036-03-17","SCBA Cylinder 350":"2036-03-17","SCBA Cylinder 351":"2036-03-28","SCBA Cylinder 352":"2036-03-28","SCBA Cylinder 353":"2036-03-17","SCBA Cylinder 354":"2036-03-17","SCBA Cylinder 355":"2036-03-28","SCBA Cylinder 356":"2036-03-28","SCBA Cylinder 357":"2036-03-28","SCBA Cylinder 358":"2036-03-17","SCBA Cylinder 359":"2036-03-28","SCBA Cylinder 360":"2036-03-28","SCBA Cylinder 361":"2036-03-28","SCBA Cylinder 362":"2036-03-28","SCBA Cylinder 363":"2036-03-17","SCBA Cylinder 364":"2036-03-17","SCBA Cylinder 365":"2036-03-17","SCBA Cylinder 366":"2036-03-17","SCBA Cylinder 367":"2036-03-17","SCBA Cylinder 368":"2036-03-17","SCBA Cylinder 369":"2036-03-17","SCBA Cylinder 370":"2036-03-17","SCBA Cylinder 371":"2036-03-28","SCBA Cylinder 372":"2036-03-17","SCBA Cylinder 373":"2036-03-17","SCBA Cylinder 374":"2036-03-28","SCBA Cylinder 375":"2036-03-17","SCBA Cylinder 376":"2036-03-17","SCBA Cylinder 377":"2036-03-28","SCBA Cylinder 378":"2036-03-17","SCBA Cylinder 379":"2036-03-17","SCBA Cylinder 380":"2036-03-17","SCBA Cylinder 381":"2036-03-28","SCBA Cylinder 382":"2036-03-17","SCBA Cylinder 383":"2036-03-17","SCBA Cylinder 384":"2036-03-17","SCBA Cylinder 385":"2036-03-28","SCBA Cylinder 386":"2036-03-17","SCBA Cylinder 387":"2036-03-28","SCBA Cylinder 388":"2036-03-17","SCBA Cylinder 389":"2036-03-17","SCBA Cylinder 390":"2036-03-28","SCBA Cylinder 391":"2036-03-17","SCBA Cylinder 392":"2036-03-17","SCBA Cylinder 393":"2036-03-17","SCBA Cylinder 394":"2036-03-17","SCBA Cylinder 395":"2036-03-17","SCBA Cylinder 86":"2038-09-19","SCBA Cylinder 87":"2038-09-19","SCBA Cylinder 88":"2038-09-19","SCBA Cylinder 89":"2038-09-19","SCBA Cylinder 90":"2038-09-19","SCBA Cylinder 91":"2038-09-19","SCBA Cylinder 92":"2038-09-19","SCBA Cylinder 1":"2039-03-21","SCBA Cylinder 100":"2039-02-20","SCBA Cylinder 101":"2039-02-20","SCBA Cylinder 102":"2039-02-20","SCBA Cylinder 103":"2039-02-20","SCBA Cylinder 104":"2039-02-20","SCBA Cylinder 105":"2039-02-20","SCBA Cylinder 107":"2039-02-20","SCBA Cylinder 108":"2039-02-20","SCBA Cylinder 109":"2039-02-20","SCBA Cylinder 110":"2039-02-20","SCBA Cylinder 111":"2039-02-20","SCBA Cylinder 112":"2039-02-20","SCBA Cylinder 114":"2039-02-20","SCBA Cylinder 115":"2039-02-20","SCBA Cylinder 2":"2039-02-20","SCBA Cylinder 21":"2039-02-20","SCBA Cylinder 22":"2039-03-21","SCBA Cylinder 23":"2039-02-20","SCBA Cylinder 24":"2039-02-20","SCBA Cylinder 251":"2039-02-20","SCBA Cylinder 29":"2039-02-20","SCBA Cylinder 3":"2039-02-20","SCBA Cylinder 32":"2039-03-21","SCBA Cylinder 33":"2039-02-20","SCBA Cylinder 34":"2039-02-20","SCBA Cylinder 35":"2039-02-20","SCBA Cylinder 4":"2039-02-20","SCBA Cylinder 41":"2039-02-20","SCBA Cylinder 42":"2039-02-20","SCBA Cylinder 44":"2039-02-20","SCBA Cylinder 45":"2039-02-20","SCBA Cylinder 46":"2039-02-20","SCBA Cylinder 47":"2039-02-20","SCBA Cylinder 48":"2039-02-20","SCBA Cylinder 49":"2039-02-20","SCBA Cylinder 5":"2039-02-20","SCBA Cylinder 50":"2039-02-20","SCBA Cylinder 51":"2039-02-20","SCBA Cylinder 52":"2039-02-20","SCBA Cylinder 53":"2039-02-20","SCBA Cylinder 57":"2039-02-20","SCBA Cylinder 59":"2039-02-20","SCBA Cylinder 6":"2039-03-21","SCBA Cylinder 60":"2039-02-20","SCBA Cylinder 61":"2039-02-20","SCBA Cylinder 63":"2039-02-20","SCBA Cylinder 64":"2039-02-20","SCBA Cylinder 65":"2039-02-20","SCBA Cylinder 66":"2039-02-20","SCBA Cylinder 67":"2039-02-20","SCBA Cylinder 68":"2039-02-20","SCBA Cylinder 69":"2039-02-20","SCBA Cylinder 7":"2039-03-21","SCBA Cylinder 70":"2039-02-20","SCBA Cylinder 71":"2039-02-20","SCBA Cylinder 72":"2039-02-20","SCBA Cylinder 73":"2039-02-20","SCBA Cylinder 74":"2039-02-20","SCBA Cylinder 75":"2039-02-20","SCBA Cylinder 77":"2039-02-20","SCBA Cylinder 78":"2039-02-20","SCBA Cylinder 79":"2039-02-20","SCBA Cylinder 8":"2039-02-20","SCBA Cylinder 80":"2039-03-21","SCBA Cylinder 81":"2039-02-20","SCBA Cylinder 82":"2039-02-20","SCBA Cylinder 83":"2039-02-20","SCBA Cylinder 84":"2039-02-20","SCBA Cylinder 85":"2039-02-20","SCBA Cylinder 9":"2039-02-20","SCBA Cylinder 93":"2039-03-21","SCBA Cylinder 94":"2039-02-20","SCBA Cylinder 95":"2039-02-20","SCBA Cylinder 96":"2039-03-21","SCBA Cylinder 97":"2039-02-20","SCBA Cylinder 98":"2039-02-20","SCBA Cylinder 99":"2039-02-20"});
const SCBA_PLANNING_REPORT_SNAPSHOT = '2026-08-06';


const SWAGGER_CANDIDATES = [
  '/swagger/v1/swagger.json',
  '/swagger/docs/v1',
  '/swagger/swagger.json',
  '/swagger.json',
  '/openapi.json'
];

const INVENTORY_CANDIDATES = [
  '/api/item-masters',
  '/api/item-master',
  '/api/items-master',
  '/api/items',
  '/api/asset-management',
  '/api/asset-managements',
  '/api/assets-all',
  '/api/assets',
  '/api/fixed-assets',
  '/api/fixed-asset',
  '/api/ems-item-masters',
  '/api/ems-item-master',
  '/api/ems-fixed-assets',
  '/api/ems-fixed-asset',
  '/api/inventory-assets',
  '/api/equipment'
];


const SUPPLY_ROOM_INVENTORY_CANDIDATES = [
  '/api/supply-room-inventory',
  '/api/supply-room-inventories',
  '/api/supply-room-parts',
  '/api/supply-room-part',
  '/api/supply-room-items',
  '/api/supply-room-item',
  '/api/supply-room-inventory-levels',
  '/api/supply-room-inventory-level',
  '/api/inventory-levels',
  '/api/inventory-level',
  '/api/part-inventory-levels',
  '/api/part-inventory-level',
  '/api/parts-supply-rooms',
  '/api/part-supply-rooms',
  '/api/part-supply-room',
  '/api/inventory',
  '/api/inventories'
];

const SUPPLY_ROOM_LOOKUP_CANDIDATES = [
  '/api/supply-rooms',
  '/api/supply-room',
  '/api/rooms'
];

const HYDRO_STAGING_ROOM_NAME = 'Due for Hydro';
const NORMAL_SCBA_ROOM_NAME = 'SCBA Warehouse';

const MAINTENANCE_CANDIDATES = [
  '/api/asset-maintenance-histories',
  '/api/asset-maintenance-history',
  '/api/asset-maintenance',
  '/api/maintenance-histories',
  '/api/maintenance-history',
  '/api/maintenance-records',
  '/api/maintenance-results',
  '/api/maintenance-schedules',
  '/api/maintenance-schedule',
  '/api/maintenance-types',
  '/api/maintenance-type',
  '/api/rfid-maintenances',
  '/api/rfid-maintenance',
  '/api/ems-asset-maintenance-histories',
  '/api/ems-asset-maintenance-history',
  '/api/ems-maintenance-schedules',
  '/api/ems-maintenance-schedule',
  '/api/ems-maintenance-types',
  '/api/ems-maintenance-type'
];

const FORM_AND_ANSWER_CANDIDATES = [
  '/api/form-answers',
  '/api/form-answer',
  '/api/forms',
  '/api/form-states',
  '/api/vh-answers',
  '/api/vh-answer',
  '/api/vehicle-answers',
  '/api/maintenance-forms',
  '/api/questionnaire-asset-class-mappings',
  '/api/questionnaire-asset-class-mapping'
];

const LOOKUP_CANDIDATES = [
  '/api/asset-classes',
  '/api/asset-class',
  '/api/asset-service-statuses',
  '/api/asset-service-status',
  '/api/manufacturers',
  '/api/locations',
  '/api/rooms',
  '/api/units',
  '/api/trucks'
];

const TESTING_CANDIDATES = [
  '/api/hydrostatic-testing-results',
  '/api/hydrostatic-tests',
  '/api/hydrostatic-testing',
  ...MAINTENANCE_CANDIDATES,
  ...FORM_AND_ANSWER_CANDIDATES
];

const PROBE_GROUPS = Object.freeze({
  inventory: INVENTORY_CANDIDATES,
  maintenance: MAINTENANCE_CANDIDATES,
  forms: FORM_AND_ANSWER_CANDIDATES,
  lookups: LOOKUP_CANDIDATES,
  all: unique([
    ...INVENTORY_CANDIDATES,
    ...MAINTENANCE_CANDIDATES,
    ...FORM_AND_ANSWER_CANDIDATES,
    ...LOOKUP_CANDIDATES
  ])
});

let cachedToken = null;
let cachedTokenExpiresAt = 0;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/api/health') {
      return json({
        success: true,
        application: 'WTFD SCBA Cylinder Lifecycle',
        phase: 13,
        mode: 'LIVE_SCBA_LIFECYCLE_DASHBOARD_V16_2',
        operativeCredentialsConfigured: Boolean(env.OPERATIVE_CLIENT_ID && env.OPERATIVE_CLIENT_SECRET),
        adminTokenConfigured: Boolean(env.SYNC_ADMIN_TOKEN),
        inventoryPathConfigured: Boolean(env.SCBA_INVENTORY_PATH),
        testingPathConfigured: Boolean(env.SCBA_TESTING_PATH),
        timestamp: new Date().toISOString()
      });
    }

    if (url.pathname === '/api/dashboard') {
      try {
        return await cachedDashboardResponse(request, env, url);
      } catch (error) {
        return json({ error: errorMessage(error) }, 500);
      }
    }

    if (url.pathname.startsWith('/api/scba/')) {
      if (!authorized(request, env)) return json({ error: 'Unauthorized' }, 401);

      try {
        if (url.pathname === '/api/scba/discovery') {
          return json(await discoverCylinderResources(env));
        }

        if (url.pathname === '/api/scba/probe') {
          return json(await probeCylinderResources(env, url));
        }

        if (url.pathname === '/api/platform/asset-classes') {
          return json(await assetClassPreview(env, url));
        }

        if (url.pathname === '/api/scba/class-discovery') {
          return json(await scbaClassDiscovery(env, url));
        }

        if (url.pathname === '/api/scba/live-inventory') {
          return json(await liveCylinderInventory(env, url));
        }

        if (url.pathname === '/api/scba/maintenance-linkage') {
          return json(await scbaMaintenanceLinkage(env, url));
        }

        if (url.pathname === '/api/scba/engine-preview') {
          return json(await scbaEnginePreview(env, url));
        }

        if (url.pathname === '/api/scba/supply-room-debug') {
          return json(await supplyRoomDebug(env, url));
        }

        if (url.pathname === '/api/scba/raw') {
          const path = validatedApiPath(url.searchParams.get('path'));
          const limit = boundedNumber(url.searchParams.get('limit'), 1, 1000, 25);
          const token = await getAccessToken(env);
          const records = await fetchAll(path, token, limit);
          return json({
            success: true,
            mode: 'READ_ONLY_RAW_PREVIEW',
            endpoint: path,
            recordCount: records.length,
            detectedFields: uniqueFields(records),
            rows: records,
            note: 'No OperativeIQ or D1 records were changed.'
          });
        }

        if (url.pathname === '/api/scba/inventory-preview') {
          return json(await inventoryPreview(env, url));
        }

        if (url.pathname === '/api/scba/testing-preview') {
          return json(await testingPreview(env, url));
        }

        if (url.pathname === '/api/scba/combined-preview') {
          const [inventory, testing] = await Promise.all([
            inventoryPreview(env, url),
            testingPreview(env, url)
          ]);
          const inventoryTags = new Set(inventory.rows.map(row => tagKey(row.assetTag)).filter(Boolean));
          const testedTags = new Set(testing.rows.map(row => tagKey(row.assetTag)).filter(Boolean));
          const testTagsMissingFromInventory = [...testedTags].filter(tag => !inventoryTags.has(tag));
          const inventoryTagsWithoutTests = [...inventoryTags].filter(tag => !testedTags.has(tag));

          return json({
            success: true,
            mode: 'READ_ONLY_COMBINED_PREVIEW',
            inventory,
            testing,
            matchSummary: {
              inventoryUniqueTags: inventoryTags.size,
              testingUniqueTags: testedTags.size,
              matchedTestingTags: [...testedTags].filter(tag => inventoryTags.has(tag)).length,
              testTagsMissingFromInventory,
              inventoryTagsWithoutTests
            },
            note: 'No OperativeIQ or D1 records were changed.'
          });
        }

        return json({
          error: 'Not found',
          routes: [
            '/api/health',
            '/api/scba/discovery',
            '/api/scba/probe?group=inventory|maintenance|forms|lookups|all',
            '/api/platform/asset-classes',
            '/api/scba/class-discovery',
            '/api/scba/live-inventory?assetClassId=ID',
            '/api/scba/maintenance-linkage?assetClassId=ID',
            '/api/scba/engine-preview?assetClassId=ID',
            '/api/scba/supply-room-debug?serial=OK655448',
            '/api/scba/raw?path=/api/...&limit=25',
            '/api/scba/inventory-preview',
            '/api/scba/testing-preview',
            '/api/scba/combined-preview'
          ]
        }, 404);
      } catch (error) {
        return json({ error: errorMessage(error) }, 500);
      }
    }

    return env.ASSETS.fetch(request);
  }
};


async function assetClassPreview(env, url) {
  const token = await getAccessToken(env);
  const max = boundedNumber(url.searchParams.get('limit'), 1, 5000, 5000);
  const resolution = await resolveLookupPath(token, [
    '/api/asset-classes',
    '/api/asset-class',
    '/api/ems-asset-classes',
    '/api/ems-asset-class'
  ]);

  if (!resolution.path) {
    const items = await fetchAll('/api/items', token, MAX_RECORDS);
    const ids = [...new Set(items.map(row => numberOrNull(row.assetClassId)).filter(value => value !== null))].sort((a, b) => a - b);
    return {
      success: true,
      mode: 'READ_ONLY_ASSET_CLASS_DERIVATION',
      endpoint: null,
      lookupAvailable: false,
      derivedAssetClassIds: ids,
      itemCount: items.length,
      warning: 'No asset-class lookup endpoint was confirmed. IDs were derived from /api/items, but names are not yet available.',
      note: 'No OperativeIQ or D1 records were changed.'
    };
  }

  const rows = await fetchAll(resolution.path, token, max);
  return {
    success: true,
    mode: 'READ_ONLY_ASSET_CLASS_PREVIEW',
    endpoint: resolution.path,
    lookupAvailable: true,
    recordCount: rows.length,
    detectedFields: uniqueFields(rows),
    rows: rows.map(normalizeAssetClass),
    note: 'No OperativeIQ or D1 records were changed.'
  };
}

async function scbaClassDiscovery(env, url) {
  const token = await getAccessToken(env);
  const items = await fetchAll('/api/items', token, MAX_RECORDS);
  const lookup = await loadAssetClasses(token);
  const classById = new Map(lookup.rows.map(row => [String(row.id), row]));
  const stats = new Map();

  for (const item of items) {
    const id = String(item.assetClassId ?? '');
    if (!id) continue;
    const current = stats.get(id) || {
      assetClassId: numberOrNull(id),
      assetClassName: classById.get(id)?.name || '',
      totalItems: 0,
      scbaEvidenceCount: 0,
      sampleItems: []
    };
    current.totalItems += 1;
    const searchable = itemSearchText(item);
    if (/scba|cylinder|breathing\s*air|air\s*bottle|4500|2216|5500/i.test(searchable)) {
      current.scbaEvidenceCount += 1;
      if (current.sampleItems.length < 5) current.sampleItems.push(minimalItem(item));
    }
    stats.set(id, current);
  }

  const candidates = [...stats.values()]
    .map(row => ({
      ...row,
      confidenceScore: scbaClassScore(row),
      scbaEvidencePercent: row.totalItems ? Math.round((row.scbaEvidenceCount / row.totalItems) * 1000) / 10 : 0
    }))
    .filter(row => /scba|cylinder|bottle/i.test(row.assetClassName) || row.scbaEvidenceCount > 0)
    .sort((a, b) => b.confidenceScore - a.confidenceScore || b.scbaEvidenceCount - a.scbaEvidenceCount);

  return {
    success: true,
    mode: 'READ_ONLY_SCBA_CLASS_DISCOVERY',
    inventoryEndpoint: '/api/items',
    assetClassEndpoint: lookup.path,
    sourceItemCount: items.length,
    candidateCount: candidates.length,
    recommendedAssetClassId: candidates[0]?.assetClassId ?? null,
    recommendedAssetClassName: candidates[0]?.assetClassName || '',
    candidates,
    configurationRecommendation: candidates[0]
      ? `Set SCBA_ASSET_CLASS_ID=${candidates[0].assetClassId} after validating the sample items.`
      : 'No scba class was identified automatically. Review /api/platform/asset-classes and use assetClassId manually.',
    note: 'No OperativeIQ or D1 records were changed.'
  };
}

async function liveCylinderInventory(env, url) {
  const token = await getAccessToken(env);
  const context = await resolveCylinderContext(env, url, token);
  const manufacturers = await loadOptionalLookup(token, ['/api/manufacturers', '/api/manufacturer']);
  const statuses = await loadOptionalLookup(token, ['/api/asset-service-statuses', '/api/asset-service-status']);
  const locations = await loadOptionalLookup(token, ['/api/locations', '/api/location', '/api/rooms', '/api/supply-rooms']);
  const manufacturerById = lookupNameMap(manufacturers.rows, ['manufacturerName', 'name', 'companyName']);
  const statusById = lookupNameMap(statuses.rows, ['name', 'statusName', 'description']);
  const locationById = lookupNameMap(locations.rows, ['locationName', 'name', 'roomName', 'supplyRoomName', 'warehouseName', 'description']);

  const rows = context.items
    .filter(item => String(item.assetClassId ?? '') === String(context.assetClassId))
    .map(item => normalizeLiveItem(item, context.assetClassName, manufacturerById, statusById, locationById));

  return {
    success: true,
    mode: 'READ_ONLY_LIVE_SCBA_INVENTORY',
    endpoint: '/api/items',
    assetClassId: context.assetClassId,
    assetClassName: context.assetClassName,
    sourceItemCount: context.items.length,
    scbaRecordCount: rows.length,
    lookupEndpoints: {
      assetClasses: context.assetClassPath,
      manufacturers: manufacturers.path,
      serviceStatuses: statuses.path,
      locations: locations.path
    },
    detectedFields: uniqueFields(context.items),
    dataQuality: liveInventoryQuality(rows),
    rows,
    note: 'Live data from OperativeIQ. No OperativeIQ or D1 records were changed.'
  };
}

async function scbaMaintenanceLinkage(env, url) {
  const token = await getAccessToken(env);
  const context = await resolveCylinderContext(env, url, token);
  const scbaItems = context.items.filter(item => String(item.assetClassId ?? '') === String(context.assetClassId));
  const scbaItemIds = new Set(scbaItems.map(item => String(item.id)));
  const fixedAssets = await fetchAll('/api/fixed-assets', token, MAX_RECORDS);
  const linked = fixedAssets.filter(row => scbaItemIds.has(String(row.itemId)));
  const itemById = new Map(scbaItems.map(item => [String(item.id), item]));
  const rows = linked.map(record => normalizeMaintenanceLink(record, itemById.get(String(record.itemId))));

  const formCounts = countBy(rows, row => String(row.formId ?? 'Unknown'));
  const typeCounts = countBy(rows, row => String(row.type ?? 'Unknown'));
  const statusCounts = countBy(rows, row => String(row.statusId ?? 'Unknown'));

  return {
    success: true,
    mode: 'READ_ONLY_SCBA_MAINTENANCE_LINKAGE',
    inventoryEndpoint: '/api/items',
    maintenanceEndpoint: '/api/fixed-assets',
    assetClassId: context.assetClassId,
    assetClassName: context.assetClassName,
    scbaInventoryCount: scbaItems.length,
    sourceMaintenanceCount: fixedAssets.length,
    linkedMaintenanceCount: rows.length,
    scbaItemsWithMaintenance: new Set(rows.map(row => row.itemId)).size,
    scbaItemsWithoutMaintenance: scbaItems.length - new Set(rows.map(row => row.itemId)).size,
    formCounts,
    typeCounts,
    statusCounts,
    detectedFields: uniqueFields(fixedAssets),
    rows,
    recommendedNextStep: rows.length
      ? 'Use the dominant formId and formAnswerUniqueId values to resolve the actual hydrostatic-test form answers.'
      : 'Confirm the scba asset class. No /api/fixed-assets rows linked to the selected class.',
    note: 'Live data from OperativeIQ. No OperativeIQ or D1 records were changed.'
  };
}

async function scbaEnginePreview(env, url) {
  // Version 5 deliberately performs one shared inventory fetch instead of
  // calling the inventory and maintenance endpoints internally. The previous
  // Promise.all implementation downloaded /api/items twice and could exceed
  // Cloudflare's per-invocation subrequest limit.
  const token = await getAccessToken(env);
  const context = await resolveCylinderContext(env, url, token);
  const scbaItems = context.items.filter(
    item => String(item.assetClassId ?? '') === String(context.assetClassId)
  );

  const [manufacturers, statuses, locations, fixedAssets] = await Promise.all([
    loadOptionalLookup(token, ['/api/manufacturers', '/api/manufacturer']),
    loadOptionalLookup(token, ['/api/asset-service-statuses', '/api/asset-service-status']),
    loadOptionalLookup(token, ['/api/locations', '/api/location', '/api/rooms', '/api/supply-rooms']),
    fetchAll('/api/fixed-assets', token, MAX_RECORDS)
  ]);

  const manufacturerById = lookupNameMap(
    manufacturers.rows,
    ['manufacturerName', 'name', 'companyName']
  );
  const statusById = lookupNameMap(
    statuses.rows,
    ['name', 'statusName', 'description']
  );

  const inventoryRows = scbaItems.map(item =>
    normalizeLiveItem(item, context.assetClassName, manufacturerById, statusById)
  );

  const scbaItemIds = new Set(scbaItems.map(item => String(item.id)));
  const itemById = new Map(scbaItems.map(item => [String(item.id), item]));
  const linkedMaintenance = fixedAssets
    .filter(row => scbaItemIds.has(String(row.itemId)))
    .map(record => normalizeMaintenanceLink(record, itemById.get(String(record.itemId))));

  const maintenanceByItem = new Map();
  for (const row of linkedMaintenance) {
    const key = String(row.itemId);
    const list = maintenanceByItem.get(key) || [];
    list.push(row);
    maintenanceByItem.set(key, list);
  }

  const assets = inventoryRows.map(item => {
    const supplyRoomAssignment = supplyRoomAssignmentByItem.get(String(item.itemId)) || null;
    const effectiveWarehouse = supplyRoomAssignment?.roomName || item.warehouse || '';
    const readyForHydro = supplyRoomAssignment
      ? sameRoomName(supplyRoomAssignment.roomName, HYDRO_STAGING_ROOM_NAME)
      : item.readyForHydro;
    const history = (maintenanceByItem.get(String(item.itemId)) || [])
      .sort((a, b) => String(b.maintenanceDate).localeCompare(String(a.maintenanceDate)));
    return {
      ...item,
      maintenanceRecordCount: history.length,
      latestMaintenanceDate: history[0]?.maintenanceDate || '',
      latestFormId: history[0]?.formId ?? null,
      latestFormAnswerUniqueId: history[0]?.formAnswerUniqueId || '',
      maintenanceHistory: history
    };
  });

  const formCounts = countBy(linkedMaintenance, row => String(row.formId ?? 'Unknown'));

  return {
    success: true,
    mode: 'READ_ONLY_ASSET_LIFECYCLE_ENGINE_PREVIEW_V8',
    module: 'SCBA_CYLINDER',
    assetClassId: context.assetClassId,
    assetClassName: context.assetClassName,
    sourceInventoryCount: context.items.length,
    sourceMaintenanceCount: fixedAssets.length,
    inventoryCount: assets.length,
    maintenanceRecordCount: linkedMaintenance.length,
    assetsWithMaintenance: assets.filter(row => row.maintenanceRecordCount > 0).length,
    assetsWithoutMaintenance: assets.filter(row => row.maintenanceRecordCount === 0).length,
    formCounts,
    lookupEndpoints: {
      assetClasses: context.assetClassPath,
      manufacturers: manufacturers.path,
      serviceStatuses: statuses.path,
      locations: locations.path
    },
    dataQuality: liveInventoryQuality(inventoryRows),
    assets,
    recommendedNextStep: 'Validate the inventory and maintenance counts, then resolve the dominant hydrostatic-test form answers.',
    performanceNote: 'Version 8 filters the inventory by asset class and shares API results to stay below Cloudflare subrequest limits.',
    note: 'This is a read-only joined lifecycle view. No OperativeIQ or D1 records were changed.'
  };
}


async function cachedDashboardResponse(request, env, url) {
  const cache = caches.default;
  const forceRefresh = url.searchParams.has('refresh');
  const cacheKey = new Request(`${url.origin}/api/dashboard/scba-v16-2-ac41-f37-t32`, { method: 'GET' });

  // A user-requested refresh must bypass Cloudflare's edge cache so inventory
  // transfers in OperativeIQ are reflected immediately.
  if (!forceRefresh) {
    const cached = await cache.match(cacheKey);
    if (cached) return cached;
  }

  const payload = await buildDashboardPayload(env, url);
  const response = json(payload, 200, {
    // Keep routine loads inexpensive, but do not allow inventory state to look
    // stale for long periods. Manual refresh always bypasses this cache.
    'Cache-Control': forceRefresh
      ? 'no-store, max-age=0'
      : 'public, max-age=30, s-maxage=60',
    'Access-Control-Allow-Origin': '*'
  });

  if (!forceRefresh) {
    await cache.put(cacheKey, response.clone());
  } else {
    // Replace any older cached dashboard with the freshly fetched payload so
    // subsequent viewers immediately see the same current inventory state.
    const cachedResponse = json(payload, 200, {
      'Cache-Control': 'public, max-age=30, s-maxage=60',
      'Access-Control-Allow-Origin': '*'
    });
    await cache.put(cacheKey, cachedResponse.clone());
  }

  return response;
}

async function buildDashboardPayload(env, url) {
  const token = await getAccessToken(env);
  const context = await resolveCylinderContext(env, url, token);
  if (Number(context.assetClassId) !== 41) {
    throw new Error(`SCBA dashboard integrity check failed: expected asset class 41, received ${context.assetClassId}.`);
  }
  const scbaItems = context.items.filter(
    item => String(item.assetClassId ?? '') === '41'
  );
  if (!scbaItems.length) {
    throw new Error('SCBA dashboard integrity check failed: asset class 41 returned no cylinders.');
  }

  const [manufacturers, statuses, locations, fixedAssets, supplyRooms] = await Promise.all([
    loadOptionalLookup(token, ['/api/manufacturers', '/api/manufacturer']),
    loadOptionalLookup(token, ['/api/asset-service-statuses', '/api/asset-service-status']),
    loadOptionalLookup(token, ['/api/locations', '/api/location', '/api/rooms', '/api/supply-rooms']),
    fetchAll('/api/fixed-assets', token, MAX_RECORDS),
    loadSupplyRooms(token)
  ]);

  const manufacturerById = lookupNameMap(manufacturers.rows, ['manufacturerName', 'name', 'companyName']);
  const statusById = lookupNameMap(statuses.rows, ['name', 'statusName', 'description']);
  const locationById = lookupNameMap(locations.rows, ['locationName', 'name', 'roomName', 'supplyRoomName', 'warehouseName', 'description']);
  const inventoryRows = scbaItems.map(item =>
    normalizeLiveItem(item, context.assetClassName, manufacturerById, statusById, locationById)
  );
  const supplyRoomInventory = await loadSupplyRoomInventory(token, supplyRooms.rows, inventoryRows);
  const supplyRoomAssignmentByItem = buildSupplyRoomAssignmentMap(supplyRoomInventory.rows, supplyRooms.rows, inventoryRows, supplyRoomInventory.forcedRoomName || '');

  const scbaItemIds = new Set(scbaItems.map(item => String(item.id)));
  const itemById = new Map(scbaItems.map(item => [String(item.id), item]));
  const linkedMaintenance = fixedAssets
    .filter(row => scbaItemIds.has(String(row.itemId)))
    .map(record => normalizeMaintenanceLink(record, itemById.get(String(record.itemId))))
    .filter(row => row.formId === 37 && row.type === 32);

  const maintenanceByItem = new Map();
  for (const row of linkedMaintenance) {
    const key = String(row.itemId);
    const list = maintenanceByItem.get(key) || [];
    list.push(row);
    maintenanceByItem.set(key, list);
  }

  const assets = inventoryRows.map(item => {
    const supplyRoomAssignment = supplyRoomAssignmentByItem.get(String(item.itemId)) || null;
    const effectiveWarehouse = supplyRoomAssignment?.roomName || item.warehouse || '';
    const readyForHydro = supplyRoomAssignment
      ? sameRoomName(supplyRoomAssignment.roomName, HYDRO_STAGING_ROOM_NAME)
      : item.readyForHydro;
    const history = (maintenanceByItem.get(String(item.itemId)) || [])
      .sort((a, b) => String(b.maintenanceDate).localeCompare(String(a.maintenanceDate)))
      .map(row => ({
        maintenanceId: row.maintenanceId,
        maintenanceDate: row.maintenanceDate,
        formId: row.formId,
        formAnswerUniqueId: row.formAnswerUniqueId,
        isClosed: row.isClosed
      }));
    return {
      itemId: item.itemId,
      assetTag: item.assetTag,
      serialNumber: item.serialNumber,
      itemNumber: item.itemNumber,
      partUpc: item.partUpc,
      description: item.assetDescription,
      manufacturer: item.manufacturer,
      cylinderType: item.cylinderType,
      modelNumber: item.modelNumber,
      modelYear: item.modelYear,
      inServiceDate: item.inServiceDate,
      nextMaintenanceDate: item.nextMaintenanceDate,
      plannedDecommissionDate:
        SCBA_PLANNED_DECOMMISSION_BY_PART_UPC[item.partUpc] ||
        SCBA_PLANNED_DECOMMISSION_BY_DESCRIPTION[item.assetDescription] ||
        item.decommissionDate ||
        '',
      plannedDecommissionSource:
        (SCBA_PLANNED_DECOMMISSION_BY_PART_UPC[item.partUpc] ||
         SCBA_PLANNED_DECOMMISSION_BY_DESCRIPTION[item.assetDescription])
          ? 'OperativeIQ SCBA Decommission Planning report'
          : (item.decommissionDate ? 'OperativeIQ item record' : ''),
      decommissionDate: item.decommissionDate,
      estimatedReplacementCost: item.estimatedReplacementCost,
      serviceStatus: item.serviceStatus,
      warehouse: effectiveWarehouse,
      warehouseId: supplyRoomAssignment?.roomId ?? item.warehouseId,
      readyForHydro,
      supplyRoomSource: supplyRoomAssignment ? 'OperativeIQ supply-room inventory' : (item.warehouse ? 'OperativeIQ item record' : ''),
      active: item.status === true,
      latestTestDate: history[0]?.maintenanceDate || '',
      testHistory: history
    };
  });

  const activeAssets = assets.filter(row => row.active);
  const now = new Date();
  const currentYear = now.getUTCFullYear();
  const testedCurrentYear = activeAssets.filter(row => row.latestTestDate.startsWith(String(currentYear))).length;
  const currentCost = activeAssets.reduce((sum, row) => sum + (row.estimatedReplacementCost || 0), 0);

  return {
    success: true,
    mode: 'LIVE_SCBA_LIFECYCLE_DASHBOARD_V16_2',
    generatedAt: new Date().toISOString(),
    refreshMinutes: 15,
    module: 'SCBA_CYLINDER',
    assetClassId: context.assetClassId,
    assetClassName: context.assetClassName,
    summary: {
      totalRecords: assets.length,
      activeAssets: activeAssets.length,
      inactiveAssets: assets.length - activeAssets.length,
      testedCurrentYear,
      dueCurrentYear: activeAssets.length - testedCurrentYear,
      currentYear,
      maintenanceRecords: linkedMaintenance.length,
      assetsWithHistory: activeAssets.filter(row => row.testHistory.length > 0).length,
      assetsWithoutHistory: activeAssets.filter(row => row.testHistory.length === 0).length,
      estimatedActiveReplacementValue: Math.round(currentCost * 100) / 100,
      readyForHydro: activeAssets.filter(row => row.readyForHydro).length
    },
    dataQuality: {
      missingManufacturer: activeAssets.filter(row => !row.manufacturer).length,
      missingInServiceDate: activeAssets.filter(row => !row.inServiceDate).length,
      missingNextMaintenanceDate: activeAssets.filter(row => !row.nextMaintenanceDate).length,
      missingCylinderType: activeAssets.filter(row => !row.cylinderType).length,
      missingPlannedDecommissionDate: activeAssets.filter(row => !row.plannedDecommissionDate).length
    },
    planningData: {
      source: 'OperativeIQ SCBA Cylinders Decommission Planning report',
      snapshotDate: SCBA_PLANNING_REPORT_SNAPSHOT,
      reportRows: 283,
      uniqueCylinders: 203,
      matchedActiveCylinders: activeAssets.filter(row => row.plannedDecommissionDate).length,
      unmatchedActiveCylinders: activeAssets.filter(row => !row.plannedDecommissionDate).length
    },
    datasetIntegrity: {
      expectedAssetClassId: 41,
      actualAssetClassId: context.assetClassId,
      assetClassName: context.assetClassName,
      hydroFormId: 37,
      hydroMaintenanceType: 32,
      uniqueCylinderCount: new Set(assets.map(row => String(row.itemId))).size,
      duplicateCylinderIds: assets.length - new Set(assets.map(row => String(row.itemId))).size,
      passed: Number(context.assetClassId) === 41 && assets.length === new Set(assets.map(row => String(row.itemId))).size,
      supplyRoomInventoryPath: supplyRoomInventory.path,
      supplyRoomInventoryDetected: Boolean(supplyRoomInventory.path),
      hydroStagingRoom: HYDRO_STAGING_ROOM_NAME,
      normalScbaRoom: NORMAL_SCBA_ROOM_NAME,
      hydroStagingMatches: activeAssets.filter(row => row.readyForHydro).length
    },
    limitations: [
      'Detailed hydrostatic form answers are not yet resolved from formAnswerUniqueId.',
      'Planned decommission dates use the OperativeIQ SCBA Cylinders Decommission Planning report (203 unique cylinders); the item record is used as a secondary source, and only unmatched cylinders fall back to a clearly labeled 15-year estimate.',
      'Replacement costs use the current item price stored in OperativeIQ when available and are planning estimates only.',
      supplyRoomInventory.path
        ? `Ready for Hydro is driven by current OperativeIQ supply-room inventory from ${supplyRoomInventory.path}; cylinders in ${HYDRO_STAGING_ROOM_NAME} are staged for testing.`
        : 'OperativeIQ supply-room inventory could not be resolved automatically; Ready for Hydro falls back to any location available on the item record.'
    ],
    assets
  };
}

async function resolveCylinderContext(env, url, token) {
  const classes = await loadAssetClasses(token);
  const explicit = numberOrNull(url.searchParams.get('assetClassId') || 41); // Confirmed WTFD SCBA Cylinder asset class
  let assetClassId = explicit;
  let assetClassName = '';
  let items = [];

  if (assetClassId !== null) {
    assetClassName = classes.rows.find(row => String(row.id) === String(assetClassId))?.name || '';

    // OperativeIQ limits $top to 200. Filtering at the API reduces the scba
    // inventory from thousands of records to only the selected asset class,
    // keeping the Worker below Cloudflare's subrequest limit.
    const filteredPath = `/api/items?$filter=${encodeURIComponent(`assetClassId eq ${assetClassId}`)}`;
    try {
      items = await fetchAll(filteredPath, token, MAX_RECORDS);
    } catch (_error) {
      // Safe read-only fallback for tenants that reject this OData filter.
      const allItems = await fetchAll('/api/items', token, MAX_RECORDS);
      items = allItems.filter(item => String(item.assetClassId ?? '') === String(assetClassId));
    }
  } else {
    items = await fetchAll('/api/items', token, MAX_RECORDS);
    const classById = new Map(classes.rows.map(row => [String(row.id), row.name]));
    const grouped = new Map();
    for (const item of items) {
      const id = String(item.assetClassId ?? '');
      if (!id) continue;
      const row = grouped.get(id) || { assetClassId: numberOrNull(id), assetClassName: classById.get(id) || '', totalItems: 0, scbaEvidenceCount: 0 };
      row.totalItems += 1;
      if (/scba|cylinder|breathing\s*air|air\s*bottle/i.test(itemSearchText(item))) row.scbaEvidenceCount += 1;
      grouped.set(id, row);
    }
    const best = [...grouped.values()].sort((a, b) => scbaClassScore(b) - scbaClassScore(a))[0];
    if (!best || scbaClassScore(best) <= 0) throw new Error('Unable to identify the SCBA cylinder asset class automatically. Run /api/scba/class-discovery and supply ?assetClassId=ID.');
    assetClassId = best.assetClassId;
    assetClassName = best.assetClassName;
    items = items.filter(item => String(item.assetClassId ?? '') === String(assetClassId));
  }

  return { items, assetClassId, assetClassName, assetClassPath: classes.path };
}

async function loadAssetClasses(token) {
  const resolution = await resolveLookupPath(token, ['/api/asset-classes', '/api/asset-class', '/api/ems-asset-classes', '/api/ems-asset-class']);
  if (!resolution.path) return { path: null, rows: [] };
  const raw = await fetchAll(resolution.path, token, 5000);
  return { path: resolution.path, rows: raw.map(normalizeAssetClass) };
}

async function loadOptionalLookup(token, candidates) {
  const resolution = await resolveLookupPath(token, candidates);
  if (!resolution.path) return { path: null, rows: [] };
  return { path: resolution.path, rows: await fetchAll(resolution.path, token, 10000) };
}

async function resolveLookupPath(token, candidates) {
  for (const path of candidates) {
    const result = await probePath(path, token);
    if (result.httpStatus === 200) return { path, sample: result };
  }
  return { path: null, sample: null };
}

function normalizeAssetClass(source) {
  return {
    id: first(source, ['id', 'assetClassId', 'classId']),
    name: text(source, ['className', 'name', 'assetClassName']),
    description: text(source, ['classDescription', 'description']),
    status: first(source, ['status', 'active']),
    raw: source
  };
}


async function loadSupplyRooms(token) {
  let fallback = null;
  const candidates = unique([
    ...SUPPLY_ROOM_LOOKUP_CANDIDATES,
    ...await safeDiscoveredPathsFor(token, /supply|room/i, true)
  ]);

  for (const path of candidates) {
    if (/\{/.test(path)) continue;
    const result = await probePath(path, token);
    if (result.httpStatus !== 200) continue;
    try {
      const rows = await fetchAll(path, token, 10000);
      if (!rows.length) continue;
      const names = rows.map(row => text(row, ['supplyRoomName', 'roomName', 'name', 'locationName', 'warehouseName', 'description'])).filter(Boolean);
      const candidate = { path, rows };
      if (names.some(name => sameRoomName(name, HYDRO_STAGING_ROOM_NAME)) || names.some(name => sameRoomName(name, NORMAL_SCBA_ROOM_NAME))) return candidate;
      const signature = `${uniqueFields(rows).join(' ')} ${names.slice(0, 10).join(' ')}`;
      if (/supply.?room/i.test(signature) && !fallback) fallback = candidate;
    } catch {}
  }
  return fallback || { path: null, rows: [] };
}

async function loadSupplyRoomInventory(token, supplyRooms, inventoryRows) {
  const discovered = await safeDiscoveredPathsFor(token, /supply|inventory|stock|part|room/i, true);
  const dueRoom = findSupplyRoom(supplyRooms, HYDRO_STAGING_ROOM_NAME);
  const candidates = SUPPLY_ROOM_INVENTORY_CANDIDATES.map(path => ({ path, forcedRoomName: '' }));

  for (const discoveredPath of discovered) {
    if (!/supply|inventory|stock|part|room/i.test(discoveredPath)) continue;
    if (/\{/.test(discoveredPath)) {
      if (!dueRoom?.id) continue;
      candidates.push({ path: instantiateApiPath(discoveredPath, dueRoom.id), forcedRoomName: HYDRO_STAGING_ROOM_NAME });
    } else {
      candidates.push({ path: discoveredPath, forcedRoomName: '' });
    }
  }

  let fallback = null;
  const seen = new Set();
  for (const candidateInfo of candidates.slice(0, 120)) {
    const key = `${candidateInfo.path}|${candidateInfo.forcedRoomName}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const result = await probePath(candidateInfo.path, token);
    if (result.httpStatus !== 200) continue;
    const score = supplyRoomInventoryProbeScore(result);
    if (score <= 0 && !candidateInfo.forcedRoomName) continue;
    try {
      const rows = await fetchAll(candidateInfo.path, token, MAX_RECORDS);
      const evaluated = evaluateSupplyRoomRows(rows, supplyRooms, inventoryRows, candidateInfo.forcedRoomName);
      const candidate = { path: candidateInfo.path, rows, score: score + evaluated.score, evaluated, forcedRoomName: candidateInfo.forcedRoomName };
      if (evaluated.hydroMatches > 0) return candidate;
      if (!fallback || candidate.score > fallback.score) fallback = candidate;
    } catch {}
  }
  return fallback || { path: null, rows: [], score: 0, forcedRoomName: '', evaluated: { hydroMatches: 0, matchedItems: 0, score: 0 } };
}

function supplyRoomInventoryProbeScore(result) {
  const textValue = `${result.path} ${result.detectedFields.join(' ')} ${JSON.stringify(result.sampleRows)}`.toLowerCase();
  let score = 0;
  if (/supply.?room/.test(textValue)) score += 8;
  if (/inventory|on.?hand|stock/.test(textValue)) score += 6;
  if (/serial|part.?number|item.?number|upc|asset/.test(textValue)) score += 5;
  if (/room.?id|supply.?room.?id|location.?id/.test(textValue)) score += 4;
  if (/part|item/.test(textValue)) score += 2;
  return score;
}

function evaluateSupplyRoomRows(rows, supplyRooms, inventoryRows, forcedRoomName = '') {
  const assignments = buildSupplyRoomAssignmentMap(rows, supplyRooms, inventoryRows, forcedRoomName);
  const values = [...assignments.values()];
  const hydroMatches = values.filter(row => sameRoomName(row.roomName, HYDRO_STAGING_ROOM_NAME)).length;
  return {
    matchedItems: assignments.size,
    hydroMatches,
    score: assignments.size + hydroMatches * 100
  };
}

function buildSupplyRoomAssignmentMap(rows, supplyRooms, inventoryRows, forcedRoomName = '') {
  const roomNameById = lookupNameMap(supplyRooms, ['supplyRoomName', 'roomName', 'name', 'locationName', 'description']);
  const itemByExactIdentifier = new Map();
  const itemById = new Map();

  for (const item of inventoryRows) {
    itemById.set(String(item.itemId), item);
    for (const value of [item.serialNumber, item.itemNumber, item.partUpc, item.assetTag, item.assetDescription]) {
      const key = exactInventoryKey(value);
      if (key) itemByExactIdentifier.set(key, item);
    }
  }

  const assignments = new Map();
  for (const raw of rows || []) {
    const row = normalizeSupplyRoomInventoryRow(raw, roomNameById, forcedRoomName);
    if (!rowIsOnHand(row)) continue;

    let item = null;
    for (const idValue of row.itemIds) {
      if (idValue !== null && idValue !== undefined && itemById.has(String(idValue))) {
        item = itemById.get(String(idValue));
        break;
      }
    }
    if (!item) {
      for (const value of row.identifiers) {
        const key = exactInventoryKey(value);
        if (key && itemByExactIdentifier.has(key)) {
          item = itemByExactIdentifier.get(key);
          break;
        }
      }
    }
    if (!item || !row.roomName) continue;

    const candidate = {
      itemId: item.itemId,
      roomId: row.roomId,
      roomName: row.roomName,
      onHand: row.onHand,
      identifiers: row.identifiers
    };

    // A positive on-hand record in Due for Hydro always wins over normal inventory.
    const existing = assignments.get(String(item.itemId));
    if (!existing || sameRoomName(candidate.roomName, HYDRO_STAGING_ROOM_NAME) || !sameRoomName(existing.roomName, HYDRO_STAGING_ROOM_NAME)) {
      assignments.set(String(item.itemId), candidate);
    }
  }
  return assignments;
}

function normalizeSupplyRoomInventoryRow(source, roomNameById = new Map(), forcedRoomName = '') {
  const roomObject = first(source, ['supplyRoom', 'room', 'location', 'warehouse', 'supplyRoomLocation']);
  const directRoomId = first(source, ['supplyRoomId', 'supplyRoomID', 'supplyRoomFK', 'roomId', 'roomID', 'roomFK', 'locationId', 'locationFK', 'warehouseId', 'warehouseFK']);
  const nestedRoomId = roomObject && typeof roomObject === 'object'
    ? first(roomObject, ['id', 'supplyRoomId', 'roomId', 'locationId', 'warehouseId'])
    : null;
  const roomId = directRoomId ?? nestedRoomId ?? null;
  const directRoomName = text(source, ['supplyRoomName', 'roomName', 'locationName', 'warehouseName', 'supplyRoomDescription']);
  const nestedRoomName = roomObject && typeof roomObject === 'object'
    ? text(roomObject, ['supplyRoomName', 'roomName', 'name', 'locationName', 'warehouseName', 'description'])
    : (typeof roomObject === 'string' ? roomObject.trim() : '');
  const roomName = directRoomName || nestedRoomName || (roomId !== null ? (roomNameById.get(String(roomId)) || '') : '') || forcedRoomName;

  const partObject = first(source, ['part', 'item', 'asset', 'fixedAsset', 'inventoryItem']);
  const identifiers = unique([
    text(source, ['serialNumber', 'serialNo', 'partSerialNumber', 'partNumber', 'itemNumber', 'partUpc', 'partUPC', 'upc', 'assetNumber', 'assetTag', 'partDescription', 'itemName', 'description']),
    partObject && typeof partObject === 'object' ? text(partObject, ['serialNumber', 'serialNo', 'partSerialNumber', 'partNumber', 'itemNumber', 'partUpc', 'partUPC', 'upc', 'assetNumber', 'assetTag', 'itemName', 'partDescription', 'description']) : ''
  ].filter(Boolean));

  const itemIds = unique([
    first(source, ['itemId', 'itemID', 'fixedAssetId', 'assetId', 'inventoryItemId', 'partId', 'partID']),
    partObject && typeof partObject === 'object' ? first(partObject, ['id', 'itemId', 'fixedAssetId', 'assetId', 'partId']) : null
  ].filter(value => value !== null && value !== undefined && value !== ''));

  const onHandRaw = first(source, ['onHand', 'onHandQuantity', 'quantityOnHand', 'qtyOnHand', 'currentQuantity', 'quantity', 'stockQuantity', 'inventoryLevel']);
  const onHand = onHandRaw === null || onHandRaw === undefined || onHandRaw === '' ? null : Number(onHandRaw);

  return { roomId, roomName, identifiers, itemIds, onHand, raw: source };
}

function rowIsOnHand(row) {
  return row.onHand === null || !Number.isFinite(row.onHand) || row.onHand > 0;
}

function exactInventoryKey(value) {
  return String(value || '').trim().toLowerCase().replace(/\s+/g, ' ');
}

function sameRoomName(a, b) {
  return exactInventoryKey(a) === exactInventoryKey(b);
}

async function safeDiscoveredPathsFor(token, pattern, includeParameterized = false) {
  try {
    const specification = await fetchSwagger(token);
    return Object.entries(specification.paths || {})
      .filter(([path, operations]) => (includeParameterized || !/\{/.test(path)) && operations && operations.get && pattern.test(`${path} ${operationText(operations)}`))
      .map(([path]) => path);
  } catch {
    return [];
  }
}

function findSupplyRoom(rows, wantedName) {
  for (const row of rows || []) {
    const name = text(row, ['supplyRoomName', 'roomName', 'name', 'locationName', 'warehouseName', 'description']);
    if (!sameRoomName(name, wantedName)) continue;
    return {
      id: first(row, ['id', 'supplyRoomId', 'roomId', 'locationId', 'warehouseId']),
      name
    };
  }
  return null;
}

function instantiateApiPath(path, id) {
  return String(path).replace(/\{[^}]+\}/g, encodeURIComponent(String(id)));
}

async function supplyRoomDebug(env, url) {
  const token = await getAccessToken(env);
  const context = await resolveCylinderContext(env, url, token);
  const scbaItems = context.items.filter(item => String(item.assetClassId ?? '') === '41');
  const manufacturers = await loadOptionalLookup(token, ['/api/manufacturers', '/api/manufacturer']);
  const statuses = await loadOptionalLookup(token, ['/api/asset-service-statuses', '/api/asset-service-status']);
  const manufacturerById = lookupNameMap(manufacturers.rows, ['manufacturerName', 'name', 'companyName']);
  const statusById = lookupNameMap(statuses.rows, ['name', 'statusName', 'description']);
  const inventoryRows = scbaItems.map(item => normalizeLiveItem(item, context.assetClassName, manufacturerById, statusById));
  const supplyRooms = await loadSupplyRooms(token);
  const source = await loadSupplyRoomInventory(token, supplyRooms.rows, inventoryRows);
  const assignments = buildSupplyRoomAssignmentMap(source.rows, supplyRooms.rows, inventoryRows, source.forcedRoomName || '');
  const serial = String(url.searchParams.get('serial') || 'OK655448').trim();
  const target = inventoryRows.find(item => [item.serialNumber, item.itemNumber, item.partUpc, item.assetTag].some(value => exactInventoryKey(value) === exactInventoryKey(serial))) || null;
  const assignment = target ? assignments.get(String(target.itemId)) || null : null;

  return {
    success: true,
    mode: 'READ_ONLY_SUPPLY_ROOM_DEBUG_V16_2',
    supplyRoomLookupPath: supplyRooms.path,
    supplyRoomInventoryPath: source.path,
    supplyRoomCount: supplyRooms.rows.length,
    sourceRowCount: source.rows.length,
    sourceDetectedFields: uniqueFields(source.rows),
    matchedCylinderCount: assignments.size,
    hydroStagingCount: [...assignments.values()].filter(row => sameRoomName(row.roomName, HYDRO_STAGING_ROOM_NAME)).length,
    target: target ? { itemId: target.itemId, assetTag: target.assetTag, serialNumber: target.serialNumber, partUpc: target.partUpc, description: target.assetDescription } : null,
    targetAssignment: assignment,
    knownWorkflow: { normal: NORMAL_SCBA_ROOM_NAME, readyForHydro: HYDRO_STAGING_ROOM_NAME },
    note: 'Read-only diagnostic. No OperativeIQ records were changed.'
  };
}

function normalizeLiveItem(source, assetClassName, manufacturerById, statusById, locationById = new Map()) {
  const itemId = first(source, ['id']);
  const itemName = text(source, ['itemName']);
  const itemNumber = text(source, ['itemNumber']);
  const partUpc = text(source, ['partUpc']);
  const locationObject = first(source, ['location', 'assignedLocation', 'room', 'supplyRoom', 'warehouse']);
  const directId = numberOrNull(first(source, ['locationId', 'locationFK', 'roomId', 'roomFK', 'supplyRoomId', 'supplyRoomFK', 'warehouseId', 'warehouseFK']));
  const nestedId = locationObject && typeof locationObject === 'object' ? numberOrNull(first(locationObject, ['id', 'locationId', 'roomId', 'supplyRoomId', 'warehouseId'])) : null;
  const warehouseId = directId !== null ? directId : nestedId;
  const directWarehouse = text(source, ['locationName', 'assignedLocationName', 'roomName', 'supplyRoomName', 'warehouseName']) ||
    (locationObject && typeof locationObject === 'object'
      ? text(locationObject, ['locationName', 'name', 'roomName', 'supplyRoomName', 'warehouseName', 'description'])
      : (typeof locationObject === 'string' ? locationObject.trim() : ''));
  const warehouse = directWarehouse || (warehouseId !== null ? (locationById.get(String(warehouseId)) || '') : '');
  const readyForHydro = /\bdue\s+for\s+hydro\b/i.test(warehouse);
  return {
    itemId,
    assetClassId: numberOrNull(source.assetClassId),
    assetClassName,
    assetDescription: text(source, ['assetDescription']) || itemName,
    assetTag: itemNumber || partUpc || text(source, ['internalPartNumber']),
    itemName,
    itemNumber,
    partUpc,
    serialNumber: itemNumber,
    manufacturerId: numberOrNull(source.manufacturerId),
    manufacturer: manufacturerById.get(String(source.manufacturerId)) || '',
    modelNumber: text(source, ['modelNumber']),
    modelYear: validModelYear(first(source, ['modelYear'])),
    inServiceDate: dateText(source, ['inServiceDate']),
    nextMaintenanceDate: dateText(source, ['preventativeMaintenanceNextPmdate']),
    decommissionDate: dateText(source, ['decommissionOrOutOfServiceDate']),
    estimatedReplacementCost: numeric(first(source, ['partPrice', 'unitOrderPrice', 'unitPrice'])),
    cylinderType: parseCylinderType(itemName || text(source, ['modelNumber'])),
    serviceStatusId: numberOrNull(source.serviceStatusFK),
    serviceStatus: statusById.get(String(source.serviceStatusFK)) || '',
    warehouseId,
    warehouse,
    readyForHydro,
    status: first(source, ['status']),
    partType: text(source, ['partType']),
    categoryId: numberOrNull(source.categoryId),
    notes: text(source, ['notes']),
    lastModificationTime: dateTimeText(source.lastModificationTime),
    raw: source
  };
}

function normalizeMaintenanceLink(source, item) {
  return {
    maintenanceId: first(source, ['id']),
    itemId: first(source, ['itemId']),
    assetName: text(item || {}, ['itemName', 'assetDescription']),
    assetTag: text(item || {}, ['itemNumber', 'partUpc', 'internalPartNumber']),
    maintenanceDate: dateText(source, ['performPreventativeMaintenanceEnterDate', 'createdDate', 'createdTime']),
    notes: text(source, ['performPreventativeMaintenanceEnterNotes']),
    formId: first(source, ['formId']),
    formAnswerUniqueId: text(source, ['formAnswerUniqueId']),
    type: first(source, ['type']),
    statusId: first(source, ['statusId']),
    isClosed: first(source, ['isClosed']),
    uniqueId: text(source, ['uniqueId']),
    lastModificationTime: dateTimeText(source.lastModificationTime),
    raw: source
  };
}


function validModelYear(value) {
  const year = Number(value);
  return Number.isFinite(year) && year >= 1950 && year <= 2100 ? year : null;
}

function numeric(value) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : 0;
}

function parseCylinderType(value) {
  const textValue = String(value || '');
  const patterns = [
    /\b(1\.5|1\.50)\b/,
    /\b(1\.75)\b/,
    /\b(2\.0|2\.00)\b/,
    /\b(2\.5|2\.50)\b/,
    /\b(3\.0|3\.00)\b/,
    /\b(4\.0|4\.00)\b/,
    /\b(5\.0|5\.00)\b/,
    /\b(6\.0|6\.00)\b/
  ];
  for (const pattern of patterns) {
    const match = textValue.match(pattern);
    if (match) return String(Number(match[1]));
  }
  return '';
}

function itemSearchText(item) {
  return [item.itemName, item.itemNumber, item.partUpc, item.assetDescription, item.internalPartNumber, item.notes, item.modelNumber].filter(Boolean).join(' ');
}

function minimalItem(item) {
  return {
    id: item.id,
    itemName: item.itemName || '',
    itemNumber: item.itemNumber || '',
    partUpc: item.partUpc || '',
    assetDescription: item.assetDescription || '',
    assetClassId: item.assetClassId ?? null
  };
}

function scbaClassScore(row) {
  let score = 0;
  if (/scba|cylinder|bottle/i.test(row.assetClassName || '')) score += 10000;
  score += Number(row.scbaEvidenceCount || 0) * 100;
  if (row.totalItems && row.scbaEvidenceCount) score += Math.round((row.scbaEvidenceCount / row.totalItems) * 100);
  return score;
}

function lookupNameMap(rows, nameFields) {
  const map = new Map();
  for (const row of rows) {
    const id = first(row, ['id', 'manufacturerId', 'statusId', 'supplyRoomId', 'roomId', 'locationId', 'warehouseId']);
    if (id === null) continue;
    map.set(String(id), text(row, nameFields));
  }
  return map;
}

function liveInventoryQuality(rows) {
  return {
    blankAssetTags: rows.filter(row => !row.assetTag).length,
    blankManufacturers: rows.filter(row => !row.manufacturer).length,
    blankInServiceDates: rows.filter(row => !row.inServiceDate).length,
    blankDecommissionDates: rows.filter(row => !row.decommissionDate).length,
    duplicateAssetTags: duplicateValues(rows.map(row => tagKey(row.assetTag)).filter(Boolean))
  };
}

function countBy(rows, keyFn) {
  const counts = new Map();
  for (const row of rows) {
    const key = keyFn(row);
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  return [...counts.entries()].map(([value, count]) => ({ value, count })).sort((a, b) => b.count - a.count || String(a.value).localeCompare(String(b.value)));
}

function dateTimeText(value) {
  if (value === null || value === undefined || value === '') return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value).trim() : date.toISOString();
}

async function discoverCylinderResources(env) {
  const token = await getAccessToken(env);
  const specification = await fetchSwagger(token);
  const paths = Object.keys(specification.paths || {});
  const schemas = specification.components?.schemas || specification.definitions || {};
  const terms = /scba|maintenance|asset|equipment|inspection|test|service/i;
  const likelyPaths = paths
    .filter(path => terms.test(path))
    .map(path => ({
      path,
      methods: Object.keys(specification.paths[path] || {}).filter(method => ['get', 'post', 'put', 'delete', 'patch'].includes(method)),
      summary: operationText(specification.paths[path])
    }))
    .sort((a, b) => scoreDiscovery(b.path + ' ' + b.summary) - scoreDiscovery(a.path + ' ' + a.summary));

  const likelyModels = Object.entries(schemas)
    .map(([name, schema]) => ({ name, properties: Object.keys(schema?.properties || {}) }))
    .filter(model => terms.test(`${model.name} ${model.properties.join(' ')}`))
    .sort((a, b) => scoreDiscovery(`${b.name} ${b.properties.join(' ')}`) - scoreDiscovery(`${a.name} ${a.properties.join(' ')}`));

  return {
    success: true,
    mode: 'READ_ONLY_SWAGGER_DISCOVERY',
    totalPathCount: paths.length,
    matchingPathCount: likelyPaths.length,
    likelyPaths: likelyPaths.slice(0, 150),
    matchingModelCount: likelyModels.length,
    likelyModels: likelyModels.slice(0, 150),
    recommendedNextStep: 'Run /api/scba/probe and review the successful candidates and detected fields.',
    note: 'Swagger metadata only. No records or D1 data were changed.'
  };
}

async function probeCylinderResources(env, url) {
  const token = await getAccessToken(env);
  const group = String(url.searchParams.get('group') || 'all').trim().toLowerCase();
  if (!Object.prototype.hasOwnProperty.call(PROBE_GROUPS, group)) {
    throw new Error(`Unknown probe group "${group}". Use inventory, maintenance, forms, lookups, or all.`);
  }

  const discovered = await safeDiscoveredPaths(token);
  const configured = [env.SCBA_INVENTORY_PATH, env.SCBA_TESTING_PATH].filter(Boolean);
  const candidates = unique([
    ...configured,
    ...PROBE_GROUPS[group],
    ...(group === 'all' ? discovered : discovered.filter(path => pathMatchesGroup(path, group)))
  ]);
  const maxCandidates = boundedNumber(url.searchParams.get('max'), 1, 120, group === 'all' ? 80 : 50);
  const results = [];

  for (const path of candidates.slice(0, maxCandidates)) {
    results.push(await probePath(path, token));
  }

  const successful = results.filter(result => result.httpStatus === 200);
  const ranked = successful
    .map(result => ({
      ...result,
      classification: classifyProbeResult(result),
      relevanceScore: probeRelevanceScore(result)
    }))
    .sort((a, b) => b.relevanceScore - a.relevanceScore);

  return {
    success: true,
    mode: 'READ_ONLY_RESOURCE_PROBE_V3',
    group,
    candidateCount: results.length,
    successfulCount: successful.length,
    likelyInventoryPaths: ranked.filter(result => result.classification.inventoryLikely).slice(0, 10),
    likelyMaintenancePaths: ranked.filter(result => result.classification.maintenanceLikely).slice(0, 10),
    likelyFormAnswerPaths: ranked.filter(result => result.classification.formAnswerLikely).slice(0, 10),
    results,
    recommendedNextStep: successful.length
      ? 'Review the ranked likely paths, then run /api/scba/raw?path=/api/...&limit=25 for the strongest candidates.'
      : 'Run each probe group separately. If all candidates fail, we will derive additional route variants from successful OperativeIQ resources.',
    note: 'Each candidate was requested with $top=5 using GET only. No OperativeIQ or D1 records were changed.'
  };
}

async function inventoryPreview(env, url) {
  const token = await getAccessToken(env);
  const path = validatedApiPath(url.searchParams.get('path') || env.SCBA_INVENTORY_PATH || await selectInventoryPath(token));
  const max = boundedNumber(url.searchParams.get('limit'), 1, MAX_RECORDS, MAX_RECORDS);
  const source = await fetchAll(path, token, max);
  const normalizedAll = source.map(normalizeInventoryRecord);
  const scbaRows = normalizedAll.filter(isCylinderInventoryRecord);

  return {
    success: true,
    mode: 'READ_ONLY_INVENTORY_PREVIEW',
    endpoint: path,
    sourceRecordCount: source.length,
    scbaRecordCount: scbaRows.length,
    detectedFields: uniqueFields(source),
    rows: scbaRows,
    dataQuality: inventoryQuality(scbaRows),
    note: 'No OperativeIQ or D1 records were changed.'
  };
}

async function testingPreview(env, url) {
  const token = await getAccessToken(env);
  const path = validatedApiPath(url.searchParams.get('path') || env.SCBA_TESTING_PATH || await selectTestingPath(token));
  const max = boundedNumber(url.searchParams.get('limit'), 1, MAX_RECORDS, MAX_RECORDS);
  const source = await fetchAll(path, token, max);
  const normalizedAll = source.map(normalizeTestingRecord);
  const scbaRows = normalizedAll.filter(isCylinderTestingRecord);

  return {
    success: true,
    mode: 'READ_ONLY_TESTING_PREVIEW',
    endpoint: path,
    sourceRecordCount: source.length,
    scbaRecordCount: scbaRows.length,
    detectedFields: uniqueFields(source),
    rows: scbaRows,
    dataQuality: testingQuality(scbaRows),
    note: 'No OperativeIQ or D1 records were changed.'
  };
}

async function selectInventoryPath(token) {
  const discovered = await safeDiscoveredPaths(token);
  const candidates = unique([...INVENTORY_CANDIDATES, ...discovered.filter(path => /asset|equipment|inventory/i.test(path))]);
  for (const path of candidates) {
    const result = await probePath(path, token);
    if (result.httpStatus === 200 && looksLikeInventory(result.detectedFields, result.sampleRows)) return path;
  }
  throw new Error('No SCBA cylinder inventory resource was identified automatically. Run /api/scba/discovery and /api/scba/probe, then set SCBA_INVENTORY_PATH.');
}

async function selectTestingPath(token) {
  const discovered = await safeDiscoveredPaths(token);
  const candidates = unique([...TESTING_CANDIDATES, ...discovered.filter(path => /scba|maintenance|inspection|test|service/i.test(path))]);
  for (const path of candidates) {
    const result = await probePath(path, token);
    if (result.httpStatus === 200 && looksLikeTesting(result.detectedFields, result.sampleRows)) return path;
  }
  throw new Error('No hydrostatic testing resource was identified automatically. Run /api/scba/discovery and /api/scba/probe, then set SCBA_TESTING_PATH.');
}

async function safeDiscoveredPaths(token) {
  try {
    const specification = await fetchSwagger(token);
    return Object.keys(specification.paths || {}).filter(path => /scba|maintenance|asset|equipment|inspection|test|service|supply|inventory|stock|room|part/i.test(path));
  } catch {
    return [];
  }
}

async function probePath(path, token) {
  const normalizedPath = validatedApiPath(path);
  const url = new URL(RESOURCE_ROOT + normalizedPath);
  if (!url.searchParams.has('$top')) url.searchParams.set('$top', '5');
  if (!url.searchParams.has('$skip')) url.searchParams.set('$skip', '0');

  try {
    const response = await fetch(url, { headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' } });
    const text = await response.text();
    if (!response.ok) {
      return { path: normalizedPath, httpStatus: response.status, error: safeApiError(text) };
    }
    const payload = JSON.parse(text);
    const rows = arrayPayload(payload);
    return {
      path: normalizedPath,
      httpStatus: response.status,
      recordCount: rows.length,
      overallCount: numberOrNull(response.headers.get('X-Overall-Count')),
      detectedFields: uniqueFields(rows),
      sampleRows: rows.slice(0, 2)
    };
  } catch (error) {
    return { path: normalizedPath, httpStatus: 0, error: errorMessage(error) };
  }
}

async function fetchSwagger(token) {
  let lastError = '';
  for (const path of SWAGGER_CANDIDATES) {
    const response = await fetch(RESOURCE_ROOT + path, { headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' } });
    const text = await response.text();
    if (response.ok) return JSON.parse(text);
    lastError = `${path}: ${response.status} ${safeApiError(text)}`;
  }
  throw new Error(`Unable to load OperativeIQ Swagger metadata. ${lastError}`);
}

async function getAccessToken(env) {
  if (!env.OPERATIVE_CLIENT_ID || !env.OPERATIVE_CLIENT_SECRET) {
    throw new Error('Missing OPERATIVE_CLIENT_ID or OPERATIVE_CLIENT_SECRET Cloudflare secret.');
  }
  const now = Date.now();
  if (cachedToken && now < cachedTokenExpiresAt - 60000) return cachedToken;

  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: env.OPERATIVE_CLIENT_ID,
    client_secret: env.OPERATIVE_CLIENT_SECRET
  });
  const response = await fetch(AUTH_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' },
    body
  });
  const text = await response.text();
  if (!response.ok) throw new Error(`OperativeIQ authorization failed (${response.status}): ${safeApiError(text)}`);
  const payload = JSON.parse(text);
  if (!payload.access_token) throw new Error('OperativeIQ authorization response did not include access_token.');
  cachedToken = payload.access_token;
  cachedTokenExpiresAt = now + Math.max(60, Number(payload.expires_in || 3600)) * 1000;
  return cachedToken;
}

async function fetchAll(endpoint, token, maxRecords = MAX_RECORDS) {
  const records = [];
  let skip = 0;
  while (records.length < maxRecords) {
    const url = new URL(RESOURCE_ROOT + endpoint);
    if (!url.searchParams.has('$top')) url.searchParams.set('$top', String(Math.min(PAGE_SIZE, maxRecords - records.length)));
    url.searchParams.set('$skip', String(skip));
    const response = await fetch(url, { headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' } });
    const text = await response.text();
    if (!response.ok) throw new Error(`OperativeIQ resource request failed (${response.status}): ${safeApiError(text)}`);
    const page = arrayPayload(JSON.parse(text));
    records.push(...page);
    if (!page.length || page.length < Number(url.searchParams.get('$top'))) break;
    skip += page.length;
  }
  return records.slice(0, maxRecords);
}

function normalizeInventoryRecord(source) {
  return {
    sourceId: first(source, ['id', 'assetId', 'assetID', 'Asset ID']),
    assetDescription: text(source, ['assetDescription', 'description', 'assetName', 'name', 'Asset Description']),
    assetTag: text(source, ['assetTag', 'assetNumber', 'tagNumber', 'assetCode', 'Asset Tag']),
    serialNumber: text(source, ['serialNumber', 'serialNo', 'Serial Number']),
    manufacturer: text(source, ['manufacturer', 'manufacturerName', 'make', 'Manufacturer']),
    model: text(source, ['model', 'modelName', 'Model']),
    assetClass: text(source, ['assetClass', 'assetClassName', 'className', 'Asset Class']),
    category: text(source, ['category', 'categoryName', 'Category']),
    subcategory: text(source, ['subcategory', 'subCategory', 'subcategoryName', 'Subcategory']),
    serviceStatus: text(source, ['serviceStatus', 'assetServiceStatus', 'status', 'Service Status']),
    inServiceDate: dateText(source, ['inServiceDate', 'placedInServiceDate', 'serviceDate', 'In Service Date']),
    plannedDecommissionDate: dateText(source, ['plannedDecommissionDate', 'decommissionDate', 'plannedRetirementDate', 'Planned Decommission Date']),
    actualDecommissionDate: dateText(source, ['actualDecommissionDate', 'retiredDate', 'Actual Decommission Date']),
    location: text(source, ['location', 'locationName', 'assignedLocation', 'Location']),
    unit: text(source, ['unit', 'unitName', 'truck', 'truckName', 'apparatus', 'apparatusName']),
    maintenanceDate: dateText(source, ['maintenanceDate', 'nextMaintenanceDate', 'inspectionDueDate', 'Maintenance Date']),
    raw: source
  };
}

function normalizeTestingRecord(source) {
  return {
    sourceId: first(source, ['id', 'maintenanceId', 'testId', 'recordId']),
    assetTag: text(source, ['scbaSectionNumber', 'assetTag', 'assetNumber', 'tagNumber', 'Cylinder Section Number']),
    maintenanceDate: dateText(source, ['maintenanceDate', 'scheduledDate', 'Maintenance Date']),
    testDate: dateText(source, ['dateOfCylinderTest', 'testDate', 'completedDate', 'maintenanceCompletedDate', 'Date Of Hydrostatic Test']),
    maintenanceForm: text(source, ['maintenanceForm', 'formName', 'questionaryName', 'Maintenance Form']),
    testPressure: text(source, ['testPressure', 'pressure', 'Test Pressure']),
    leaksPresent: text(source, ['anyLeaksPresent', 'leaksPresent', 'leak', 'Any Leaks Present']),
    couplingsGood: text(source, ['couplingsInGoodCondition', 'couplingsGood', 'Couplings In Good Condition']),
    couplingSlip: text(source, ['couplingSlip', 'Coupling Slip']),
    result: text(source, ['scbaTestResult', 'testResult', 'result', 'status', 'Hydrostatic Test Result']),
    station: text(source, ['locatedAtWhichStation', 'station', 'location', 'Located at which Station']),
    raw: source
  };
}

function isCylinderInventoryRecord(row) {
  const searchable = [row.assetDescription, row.assetTag, row.assetClass, row.category, row.subcategory].join(' ');
  return /scba/i.test(searchable);
}

function isCylinderTestingRecord(row) {
  const searchable = [row.maintenanceForm, row.assetTag, row.result, JSON.stringify(row.raw)].join(' ');
  return /scba/i.test(searchable) || Boolean(row.assetTag && (row.testDate || row.testPressure || row.result));
}

function inventoryQuality(rows) {
  return {
    blankAssetTags: rows.filter(row => !row.assetTag).length,
    blankManufacturers: rows.filter(row => !row.manufacturer).length,
    blankInServiceDates: rows.filter(row => !row.inServiceDate).length,
    blankPlannedDecommissionDates: rows.filter(row => !row.plannedDecommissionDate).length,
    duplicateAssetTags: duplicateValues(rows.map(row => tagKey(row.assetTag)).filter(Boolean))
  };
}

function testingQuality(rows) {
  return {
    blankAssetTags: rows.filter(row => !row.assetTag).length,
    blankTestDates: rows.filter(row => !row.testDate).length,
    blankResults: rows.filter(row => !row.result).length,
    leakExceptions: rows.filter(row => yes(row.leaksPresent)).length,
    couplingSlipExceptions: rows.filter(row => yes(row.couplingSlip)).length,
    couplingConditionExceptions: rows.filter(row => row.couplingsGood && !yes(row.couplingsGood)).length,
    nonPassingResults: rows.filter(row => row.result && !/pass/i.test(row.result)).length
  };
}

function looksLikeInventory(fields, rows) {
  const textValue = `${fields.join(' ')} ${JSON.stringify(rows)}`;
  return /assetTag|assetDescription|inService|decommission|manufacturer/i.test(textValue);
}

function looksLikeTesting(fields, rows) {
  const textValue = `${fields.join(' ')} ${JSON.stringify(rows)}`;
  return /scba.*test|testPressure|coupling|leak|maintenanceForm|dateOfCylinderTest/i.test(textValue);
}

function pathMatchesGroup(path, group) {
  const value = String(path || '').toLowerCase();
  if (group === 'inventory') return /item|asset|equipment|inventory/.test(value);
  if (group === 'maintenance') return /maintenance|service|repair|history|schedule/.test(value);
  if (group === 'forms') return /form|answer|questionnaire|inspection/.test(value);
  if (group === 'lookups') return /class|status|manufacturer|location|room|unit|truck/.test(value);
  return true;
}

function classifyProbeResult(result) {
  const haystack = `${result.path} ${(result.detectedFields || []).join(' ')} ${JSON.stringify(result.sampleRows || [])}`;
  return {
    inventoryLikely: /itemName|itemNumber|assetDescription|assetClassId|inServiceDate|decommission|serviceStatusFK|manufacturerId/i.test(haystack),
    maintenanceLikely: /maintenanceId|maintenanceTypeId|entryDate|workOrderNumber|formAnswerId|maintenanceStatusId|nextDate/i.test(haystack),
    formAnswerLikely: /formAnswer|questionId|optionId|otherText|answerOnInspection|formState/i.test(haystack),
    scbaSpecificEvidence: /scba|coupling|leak|testPressure|scbaSection/i.test(haystack)
  };
}

function probeRelevanceScore(result) {
  const classification = classifyProbeResult(result);
  const haystack = `${result.path} ${(result.detectedFields || []).join(' ')} ${JSON.stringify(result.sampleRows || [])}`.toLowerCase();
  let score = 0;
  if (classification.scbaSpecificEvidence) score += 100;
  if (classification.inventoryLikely) score += 35;
  if (classification.maintenanceLikely) score += 35;
  if (classification.formAnswerLikely) score += 25;
  if (haystack.includes('assetclassid')) score += 10;
  if (haystack.includes('itemid')) score += 8;
  if (haystack.includes('formanswerid')) score += 10;
  if (result.overallCount !== null && result.overallCount > 0) score += 5;
  return score;
}

function authorized(request, env) {
  if (!env.SYNC_ADMIN_TOKEN) return false;
  const header = request.headers.get('Authorization') || '';
  return header === `Bearer ${env.SYNC_ADMIN_TOKEN}`;
}

function validatedApiPath(value) {
  const path = String(value || '').trim();
  if (!path) throw new Error('Provide an OperativeIQ resource path or configure the related path variable.');
  if (!path.startsWith('/api/')) throw new Error('The OperativeIQ resource path must begin with /api/.');
  if (path.includes('://') || path.includes('\\')) throw new Error('The OperativeIQ resource path is invalid.');
  return path;
}

function arrayPayload(payload) {
  if (Array.isArray(payload)) return payload;
  for (const key of ['value', 'data', 'results', 'items']) if (Array.isArray(payload?.[key])) return payload[key];
  throw new Error('OperativeIQ response did not contain a recognized record array.');
}

function operationText(pathItem) {
  return Object.values(pathItem || {}).map(operation => `${operation?.summary || ''} ${operation?.description || ''} ${operation?.operationId || ''}`).join(' ');
}

function scoreDiscovery(value) {
  const textValue = String(value).toLowerCase();
  let score = 0;
  if (textValue.includes('scba')) score += 100;
  if (textValue.includes('maintenance')) score += 30;
  if (textValue.includes('test')) score += 25;
  if (textValue.includes('asset')) score += 20;
  if (textValue.includes('inspection')) score += 15;
  if (textValue.includes('history')) score += 10;
  return score;
}

function uniqueFields(rows) {
  return [...new Set(rows.flatMap(row => Object.keys(row || {})))].sort();
}

function first(source, names) {
  for (const name of names) if (source?.[name] !== undefined && source[name] !== null) return source[name];
  return null;
}

function text(source, names) {
  const value = first(source, names);
  return value === null ? '' : String(value).trim();
}

function dateText(source, names) {
  const value = first(source, names);
  if (value === null || value === '') return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value).trim() : date.toISOString().slice(0, 10);
}

function tagKey(value) {
  return String(value || '').trim().toUpperCase().replace(/\s+/g, ' ');
}

function duplicateValues(values) {
  const counts = new Map();
  for (const value of values) counts.set(value, (counts.get(value) || 0) + 1);
  return [...counts.entries()].filter(([, count]) => count > 1).map(([value, count]) => ({ value, count }));
}

function yes(value) {
  return /^(yes|y|true|1)$/i.test(String(value || '').trim());
}

function unique(values) {
  return [...new Set(values)];
}

function boundedNumber(value, min, max, fallback) {
  if (value === null || value === undefined || String(value).trim() === '') return fallback;
  const number = Number(value);
  return Number.isFinite(number) ? Math.min(max, Math.max(min, Math.floor(number))) : fallback;
}

function numberOrNull(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function safeApiError(textValue) {
  try {
    const payload = JSON.parse(textValue);
    return payload.error_description || payload.error || payload.message || 'API request failed.';
  } catch {
    return String(textValue || '').slice(0, 500);
  }
}

function errorMessage(error) {
  return error instanceof Error ? error.message : String(error);
}

function json(data, status = 200, extraHeaders = {}) {
  return Response.json(data, {
    status,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
      'Access-Control-Allow-Origin': '*',
      ...extraHeaders
    }
  });
}
