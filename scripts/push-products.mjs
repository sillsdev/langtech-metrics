// Pushes one quarter's product data to the Global Config store api/products.js
// reads from. Doesn't reload other quarters -- see api/_data/products.template.js
// for the input file shape and how to prepare one.
//
// Usage:
//   node scripts/push-products.mjs <path to a quarter input file>
//   (requires `vercel login` -- see scripts/lib/global-config.mjs)

import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { getItem, upsertItems } from "./lib/global-config.mjs";

const inputPath = process.argv[2];
if (!inputPath) {
  console.error("Usage: node scripts/push-products.mjs <path to a quarter input file>");
  console.error("See api/_data/products.template.js for the expected shape.");
  process.exit(1);
}

const { default: input } = await import(pathToFileURL(resolve(inputPath)).href);
const { quarter, generatedAt, products } = input;

const catalog = (await getItem("products_catalog")) ?? {
  generatedAt,
  quarters: [],
  categories: [],
  platforms: [],
  devStatuses: [],
  products: [],
};

if (!catalog.quarters.includes(quarter)) catalog.quarters.push(quarter);

const productsByName = new Map(catalog.products.map((p) => [p.name, p]));
const metrics = {};
for (const { metrics: productMetrics, ...meta } of products) {
  productsByName.set(meta.name, meta);
  metrics[meta.name] = productMetrics;

  if (!catalog.categories.includes(meta.category)) catalog.categories.push(meta.category);
  for (const platform of meta.platforms) {
    if (!catalog.platforms.includes(platform)) catalog.platforms.push(platform);
  }
  if (!catalog.devStatuses.includes(meta.devStatus)) catalog.devStatuses.push(meta.devStatus);
}
catalog.products = [...productsByName.values()];
catalog.generatedAt = generatedAt;

await upsertItems({
  products_catalog: catalog,
  [`products_quarter_${quarter}`]: { generatedAt, metrics },
});

console.log(`Pushed products_catalog + products_quarter_${quarter} (${products.length} product(s)) to Global Config.`);
