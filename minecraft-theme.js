(() => {
  let refreshQueued = false;

  function ensureBrand() {
    const header = document.querySelector("header");
    if (!header || document.querySelector(".mc-brand")) return;

    const brand = document.createElement("div");
    brand.className = "mc-brand";
    brand.innerHTML = `
      <div class="mc-logo-wrap">
        <div class="mc-logo">成长<em>OS</em></div>
        <div class="mc-tagline">✦ AI驱动的儿童成长规划系统 ✦</div>
      </div>
      <div class="mc-hud">
        <div class="mc-gem"><b>◆</b><span id="mcGemCount">1280</span></div>
        <button type="button" class="mc-gear" id="mcThemeSettingsBtn" aria-label="打开双孩资料设置">⚙</button>
      </div>`;
    header.insertBefore(brand, header.firstChild);

    document.getElementById("mcThemeSettingsBtn")?.addEventListener("click", () => {
      const familyTools = document.getElementById("familyToolsBtn");
      if (familyTools) familyTools.click();
    });
  }

  function applyNavIcons() {
    const icons = {
      home: "🟩",
      profile: "🧭",
      skills: "🗺️",
      generator: "🧰",
      workflow: "🔥"
    };

    document.querySelectorAll("nav button[data-page]").forEach(button => {
      const span = button.querySelector("span");
      const icon = icons[button.dataset.page] || "▪";
      if (span && span.textContent !== icon) span.textContent = icon;
    });
  }

  function decorateVoice() {
    const card = document.getElementById("voiceObservationCard");
    if (!card || card.dataset.mcReady === "true") return;
    card.dataset.mcReady = "true";
    const heading = card.querySelector("h3");
    if (heading && !heading.textContent.includes("AI语音观察")) {
      heading.textContent = `AI语音观察 · ${heading.textContent}`;
    }
  }

  function decorateSections() {
    document.querySelectorAll(".section-title").forEach(title => {
      if (!title.dataset.mcReady) title.dataset.mcReady = "true";
    });
    decorateVoice();
  }

  function updateGemCount() {
    const target = document.getElementById("mcGemCount");
    if (!target) return;
    try {
      const reviews = Array.isArray(window.state?.reviews) ? window.state.reviews.length : 0;
      const steps = Array.isArray(window.state?.task?.steps)
        ? window.state.task.steps.filter(step => step.done).length
        : 0;
      target.textContent = String(1280 + reviews * 30 + steps * 10);
    } catch {
      target.textContent = "1280";
    }
  }

  function refreshTheme() {
    ensureBrand();
    applyNavIcons();
    decorateSections();
    updateGemCount();
  }

  function scheduleRefresh() {
    if (refreshQueued) return;
    refreshQueued = true;
    requestAnimationFrame(() => {
      refreshQueued = false;
      refreshTheme();
    });
  }

  // 旧版在这里监听整个 DOM，并在回调里持续修改 DOM，造成无限循环和页面卡死。
  // V6.2 改为由页面切换主动刷新，完全取消全页面 MutationObserver。
  window.GrowthThemeRefresh = scheduleRefresh;

  if (document.readyState === "loading") {
    window.addEventListener("DOMContentLoaded", refreshTheme, { once: true });
  } else {
    refreshTheme();
  }
})();