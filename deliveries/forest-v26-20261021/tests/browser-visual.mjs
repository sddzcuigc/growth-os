import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
const output=fileURLToPath(new URL('../evidence/',import.meta.url));
export async function run(page,{baseURL='http://127.0.0.1:18923'}={}){
  await mkdir(output,{recursive:true});const browser=page.context().browser(),contexts=[],errors=[],report={status:'RUNNING',checks:[],deviceMode:'Edge; 1440/1024/820/390/360px viewports; physical devices not certified'};
  try{
    for(const [name,width,height]of[['desktop',1440,1080],['tablet',820,1180],['phone',390,844]]){
      const ctx=await browser.newContext({viewport:{width,height},hasTouch:name!=='desktop',isMobile:name!=='desktop',reducedMotion:'reduce'});contexts.push(ctx);const p=await ctx.newPage();p.on('pageerror',e=>errors.push(e.stack||String(e)));
      await p.goto(baseURL+'/?devUser=themes-'+name+'-'+Date.now());await p.waitForFunction(()=>document.getElementById('syncBadge')?.textContent.startsWith('已同步'));
      await p.waitForFunction(()=>document.querySelectorAll('#projectCollection .project-tile').length===8);
      assert.deepEqual(await p.locator('.nav>button').evaluateAll(nodes=>nodes.map(n=>n.dataset.view)),['home','forest','projects','growth']);
      assert.equal(await p.locator('#view-home .card').count(),2);assert.equal(await p.locator('#view-home .forest').count(),0);assert.equal(await p.locator('#view-home .next-reward').count(),0);
      const records=await p.evaluate(()=>JSON.stringify(JSON.parse(localStorage.getItem('cui-growth-game-v21-state')).children));
      for(const theme of['forest','blocks']){
        await p.locator('#themeSelect').selectOption(theme);await p.locator('.hero-art').evaluate(img=>img.decode());
        assert.equal(await p.evaluate(()=>document.documentElement.dataset.theme),theme);assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,theme+' '+name+' overflow');
        if(theme==='blocks')assert.ok((await p.locator('.hero-art').getAttribute('src')).includes('voxel-world.svg'));
        await p.screenshot({path:output+'/v26-'+theme+'-'+name+'-home.png',fullPage:name==='desktop'});
      }
      assert.equal(await p.evaluate(()=>JSON.stringify(JSON.parse(localStorage.getItem('cui-growth-game-v21-state')).children)),records,'theme changed child records');
      await p.reload();await p.waitForFunction(()=>document.getElementById('syncBadge')?.textContent.startsWith('已同步'));assert.equal(await p.locator('#themeSelect').inputValue(),'blocks');
      await p.evaluate(async()=>{await navigator.serviceWorker.ready});await p.waitForFunction(()=>!!navigator.serviceWorker.controller);await ctx.setOffline(true);await p.reload({waitUntil:'domcontentloaded'});await p.locator('.hero-art').evaluate(img=>img.decode());
      assert.equal(await p.locator('#themeSelect').inputValue(),'blocks');await p.locator('#themeSelect').selectOption('forest');await p.locator('.hero-art').evaluate(img=>img.decode());await ctx.setOffline(false);
      report.checks.push(name+': four main tabs; three home sections; both themes render, persist, work offline and preserve child records');
      await p.locator('.hero-actions [data-open-roadmap]').click();await p.locator('[data-skill-guide="life-list"]').click();await p.getByRole('heading',{name:'动手怎么做'}).waitFor();assert.ok(await p.locator('.roadmap-steps li').count()>=5);
      await p.screenshot({path:output+'/v26-'+name+'-skill-guide.png'});await p.keyboard.press('Escape');
      await p.locator('[data-view="projects"]:visible').first().click();await p.locator('#projectCollection [data-open-project="family-lunch"]').click();await p.locator('[data-start-project="family-lunch"]').click();
      await p.locator('#projectResult').fill('自己核对了采购清单，成人示范后完成了一次尝试。');await p.locator('#projectReflection').fill('下次练习比较单位价格。');await p.locator('[data-save-attempt]').click();await p.locator('#roadmapContent').getByText('自己核对了采购清单，成人示范后完成了一次尝试。',{exact:true}).waitFor();await p.keyboard.press('Escape');
      await p.locator('[data-view="forest"]:visible').first().click();await p.locator('#themeSelect').selectOption('blocks');for(const img of await p.locator('.tree-stage img').all())await img.evaluate(el=>el.decode());
      for(const tree of await p.locator('#forestWorld .zone').all())assert.notEqual(await tree.evaluate(el=>getComputedStyle(el).display),'none');
      await p.screenshot({path:output+'/v26-blocks-'+name+'-skills.png'});await p.locator('#forestWorld [data-skill]:visible').first().click();await p.keyboard.press('Tab');assert.ok(await p.locator('#skillSheet').evaluate(el=>el.open&&el.contains(document.activeElement)));await p.keyboard.press('Escape');
      await p.locator('[data-view="growth"]:visible').first().click();assert.equal(await p.locator('#growthMilestones').isVisible(),false);await p.locator('.growth-details>summary').click();assert.ok(await p.locator('#growthMilestones').isVisible());assert.ok(await p.locator('#dailyChestButton').isVisible());
      await p.locator('[data-view="parent"]:visible').first().click();assert.equal(await p.locator('.settings-group').count(),5);assert.equal(await p.locator('.settings-group[open]').count(),1);await p.locator('.settings-group>summary').filter({hasText:'备份与技能管理'}).click();assert.ok(await p.locator('#importInput').count());assert.ok(await p.locator('#exportBtn').isVisible());
      for(const view of['home','forest','projects','growth','parent']){await p.locator(`[data-view="${view}"]:visible`).first().click();assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,name+' '+view+' overflow')}
      if(name==='tablet'){
        await p.setViewportSize({width:1024,height:900});await p.locator('[data-view="forest"]:visible').first().click();for(const tree of await p.locator('#forestWorld .zone').all())assert.notEqual(await tree.evaluate(el=>getComputedStyle(el).display),'none');assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);await p.screenshot({path:output+'/v26-blocks-1024-skills.png'});
      }
      if(name==='phone'){
        await p.setViewportSize({width:360,height:800});await p.locator('[data-view="home"]:visible').first().click();assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);const box=await p.locator('.hero-actions [data-open-roadmap]').boundingBox();assert.ok(box.y+box.height<800,'primary action below phone first screen');await p.screenshot({path:output+'/v26-blocks-360-home.png'});
      }
      report.checks.push(name+': skill instructions, all eight project entries, actual project result, themed trees, keyboard dialog, growth rewards and grouped settings work');
    }
    assert.deepEqual(errors,[]);report.status='PASS';report.at=new Date().toISOString();await writeFile(output+'/visual-design.json',JSON.stringify(report,null,2));return report;
  }catch(error){report.status='FAIL';report.error=error.stack||String(error);report.pageErrors=errors;await writeFile(output+'/visual-design.json',JSON.stringify(report,null,2));throw error}
  finally{await Promise.all(contexts.map(c=>c.close()))}
}
