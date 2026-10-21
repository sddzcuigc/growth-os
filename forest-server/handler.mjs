import { join } from 'node:path';
import { openDatabase } from './database.mjs';
import { authenticate } from './auth.mjs';
import { createStore } from './store.mjs';
const file=join(process.env.DATA_DIR||process.cwd(),'data','growth.sqlite');
const remoteUrl=process.env.TURSO_DATABASE_URL||process.env.LIBSQL_URL||'';
const db=openDatabase({file,remoteUrl,authToken:process.env.TURSO_AUTH_TOKEN||process.env.LIBSQL_AUTH_TOKEN||''});
const database={db,mode:remoteUrl?'remote-libsql':'local-sqlite'};
const store=createStore(db);
export async function handleApi(req,res){
  cors(res);if(req.method==='OPTIONS')return end(res,204,'');
  try{
    const u=await authenticate(req);if(!u.emailVerified)return json(res,403,{error:'请先完成邮箱验证',code:'EMAIL_NOT_VERIFIED'});
    const url=new URL(req.url||'/', 'http://localhost');const action=url.searchParams.get('action')||'state';
    if(req.method==='GET'){
      if(action==='sync'){const value=store.snapshot(u,url.searchParams.get('child'),url.searchParams.get('date'));return json(res,value.exists?200:404,{...value,account:u})}
      if(action==='family')return json(res,200,{family:store.family(u),account:u});
      if(action==='backups')return json(res,200,{backups:store.listBackups(u,Number(url.searchParams.get('limit')||10)),family:store.family(u)});
      if(action==='reviews')return json(res,200,{events:store.listReviewEvents(u,Number(url.searchParams.get('limit')||50)),family:store.family(u)});
      if(action==='daily-tasks')return json(res,200,store.dailyTasks(u,url.searchParams.get('child'),url.searchParams.get('date')));
      if(action==='weekly-report')return json(res,200,store.weeklyReport(u,url.searchParams.get('child'),url.searchParams.get('date')));
      if(action==='pending-approvals')return json(res,200,store.pendingApprovals(u,Number(url.searchParams.get('limit')||50)));
      if(action==='reward-ledger')return json(res,200,store.rewardLedger(u,Number(url.searchParams.get('limit')||50)));
      const v=store.get(u);return json(res,v.exists?200:404,{...v,account:u});
    }
    const body=await readBody(req);
    if(req.method==='POST'){
      if(action==='invite')return json(res,201,store.createInvite(u,body.role));
      if(action==='join')return json(res,200,store.joinInvite(u,body.code));
      if(action==='restore')return json(res,200,store.restore(u,body.version));
      if(action==='review')return json(res,202,store.addReviewEvent(u,body));
      if(action==='complete-task')return json(res,200,store.completeDailyTask(u,body.taskId));
      if(action==='claim-daily-reward')return json(res,200,store.claimDailyReward(u,body.childKey,body.date));
      if(action==='weekly-goal')return json(res,200,store.saveWeeklyGoal(u,body));
      if(action==='submit-practice')return json(res,202,store.submitPractice(u,body));
      if(action==='review-practice')return json(res,200,store.reviewPractice(u,body));
      const v=store.create(u,body.state);return json(res,v.created?201:200,{...v,account:u});
    }
    if(req.method==='PUT'&&action==='state'){
      const v=store.save(u,body.state,Number(body.expectedVersion||0));return json(res,v.conflict?409:200,{...v,account:u});
    }
    return json(res,405,{error:'Method not allowed'});
  }catch(e){const status=Number(e.statusCode||500);if(status>=500)console.error('family-skill-tree-v22',e);return json(res,status,{error:status>=500?'云同步服务暂时不可用':e.message,code:e.code})}
}
export function health(){return{ok:true,service:'cui-growth-v23-multi-device',protocol:23,durable:database.mode==='remote-libsql',database:database.mode,...(!process.env.VERCEL&&process.env.ALLOW_DEV_AUTH==='1'?{stats:store.stats()}:{}),time:new Date().toISOString()}}
async function readBody(req){if(req.body&&typeof req.body==='object')return req.body;let s='';for await(const c of req){s+=c;if(Buffer.byteLength(s,'utf8')>930_000)throw Object.assign(new Error('请求体过大'),{statusCode:413,code:'BODY_TOO_LARGE'})}try{return s?JSON.parse(s):{}}catch{throw Object.assign(new Error('JSON 格式无效'),{statusCode:400,code:'INVALID_JSON'})}}
function cors(r){r.setHeader('access-control-allow-origin','*');r.setHeader('access-control-allow-methods','GET,POST,PUT,OPTIONS');r.setHeader('access-control-allow-headers','authorization,content-type,x-dev-user');r.setHeader('cache-control','no-store');r.setHeader('x-content-type-options','nosniff')}
function json(r,s,p){r.writeHead(s,{'content-type':'application/json; charset=utf-8'});r.end(JSON.stringify(p))}function end(r,s,p){r.writeHead(s);r.end(p)}
export {store,database};
