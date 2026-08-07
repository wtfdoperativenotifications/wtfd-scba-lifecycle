const AUTH_URL = 'https://auth.operativeiqfrontline.com/FrontlineV_live/token';
const RESOURCE_ROOT = 'https://client.operativeiqfrontline.com/FrontlineV_live';
const PAGE_SIZE = 200;
const MAX_RECORDS = 20000;

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
        mode: 'LIVE_SCBA_LIFECYCLE_DASHBOARD_V13',
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
  const manufacturerById = lookupNameMap(manufacturers.rows, ['manufacturerName', 'name', 'companyName']);
  const statusById = lookupNameMap(statuses.rows, ['name', 'statusName', 'description']);

  const rows = context.items
    .filter(item => String(item.assetClassId ?? '') === String(context.assetClassId))
    .map(item => normalizeLiveItem(item, context.assetClassName, manufacturerById, statusById));

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
      serviceStatuses: statuses.path
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

  const [manufacturers, statuses, fixedAssets] = await Promise.all([
    loadOptionalLookup(token, ['/api/manufacturers', '/api/manufacturer']),
    loadOptionalLookup(token, ['/api/asset-service-statuses', '/api/asset-service-status']),
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
      serviceStatuses: statuses.path
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
  const cacheKey = new Request(`${url.origin}/api/dashboard/scba-v13-ac41-f37-t32`, { method: 'GET' });
  const cached = await cache.match(cacheKey);
  if (cached) return cached;

  const payload = await buildDashboardPayload(env, url);
  const response = json(payload, 200, {
    'Cache-Control': 'public, max-age=300, s-maxage=900',
    'Access-Control-Allow-Origin': '*'
  });
  const cacheCopy = response.clone();
  await cache.put(cacheKey, cacheCopy);
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

  const [manufacturers, statuses, fixedAssets] = await Promise.all([
    loadOptionalLookup(token, ['/api/manufacturers', '/api/manufacturer']),
    loadOptionalLookup(token, ['/api/asset-service-statuses', '/api/asset-service-status']),
    fetchAll('/api/fixed-assets', token, MAX_RECORDS)
  ]);

  const manufacturerById = lookupNameMap(manufacturers.rows, ['manufacturerName', 'name', 'companyName']);
  const statusById = lookupNameMap(statuses.rows, ['name', 'statusName', 'description']);
  const inventoryRows = scbaItems.map(item =>
    normalizeLiveItem(item, context.assetClassName, manufacturerById, statusById)
  );

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
      plannedDecommissionDate: item.decommissionDate,
      decommissionDate: item.decommissionDate,
      estimatedReplacementCost: item.estimatedReplacementCost,
      serviceStatus: item.serviceStatus,
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
    mode: 'LIVE_SCBA_LIFECYCLE_DASHBOARD_V13',
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
      estimatedActiveReplacementValue: Math.round(currentCost * 100) / 100
    },
    dataQuality: {
      missingManufacturer: activeAssets.filter(row => !row.manufacturer).length,
      missingInServiceDate: activeAssets.filter(row => !row.inServiceDate).length,
      missingNextMaintenanceDate: activeAssets.filter(row => !row.nextMaintenanceDate).length,
      missingCylinderType: activeAssets.filter(row => !row.cylinderType).length,
      missingPlannedDecommissionDate: activeAssets.filter(row => !row.plannedDecommissionDate).length
    },
    datasetIntegrity: {
      expectedAssetClassId: 41,
      actualAssetClassId: context.assetClassId,
      assetClassName: context.assetClassName,
      hydroFormId: 37,
      hydroMaintenanceType: 32,
      uniqueCylinderCount: new Set(assets.map(row => String(row.itemId))).size,
      duplicateCylinderIds: assets.length - new Set(assets.map(row => String(row.itemId))).size,
      passed: Number(context.assetClassId) === 41 && assets.length === new Set(assets.map(row => String(row.itemId))).size
    },
    limitations: [
      'Detailed hydrostatic form answers are not yet resolved from formAnswerUniqueId.',
      'Planned decommission dates use OperativeIQ decommissionOrOutOfServiceDate when populated; otherwise the dashboard shows a clearly labeled 15-year estimate.',
      'Replacement costs use the current item price stored in OperativeIQ when available and are planning estimates only.'
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

function normalizeLiveItem(source, assetClassName, manufacturerById, statusById) {
  const itemId = first(source, ['id']);
  const itemName = text(source, ['itemName']);
  const itemNumber = text(source, ['itemNumber']);
  const partUpc = text(source, ['partUpc']);
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
    const id = first(row, ['id', 'manufacturerId', 'statusId']);
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
    return Object.keys(specification.paths || {}).filter(path => /scba|maintenance|asset|equipment|inspection|test|service/i.test(path));
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
