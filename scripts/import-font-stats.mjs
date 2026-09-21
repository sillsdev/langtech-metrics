// Quarterly ingestion for the Font Usage data served by api/fonts.js.
//
// Usage:
//   node scripts/import-font-stats.mjs "<path to the new font_statistics_*.csv>"
//   (requires `vercel login` -- see scripts/lib/global-config.mjs)
//
// What it does:
//   1. Copies the source CSV into input/fonts/ (gitignored raw-source archive)
//      if it isn't already there.
//   2. Parses it (columns: Date, Font, Weekly Views, Lifetime Views).
//   3. Reads the current fonts_catalog from Global Config, merges in any new
//      font names and dates found in this CSV, and pushes the updated catalog
//      plus one fonts_date_<date> record per *newly parsed* date -- dates
//      already in the store from an earlier run aren't re-pushed.
//
// Safe to re-run for the same date (overwrites that date's record rather than
// duplicating it).

import { copyFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { basename, join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { getItem, upsertItems } from "./lib/global-config.mjs";

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
const dateSet = new Set(catalog.dates);
let fontsAdded = 0;

const newDates = [...parsedByDate.keys()];
for (const [date, byFont] of parsedByDate) {
  dateSet.add(date);
  for (const name of byFont.keys()) {
    if (!fontNames.has(name)) {
      fontNames.add(name);
      fontsAdded++;
    }
  }
}

const generatedAt = new Date().toISOString();
const dates = [...dateSet].sort();
const fonts = [...fontNames].sort().map((name) => ({ name }));

const items = { fonts_catalog: { generatedAt, dates, fonts } };
for (const date of newDates) {
  const metrics = {};
  for (const [name, values] of parsedByDate.get(date)) {
    metrics[name] = values;
  }
  items[`fonts_date_${date}`] = { generatedAt, metrics };
}
await upsertItems(items);

console.log(`Pushed fonts_catalog + ${newDates.length} date record(s) to Global Config.`);
console.log(`Dates this run: ${newDates.join(", ")}`);
console.log(`Fonts: ${fonts.length} total (${fontsAdded} new this run)`);
