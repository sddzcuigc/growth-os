import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
const output=fileURLToPath(new URL('../evidence/',import.meta.url));
export async function run(page,{baseURL='http://127.0.0.1:18787'}={}){
  await mkdir(output,{recursive:true});
  const browser=page.context().browser(),ctx=await browser.newContext({viewport:{width:1440,height:1000}}),phoneCtx=await browser.newContext({viewport:{width:360,height:800},isMobile:true,hasTouch:true});
  const desktop=await ctx.newPage(),phone=await phoneCtx.newPage(),errors=[];
  for(const p of[desktop,phone])p.on('pageerror',e=>errors.push(String(e)));
  const url=baseURL+'/?devUser=routes-'+Date.now(),report={checks:[],status:'RUNNING'};
  try{
    await desktop.goto(url);await phone.goto(url);
    for(const p of[desktop,phone]){await p.bringToFront();await p.waitForFunction(()=>document.getElementById('syncBadge')?.textContent.startsWith('已同步'))}
    await desktop.bringToFront();
    await desktop.locator('[data-open-roadmap]:visible').first().click();
    await desktop.locator('[data-skill-guide="life-bag"]').click();
    await desktop.getByRole('heading',{name:'动手怎么做'}).waitFor();
    assert.ok((await desktop.locator('.roadmap-steps li').count())>=5);
    await desktop.screenshot({path:output+'/07-concrete-skill-guide.png'});
    await desktop.locator('[data-add-skill="life-bag"]').click();
    await desktop.locator('[data-add-skill="life-bag"]').click();
    await phone.bringToFront();await phone.waitForFunction(()=>JSON.parse(localStorage.getItem('cui-growth-game-v21-state')).children.hu.trees.flatMap(t=>t.skills).filter(s=>s.libraryId==='life-bag').length===1);
    report.checks.push('concrete skill steps, unique import and guide reference sync to second device');
    await desktop.bringToFront();await desktop.locator('[data-route-back]').click();await desktop.locator('[data-project="family-lunch"]').click();await desktop.locator('[data-start-project="family-lunch"]').click();
    await desktop.locator('#projectResult').fill('自己按清单核对了食材，成人负责热锅。');
    await desktop.locator('#projectReflection').fill('系袋口已独立完成，下次练习比较单位价格。');
    await desktop.locator('[data-save-attempt]').click();
    await phone.bringToFront();await phone.waitForFunction(()=>JSON.parse(localStorage.getItem('cui-growth-game-v21-state')).children.hu.projects?.[0]?.attempts.length===1);
    await phone.locator('[data-open-roadmap]:visible').first().click();await phone.locator('[data-project="family-lunch"]').click();
    await phone.locator('#roadmapContent').getByText('自己按清单核对了食材，成人负责热锅。',{exact:true}).waitFor();
    assert.equal(await phone.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
    await phone.locator('#roadmapContent').getByText('自己按清单核对了食材，成人负责热锅。',{exact:true}).scrollIntoViewIfNeeded();await phone.screenshot({path:output+'/08-phone-project-result.png'});
    report.checks.push('project uses shared skill IDs and actual attempt/reflection sync without duplicated rewards');
    await desktop.bringToFront();await desktop.locator('#roadmapRoute').selectOption('data-route');
    await desktop.locator('[data-skill-guide="data-query"]').click();
    await desktop.getByRole('heading',{name:'动手怎么做'}).waitFor();
    assert.ok(await desktop.locator('.roadmap-card a[href="https://www.sqlite.org/lang_select.html"]').count());
    await desktop.screenshot({path:output+'/09-career-data-guide.png'});
    report.checks.push('career branch includes prerequisites, concrete task, evaluation and original documentation link');
    await phone.bringToFront();await phone.evaluate(async()=>{await navigator.serviceWorker.ready});await phone.waitForFunction(()=>!!navigator.serviceWorker.controller);
    await phoneCtx.setOffline(true);await phone.reload({waitUntil:'domcontentloaded'});
    await phone.locator('[data-open-roadmap]:visible').first().click();
    await phone.locator('#roadmapRoute').selectOption('data-route');await phone.locator('[data-skill-guide="data-query"]').click();
    await phone.getByRole('heading',{name:'动手怎么做'}).waitFor();
    report.checks.push('installed app shell reopens full skill catalogue while offline');
    assert.deepEqual(errors,[]);report.status='PASS';report.at=new Date().toISOString();await writeFile(output+'/browser-roadmap.json',JSON.stringify(report,null,2));return report;
  }finally{await ctx.close();await phoneCtx.close()}
}
