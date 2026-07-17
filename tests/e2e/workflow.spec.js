import { test, expect } from "@playwright/test";

const baseUrl = "http://127.0.0.1:5173";

test.use({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });

test("five pages form one visible weekly growth workflow", async ({ page }) => {
  const login = await page.request.post(`${baseUrl}/api/dev/login`);
  expect(login.ok()).toBeTruthy();
  const account = await login.json();
  const profile = account.profiles.find((item) => item.name === "测试冒险家") || account.profiles[0];
  expect(profile?.id).toBeTruthy();

  await page.addInitScript(({ profileId }) => {
    localStorage.setItem("talent-os-child", profileId);
    localStorage.setItem(`talent-os-${profileId}-onboarding`, JSON.stringify({ started: true, complete: true }));
    localStorage.setItem("talent-os-tutorial-complete", "1");
  }, { profileId: profile.id });

  await page.goto(`${baseUrl}/`);
  await expect(page.locator(".tabbar")).toContainText("今天");
  for (const label of ["世界", "蓝图", "Boss", "背包"]) await expect(page.locator(".tabbar")).toContainText(label);

  await page.locator(".tab[data-page='profile']").click();
  await expect(page.getByText("完成核心任务，解锁每日小Boss", { exact: true })).toBeVisible();
  await expect(page.locator(".weekly-boss-card .boss-portrait")).toBeVisible();
  const coreCount = await page.locator(".core-task-list article").count();
  expect(coreCount).toBeGreaterThanOrEqual(1);
  expect(coreCount).toBeLessThanOrEqual(3);
  await expect(page.locator(".boss-shields span")).toHaveCount(6);

  await page.locator(".tab[data-page='discover']").click();
  await expect(page.getByText("10个能力世界，不是100项压力清单", { exact: true })).toBeVisible();
  await expect(page.locator(".world-map article")).toHaveCount(10);

  await page.locator(".tab[data-page='skills']").click();
  await expect(page.getByText("画像连接未来能力，再决定本周挑战", { exact: true })).toBeVisible();
  await expect(page.getByText("AI成长蓝图", { exact: true })).toBeVisible();

  await page.locator(".tab[data-page='plan']").click();
  await expect(page.getByText("一周只挑战一种关键能力", { exact: true })).toBeVisible();
  await expect(page.getByText("六枚证据符文", { exact: true })).toBeVisible();

  await page.locator(".tab[data-page='execute']").click();
  await expect(page.getByText("奖励来自真实里程碑", { exact: true })).toBeVisible();
  await expect(page.getByText("我的奖励券", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "设置" }).click();
  await expect(page.getByRole("button", { name: "重看新手引导" })).toBeVisible();
  await page.getByRole("button", { name: "关闭设置" }).click();

  const layout = await page.evaluate(() => {
    const screen = document.querySelector(".screen").getBoundingClientRect();
    const level = document.querySelector(".level-panel").getBoundingClientRect();
    const tabs = document.querySelector(".tabbar").getBoundingClientRect();
    const brokenImages = [...document.images].filter((image) => image.complete && image.naturalWidth === 0).map((image) => image.src);
    return {
      screenWidth: screen.width,
      levelBottom: level.bottom,
      tabsTop: tabs.top,
      documentOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
      brokenImages
    };
  });
  expect(layout.screenWidth).toBeLessThanOrEqual(390);
  expect(layout.levelBottom).toBeLessThanOrEqual(layout.tabsTop + 1);
  expect(layout.documentOverflow).toBeFalsy();
  expect(layout.brokenImages).toEqual([]);
});
