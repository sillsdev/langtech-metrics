// Shared write path for scripts/import-font-stats.mjs and scripts/push-products.mjs.
//
// api/products.js and api/fonts.js read through the low-latency @vercel/global-config
// SDK (see README "Populating data"), but that SDK is read-only. Scripts run outside
// any Vercel deployment anyway, so writing (and, when a script needs to merge with
// what's already stored, reading) goes straight through the Vercel REST API instead.
//
// Requires VERCEL_API_TOKEN: a personal access token from vercel.com/account/tokens,
// scoped to the sil-lang-tech team. This is a different token from the Global
// Config's own read token (GLOBAL_CONFIG env var on the Vercel project) -- that one
// can only read, not write.
const STORE_ID = "ecfg_tphutqyjwlgls1zjiskkmopfm6zn";
const TEAM_ID = "team_MeJSTdRQuUUuuXt0KVATB37A";

function requireToken() {
  const token = process.env.VERCEL_API_TOKEN;
  if (!token) {
    throw new Error(
      "Set VERCEL_API_TOKEN (a Vercel personal access token, from vercel.com/account/tokens) before running this script.",
    );
  }
  return token;
}

export async function readItems() {
  const res = await fetch(`https://api.vercel.com/v1/global-config/${STORE_ID}/items?teamId=${TEAM_ID}`, {
    headers: { Authorization: `Bearer ${requireToken()}` },
  });
  if (!res.ok) {
    throw new Error(`Global Config read failed (${res.status}): ${await res.text()}`);
  }
  return res.json();
}

export async function upsertItems(items) {
  const res = await fetch(`https://api.vercel.com/v1/global-config/${STORE_ID}/items?teamId=${TEAM_ID}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${requireToken()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      items: Object.entries(items).map(([key, value]) => ({ operation: "upsert", key, value })),
    }),
  });
  if (!res.ok) {
    throw new Error(`Global Config update failed (${res.status}): ${await res.text()}`);
  }
}
