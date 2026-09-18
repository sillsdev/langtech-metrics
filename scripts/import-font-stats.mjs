// Quarterly ingestion for the Font Usage data served by api/fonts.js.
//
// Usage:
//   node scripts/import-font-stats.mjs "<path to the new font_statistics_*.csv>"
//
// What it does:
//   1. Copies the source CSV into input/fonts/ (gitignored raw-source archive,
//      mirrors input/*.xlsx for the product snapshot) if it isn't already there.
//   2. Parses it (columns: Date, Font, Weekly Views, Lifetime Views).
//   3. Upserts each date's snapshot into api/_data/staticFontData.js, keyed by
//      date, and rewrites that file sorted by date ascending.
//
// Safe to re-run for the same date (overwrites that date's snapshot rather
// than duplicating it).

import { readFileSync, writeFileSync, copyFileSync, existsSync, mkdirSync } from "node:fs";
import { basename, join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const inputDir = join(repoRoot, "input", "fonts");
const dataFile = join(repoRoot, "api", "_data", "staticFontData.js");

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

let existing = { dates: [], fonts: [] };
if (existsSync(dataFile)) {
  const mod = await import(`${dataFile.replace(/\\/g, "/")}?t=${Date.now()}`);
  existing = mod.staticFontData;
}

const fontsByName = new Map(existing.fonts.map((f) => [f.name, { ...f, snapshots: { ...f.snapshots } }]));
const dateSet = new Set(existing.dates);
let fontsAdded = 0;

for (const [date, byFont] of parsedByDate) {
  dateSet.add(date);
  for (const [name, values] of byFont) {
    if (!fontsByName.has(name)) {
      fontsByName.set(name, { name, snapshots: {} });
      fontsAdded++;
    }
    fontsByName.get(name).snapshots[date] = values;
  }
}

const dates = [...dateSet].sort();
const fonts = [...fontsByName.values()].sort((a, b) => a.name.localeCompare(b.name));

const output = `// Static snapshot for the Font Usage data served by api/fonts.js, built from
// quarterly CSV exports of a fonts analytics dashboard (see input/fonts/ for the raw
// exports this was generated from, gitignored). This is the sole data source
// api/fonts.js serves.
//
// To refresh each quarter: node scripts/import-font-stats.mjs "<new CSV path>"

export const staticFontData = ${JSON.stringify({ generatedAt: new Date().toISOString(), static: true, dates, fonts }, null, 2)};
`;

writeFileSync(dataFile, output);

console.log(`Wrote ${dataFile}`);
console.log(`Dates: ${dates.join(", ")}`);
console.log(`Fonts: ${fonts.length} total (${fontsAdded} new this run)`);
