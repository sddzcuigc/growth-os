(() => {
  const BRIDGE_CONFIG_KEY = "growthOSPlusAction";
  const ACTIVE_REQUEST_KEY = "growthOSPlusActionRequest";
  const DEFAULT_BACKEND = "https://growth-os-ten-pearl.vercel.app";
  const previousRenderGenerator = renderGenerator;
  const previousGenerateTask = generateTask;
  let pollingTimer = null;

  function defaultBridgeConfig() {
    return {
      enabled: false,
      backendBase: DEFAULT_BACKEND,
      bridgeKey: sessionStorage.getItem("growthOSBridgeKey") || "",
      customGptUrl: "https://chatgpt.com/",
      autoOpen: true,
      autoApply: true
    };
  }

  function loadBridgeConfig() {
    try {
      const saved = JSON.parse(localStorage.getItem(BRIDGE_CONFIG_KEY) || "null") || {};
      return {
        ...defaultBridgeConfig(),
        ...saved,
        backendBase: saved.backendBase || DEFAULT_BACKEND,
        bridgeKey: sessionStorage.getItem("growthOSBridgeKey") || ""
      };
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

  function generateBridgeKey() {
    const bytes = new Uint8Array(32);
    crypto.getRandomValues(bytes);
    const base64 = btoa(String.fromCharCode(...bytes))
      .replaceAll("+", "-")
      .replaceAll("/", "_")
      .replaceAll("=", "");
    return `gos_${base64}`;
  }

  function healthSummary(data) {
    if (data?.ready) return "桥接后端、访问码和Redis均已就绪";
    const problems = [];
    if (!data?.authConfigured) problems.push("Vercel未配置 GROWTH_OS_BRIDGE_KEY");
    else if (data?.authValid === false) problems.push("当前访问码与Vercel不一致");
    if (!data?.redisConfigured) problems.push("尚未连接Upstash Redis");
    else if (!data?.redisReachable) problems.push(data?.redisError || "Redis无法连接");
    return problems.join("；") || data?.error || "桥接尚未就绪";
  }

  async function fetchJson(url, options = {}) {
    const response = await fetch(url, options);
    let data;
    try {
      data = await response.json();
    } catch {
      throw new Error(`服务器返回了无法解析的内容（HTTP ${response.status}）`);
    }
    return { response, data };
  }

  async function checkBridgeHealth(config) {
    const { response, data } = await fetchJson(joinUrl(config.backendBase, "/api/bridge/health"), {
      headers: config.bridgeKey ? { "X-Growth-OS-Code": config.bridgeKey } : {}
    });
    if (!response.ok && !data) throw new Error(`健康检查失败：HTTP ${response.status}`);
    return data;
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
    const hasKey = Boolean(config.bridgeKey);
    const statusText = config.enabled
      ? (hasKey ? "已启用，等待连接测试" : "已启用，但缺少访问码")
      : "尚未启用";

    card.innerHTML = `
      <div class="row between">
        <div>
          <span class="pill ${config.enabled && hasKey ? "green" : "gray"}">Plus Action自动桥接</span>
          <h3 style="margin-bottom:3px">${escapeHtml(statusText)}</h3>
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

  function formConfig() {
    return {
      enabled: Boolean(el("bridgeEnabledInput")?.checked),
      backendBase: el("bridgeBackendInput")?.value.trim() || DEFAULT_BACKEND,
      bridgeKey: el("bridgeKeyInput")?.value || "",
      customGptUrl: el("customGptUrlInput")?.value.trim() || "https://chatgpt.com/",
      autoOpen: Boolean(el("bridgeAutoOpenInput")?.checked),
      autoApply: Boolean(el("bridgeAutoApplyInput")?.checked)
    };
  }

  function renderHealthResult(data) {
    const box = el("bridgeHealthResult");
    if (!box) return;
    const ready = Boolean(data?.ready);
    box.innerHTML = `
      <div class="notice">
        <b>${ready ? "连接成功" : "尚未就绪"}</b><br>
        ${escapeHtml(healthSummary(data))}<br>
        <span class="small">认证：${data?.authConfigured ? (data?.authValid === false ? "访问码错误" : "已配置") : "未配置"}；Redis：${data?.redisReachable ? "已连接" : data?.redisConfigured ? "连接失败" : "未配置"}</span>
      </div>`;
  }

  async function testBridgeFromSettings() {
    const button = el("testBridgeBtn");
    if (button) {
      button.disabled = true;
      button.textContent = "正在测试…";
    }
    try {
      const config = formConfig();
      const data = await checkBridgeHealth(config);
      renderHealthResult(data);
    } catch (error) {
      renderHealthResult({ ready: false, error: error.message });
    } finally {
      if (button) {
        button.disabled = false;
        button.textContent = "测试连接";
      }
    }
  }

  function openBridgeSettings() {
    const config = loadBridgeConfig();
    el("sheet").innerHTML = `
      <div class="row between">
        <h2>Plus Action自动桥接</h2>
        <button type="button" class="btn ghost" id="closeBridgeSettingsBtn">关闭</button>
      </div>
      <div class="notice">后端地址已经替你填写。现在只需配置Vercel访问码、Redis和自定义GPT。</div>
      <label class="checkline"><input type="checkbox" id="bridgeEnabledInput" ${config.enabled ? "checked" : ""}> 在Plus模式下启用自动桥接</label>
      <div class="field">
        <label>Vercel后端根地址</label>
        <input id="bridgeBackendInput" value="${escapeHtml(config.backendBase)}" placeholder="${DEFAULT_BACKEND}">
      </div>
      <div class="field">
        <label>桥接访问码</label>
        <input id="bridgeKeyInput" type="password" autocomplete="off" value="${escapeHtml(config.bridgeKey)}" placeholder="与 GROWTH_OS_BRIDGE_KEY 完全相同">
        <div class="small">访问码仅保存在当前浏览器会话，不写入GitHub。</div>
        <button type="button" class="btn ghost full" id="generateBridgeKeyBtn" style="margin-top:8px">生成并复制安全访问码</button>
      </div>
      <div class="field">
        <label>你的自定义GPT地址</label>
        <input id="customGptUrlInput" value="${escapeHtml(config.customGptUrl)}" placeholder="https://chatgpt.com/g/g-...">
      </div>
      <label class="checkline"><input type="checkbox" id="bridgeAutoOpenInput" ${config.autoOpen ? "checked" : ""}> 创建任务后自动打开自定义GPT</label>
      <label class="checkline"><input type="checkbox" id="bridgeAutoApplyInput" ${config.autoApply ? "checked" : ""}> GPT写回后自动采用方案并进入工作流</label>
      <div class="grid2" style="margin-top:12px">
        <button type="button" class="btn secondary" id="testBridgeBtn">测试连接</button>
        <button type="button" class="btn" id="saveBridgeSettingsBtn">保存设置</button>
      </div>
      <div id="bridgeHealthResult" style="margin-top:10px"></div>`;

    el("modal").classList.add("open");
    el("closeBridgeSettingsBtn").onclick = closeModal;
    el("generateBridgeKeyBtn").onclick = async () => {
      const key = generateBridgeKey();
      el("bridgeKeyInput").value = key;
      await copyText(key);
      renderHealthResult({
        ready: false,
        error: "访问码已生成并复制。把它粘贴到Vercel的 GROWTH_OS_BRIDGE_KEY，再粘贴到自定义GPT Action的Bearer API Key。"
      });
    };
    el("testBridgeBtn").onclick = testBridgeFromSettings;
    el("saveBridgeSettingsBtn").onclick = () => {
      saveBridgeConfig(formConfig());
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

  function clone(value) {
    return typeof structuredClone === "function"
      ? structuredClone(value)
      : JSON.parse(JSON.stringify(value));
  }

  function normalizePlan(plan, context) {
    const selection = context.selection;
    const normalized = {
      ...plan,
      id: makeId(),
      compilerVersion: "plus-action-bridge-v1.1",
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

  function applyPlan(plan) {
    state.task = clone(plan);
    save();
    renderHome();
  }

  function renderCompletedPlan(plan, summary, config) {
    localStorage.removeItem(ACTIVE_REQUEST_KEY);
    if (config.autoApply) applyPlan(plan);

    el("generatedTask").innerHTML = `
      <div class="card">
        <span class="pill green">ChatGPT Plus Action已写回</span>
        <h2>${escapeHtml(plan.title)}</h2>
        <p class="small">${escapeHtml(plan.purpose)}</p>
        ${matrix(plan)}
        ${summary ? `<div class="notice"><b>GPT摘要</b><br>${escapeHtml(summary)}</div>` : ""}
        ${plan.rationale ? `<div class="notice"><b>为什么这样设计</b><br>${escapeHtml(plan.rationale)}</div>` : ""}
        <p class="small"><b>交付：</b>${plan.outputs.map(escapeHtml).join("、")}<br><b>安全：</b>${escapeHtml(plan.safety || "遵守家庭安全边界")}</p>
        <button id="useActionPlanBtn" type="button" class="btn green full">${config.autoApply ? "已自动采用，进入工作流" : "使用并进入工作流"}</button>
      </div>`;

    el("useActionPlanBtn").onclick = () => {
      if (!config.autoApply) applyPlan(plan);
      go("workflow");
    };

    if (config.autoApply) {
      setTimeout(() => go("workflow"), 900);
    }
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
        <button type="button" class="btn ghost full" id="cancelBridgePollingBtn" style="margin-top:10px">暂停查询</button>
      </div>`;
    el("copyBridgeCommandBtn").onclick = () => copyText(command).then(() => alert("任务命令已复制"));
    el("openCustomGptBtn").onclick = () => window.open(config.customGptUrl || "https://chatgpt.com/", "_blank", "noopener");
    el("cancelBridgePollingBtn").onclick = () => {
      if (pollingTimer) clearTimeout(pollingTimer);
      pollingTimer = null;
      const text = el("bridgePollingText");
      if (text) text.textContent = "已暂停查询。刷新页面后会自动继续等待。";
    };
  }

  async function pollResult(config, requestId, context, startedAt) {
    if (Date.now() - startedAt > 60 * 60 * 1000) {
      const text = el("bridgePollingText");
      if (text) text.textContent = "持续等待超过1小时。任务仍保留7天，可刷新页面继续查询。";
      return;
    }

    try {
      const { response, data } = await fetchJson(
        joinUrl(config.backendBase, `/api/bridge/status?id=${encodeURIComponent(requestId)}`),
        { headers: { "X-Growth-OS-Code": config.bridgeKey } }
      );
      if (!response.ok || !data.ok) throw new Error(data.error || `HTTP ${response.status}`);

      if (data.status === "complete" && data.plan) {
        const plan = normalizePlan(data.plan, context);
        renderCompletedPlan(plan, data.summary || "", config);
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
    if (!config.bridgeKey) {
      openBridgeSettings();
      return;
    }

    el("generatedTask").innerHTML = `<div class="card"><span class="pill purple">正在检查桥接</span><h3>正在验证Vercel、访问码和Redis……</h3></div>`;

    try {
      const health = await checkBridgeHealth(config);
      if (!health.ready || health.authValid === false) {
        throw new Error(healthSummary(health));
      }
    } catch (error) {
      el("generatedTask").innerHTML = `<div class="card"><span class="pill orange">桥接尚未就绪</span><h3>${escapeHtml(error.message)}</h3><button type="button" class="btn full" id="openBridgeFixBtn">打开桥接设置</button></div>`;
      el("openBridgeFixBtn").onclick = openBridgeSettings;
      return;
    }

    const context = buildContext();
    let customGptWindow = null;
    if (config.autoOpen) customGptWindow = window.open("about:blank", "_blank");

    el("generatedTask").innerHTML = `<div class="card"><span class="pill purple">正在发布请求</span><h3>正在把成长上下文发送到桥接后端……</h3></div>`;

    try {
      const { response, data } = await fetchJson(joinUrl(config.backendBase, "/api/bridge/create"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Growth-OS-Code": config.bridgeKey
        },
        body: JSON.stringify({ context })
      });
      if (!response.ok || !data.ok) throw new Error(data.error || `HTTP ${response.status}`);

      const activeRequest = {
        id: data.id,
        command: data.command,
        context,
        startedAt: Date.now()
      };
      localStorage.setItem(ACTIVE_REQUEST_KEY, JSON.stringify(activeRequest));

      await copyText(data.command);
      if (customGptWindow) customGptWindow.location.href = config.customGptUrl || "https://chatgpt.com/";
      renderWaiting(data.id, data.command, config);
      pollResult(config, data.id, context, activeRequest.startedAt);
    } catch (error) {
      if (customGptWindow) customGptWindow.close();
      el("generatedTask").innerHTML = `<div class="card"><span class="pill orange">桥接失败</span><h3>${escapeHtml(error.message)}</h3><div class="small">打开桥接设置并重新测试连接。</div></div>`;
    }
  }

  function resumePendingBridge() {
    const config = loadBridgeConfig();
    if (!config.enabled || loadAiMode() !== "plus" || !config.bridgeKey) return;

    try {
      const pending = JSON.parse(localStorage.getItem(ACTIVE_REQUEST_KEY) || "null");
      if (!pending?.id || !pending?.context) return;
      if (Date.now() - Number(pending.startedAt || 0) > 7 * 24 * 60 * 60 * 1000) {
        localStorage.removeItem(ACTIVE_REQUEST_KEY);
        return;
      }
      renderWaiting(pending.id, pending.command || `处理成长规划任务 ${pending.id}`, config);
      pollResult(config, pending.id, pending.context, Date.now());
    } catch (error) {
      console.warn("无法恢复Plus Action任务", error);
    }
  }

  generateTask = async function generateTaskWithAutoBridge() {
    const config = loadBridgeConfig();
    if (loadAiMode() === "plus" && config.enabled) {
      return startBridge();
    }
    return previousGenerateTask();
  };

  window.addEventListener("DOMContentLoaded", () => {
    injectBridgeCard();
    resumePendingBridge();
  });
})();
