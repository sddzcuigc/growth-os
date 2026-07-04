(() => {
  const BRIDGE_CONFIG_KEY = "growthOSPlusAction";
  const previousRenderGenerator = renderGenerator;
  const previousGenerateTask = generateTask;
  let pollingTimer = null;

  function defaultBridgeConfig() {
    return {
      enabled: false,
      backendBase: "",
      bridgeKey: sessionStorage.getItem("growthOSBridgeKey") || "",
      customGptUrl: "https://chatgpt.com/",
      autoOpen: true
    };
  }

  function loadBridgeConfig() {
    try {
      const saved = JSON.parse(localStorage.getItem(BRIDGE_CONFIG_KEY) || "null") || {};
      return { ...defaultBridgeConfig(), ...saved, bridgeKey: sessionStorage.getItem("growthOSBridgeKey") || "" };
    } catch (error) {
      return defaultBridgeConfig();
    }
  }

  function saveBridgeConfig(config) {
    const { bridgeKey, ...persistent } = config;
    localStorage.setItem(BRIDGE_CONFIG_KEY, JSON.stringify(persistent));
    sessionStorage.setItem("growthOSBridgeKey", bridgeKey || "");
  }

  function loadAiMode() {
    try {
      const config = JSON.parse(localStorage.getItem("growthOSAI") || "null") || {};
      return config.mode || "plus";
    } catch (error) {
      return "plus";
    }
  }

  function joinUrl(base, path) {
    return `${String(base || "").replace(/\/$/, "")}${path}`;
  }

  function injectBridgeCard() {
    const anchor = el("aiControlCard") || el("profileSignal");
    if (!anchor) return;

    let card = el("plusActionCard");
    if (!card) {
      card = document.createElement("div");
      card.id = "plusActionCard";
      card.className = "card";
      anchor.insertAdjacentElement("afterend", card);
    }

    const config = loadBridgeConfig();
    card.innerHTML = `
      <div class="row between">
        <div>
          <span class="pill ${config.enabled ? "green" : "gray"}">Plus Action自动桥接</span>
          <h3 style="margin-bottom:3px">${config.enabled ? "已启用" : "尚未启用"}</h3>
          <div class="small">发布请求、打开自定义GPT、等待Action写回并自动导入。</div>
        </div>
        <button type="button" class="btn ghost small-btn" id="openBridgeSettingsBtn">设置</button>
      </div>`;
    el("openBridgeSettingsBtn")?.addEventListener("click", openBridgeSettings);
  }

  renderGenerator = function renderGeneratorWithBridge() {
    previousRenderGenerator();
    injectBridgeCard();
  };

  function openBridgeSettings() {
    const config = loadBridgeConfig();
    el("sheet").innerHTML = `
      <div class="row between">
        <h2>Plus Action自动桥接</h2>
        <button type="button" class="btn ghost" id="closeBridgeSettingsBtn">关闭</button>
      </div>
      <div class="notice">启用后，成长OS会把本次上下文保存到桥接后端。你只需在自定义GPT里发送一次任务编号，GPT会自动读取、生成并写回。</div>
      <label class="checkline"><input type="checkbox" id="bridgeEnabledInput" ${config.enabled ? "checked" : ""}> 在Plus模式下启用自动桥接</label>
      <div class="field">
        <label>Vercel后端根地址</label>
        <input id="bridgeBackendInput" value="${escapeHtml(config.backendBase)}" placeholder="https://你的项目.vercel.app">
      </div>
      <div class="field">
        <label>桥接访问码</label>
        <input id="bridgeKeyInput" type="password" autocomplete="off" value="${escapeHtml(config.bridgeKey)}" placeholder="与 GROWTH_OS_BRIDGE_KEY 相同">
        <div class="small">访问码仅保存在当前浏览器会话。</div>
      </div>
      <div class="field">
        <label>你的自定义GPT地址</label>
        <input id="customGptUrlInput" value="${escapeHtml(config.customGptUrl)}" placeholder="https://chatgpt.com/g/g-...">
      </div>
      <label class="checkline"><input type="checkbox" id="bridgeAutoOpenInput" ${config.autoOpen ? "checked" : ""}> 创建任务后自动打开自定义GPT</label>
      <button type="button" class="btn full" id="saveBridgeSettingsBtn">保存设置</button>`;

    el("modal").classList.add("open");
    el("closeBridgeSettingsBtn").onclick = closeModal;
    el("saveBridgeSettingsBtn").onclick = () => {
      saveBridgeConfig({
        enabled: el("bridgeEnabledInput").checked,
        backendBase: el("bridgeBackendInput").value.trim(),
        bridgeKey: el("bridgeKeyInput").value,
        customGptUrl: el("customGptUrlInput").value.trim() || "https://chatgpt.com/",
        autoOpen: el("bridgeAutoOpenInput").checked
      });
      closeModal();
      renderGenerator();
    };
  }

  function buildContext() {
    return {
      child: state.child,
      skillTree: Object.fromEntries(Object.entries(state.skills).map(([name, data]) => [name, {
        level: data.level,
        evidenceCount: Array.isArray(data.evidence) ? data.evidence.length : 0
      }])),
      selection: {
        shell: chosenShell,
        coreSkills: [...chosenSkills],
        realUser: el("realUser").value.trim() || "家人",
        problem: el("realProblem").value.trim() || "解决一个真实家庭问题",
        availableTime: Number(el("availableTime").value || 35)
      },
      recentReviews: (state.reviews || []).slice(0, 5),
      principles: [
        "真实目的优先",
        "熟悉外壳承载综合能力",
        "核心技能必须真正改写工作流",
        "家长只示范最小样例",
        "老人只守流程和安全",
        "必须有真实用户测试、修改、收尾和迁移",
        "AI不能替孩子完成全部成果"
      ]
    };
  }

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      const input = document.createElement("textarea");
      input.value = text;
      input.style.position = "fixed";
      input.style.opacity = "0";
      document.body.appendChild(input);
      input.select();
      const ok = document.execCommand("copy");
      input.remove();
      return ok;
    }
  }

  function normalizePlan(plan, context) {
    const selection = context.selection;
    const normalized = {
      ...plan,
      id: makeId(),
      compilerVersion: "plus-action-bridge-v1",
      generatedBy: "ChatGPT Plus Action",
      compiledAt: new Date().toISOString(),
      fingerprint: `PLUS-ACTION|${selection.shell}|${selection.coreSkills.join("+")}|${Date.now()}`,
      shell: selection.shell,
      realUser: selection.realUser,
      problem: selection.problem,
      availableTime: selection.availableTime,
      coreSkills: [...selection.coreSkills],
      supportSkills: uniq(plan.supportSkills || []).filter(skill => !selection.coreSkills.includes(skill)),
      maintenanceSkills: uniq(plan.maintenanceSkills || []).filter(skill => !selection.coreSkills.includes(skill)),
      outputs: uniq(plan.outputs || []),
      materials: uniq(plan.materials || []),
      steps: (plan.steps || []).map(step => ({
        id: makeId(),
        phase: step.phase || "执行",
        title: step.title || "推进任务",
        purpose: step.purpose || step.standard || "完成本步骤目标",
        child: step.child || "完成本步骤行动",
        parent: step.parent || "只提供最小必要帮助",
        elder: step.elder || "提醒一次并守住安全",
        duration: Number(step.duration || selection.availableTime),
        evidence: step.evidence || "阶段成果",
        standard: step.standard || "达到可验证的完成标准",
        skills: uniq(step.skills || []),
        skillTraining: Array.isArray(step.skillTraining) ? step.skillTraining : [],
        done: false,
        note: ""
      }))
    };
    if (normalized.steps.length < 6) throw new Error("Action返回的工作流不足6步");
    return normalized;
  }

  function renderCompletedPlan(plan, summary) {
    el("generatedTask").innerHTML = `
      <div class="card">
        <span class="pill green">ChatGPT Plus Action已写回</span>
        <h2>${escapeHtml(plan.title)}</h2>
        <p class="small">${escapeHtml(plan.purpose)}</p>
        ${matrix(plan)}
        ${summary ? `<div class="notice"><b>GPT摘要</b><br>${escapeHtml(summary)}</div>` : ""}
        ${plan.rationale ? `<div class="notice"><b>为什么这样设计</b><br>${escapeHtml(plan.rationale)}</div>` : ""}
        <p class="small"><b>交付：</b>${plan.outputs.map(escapeHtml).join("、")}<br><b>安全：</b>${escapeHtml(plan.safety || "遵守家庭安全边界")}</p>
        <button id="useActionPlanBtn" type="button" class="btn green full">使用并进入工作流</button>
      </div>`;
    el("useActionPlanBtn").onclick = () => {
      state.task = typeof structuredClone === "function" ? structuredClone(plan) : JSON.parse(JSON.stringify(plan));
      save();
      renderHome();
      go("workflow");
    };
  }

  function renderWaiting(requestId, command, config) {
    el("generatedTask").innerHTML = `
      <div class="card">
        <span class="pill purple">等待ChatGPT Plus</span>
        <h3>请求已发布：${escapeHtml(requestId)}</h3>
        <div class="notice"><b>下一步</b><br>自定义GPT已打开或即将打开。发送：<br><code>${escapeHtml(command)}</code></div>
        <div class="small" id="bridgePollingText">正在等待GPT Action生成并写回方案……</div>
        <div class="grid2" style="margin-top:12px">
          <button type="button" class="btn secondary" id="copyBridgeCommandBtn">复制命令</button>
          <button type="button" class="btn ghost" id="openCustomGptBtn">打开自定义GPT</button>
        </div>
        <button type="button" class="btn ghost full" id="cancelBridgePollingBtn" style="margin-top:10px">停止等待</button>
      </div>`;
    el("copyBridgeCommandBtn").onclick = () => copyText(command).then(() => alert("任务命令已复制"));
    el("openCustomGptBtn").onclick = () => window.open(config.customGptUrl || "https://chatgpt.com/", "_blank", "noopener");
    el("cancelBridgePollingBtn").onclick = () => {
      if (pollingTimer) clearTimeout(pollingTimer);
      pollingTimer = null;
      el("bridgePollingText").textContent = "已停止等待。请求仍保留，可以稍后继续查询。";
    };
  }

  async function pollResult(config, requestId, context, startedAt) {
    if (Date.now() - startedAt > 15 * 60 * 1000) {
      const text = el("bridgePollingText");
      if (text) text.textContent = "等待超过15分钟。请求仍保留，可重新生成或稍后查询。";
      return;
    }

    try {
      const response = await fetch(joinUrl(config.backendBase, `/api/bridge/status?id=${encodeURIComponent(requestId)}`), {
        headers: { "X-Growth-OS-Code": config.bridgeKey }
      });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.error || `HTTP ${response.status}`);

      if (data.status === "complete" && data.plan) {
        const plan = normalizePlan(data.plan, context);
        renderCompletedPlan(plan, data.summary || "");
        pollingTimer = null;
        return;
      }

      const text = el("bridgePollingText");
      if (text) text.textContent = `正在等待GPT Action写回……最后检查：${new Date().toLocaleTimeString()}`;
    } catch (error) {
      const text = el("bridgePollingText");
      if (text) text.textContent = `暂时无法查询：${error.message}。系统会继续重试。`;
    }

    pollingTimer = setTimeout(() => pollResult(config, requestId, context, startedAt), 4000);
  }

  async function startBridge() {
    const config = loadBridgeConfig();
    if (!chosenSkills.length) return alert("至少选择1项核心培养技能");
    if (!config.backendBase || !config.bridgeKey) {
      openBridgeSettings();
      return;
    }

    const context = buildContext();
    let customGptWindow = null;
    if (config.autoOpen) customGptWindow = window.open("about:blank", "_blank");

    el("generatedTask").innerHTML = `<div class="card"><span class="pill purple">正在发布请求</span><h3>正在把成长上下文发送到安全桥接后端……</h3></div>`;

    try {
      const response = await fetch(joinUrl(config.backendBase, "/api/bridge/create"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Growth-OS-Code": config.bridgeKey
        },
        body: JSON.stringify({ context })
      });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.error || `HTTP ${response.status}`);

      await copyText(data.command);
      if (customGptWindow) customGptWindow.location.href = config.customGptUrl || "https://chatgpt.com/";
      renderWaiting(data.id, data.command, config);
      pollResult(config, data.id, context, Date.now());
    } catch (error) {
      if (customGptWindow) customGptWindow.close();
      el("generatedTask").innerHTML = `<div class="card"><span class="pill orange">桥接失败</span><h3>${escapeHtml(error.message)}</h3><div class="small">检查Vercel地址、桥接访问码和Redis环境变量。</div></div>`;
    }
  }

  generateTask = async function generateTaskWithAutoBridge() {
    const config = loadBridgeConfig();
    if (loadAiMode() === "plus" && config.enabled) {
      return startBridge();
    }
    return previousGenerateTask();
  };

  window.addEventListener("DOMContentLoaded", injectBridgeCard);
})();
