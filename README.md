# langtech-metrics

API for LangTech tools usage metrics, consumed by the `/impact` dashboard on
[languagetechnology.org](https://languagetechnology.org) (repo:
`languagetechnology-org-cloudflare-pages`). Deployed on Vercel as
`metrics.languagetechnology.org`, separate from that static site.

## Layout

- **`api/`** — the read API, deployed as Vercel Edge Functions.
  - `products.js`, `fonts.js` — one file per route (`GET /api/products`,
    `GET /api/fonts`), each Vercel's file-based routing turns into its own
    endpoint. Every response gets `Access-Control-Allow-Origin` (echoed from a
    small allow-list — the production site plus its local dev origins).
  - `root.js` — a small self-describing JSON directory (name + endpoint list).
    `vercel.json` rewrites the bare domain root (`/`) to it, so a health check or
    anyone hitting the domain directly gets that instead of a bare 404.
  - `_lib/cors.js` — the shared CORS helper above. Prefixed with `_` so Vercel
    doesn't also turn it into a route (same for `_data/`).
  - `_data/products.template.js` — not real data, just the shape of a single
    quarter's product input file (see "Populating data"). `products.js`/`fonts.js`
    read from Global Config only, with no fallback if it's empty.
- **`scripts/lib/global-config.mjs`** — shared read/write helper (shells out to
  the `vercel global-config` CLI, so it needs `vercel login`) used by the two
  scripts below.
- **`scripts/push-products.mjs`** — pushes one quarter's product data (from a
  file matching `_data/products.template.js`'s shape) to the store.
- **`scripts/import-font-stats.mjs`** — parses a quarterly CSV export and pushes
  it to the store.

## Populating data

Both routes read from a Vercel [Global Config](https://vercel.com/docs/global-config)
store (`langtech_metrics`) via the read-only `@vercel/global-config` SDK — that's
what the `GLOBAL_CONFIG` environment variable on the Vercel project is for.
There's no fallback: if a key isn't there, the route returns `503` rather than
making something up.

**Nothing writes to it automatically yet** — a scheduled sync (Vercel Cron Job
pulling from the Google Sheet) is still to be designed. Until then, run the
scripts by hand each quarter (once `vercel login`'d — a personal access token
isn't enough: it got a `403` writing to this store, while the CLI's own logged-in
session can). Both scripts only touch the one quarter/date they're given plus the
catalog — they never reload the store's other history:

```
vercel login   # once

# Products: copy api/_data/products.template.js somewhere gitignored (e.g.
# input/products/<quarter>.js), fill in real values from that quarter's sheet
# export, then:
node scripts/push-products.mjs input/products/<quarter>.js

# Fonts:
node scripts/import-font-stats.mjs "<path to CSV>"
```

## Running it locally

```
npm install --global vercel@latest   # once
vercel env pull --environment=development   # once, to get GLOBAL_CONFIG into .env.local
vercel dev
```

Serves on **http://localhost:3000** by default (first run will ask you to link the
local checkout to the Vercel project — see "Deploying" below for creating it).

To test end-to-end against the front end, also run
`languagetechnology-org-cloudflare-pages`'s `npx wrangler pages dev .`
(**http://localhost:8788**) — that page's `impact/index.html` automatically points
at this API's local dev server when it detects it's running on localhost, and
`api/_lib/cors.js`'s allow-list already includes `http://localhost:8788`, so no
extra config is needed on either side. See that repo's `impact/README.md` for
details.

## Deploying

Vercel's own GitHub integration deploys every push to `main` automatically —
`vercel link` (the one-time setup below) connects the repo to the project, so no
GitHub Actions workflow is needed for this. (An earlier attempt built a custom
Action around the Vercel CLI, on the assumption that Vercel's dashboard import
flow needed a paid plan; that assumption turned out to only apply to the
dashboard's own "Import Git Repository" click-through, not to the native
integration once the project's linked via the CLI, so the custom Action was
redundant and got removed.)

**One-time setup** (only needed once, or if the Vercel project is ever recreated):

1. `npm install --global vercel@latest`
2. `vercel login`
3. `vercel link` from the repo root — creates the Vercel project, connects it to
   this GitHub repo, and writes `.vercel/project.json` locally (gitignored,
   never commit it).
4. In the Vercel project's dashboard, add the custom domain
   (`metrics.languagetechnology.org`) and add the CNAME it gives you in the
   Cloudflare account that owns `languagetechnology.org`'s DNS.

After that, pushing to `main` deploys automatically. `vercel deploy` by hand also
works locally once step 3 is done.

## Data notes

- `input/` holds raw source exports (font CSVs, per-quarter product input files)
  used to populate the store. Gitignored entirely (SIL-internal data) — never
  commit anything under it.
- Product data excludes the sheet's "Fonts" section and any placeholder rows with
  no dev status and no metrics ever recorded.

## TODO

- [ ] Design and build a scheduled sync (Vercel Cron Job pulling from the Google
  Sheet) that writes to Global Config directly, replacing the current by-hand
  `scripts/push-products.mjs` / `scripts/import-font-stats.mjs` runs.
- [ ] Decide whether yearly / since-start rollups (requested for products —
  additive metrics like downloads/installs sum across quarters, point-in-time
  ones like active_users/countries don't) get computed by that sync when it
  writes, or by the read routes on the fly.
