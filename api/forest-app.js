import {readFile} from 'node:fs/promises';
import {join,extname} from 'node:path';
const files=new Set(['index.html','forest-design.css','visual-design.mjs','visual-icons.mjs','runtime-config.js','sync-core.mjs','roadmap.mjs','skill-library.json','manifest.webmanifest','sw.js']);
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.txt':'text/plain; charset=utf-8','.js':'application/javascript; charset=utf-8','.mjs':'application/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.webmanifest':'application/manifest+json','.webp':'image/webp','.png':'image/png'};
export default async function handler(req,res){
  if(!['GET','HEAD'].includes(req.method))return res.writeHead(405,{'allow':'GET,HEAD'}).end();
  const asset=new URL(req.url,'http://localhost').searchParams.get('asset')||'index.html';
  if(!files.has(asset)&&! /^(assets|icons|vendor)\/[a-zA-Z0-9_.-]+$/.test(asset))return res.writeHead(404).end('Not found');
  try{const data=await readFile(join(process.cwd(),'forest',asset));res.writeHead(200,{'content-type':types[extname(asset)]||'application/octet-stream','cache-control':asset==='sw.js'||asset==='index.html'||asset==='runtime-config.js'?'no-cache':'public, max-age=300','x-content-type-options':'nosniff'});res.end(req.method==='HEAD'?undefined:data)}catch{res.writeHead(404).end('Not found')}
}
