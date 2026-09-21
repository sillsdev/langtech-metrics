# langtech-metrics

API for LangTech tools usage metrics, consumed by the `/impact` dashboard on
[languagetechnology.org](https://languagetechnology.org) (repo:
`languagetechnology-org-cloudflare-pages`). Deployed on Vercel as
`metrics.languagetechnology.org`, separate from that static site.

This used to be a Cloudflare Worker on the same zone as the static site, but
`metrics.languagetechnology.org`'s DNS lives in a different Cloudflare account than
this API's, and Cloudflare doesn't let one account manage a custom domain pointing
at another account's Worker — hence Vercel instead, fronted by a CNAME from that
other account's DNS.

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
  - `_data/staticData.js`, `_data/staticFontData.js` — hand-maintained snapshots.
    Kept as a human-diffable record of data changes in git history, but no longer
    read at request time (see "Populating data") — `products.js`/`fonts.js` read
    from Global Config only, with no fallback if it's empty.
- **`scripts/lib/global-config.mjs`** — shared write helper (Vercel REST API,
  needs `VERCEL_API_TOKEN`) used by the two scripts below.
- **`scripts/push-products.mjs`** — pushes `api/_data/staticData.js` to the store.
  Run by hand after hand-editing that file.
- **`scripts/import-font-stats.mjs`** — quarterly CSV import: rewrites
  `api/_data/staticFontData.js` *and* pushes the same data to the store.

## Populating data

Both routes read from a Vercel [Global Config](https://vercel.com/docs/global-config)
store (`langtech_metrics`, id `ecfg_tphutqyjwlgls1zjiskkmopfm6zn`, on the
`sil-lang-tech` team) via the read-only `@vercel/global-config` SDK — that's what
the `GLOBAL_CONFIG` environment variable on the Vercel project is for. There's no
fallback: if a key isn't there, the route returns `503` rather than making
something up.

**Nothing writes to it automatically yet** — a scheduled sync (Vercel Cron Job
pulling from the Google Sheet, replacing the old Cloudflare cron worker that did
this) is still to be designed. Until then, run the scripts by hand after updating
the source data:

```
VERCEL_API_TOKEN=<a personal access token from vercel.com/account/tokens> node scripts/push-products.mjs
VERCEL_API_TOKEN=<...> node scripts/import-font-stats.mjs "<path to CSV>"
```

`VERCEL_API_TOKEN` is a different token from the Global Config's own read token
(the connection string baked into `GLOBAL_CONFIG`) — that one can only read, this
one needs write access to the `sil-lang-tech` team's Global Config.

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
extra config is needed on either side (you'll need to update that page's local dev
port if it still points at `:8787` from before this moved off Cloudflare — see that
repo's `impact/README.md`). See that repo's `impact/README.md` for details.

## Deploying

Deploys run via GitHub Actions (`.github/workflows/deploy.yml`) on every push to
`main`, using the Vercel CLI with a token rather than Vercel's GitHub App/dashboard
import — that import flow isn't available without a paid plan for this repo's org.

**One-time setup** (only needed once, or if the Vercel project is ever recreated):

1. `npm install --global vercel@latest`
2. `vercel login`
3. `vercel link` from the repo root — creates the Vercel project and writes
   `.vercel/project.json` locally (gitignored, never commit it).
4. Read the org and project IDs out of that file:
   `cat .vercel/project.json`
5. Create a token at vercel.com/account/tokens.
6. Add three repo secrets (Settings → Secrets and variables → Actions):
   `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`.
7. In the Vercel project's dashboard, add the custom domain
   (`metrics.languagetechnology.org`) and add the CNAME it gives you in the
   Cloudflare account that owns `languagetechnology.org`'s DNS.

After that, pushing to `main` deploys automatically. `vercel deploy` by hand also
works locally once step 3 is done.

## Data notes

- `input/` holds raw source exports (`.xlsx`, font CSVs) used to generate the static
  snapshots. Gitignored (SIL-internal data) — never commit it.
- The product snapshot excludes the sheet's "Fonts" section and any placeholder rows
  with no dev status and no metrics ever recorded.

## TODO

- [ ] Design and build a scheduled sync (Vercel Cron Job pulling from the Google
  Sheet) that writes to Global Config directly, replacing the current by-hand
  `scripts/push-products.mjs` / `scripts/import-font-stats.mjs` runs; the previous
  Cloudflare cron worker that did this for products was removed when this moved
  off Cloudflare.
- [ ] Decide whether yearly / since-start rollups (requested for products —
  additive metrics like downloads/installs sum across quarters, point-in-time
  ones like active_users/countries don't) get computed by that sync when it
  writes, or by the read routes on the fly.
