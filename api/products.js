import { get } from "@vercel/global-config";
import { withCors } from "./_lib/cors.js";

export const config = { runtime: "edge" };

const CACHE_TTL_SECONDS = 300;
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

function shapeResponse(catalog, quarter, quarterDoc) {
  const metricsByName = quarterDoc?.metrics ?? {};
  return {
    generatedAt: quarterDoc?.generatedAt ?? catalog.generatedAt,
    quarter,
    quarters: catalog.quarters,
    categories: catalog.categories,
    platforms: catalog.platforms,
    devStatuses: catalog.devStatuses,
    products: catalog.products.map((p) => ({ ...p, metrics: metricsByName[p.name] ?? {} })),
  };
}
