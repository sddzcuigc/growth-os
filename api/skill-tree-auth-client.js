import { readFile } from "node:fs/promises";
import { join } from "node:path";

const clientPath = join(process.cwd(), "skill-tree", "firebase-auth-client.js");

export default async function handler(request, response) {
  if (request.method !== "GET") {
    response.setHeader("allow", "GET");
    response.statusCode = 405;
    response.end("Method not allowed");
    return;
  }

  try {
    const content = await readFile(clientPath, "utf8");
    response.writeHead(200, {
      "content-type": "application/javascript; charset=utf-8",
      "cache-control": "public, max-age=300, must-revalidate",
      "access-control-allow-origin": "*",
      "x-content-type-options": "nosniff"
    });
    response.end(content);
  } catch (error) {
    console.error("skill-tree-auth-client", error?.message || error);
    response.statusCode = 500;
    response.end("Auth client unavailable");
  }
}
