import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { gunzipSync } from "node:zlib";

const bundlePaths = [1, 2, 3, 4].map(part => join(process.cwd(), "skill-tree", `p${part}.js`));
const firebaseScripts = `
<script src="https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.14.1/firebase-auth-compat.js"></script>
<script src="https://growth-os-ten-pearl.vercel.app/skill-tree/firebase-auth-client.js?v=firebase-v14"></script>`;

export default async function handler(request, response) {
  if (request.method !== "GET") {
    response.setHeader("allow", "GET");
    response.statusCode = 405;
    response.end("Method not allowed");
    return;
  }

  try {
    const sourceParts = await Promise.all(bundlePaths.map(path => readFile(path, "utf8")));
    const base64 = sourceParts.map(extractPayload).join("");
    let html = gunzipSync(Buffer.from(base64, "base64")).toString("utf8");
    html = html.replace("</title>", "</title><meta name=\"build\" content=\"material-firebase-v14\">");
    html = html.includes("</body>")
      ? html.replace("</body>", `${firebaseScripts}</body>`)
      : `${html}${firebaseScripts}`;

    const script = `document.open();document.write(${JSON.stringify(html)});document.close();`;
    response.writeHead(200, {
      "content-type": "application/javascript; charset=utf-8",
      "cache-control": "public, max-age=120, must-revalidate",
      "access-control-allow-origin": "*",
      "x-content-type-options": "nosniff"
    });
    response.end(script);
  } catch (error) {
    console.error("skill-tree-auth-app", error?.message || error);
    response.statusCode = 500;
    response.end(`document.body.innerHTML='<main style="font-family:system-ui;padding:30px"><h2>成长森林暂时无法打开</h2><p>服务器恢复素材版失败，请稍后刷新。</p></main>';`);
  }
}

function extractPayload(source) {
  const match = String(source).match(/\.push\('([A-Za-z0-9+/=]+)'\)/);
  if (!match) throw new Error("Invalid skill tree bundle");
  return match[1];
}
