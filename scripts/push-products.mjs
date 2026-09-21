// Pushes the hand-maintained product snapshot (api/_data/staticData.js) to the
// Global Config store api/products.js reads from.
//
// Usage:
//   node scripts/push-products.mjs
//
// Run this after hand-editing api/_data/staticData.js (see that file's header for
// how to refresh it from a new sheet export). Splits it the same way the read path
// expects: one "products_catalog" record (metadata only) plus one
// "products_quarter_<period>" record per quarter (metrics keyed by product name).

import { staticProducts } from "../api/_data/staticData.js";
import { upsertItems } from "./lib/global-config.mjs";

const catalog = {
  generatedAt: staticProducts.generatedAt,
  quarters: staticProducts.quarters,
  categories: staticProducts.categories,
  platforms: staticProducts.platforms,
  devStatuses: staticProducts.devStatuses,
  products: staticProducts.products.map(({ quarters, ...meta }) => meta),
};

const items = { products_catalog: catalog };
for (const quarter of staticProducts.quarters) {
  const metrics = {};
  for (const product of staticProducts.products) {
    if (product.quarters[quarter]) metrics[product.name] = product.quarters[quarter];
  }
  items[`products_quarter_${quarter}`] = { generatedAt: staticProducts.generatedAt, metrics };
}

await upsertItems(items);

console.log(`Pushed products_catalog + ${staticProducts.quarters.length} quarter record(s) to Global Config.`);
console.log(`Quarters: ${staticProducts.quarters.join(", ")}`);
