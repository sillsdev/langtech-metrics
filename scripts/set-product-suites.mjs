// Hand-maintained mapping of product name -> suite, for the dashboard's
// suite-grouping feature (collapsing a product family's rows -- e.g. Bloom
// Editor/Library/Reader/BloomPUB Viewer -- into one expandable group).
//
// Deliberately independent of the quarterly product push: push-products.mjs
// replaces each listed product's catalog metadata wholesale from that
// quarter's spreadsheet export (see api/_data/products.template.js), which
// has no "suite" column, so a quarterly push would silently wipe this field
// if it were part of that metadata. Instead this is its own small patch
// script -- re-run it any time SUITES below changes, including after a
// quarterly push that touched a grouped product.
//
// Usage:
//   node scripts/set-product-suites.mjs
//   (requires `vercel login` -- see scripts/lib/global-config.mjs)

import { getItem, upsertItems } from "./lib/global-config.mjs";

const SUITES = {
  Bloom: ["Bloom Editor", "Bloom Library", "Bloom Reader", "BloomPUB Viewer"],
  Keyman: ["Keyman Developer", "Keyman", "Keyman Web"],
  HearThis: ["HearThis", "HearThis for Android"],
  FieldWorks: ["FieldWorks", "FieldWorks Lite"],
};

const suiteByProduct = new Map();
for (const [suite, names] of Object.entries(SUITES)) {
  for (const name of names) suiteByProduct.set(name, suite);
}

const catalog = await getItem("products_catalog");
if (!catalog) {
  console.error("No products_catalog in Global Config yet -- push at least one quarter first.");
  process.exit(1);
}

const unmatched = new Set(suiteByProduct.keys());
let changed = 0;
catalog.products = catalog.products.map((p) => {
  const suite = suiteByProduct.get(p.name);
  unmatched.delete(p.name);
  if (suite === p.suite) return p;
  changed++;
  if (suite) return { ...p, suite };
  const { suite: _drop, ...rest } = p; // no longer in a suite -- remove the field
  return rest;
});

await upsertItems({ products_catalog: catalog });

console.log(`Updated ${changed} product(s)' suite grouping in products_catalog.`);
if (unmatched.size > 0) {
  console.log(`Note: ${unmatched.size} suite member(s) not found in the catalog (name mismatch?): ${[...unmatched].join(", ")}`);
}
