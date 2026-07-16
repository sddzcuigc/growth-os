import fs from "node:fs";
import path from "node:path";

const sourceRoot = path.resolve(process.argv[2] || "");
const target = path.resolve(process.argv[3] || "assets/growth-os");
if (!process.argv[2]) {
  console.error("Usage: node scripts/import-boss-assets.mjs <extracted-V3-kit-or-growth-os-assets-directory> [target-directory]");
  process.exit(2);
}
if (!fs.existsSync(sourceRoot)) {
  console.error(`Source does not exist: ${sourceRoot}`);
  process.exit(2);
}
const candidates = [
  sourceRoot,
  path.join(sourceRoot, "public", "assets", "growth-os"),
  path.join(sourceRoot, "assets", "growth-os"),
];
const source = candidates.find((candidate) => fs.existsSync(path.join(candidate, "assets_manifest_final.json")));
if (!source) {
  console.error("Could not find assets_manifest_final.json. Use the extracted GrowthOS_Codex_Integration_Kit_V3.0 directory.");
  process.exit(2);
}
fs.rmSync(target, { recursive: true, force: true });
fs.mkdirSync(path.dirname(target), { recursive: true });
fs.cpSync(source, target, { recursive: true, force: true });
console.log(`Imported GrowthOS assets from ${source} to ${target}`);
