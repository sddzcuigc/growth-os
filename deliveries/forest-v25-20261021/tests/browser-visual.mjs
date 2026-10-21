import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
const output=fileURLToPath(new URL('../evidence/',import.meta.url));
export async function run(page,{baseURL='http://127.0.0.1:18923'}={}){
  await mkdir(output,{recursive:true});const browser=page.context().browser(),contexts=[];
  const errors=[],report={status:'RUNNING',checks:[],deviceMode:'Edge desktop with 1440px, 820px and 360/390px viewports; mobile devices are emulated'};
  try{
    for(const [name,width,height] of[['desktop',1440,1080],['tablet',820,1180],['phone',390,844]]){
      const ctx=await browser.newContext({viewport:{width,height},reducedMotion:'reduce',hasTouch:name!=='desktop',isMobile:name!=='desktop'});contexts.push(ctx);
      const p=await ctx.newPage();p.on('pageerror',e=>errors.push(String(e)));await p.goto(baseURL+'/?devUser=visual-'+Date.now());
      await p.waitForFunction(()=>document.getElementById('syncBadge')?.textContent.startsWith('已同步'));
      await p.locator('.hero-art').evaluate(img=>img.decode());
      assert.equal(await p.evaluate(()=>getComputedStyle(document.body).backgroundColor),'rgb(246, 245, 237)');
      assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,name+' page overflow');
      await p.screenshot({path:output+'/v24-'+name+'-home.png'});
      await p.locator('[data-skill]:visible').first().click();
      await p.waitForFunction(()=>document.getElementById('skillSheet').open);
      await p.keyboard.press('Tab');assert.ok(await p.locator('#skillSheet').evaluate(el=>el.contains(document.activeElement)));
      await p.keyboard.press('Escape');await p.waitForFunction(()=>!document.getElementById('skillSheet').open&&document.getElementById('skillSheet').getAttribute('aria-hidden')==='true');
      await p.locator('.hero-actions [data-open-roadmap]').click();
      await p.locator('.route-stages').waitFor();
      assert.ok(await p.locator('#roadmapDialog').evaluate(el=>el.contains(document.activeElement)));
      await p.screenshot({path:output+'/v24-'+name+'-routes.png'});
      await p.locator('[data-skill-guide="life-list"]').click();
      await p.getByRole('heading',{name:'动手怎么做'}).waitFor();
      assert.ok(await p.locator('.roadmap-steps li').count()>=5);
      const colors=await p.locator('[data-add-skill]').evaluate(el=>({foreground:getComputedStyle(el).color,background:getComputedStyle(el).backgroundColor}));
      const luminance=color=>color.match(/[\d.]+/g).slice(0,3).map(Number).map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4}).reduce((n,v,i)=>n+v*[.2126,.7152,.0722][i],0);
      const a=luminance(colors.foreground),b=luminance(colors.background);assert.ok((Math.max(a,b)+.05)/(Math.min(a,b)+.05)>=4.5,'primary action text contrast');
      await p.screenshot({path:output+'/v24-'+name+'-skill-guide.png'});
      await p.keyboard.press('Escape');assert.equal(await p.locator('#roadmapDialog').evaluate(el=>el.open),false);
      await p.locator('[data-open-project="family-lunch"]').click();await p.locator('[data-start-project="family-lunch"]').waitFor();
      await p.locator('[data-start-project="family-lunch"]').click();
      await p.locator('#projectResult').fill('自己核对了采购清单，成人示范后完成了一次尝试。');
      await p.locator('#projectReflection').fill('下一次想独立比较两种商品的单位价格。');
      await p.locator('[data-save-attempt]').click();await p.locator('#roadmapContent').getByText('自己核对了采购清单，成人示范后完成了一次尝试。',{exact:true}).waitFor();
      await p.screenshot({path:output+'/v24-'+name+'-project.png'});
      await p.keyboard.press('Escape');
      for(const view of['forest','review','atlas','parent']){
        await p.locator(`[data-view="${view}"]:visible`).first().click();await p.waitForFunction(v=>document.getElementById('view-'+v).classList.contains('on'),view);
        assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,name+' '+view+' overflow');
        if(view==='forest'||view==='parent')await p.screenshot({path:output+'/v24-'+name+'-'+view+'.png'});
      }
      if(name==='phone'){
        await p.setViewportSize({width:360,height:800});await p.locator('[data-view="home"]:visible').first().click();
        assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'360px overflow');
        const reduced=await p.locator('.tree-stage img').first().evaluate(el=>getComputedStyle(el).animationName);assert.equal(reduced,'none');
        await p.screenshot({path:output+'/v24-phone-360-home.png'});
      }
      report.checks.push(name+': artwork and stylesheet loaded, all views fit, route and project entry work, result saved, modal keyboard focus and Escape work');
    }
    assert.deepEqual(errors,[]);report.status='PASS';report.at=new Date().toISOString();await writeFile(output+'/visual-design.json',JSON.stringify(report,null,2));return report;
  }catch(error){report.status='FAIL';report.error=String(error.stack||error);report.pageErrors=errors;await writeFile(output+'/visual-design.json',JSON.stringify(report,null,2));throw error}
  finally{await Promise.all(contexts.map(c=>c.close()))}
}
