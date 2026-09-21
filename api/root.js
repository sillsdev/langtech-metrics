import { withCors } from "./_lib/cors.js";

export const config = { runtime: "edge" };

// Vercel's file-based routing puts this at /api/root; vercel.json rewrites the
// bare domain root ("/") to it, so hitting the domain directly (a health check, a
// curious human) gets a self-describing directory instead of a bare 404.
export default async function handler(request) {
  if (request.method !== "GET") {
    return withCors(request, new Response("Method not allowed", { status: 405 }));
  }
  return withCors(
    request,
    Response.json({
      name: "langtech-metrics API",
      endpoints: ["/api/products", "/api/fonts"],
    }),
  );
}
