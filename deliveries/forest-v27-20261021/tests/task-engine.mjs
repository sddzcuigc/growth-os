import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
import { mkdtempSync,rmSync } from 'node:fs';import { tmpdir } from 'node:os';import { join } from 'node:path';import { spawn } from 'node:child_process';
const root=fileURLToPath(new URL('..',import.meta.url)),dir=mkdtempSync(join(tmpdir(),'cui-v20-')),port=8897,api=`http://127.0.0.1:${port}/api/family-skill-tree-auth`;
assert.ok(dir.startsWith(join(tmpdir(),'cui-')));
let server;
async function start(){server=spawn(process.execPath,['scripts/dev-server.mjs'],{cwd:root,env:{...process.env,ALLOW_DEV_AUTH:'1',PORT:String(port),DATA_DIR:dir},stdio:['ignore','pipe','pipe']});await new Promise((resolve,reject)=>{const t=setTimeout(()=>reject(new Error('server timeout')),5000);server.stdout.on('data',d=>{if(String(d).includes('dev server')){clearTimeout(t);resolve()}});server.on('exit',c=>reject(new Error('server exit '+c)))})}
async function stop(){if(!server)return;server.kill('SIGTERM');await new Promise(r=>setTimeout(r,250));server=null}
const h=who=>({'content-type':'application/json','x-dev-user':who});
const req=async(who,method='GET',action='',body,qs='')=>{const u=new URL(api);if(action)u.searchParams.set('action',action);if(qs)for(const [k,v] of new URLSearchParams(qs))u.searchParams.set(k,v);const r=await fetch(u,{method,headers:h(who),body:body===undefined?undefined:JSON.stringify(body)});let data={};try{data=await r.json()}catch{}return{r,data}};
const ago=d=>new Date(Date.now()-d*86400000).toISOString();
const state={version:20,current:'anan',children:{anan:{name:'崔长安',age:6,xp:150,coins:40,gems:1,height:160,reviewsHistory:[],trees:[{id:'life',name:'生活技能树',height:120,skills:[{id:'bag',name:'系塑料袋',difficulty:4,reviews:1,minutes:20,last:ago(9)},{id:'print',name:'自己操作打印',difficulty:2,reviews:3,minutes:30,last:ago(25)},{id:'coat',name:'自己穿外套',difficulty:3,reviews:0,minutes:8,last:ago(15)}]}]},hu:{name:'崔护',age:9,trees:[]}}};
try{
 await start();
 let x=await req('dad|dad@example.com','POST','',{state});assert.equal(x.r.status,201);
 const date='2026-08-29';
 let tasks=await req('dad|dad@example.com','GET','daily-tasks',undefined,`child=anan&date=${date}`);assert.equal(tasks.r.status,200);assert.equal(tasks.data.tasks.length,3);assert.equal(tasks.data.tasks[0].status,'pending');assert.ok(tasks.data.tasks.some(t=>t.skillName==='系塑料袋'));assert.ok(tasks.data.tasks.every(t=>t.minutes===8));
 const first=tasks.data.tasks[0];let done=await req('dad|dad@example.com','POST','complete-task',{taskId:first.id});assert.equal(done.r.status,200);assert.equal(done.data.completed,true);assert.equal(done.data.version,2);
 tasks=await req('dad|dad@example.com','GET','daily-tasks',undefined,`child=anan&date=${date}`);assert.equal(tasks.data.tasks.filter(t=>t.status==='done').length,1);
 let reward=await req('dad|dad@example.com','POST','claim-daily-reward',{childKey:'anan',date});assert.equal(reward.r.status,409);
 for(const t of tasks.data.tasks.filter(t=>t.status!=='done')){done=await req('dad|dad@example.com','POST','complete-task',{taskId:t.id});assert.equal(done.r.status,200)}
 reward=await req('dad|dad@example.com','POST','claim-daily-reward',{childKey:'anan',date});assert.equal(reward.r.status,200);assert.equal(reward.data.claimed,true);assert.equal(reward.data.reward.coins,30);assert.equal(reward.data.reward.gems,1);
 const again=await req('dad|dad@example.com','POST','claim-daily-reward',{childKey:'anan',date});assert.equal(again.data.duplicate,true);
 const health=await fetch(`http://127.0.0.1:${port}/api/health`).then(r=>r.json());assert.equal(health.stats.tasks,3);assert.equal(health.stats.completedTasks,3);
 await stop();await start();
 tasks=await req('dad|dad@example.com','GET','daily-tasks',undefined,`child=anan&date=${date}`);assert.equal(tasks.data.tasks.filter(t=>t.status==='done').length,3);assert.equal(tasks.data.rewardClaimed,true);
 const stateAfter=await req('dad|dad@example.com');assert.ok(stateAfter.data.state.children.anan.coins>=70);assert.ok(stateAfter.data.state.children.anan.gems>=2);
 console.log('V20_TASK_ENGINE_PASS');console.log(JSON.stringify({taskOrder:tasks.data.tasks.map(t=>t.skillName),allDone:true,rewardClaimed:true,restartPersistence:true,health},null,2));
}finally{await stop();rmSync(dir,{recursive:true,force:true})}
