// Served on its own subdomain (metrics.languagetechnology.org), cross-origin from
// the static site (languagetechnology.org) that consumes it -- every response needs
// an Access-Control-Allow-Origin header. Echoing back one specific allow-listed
// origin (rather than a wildcard) also lets the static site's local dev server
// (http://localhost:8788) call this API's own local dev server during local
// testing -- see this repo's README "Running it locally" section.
const ALLOWED_ORIGINS = new Set([
  "https://languagetechnology.org",
  "http://localhost:8788",
  "http://127.0.0.1:8788",
]);

export function withCors(request, response) {
  const origin = request.headers.get("Origin");
  const headers = new Headers(response.headers);
  if (origin && ALLOWED_ORIGINS.has(origin)) {
    headers.set("Access-Control-Allow-Origin", origin);
    headers.set("Vary", "Origin");
  }
  return new Response(response.body, { status: response.status, headers });
}
