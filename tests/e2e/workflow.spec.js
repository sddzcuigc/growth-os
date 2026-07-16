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

const categories = ["健康", "学习", "生活", "责任", "表达", "未来"];
const missionTasks = categories.flatMap((category, categoryIndex) => Array.from({ length: 4 }, (_, index) => ({
  id: `mission-${categoryIndex + 1}-${index + 1}`,
  slot: `slot-${categoryIndex + 1}-${index + 1}`,
  title: `${category}主线关卡${index + 1}`,
  category,
  skill: category === "健康" ? "wellbeing" : category === "未来" ? "creation" : "self-regulation",
  minutes: 5 + index,
  tier: index < 2 ? "基础" : index === 2 ? "成长" : "探索",
  stage: 2,
  difficulty: "独立尝试",
  success: `完成一次可观察的${category}小行动`,
  why: "由当前画像、SMART目标和今日状态共同编排",
  contextUsed: ["孩子确认画像", "SMART目标", "未来技能树"],
  reward: 3,
  personalized: index === 0,
  micro: true
})));
const missionBook = { date: "2026-07-16", headline: "搭建作品主线 · 今日任务册", rationale: "围绕搭建作品主线，同时照顾健康、学习和真实生活。", provider: "siliconflow", goalId: 1, goalTitle: "把喜欢的搭建变成看得见的作品", tasks: missionTasks };
const dailyPlan = { id: 7, status: "ready", checkin: { energy: "normal", minutes: 10, intent: "create" }, plan: { title: missionTasks[0].title, sourceType: "mission", sourceId: missionTasks[0].id, minutes: missionTasks[0].minutes, provider: "siliconflow", why: missionTasks[0].why, firstStep: "先准备需要的材料", support: "先自己试，卡住再看提示", goalTitle: missionBook.goalTitle, keyResultTitle: "完成3次小练习" } };

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
    body: JSON.stringify({ goals: [{ id: 1, title: "我想做出自己的作品", objective: "把喜欢的搭建变成看得见的作品", why: "这是我真正愿意探索的方向", successSignal: "四周完成3次练习并展示1件作品", firstExperiment: "用10分钟搭出最小版本", skill: "creation", horizon: "one_month", status: "active", isPrimary: true, progress: 20, evidenceCount: 1, journalCount: 1, reflectionCount: 1, activeSteps: 1, smart: { specific: "完成一个搭建作品", measurable: "3次练习和1件成果", achievable: "每次10分钟", relevant: "来自我的搭建兴趣", timeBound: "四周" }, keyResults: [{ id: "kr1", title: "完成3次小练习", target: 3, unit: "次" }, { id: "kr2", title: "留下1件可展示成果", target: 1, unit: "件" }, { id: "kr3", title: "完成2次复盘", target: 2, unit: "次" }], weeklyPlan: ["最小版本", "改进", "解决卡点", "展示复盘"] }] })
  }));
  await page.route("**/api/growth-blueprint?profileId=e2e-profile", (route) => route.fulfill({
    contentType: "application/json",
    body: JSON.stringify({ stale: true, blueprint: { version: 2, provider: "siliconflow", updatedAt: "2026-07-15T08:00:00.000Z", childSummary: "我喜欢把搭建兴趣变成作品，清楚的第一步能帮助我自己开始。", priorities: [{ skill: "self-regulation", name: "自我调节", role: "底座", confidence: 0.76, reason: "先练会自己开始、检查和收尾。", evidence: ["需要清楚的第一步"], practices: ["准备-执行-检查-归位", "自己选最小步骤"] }, { skill: "creation", name: "创造项目", role: "探索", confidence: 0.71, reason: "把真实兴趣变成可以展示和改进的作品。", evidence: ["搭建作品目标"], practices: ["做最小版本", "展示并改一版"] }], fourWeekPath: [{ skill: "self-regulation", objective: "四周内独立完成3次任务闭环", keyResults: ["完成3次小练习", "留下1个检查记录", "完成2次复盘"], firstExperiment: "整理一次任务材料并自己检查" }, { skill: "creation", objective: "四周内完成一个搭建作品", keyResults: ["做3个小版本", "解决1个真实问题", "展示1次"], firstExperiment: "用10分钟搭出最小版本" }], nextQuestion: "最近哪一次你是自己找到开始办法的？", adjustment: "孩子的更正始终优先。" } })
  }));
  await page.route("**/api/goals/shape", (route) => {
    const body = route.request().postDataJSON();
    if (body.text === "学会游泳" && !body.clarifications?.swim_level) return route.fulfill({ contentType: "application/json", body: JSON.stringify({ needsClarification: true, provider: "siliconflow", clarification: { key: "swim_level", question: "你现在在水里能做到哪一步？", why: "先知道起点，才能定出安全又做得到的目标。", options: ["完全不会，需要从适应水开始", "能憋气和漂浮", "能游几米但动作不稳定", "已经能连续游25米"] } }) });
    if (body.text === "学会游泳" && !body.clarifications?.swim_support) return route.fulfill({ contentType: "application/json", body: JSON.stringify({ needsClarification: true, provider: "siliconflow", clarification: { key: "swim_support", question: "接下来四周，你会在什么条件下练习？", why: "游泳目标必须先确认教练或成人陪同。", options: ["有固定游泳教练", "有会游泳的家长全程陪同", "只能偶尔去泳池", "目前还没有安全练习条件"] } }) });
    const swimmingDraft = { title: "我想安全学会游泳", why: "我想在水里更自信，也愿意在教练陪同下练习", successSignal: "四周内在教练全程陪同下，能独立漂浮10秒并连续游10米", firstExperiment: "和家长一起确认教练与泳池时间，由教练评估当前水中能力", skill: "wellbeing", horizon: "one_month", objective: "四周内在教练全程陪同下，独立漂浮10秒并连续游10米", smart: { specific: "在教练陪同下学习漂浮、呼吸和短距离游进", measurable: "漂浮10秒并连续游10米", achievable: "从完全不会起步，每周由教练指导", relevant: "实现我想学会游泳的愿望", timeBound: "未来四周" }, keyResults: [{ id: "kr1", title: "完成4次教练指导的安全练习", target: 4, unit: "次" }, { id: "kr2", title: "独立漂浮达到10秒", target: 10, unit: "秒" }, { id: "kr3", title: "连续游进达到10米", target: 10, unit: "米" }], weeklyPlan: ["适应水和安全规则", "练习漂浮与呼吸", "在教练保护下短距离游进", "完成安全测评并复盘"] };
    return route.fulfill({ contentType: "application/json", body: JSON.stringify({ provider: "siliconflow", model: "zai-org/GLM-5.2", draft: swimmingDraft }) });
  });
  await page.route("**/api/daily-missions?profileId=e2e-profile", (route) => route.fulfill({ contentType: "application/json", body: JSON.stringify({ book: missionBook }) }));
  await page.route("**/api/daily-missions/generate", (route) => route.fulfill({ contentType: "application/json", body: JSON.stringify({ book: missionBook }) }));
  await page.route("**/api/daily-plan?profileId=e2e-profile", (route) => route.fulfill({ contentType: "application/json", body: JSON.stringify({ dailyPlan }) }));
  await page.route("**/api/daily-plan/generate", (route) => {
    const body = route.request().postDataJSON();
    const selected = missionTasks.find((task) => `mission:${task.id}` === body.preferredRef) || missionTasks[0];
    return route.fulfill({ contentType: "application/json", body: JSON.stringify({ ...dailyPlan, plan: { ...dailyPlan.plan, sourceId: selected.id, sourceRef: `mission:${selected.id}`, title: selected.title, skill: selected.skill, minutes: selected.minutes, why: selected.why, firstStep: selected.success } }) });
  });
  await page.route("**/api/daily-plan/7", async (route) => {
    if (route.request().method() !== "PATCH") return route.continue();
    return route.fulfill({ contentType: "application/json", body: JSON.stringify({ ...dailyPlan, status: "started" }) });
  });

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
  await expect(page.getByText("AI原来的理解 · 仅供追溯", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "先说一个想实现的愿望" })).toBeDisabled();
  await page.locator("#onboarding-goal-project").fill("学会游泳");
  await page.getByRole("button", { name: "让GLM理解" }).click();
  await expect(page.getByText("你现在在水里能做到哪一步？")).toBeVisible();
  await page.getByRole("button", { name: "完全不会，需要从适应水开始" }).click();
  await expect(page.getByText("接下来四周，你会在什么条件下练习？")).toBeVisible();
  await page.getByRole("button", { name: "有固定游泳教练" }).click();
  await expect(page.getByText("GLM生成的SMART目标")).toBeVisible();
  await expect(page.getByText("四周内在教练全程陪同下，独立漂浮10秒并连续游10米", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "用这个目标开始" })).toBeEnabled();
  await page.waitForTimeout(1900);
  await page.screenshot({ path: "qa/workflow-portrait-correction.png" });

  await page.evaluate(() => {
    localStorage.setItem("talent-os-e2e-profile-onboarding", JSON.stringify({ started: true, complete: true }));
    window.render();
  });
  for (const tab of await page.locator(".tab").all()) await expect(tab).toBeEnabled();
  for (const label of ["今天", "想法", "目标", "安排", "记录"]) await expect(page.locator(".tabbar")).toContainText(label);
  await expect(page.getByText("只做当前最合适的一步")).toBeVisible();
  await expect(page.locator(".todo-category-list article")).toHaveCount(24);
  await expect(page.locator(".mission-picks article")).toHaveCount(3);
  await expect(page.locator(".all-missions")).not.toHaveAttribute("open", "");
  await expect(page.locator(".daily-compass h2")).toHaveText(missionTasks[0].title);
  await page.getByText("查看全部 24 项选择").click();
  await page.locator(".todo-category-list > details > summary").first().click();
  const firstMicroTask = page.locator(".todo-category-list article").first();
  await expect(firstMicroTask).toContainText("第2关");
  await firstMicroTask.getByText("为什么推荐").click();
  await expect(firstMicroTask).toContainText("未来技能树");
  await page.getByRole("button", { name: "现在开始" }).click();
  await expect(page.getByRole("button", { name: "我做完了 +3经验" })).toBeVisible();
  await page.getByRole("button", { name: "我做完了 +3经验" }).click();
  await expect(firstMicroTask).toHaveClass(/done/);
  await page.getByRole("button", { name: "重新选择节奏" }).click();
  for (const choice of ["轻松开始", "正常推进", "认真挑战", "先休息一下"]) await expect(page.getByRole("button", { name: new RegExp(choice) })).toBeVisible();
  await expect(page.getByText("每个选择都会直接给出一件具体的事")).toBeVisible();
  await page.getByRole("button", { name: /正常推进/ }).click();
  await expect(page.locator(".daily-compass h2")).toHaveText(missionTasks[0].title);
  const secondChoice = page.locator(".mission-picks article").nth(1);
  const secondChoiceTitle = await secondChoice.locator("strong").textContent();
  await secondChoice.getByRole("button", { name: "选这项" }).click();
  await expect(page.locator(".daily-compass h2")).toHaveText(secondChoiceTitle || "");
  await page.screenshot({ path: "qa/workflow-daily-todo-book.png" });

  for (const [pageId, heading] of [["discover", "记下一句值得记住的事"], ["skills", "知道现在要变好什么"], ["plan", "只安排这一周"], ["execute", "用两个回答让AI更懂你"], ["profile", "只做当前最合适的一步"]]) {
    await page.locator(`.tab[data-page='${pageId}']`).click();
    await expect(page.getByText(heading).first()).toBeVisible();
  }

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
  await expect(page.locator("#xp-number")).toHaveText("13/150");
  await page.getByRole("button", { name: "18宝石" }).click();
  await expect(page.locator(".screen")).toHaveAttribute("data-theme", "forest");
  await expect(page.locator(".gem-button span").nth(1)).toHaveText("18");
  await page.screenshot({ path: "qa/workflow-gem-store.png" });

  await page.getByRole("button", { name: "关闭设置" }).click();
  await page.getByRole("button", { name: "目标" }).click();
  await expect(page.getByText("重点能力")).toBeVisible();
  await expect(page.locator(".compact-priorities").getByText("自我调节")).toBeVisible();
  await expect(page.locator(".compact-priorities").getByText("创造项目")).toBeVisible();
  await expect(page.getByText("SMART目标", { exact: true })).toBeVisible();
  await expect(page.locator(".compact-krs").getByText("KR1")).toBeVisible();
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
