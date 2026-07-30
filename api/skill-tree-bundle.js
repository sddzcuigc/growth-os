import { readFile } from "node:fs/promises";
import { join } from "node:path";

const bundlePaths = [
  join(process.cwd(), "skill-tree", "p1.js"),
  join(process.cwd(), "skill-tree", "p2.js"),
  join(process.cwd(), "skill-tree", "p3.js"),
  join(process.cwd(), "skill-tree", "p4.js")
];

export default async function handler(request, response) {
  if (request.method !== "GET") {
    response.setHeader("allow", "GET");
    response.statusCode = 405;
    response.end("Method not allowed");
    return;
  }

  try {
    const url = new URL(request.url || "/", "https://growth-os.local");
    const part = Number(url.searchParams.get("part") || request.query?.part || 0);
    if (!Number.isInteger(part) || part < 1 || part > bundlePaths.length) {
      response.statusCode = 404;
      response.end("Not found");
      return;
    }

    const content = await readFile(bundlePaths[part - 1], "utf8");
    response.writeHead(200, {
      "content-type": "application/javascript; charset=utf-8",
      "cache-control": "public, max-age=31536000, immutable",
      "access-control-allow-origin": "*",
      "x-content-type-options": "nosniff"
    });
    response.end(content);
  } catch (error) {
    console.error("skill-tree-bundle", error?.message || error);
    response.statusCode = 500;
    response.end("Bundle unavailable");
  }
}
