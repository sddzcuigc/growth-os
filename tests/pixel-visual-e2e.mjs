import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const BASE_URL = process.env.GROWTH_OS_URL || 'https://growth-os-ten-pearl.vercel.app/';
const OUT_DIR = path.resolve('artifacts/pixel-visual-e2e');
await fs.mkdir(OUT_DIR, { recursive: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 430, height: 932 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
  locale: 'zh-CN'
});
const page = await context.newPage();
const errors = [];
page.on('pageerror', error => errors.push(`pageerror: ${error.message}`));
page.on('console', message => { if (message.type() === 'error') errors.push(`console: ${message.text()}`); });
page.on('requestfailed', request => errors.push(`requestfailed: ${request.url()} :: ${request.failure()?.errorText || 'unknown'}`));

function assert(condition, message, details = {}) {
  if (!condition) throw new Error(`${message}\n${JSON.stringify(details, null, 2)}`);
}

try {
  await page.goto(`${BASE_URL}?pixelqa=${Date.now()}`, { waitUntil: 'networkidle', timeout: 90_000 });
  await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });
  await page.reload({ waitUntil: 'networkidle', timeout: 90_000 });
  await page.waitForSelector('.coach-task-card', { timeout: 30_000 });

  const visual = await page.evaluate(() => {
    const style = selector => getComputedStyle(document.querySelector(selector));
    const card = style('.coach-task-card');
    const nav = style('nav');
    const navButton = style('nav button');
    const header = style('header');
    const hero = style('.coach-hero');
    return {
      version: document.querySelector('.version')?.textContent?.trim() || '',
      taskCards: document.querySelectorAll('.coach-task-card').length,
      pixelStylesheetLoaded: [...document.styleSheets].some(sheet => String(sheet.href || '').includes('coach-pixel-v72.css')),
      card: {
        radius: card.borderTopLeftRadius,
        border: card.borderTopWidth,
        background: card.backgroundImage,
        shadow: card.boxShadow
      },
      nav: {
        display: nav.display,
        columns: nav.gridTemplateColumns,
        border: nav.borderTopWidth,
        background: nav.backgroundImage,
        buttons: document.querySelectorAll('nav button').length
      },
      navButton: {
        radius: navButton.borderTopLeftRadius,
        border: navButton.borderTopWidth,
        background: navButton.backgroundImage
      },
      header: {
        borderBottom: header.borderBottomWidth,
        background: header.backgroundImage,
        backdrop: header.backdropFilter
      },
      hero: {
        radius: hero.borderTopLeftRadius,
        border: hero.borderTopWidth,
        background: hero.backgroundImage
      }
    };
  });

  assert(visual.version.includes('V7.2'), '生产站点没有加载V7.2', visual);
  assert(visual.pixelStylesheetLoaded, '方块像素样式表没有加载', visual);
  assert(visual.taskCards === 3, '首页没有3条智能推荐', visual);
  assert(parseFloat(visual.card.radius) <= 2, '任务卡仍是圆角SaaS风', visual.card);
  assert(parseFloat(visual.card.border) >= 4, '任务卡没有方块粗边框', visual.card);
  assert(visual.card.background.includes('repeating-linear-gradient'), '任务卡没有像素材质', visual.card);
  assert(visual.nav.display === 'grid' && visual.nav.buttons === 5, '背包式底栏结构错误', visual.nav);
  assert(parseFloat(visual.nav.border) >= 4, '底栏没有像素粗边框', visual.nav);
  assert(visual.nav.background.includes('repeating-linear-gradient'), '底栏没有木质背包纹理', visual.nav);
  assert(parseFloat(visual.navButton.radius) <= 2 && parseFloat(visual.navButton.border) >= 4, '底栏格子仍是普通现代按钮', visual.navButton);
  assert(parseFloat(visual.header.borderBottom) >= 5, '顶部栏没有方块层次', visual.header);
  assert(parseFloat(visual.hero.radius) <= 2 && parseFloat(visual.hero.border) >= 4, '首页主面板没有像素直角结构', visual.hero);

  await page.screenshot({ path: path.join(OUT_DIR, '01-home-pixel.png'), fullPage: true });

  await page.locator('[data-explain-task]').first().click();
  assert(await page.locator('.coach-score-bars:not([hidden])').count() === 1, '推荐理由无法展开');
  await page.screenshot({ path: path.join(OUT_DIR, '02-recommendation-reason.png'), fullPage: true });

  await page.locator('nav button[data-page="profile"]').click();
  await page.waitForSelector('#profile.active .coach-profile-card');
  const profileRadius = await page.locator('.coach-profile-card').evaluate(node => getComputedStyle(node).borderTopLeftRadius);
  assert(parseFloat(profileRadius) <= 2, '角色档案仍是圆角SaaS风', { profileRadius });
  await page.screenshot({ path: path.join(OUT_DIR, '03-profile-pixel.png'), fullPage: true });

  await page.locator('nav button[data-page="home"]').click();
  await page.waitForSelector('#home.active .coach-task-card');
  await page.locator('[data-accept-task]').first().click();
  await page.waitForSelector('#workflow.active .coach-workflow-intro', { timeout: 8_000 });
  assert(await page.locator('#coachWorkflowFeedback').count() >= 1, '任务卷轴缺少反馈入口');
  await page.screenshot({ path: path.join(OUT_DIR, '04-workflow-pixel.png'), fullPage: true });

  const report = {
    ok: errors.length === 0,
    checkedAt: new Date().toISOString(),
    baseUrl: BASE_URL,
    visual,
    errors
  };
  await fs.writeFile(path.join(OUT_DIR, 'report.json'), JSON.stringify(report, null, 2));
  if (errors.length) throw new Error(`浏览器捕获到错误：\n${errors.join('\n')}`);
  console.log(JSON.stringify(report, null, 2));
} catch (error) {
  await page.screenshot({ path: path.join(OUT_DIR, 'failure.png'), fullPage: true }).catch(() => {});
  await fs.writeFile(path.join(OUT_DIR, 'report.json'), JSON.stringify({ ok: false, checkedAt: new Date().toISOString(), baseUrl: BASE_URL, errors, failure: error.stack || error.message }, null, 2));
  console.error(error.stack || error.message);
  process.exitCode = 1;
} finally {
  await browser.close();
}
