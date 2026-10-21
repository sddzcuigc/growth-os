import { readFile, access } from 'node:fs/promises';
const required=['index.html','manifest.webmanifest','sw.js','src-tauri/tauri.conf.json','src-tauri/Cargo.toml','src-tauri/src/lib.rs','server/handler.mjs','server/store.mjs','server/auth.mjs','api/family-skill-tree-auth.js','api/health.js','tests/backend-roundtrip.mjs','tests/task-engine.mjs','tests/approval-flow.mjs'];
for(const f of required) await access(new URL('../'+f,import.meta.url));
const html=await readFile(new URL('../index.html',import.meta.url),'utf8');
for(const marker of ['系塑料袋','data-view="forest"','manifest.webmanifest','cui-growth-game-v21-state','FIREBASE_CONFIG','forest-sync','Turso','家庭共同管理','createFamilyInvite','restoreVersion','EVENT_QUEUE_KEY','dailyTaskList','completeDailyTask','claimDailyReward','formDifficulty','本周目标与成长报告','loadWeeklyReport','saveWeeklyGoal','待确认的练习','approvalList','reward-ledger','submit-practice','review-practice']) if(!html.includes(marker)) throw new Error('missing '+marker);
const store=await readFile(new URL('../server/store.mjs',import.meta.url),'utf8');
for(const marker of ['family_skill_tree_daily_tasks','family_skill_tree_daily_rewards','dailyTasks(user','completeDailyTask(user','claimDailyReward(user','family_skill_tree_weekly_goals','weeklyReport(user','saveWeeklyGoal(user','family_skill_tree_practice_submissions','family_skill_tree_reward_ledger','submitPractice(user','reviewPractice(user']) if(!store.includes(marker))throw new Error('missing backend '+marker);
const sw=await readFile(new URL('../sw.js',import.meta.url),'utf8');
if(!sw.includes("url.pathname.startsWith('/api/')")||!sw.includes("url.origin!==self.location.origin"))throw new Error('service worker must bypass cloud/API requests');
JSON.parse(await readFile(new URL('../manifest.webmanifest',import.meta.url),'utf8'));
JSON.parse(await readFile(new URL('../src-tauri/tauri.conf.json',import.meta.url),'utf8'));
console.log('V23 multi-device full-stack validation PASS');

const inline=html.match(/<script type="module">([\s\S]*?)<\/script>/)?.[1];if(!inline)throw new Error('missing application module');
const {spawnSync}=await import('node:child_process');const check=spawnSync(process.execPath,['--input-type=module','--check'],{input:inline,encoding:'utf8'});if(check.status)throw new Error(check.stderr);
