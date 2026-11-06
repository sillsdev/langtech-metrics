// Hand-maintained list of products that have stopped reporting metrics (e.g. the
// source has stopped providing data for them) and should disappear from the
// dashboard's product list from a given quarter onward -- while still showing
// correctly for whichever earlier quarters they did report in.
//
// Deliberately independent of the quarterly product push: push-products.mjs only
// ever adds or updates a product's entry in products_catalog (the list every
// quarter's view is built from, see api/products.js) and never removes one, so a
// product dropped from one quarter's spreadsheet still sits in the catalog and
// shows up as a permanent "no data" row for that quarter and every later one --
// not what's wanted when a product has actually stopped reporting for good,
// rather than just being slow to report this one quarter. Setting
// `discontinuedAsOf` here instead makes api/products.js hide it starting at that
// quarter, without touching the historical metrics already stored for earlier
// quarters.
//
// Usage:
//   node scripts/set-discontinued-products.mjs
//   (requires `vercel login` -- see scripts/lib/global-config.mjs)

import { getItem, upsertItems } from "./lib/global-config.mjs";

// Quarter here is the first one the product should NO LONGER appear in -- it
// still shows normally, with its real historical metrics, for every quarter
// before that.
const DISCONTINUED = {
  "Paratext 9": "FY26Q4",
};

const catalog = await getItem("products_catalog");
if (!catalog) {
  console.error("No products_catalog in Global Config yet -- push at least one quarter first.");
  process.exit(1);
}

const unmatched = new Set(Object.keys(DISCONTINUED));
let changed = 0;
catalog.products = catalog.products.map((p) => {
  unmatched.delete(p.name);
  const discontinuedAsOf = DISCONTINUED[p.name];
  if (discontinuedAsOf === p.discontinuedAsOf) return p;
  changed++;
  if (discontinuedAsOf) return { ...p, discontinuedAsOf };
  const { discontinuedAsOf: _drop, ...rest } = p; // reinstated -- remove the field
  return rest;
});

await upsertItems({ products_catalog: catalog });

console.log(`Updated ${changed} product(s)' discontinued status in products_catalog.`);
if (unmatched.size > 0) {
  console.log(`Note: ${unmatched.size} discontinued product(s) not found in the catalog (name mismatch?): ${[...unmatched].join(", ")}`);
}
