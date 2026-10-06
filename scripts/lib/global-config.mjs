// Shared write path for scripts/import-font-stats.mjs and scripts/push-products.mjs.
//
// api/products.js and api/fonts.js read through the low-latency @vercel/global-config
// SDK (see README "Populating data"), but that SDK is read-only.
//
// Writes shell out to the Vercel CLI (`vercel global-config update --patch`)
// rather than calling the REST API directly with a personal access token: a
// team-scoped PAT still got a 403 ("You don't have permission to create the
// edge config item") on this store, while the CLI session that already created
// the store and its read token can write to it fine. So: run `vercel login`
// once, and these scripts use that same session.
import { execFile, exec } from "node:child_process";
import { promisify } from "node:util";
import { join } from "node:path";

const execFileAsync = promisify(execFile);
const execAsync = promisify(exec);
const STORE_ID = "ecfg_tphutqyjwlgls1zjiskkmopfm6zn";

// Reads a single item, or null if it doesn't exist yet (e.g. the very first push
// to a brand-new store). Store id and key are both from our own code (not user
// input) and match Global Config's own [A-Za-z0-9_-] key restriction, so there's
// no shell-injection concern in joining them into a plain command string --
// unlike the write path above, this doesn't need the escaping gymnastics.
export async function getItem(key) {
  try {
    const { stdout } = await execAsync(`vercel global-config items ${STORE_ID} --key ${key} --json`, {
      maxBuffer: 10 * 1024 * 1024,
    });
    return JSON.parse(stdout).value;
  } catch (err) {
    try {
      if (JSON.parse(err.stdout || "").reason === "not_found") return null;
    } catch {
      // fall through to the throw below
    }
    throw new Error(`vercel global-config items failed for "${key}": ${err.stderr || err.message}`);
  }
}

// On Windows, "vercel" is a .cmd/.ps1 shim -- Node can only launch it through a
// shell, and both the available shells have sharp edges with a several-KB JSON
// argument: cmd.exe caps a command line at 8191 characters, and PowerShell 5.1
// silently strips embedded double-quote characters when passing a string to a
// *native* command's argv (a documented bug; the usual workaround of doubling
// each `"` was tried here and turned out to be unreliable in practice -- it
// intermittently delivered a mangled --patch value with no useful error,
// independent of patch size or content).
//
// The reliable fix is to skip the shim (and therefore the shell) entirely:
// resolve the CLI's own vc.js and run it directly via `node`, a real
// executable, so the JSON patch goes into argv exactly as constructed --
// matching how POSIX already invokes the real "vercel" executable/shebang
// script with no shell involved.
let vcJsPathPromise;
async function resolveVcJsPath() {
  if (!vcJsPathPromise) {
    vcJsPathPromise = (async () => {
      const { stdout } = await execAsync("npm root -g");
      return join(stdout.trim(), "vercel", "dist", "vc.js");
    })();
  }
  return vcJsPathPromise;
}

async function runVercelPatch(patchJson) {
  const args = ["global-config", "update", STORE_ID, "--patch", patchJson, "--json"];
  if (process.platform !== "win32") {
    return execFileAsync("vercel", args, { maxBuffer: 10 * 1024 * 1024 });
  }

  const vcJsPath = await resolveVcJsPath();
  return execFileAsync("node", [vcJsPath, ...args], { maxBuffer: 10 * 1024 * 1024 });
}

// A single `vercel global-config update --patch` call silently drops writes
// once the patch body gets large enough (observed: an 18-item, ~30KB patch
// mixing fonts_catalog with several fonts_date_* records reported success but
// fonts_catalog never landed, while the same items split into two smaller
// calls both persisted -- no error surfaces either way, so there's nothing to
// catch). Chunking every call well under that threshold is the only known-
// reliable path; re-check this if a future export makes individual items
// (e.g. one quarter's product list, or one font-date snapshot) exceed it on
// their own, since chunking can't split a single oversized item.
const MAX_PATCH_BYTES = 15_000;

async function sendOperations(operations) {
  const chunks = [];
  let current = [];
  let currentBytes = 0;
  for (const op of operations) {
    const opBytes = JSON.stringify(op).length;
    if (current.length > 0 && currentBytes + opBytes > MAX_PATCH_BYTES) {
      chunks.push(current);
      current = [];
      currentBytes = 0;
    }
    current.push(op);
    currentBytes += opBytes;
  }
  if (current.length > 0) chunks.push(current);

  for (const chunk of chunks) {
    const patch = JSON.stringify({ items: chunk });
    try {
      await runVercelPatch(patch);
    } catch (err) {
      throw new Error(`vercel global-config update failed: ${err.stderr || err.message}`);
    }
  }
}

export async function upsertItems(items) {
  await sendOperations(Object.entries(items).map(([key, value]) => ({ operation: "upsert", key, value })));
}

export async function deleteItems(keys) {
  await sendOperations(keys.map((key) => ({ operation: "delete", key })));
}
