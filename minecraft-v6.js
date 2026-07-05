(() => {
  const previousRenderHome = window.renderHome;
  const previousGo = window.go;
  const MODE_KEY = "growthOSV6HomeMode";
  const REFERENCE = "data:image/webp;base64," + (window.MC6_REFERENCE || "");

  function byId(id) { return document.getElementById(id); }
  function activeChild() {
    try { return window.GrowthFamily?.getActiveChild?.() || null; } catch { return null; }
  }
  function safeText(value, fallback="") {
    const text = String(value ?? fallback);
    return typeof window.escapeHtml === "function" ? window.escapeHtml(text) : text.replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  }
  function taskInfo() {
    const task = window.state?.task || {};
    const steps = Array.isArray(task.steps) ? task.steps : [];
    const done = steps.filter(step => step.done).length;
    const total = Math.max(1, steps.length);
    const current = steps.find(step => !step.done) || steps.at(-1) || { title: "阅读 30 分钟" };
    return {
      title: current.title || task.title || "阅读 30 分钟",
      desc: task.coreSkills?.length ? `培养${task.coreSkills.slice(0,2).join("与")}` : "培养专注力与理解力",
      done,
      total,
      percent: Math.max(8, Math.round(done / total * 100))
    };
  }
  function renderDashboard() {
    const home = byId("home");
    if (!home) return;
    document.body.classList.add("mc6-mode");
    sessionStorage.setItem(MODE_KEY, "dashboard");
    const child = activeChild();
    const activeId = child?.id || (window.state?.child?.name?.includes("妹") ? "sister" : "brother");
    const task = taskInfo();
    home.innerHTML = `
      <main class="mc6-shell" aria-label="成长OS方块世界首页">
        <div class="mc6-canvas">
          <img class="mc6-reference" src="${REFERENCE}" alt="成长OS方块世界首页视觉" draggable="false" />
          <button class="mc6-hotspot mc6-settings" aria-label="打开设置"></button>
          <button class="mc6-hotspot mc6-child mc6-child-brother ${activeId === "brother" ? "is-active" : ""}" data-child="brother" aria-label="切换到哥哥"></button>
          <button class="mc6-hotspot mc6-child mc6-child-sister ${activeId === "sister" ? "is-active" : ""}" data-child="sister" aria-label="切换到妹妹"></button>
          <button class="mc6-hotspot mc6-mic" aria-label="开始AI语音观察"></button>
          <button class="mc6-hotspot mc6-task" data-target="workflow" aria-label="查看今日任务"></button>
          <button class="mc6-hotspot mc6-skills" data-target="skills" aria-label="查看技能树"></button>
          <button class="mc6-hotspot mc6-project" data-target="generator" aria-label="生成项目计划"></button>
          <button class="mc6-hotspot mc6-profile" data-target="profile" aria-label="打开成长档案"></button>
          <button class="mc6-hotspot mc6-nav mc6-nav-1" data-target="home" aria-label="了解"></button>
          <button class="mc6-hotspot mc6-nav mc6-nav-2" data-target="profile" aria-label="发现"></button>
          <button class="mc6-hotspot mc6-nav mc6-nav-3" data-target="skills" aria-label="路线"></button>
          <button class="mc6-hotspot mc6-nav mc6-nav-4" data-target="generator" aria-label="项目"></button>
          <button class="mc6-hotspot mc6-nav mc6-nav-5" data-target="workflow" aria-label="执行"></button>
          <section class="mc6-live-task" aria-label="当前真实任务">
            <div class="mc6-live-title">${safeText(task.title)}</div>
            <div class="mc6-live-desc">${safeText(task.desc)}</div>
            <div class="mc6-live-progress"><i style="width:${task.percent}%"></i><span>${task.done} / ${task.total} 步</span></div>
          </section>
          <div class="mc6-screen-reader" aria-live="polite">当前孩子：${safeText(child?.name || window.state?.child?.name || "哥哥")}；当前任务：${safeText(task.title)}；完成 ${task.done} / ${task.total} 步。</div>
        </div>
      </main>`;
    home.querySelector(".mc6-settings")?.addEventListener("click", () => byId("familyToolsBtn")?.click());
    home.querySelector(".mc6-mic")?.addEventListener("click", openDetailedInterview);
    home.querySelectorAll("[data-child]").forEach(button => button.addEventListener("click", () => {
      const id = button.dataset.child;
      if (id !== activeId) window.GrowthFamily?.switchTo?.(id);
    }));
    home.querySelectorAll("[data-target]").forEach(button => button.addEventListener("click", () => {
      const target = button.dataset.target;
      if (target === "home") renderDashboard(); else previousGo(target);
    }));
    window.scrollTo(0,0);
  }
  function openDetailedInterview() {
    document.body.classList.remove("mc6-mode");
    sessionStorage.setItem(MODE_KEY, "detail");
    previousRenderHome();
    const home = byId("home");
    if (!home) return;
    const back = document.createElement("button");
    back.type = "button";
    back.className = "mc6-detail-back";
    back.textContent = "← 返回方块世界大厅";
    back.addEventListener("click", renderDashboard);
    home.prepend(back);
    window.scrollTo(0,0);
  }
  window.renderHome = function growthOSV6Home() {
    if (sessionStorage.getItem(MODE_KEY) === "detail") openDetailedInterview();
    else renderDashboard();
  };
  window.go = function growthOSV6Go(page) {
    if (page !== "home") document.body.classList.remove("mc6-mode");
    previousGo(page);
  };
  window.addEventListener("DOMContentLoaded", renderDashboard);
})();
