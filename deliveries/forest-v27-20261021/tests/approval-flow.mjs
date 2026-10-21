import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
import { mkdtempSync,rmSync } from 'node:fs';import { tmpdir } from 'node:os';import { join } from 'node:path';import { spawn } from 'node:child_process';
const root=fileURLToPath(new URL('..',import.meta.url)),dir=mkdtempSync(join(tmpdir(),'cui-v22-')),port=8899,api=`http://127.0.0.1:${port}/api/family-skill-tree-auth`;
assert.ok(dir.startsWith(join(tmpdir(),'cui-')));
let server;
async function start(){server=spawn(process.execPath,['scripts/dev-server.mjs'],{cwd:root,env:{...process.env,ALLOW_DEV_AUTH:'1',PORT:String(port),DATA_DIR:dir},stdio:['ignore','pipe','pipe']});await new Promise((resolve,reject)=>{const t=setTimeout(()=>reject(new Error('server timeout')),5000);server.stdout.on('data',d=>{if(String(d).includes('dev server')){clearTimeout(t);resolve()}});server.on('exit',c=>reject(new Error('server exit '+c)))})}
async function stop(){if(!server)return;server.kill('SIGTERM');await new Promise(r=>setTimeout(r,220));server=null}
const h=who=>({'content-type':'application/json','x-dev-user':who});
const req=async(who,method='GET',action='',body,qs='')=>{const u=new URL(api);if(action)u.searchParams.set('action',action);if(qs)for(const [k,v] of new URLSearchParams(qs))u.searchParams.set(k,v);const r=await fetch(u,{method,headers:h(who),body:body===undefined?undefined:JSON.stringify(body)});let data={};try{data=await r.json()}catch{}return{r,data}};
const ago=d=>new Date(Date.now()-d*86400000).toISOString();
const state={version:22,current:'anan',children:{anan:{name:'崔长安',age:6,xp:150,coins:40,gems:1,height:160,reviewsHistory:[],trees:[{id:'life',name:'生活技能树',height:120,skills:[{id:'bag',name:'系塑料袋',difficulty:4,reviews:1,minutes:20,last:ago(9)},{id:'print',name:'自己操作打印',difficulty:2,reviews:3,minutes:30,last:ago(25)},{id:'coat',name:'自己穿外套',difficulty:3,reviews:0,minutes:8,last:ago(15)}]}]},hu:{name:'崔护',age:9,trees:[]}}};
try{
 await start();
 let x=await req('dad|dad@example.com','POST','',{state});assert.equal(x.r.status,201);
 let invite=await req('dad|dad@example.com','POST','invite',{role:'editor'});assert.equal(invite.r.status,201);
 let joined=await req('mom|mom@example.com','POST','join',{code:invite.data.code});assert.equal(joined.r.status,200);
 const date='2026-08-30';
 let tasks=await req('dad|dad@example.com','GET','daily-tasks',undefined,`child=anan&date=${date}`);assert.equal(tasks.data.tasks.length,3);
 const before=await req('dad|dad@example.com');const xp0=before.data.state.children.anan.xp,coins0=before.data.state.children.anan.coins,reviews0=before.data.state.children.anan.trees[0].skills.reduce((n,s)=>n+s.reviews,0);
 const first=tasks.data.tasks[0];
 let sub=await req('dad|dad@example.com','POST','submit-practice',{taskId:first.id,clientEventId:'evt-v22-first-0001',minutes:first.minutes,note:'安安独立完成，袋口打结牢固'});assert.equal(sub.r.status,202);assert.equal(sub.data.submission.status,'pending');
 let again=await req('dad|dad@example.com','POST','submit-practice',{taskId:first.id,clientEventId:'evt-v22-first-0001',minutes:first.minutes});assert.equal(again.data.duplicate,true);
 let afterSubmit=await req('dad|dad@example.com');assert.equal(afterSubmit.data.state.children.anan.xp,xp0);assert.equal(afterSubmit.data.state.children.anan.coins,coins0);
 let pending=await req('mom|mom@example.com','GET','pending-approvals');assert.equal(pending.data.items.length,1);assert.equal(pending.data.items[0].skillName,first.skillName);
 let ledger=await req('mom|mom@example.com','GET','reward-ledger');assert.equal(ledger.data.entries.length,0);
 let approved=await req('mom|mom@example.com','POST','review-practice',{submissionId:sub.data.submission.id,decision:'approve'});assert.equal(approved.r.status,200);assert.equal(approved.data.decision,'approved');assert.ok(approved.data.state.children.anan.xp>xp0);assert.ok(approved.data.state.children.anan.coins>coins0);
 let reviews=await req('mom|mom@example.com','GET','reviews');assert.equal(reviews.data.events.length,1);
 ledger=await req('mom|mom@example.com','GET','reward-ledger');assert.equal(ledger.data.entries.length,1);assert.equal(ledger.data.entries[0].kind,'practice-approved');
 // Reject the second task and confirm no reward is granted and task returns to pending.
 tasks=await req('dad|dad@example.com','GET','daily-tasks',undefined,`child=anan&date=${date}`);const second=tasks.data.tasks.find(t=>t.status==='pending');
 sub=await req('dad|dad@example.com','POST','submit-practice',{taskId:second.id,clientEventId:'evt-v22-second-0002',minutes:second.minutes,note:'只试了一半'});assert.equal(sub.data.submission.status,'pending');
 let rejected=await req('mom|mom@example.com','POST','review-practice',{submissionId:sub.data.submission.id,decision:'reject',reason:'还没有独立完成，请再练一次'});assert.equal(rejected.data.decision,'rejected');
 tasks=await req('dad|dad@example.com','GET','daily-tasks',undefined,`child=anan&date=${date}`);assert.equal(tasks.data.tasks.find(t=>t.id===second.id).status,'pending');
 ledger=await req('mom|mom@example.com','GET','reward-ledger');assert.equal(ledger.data.entries.length,1);
 // Resubmit second + third and approve both.
 for(const t of tasks.data.tasks.filter(t=>t.status!=='done')){
   const sid=`evt-v22-${t.id}-ok`;
   const s=await req('dad|dad@example.com','POST','submit-practice',{taskId:t.id,clientEventId:sid,minutes:t.minutes,note:'第二次独立完成'});assert.equal(s.r.status,202);
   const a=await req('mom|mom@example.com','POST','review-practice',{submissionId:s.data.submission.id,decision:'approve'});assert.equal(a.data.decision,'approved');
 }
 tasks=await req('dad|dad@example.com','GET','daily-tasks',undefined,`child=anan&date=${date}`);assert.equal(tasks.data.tasks.filter(t=>t.status==='done').length,3);
 let reward=await req('mom|mom@example.com','POST','claim-daily-reward',{childKey:'anan',date});assert.equal(reward.r.status,200);assert.equal(reward.data.reward.coins,30);assert.equal(reward.data.reward.gems,1);
 ledger=await req('mom|mom@example.com','GET','reward-ledger');assert.equal(ledger.data.entries.length,4);assert.ok(ledger.data.entries.some(e=>e.kind==='daily-chest'));
 const sum={xp:ledger.data.entries.reduce((n,e)=>n+e.xp,0),coins:ledger.data.entries.reduce((n,e)=>n+e.coins,0),gems:ledger.data.entries.reduce((n,e)=>n+e.gems,0)};
 await stop();await start();
 pending=await req('mom|mom@example.com','GET','pending-approvals');assert.equal(pending.data.items.length,0);
 ledger=await req('mom|mom@example.com','GET','reward-ledger');assert.equal(ledger.data.entries.length,4);
 const finalState=await req('mom|mom@example.com');const reviewsFinal=finalState.data.state.children.anan.trees[0].skills.reduce((n,s)=>n+s.reviews,0);assert.equal(reviewsFinal,reviews0+3);
 console.log('V22_VERIFIED_PRACTICE_PASS');
 console.log(JSON.stringify({firstTask:first.skillName,approvalRequired:true,rejectedDoesNotReward:true,approvedReviews:3,ledgerEntries:ledger.data.entries.length,ledgerRewardSum:sum,restartPersistence:true,finalVersion:finalState.data.version},null,2));
}finally{await stop();rmSync(dir,{recursive:true,force:true})}
