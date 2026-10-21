import {chromium} from '@playwright/test';
import {spawn} from 'node:child_process';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {run} from './browser-multi-device.mjs';
import {run as runRoadmap} from './browser-roadmap.mjs';
import {run as runVisual} from './browser-visual.mjs';
import {run as runPractice} from './browser-practice-flow.mjs';
const root=fileURLToPath(new URL('../',import.meta.url)),dir=await mkdtemp(join(tmpdir(),'forest-browser-'));
const port=18923,baseURL='http://127.0.0.1:'+port;
const server=spawn(process.execPath,['scripts/dev-server.mjs','--dev-auth'],{cwd:root,env:{...process.env,PORT:String(port),DATA_DIR:dir},stdio:['ignore','pipe','pipe']});
let logs='';server.stdout.on('data',v=>logs+=v);server.stderr.on('data',v=>logs+=v);
let browser;
try{
  for(let i=0;i<100;i++){try{const r=await fetch(baseURL+'/api/health');if(r.ok)break}catch{}if(server.exitCode!==null)throw new Error(logs);await new Promise(r=>setTimeout(r,100));if(i===99)throw new Error('Server not ready: '+logs)}
  browser=await chromium.launch({channel:'msedge',headless:true});
  const page=await browser.newPage();
  if(process.argv.includes('--practice-only'))console.log(JSON.stringify(await runPractice(page,{baseURL}),null,2));
  else if(process.argv.includes('--visual-only'))console.log(JSON.stringify(await runVisual(page,{baseURL}),null,2));
  else{
    if(!process.argv.includes('--roadmap-only'))console.log(JSON.stringify(await run(page,{baseURL}),null,2));
    console.log(JSON.stringify(await runRoadmap(page,{baseURL}),null,2));
    console.log(JSON.stringify(await runPractice(page,{baseURL}),null,2));
    console.log(JSON.stringify(await runVisual(page,{baseURL}),null,2));
  }
}finally{
  await browser?.close();server.kill();
  if(server.exitCode===null)await new Promise(r=>server.once('exit',r));
  await rm(dir,{recursive:true,force:true});
}
