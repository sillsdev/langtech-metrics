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
  - `_data/staticData.js`, `_data/staticFontData.js` — hand-maintained snapshots,
    currently the only data source (see "Populating data").
- **`scripts/import-font-stats.mjs`** — quarterly CSV import that rewrites
  `api/_data/staticFontData.js`.

## Populating data

**There's no live data source yet.** This API previously had a companion Cloudflare
Worker that pulled product metrics from a Google Sheet into KV on a cron schedule —
that was removed when this moved to Vercel, and a replacement (a Vercel Cron Job
writing to a Vercel-native store — KV or Edge Config) is still to be designed. Until
then, every request serves the static snapshots in `api/_data/`.

## Running it locally

```
npm install --global vercel@latest   # once
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

- [ ] Design and build a live data pipeline (Vercel Cron Job + a Vercel-native
  store — KV or Edge Config) for product metrics; the previous Google Sheets sync
  worker was removed when this moved off Cloudflare.
- [ ] Point `scripts/import-font-stats.mjs` (or a future sync) at that store
  directly instead of only rewriting the static fixture.
