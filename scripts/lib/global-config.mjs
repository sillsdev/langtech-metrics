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
import { writeFile, unlink } from "node:fs/promises";
import { tmpdir } from "node:os";
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

// On Windows, "vercel" is a .cmd shim -- Node can only launch it through a shell,
// and cmd.exe (the default) caps a command line at 8191 characters, too small for
// a several-KB JSON patch. PowerShell has much more headroom, but PowerShell 5.1
// has its own well-known bug: it silently strips embedded double-quote characters
// when passing a string to a *native* command's argv. The documented workaround is
// doubling each `"` (PowerShell's own string-literal escape for a literal `"`)
// before handing the value to the native command. Running via a temp .ps1 file
// (rather than -Command) avoids a second layer of escaping for the script text
// itself. On POSIX, "vercel" is a real executable/shebang script -- no shell or
// escaping games needed, so the JSON just goes directly into argv.
async function runVercelPatch(patchJson) {
  if (process.platform !== "win32") {
    return execFileAsync("vercel", ["global-config", "update", STORE_ID, "--patch", patchJson, "--json"], {
      maxBuffer: 10 * 1024 * 1024,
    });
  }

  const forNativeArg = patchJson.replace(/"/g, '""');
  const psLiteral = "'" + forNativeArg.replace(/'/g, "''") + "'";
  const script = `& vercel global-config update ${STORE_ID} --patch ${psLiteral} --json\nexit $LASTEXITCODE\n`;

  const scriptPath = join(tmpdir(), `global-config-patch-${Date.now()}-${Math.random().toString(36).slice(2)}.ps1`);
  await writeFile(scriptPath, script, "utf8");
  try {
    return await execFileAsync("powershell.exe", ["-NoProfile", "-File", scriptPath], {
      maxBuffer: 10 * 1024 * 1024,
    });
  } finally {
    await unlink(scriptPath).catch(() => {});
  }
}

export async function upsertItems(items) {
  const patch = JSON.stringify({
    items: Object.entries(items).map(([key, value]) => ({ operation: "upsert", key, value })),
  });
  try {
    await runVercelPatch(patch);
  } catch (err) {
    throw new Error(`vercel global-config update failed: ${err.stderr || err.message}`);
  }
}
