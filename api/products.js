import { staticProducts } from "./_data/staticData.js";
import { withCors } from "./_lib/cors.js";

export const config = { runtime: "edge" };

// No live data source is wired up yet (the previous Google Sheets sync worker was
// removed; its replacement, and where it'll write to on Vercel, is still TBD -- see
// README "Populating data"), so this always serves the hand-maintained snapshot in
// _data/staticData.js.
export default async function handler(request) {
  if (request.method !== "GET") {
    return withCors(request, new Response("Method not allowed", { status: 405 }));
  }
  const requestedQuarter = new URL(request.url).searchParams.get("quarter");
  return withCors(request, Response.json(sliceStatic(requestedQuarter)));
}

function sliceStatic(requestedQuarter) {
  const { quarters } = staticProducts;
  const quarter = quarters.includes(requestedQuarter) ? requestedQuarter : quarters[quarters.length - 1];
  return {
    generatedAt: staticProducts.generatedAt,
    static: true,
    quarter,
    quarters,
    categories: staticProducts.categories,
    platforms: staticProducts.platforms,
    devStatuses: staticProducts.devStatuses,
    products: staticProducts.products.map(({ quarters: byQuarter, ...rest }) => ({
      ...rest,
      metrics: byQuarter[quarter] ?? {},
    })),
  };
}
