import { join } from "path";
import { serve } from "bun";

// Serve static assets from dist (when run from project root, e.g. test/template)
const distDir = join(process.cwd(), "dist");
const indexHtml = Bun.file(join(distDir, "index.html"));

const mineMap = new Map([
  [".html", "text/html"],
  [".css", "text/css"],
  [".js", "application/javascript"],
  [".json", "application/json"],
  [".svg", "image/svg+xml"],
  [".png", "image/png"],
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".ico", "image/x-icon"],
  [".woff", "font/woff"],
  [".woff2", "font/woff2"],
]);

function getMime(pathname: string) {
  const format = pathname.split('.').at(-1);
  if (!format) return "";

  const mine = mineMap.get(format)

  if (!mine) return "application/octet-stream";

  return mine
}

const server = serve({
  port: 3000,
  async fetch(req) {
    const url = new URL(req.url);
    const pathname = url.pathname;

    // API routes
    if (pathname === "/api/hello" && req.method === "GET") {
      return Response.json({ message: "Hello, world!", method: "GET" });
    }
    if (pathname === "/api/hello" && req.method === "PUT") {
      return Response.json({ message: "Hello, world!", method: "PUT" });
    }
    const apiNameMatch = pathname.match(/^\/api\/hello\/([^/]+)$/);
    if (apiNameMatch) {
      return Response.json({ message: `Hello, ${apiNameMatch[1]}!` });
    }

    // Static files from dist (images, JS, CSS, etc.)
    const safePath = pathname.startsWith("/") ? pathname.slice(1) : pathname;
    if (safePath && !safePath.includes("..")) {
      const filePath = join(distDir, safePath);
      const file = Bun.file(filePath);
      if (await file.exists()) {
        return new Response(file, {
          headers: { "Content-Type": getMime(pathname) },
        });
      }
    }

    // SPA fallback: index.html
    return new Response(indexHtml, {
      headers: { "Content-Type": "text/html" },
    });
  },

  development: process.env.NODE_ENV !== "production" && {
    hmr: true,
    console: true,
  },
});

console.log(`🚀 Server running at ${server.url}`);
