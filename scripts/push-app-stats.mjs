// Pushes one month's App Usage data (from scripts/convert-app-catalogue.py's
// output) to the Global Config store api/apps.js reads from.
//
// Usage:
//   node scripts/push-app-stats.mjs <path to a month input file, e.g. input/apps/2026-10.js>
//   (requires `vercel login` -- see scripts/lib/global-config.mjs)
//
// Mirrors products_catalog/products_quarter_* and fonts_catalog/fonts_date_*:
// one "apps_catalog" record (months known + the merged Scripture trend series)
// plus one "apps_month_<YYYY-MM>" record per month. The trend series is merged
// across runs -- keeping only the latest point per calendar month, same as
// import-font-stats.mjs's date handling -- so pushing a later month's export
// (which repeats the whole Trends history) doesn't duplicate or regress
// earlier months already in the store.

import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { getItem, upsertItems } from "./lib/global-config.mjs";

const inputPath = process.argv[2];
if (!inputPath) {
  console.error("Usage: node scripts/push-app-stats.mjs <path to a month input file>");
  console.error("See scripts/convert-app-catalogue.py for how to produce one.");
  process.exit(1);
}

const { default: input } = await import(pathToFileURL(resolve(inputPath)).href);
const { month, generatedAt, totals, types, ios, offline, trend } = input;

const catalog = (await getItem("apps_catalog")) ?? { generatedAt, months: [], trend: [] };

if (!catalog.months.includes(month)) catalog.months.push(month);
catalog.months.sort();

// One point per calendar month -- the latest date in that month -- across both
// the points already in the store and any this import adds.
const monthOf = (date) => date.slice(0, 7);
const latestByMonth = new Map();
for (const point of [...catalog.trend, ...trend]) {
  const key = monthOf(point.date);
  if (!latestByMonth.has(key) || point.date > latestByMonth.get(key).date) {
    latestByMonth.set(key, point);
  }
}
catalog.trend = [...latestByMonth.values()].sort((a, b) => a.date.localeCompare(b.date));
catalog.generatedAt = generatedAt;

await upsertItems({
  apps_catalog: catalog,
  [`apps_month_${month}`]: { generatedAt, totals, types, ios, offline },
});

console.log(`Pushed apps_catalog (${catalog.months.length} month(s), ${catalog.trend.length} trend point(s)) + apps_month_${month} to Global Config.`);
