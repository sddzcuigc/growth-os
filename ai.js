(() => {
  const AI_KEY = "growthOSAI";
  const fallbackGenerateTask = generateTask;
  const baseRenderGenerator = renderGenerator;

  function loadAiConfig() {
    const fallback = {
      mode: "auto",
      endpoint: location.hostname.endsWith(".vercel.app") ? "/api/compile" : "",
      accessCode: ""
    };
    try {
      return { ...fallback, ...(JSON.parse(localStorage.getItem(AI_KEY) || "null") || {}) };
    } catch (error) {
      return fallback;
    }
  }

  function saveAiConfig(config) {
    try {
      localStorage.setItem(AI_KEY, JSON.stringify(config));
    } catch (error) {
      console.warn("AI设置无法持久保存", error);
    }
  }

  function currentAiConfig() {
    return loadAiConfig();
  }

  function statusText(config) {
    if (config.mode === "template") return "仅使用模板回退编译器";
    if (!config.endpoint) return "AI尚未配置，当前自动使用模板回退";
    if (config.mode === "ai") return "仅使用AI；失败时显示错误";
    return "AI优先；失败时自动回退模板";
  }

  function injectAiControls() {
    const signal = el("profileSignal");
    if (!signal) return;
    let card = el("aiControlCard");
    if (!card) {
      card = document.createElement("div");
      card.id = "aiControlCard";
      card.className = "card";
      signal.insertAdjacentElement("afterend", card);
    }
    const config = currentAiConfig();
    card.innerHTML = `
      <div class="row between">
        <div>
          <span class="pill ${config.endpoint && config.mode !== "template" ? "green" : "orange"}">AI内核</span>
          <h3 style="margin-bottom:3px">${escapeHtml(statusText(config))}</h3>
          <div class="small">API密钥只保存在安全后端，浏览器不会保存OpenAI密钥。</div>
        </div>
        <button type="button" class="btn ghost small-btn" id="openAiSettingsBtn">设置</button>
      </div>`;
    el("openAiSettingsBtn")?.addEventListener("click", openAiSettings);
  }

  renderGenerator = function renderGeneratorWithAi() {
    baseRenderGenerator();
    injectAiControls();
  };

  function openAiSettings() {
    const config = currentAiConfig();
    el("sheet").innerHTML = `
      <div class="row between">
        <h2>AI内核设置</h2>
        <button type="button" class="btn ghost" id="closeAiSettingsBtn">关闭</button>
      </div>
      <div class="notice">ChatGPT订阅不能直接作为外部网页API使用。自动模式使用OpenAI API后端；API失败时可自动回退到本地模板。</div>
      <div class="field">
        <label>运行模式</label>
        <select id="aiModeInput">
          <option value="auto" ${config.mode === "auto" ? "selected" : ""}>AI优先，失败自动回退</option>
          <option value="ai" ${config.mode === "ai" ? "selected" : ""}>只使用AI</option>
          <option value="template" ${config.mode === "template" ? "selected" : ""}>只使用模板</option>
        </select>
      </div>
      <div class="field">
        <label>AI后端地址</label>
        <input id="aiEndpointInput" placeholder="https://你的项目.vercel.app/api/compile" value="${escapeHtml(config.endpoint)}">
        <div class="small">整站部署在Vercel时可以填写 <code>/api/compile</code>。</div>
      </div>
      <div class="field">
        <label>个人访问码</label>
        <input id="aiAccessCodeInput" type="password" autocomplete="off" placeholder="与后端 GROWTH_OS_ACCESS_CODE 一致" value="${escapeHtml(config.accessCode)}">
        <div class="small">这不是OpenAI API密钥，只是防止别人调用你的后端。</div>
      </div>
      <div class="grid2">
        <button type="button" class="btn" id="saveAiSettingsBtn">保存设置</button>
        <button type="button" class="btn secondary" id="testAiConnectionBtn">测试连接</button>
      </div>
      <div id="aiTestResult" class="small" style="margin-top:12px"></div>`;
    el("modal").classList.add("open");
    el("closeAiSettingsBtn").addEventListener("click", closeModal);
    el("saveAiSettingsBtn").addEventListener("click", () => {
      const next = {
        mode: el("aiModeInput").value,
        endpoint: el("aiEndpointInput").value.trim(),
        accessCode: el("aiAccessCodeInput").value
      };
      saveAiConfig(next);
      closeModal();
      renderGenerator();
    });
    el("testAiConnectionBtn").addEventListener("click", testAiConnection);
  }

  async function testAiConnection() {
    const result = el("aiTestResult");
    const endpoint = el("aiEndpointInput").value.trim();
    const accessCode = el("aiAccessCodeInput").value;
    if (!endpoint) {
      result.textContent = "请先填写后端地址。";
      return;
    }
    result.textContent = "正在测试……";
    try {
      const response = await fetch(endpoint, {
        method: "GET",
        headers: { "X-Growth-OS-Code": accessCode }
      });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.error || `HTTP ${response.status}`);
      result.innerHTML = `<span class="eligible">连接成功：${escapeHtml(data.service)} · ${escapeHtml(data.model)}</span>`;
    } catch (error) {
      result.innerHTML = `<span style="color:var(--red)">连接失败：${escapeHtml(error.message)}</span>`;
    }
  }

  function buildAiPayload() {
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

  function normalizeAiTask(task, payload, meta) {
    const selection = payload.selection;
    const normalized = {
      ...task,
      id: makeId(),
      compilerVersion: "openai-responses-v1",
      generatedBy: "AI",
      compiledAt: meta?.generatedAt || new Date().toISOString(),
      fingerprint: `AI|${selection.shell}|${selection.coreSkills.join("+")}|${Date.now()}`,
      shell: selection.shell,
      realUser: selection.realUser,
      problem: selection.problem,
      availableTime: selection.availableTime,
      coreSkills: [...selection.coreSkills],
      supportSkills: uniq(task.supportSkills || []).filter(skill => !selection.coreSkills.includes(skill)),
      maintenanceSkills: uniq(task.maintenanceSkills || []).filter(skill => !selection.coreSkills.includes(skill)),
      outputs: uniq(task.outputs || []),
      materials: uniq(task.materials || []),
      steps: (task.steps || []).map(step => ({
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
    if (!normalized.steps.length) throw new Error("AI返回的工作流为空");
    return normalized;
  }

  function renderAiPreview(task, meta) {
    const rationale = task.rationale ? `<div class="notice"><b>AI为什么这样设计</b><br>${escapeHtml(task.rationale)}</div>` : "";
    el("generatedTask").innerHTML = `
      <div class="card">
        <span class="pill green">AI因材施教方案</span>
        <h2>${escapeHtml(task.title)}</h2>
        <p class="small">${escapeHtml(task.purpose)}</p>
        ${matrix(task)}
        ${rationale}
        <p class="small">
          <b>交付：</b>${task.outputs.map(escapeHtml).join("、")}<br>
          <b>安全：</b>${escapeHtml(task.safety || "遵守家庭安全边界")}<br>
          <b>模型：</b>${escapeHtml(meta?.model || "OpenAI")}
        </p>
        <button id="useAiTaskBtn" class="btn full" type="button">使用这个AI方案</button>
      </div>`;
    el("useAiTaskBtn").addEventListener("click", () => {
      state.task = typeof structuredClone === "function" ? structuredClone(task) : JSON.parse(JSON.stringify(task));
      save();
      renderHome();
      go("workflow");
    });
  }

  async function requestAiTask(config) {
    const payload = buildAiPayload();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 65000);
    try {
      const response = await fetch(config.endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Growth-OS-Code": config.accessCode
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.error || `HTTP ${response.status}`);
      return { task: normalizeAiTask(data.task, payload, data.meta), meta: data.meta };
    } finally {
      clearTimeout(timeout);
    }
  }

  generateTask = async function generateTaskWithAi() {
    const config = currentAiConfig();
    if (config.mode === "template") {
      return fallbackGenerateTask();
    }
    if (!chosenSkills.length) {
      alert("至少选择1项核心培养技能。");
      return;
    }
    if (!config.endpoint) {
      if (config.mode === "ai") {
        openAiSettings();
        return;
      }
      fallbackGenerateTask();
      el("generatedTask").insertAdjacentHTML("afterbegin", `<div class="notice"><b>已使用模板回退</b><br>AI后端尚未配置。点击上方“AI内核设置”完成连接。</div>`);
      return;
    }

    el("generatedTask").innerHTML = `<div class="card"><span class="pill purple">AI正在分析</span><h3>正在读取孩子画像、技能树和当前选择……</h3><div class="small">通常需要数秒到一分钟。失败后${config.mode === "auto" ? "会自动回退模板" : "会显示错误"}。</div></div>`;
    try {
      const result = await requestAiTask(config);
      renderAiPreview(result.task, result.meta);
    } catch (error) {
      const message = error.name === "AbortError" ? "AI请求超时" : error.message;
      if (config.mode === "auto") {
        fallbackGenerateTask();
        el("generatedTask").insertAdjacentHTML("afterbegin", `<div class="notice"><b>AI调用失败，已自动回退模板</b><br>${escapeHtml(message)}</div>`);
      } else {
        el("generatedTask").innerHTML = `<div class="card"><span class="pill orange">AI调用失败</span><h3>${escapeHtml(message)}</h3><button type="button" class="btn ghost" id="retryAiBtn">重新尝试</button></div>`;
        el("retryAiBtn")?.addEventListener("click", generateTask);
      }
    }
  };

  window.addEventListener("DOMContentLoaded", injectAiControls);
})();
