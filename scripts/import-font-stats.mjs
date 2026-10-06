// Quarterly ingestion for the Font Usage data served by api/fonts.js.
//
// Usage:
//   node scripts/import-font-stats.mjs "<path to the new font_statistics_*.csv>"
//   (requires `vercel login` -- see scripts/lib/global-config.mjs)
//
// What it does:
//   1. Copies the source CSV into input/fonts/ (gitignored raw-source archive)
//      if it isn't already there.
//   2. Parses it (columns: Date, Font, Weekly Views, Lifetime Views). The
//      source export is weekly, but we only keep one snapshot per calendar
//      month -- the latest date we have stats for in that month, across both
//      the dates already in the store and any new dates this CSV adds.
//   3. Reads the current fonts_catalog from Global Config, merges in any new
//      font names found in this CSV, pushes the updated catalog plus one
//      fonts_date_<date> record per kept date this CSV has data for, and
//      deletes any previously-stored date record that's no longer kept
//      (e.g. an earlier weekly date now superseded by that month's latest).
//
// Safe to re-run for the same date (overwrites that date's record rather than
// duplicating it).

import { copyFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { basename, join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { getItem, upsertItems, deleteItems } from "./lib/global-config.mjs";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const inputDir = join(repoRoot, "input", "fonts");

const srcPath = process.argv[2];
if (!srcPath) {
  console.error("Usage: node scripts/import-font-stats.mjs <path to CSV>");
  process.exit(1);
}

mkdirSync(inputDir, { recursive: true });
const archivedPath = join(inputDir, basename(srcPath));
if (!existsSync(archivedPath) || archivedPath !== srcPath) {
  copyFileSync(srcPath, archivedPath);
}

const csv = readFileSync(srcPath, "utf8").trim();
const [headerLine, ...rows] = csv.split(/\r?\n/);
const header = headerLine.split(",").map((h) => h.trim());
const col = (name) => header.indexOf(name);
const dateCol = col("Date");
const fontCol = col("Font");
const weeklyCol = col("Weekly Views");
const lifetimeCol = col("Lifetime Views");
if ([dateCol, fontCol, weeklyCol, lifetimeCol].includes(-1)) {
  console.error(`Unexpected header: ${headerLine}`);
  process.exit(1);
}

const parsedByDate = new Map();
for (const line of rows) {
  if (!line.trim()) continue;
  const cells = line.split(",");
  const date = cells[dateCol].trim();
  const name = cells[fontCol].trim();
  const weeklyViews = Number(cells[weeklyCol]);
  const lifetimeViews = Number(cells[lifetimeCol]);
  if (!parsedByDate.has(date)) parsedByDate.set(date, new Map());
  parsedByDate.get(date).set(name, { weeklyViews, lifetimeViews });
}

const catalog = (await getItem("fonts_catalog")) ?? { dates: [], fonts: [] };
const fontNames = new Set(catalog.fonts.map((f) => f.name));
let fontsAdded = 0;

for (const byFont of parsedByDate.values()) {
  for (const name of byFont.keys()) {
    if (!fontNames.has(name)) {
      fontNames.add(name);
      fontsAdded++;
    }
  }
}

// One snapshot per calendar month -- the latest date we have stats for in
// that month -- across both the dates already in the store and any new
// dates this CSV adds.
const monthOf = (date) => date.slice(0, 7);
const latestByMonth = new Map();
for (const date of new Set([...catalog.dates, ...parsedByDate.keys()])) {
  const month = monthOf(date);
  if (!latestByMonth.has(month) || date > latestByMonth.get(month)) {
    latestByMonth.set(month, date);
  }
}
const keepDates = [...latestByMonth.values()].sort();
const dropDates = catalog.dates.filter((date) => !keepDates.includes(date));

const generatedAt = new Date().toISOString();
const fonts = [...fontNames].sort().map((name) => ({ name }));

const items = { fonts_catalog: { generatedAt, dates: keepDates, fonts } };
const pushedDates = [];
for (const date of keepDates) {
  if (!parsedByDate.has(date)) continue; // kept from an earlier run, no new data this time
  const metrics = {};
  for (const [name, values] of parsedByDate.get(date)) {
    metrics[name] = values;
  }
  items[`fonts_date_${date}`] = { generatedAt, metrics };
  pushedDates.push(date);
}
await upsertItems(items);
if (dropDates.length > 0) await deleteItems(dropDates.map((date) => `fonts_date_${date}`));

console.log(`Pushed fonts_catalog + ${pushedDates.length} date record(s) to Global Config.`);
console.log(`Dates kept (one per month): ${keepDates.join(", ")}`);
if (dropDates.length > 0) {
  console.log(`Removed ${dropDates.length} superseded date record(s): ${dropDates.join(", ")}`);
}
console.log(`Fonts: ${fonts.length} total (${fontsAdded} new this run)`);
