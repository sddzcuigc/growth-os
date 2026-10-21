import { createHash, randomBytes } from 'node:crypto';
const MAX_STATE_BYTES=900_000, MAX_BACKUPS=20, INVITE_DAYS=7;
const now=()=>new Date().toISOString();
const norm=e=>String(e||'').trim().toLowerCase();
const sha=v=>createHash('sha256').update(String(v)).digest('hex');
const familyId=()=>`fam_${randomBytes(9).toString('base64url')}`;
const inviteCode=()=>`CGF-${randomBytes(3).toString('hex').toUpperCase()}-${randomBytes(3).toString('hex').toUpperCase()}`;
const taskId=()=>`task_${randomBytes(8).toString('base64url')}`;
const submissionId=()=>`sub_${randomBytes(9).toString('base64url')}`;
const bad=(statusCode,message,code)=>Object.assign(new Error(message),{statusCode,code});
const INTERVAL_DAYS={1:30,2:21,3:14,4:7,5:3};

export function createStore(db){
  db.exec(`
    CREATE TABLE IF NOT EXISTS family_skill_tree_user_states(
      firebase_uid TEXT PRIMARY KEY,email TEXT NOT NULL,email_hash TEXT NOT NULL,data_json TEXT NOT NULL,
      version INTEGER NOT NULL,created_at TEXT NOT NULL,updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS family_skill_tree_families(
      id TEXT PRIMARY KEY,owner_uid TEXT NOT NULL,data_json TEXT NOT NULL,version INTEGER NOT NULL,
      created_at TEXT NOT NULL,updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS family_skill_tree_members(
      family_id TEXT NOT NULL,firebase_uid TEXT NOT NULL UNIQUE,email TEXT NOT NULL,role TEXT NOT NULL,
      created_at TEXT NOT NULL,PRIMARY KEY(family_id,firebase_uid)
    );
    CREATE INDEX IF NOT EXISTS family_skill_tree_members_family ON family_skill_tree_members(family_id,created_at);
    CREATE TABLE IF NOT EXISTS family_skill_tree_family_backups(
      id INTEGER PRIMARY KEY,family_id TEXT NOT NULL,version INTEGER NOT NULL,data_json TEXT NOT NULL,created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS family_skill_tree_family_backups_time ON family_skill_tree_family_backups(family_id,id DESC);
    CREATE TABLE IF NOT EXISTS family_skill_tree_invites(
      code_hash TEXT PRIMARY KEY,family_id TEXT NOT NULL,role TEXT NOT NULL,expires_at TEXT NOT NULL,
      created_by TEXT NOT NULL,created_at TEXT NOT NULL,used_by TEXT,used_at TEXT
    );
    CREATE TABLE IF NOT EXISTS family_skill_tree_review_events(
      id INTEGER PRIMARY KEY,family_id TEXT NOT NULL,client_event_id TEXT NOT NULL UNIQUE,firebase_uid TEXT NOT NULL,
      child_key TEXT NOT NULL,tree_id TEXT NOT NULL,skill_id TEXT NOT NULL,skill_name TEXT NOT NULL,
      minutes INTEGER NOT NULL,occurred_at TEXT NOT NULL,created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS family_skill_tree_review_events_family_time ON family_skill_tree_review_events(family_id,id DESC);
    CREATE TABLE IF NOT EXISTS family_skill_tree_daily_tasks(
      id TEXT PRIMARY KEY,family_id TEXT NOT NULL,task_date TEXT NOT NULL,child_key TEXT NOT NULL,skill_id TEXT NOT NULL,
      task_json TEXT NOT NULL,status TEXT NOT NULL DEFAULT 'pending',completed_at TEXT,created_at TEXT NOT NULL,
      UNIQUE(family_id,task_date,child_key,skill_id)
    );
    CREATE INDEX IF NOT EXISTS family_skill_tree_daily_tasks_lookup ON family_skill_tree_daily_tasks(family_id,task_date,child_key,status);
    CREATE TABLE IF NOT EXISTS family_skill_tree_daily_rewards(
      family_id TEXT NOT NULL,task_date TEXT NOT NULL,child_key TEXT NOT NULL,claimed_at TEXT NOT NULL,
      PRIMARY KEY(family_id,task_date,child_key)
    );
    CREATE TABLE IF NOT EXISTS family_skill_tree_weekly_goals(
      family_id TEXT NOT NULL,week_start TEXT NOT NULL,child_key TEXT NOT NULL,goal_text TEXT NOT NULL,
      target_minutes INTEGER NOT NULL,target_reviews INTEGER NOT NULL,created_by TEXT NOT NULL,updated_at TEXT NOT NULL,
      PRIMARY KEY(family_id,week_start,child_key)
    );
    CREATE TABLE IF NOT EXISTS family_skill_tree_practice_submissions(
      id TEXT PRIMARY KEY,family_id TEXT NOT NULL,client_event_id TEXT NOT NULL UNIQUE,submitted_by_uid TEXT NOT NULL,
      child_key TEXT NOT NULL,tree_id TEXT NOT NULL,skill_id TEXT NOT NULL,skill_name TEXT NOT NULL,minutes INTEGER NOT NULL,
      task_id TEXT,note TEXT NOT NULL,status TEXT NOT NULL DEFAULT 'pending',submitted_at TEXT NOT NULL,
      reviewed_by_uid TEXT,reviewed_at TEXT,reject_reason TEXT
    );
    CREATE INDEX IF NOT EXISTS family_skill_tree_practice_pending ON family_skill_tree_practice_submissions(family_id,status,submitted_at);
    CREATE TABLE IF NOT EXISTS family_skill_tree_reward_ledger(
      id INTEGER PRIMARY KEY,family_id TEXT NOT NULL,child_key TEXT NOT NULL,kind TEXT NOT NULL,
      xp INTEGER NOT NULL DEFAULT 0,coins INTEGER NOT NULL DEFAULT 0,gems INTEGER NOT NULL DEFAULT 0,
      source_type TEXT NOT NULL,source_id TEXT NOT NULL,created_by_uid TEXT NOT NULL,created_at TEXT NOT NULL,
      UNIQUE(family_id,source_type,source_id,kind)
    );
    CREATE INDEX IF NOT EXISTS family_skill_tree_reward_ledger_time ON family_skill_tree_reward_ledger(family_id,id DESC);
  `);

  function validateState(state){
    if(!state||typeof state!=='object'||!state.children||typeof state.children!=='object')throw bad(400,'状态数据格式无效','INVALID_STATE');
    const children=Array.isArray(state.children)?state.children:Object.values(state.children);
    if(children.length<1||children.length>20||children.some(x=>!x||typeof x!=='object'))throw bad(400,'儿童档案格式无效','INVALID_STATE');
    const json=JSON.stringify(state);
    if(Buffer.byteLength(json,'utf8')>MAX_STATE_BYTES)throw bad(413,'状态数据过大','STATE_TOO_LARGE');
    return state;
  }
  const member=uid=>db.prepare('SELECT family_id,firebase_uid,email,role,created_at FROM family_skill_tree_members WHERE firebase_uid=?').get(uid);
  const family=id=>db.prepare('SELECT * FROM family_skill_tree_families WHERE id=?').get(id);
  const legacy=uid=>db.prepare('SELECT * FROM family_skill_tree_user_states WHERE firebase_uid=?').get(uid);
  function members(fid){return db.prepare('SELECT firebase_uid,email,role,created_at FROM family_skill_tree_members WHERE family_id=? ORDER BY CASE role WHEN \'owner\' THEN 0 WHEN \'editor\' THEN 1 ELSE 2 END,created_at').all(fid)}
  function publicFamily(m){if(!m)return null;const f=family(m.family_id);if(!f)return null;return{id:f.id,role:m.role,ownerUid:f.owner_uid,members:members(f.id),version:Number(f.version),updatedAt:f.updated_at}}
  function makeFamily(user,state){
    state=validateState(state); const id=familyId(),t=now();
    db.prepare('INSERT INTO family_skill_tree_families(id,owner_uid,data_json,version,created_at,updated_at) VALUES(?,?,?,1,?,?)').run(id,user.uid,JSON.stringify(state),t,t);
    db.prepare('INSERT INTO family_skill_tree_members(family_id,firebase_uid,email,role,created_at) VALUES(?,?,?,?,?)').run(id,user.uid,norm(user.email),'owner',t);
    return member(user.uid);
  }
  function ensureMembership(user,{create=false,state=null}={}){
    let m=member(user.uid); if(m)return m;
    const old=legacy(user.uid);
    if(old){
      const id=familyId(),t=now();
      db.prepare('INSERT INTO family_skill_tree_families(id,owner_uid,data_json,version,created_at,updated_at) VALUES(?,?,?,?,?,?)').run(id,user.uid,old.data_json,Number(old.version)||1,old.created_at||t,old.updated_at||t);
      db.prepare('INSERT INTO family_skill_tree_members(family_id,firebase_uid,email,role,created_at) VALUES(?,?,?,?,?)').run(id,user.uid,norm(user.email),'owner',t);
      return member(user.uid);
    }
    if(create&&state)return makeFamily(user,state);
    return null;
  }
  function requireMember(user){const m=ensureMembership(user);if(!m)throw bad(404,'这个账号还没有家庭成长数据','FAMILY_NOT_FOUND');return m}
  function requireEditor(user){const m=requireMember(user);if(!['owner','editor'].includes(m.role))throw bad(403,'当前家庭角色没有修改权限','READ_ONLY_MEMBER');return m}
  function backupFamily(fid,f){
    db.prepare('INSERT INTO family_skill_tree_family_backups(family_id,version,data_json,created_at) VALUES(?,?,?,?)').run(fid,Number(f.version),f.data_json,now());
    db.prepare(`DELETE FROM family_skill_tree_family_backups WHERE family_id=? AND id NOT IN (
      SELECT id FROM family_skill_tree_family_backups WHERE family_id=? ORDER BY id DESC LIMIT ?
    )`).run(fid,fid,MAX_BACKUPS);
  }
  function stateResult(m){const f=family(m.family_id);return{exists:true,version:Number(f.version),updatedAt:f.updated_at,state:JSON.parse(f.data_json),family:publicFamily(m)}}
  function childFor(state,key){if(Array.isArray(state.children))return state.children.find(c=>c.id===key||c.key===key||c.name===key);return state.children[key]}
  function allSkills(child){return (child?.trees||[]).flatMap((tree,ti)=>(tree.skills||[]).map((skill,si)=>({skill,tree,ti,si})))}
  function daysSince(iso,dateKey){const end=new Date(`${dateKey}T12:00:00Z`).getTime(),start=new Date(iso||0).getTime();return Number.isFinite(start)?Math.max(0,Math.floor((end-start)/86400000)):999}
  function cleanDate(value){const v=String(value||'').trim();return /^\d{4}-\d{2}-\d{2}$/.test(v)?v:new Date().toISOString().slice(0,10)}
  function taskPayload(childKey,child,item,dateKey,index){
    const d=Math.max(1,Math.min(5,Number(item.skill.difficulty)||3));
    const gap=daysSince(item.skill.last||item.skill.lastReviewedAt||item.skill.createdAt,dateKey),interval=INTERVAL_DAYS[d];
    const overdue=Math.max(0,gap-interval), mastery=Math.min(8,Number(item.skill.reviews||item.skill.reviewCount)||0);
    const age=Number(child.age)||8,minutes=age<=7?8:age<=10?10:12;
    const score=Math.round((gap/interval)*100+overdue*4+(8-mastery)*6+d*3);
    const reason=gap>=interval?`${gap} 天未练，已到 ${interval} 天复习窗口`:`距离建议复习还有 ${Math.max(0,interval-gap)} 天，但熟练度仍可加强`;
    return{id:taskId(),type:'review',childKey,skillId:item.skill.id,skillName:item.skill.name,treeId:item.tree.id,treeName:item.tree.name,difficulty:d,minutes,rewardXP:25+d*5,rewardCoins:3+d,priority:score,reason,rank:index+1};
  }
  function ensureDailyTasks(m,childKey,dateKey){
    dateKey=cleanDate(dateKey);const existing=db.prepare('SELECT id,task_json,status,completed_at FROM family_skill_tree_daily_tasks WHERE family_id=? AND task_date=? AND child_key=? ORDER BY created_at,id').all(m.family_id,dateKey,childKey);
    if(existing.length)return existing.map(row=>({...JSON.parse(row.task_json),id:row.id,status:row.status,completedAt:row.completed_at||null}));
    const f=family(m.family_id),state=JSON.parse(f.data_json),child=childFor(state,childKey);if(!child)throw bad(404,'找不到这个孩子','CHILD_NOT_FOUND');
    const ranked=allSkills(child).map(item=>({item,score:taskPayload(childKey,child,item,dateKey,0).priority})).sort((a,b)=>b.score-a.score).slice(0,Math.min(3,allSkills(child).length));
    const t=now();for(let i=0;i<ranked.length;i++){const payload=taskPayload(childKey,child,ranked[i].item,dateKey,i);db.prepare('INSERT INTO family_skill_tree_daily_tasks(id,family_id,task_date,child_key,skill_id,task_json,status,created_at) VALUES(?,?,?,?,?,?,\'pending\',?)').run(payload.id,m.family_id,dateKey,childKey,payload.skillId,JSON.stringify(payload),t)}
    return db.prepare('SELECT id,task_json,status,completed_at FROM family_skill_tree_daily_tasks WHERE family_id=? AND task_date=? AND child_key=? ORDER BY created_at,id').all(m.family_id,dateKey,childKey).map(row=>({...JSON.parse(row.task_json),id:row.id,status:row.status,completedAt:row.completed_at||null}));
  }
  function saveFamilyState(m,state){const f=family(m.family_id);backupFamily(m.family_id,f);const next=Number(f.version)+1,t=now();db.prepare('UPDATE family_skill_tree_families SET data_json=?,version=?,updated_at=? WHERE id=?').run(JSON.stringify(state),next,t,m.family_id);return{version:next,updatedAt:t}}

  function weekStart(value){const d=value?new Date(`${String(value).slice(0,10)}T12:00:00Z`):new Date();if(Number.isNaN(d.getTime()))return weekStart();const day=d.getUTCDay()||7;d.setUTCDate(d.getUTCDate()-day+1);return d.toISOString().slice(0,10)}
  function weekEnd(start){const d=new Date(`${start}T00:00:00Z`);d.setUTCDate(d.getUTCDate()+7);return d.toISOString()}
  function defaultGoal(child){const age=Number(child?.age)||8;return{goalText:'本周稳定练习，让已经会的技能变得更熟练。',targetMinutes:age<=7?40:age<=10?60:80,targetReviews:age<=7?4:5}}
  function goalFor(m,childKey,start,state){const row=db.prepare('SELECT goal_text,target_minutes,target_reviews,updated_at FROM family_skill_tree_weekly_goals WHERE family_id=? AND week_start=? AND child_key=?').get(m.family_id,start,childKey);const child=childFor(state,childKey),fallback=defaultGoal(child);return row?{goalText:row.goal_text,targetMinutes:Number(row.target_minutes),targetReviews:Number(row.target_reviews),updatedAt:row.updated_at,custom:true}:{...fallback,updatedAt:null,custom:false}}
  function reportFor(m,childKey,start){const f=family(m.family_id),state=JSON.parse(f.data_json),child=childFor(state,childKey);if(!child)throw bad(404,'找不到这个孩子','CHILD_NOT_FOUND');const from=`${start}T00:00:00.000Z`,to=weekEnd(start),goal=goalFor(m,childKey,start,state);const events=db.prepare('SELECT skill_name,minutes,occurred_at FROM family_skill_tree_review_events WHERE family_id=? AND child_key=? AND occurred_at>=? AND occurred_at<? ORDER BY occurred_at').all(m.family_id,childKey,from,to);const minutes=events.reduce((n,e)=>n+Number(e.minutes||0),0),reviews=events.length,uniqueSkills=new Set(events.map(e=>e.skill_name)).size;const toDate=to.slice(0,10);const completedTasks=Number(db.prepare("SELECT COUNT(*) c FROM family_skill_tree_daily_tasks WHERE family_id=? AND child_key=? AND task_date>=? AND task_date<? AND status='done'").get(m.family_id,childKey,start,toDate)?.c||0);const rewardDays=Number(db.prepare('SELECT COUNT(*) c FROM family_skill_tree_daily_rewards WHERE family_id=? AND child_key=? AND task_date>=? AND task_date<?').get(m.family_id,childKey,start,toDate)?.c||0);const bySkill={};for(const ev of events){const k=ev.skill_name;bySkill[k]=bySkill[k]||{name:k,minutes:0,reviews:0};bySkill[k].minutes+=Number(ev.minutes||0);bySkill[k].reviews++}const topSkills=Object.values(bySkill).sort((a,b)=>b.minutes-a.minutes||b.reviews-a.reviews).slice(0,3);const minutePct=Math.min(100,Math.round(minutes/Math.max(1,goal.targetMinutes)*100)),reviewPct=Math.min(100,Math.round(reviews/Math.max(1,goal.targetReviews)*100)),progress=Math.round((minutePct+reviewPct)/2);const all=allSkills(child),least=[...all].sort((a,b)=>Number(a.skill.reviews||0)-Number(b.skill.reviews||0)||daysSince(b.skill.last||b.skill.lastReviewedAt||b.skill.createdAt,start)-daysSince(a.skill.last||a.skill.lastReviewedAt||a.skill.createdAt,start))[0];return{weekStart:start,weekEnd:toDate,childKey,goal,summary:reviews===0?'本周还没有新的浇水记录。':`本周完成 ${reviews} 次练习，共 ${minutes} 分钟，覆盖 ${uniqueSkills} 项技能。`,recommendation:least?`下周优先巩固「${least.skill.name}」，它目前的累计练习相对较少。`:'继续保持稳定练习节奏。',metrics:{minutes,reviews,uniqueSkills,completedTasks,rewardDays,progress,minutePct,reviewPct},topSkills}}

  function ledgerEntry(m,{childKey,kind,xp=0,coins=0,gems=0,sourceType,sourceId,uid}){
    const t=now();
    db.prepare(`INSERT OR IGNORE INTO family_skill_tree_reward_ledger
      (family_id,child_key,kind,xp,coins,gems,source_type,source_id,created_by_uid,created_at)
      VALUES(?,?,?,?,?,?,?,?,?,?)`).run(m.family_id,childKey,kind,Number(xp)||0,Number(coins)||0,Number(gems)||0,sourceType,sourceId,uid,t);
    return t;
  }
  function practiceRow(m,id){return db.prepare('SELECT * FROM family_skill_tree_practice_submissions WHERE id=? AND family_id=?').get(String(id||''),m.family_id)}
  function submitPractice(user,payload={}){
    const m=requireEditor(user),clientId=String(payload.clientEventId||'').trim();
    if(clientId.length<8||clientId.length>128)throw bad(400,'练习记录编号无效','INVALID_EVENT');
    const duplicate=db.prepare('SELECT * FROM family_skill_tree_practice_submissions WHERE client_event_id=?').get(clientId);
    if(duplicate)return{submitted:true,duplicate:true,submission:publicSubmission(duplicate),family:publicFamily(m)};
    const f=family(m.family_id),state=JSON.parse(f.data_json),task=payload.taskId?db.prepare('SELECT * FROM family_skill_tree_daily_tasks WHERE id=? AND family_id=?').get(String(payload.taskId),m.family_id):null;
    if(payload.taskId&&!task)throw bad(404,'找不到这个成长任务','TASK_NOT_FOUND');
    if(task&&task.status==='done')return{submitted:true,duplicate:true,alreadyDone:true,task:{...JSON.parse(task.task_json),status:'done'},family:publicFamily(m)};
    if(task&&task.status==='submitted'){
      const old=db.prepare("SELECT * FROM family_skill_tree_practice_submissions WHERE family_id=? AND task_id=? AND status='pending' ORDER BY submitted_at DESC LIMIT 1").get(m.family_id,task.id);
      if(old)return{submitted:true,duplicate:true,submission:publicSubmission(old),family:publicFamily(m)};
    }
    const childKey=String(task?.child_key||payload.childKey||'').slice(0,64),child=childFor(state,childKey);if(!child)throw bad(404,'找不到这个孩子','CHILD_NOT_FOUND');
    const taskJson=task?JSON.parse(task.task_json):null,skillId=String(task?.skill_id||payload.skillId||'').slice(0,128);
    let found=null;for(const tree of child.trees||[]){const skill=(tree.skills||[]).find(x=>x.id===skillId);if(skill){found={tree,skill};break}}
    if(!found)throw bad(409,'找不到这项技能','TASK_SKILL_MISSING');
    const minutes=Math.max(1,Math.min(180,Number(payload.minutes)||Number(taskJson?.minutes)||10)),id=submissionId(),t=now(),note=String(payload.note||'').trim().slice(0,280);
    db.prepare(`INSERT INTO family_skill_tree_practice_submissions
      (id,family_id,client_event_id,submitted_by_uid,child_key,tree_id,skill_id,skill_name,minutes,task_id,note,status,submitted_at)
      VALUES(?,?,?,?,?,?,?,?,?,?,?,'pending',?)`).run(id,m.family_id,clientId,user.uid,childKey,found.tree.id,found.skill.id,found.skill.name,minutes,task?.id||null,note,t);
    if(task)db.prepare("UPDATE family_skill_tree_daily_tasks SET status='submitted' WHERE id=?").run(task.id);
    return{submitted:true,duplicate:false,submission:publicSubmission(practiceRow(m,id)),family:publicFamily(m)};
  }
  function publicSubmission(r){return{id:r.id,clientEventId:r.client_event_id,submittedByUid:r.submitted_by_uid,childKey:r.child_key,treeId:r.tree_id,skillId:r.skill_id,skillName:r.skill_name,minutes:Number(r.minutes),taskId:r.task_id||null,note:r.note||'',status:r.status,submittedAt:r.submitted_at,reviewedByUid:r.reviewed_by_uid||null,reviewedAt:r.reviewed_at||null,rejectReason:r.reject_reason||''}}
  function listPending(user,limit=50){const m=requireMember(user);limit=Math.max(1,Math.min(100,Number(limit)||50));return db.prepare("SELECT * FROM family_skill_tree_practice_submissions WHERE family_id=? AND status='pending' ORDER BY submitted_at ASC LIMIT ?").all(m.family_id,limit).map(publicSubmission)}
  function reviewPractice(user,payload={}){
    const m=requireEditor(user),row=practiceRow(m,payload.submissionId);if(!row)throw bad(404,'找不到这条待确认练习','SUBMISSION_NOT_FOUND');
    if(row.status!=='pending')return{duplicate:true,decision:row.status,submission:publicSubmission(row),...stateResult(m)};
    const decision=String(payload.decision||'').toLowerCase();if(!['approve','reject'].includes(decision))throw bad(400,'请选择确认或退回','INVALID_DECISION');
    const t=now();
    if(decision==='reject'){
      const reason=String(payload.reason||'').trim().slice(0,240);
      db.prepare("UPDATE family_skill_tree_practice_submissions SET status='rejected',reviewed_by_uid=?,reviewed_at=?,reject_reason=? WHERE id=?").run(user.uid,t,reason,row.id);
      if(row.task_id)db.prepare("UPDATE family_skill_tree_daily_tasks SET status='pending',completed_at=NULL WHERE id=? AND status='submitted'").run(row.task_id);
      return{reviewed:true,decision:'rejected',submission:publicSubmission(practiceRow(m,row.id)),...stateResult(m)};
    }
    const f=family(m.family_id),state=JSON.parse(f.data_json),child=childFor(state,row.child_key);if(!child)throw bad(404,'找不到这个孩子','CHILD_NOT_FOUND');
    let found=null;for(const tree of child.trees||[]){const skill=(tree.skills||[]).find(x=>x.id===row.skill_id);if(skill){found={tree,skill};break}}
    if(!found)throw bad(409,'这项技能已经不存在，无法确认','TASK_SKILL_MISSING');
    const task=row.task_id?db.prepare('SELECT * FROM family_skill_tree_daily_tasks WHERE id=? AND family_id=?').get(row.task_id,m.family_id):null,taskJson=task?JSON.parse(task.task_json):null;
    const xp=Number(taskJson?.rewardXP||35),coins=Number(taskJson?.rewardCoins||5),minutes=Number(row.minutes)||10;
    found.skill.reviews=Number(found.skill.reviews||0)+1;found.skill.minutes=Number(found.skill.minutes||0)+minutes;found.skill.last=t;found.tree.height=Number(found.tree.height||90)+2;child.height=Number(child.height||0)+2;child.xp=Math.min(1000,Number(child.xp||0)+xp);child.coins=Number(child.coins||0)+coins;child.reviewsHistory=Array.isArray(child.reviewsHistory)?child.reviewsHistory:[];child.reviewsHistory.push({skill:found.skill.name,minutes,at:t,source:'approved-practice'});
    const saved=saveFamilyState(m,state);
    db.prepare("UPDATE family_skill_tree_practice_submissions SET status='approved',reviewed_by_uid=?,reviewed_at=? WHERE id=?").run(user.uid,t,row.id);
    if(row.task_id)db.prepare("UPDATE family_skill_tree_daily_tasks SET status='done',completed_at=? WHERE id=?").run(t,row.task_id);
    const evId=`approval-${row.id}`;if(!db.prepare('SELECT id FROM family_skill_tree_review_events WHERE client_event_id=?').get(evId))db.prepare('INSERT INTO family_skill_tree_review_events(family_id,client_event_id,firebase_uid,child_key,tree_id,skill_id,skill_name,minutes,occurred_at,created_at) VALUES(?,?,?,?,?,?,?,?,?,?)').run(m.family_id,evId,user.uid,row.child_key,row.tree_id,row.skill_id,row.skill_name,minutes,t,t);
    ledgerEntry(m,{childKey:row.child_key,kind:'practice-approved',xp,coins,sourceType:'practice-submission',sourceId:row.id,uid:user.uid});
    return{reviewed:true,decision:'approved',reward:{xp,coins,gems:0},submission:publicSubmission(practiceRow(m,row.id)),...saved,state,family:publicFamily(m)};
  }
  function listLedger(user,limit=50){const m=requireMember(user);limit=Math.max(1,Math.min(200,Number(limit)||50));return db.prepare('SELECT id,child_key,kind,xp,coins,gems,source_type,source_id,created_by_uid,created_at FROM family_skill_tree_reward_ledger WHERE family_id=? ORDER BY id DESC LIMIT ?').all(m.family_id,limit).map(r=>({id:Number(r.id),childKey:r.child_key,kind:r.kind,xp:Number(r.xp),coins:Number(r.coins),gems:Number(r.gems),sourceType:r.source_type,sourceId:r.source_id,uid:r.created_by_uid,createdAt:r.created_at}))}

  const api = {
    get(user){const m=ensureMembership(user);return m?stateResult(m):{exists:false}},
    create(user,state){let m=ensureMembership(user);if(!m)m=ensureMembership(user,{create:true,state});else return stateResult(m);return{created:true,...stateResult(m)}},
    save(user,state,expectedVersion=0){
      state=validateState(state);let m=ensureMembership(user);if(!m)m=ensureMembership(user,{create:true,state});
      if(!['owner','editor'].includes(m.role))throw bad(403,'当前家庭角色没有修改权限','READ_ONLY_MEMBER');
      const f=family(m.family_id),cur=Number(f.version);
      if(!Number.isSafeInteger(expectedVersion)||expectedVersion!==cur)return{conflict:true,version:cur,updatedAt:f.updated_at,state:JSON.parse(f.data_json),family:publicFamily(m)};
      const saved=saveFamilyState(m,state);return{created:false,...saved,family:publicFamily(m)};
    },
    family(user){const m=requireMember(user);return publicFamily(m)},
    createInvite(user,role='editor'){
      const m=requireMember(user);if(m.role!=='owner')throw bad(403,'只有家庭管理员可以邀请成员','OWNER_REQUIRED');
      role=role==='viewer'?'viewer':'editor'; const code=inviteCode(),t=now(),exp=new Date(Date.now()+INVITE_DAYS*86400000).toISOString();
      db.prepare('INSERT INTO family_skill_tree_invites(code_hash,family_id,role,expires_at,created_by,created_at) VALUES(?,?,?,?,?,?)').run(sha(code),m.family_id,role,exp,user.uid,t);
      return{code,role,expiresAt:exp,family:publicFamily(m)};
    },
    joinInvite(user,code){
      code=String(code||'').trim().toUpperCase();if(!/^CGF-[0-9A-F]{6}-[0-9A-F]{6}$/.test(code))throw bad(400,'家庭邀请码格式不正确','INVALID_INVITE');
      const inv=db.prepare('SELECT * FROM family_skill_tree_invites WHERE code_hash=?').get(sha(code));if(!inv)throw bad(404,'邀请码不存在','INVITE_NOT_FOUND');
      if(inv.used_by)throw bad(409,'这个邀请码已经使用过','INVITE_USED');if(new Date(inv.expires_at).getTime()<Date.now())throw bad(410,'邀请码已经过期','INVITE_EXPIRED');
      const existing=member(user.uid);if(existing&&existing.family_id!==inv.family_id)throw bad(409,'此账号已经属于另一个家庭','ALREADY_IN_FAMILY');
      const t=now();if(!existing)db.prepare('INSERT INTO family_skill_tree_members(family_id,firebase_uid,email,role,created_at) VALUES(?,?,?,?,?)').run(inv.family_id,user.uid,norm(user.email),inv.role,t);
      db.prepare('UPDATE family_skill_tree_invites SET used_by=?,used_at=? WHERE code_hash=?').run(user.uid,t,sha(code));
      const m=member(user.uid);return{joined:true,...stateResult(m)};
    },
    listBackups(user,limit=10){const m=requireMember(user);limit=Math.max(1,Math.min(20,Number(limit)||10));return db.prepare('SELECT version,created_at FROM family_skill_tree_family_backups WHERE family_id=? ORDER BY id DESC LIMIT ?').all(m.family_id,limit).map(r=>({version:Number(r.version),createdAt:r.created_at}))},
    restore(user,version){
      const m=requireEditor(user),f=family(m.family_id);version=Number(version);const b=db.prepare('SELECT * FROM family_skill_tree_family_backups WHERE family_id=? AND version=? ORDER BY id DESC LIMIT 1').get(m.family_id,version);if(!b)throw bad(404,'找不到这个历史版本','BACKUP_NOT_FOUND');
      backupFamily(m.family_id,f);const next=Number(f.version)+1,t=now();db.prepare('UPDATE family_skill_tree_families SET data_json=?,version=?,updated_at=? WHERE id=?').run(b.data_json,next,t,m.family_id);return{restored:true,fromVersion:version,version:next,updatedAt:t,state:JSON.parse(b.data_json),family:publicFamily(m)};
    },
    addReviewEvent(user,event){
      const m=requireEditor(user);const id=String(event?.clientEventId||'').trim();if(id.length<8||id.length>128)throw bad(400,'复习事件ID无效','INVALID_EVENT');
      const existing=db.prepare('SELECT id FROM family_skill_tree_review_events WHERE client_event_id=?').get(id);if(existing)return{accepted:true,duplicate:true};
      const minutes=Math.max(0,Math.min(600,Number(event.minutes)||0));const childKey=String(event.childKey||'').slice(0,64),treeId=String(event.treeId||'').slice(0,128),skillId=String(event.skillId||'').slice(0,128),skillName=String(event.skillName||'').slice(0,120),occurredAt=String(event.occurredAt||now());
      if(!childKey||!treeId||!skillId||!skillName)throw bad(400,'复习事件字段不完整','INVALID_EVENT');
      db.prepare('INSERT INTO family_skill_tree_review_events(family_id,client_event_id,firebase_uid,child_key,tree_id,skill_id,skill_name,minutes,occurred_at,created_at) VALUES(?,?,?,?,?,?,?,?,?,?)').run(m.family_id,id,user.uid,childKey,treeId,skillId,skillName,minutes,occurredAt,now());
      return{accepted:true,duplicate:false};
    },
    listReviewEvents(user,limit=50){const m=requireMember(user);limit=Math.max(1,Math.min(200,Number(limit)||50));return db.prepare('SELECT client_event_id,firebase_uid,child_key,tree_id,skill_id,skill_name,minutes,occurred_at,created_at FROM family_skill_tree_review_events WHERE family_id=? ORDER BY id DESC LIMIT ?').all(m.family_id,limit).map(r=>({clientEventId:r.client_event_id,uid:r.firebase_uid,childKey:r.child_key,treeId:r.tree_id,skillId:r.skill_id,skillName:r.skill_name,minutes:Number(r.minutes),occurredAt:r.occurred_at,createdAt:r.created_at}))},
    submitPractice(user,payload){return submitPractice(user,payload)},
    pendingApprovals(user,limit=50){return{items:listPending(user,limit),family:publicFamily(requireMember(user))}},
    reviewPractice(user,payload){return reviewPractice(user,payload)},
    rewardLedger(user,limit=50){return{entries:listLedger(user,limit),family:publicFamily(requireMember(user))}},
    dailyTasks(user,childKey,dateKey){const m=requireMember(user),tasks=ensureDailyTasks(m,String(childKey||''),dateKey);const reward=Boolean(db.prepare('SELECT claimed_at FROM family_skill_tree_daily_rewards WHERE family_id=? AND task_date=? AND child_key=?').get(m.family_id,cleanDate(dateKey),String(childKey||'')));return{date:cleanDate(dateKey),childKey,tasks,rewardClaimed:reward,family:publicFamily(m)}},
    completeDailyTask(user,id){
      const m=requireEditor(user);const row=db.prepare('SELECT * FROM family_skill_tree_daily_tasks WHERE id=? AND family_id=?').get(String(id||''),m.family_id);if(!row)throw bad(404,'找不到这个成长任务','TASK_NOT_FOUND');
      if(row.status==='done')return{duplicate:true,...stateResult(m),task:{...JSON.parse(row.task_json),status:'done',completedAt:row.completed_at}};
      const task=JSON.parse(row.task_json),f=family(m.family_id),state=JSON.parse(f.data_json),c=childFor(state,row.child_key);if(!c)throw bad(404,'找不到任务对应的孩子','CHILD_NOT_FOUND');
      let found=null;for(const tree of c.trees||[]){const skill=(tree.skills||[]).find(s=>s.id===row.skill_id);if(skill){found={tree,skill};break}}
      if(!found)throw bad(409,'任务对应技能已经不存在','TASK_SKILL_MISSING');
      const occurredAt=now(),minutes=Number(task.minutes)||10;found.skill.reviews=Number(found.skill.reviews||0)+1;found.skill.minutes=Number(found.skill.minutes||0)+minutes;found.skill.last=occurredAt;found.tree.height=Number(found.tree.height||90)+2;c.height=Number(c.height||0)+2;c.xp=Math.min(1000,Number(c.xp||0)+Number(task.rewardXP||35));c.coins=Number(c.coins||0)+Number(task.rewardCoins||5);c.reviewsHistory=Array.isArray(c.reviewsHistory)?c.reviewsHistory:[];c.reviewsHistory.push({skill:found.skill.name,minutes,at:occurredAt,source:'daily-task'});
      const saved=saveFamilyState(m,state);db.prepare('UPDATE family_skill_tree_daily_tasks SET status=\'done\',completed_at=? WHERE id=?').run(occurredAt,row.id);
      const evId=`task-${row.id}`;if(!db.prepare('SELECT id FROM family_skill_tree_review_events WHERE client_event_id=?').get(evId))db.prepare('INSERT INTO family_skill_tree_review_events(family_id,client_event_id,firebase_uid,child_key,tree_id,skill_id,skill_name,minutes,occurred_at,created_at) VALUES(?,?,?,?,?,?,?,?,?,?)').run(m.family_id,evId,user.uid,row.child_key,found.tree.id,found.skill.id,found.skill.name,minutes,occurredAt,occurredAt);
      return{completed:true,...saved,state,family:publicFamily(m),task:{...task,status:'done',completedAt:occurredAt}};
    },
    claimDailyReward(user,childKey,dateKey){
      const m=requireEditor(user),date=cleanDate(dateKey),key=String(childKey||'');ensureDailyTasks(m,key,date);const pending=Number(db.prepare('SELECT COUNT(*) c FROM family_skill_tree_daily_tasks WHERE family_id=? AND task_date=? AND child_key=? AND status<>\'done\'').get(m.family_id,date,key)?.c||0);if(pending)throw bad(409,'还有成长任务没有完成','TASKS_PENDING');
      const old=db.prepare('SELECT claimed_at FROM family_skill_tree_daily_rewards WHERE family_id=? AND task_date=? AND child_key=?').get(m.family_id,date,key);if(old)return{duplicate:true,...stateResult(m),claimedAt:old.claimed_at};
      const f=family(m.family_id),state=JSON.parse(f.data_json),c=childFor(state,key);if(!c)throw bad(404,'找不到这个孩子','CHILD_NOT_FOUND');c.coins=Number(c.coins||0)+30;c.gems=Number(c.gems||0)+1;const saved=saveFamilyState(m,state),t=now();db.prepare('INSERT INTO family_skill_tree_daily_rewards(family_id,task_date,child_key,claimed_at) VALUES(?,?,?,?)').run(m.family_id,date,key,t);ledgerEntry(m,{childKey:key,kind:'daily-chest',coins:30,gems:1,sourceType:'daily-reward',sourceId:`${date}:${key}`,uid:user.uid});return{claimed:true,...saved,state,family:publicFamily(m),claimedAt:t,reward:{coins:30,gems:1}};
    },
    weeklyReport(user,childKey,dateKey){const m=requireMember(user);return reportFor(m,String(childKey||''),weekStart(dateKey))},
    saveWeeklyGoal(user,payload={}){const m=requireEditor(user),key=String(payload.childKey||''),start=weekStart(payload.weekStart),f=family(m.family_id),state=JSON.parse(f.data_json),child=childFor(state,key);if(!child)throw bad(404,'找不到这个孩子','CHILD_NOT_FOUND');const fallback=defaultGoal(child),text=String(payload.goalText||fallback.goalText).trim().slice(0,160)||fallback.goalText,minutes=Math.max(10,Math.min(600,Number(payload.targetMinutes)||fallback.targetMinutes)),reviews=Math.max(1,Math.min(30,Number(payload.targetReviews)||fallback.targetReviews)),t=now();db.prepare(`INSERT INTO family_skill_tree_weekly_goals(family_id,week_start,child_key,goal_text,target_minutes,target_reviews,created_by,updated_at) VALUES(?,?,?,?,?,?,?,?) ON CONFLICT(family_id,week_start,child_key) DO UPDATE SET goal_text=excluded.goal_text,target_minutes=excluded.target_minutes,target_reviews=excluded.target_reviews,created_by=excluded.created_by,updated_at=excluded.updated_at`).run(m.family_id,start,key,text,minutes,reviews,user.uid,t);return{saved:true,report:reportFor(m,key,start)}},
    stats(){return{families:Number(db.prepare('SELECT COUNT(*) c FROM family_skill_tree_families').get()?.c||0),members:Number(db.prepare('SELECT COUNT(*) c FROM family_skill_tree_members').get()?.c||0),reviews:Number(db.prepare('SELECT COUNT(*) c FROM family_skill_tree_review_events').get()?.c||0),tasks:Number(db.prepare('SELECT COUNT(*) c FROM family_skill_tree_daily_tasks').get()?.c||0),completedTasks:Number(db.prepare("SELECT COUNT(*) c FROM family_skill_tree_daily_tasks WHERE status='done'").get()?.c||0),weeklyGoals:Number(db.prepare('SELECT COUNT(*) c FROM family_skill_tree_weekly_goals').get()?.c||0),pendingApprovals:Number(db.prepare("SELECT COUNT(*) c FROM family_skill_tree_practice_submissions WHERE status='pending'").get()?.c||0),ledgerEntries:Number(db.prepare('SELECT COUNT(*) c FROM family_skill_tree_reward_ledger').get()?.c||0)}}
  };
  api.snapshot=(user,childKey,date)=>{
    const value=api.get(user);if(!value.exists)return value;
    const key=childKey&&childFor(value.state,childKey)?childKey:(value.state.current||Object.keys(value.state.children)[0]);
    return {...value,protocol:23,tasks:api.dailyTasks(user,key,date),report:api.weeklyReport(user,key,date),approvals:api.pendingApprovals(user).items,ledger:api.rewardLedger(user).entries};
  };
  // Confirmation, rewards and family state commit together across server instances.
  for(const name of Object.keys(api)){
    if(name==='stats')continue;
    const operation=api[name];api[name]=(...args)=>db.transaction(()=>operation(...args));
  }
  return api;
}
