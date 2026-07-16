import { copyFileSync, mkdirSync, readFileSync } from "node:fs";
import { basename, resolve } from "node:path";

const sourceRoot = process.argv[2] ? resolve(process.argv[2]) : null;
if (!sourceRoot) {
  throw new Error("Usage: node scripts/import-boss-assets.mjs <extracted-asset-pack-directory>");
}

const manifest = JSON.parse(readFileSync(resolve(sourceRoot, "manifest.json"), "utf8"));
const outputRoot = resolve("assets/boss");
for (const directory of ["worlds", "portraits", "icons"]) mkdirSync(resolve(outputRoot, directory), { recursive: true });

if (manifest.worlds?.length !== 10 || manifest.bosses?.length !== 100) {
  throw new Error(`Expected 10 worlds and 100 bosses, found ${manifest.worlds?.length || 0} and ${manifest.bosses?.length || 0}`);
}

for (const world of manifest.worlds) {
  copyFileSync(resolve(sourceRoot, world.cover), resolve(outputRoot, "worlds", `${world.id}.png`));
}

for (const boss of manifest.bosses) {
  copyFileSync(resolve(sourceRoot, boss.portrait), resolve(outputRoot, "portraits", `${boss.id}.png`));
  copyFileSync(resolve(sourceRoot, boss.icon), resolve(outputRoot, "icons", `${boss.id}.png`));
}

copyFileSync(resolve(sourceRoot, "manifest.json"), resolve(outputRoot, basename("manifest.json")));
console.log(`Imported ${manifest.worlds.length} worlds, ${manifest.bosses.length} portraits and ${manifest.bosses.length} icons.`);
