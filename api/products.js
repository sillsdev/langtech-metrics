import { get } from "@vercel/global-config";
import { withCors } from "./_lib/cors.js";

export const config = { runtime: "edge" };

const CACHE_TTL_SECONDS = 900;
const CATALOG_KEY = "products_catalog";
const quarterKey = (period) => `products_quarter_${period}`;

// Mirrors the catalog + one-record-per-quarter split the previous Cloudflare KV
// design used: scripts/push-products.mjs writes "products_catalog" (metadata) plus
// one "products_quarter_<period>" record per quarter, so a request only ever needs
// two reads: the catalog, and whichever single quarter was asked for via
// ?quarter= (defaulting to the latest). Underscores, not colons, because Global
// Config keys only allow [A-Za-z0-9_-].
export default async function handler(request) {
  if (request.method !== "GET") {
    return withCors(request, new Response("Method not allowed", { status: 405 }));
  }

  const requestedQuarter = new URL(request.url).searchParams.get("quarter");
  const catalog = await get(CATALOG_KEY);
  if (!catalog) {
    return withCors(request, Response.json({ error: "No product data available yet" }, { status: 503 }));
  }

  const quarter = catalog.quarters.includes(requestedQuarter)
    ? requestedQuarter
    : catalog.quarters[catalog.quarters.length - 1];
  const quarterDoc = await get(quarterKey(quarter));

  return withCors(
    request,
    Response.json(shapeResponse(catalog, quarter, quarterDoc), {
      headers: { "Cache-Control": `public, max-age=${CACHE_TTL_SECONDS}` },
    }),
  );
}

// Mirrors convert-dashboard-export.py's `pending` definition, for quarters pushed
// before push-products.mjs started computing `complete` itself.
const CORE_METRIC_KEYS = ["downloads", "installs", "active_projects", "active_users", "countries", "languages_impacted"];
function isPending(productMetrics) {
  if (!productMetrics) return true;
  if (typeof productMetrics.pending === "boolean") return productMetrics.pending;
  return CORE_METRIC_KEYS.every((key) => productMetrics[key] == null);
}

// A product discontinued as of some quarter (see scripts/set-discontinued-products.mjs)
// stays in catalog.products -- its metadata and earlier metrics are still real history
// -- but shouldn't appear from that quarter onward. Quarter order comes from
// catalog.quarters' push order (same assumption `quarters[quarters.length - 1]` above
// already makes for "latest").
function isVisibleInQuarter(product, catalog, quarterIndex) {
  if (!product.discontinuedAsOf) return true;
  const discontinuedIndex = catalog.quarters.indexOf(product.discontinuedAsOf);
  return discontinuedIndex === -1 || quarterIndex < discontinuedIndex;
}

function shapeResponse(catalog, quarter, quarterDoc) {
  const metricsByName = quarterDoc?.metrics ?? {};
  const quarterIndex = catalog.quarters.indexOf(quarter);
  const visibleProducts = catalog.products.filter((p) => isVisibleInQuarter(p, catalog, quarterIndex));
  const complete = quarterDoc?.complete ?? visibleProducts.every((p) => !isPending(metricsByName[p.name]));
  return {
    generatedAt: quarterDoc?.generatedAt ?? catalog.generatedAt,
    quarter,
    complete,
    quarters: catalog.quarters,
    categories: catalog.categories,
    platforms: catalog.platforms,
    devStatuses: catalog.devStatuses,
    products: visibleProducts.map((p) => ({ ...p, metrics: metricsByName[p.name] ?? {} })),
  };
}
