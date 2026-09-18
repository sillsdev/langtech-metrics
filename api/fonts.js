import { staticFontData } from "./_data/staticFontData.js";
import { withCors } from "./_lib/cors.js";

export const config = { runtime: "edge" };

// No live data source is wired up yet -- the only thing that ever updates font
// usage data is scripts/import-font-stats.mjs, run manually each quarter -- so
// this always serves the snapshot it writes to _data/staticFontData.js.
export default async function handler(request) {
  if (request.method !== "GET") {
    return withCors(request, new Response("Method not allowed", { status: 405 }));
  }
  const requestedDate = new URL(request.url).searchParams.get("date");
  return withCors(request, Response.json(sliceStatic(requestedDate)));
}

function sliceStatic(requestedDate) {
  const { dates } = staticFontData;
  const date = dates.includes(requestedDate) ? requestedDate : dates[dates.length - 1];
  return {
    generatedAt: staticFontData.generatedAt,
    static: true,
    date,
    dates,
    fonts: staticFontData.fonts.map(({ snapshots, ...rest }) => ({
      ...rest,
      metrics: snapshots[date] ?? {},
    })),
  };
}
