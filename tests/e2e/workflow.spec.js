import { test, expect } from "@playwright/test";

const profile = {
  id: "e2e-profile",
  name: "流程测试",
  age: "9岁",
  avatar: "boy",
  baseTemplate: "brother",
  consentGranted: true,
  consentVersion: "child-data-v1"
};

test.use({ viewport: { width: 430, height: 932 }, deviceScaleFactor: 1 });

test("new child follows one growth loop and uses real economy", async ({ page }) => {
  await page.route("**/api/account", (route) => route.fulfill({
    contentType: "application/json",
    body: JSON.stringify({ email: "workflow@test.local", profiles: [profile], recoveryConfigured: true })
  }));
  await page.route("**/api/progress?profileId=e2e-profile", (route) => route.fulfill({
    contentType: "application/json",
    body: JSON.stringify({ data: {}, memories: [] })
  }));
  await page.route("**/api/goals?profileId=e2e-profile", (route) => route.fulfill({
    contentType: "application/json",
    body: JSON.stringify({ goals: [{ id: 1, title: "我想做出自己的作品", objective: "把喜欢的搭建变成看得见的作品", why: "这是我真正愿意探索的方向", successSignal: "四周完成3次练习并展示1件作品", firstExperiment: "用10分钟搭出最小版本", skill: "creation", horizon: "one_month", status: "active", progress: 20, evidenceCount: 1, activeSteps: 1, smart: { specific: "完成一个搭建作品", measurable: "3次练习和1件成果", achievable: "每次10分钟", relevant: "来自我的搭建兴趣", timeBound: "四周" }, keyResults: [{ id: "kr1", title: "完成3次小练习", target: 3, unit: "次" }, { id: "kr2", title: "留下1件可展示成果", target: 1, unit: "件" }, { id: "kr3", title: "完成2次复盘", target: 2, unit: "次" }], weeklyPlan: ["最小版本", "改进", "解决卡点", "展示复盘"] }] })
  }));
  await page.route("**/api/growth-blueprint?profileId=e2e-profile", (route) => route.fulfill({
    contentType: "application/json",
    body: JSON.stringify({ stale: true, blueprint: { version: 2, provider: "siliconflow", updatedAt: "2026-07-15T08:00:00.000Z", childSummary: "我喜欢把搭建兴趣变成作品，清楚的第一步能帮助我自己开始。", priorities: [{ skill: "self-regulation", name: "自我调节", role: "底座", confidence: 0.76, reason: "先练会自己开始、检查和收尾。", evidence: ["需要清楚的第一步"], practices: ["准备-执行-检查-归位", "自己选最小步骤"] }, { skill: "creation", name: "创造项目", role: "探索", confidence: 0.71, reason: "把真实兴趣变成可以展示和改进的作品。", evidence: ["搭建作品目标"], practices: ["做最小版本", "展示并改一版"] }], fourWeekPath: [{ skill: "self-regulation", objective: "四周内独立完成3次任务闭环", keyResults: ["完成3次小练习", "留下1个检查记录", "完成2次复盘"], firstExperiment: "整理一次任务材料并自己检查" }, { skill: "creation", objective: "四周内完成一个搭建作品", keyResults: ["做3个小版本", "解决1个真实问题", "展示1次"], firstExperiment: "用10分钟搭出最小版本" }], nextQuestion: "最近哪一次你是自己找到开始办法的？", adjustment: "孩子的更正始终优先。" } })
  }));

  await page.goto("http://127.0.0.1:5173/");
  await expect(page.getByText("AI先认识我")).toBeVisible();
  await expect(page.locator("#level-value")).toHaveText("Lv.1");
  await expect(page.locator("#xp-number")).toHaveText("0/100");
  await expect(page.locator(".gem-button span").nth(1)).toHaveText("0");
  for (const tab of await page.locator(".tab").all()) await expect(tab).toBeDisabled();
  await page.screenshot({ path: "qa/workflow-onboarding.png" });

  for (let index = 0; index < 6; index += 1) {
    await page.locator("[data-action='answer-onboarding']").first().click();
  }
  await expect(page.getByText("AI目前这样理解我")).toBeVisible();
  await expect(page.getByRole("button", { name: "请先确认或修改画像" })).toBeDisabled();
  await page.getByRole("button", { name: "有些不对，修改" }).click();
  await page.locator("#onboarding-portrait-correction").fill("我喜欢搭建作品，但不是担心做不好；我只是需要先看到清楚的第一步。希望AI先让我自己试，再给提示。");
  await page.getByRole("button", { name: "保存我的更正" }).click();
  await expect(page.getByText("已由我确认")).toBeVisible();
  await expect(page.getByText("我的更正 · 最高优先级")).toBeVisible();
  await expect(page.getByText("仅供追溯，不再用于目标", { exact:false })).toBeVisible();
  await expect(page.getByRole("button", { name: "按这个理解建立路线" })).toBeEnabled();
  await expect(page.getByText("根据我确认的画像")).toBeVisible();
  await page.waitForTimeout(1900);
  await page.screenshot({ path: "qa/workflow-portrait-correction.png" });

  await page.evaluate(() => {
    localStorage.setItem("talent-os-e2e-profile-onboarding", JSON.stringify({ started: true, complete: true }));
    window.render();
  });
  for (const tab of await page.locator(".tab").all()) await expect(tab).toBeEnabled();
  for (const label of ["今天", "灵感", "能力", "计划", "记录"]) await expect(page.locator(".tabbar")).toContainText(label);
  await expect(page.getByText("今日任务册")).toBeVisible();
  await expect(page.locator(".daily-todo-book article")).toHaveCount(37);
  const firstMicroTask = page.locator(".daily-todo-book article").first();
  await expect(firstMicroTask).toContainText("第1关");
  await expect(firstMicroTask).toContainText("来源：");
  await expect(firstMicroTask).toContainText("未来技能树");
  await page.evaluate(() => {
    localStorage.setItem("talent-os-e2e-profile-bonus-rewards", JSON.stringify({ "stage-test": { xp: 460, gems: 0, label: "关卡测试" } }));
    window.render();
  });
  await expect(page.locator(".daily-todo-book article").first()).toContainText("第2关");
  await page.evaluate(() => {
    localStorage.removeItem("talent-os-e2e-profile-bonus-rewards");
    window.render();
  });
  await firstMicroTask.locator("button").click();
  await expect(firstMicroTask).toHaveClass(/done/);
  await firstMicroTask.locator("button").click();
  await expect(firstMicroTask).not.toHaveClass(/done/);
  await page.screenshot({ path: "qa/workflow-daily-todo-book.png" });

  await page.getByRole("button", { name: "打开宝石营地" }).click();
  await expect(page.getByText("宝石营地")).toBeVisible();
  await expect(page.getByRole("button", { name: "18宝石" })).toBeDisabled();

  await page.evaluate(() => {
    localStorage.setItem("talent-os-e2e-profile-bonus-rewards", JSON.stringify({
      test: { xp: 110, gems: 36, label: "测试成长" }
    }));
    window.updateShell();
    document.querySelector("#settings-content").innerHTML = window.renderSettingsPanel();
  });
  await expect(page.locator("#level-value")).toHaveText("Lv.2");
  await expect(page.locator("#xp-number")).toHaveText("10/150");
  await page.getByRole("button", { name: "18宝石" }).click();
  await expect(page.locator(".screen")).toHaveAttribute("data-theme", "forest");
  await expect(page.locator(".gem-button span").nth(1)).toHaveText("18");
  await page.screenshot({ path: "qa/workflow-gem-store.png" });

  await page.getByRole("button", { name: "关闭设置" }).click();
  await page.getByRole("button", { name: "能力" }).click();
  await expect(page.getByText("AI成长蓝图")).toBeVisible();
  await expect(page.getByText("日记或行动带来了新证据")).toBeVisible();
  await expect(page.getByText("自我调节").first()).toBeVisible();
  await expect(page.getByText("创造项目").first()).toBeVisible();
  await expect(page.getByText("SMART · OKR · 创造项目")).toBeVisible();
  await expect(page.locator(".goal-card").getByText("KR1")).toBeVisible();
  await page.waitForTimeout(1900);
  await page.screenshot({ path: "qa/workflow-smart-okr.png" });

  const layout = await page.evaluate(() => {
    const screen = document.querySelector(".screen").getBoundingClientRect();
    const level = document.querySelector(".level-panel").getBoundingClientRect();
    const tabs = document.querySelector(".tabbar").getBoundingClientRect();
    return {
      screenWidth: screen.width,
      levelBottom: level.bottom,
      tabsTop: tabs.top,
      overflowing: document.documentElement.scrollWidth > document.documentElement.clientWidth
    };
  });
  expect(layout.screenWidth).toBeLessThanOrEqual(430);
  expect(layout.levelBottom).toBeLessThanOrEqual(layout.tabsTop + 1);
  expect(layout.overflowing).toBe(false);
});
