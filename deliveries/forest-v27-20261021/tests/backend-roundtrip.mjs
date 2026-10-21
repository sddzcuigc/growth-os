import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
import { mkdtempSync,rmSync } from 'node:fs';import { tmpdir } from 'node:os';import { join } from 'node:path';import { spawn } from 'node:child_process';
const root=fileURLToPath(new URL('..',import.meta.url)),dir=mkdtempSync(join(tmpdir(),'cui-v19-')),port=8896,api=`http://127.0.0.1:${port}/api/family-skill-tree-auth`;
assert.ok(dir.startsWith(join(tmpdir(),'cui-')));
let server;
async function start(){server=spawn(process.execPath,['scripts/dev-server.mjs'],{cwd:root,env:{...process.env,ALLOW_DEV_AUTH:'1',PORT:String(port),DATA_DIR:dir},stdio:['ignore','pipe','pipe']});await new Promise((resolve,reject)=>{const t=setTimeout(()=>reject(new Error('server timeout')),5000);server.stdout.on('data',d=>{if(String(d).includes('dev server')){clearTimeout(t);resolve()}});server.on('exit',c=>reject(new Error('server exit '+c)))})}
async function stop(){if(!server)return;server.kill('SIGTERM');await new Promise(r=>setTimeout(r,250));server=null}
const h=who=>({'content-type':'application/json','x-dev-user':who});
const req=async(who,method='GET',action='',body)=>{const r=await fetch(api+(action?`?action=${action}`:''),{method,headers:h(who),body:body===undefined?undefined:JSON.stringify(body)});let data={};try{data=await r.json()}catch{}return{r,data}};
const state={version:19,current:'anan',children:{anan:{name:'崔长安',trees:[{id:'anan-life',name:'生活技能树',skills:[{id:'anan-bag',name:'系塑料袋',reviews:3,minutes:44}]}]},hu:{name:'崔护',trees:[]}}};
try{
 await start();
 let x=await req('dad|dad@example.com','POST','',{state});assert.equal(x.r.status,201);assert.equal(x.data.version,1);assert.equal(x.data.family.members.length,1);
 let inv=await req('dad|dad@example.com','POST','invite',{role:'editor'});assert.equal(inv.r.status,201);assert.match(inv.data.code,/^CGF-/);
 let joined=await req('mom|mom@example.com','POST','join',{code:inv.data.code});assert.equal(joined.r.status,200);assert.equal(joined.data.family.members.length,2);assert.equal(joined.data.state.children.anan.trees[0].skills[0].name,'系塑料袋');
 state.children.anan.trees[0].skills[0].reviews=4;
 let save=await req('mom|mom@example.com','PUT','state',{state,expectedVersion:1});assert.equal(save.r.status,200);assert.equal(save.data.version,2);
 let dad=await req('dad|dad@example.com');assert.equal(dad.data.version,2);assert.equal(dad.data.state.children.anan.trees[0].skills[0].reviews,4);
 const ev={clientEventId:'evt-test-0001',childKey:'anan',treeId:'anan-life',skillId:'anan-bag',skillName:'系塑料袋',minutes:10,occurredAt:new Date().toISOString()};
 let er=await req('mom|mom@example.com','POST','review',ev);assert.equal(er.r.status,202);er=await req('mom|mom@example.com','POST','review',ev);assert.equal(er.data.duplicate,true);
 let events=await req('dad|dad@example.com','GET','reviews');assert.equal(events.data.events.length,1);assert.equal(events.data.events[0].skillName,'系塑料袋');
 let backups=await req('dad|dad@example.com','GET','backups');assert.ok(backups.data.backups.some(b=>b.version===1));
 let restored=await req('dad|dad@example.com','POST','restore',{version:1});assert.equal(restored.r.status,200);assert.equal(restored.data.version,3);assert.equal(restored.data.state.children.anan.trees[0].skills[0].reviews,3);
 let conflict=await req('mom|mom@example.com','PUT','state',{state,expectedVersion:1});assert.equal(conflict.r.status,409);
 let health=await fetch(`http://127.0.0.1:${port}/api/health`).then(r=>r.json());assert.equal(health.ok,true);assert.equal(health.stats.members,2);assert.equal(health.stats.reviews,1);
 await stop();
 await start();
 dad=await req('dad|dad@example.com');assert.equal(dad.r.status,200);assert.equal(dad.data.version,3);assert.equal(dad.data.family.members.length,2);assert.equal(dad.data.state.children.anan.trees[0].skills[0].reviews,3);
 events=await req('mom|mom@example.com','GET','reviews');assert.equal(events.data.events.length,1);
 health=await fetch(`http://127.0.0.1:${port}/api/health`).then(r=>r.json());assert.equal(health.stats.members,2);
 console.log('V20_FAMILY_BACKEND_PASS');console.log(JSON.stringify({familyMembers:2,invite:inv.data.code,reviewEvents:events.data.events.length,restoredVersion:dad.data.version,restartPersistence:true,health},null,2));
}finally{await stop();rmSync(dir,{recursive:true,force:true})}
