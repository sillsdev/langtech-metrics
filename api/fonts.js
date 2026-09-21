import { get } from "@vercel/global-config";
import { withCors } from "./_lib/cors.js";

export const config = { runtime: "edge" };

const CACHE_TTL_SECONDS = 300;
const CATALOG_KEY = "fonts:catalog";
const dateKey = (date) => `fonts:date:${date}`;

// Mirrors products.js's catalog + per-period split: scripts/import-font-stats.mjs
// writes "fonts:catalog" (font names + every date ever imported) plus one
// "fonts:date:<date>" record per import date.
export default async function handler(request) {
  if (request.method !== "GET") {
    return withCors(request, new Response("Method not allowed", { status: 405 }));
  }

  const requestedDate = new URL(request.url).searchParams.get("date");
  const catalog = await get(CATALOG_KEY);
  if (!catalog) {
    return withCors(request, Response.json({ error: "No font usage data available yet" }, { status: 503 }));
  }

  const date = catalog.dates.includes(requestedDate) ? requestedDate : catalog.dates[catalog.dates.length - 1];
  const dateDoc = await get(dateKey(date));

  return withCors(
    request,
    Response.json(shapeResponse(catalog, date, dateDoc), {
      headers: { "Cache-Control": `public, max-age=${CACHE_TTL_SECONDS}` },
    }),
  );
}

function shapeResponse(catalog, date, dateDoc) {
  const metricsByName = dateDoc?.metrics ?? {};
  return {
    generatedAt: dateDoc?.generatedAt ?? catalog.generatedAt,
    date,
    dates: catalog.dates,
    fonts: catalog.fonts.map((f) => ({ ...f, metrics: metricsByName[f.name] ?? {} })),
  };
}
