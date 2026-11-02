import { get } from "@vercel/global-config";
import { withCors } from "./_lib/cors.js";

export const config = { runtime: "edge" };

const CACHE_TTL_SECONDS = 900;
const CATALOG_KEY = "apps_catalog";
const monthKey = (month) => `apps_month_${month}`;

// Mirrors products.js/fonts.js's catalog + per-period split: scripts/push-app-stats.mjs
// writes "apps_catalog" (known months + the Scripture install trend) plus one
// "apps_month_<YYYY-MM>" record per month. Underscores and dashes only, because
// Global Config keys only allow [A-Za-z0-9_-].
export default async function handler(request) {
  if (request.method !== "GET") {
    return withCors(request, new Response("Method not allowed", { status: 405 }));
  }

  const requestedMonth = new URL(request.url).searchParams.get("month");
  const catalog = await get(CATALOG_KEY);
  if (!catalog) {
    return withCors(request, Response.json({ error: "No app usage data available yet" }, { status: 503 }));
  }

  const month = catalog.months.includes(requestedMonth) ? requestedMonth : catalog.months[catalog.months.length - 1];
  const monthDoc = await get(monthKey(month));

  return withCors(
    request,
    Response.json(shapeResponse(catalog, month, monthDoc), {
      headers: { "Cache-Control": `public, max-age=${CACHE_TTL_SECONDS}` },
    }),
  );
}

function shapeResponse(catalog, month, monthDoc) {
  return {
    generatedAt: monthDoc?.generatedAt ?? catalog.generatedAt,
    month,
    months: catalog.months,
    trend: catalog.trend,
    totals: monthDoc?.totals ?? null,
    types: monthDoc?.types ?? [],
    ios: monthDoc?.ios ?? null,
    offline: monthDoc?.offline ?? null,
  };
}
