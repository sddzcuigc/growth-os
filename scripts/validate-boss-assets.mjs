import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const manifestPath = path.join(root, "assets/growth-os/assets_manifest_final.json");
if (!fs.existsSync(manifestPath)) {
  console.error("Boss assets are not imported. Run: npm run boss:import -- <extracted-V3-kit-directory>");
  process.exit(2);
}
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const failures = [];
if (manifest.worlds?.length !== 10) failures.push(`world count: ${manifest.worlds?.length}`);
if (manifest.bosses?.length !== 100) failures.push(`boss count: ${manifest.bosses?.length}`);
if (manifest.rewards?.length !== 100) failures.push(`reward count: ${manifest.rewards?.length}`);
const assetPaths = [];
for (const world of manifest.worlds || []) assetPaths.push(world.card, world.mainScene, ...(world.subscenes || []), world.contactSheet);
for (const boss of manifest.bosses || []) assetPaths.push(boss.card, boss.portrait);
const missing = assetPaths.filter((assetPath) => !fs.existsSync(path.join(root, assetPath.replace(/^\//, ""))));
console.log(`Manifest: ${manifest.worlds?.length || 0} worlds, ${manifest.bosses?.length || 0} bosses, ${manifest.rewards?.length || 0} rewards`);
if (missing.length) failures.push(`${missing.length} referenced image assets are missing`);
if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log(`Validated ${assetPaths.length} referenced assets.`);
