import { chromium } from "playwright";
import fs from "node:fs/promises";
import path from "node:path";

const BASE_URL = process.env.GROWTH_OS_URL || "https://growth-os-ten-pearl.vercel.app/";
const OUT_DIR = path.resolve("artifacts/live-nav-e2e");
await fs.mkdir(OUT_DIR, { recursive: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 470, height: 835 },
  deviceScaleFactor: 1,
  isMobile: true,
  hasTouch: true,
  locale: "zh-CN"
});
const page = await context.newPage();

const errors = [];
const steps = [];
page.on("pageerror", error => errors.push(`pageerror: ${error.message}`));
page.on("console", message => {
  if (message.type() === "error") errors.push(`console: ${message.text()}`);
});
page.on("requestfailed", request => {
  const failure = request.failure();
  errors.push(`requestfailed: ${request.url()} :: ${failure?.errorText || "unknown"}`);
});

async function appState(label) {
  const state = await page.evaluate(() => ({
    route: sessionStorage.getItem("growthOSV6Route"),
    activePages: [...document.querySelectorAll(".page.active")].map(node => node.id),
    mc6Mode: document.body.classList.contains("mc6-mode"),
    activeChild: window.GrowthFamily?.getActiveId?.() || window.GrowthFamily?.getActiveChild?.()?.id || null,
    modalOpen: document.getElementById("modal")?.classList.contains("open") || false,
    href: location.href,
    version: document.querySelector(".version")?.textContent?.trim() || ""
  }));
  const item = { label, ...state };
  steps.push(item);
  return item;
}

function fail(message, state) {
  const details = state ? `\nstate=${JSON.stringify(state)}` : "";
  throw new Error(`${message}${details}`);
}

async function expectRoute(label, route, activePage, mc6Mode) {
  const state = await appState(label);
  if (state.route !== route) fail(`Expected route ${route}, got ${state.route}`, state);
  if (state.activePages.length !== 1 || state.activePages[0] !== activePage) {
    fail(`Expected active page ${activePage}, got ${state.activePages.join(",")}`, state);
  }
  if (state.mc6Mode !== mc6Mode) fail(`Expected mc6Mode=${mc6Mode}`, state);
  await page.screenshot({ path: path.join(OUT_DIR, `${String(steps.length).padStart(2, "0")}-${label.replace(/[^a-z0-9_-]+/gi, "-")}.png`), fullPage: true });
  return state;
}

async function goHomeFromInner() {
  await page.locator('nav button[data-page="home"]').click();
  await page.waitForSelector(".mc6-task", { state: "visible" });
  await expectRoute("return-home", "home", "home", true);
}

try {
  await page.goto(`${BASE_URL}?qa=${Date.now()}`, { waitUntil: "networkidle", timeout: 90_000 });
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  await page.reload({ waitUntil: "networkidle", timeout: 90_000 });
  await page.waitForSelector(".mc6-task", { state: "visible", timeout: 30_000 });

  await expectRoute("initial-home", "home", "home", true);

  // 设置按钮必须打开资料面板，而不是误跳页面。
  await page.locator(".mc6-settings").click();
  let state = await appState("settings-modal");
  if (!state.modalOpen || state.route !== "home") fail("Settings did not open modal on home", state);
  await page.locator("#modal").evaluate(node => node.classList.remove("open"));

  // 首页卡片入口。
  await page.locator(".mc6-task").click();
  await expectRoute("task-to-workflow", "workflow", "workflow", false);

  // 数据后台刷新不得抢走当前页面。
  await page.evaluate(() => window.renderHome?.());
  await expectRoute("workflow-after-background-render", "workflow", "workflow", false);

  // 刷新后保留执行页。
  await page.reload({ waitUntil: "networkidle", timeout: 90_000 });
  await expectRoute("workflow-after-reload", "workflow", "workflow", false);

  await goHomeFromInner();
  await page.locator(".mc6-skills").click();
  await expectRoute("skills-card", "skills", "skills", false);

  // 在内页切换孩子，刷新后仍应留在同一内页。
  const currentChild = (await appState("skills-before-child-switch")).activeChild;
  const targetChild = currentChild === "brother" ? "sister" : "brother";
  const switcher = page.locator(`[data-child-switch="${targetChild}"]`);
  await switcher.waitFor({ state: "visible", timeout: 15_000 });
  await switcher.click();
  await page.waitForLoadState("networkidle", { timeout: 90_000 });
  await expectRoute("skills-after-child-switch", "skills", "skills", false);
  state = await appState("child-switch-result");
  if (state.activeChild !== targetChild) fail(`Expected active child ${targetChild}`, state);

  await page.reload({ waitUntil: "networkidle", timeout: 90_000 });
  await expectRoute("skills-after-reload", "skills", "skills", false);

  await goHomeFromInner();
  await page.locator(".mc6-project").click();
  await expectRoute("project-card", "generator", "generator", false);

  await page.locator('nav button[data-page="profile"]').click();
  await expectRoute("inner-nav-profile", "profile", "profile", false);

  await goHomeFromInner();
  await page.locator(".mc6-profile").click();
  await expectRoute("profile-card", "profile", "profile", false);

  await goHomeFromInner();
  await page.locator(".mc6-mic").click();
  await expectRoute("interview", "interview", "home", false);

  await page.reload({ waitUntil: "networkidle", timeout: 90_000 });
  await expectRoute("interview-after-reload", "interview", "home", false);

  await page.locator(".mc6-detail-back").click();
  await page.waitForSelector(".mc6-task", { state: "visible" });
  await expectRoute("interview-back-home", "home", "home", true);

  // 同一事件循环内连续触发两个入口，第二个不得覆盖第一个。
  await page.evaluate(() => {
    document.querySelector(".mc6-skills")?.click();
    document.querySelector(".mc6-project")?.click();
  });
  await expectRoute("rapid-double-route", "skills", "skills", false);

  // 底部五个热点逐个真实点击。
  await goHomeFromInner();
  const bottomCases = [
    [".mc6-nav-2", "profile", "profile"],
    [".mc6-nav-3", "skills", "skills"],
    [".mc6-nav-4", "generator", "generator"],
    [".mc6-nav-5", "workflow", "workflow"]
  ];
  for (const [selector, route, pageId] of bottomCases) {
    await page.locator(selector).click();
    await expectRoute(`bottom-${route}`, route, pageId, false);
    await goHomeFromInner();
  }

  await fs.writeFile(path.join(OUT_DIR, "report.json"), JSON.stringify({ ok: true, baseUrl: BASE_URL, steps, errors }, null, 2));
  if (errors.length) {
    throw new Error(`Browser reported ${errors.length} error(s):\n${errors.join("\n")}`);
  }
  console.log(JSON.stringify({ ok: true, tested: steps.length, baseUrl: BASE_URL }, null, 2));
} catch (error) {
  await page.screenshot({ path: path.join(OUT_DIR, "failure.png"), fullPage: true }).catch(() => {});
  await fs.writeFile(path.join(OUT_DIR, "report.json"), JSON.stringify({ ok: false, baseUrl: BASE_URL, steps, errors, failure: error.stack || error.message }, null, 2));
  console.error(error.stack || error.message);
  process.exitCode = 1;
} finally {
  await browser.close();
}
