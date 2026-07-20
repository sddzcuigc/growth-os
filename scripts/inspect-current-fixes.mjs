import { readFileSync, writeFileSync } from "node:fs";

const sections = [];
function around(file, needle, before = 20, after = 60) {
  const lines = readFileSync(file, "utf8").split("\n");
  const index = lines.findIndex((line) => line.includes(needle));
  const start = Math.max(0, index - before);
  const end = Math.min(lines.length, index + after + 1);
  sections.push(`=== ${file}: ${needle} ===`);
  sections.push(...lines.slice(start, end).map((line, offset) => `${start + offset + 1}: ${line}`));
}

around("app.js", "function installProfiles");
around("app.js", "function loadAccount");
around("app.js", "render();", 5, 10);
around("api/server.js", "const demoLoginEnabled", 5, 30);
around("api/server.js", "function ensureBuiltInDemoAccount", 10, 70);
around("index.html", "demo-login-hint", 8, 12);
writeFileSync("inspection-snippets.txt", sections.join("\n"));
