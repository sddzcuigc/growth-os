import {createServer} from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import {extname,resolve,sep} from 'node:path';
import {spawn} from 'node:child_process';
if(process.argv.includes('--dev-auth'))process.env.ALLOW_DEV_AUTH='1';
const {handleApi,health}=await import('../server/handler.mjs');
const root=process.cwd(),port=Number(process.env.PORT||8787),host=process.env.HOST||'127.0.0.1';
if(process.env.ALLOW_DEV_AUTH==='1'&&!['127.0.0.1','localhost','::1'].includes(host))throw new Error('Development identity must only listen on loopback');
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'application/javascript; charset=utf-8','.mjs':'application/javascript; charset=utf-8','.webp':'image/webp','.png':'image/png','.svg':'image/svg+xml','.json':'application/json; charset=utf-8','.webmanifest':'application/manifest+json'};
const files=new Set(['/index.html','/themes.css','/themes.mjs','/forest-design.css','/visual-design.mjs','/visual-icons.mjs','/runtime-config.js','/sync-core.mjs','/roadmap.mjs','/skill-library.json','/manifest.webmanifest','/sw.js']);
createServer(async(req,res)=>{
  const path=new URL(req.url||'/','http://localhost').pathname;
  if(path==='/api/family-skill-tree-auth'||path==='/api/forest-sync')return handleApi(req,res);
  if(path==='/api/health'||path==='/api/forest-health'){res.writeHead(200,{'content-type':'application/json; charset=utf-8','cache-control':'no-store'});return res.end(JSON.stringify(health()))}
  if(!['GET','HEAD'].includes(req.method))return res.writeHead(405).end();
  if(path==='/runtime-config.js'){
    res.writeHead(200,{'content-type':types['.js'],'cache-control':'no-store'});
    return res.end('window.FOREST_RUNTIME='+JSON.stringify({api:'/api/family-skill-tree-auth',health:'/api/health',devAuth:process.env.ALLOW_DEV_AUTH==='1',signInReturnUrl:`http://${req.headers.host}/`})+';');
  }
  try{
    const name=path==='/'?'/index.html':decodeURIComponent(path);
    if(!files.has(name)&&!/^\/(assets|icons|vendor)\/[a-zA-Z0-9_.-]+$/.test(name))return res.writeHead(404).end('Not found');
    const file=resolve(root,'.'+name);
    if(!file.startsWith(root+sep)||(await stat(file)).isDirectory())return res.writeHead(404).end();
    const body=await readFile(file);res.writeHead(200,{'content-type':types[extname(file)]||'application/octet-stream','cache-control':'no-store'});res.end(req.method==='HEAD'?undefined:body);
  }catch{res.writeHead(404).end('Not found')}
}).listen(port,host,()=>{
  const url=`http://${host}:${port}/`;console.log(`Growth Forest ${url}`);
  if(process.argv.includes('--open')&&process.platform==='win32')spawn('rundll32.exe',['url.dll,FileProtocolHandler',url],{windowsHide:true,stdio:'ignore'});
});
