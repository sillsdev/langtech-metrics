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
      },
    },
  ],
};
