import assert from 'node:assert/strict';
import {chromium} from '@playwright/test';
import {spawn} from 'node:child_process';
import {mkdtemp,readFile,writeFile,mkdir,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url)),dir=await mkdtemp(join(tmpdir(),'forest-parity-')),port=18925,url='http://127.0.0.1:'+port;
const server=spawn(process.execPath,['scripts/dev-server.mjs'],{cwd:root,env:{...process.env,PORT:String(port),DATA_DIR:dir,ALLOW_DEV_AUTH:'0'},stdio:['ignore','pipe','pipe']});
let logs='',browser;server.stdout.on('data',v=>logs+=v);server.stderr.on('data',v=>logs+=v);
const report={status:'RUNNING',mode:'Real application, explicit local-only mode; no development identity or production-login claim',checks:[]},errors=[];
try{
  for(let i=0;i<100;i++){try{if((await fetch(url+'/api/health')).ok)break}catch{}if(server.exitCode!==null)throw Error(logs);await new Promise(r=>setTimeout(r,100));if(i===99)throw Error('Server not ready')}
  browser=await chromium.launch({channel:'msedge',headless:true});const ctx=await browser.newContext({viewport:{width:1440,height:1080},acceptDownloads:true}),p=await ctx.newPage();p.on('pageerror',e=>errors.push(e.stack||String(e)));
  await p.goto(url);await p.locator('#localOnly').click();await p.waitForFunction(()=>document.getElementById('authGate').classList.contains('hidden'));
  const stored=()=>p.evaluate(()=>JSON.parse(localStorage.getItem('cui-growth-game-v21-state')));
  const initialIds=await p.locator('#atlasGrid [data-atlas-id]').evaluateAll(nodes=>nodes.map(n=>n.dataset.atlasId));
  const originalControls=['addSkillBtn','addSkillTop','addTreeBtn','addTreeTop','exportBtn','importInput','openLogin','syncNow','pullCloud','logoutAccount','createInvite','joinFamily','saveWeeklyGoal','dailyChestButton','installBtn'];
  for(const id of originalControls)assert.equal(await p.locator('#'+id).count(),1,'original control '+id);
  await p.locator('[data-view="growth"]:visible').first().click();await p.locator('.growth-details>summary').click();
  for(const id of ['growthReward','growthStreak','growthMilestones','comboChip'])assert.equal(await p.locator('#'+id).isVisible(),true);
  report.checks.push('original controls and restored reward, streak, badges and combo are present');
  await p.locator('[data-view="forest"]:visible').first().click();await p.locator('#addTreeTop').click();await p.locator('#formName').fill('动手项目树');await p.locator('#formTheme').selectOption('pine');await p.locator('#saveEdit').click();
  await p.locator('[data-view="forest"]:visible').first().click();await p.locator('#addSkillTop').click();await p.locator('#formTree').selectOption('0');await p.locator('#formName').fill('按步骤整理工具');await p.locator('#formStory').fill('练完把工具放回原位');await p.locator('#saveEdit').click();
  assert.ok((await stored()).children.hu.trees.some(t=>t.name==='动手项目树'));report.checks.push('skill workspace creates a real tree and skill');
  // Import a valid legacy-shaped backup with more than four skills, then reach the fifth via its tree.
  const backup=await stored();while(backup.children.hu.trees[0].skills.length<5){const n=backup.children.hu.trees[0].skills.length;backup.children.hu.trees[0].skills.push({id:'extra-'+n,name:'具体练习'+n,type:n%2?'ai':'human',reviews:0,minutes:0,last:null,story:'导入的历史技能'})}
  const fifth=backup.children.hu.trees[0].skills[4];await p.locator('[data-view="parent"]:visible').first().click();
  await p.locator('.settings-group>summary').filter({hasText:'备份与技能管理'}).click();await p.locator('#importInput').setInputFiles({name:'旧版成长档案.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(backup))});
  await p.waitForFunction(name=>document.getElementById('atlasGrid').textContent.includes(name),fifth.name);
  await p.locator('[data-view="forest"]:visible').first().click();await p.locator('#forestWorld .tree-skills summary').first().click();
  await p.locator('#forestWorld [data-skill="0:4"]').click();await p.waitForFunction(()=>document.getElementById('skillSheet').open);assert.equal(await p.locator('#skillTitle').textContent(),fifth.name);
  const beforePractice=(await stored()).children.hu.trees[0].skills[4].reviews;await p.locator('#waterSkill').click();
  await p.waitForFunction(n=>JSON.parse(localStorage.getItem('cui-growth-game-v21-state')).children.hu.trees[0].skills[4].reviews===n+1,beforePractice);
  assert.ok((await p.locator('#growthStreak').textContent()).includes('连续成长 1 天'));await p.locator('[data-view="home"]:visible').first().click();await p.locator('[data-view="review"]:visible').first().click();assert.ok((await p.locator('#timelineList').textContent()).includes(fifth.name));
  report.checks.push('legacy backup imports; fifth skill is reachable and practice updates history, fruit rank and dated streak');
  await p.locator('[data-view="parent"]:visible').first().click();const download= p.waitForEvent('download');await p.locator('#exportBtn').click();const downloaded=await download;
  const exported=JSON.parse(await readFile(await downloaded.path(),'utf8'));assert.equal(exported.children.hu.trees[0].skills[4].reviews,beforePractice+1);
  assert.ok(initialIds.every(id=>exported.children.hu.trees.some(t=>t.skills.some(s=>s.id===id))));
  await p.reload();await p.waitForFunction(()=>document.getElementById('authGate').classList.contains('hidden'));assert.equal((await stored()).children.hu.trees[0].skills[4].reviews,beforePractice+1);report.checks.push('export and reload preserve all original skill IDs and new practice');
  await p.locator('[data-view="parent"]:visible').first().click();for(const group of await p.locator('.settings-group').all())if(!await group.evaluate(el=>el.open))await group.locator('summary').first().click();for(const id of ['openLogin','syncNow','pullCloud','createInvite','joinFamily','saveWeeklyGoal','installBtn'])assert.ok(await p.locator('#'+id).isVisible(),id+' reachable in parent tools');
  await p.locator('#openLogin').click();assert.ok(await p.locator('#authGate').isVisible());await p.locator('#localOnly').click();report.checks.push('account login and sync/family/goal/install controls remain reachable');
  await p.locator('[data-view="forest"]:visible').first().click();
  for(const [width,height]of[[1440,1080],[1024,1000],[820,1180],[390,844],[360,800]]){
    await p.setViewportSize({width,height});assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,width+' overflow');
    for(const tree of await p.locator('#forestWorld .zone').all())assert.notEqual(await tree.evaluate(el=>getComputedStyle(el).display),'none',width+' hides tree');
    await p.screenshot({path:join(root,'evidence','v26-parity-'+width+'-skills.png'),fullPage:width===1440});
  }
  report.checks.push('all four trees remain rendered at 1440/1024/820/390/360px; no horizontal page overflow');
  const filePage=await ctx.newPage();await filePage.goto(new URL('../index.html',import.meta.url).href);assert.ok(await filePage.locator('#fileHelp').isVisible());assert.equal(await filePage.locator('.app').isVisible(),false);
  const guide=await ctx.newPage();await guide.goto(new URL('../docs/技能树总览.html',import.meta.url).href);assert.ok((await guide.locator('.entry-note').textContent()).includes('只读课程资料'));assert.equal(await guide.locator('.entry-note a').getAttribute('href'),'../index.html');
  report.checks.push('downloaded HTML gives launcher instructions; read-only guide is clearly separated from the application');
  assert.deepEqual(errors,[]);report.status='PASS';report.at=new Date().toISOString();
}catch(error){report.status='FAIL';report.error=error.stack||String(error);report.pageErrors=errors;throw error}
finally{
  await mkdir(join(root,'evidence'),{recursive:true});await writeFile(join(root,'evidence','feature-parity.json'),JSON.stringify(report,null,2));await browser?.close();server.kill();if(server.exitCode===null)await new Promise(r=>server.once('exit',r));await rm(dir,{recursive:true,force:true});
}
console.log(JSON.stringify(report,null,2));
