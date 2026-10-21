import assert from 'node:assert/strict';
import {chromium} from '@playwright/test';
import {fileURLToPath} from 'node:url';
import {writeFile} from 'node:fs/promises';
const browser=await chromium.launch({channel:'msedge',headless:true});
const output=fileURLToPath(new URL('../evidence/',import.meta.url));
try{
  const desktop=await browser.newPage({viewport:{width:1440,height:1000}});
  await desktop.goto(new URL('../docs/技能树总览.html',import.meta.url).href);
  assert.equal(await desktop.locator('details').count(),72);
  assert.equal(await desktop.locator('.route').count(),11);
  await desktop.screenshot({path:output+'/10-skill-route-overview.png'});
  await desktop.setViewportSize({width:360,height:800});
  await desktop.locator('#skill-life-bag summary').click();
  assert.equal(await desktop.locator('#skill-life-bag').getAttribute('open'),'');
  assert.equal(await desktop.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  await desktop.screenshot({path:output+'/11-phone-offline-skill-card.png'});
  const report={status:'PASS',at:new Date().toISOString(),checks:['file opened with no server or login','72 expandable skill cards and 11 routes','360px layout without horizontal overflow']};
  await writeFile(output+'/overview.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));
}finally{await browser.close()}
