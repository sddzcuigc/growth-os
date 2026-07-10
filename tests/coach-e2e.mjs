import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const BASE_URL = process.env.GROWTH_OS_URL || 'https://growth-os-ten-pearl.vercel.app/';
const OUT_DIR = path.resolve('artifacts/coach-e2e');
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
const steps = [];

page.on('pageerror', error => errors.push(`pageerror: ${error.message}`));
page.on('console', message => { if (message.type() === 'error') errors.push(`console: ${message.text()}`); });
page.on('requestfailed', request => errors.push(`requestfailed: ${request.url()} :: ${request.failure()?.errorText || 'unknown'}`));

async function snap(label) {
  const state = await page.evaluate(() => ({
    route: sessionStorage.getItem('growthOSCoachRoute'),
    active: [...document.querySelectorAll('.page.active')].map(node => node.id),
    cards: document.querySelectorAll('.coach-task-card').length,
    version: document.querySelector('.version')?.textContent?.trim() || '',
    child: window.GrowthFamily?.getActiveId?.() || '',
    taskTitle: document.querySelector('.coach-task-card h3')?.textContent?.trim() || '',
    modal: document.getElementById('modal')?.classList.contains('open') || false,
    profileComplete: Boolean(JSON.parse(localStorage.getItem('growthOS') || '{}')?.coachProfile?.onboardingComplete),
    completedFeedback: (JSON.parse(localStorage.getItem('growthOS') || '{}')?.coachProfile?.history || []).filter(item => item.type === 'completed').length
  }));
  steps.push({ label, ...state });
  await page.screenshot({ path: path.join(OUT_DIR, `${String(steps.length).padStart(2, '0')}-${label}.png`), fullPage: true });
  return state;
}

function assert(condition, message, state) {
  if (!condition) throw new Error(`${message}\nstate=${JSON.stringify(state || {})}`);
}

try {
  await page.goto(`${BASE_URL}?coachqa=${Date.now()}`, { waitUntil: 'networkidle', timeout: 90_000 });
  await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });
  await page.reload({ waitUntil: 'networkidle', timeout: 90_000 });
  await page.waitForSelector('.coach-task-card', { timeout: 30_000 });

  let state = await snap('home-initial');
  assert(state.version.includes('V7.0'), '未加载V7.0', state);
  assert(state.route === 'home' && state.active.length === 1 && state.active[0] === 'home', '首页路由错误', state);
  assert(state.cards === 3, '首页不是3条推荐', state);

  const firstTitle = state.taskTitle;
  await page.locator('[data-explain-task]').first().click();
  const scoreVisible = await page.locator('.coach-score-bars:not([hidden])').count();
  assert(scoreVisible === 1, '推荐理由评分没有展开');
  await snap('recommendation-explanation');

  await page.locator('#coachStartOnboarding').click();
  state = await snap('onboarding-open');
  assert(state.modal, '画像校准弹窗未打开', state);
  await page.locator('[data-coach-strength]').first().click();
  await page.locator('[data-coach-challenge]').first().click();
  await page.locator('#coachMinutes').selectOption('20');
  await page.locator('#coachSaveProfile').click();
  await page.waitForSelector('.coach-task-card');
  state = await snap('onboarding-saved');
  assert(!state.modal && state.profileComplete, '画像校准未保存', state);
  assert(state.cards === 3, '校准后推荐数量错误', state);

  await page.locator('[data-accept-task]').first().click();
  await page.waitForSelector('#workflow.active');
  state = await snap('task-accepted');
  assert(state.route === 'workflow' && state.active[0] === 'workflow', '接受任务后没有进入执行页', state);
  assert(await page.locator('.task-step').count() >= 4, '推荐任务没有生成完整步骤');
  assert(await page.locator('.coach-workflow-intro').count() === 1, '执行页缺少推荐依据');

  await page.locator('[data-step-check="0"]').check();
  await page.waitForTimeout(150);
  state = await snap('workflow-progress');
  assert(state.active[0] === 'workflow', '勾选步骤后乱跳页面', state);

  await page.locator('#coachWorkflowFeedback').click();
  state = await snap('feedback-open');
  assert(state.modal, '任务反馈弹窗未打开', state);
  await page.locator('[data-rating-group="enjoyment"] button[data-rating-value="5"]').click();
  await page.locator('[data-rating-group="independence"] button[data-rating-value="4"]').click();
  await page.locator('[data-rating-group="difficulty"] button[data-rating-value="3"]').click();
  await page.locator('#coachFeedbackNote').fill('孩子主动投入，遇到一个卡点后只提示一次就继续完成，并主动向家人解释结果。');
  await page.locator('#coachSubmitFeedback').click();
  await page.waitForSelector('#home.active .coach-task-card');
  state = await snap('feedback-saved-home');
  assert(state.route === 'home' && state.active[0] === 'home', '反馈后没有回到推荐首页', state);
  assert(state.completedFeedback === 1, '任务反馈没有写入动态画像', state);
  assert(state.cards === 3, '反馈后没有重新生成3条推荐', state);

  await page.locator('nav button[data-page="profile"]').click();
  await page.waitForSelector('#profile.active .coach-talent-list');
  state = await snap('dynamic-profile');
  assert(state.route === 'profile' && state.active[0] === 'profile', '画像页路由错误', state);
  assert(await page.locator('.coach-signal-list').count() >= 1, '画像页缺少兴趣信号');

  await page.locator('nav button[data-page="home"]').click();
  await page.waitForSelector('#home.active .coach-task-card');
  const currentChild = (await snap('before-child-switch')).child;
  const targetChild = currentChild === 'brother' ? 'sister' : 'brother';
  await page.locator(`[data-coach-child="${targetChild}"]`).click();
  await page.waitForLoadState('networkidle', { timeout: 90_000 });
  await page.waitForSelector('#home.active .coach-task-card');
  state = await snap('after-child-switch');
  assert(state.child === targetChild, '双孩切换失败', state);
  assert(state.cards === 3, '切换孩子后没有独立推荐', state);
  assert(state.route === 'home', '切换孩子后路由错误', state);

  await page.reload({ waitUntil: 'networkidle', timeout: 90_000 });
  await page.waitForSelector('#home.active .coach-task-card');
  state = await snap('reload-stable');
  assert(state.child === targetChild && state.route === 'home', '刷新后孩子或路由丢失', state);

  const report = { ok: errors.length === 0, baseUrl: BASE_URL, initialRecommendation: firstTitle, steps, errors };
  await fs.writeFile(path.join(OUT_DIR, 'report.json'), JSON.stringify(report, null, 2));
  if (errors.length) throw new Error(`浏览器捕获到错误：\n${errors.join('\n')}`);
  console.log(JSON.stringify({ ok: true, testedStates: steps.length, initialRecommendation: firstTitle }, null, 2));
} catch (error) {
  await page.screenshot({ path: path.join(OUT_DIR, 'failure.png'), fullPage: true }).catch(() => {});
  await fs.writeFile(path.join(OUT_DIR, 'report.json'), JSON.stringify({ ok: false, baseUrl: BASE_URL, steps, errors, failure: error.stack || error.message }, null, 2));
  console.error(error.stack || error.message);
  process.exitCode = 1;
} finally {
  await browser.close();
}
