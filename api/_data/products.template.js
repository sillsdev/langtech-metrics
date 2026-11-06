// Template for a single quarter's product input file, consumed by
// scripts/push-products.mjs. Copy this to a local, gitignored path (e.g.
// input/products/<quarter>.js) and fill in real values from that quarter's
// export of the "LangTech Analytics Dashboard" Google Sheet (Product List tab
// for metadata, that quarter's tab for metrics), then run:
//   node scripts/push-products.mjs input/products/<quarter>.js
//
// Every product listed here is upserted into products_catalog as a whole record
// -- include a product's full metadata even if only its metrics changed this
// quarter. A product NOT listed this quarter is left untouched in the catalog.
// This only touches products_catalog and the one products_quarter_<quarter>
// record for the quarter named below -- other quarters are never re-pushed.
//
// Don't add a "suite" field here (e.g. grouping Bloom Editor/Library/Reader
// together) -- that's hand-maintained separately by
// scripts/set-product-suites.mjs, independent of the quarterly spreadsheet,
// and this push would wipe it since it isn't part of this object.
//
// Likewise, don't add a "discontinuedAsOf" field here -- that's hand-maintained
// by scripts/set-discontinued-products.mjs, for a product that's stopped
// reporting for good and should disappear from the dashboard from a given
// quarter onward while keeping its earlier quarters' history intact. Simply
// leaving a product out of this file's `products` list only stops this one
// quarter's metrics from updating -- it still shows up every quarter as a
// permanent "no data" row until discontinuedAsOf is set.

export default {
  quarter: "FY99Q9",
  generatedAt: "2026-01-01T00:00:00.000Z",
  products: [
    {
      name: "Example Product",
      category: "Literacy",
      platforms: ["Windows"],
      devStatus: "Active - Mixed Funding",
      metricsMode: "Opt Out",
      productUrl: "https://example.com",
      openSource: true,
      metrics: {
        downloads: null,
        installs: 0,
        active_projects: 0,
        active_users: 0,
        countries: 0,
        languages_impacted: 0,
        // Optional, from the quarter sheet's Notes/Comments column -- a short
        // explanation of something notable about this product's numbers THIS quarter
        // (e.g. a methodology change or a real usage trend), shown on the dashboard's
        // "What changed" section. Lives inside `metrics` (not top-level product
        // metadata) specifically so it's scoped to this one quarter's record, not
        // merged into the long-lived catalog entry. Omit/null when there's nothing to say.
        notes: null,
        // True when none of the metrics above were reported for this product this
        // quarter (set automatically by the converter) -- lets the dashboard show a
        // "stats not in yet" label instead of a row of zeroes.
        pending: false,
      },
    },
  ],
};
