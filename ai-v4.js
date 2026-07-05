(() => {
  const AI_KEY = "growthOSAI";
  const fallbackGenerateTask = generateTask;
  const baseRenderGenerator = renderGenerator;
  const PLUS_INSTRUCTIONS = `你是“成长OS”的因材施教规划引擎。请根据我提供的孩子画像、技能树、历史证据、项目外壳、核心技能、真实使用者、家庭问题和时间，生成一个可执行、可验证、可迁移的综合项目。

必须遵守：
1. 真实目的优先。
2. 所选项目外壳和核心技能原样保留。
3. 核心技能必须真正改写步骤、家长教学、证据和标准，不能只贴标签。
4. 输出6—8步，覆盖目的、学习、设计、执行、测试、修改、交付、迁移。
5. 每步写清phase,title,purpose,child,parent,elder,duration,evidence,standard,skills,skillTraining。
6. 只返回JSON对象，不要Markdown代码块。
7. 顶层必须包含title,purpose,shell,realUser,problem,availableTime,coreSkills,supportSkills,maintenanceSkills,outputs,materials,safety,rationale,steps。`;

  const PROVIDER_LABELS = {
    openai: "OpenAI",
    deepseek: "DeepSeek",
    kimi: "Kimi / Moonshot",
    glm: "智谱GLM",
    siliconflow: "硅基流动 SiliconFlow",
    gpustack: "GPUStack",
    custom: "其他OpenAI兼容API"
  };

  const PROVIDER_DEFAULT_MODELS = {
    openai: "gpt-5-mini",
    deepseek: "deepseek-chat",
    siliconflow: "deepseek-ai/DeepSeek-V4-Flash"
  };

  function defaults() {
    return {
      mode: "plus",
      fallback: true,
      provider: "openai",
      model: "",
      backendEndpoint: location.hostname.endsWith(".vercel.app") ? "/api/compile" : "",
      accessCode: sessionStorage.getItem("growthOSAccessCode") || "",
      ollamaEndpoint: "http://localhost:11434",
      ollamaModel: "",
      chatgptUrl: "https://chatgpt.com/"
    };
  }

  function loadConfig() {
    try {
      const old = JSON.parse(localStorage.getItem(AI_KEY) || "null") || {};
      if (old.mode === "auto" || old.mode === "ai") old.mode = "api";
      if (old.endpoint && !old.backendEndpoint) old.backendEndpoint = old.endpoint;
      return { ...defaults(), ...old, accessCode: sessionStorage.getItem("growthOSAccessCode") || "" };
    } catch {
      return defaults();
    }
  }

  function saveConfig(config) {
    try {
      const { accessCode, ...persisted } = config;
      localStorage.setItem(AI_KEY, JSON.stringify(persisted));
      sessionStorage.setItem("growthOSAccessCode", accessCode || "");
    } catch (error) {
      console.warn("AI设置无法保存", error);
    }
  }

  function status(config) {
    if (config.mode === "plus") return "ChatGPT Plus桥接";
    if (config.mode === "api") return `API：${PROVIDER_LABELS[config.provider] || config.provider}${config.model ? ` / ${config.model}` : ""}`;
    if (config.mode === "ollama") return `本地Ollama${config.ollamaModel ? ` / ${config.ollamaModel}` : ""}`;
    return "仅使用模板回退";
  }

  function injectControls() {
    const signal = el("profileSignal");
    if (!signal) return;
    let card = el("aiControlCard");
    if (!card) {
      card = document.createElement("div");
      card.id = "aiControlCard";
      card.className = "card";
      signal.insertAdjacentElement("afterend", card);
    }
    const config = loadConfig();
    card.innerHTML = `<div class="row between"><div><span class="pill ${config.mode === "template" ? "orange" : "green"}">AI内核</span><h3 style="margin-bottom:3px">${escapeHtml(status(config))}</h3><div class="small">支持Plus桥接、硅基流动、主流API、本地Ollama和模板回退。</div></div><button type="button" class="btn ghost small-btn" id="openAiSettingsBtn">设置</button></div>`;
    el("openAiSettingsBtn")?.addEventListener("click", openSettings);
  }

  renderGenerator = function renderGeneratorWithAiControls() {
    baseRenderGenerator();
    injectControls();
  };

  function providerOptions(selected) {
    return Object.entries(PROVIDER_LABELS)
      .map(([value, label]) => `<option value="${value}" ${selected === value ? "selected" : ""}>${escapeHtml(label)}</option>`)
      .join("");
  }

  function openSettings() {
    const config = loadConfig();
    el("sheet").innerHTML = `
      <div class="row between"><h2>AI内核设置</h2><button type="button" class="btn ghost" id="closeAiSettingsBtn">关闭</button></div>
      <div class="field"><label>运行方式</label><select id="aiModeInput"><option value="plus" ${config.mode === "plus" ? "selected" : ""}>ChatGPT Plus桥接</option><option value="api" ${config.mode === "api" ? "selected" : ""}>多供应商API</option><option value="ollama" ${config.mode === "ollama" ? "selected" : ""}>本地Ollama</option><option value="template" ${config.mode === "template" ? "selected" : ""}>模板回退</option></select></div>
      <div class="notice"><b>Plus桥接</b>使用你登录的ChatGPT手工发送一次、粘贴一次，不产生API模型费；外部网页不能直接读取ChatGPT登录态。</div>
      <div class="field"><label>ChatGPT / 自定义GPT地址</label><input id="chatgptUrlInput" value="${escapeHtml(config.chatgptUrl)}" placeholder="https://chatgpt.com/g/g-...或https://chatgpt.com/"></div>
      <hr>
      <div class="field"><label>API供应商</label><select id="providerInput">${providerOptions(config.provider)}</select></div>
      <div class="field"><label>模型名称</label><input id="modelInput" value="${escapeHtml(config.model)}" placeholder="硅基流动留空默认使用 deepseek-ai/DeepSeek-V4-Flash"></div>
      <div class="field"><label>统一后端地址</label><input id="backendEndpointInput" value="${escapeHtml(config.backendEndpoint)}" placeholder="https://你的项目.vercel.app/api/compile"></div>
      <div class="field"><label>个人访问码</label><input id="accessCodeInput" type="password" value="${escapeHtml(config.accessCode)}" placeholder="与后端环境变量 GROWTH_OS_ACCESS_CODE 一致"></div>
      <div class="notice"><b>硅基流动</b><br>API密钥只放在Vercel的 <code>SILICONFLOW_API_KEY</code>，不要填写到网页或提交到GitHub。基础地址由后端固定为官方OpenAI兼容接口。</div>
      <hr>
      <div class="field"><label>Ollama地址</label><input id="ollamaEndpointInput" value="${escapeHtml(config.ollamaEndpoint)}" placeholder="http://localhost:11434"></div>
      <div class="field"><label>Ollama模型</label><input id="ollamaModelInput" value="${escapeHtml(config.ollamaModel)}" placeholder="例如 qwen3:8b"></div>
      <label class="checkline"><input type="checkbox" id="fallbackInput" ${config.fallback ? "checked" : ""}> API或Ollama失败时自动回退模板</label>
      <button type="button" class="btn full" id="saveAiSettingsBtn">保存设置</button>`;

    el("modal").classList.add("open");
    el("closeAiSettingsBtn").onclick = closeModal;
    el("providerInput").onchange = event => {
      const defaultModel = PROVIDER_DEFAULT_MODELS[event.target.value] || "";
      if (!el("modelInput").value.trim() && defaultModel) el("modelInput").placeholder = `留空默认使用 ${defaultModel}`;
    };
    el("saveAiSettingsBtn").onclick = () => {
      saveConfig({
        mode: el("aiModeInput").value,
        fallback: el("fallbackInput").checked,
        provider: el("providerInput").value,
        model: el("modelInput").value.trim(),
        backendEndpoint: el("backendEndpointInput").value.trim(),
        accessCode: el("accessCodeInput").value,
        ollamaEndpoint: el("ollamaEndpointInput").value.trim(),
        ollamaModel: el("ollamaModelInput").value.trim(),
        chatgptUrl: el("chatgptUrlInput").value.trim() || "https://chatgpt.com/"
      });
      closeModal();
      renderGenerator();
    };
  }

  function payload() {
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
      principles: ["真实目的优先", "熟悉外壳承载综合能力", "核心技能必须真正改写工作流", "家长只示范最小样例", "老人只守流程和安全", "必须测试、修改、收尾和迁移"]
    };
  }

  function stripJson(text) {
    const raw = String(text || "").trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
    const start = raw.indexOf("{");
    const end = raw.lastIndexOf("}");
    return start >= 0 && end > start ? raw.slice(start, end + 1) : raw;
  }

  function normalize(task, context, meta = {}) {
    const selection = context.selection;
    const output = {
      ...task,
      id: makeId(),
      compilerVersion: meta.compilerVersion || "external-ai-v1",
      generatedBy: meta.provider || "AI",
      compiledAt: new Date().toISOString(),
      fingerprint: `${meta.provider || "AI"}|${selection.shell}|${selection.coreSkills.join("+")}|${Date.now()}`,
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
        purpose: step.purpose || step.standard || "完成本步骤",
        child: step.child || "完成本步骤",
        parent: step.parent || "提供最小必要帮助",
        elder: step.elder || "提醒一次并守安全",
        duration: Number(step.duration || selection.availableTime),
        evidence: step.evidence || "阶段成果",
        standard: step.standard || "达到可验证标准",
        skills: uniq(step.skills || []),
        skillTraining: Array.isArray(step.skillTraining) ? step.skillTraining : [],
        done: false,
        note: ""
      }))
    };
    if (output.steps.length < 6) throw new Error("AI返回的工作流不足6步");
    return output;
  }

  function preview(task, meta) {
    el("generatedTask").innerHTML = `<div class="card"><span class="pill green">${escapeHtml(meta.label || "AI因材施教方案")}</span><h2>${escapeHtml(task.title)}</h2><p class="small">${escapeHtml(task.purpose)}</p>${matrix(task)}${task.rationale ? `<div class="notice"><b>为什么这样设计</b><br>${escapeHtml(task.rationale)}</div>` : ""}<p class="small"><b>交付：</b>${task.outputs.map(escapeHtml).join("、")}<br><b>安全：</b>${escapeHtml(task.safety || "遵守家庭安全边界")}<br><b>引擎：</b>${escapeHtml(PROVIDER_LABELS[meta.provider] || meta.provider || "AI")}${meta.model ? ` / ${escapeHtml(meta.model)}` : ""}</p><button id="useAiTaskBtn" class="btn full">使用这个方案</button></div>`;
    el("useAiTaskBtn").onclick = () => {
      state.task = typeof structuredClone === "function" ? structuredClone(task) : JSON.parse(JSON.stringify(task));
      save();
      renderHome();
      go("workflow");
    };
  }

  async function apiGenerate(config, context) {
    if (!config.backendEndpoint) throw new Error("尚未配置统一后端地址");
    const response = await fetch(config.backendEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Growth-OS-Code": config.accessCode },
      body: JSON.stringify({ ...context, ai: { provider: config.provider, model: config.model } })
    });
    const data = await response.json();
    if (!response.ok || !data.ok) throw new Error(data.error || `HTTP ${response.status}`);
    return {
      task: normalize(data.task, context, { provider: data.meta?.provider || config.provider, compilerVersion: "multi-provider-api-v1" }),
      meta: { label: "API因材施教方案", provider: data.meta?.provider || config.provider, model: data.meta?.model || config.model }
    };
  }

  async function ollamaGenerate(config, context) {
    if (!config.ollamaModel) throw new Error("尚未填写Ollama模型名称");
    const url = `${config.ollamaEndpoint.replace(/\/$/, "")}/api/chat`;
    const prompt = `${PLUS_INSTRUCTIONS}\n\n成长OS上下文：\n${JSON.stringify(context, null, 2)}`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: config.ollamaModel, messages: [{ role: "user", content: prompt }], stream: false, format: "json", options: { temperature: 0.2 } })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || `Ollama HTTP ${response.status}`);
    const task = JSON.parse(stripJson(data?.message?.content || ""));
    return {
      task: normalize(task, context, { provider: "Ollama", compilerVersion: "ollama-v1" }),
      meta: { label: "本地Ollama方案", provider: "Ollama", model: config.ollamaModel }
    };
  }

  function plusPrompt(context) {
    return `${PLUS_INSTRUCTIONS}\n\n成长OS上下文：\n${JSON.stringify(context, null, 2)}`;
  }

  function renderPlusBridge(config, context) {
    const prompt = plusPrompt(context);
    el("generatedTask").innerHTML = `<div class="card"><span class="pill purple">ChatGPT Plus桥接</span><h3>使用你的ChatGPT账号完成深度规划</h3><div class="small">复制请求 → 打开ChatGPT或自定义GPT → 发送 → 将返回JSON粘贴回来。</div><div class="field"><label>规划请求</label><textarea id="plusPromptText" style="min-height:220px">${escapeHtml(prompt)}</textarea></div><div class="grid2"><button id="copyPlusPromptBtn" class="btn">复制请求</button><button id="openChatGPTBtn" class="btn secondary">打开ChatGPT</button></div><div class="field"><label>粘贴ChatGPT返回的JSON</label><textarea id="plusResultText" style="min-height:180px" placeholder="只粘贴JSON；带代码块也可以"></textarea></div><button id="importPlusResultBtn" class="btn green full">导入Plus生成的方案</button></div>`;
    el("copyPlusPromptBtn").onclick = async () => {
      try {
        await navigator.clipboard.writeText(prompt);
        alert("规划请求已复制");
      } catch {
        el("plusPromptText").select();
        document.execCommand("copy");
        alert("规划请求已复制");
      }
    };
    el("openChatGPTBtn").onclick = () => window.open(config.chatgptUrl || "https://chatgpt.com/", "_blank", "noopener");
    el("importPlusResultBtn").onclick = () => {
      try {
        const task = normalize(JSON.parse(stripJson(el("plusResultText").value)), context, { provider: "ChatGPT Plus", compilerVersion: "plus-bridge-v1" });
        preview(task, { label: "ChatGPT Plus方案", provider: "ChatGPT Plus" });
      } catch (error) {
        alert(`导入失败：${error.message}`);
      }
    };
  }

  generateTask = async function generateTaskWithAi() {
    const config = loadConfig();
    if (!chosenSkills.length) return alert("至少选择1项核心培养技能");
    const context = payload();
    if (config.mode === "template") return fallbackGenerateTask();
    if (config.mode === "plus") return renderPlusBridge(config, context);
    el("generatedTask").innerHTML = `<div class="card"><span class="pill purple">AI正在分析</span><h3>正在读取画像、技能树和当前选择……</h3></div>`;
    try {
      const result = config.mode === "ollama" ? await ollamaGenerate(config, context) : await apiGenerate(config, context);
      preview(result.task, result.meta);
    } catch (error) {
      if (config.fallback) {
        fallbackGenerateTask();
        el("generatedTask").insertAdjacentHTML("afterbegin", `<div class="notice"><b>AI调用失败，已回退模板</b><br>${escapeHtml(error.message)}</div>`);
      } else {
        el("generatedTask").innerHTML = `<div class="card"><span class="pill orange">AI调用失败</span><h3>${escapeHtml(error.message)}</h3></div>`;
      }
    }
  };

  window.addEventListener("DOMContentLoaded", injectControls);
})();
