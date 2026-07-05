(() => {
  const detailedRenderHome = renderHome;
  const originalGo = go;
  const HOME_MODE_KEY = "growthOSHomeMode";
  const SKILL_ICONS = {"责任闭环":"🗡️","任务拆解":"🧭","深度阅读":"📖","反馈与提炼":"🔍","中文书写":"✍️","英文书写":"🔤","打字":"⌨️","数学预算":"🧮","数据分析":"📊","文件管理":"🗃️","信息可信度":"🔎","计算思维":"⚙️","AI协作":"🤖","用户意识":"❤️","合作分工":"🤝","挫折恢复":"🛡️","迁移应用":"🗺️"};

  function activeChild() {
    try { return window.GrowthFamily?.getActiveChild?.() || null; } catch { return null; }
  }

  function taskProgress() {
    const steps = Array.isArray(state.task?.steps) ? state.task.steps : [];
    const done = steps.filter(step => step.done).length;
    return { steps, done, total: steps.length || 1, percent: Math.round(done / (steps.length || 1) * 100) };
  }

  function topSkills() {
    const preferred = (state.child?.focus || []).map(item => item.name).filter(name => state.skills?.[name]);
    const fallback = Object.entries(state.skills || {}).sort((a,b)=>(b[1].level||0)-(a[1].level||0)).map(([name])=>name);
    return [...new Set([...preferred, ...fallback])].slice(0,4);
  }

  function skillCard(name) {
    const level = Math.max(1, Math.min(5, Number(state.skills?.[name]?.level || 1)));
    const pips = Array.from({length:7}, (_,index)=>`<i class="${index < level + 1 ? "on" : ""}"></i>`).join("");
    return `<button type="button" class="mc2-skill" data-mc-go="skills"><div class="mc2-skill-icon">${SKILL_ICONS[name] || "🧱"}</div><div class="mc2-skill-name">${escapeHtml(name)}</div><div class="mc2-skill-level">Lv.${level}</div><div class="mc2-pips">${pips}</div></button>`;
  }

  function workflowCards() {
    const labels = [
      ["发现问题","🔎","观察与思考\n明确目标"],
      ["探索学习","📚","收集信息\n学习知识"],
      ["动手实践","🧰","实践探索\n形成成果"],
      ["展示分享","🏆","展示成果\n复盘提升"]
    ];
    return labels.map((item,index)=>`<button type="button" class="mc2-stage" data-mc-go="${index < 3 ? "workflow" : "review"}"><span class="mc2-stage-num">${index+1}</span><div class="mc2-stage-title">${item[0]}</div><div class="mc2-stage-icon">${item[1]}</div><div class="mc2-stage-desc">${item[2].replace("\n","<br>")}</div></button>`).join("");
  }

  function renderDashboard() {
    document.body.classList.add("mc-home-mode");
    sessionStorage.setItem(HOME_MODE_KEY,"dashboard");
    const child = activeChild();
    const activeId = child?.id || (state.child?.name?.includes("妹") ? "sister" : "brother");
    const progress = taskProgress();
    const nextStep = progress.steps.find(step=>!step.done) || progress.steps.at(-1) || {title:"开始一次真实成长挑战",standard:"完成一个可见成果"};
    const taskName = state.task?.title || "阅读 30 分钟";
    const taskDesc = state.task?.coreSkills?.length ? `培养${state.task.coreSkills.slice(0,2).join("与")}` : "培养专注力与理解力";
    const level = Math.max(1, Math.min(99, 12 + (state.reviews?.length || 0) + progress.done));
    const gems = 1280 + (state.reviews?.length || 0) * 30 + progress.done * 10;
    const xpNow = Math.min(1200, 620 + progress.done * 80 + (state.reviews?.length || 0) * 40);
    const xpPercent = Math.round(xpNow / 1200 * 100);

    el("home").innerHTML = `
      <div class="mc2-dashboard">
        <section class="mc2-scene">
          <div class="mc2-tree"></div><div class="mc2-house"></div><div class="mc2-character"></div>
          <div class="mc2-logo">成长<em>OS</em></div>
          <div class="mc2-tagline">✦ AI驱动的儿童成长规划系统 ✦</div>
          <div class="mc2-hud"><div class="mc2-gem"><span>◆</span>${gems}<b>＋</b></div><button type="button" class="mc2-settings" id="mc2Settings">⚙</button></div>
          <div class="mc2-kids">
            <button type="button" class="mc2-kid ${activeId === "brother" ? "active" : ""}" data-child="brother"><span class="mc2-face"></span>哥哥&nbsp;9岁</button>
            <button type="button" class="mc2-kid ${activeId === "sister" ? "active" : ""}" data-child="sister"><span class="mc2-face"></span>妹妹&nbsp;6岁</button>
          </div>
        </section>

        <main class="mc2-stone-frame">
          <section class="mc2-panel mc2-voice">
            <div class="mc2-voice-copy"><div class="mc2-panel-title"><span class="mc2-title-icon">🎙</span>AI语音观察</div><h2>对孩子的表现说一说</h2><p>AI帮你记录与分析</p><p>进入结构化访谈后，可连续语音输入并自动整理。</p></div>
            <div><button type="button" class="mc2-mic" id="mc2Mic">🎙</button><div class="mc2-mic-label">点击开始说话</div></div>
          </section>

          <section class="mc2-panel">
            <div class="mc2-panel-title"><span class="mc2-title-icon">📋</span>今日任务</div>
            <button type="button" class="mc2-task-body" data-mc-go="workflow">
              <span class="mc2-book"></span>
              <span><div class="mc2-task-name">${escapeHtml(nextStep.title || taskName)}</div><div class="mc2-task-desc">${escapeHtml(taskDesc)}</div><div class="mc2-xp">◆ +20 经验</div><div class="mc2-progress"><span style="width:${Math.max(12,progress.percent)}%">${progress.done} / ${progress.total} 步</span></div></span>
              <span class="mc2-chest"></span>
            </button>
          </section>

          <section class="mc2-panel">
            <div class="mc2-panel-title"><span class="mc2-title-icon">🌳</span>技能树<button type="button" class="mc2-link" data-mc-go="skills">查看全部 ›</button></div>
            <div class="mc2-skills-grid">${topSkills().map(skillCard).join("")}</div>
          </section>

          <section class="mc2-panel">
            <div class="mc2-panel-title"><span class="mc2-title-icon">⛏️</span>项目工作流<button type="button" class="mc2-link" data-mc-go="generator">生成计划 ›</button></div>
            <div class="mc2-workflow-grid">${workflowCards()}</div>
          </section>

          <section class="mc2-levelbar">
            <span class="mc2-face mc2-level-face"></span>
            <span><div><b class="mc2-level-title">Lv.${level}</b>&nbsp;&nbsp;经验值</div><div class="mc2-hearts">♥♥♥♥♥♥♥♡</div><div class="mc2-xpbar"><span style="width:${xpPercent}%"></span></div><div class="mc2-small">${xpNow} / 1200</div></span>
            <button type="button" class="mc2-profile-btn" data-mc-go="profile">成长档案 📘</button>
          </section>
        </main>
      </div>`;

    el("mc2Mic").onclick = openDetailedInterview;
    el("mc2Settings").onclick = () => el("familyToolsBtn")?.click();
    document.querySelectorAll("[data-child]").forEach(button => button.onclick = () => {
      const id = button.dataset.child;
      if (id !== activeId) window.GrowthFamily?.switchTo?.(id);
    });
    document.querySelectorAll("[data-mc-go]").forEach(button => button.onclick = () => {
      const target = button.dataset.mcGo;
      if (target === "review") originalGo("review"); else originalGo(target);
    });
    scrollTo(0,0);
  }

  function openDetailedInterview() {
    document.body.classList.remove("mc-home-mode");
    sessionStorage.setItem(HOME_MODE_KEY,"detail");
    detailedRenderHome();
    const back = document.createElement("button");
    back.type = "button";
    back.className = "mc2-detail-back";
    back.textContent = "← 返回方块世界大厅";
    back.onclick = renderDashboard;
    el("home").prepend(back);
    scrollTo(0,0);
  }

  renderHome = function minecraftDashboardHome() {
    if (sessionStorage.getItem(HOME_MODE_KEY) === "detail") openDetailedInterview();
    else renderDashboard();
  };

  go = function minecraftDashboardGo(page) {
    if (page !== "home") document.body.classList.remove("mc-home-mode");
    originalGo(page);
  };

  window.addEventListener("DOMContentLoaded", () => renderDashboard());
})();
