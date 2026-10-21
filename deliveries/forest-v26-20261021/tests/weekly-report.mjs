import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
import { mkdtempSync,rmSync } from 'node:fs';import { tmpdir } from 'node:os';import { join } from 'node:path';import { spawn } from 'node:child_process';
const root=fileURLToPath(new URL('..',import.meta.url)),dir=mkdtempSync(join(tmpdir(),'cui-v21-')),port=8898,api=`http://127.0.0.1:${port}/api/family-skill-tree-auth`;assert.ok(dir.startsWith(join(tmpdir(),'cui-')));
let server;
async function start(){server=spawn(process.execPath,['scripts/dev-server.mjs'],{cwd:root,env:{...process.env,ALLOW_DEV_AUTH:'1',PORT:String(port),DATA_DIR:dir},stdio:['ignore','pipe','pipe']});await new Promise((resolve,reject)=>{const t=setTimeout(()=>reject(new Error('server timeout')),5000);server.stdout.on('data',d=>{if(String(d).includes('dev server')){clearTimeout(t);resolve()}});server.on('exit',c=>reject(new Error('server exit '+c)))})}
async function stop(){if(!server)return;server.kill('SIGTERM');await new Promise(r=>setTimeout(r,220));server=null}
const h=who=>({'content-type':'application/json','x-dev-user':who});
const req=async(method='GET',action='',body,qs='')=>{const u=new URL(api);if(action)u.searchParams.set('action',action);for(const [k,v] of new URLSearchParams(qs))u.searchParams.set(k,v);const r=await fetch(u,{method,headers:h('dad|dad@example.com'),body:body===undefined?undefined:JSON.stringify(body)});const data=await r.json().catch(()=>({}));return{r,data}};
const state={version:21,current:'anan',children:{anan:{name:'崔长安',age:6,xp:180,coins:50,gems:2,height:170,reviewsHistory:[],trees:[{id:'life',name:'生活技能树',height:130,skills:[{id:'bag',name:'系塑料袋',difficulty:3,reviews:2,minutes:30,last:'2026-08-20T08:00:00.000Z'},{id:'print',name:'自己操作打印',difficulty:2,reviews:4,minutes:40,last:'2026-08-19T08:00:00.000Z'}]}]},hu:{name:'崔护',age:9,trees:[]}}};
try{
 await start();let x=await req('POST','',{state});assert.equal(x.r.status,201);
 x=await req('POST','weekly-goal',{childKey:'anan',weekStart:'2026-08-24',goalText:'本周把生活技能练得更独立',targetMinutes:40,targetReviews:4});assert.equal(x.r.status,200);assert.equal(x.data.report.goal.custom,true);assert.equal(x.data.report.goal.targetMinutes,40);
 const events=[['evt-v21-a','系塑料袋',12,'2026-08-25T10:00:00.000Z','bag'],['evt-v21-b','自己操作打印',10,'2026-08-26T10:00:00.000Z','print'],['evt-v21-c','系塑料袋',8,'2026-08-28T10:00:00.000Z','bag']];
 for(const [id,name,minutes,at,skillId] of events){const r=await req('POST','review',{clientEventId:id,childKey:'anan',treeId:'life',skillId,skillName:name,minutes,occurredAt:at});assert.equal(r.r.status,202)}
 x=await req('GET','weekly-report',undefined,'child=anan&date=2026-08-29');assert.equal(x.r.status,200);assert.equal(x.data.weekStart,'2026-08-24');assert.equal(x.data.metrics.minutes,30);assert.equal(x.data.metrics.reviews,3);assert.equal(x.data.metrics.uniqueSkills,2);assert.equal(x.data.topSkills[0].name,'系塑料袋');assert.equal(x.data.metrics.progress,75);
 await stop();await start();x=await req('GET','weekly-report',undefined,'child=anan&date=2026-08-29');assert.equal(x.data.metrics.minutes,30);assert.equal(x.data.goal.goalText,'本周把生活技能练得更独立');
 console.log('V21_WEEKLY_REPORT_PASS');console.log(JSON.stringify(x.data,null,2));
}finally{await stop();rmSync(dir,{recursive:true,force:true})}
