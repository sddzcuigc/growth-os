(() => {
  const legacyRenderHome = typeof window.renderHome === "function" ? window.renderHome : null;
  const legacyGo = typeof window.go === "function" ? window.go : null;
  const initialHome = document.getElementById("home");
  const legacyHomeMarkup = initialHome ? initialHome.innerHTML : "";
  const ROUTE_KEY = "growthOSV6Route";
  const VALID_PAGES = new Set(["home", "profile", "skills", "generator", "workflow", "review"]);
  const REFERENCE = window.GROWTH_OS_RENDER || "growth-os-v6.svg?v=6.6";
  let transitionLocked = false;

  function byId(id) { return document.getElementById(id); }
  function activeChild() {
    try { return window.GrowthFamily?.getActiveChild?.() || null; } catch { return null; }
  }
  function appState() {
    try {
      if (typeof state !== "undefined") return state;
    } catch {}
    return window.state || null;
  }
  function safeText(value, fallback = "") {
    const text = String(value ?? fallback);
    return text.replace(/[&<>"]/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[char]));
  }
  function taskInfo() {
    const currentState = appState();
    const task = currentState?.task || {};
    const steps = Array.isArray(task.steps) ? task.steps : [];
    const done = steps.filter(step => step.done).length;
    const total = Math.max(1, steps.length);
    const current = steps.find(step => !step.done) || steps[steps.length - 1] || { title: "阅读 30 分钟" };
    return {
      title: current.title || task.title || "阅读 30 分钟",
      done,
      total
    };
  }

  function readRoute() {
    const route = sessionStorage.getItem(ROUTE_KEY) || "home";
    return route === "interview" || VALID_PAGES.has(route) ? route : "home";
  }

  function writeRoute(route) {
    sessionStorage.setItem(ROUTE_KEY, route);
  }

  function refreshThemeSoon() {
    window.GrowthThemeRefresh?.();
  }

  function withTransition(action) {
    if (transitionLocked) return;
    transitionLocked = true;
    try {
      action();
    } finally {
      setTimeout(() => { transitionLocked = false; }, 120);
    }
  }

  function showLegacyPage(page) {
    if (!VALID_PAGES.has(page) || page === "home") {
      renderDashboard();
      return;
    }

    writeRoute(page);
    document.body.classList.remove("mc6-mode");

    if (legacyGo) {
      legacyGo(page);
    } else {
      document.querySelectorAll(".page").forEach(node => node.classList.remove("active"));
      byId(page)?.classList.add("active");
    }

    refreshThemeSoon();
  }

  function navigate(page) {
    withTransition(() => {
      if (page === "home") renderDashboard();
      else showLegacyPage(page);
    });
  }

  function renderDashboard() {
    const home = byId("home");
    if (!home) return;

    writeRoute("home");
    document.body.classList.add("mc6-mode");

    document.querySelectorAll(".page").forEach(node => node.classList.remove("active"));
    home.classList.add("active");

    const child = activeChild();
    const activeId = child?.id || "brother";
    const task = taskInfo();

    home.innerHTML = `
      <main class="mc6-shell" aria-label="成长OS方块世界首页">
        <div class="mc6-canvas">
          <img class="mc6-reference" src="${REFERENCE}" alt="成长OS方块世界首页" draggable="false" />
          <button type="button" class="mc6-hotspot mc6-settings" aria-label="打开设置"></button>
          <button type="button" class="mc6-hotspot mc6-child mc6-child-brother ${activeId === "brother" ? "is-active" : ""}" data-child="brother" aria-label="切换到哥哥"></button>
          <button type="button" class="mc6-hotspot mc6-child mc6-child-sister ${activeId === "sister" ? "is-active" : ""}" data-child="sister" aria-label="切换到妹妹"></button>
          <button type="button" class="mc6-hotspot mc6-mic" aria-label="开始AI语音观察"></button>
          <button type="button" class="mc6-hotspot mc6-task" data-target="workflow" aria-label="查看今日任务"></button>
          <button type="button" class="mc6-hotspot mc6-skills" data-target="skills" aria-label="查看技能树"></button>
          <button type="button" class="mc6-hotspot mc6-project" data-target="generator" aria-label="生成项目计划"></button>
          <button type="button" class="mc6-hotspot mc6-profile" data-target="profile" aria-label="打开成长档案"></button>
          <button type="button" class="mc6-hotspot mc6-nav mc6-nav-1" data-target="home" aria-label="了解"></button>
          <button type="button" class="mc6-hotspot mc6-nav mc6-nav-2" data-target="profile" aria-label="发现"></button>
          <button type="button" class="mc6-hotspot mc6-nav mc6-nav-3" data-target="skills" aria-label="路线"></button>
          <button type="button" class="mc6-hotspot mc6-nav mc6-nav-4" data-target="generator" aria-label="项目"></button>
          <button type="button" class="mc6-hotspot mc6-nav mc6-nav-5" data-target="workflow" aria-label="执行"></button>
          <div class="mc6-screen-reader" aria-live="polite">当前孩子：${safeText(child?.name || "哥哥")}；当前任务：${safeText(task.title)}；完成 ${task.done} / ${task.total} 步。</div>
        </div>
      </main>`;

    home.querySelector(".mc6-settings")?.addEventListener("click", event => {
      event.preventDefault();
      event.stopPropagation();
      const familyTools = byId("familyToolsBtn");
      if (familyTools) familyTools.click();
      else navigate("profile");
    });

    home.querySelector(".mc6-mic")?.addEventListener("click", event => {
      event.preventDefault();
      event.stopPropagation();
      withTransition(openDetailedInterview);
    });

    home.querySelectorAll("[data-child]").forEach(button => {
      button.addEventListener("click", event => {
        event.preventDefault();
        event.stopPropagation();
        const id = button.dataset.child;
        if (id && id !== activeId) {
          writeRoute("home");
          window.GrowthFamily?.switchTo?.(id);
        }
      });
    });

    home.querySelectorAll("[data-target]").forEach(button => {
      button.addEventListener("click", event => {
        event.preventDefault();
        event.stopPropagation();
        navigate(button.dataset.target);
      });
    });

    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }

  function restoreLegacyHome() {
    const home = byId("home");
    if (!home) return null;
    home.innerHTML = legacyHomeMarkup;
    return home;
  }

  function openDetailedInterview() {
    const home = restoreLegacyHome();
    if (!home) return;

    writeRoute("interview");
    document.body.classList.remove("mc6-mode");

    document.querySelectorAll(".page").forEach(node => node.classList.remove("active"));
    home.classList.add("active");

    try {
      legacyRenderHome?.();
    } catch (error) {
      console.error("恢复AI访谈页失败", error);
    }

    if (!home.querySelector(".mc6-detail-back")) {
      const back = document.createElement("button");
      back.type = "button";
      back.className = "mc6-detail-back";
      back.textContent = "← 返回方块世界大厅";
      back.addEventListener("click", event => {
        event.preventDefault();
        renderDashboard();
      });
      home.prepend(back);
    }

    refreshThemeSoon();
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }

  function restoreRoute() {
    const route = readRoute();
    if (route === "interview") openDetailedInterview();
    else if (route === "home") renderDashboard();
    else showLegacyPage(route);
  }

  window.GrowthRoute = {
    get: readRoute,
    go: navigate,
    beforeReload() {},
    restore: restoreRoute
  };

  window.renderHome = function growthOSV6Home() {
    const home = byId("home");
    const userIsOnHome = Boolean(home?.classList.contains("active"));
    const dashboardIsVisible = document.body.classList.contains("mc6-mode");

    // app.js 会把 renderHome() 当作后台数据刷新函数调用。
    // 用户位于其他页面时，绝不能因此抢走当前路由。
    if (!userIsOnHome && !dashboardIsVisible) return;

    const route = readRoute();
    if (route === "interview") openDetailedInterview();
    else if (route === "home" || dashboardIsVisible) renderDashboard();
    else showLegacyPage(route);
  };

  window.go = function growthOSV6Go(page) {
    navigate(page);
  };

  if (document.readyState === "loading") {
    window.addEventListener("DOMContentLoaded", restoreRoute, { once: true });
  } else {
    restoreRoute();
  }
})();
