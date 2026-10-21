import { cp, mkdir, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
const out = new URL('../dist/', import.meta.url);
await rm(out,{recursive:true,force:true});
await mkdir(out,{recursive:true});
for (const name of ['index.html','themes.css','themes.mjs','forest-design.css','visual-design.mjs','visual-icons.mjs','manifest.webmanifest','sw.js','sync-core.mjs','roadmap.mjs','skill-library.json','runtime-config.js','vendor','assets','icons']) {
  if (!existsSync(new URL('../'+name, import.meta.url))) continue;
  await cp(new URL('../'+name, import.meta.url), new URL('../dist/'+name, import.meta.url), {recursive:true});
}
console.log('Web build ready: dist/');
