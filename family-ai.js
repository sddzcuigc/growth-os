(() => {
  const FAMILY = window.GrowthFamily;
  const DEFAULT_OBSERVE_ENDPOINT = "https://growth-os-ten-pearl.vercel.app/api/observe";
  const originalSave = save;
  const originalRenderHome = renderHome;
  const originalRenderProfile = renderProfile;
  let recognition = null;
  let listening = false;
  let finalTranscript = "";

  save = function saveWithFamilySync() {
    originalSave();
    FAMILY?.syncCurrent();
  };

  function loadAiConfig() {
    try {
      const saved = JSON.parse(localStorage.getItem("growthOSAI") || "null") || {};
      return {
        mode: saved.mode || "template",
        provider: saved.provider || "openai",
        model: saved.model || "",
        backendEndpoint: saved.backendEndpoint || "",
        accessCode: sessionStorage.getItem("growthOSAccessCode") || ""
      };
    } catch {
      return { mode: "template", provider: "openai", model: "", backendEndpoint: "", accessCode: "" };
    }
  }

  function observationEndpoint(config) {
    const endpoint = String(config.backendEndpoint || "").trim();
    if (endpoint) {
      if (/\/api\/compile\/?$/i.test(endpoint)) return endpoint.replace(/\/api\/compile\/?$/i, "/api/observe");
      if (/\/api\/observe\/?$/i.test(endpoint)) return endpoint;
      return `${endpoint.replace(/\/$/, "")}/api/observe`;
    }
    return location.hostname.endsWith(".vercel.app") ? "/api/observe" : DEFAULT_OBSERVE_ENDPOINT;
  }

  function childAgeLabel(child) {
    return child?.state?.child?.age || child?.birth || "";
  }

  function injectFamilySwitcher() {
    const header = document.querySelector("header");
    if (!header || el("familySwitcher")) return;
    const family = FAMILY?.load();
    if (!family?.children) return;
    const activeId = family.activeChildId;
    const wrap = document.createElement("div");
    wrap.id = "familySwitcher";
    wrap.className = "family-switcher";
    wrap.innerHTML = Object.values(family.children).map(child => `
      <button type="button" class="child-switch ${child.id === activeId ? "active" : ""}" data-child-switch="${escapeHtml(child.id)}">
        ${escapeHtml(child.relation || child.state?.child?.name || child.id)}
        <span class="child-meta">${escapeHtml(child.birth || "")}</span>
      </button>`).join("") + `<button type="button" class="child-switch" id="familyToolsBtn">⋯</button>`;
    header.appendChild(wrap);
    wrap.querySelectorAll("[data-child-switch]").forEach(button => button.addEventListener("click", () => {
      if (button.dataset.childSwitch === activeId) return;
      FAMILY.switchTo(button.dataset.childSwitch);
    }));
    el("familyToolsBtn").onclick = openFamilyTools;
  }

  function openFamilyTools() {
    const family = FAMILY.load();
    const active = family.children[family.activeChildId];
    el("sheet").innerHTML = `
      <div class="row between"><h2>双孩资料</h2><button type="button" class="btn ghost" id="closeFamilyToolsBtn">关闭</button></div>
      <div class="sample-profile-card">
        <div class="row between"><div><span class="sample-badge">当前孩子</span><h3>${escapeHtml(active.relation)} · ${escapeHtml(active.birth)}</h3></div></div>
        <div class="small">${escapeHtml(active.sampleSummary || "")}</div>
      </div>
      <div class="notice"><b>数据隔离</b><br>哥哥和妹妹分别保存访谈、发现、技能路线、项目、执行进度和复盘证据。切换孩子时页面会重新载入对应资料。</div>
      <div class="family-tools" style="margin-top:12px">
        <button type="button" class="btn secondary" id="exportFamilyBtn">导出双孩数据</button>
        <button type="button" class="btn ghost" id="resetFamilySamplesBtn">重新载入原始样例</button>
      </div>`;
    el("modal").classList.add("open");
    el("closeFamilyToolsBtn").onclick = closeModal;
    el("exportFamilyBtn").onclick = () => {
      const data = FAMILY.exportFamily();
      const anchor = document.createElement("a");
      anchor.href = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }));
      anchor.download = "成长OS_双孩完整数据.json";
      anchor.click();
      URL.revokeObjectURL(anchor.href);
    };
    el("resetFamilySamplesBtn").onclick = () => {
      if (!confirm("这会用原来的哥哥、妹妹样例重新载入，并清空当前双孩访谈和项目修改。确认继续吗？")) return;
      FAMILY.resetSamples();
    };
  }

  function injectSampleProfileCard(containerId) {
    const container = el(containerId);
    if (!container || container.querySelector(".sample-profile-card")) return;
    const child = FAMILY?.getActiveChild();
    if (!child) return;
    const card = document.createElement("div");
    card.className = "sample-profile-card";
    card.innerHTML = `
      <div class="row between">
        <div><span class="sample-badge">已载入原始样例</span><h3>${escapeHtml(child.relation)} · ${escapeHtml(childAgeLabel(child))}</h3></div>
        <button type="button" class="btn ghost small-btn" data-switch-other-child>${child.id === "brother" ? "查看妹妹" : "查看哥哥"}</button>
      </div>
      <div class="small">${escapeHtml(child.sampleSummary || child.state?.child?.sampleSummary || "")}</div>
      <div class="small" style="margin-top:7px"><b>已有方向：</b>${(child.state?.child?.interests || []).map(escapeHtml).join("、")}</div>`;
    const anchor = container.querySelector(".assessment-hero, .principle-card, .flow-map") || container.firstChild;
    if (anchor?.nextSibling) container.insertBefore(card, anchor.nextSibling); else container.prepend(card);
    card.querySelector("[data-switch-other-child]").onclick = () => FAMILY.switchTo(child.id === "brother" ? "sister" : "brother");
  }

  function currentModulePayload() {
    const card = document.querySelector(".question-card");
    if (!card) return null;
    const title = card.querySelector("h2")?.textContent?.trim() || "儿童行为观察";
    const intro = card.querySelector(".question-intro")?.textContent?.trim() || "";
    const options = [...card.querySelectorAll('input[name="assessmentSignal"]')].map(input => {
      const label = input.closest("label");
      return {
        id: input.value,
        label: label?.querySelector("b")?.textContent?.trim() || input.value,
        detail: label?.querySelector("span")?.textContent?.trim() || ""
      };
    });
    return { title, purpose: intro, options };
  }

  function currentFormState() {
    return {
      optionIds: [...document.querySelectorAll('input[name="assessmentSignal"]:checked')].map(input => input.value),
      frequency: el("assessmentFrequency")?.value || "sometimes",
      contexts: [...document.querySelectorAll('input[name="assessmentContext"]:checked')].map(input => input.value),
      observer: el("assessmentObserver")?.value || "parent",
      example: el("assessmentExample")?.value || "",
      note: el("assessmentNote")?.value || ""
    };
  }

  function setVoiceStatus(text, type = "") {
    const status = el("voiceStatus");
    if (!status) return;
    status.textContent = text;
    status.className = `voice-status ${type}`.trim();
  }

  function startRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setVoiceStatus("当前浏览器不支持网页连续语音识别。可直接使用手机输入法的麦克风，或在最新版Chrome中打开。", "warn");
      return;
    }

    if (listening && recognition) {
      recognition.stop();
      return;
    }

    const field = el("voiceTranscript");
    finalTranscript = field?.value?.trim() || "";
    recognition = new SpeechRecognition();
    recognition.lang = "zh-CN";
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      listening = true;
      el("voiceMicBtn")?.classList.add("listening");
      el("voiceMicBtn").textContent = "■";
      setVoiceStatus("正在听。可以连续说孩子的具体表现，点红色按钮结束。", "live");
    };

    recognition.onresult = event => {
      let interim = "";
      let newlyFinal = "";
      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const transcript = event.results[index][0].transcript;
        if (event.results[index].isFinal) newlyFinal += transcript;
        else interim += transcript;
      }
      if (newlyFinal) finalTranscript = `${finalTranscript}${finalTranscript ? "\n" : ""}${newlyFinal.trim()}`;
      if (field) field.value = `${finalTranscript}${interim ? `\n【正在识别】${interim}` : ""}`;
    };

    recognition.onerror = event => {
      const messages = {
        "not-allowed": "麦克风权限被拒绝，请在浏览器地址栏权限中允许麦克风。",
        "no-speech": "没有识别到语音，请靠近麦克风后重试。",
        network: "语音识别网络服务暂时不可用。"
      };
      setVoiceStatus(messages[event.error] || `语音识别失败：${event.error}`, "warn");
    };

    recognition.onend = () => {
      listening = false;
      el("voiceMicBtn")?.classList.remove("listening");
      if (el("voiceMicBtn")) el("voiceMicBtn").textContent = "🎙";
      if (field) field.value = finalTranscript || field.value.replace(/\n【正在识别】.*$/s, "");
      if (!el("voiceStatus")?.classList.contains("warn")) setVoiceStatus("语音已转成文字。可继续修改，或让AI整理并填入本模块。", "");
    };

    try { recognition.start(); } catch (error) { setVoiceStatus(`无法启动语音识别：${error.message}`, "warn"); }
  }

  function localFallback(transcript) {
    const module = currentModulePayload();
    const normalized = transcript.toLowerCase();
    const scores = module.options.map(option => {
      const terms = `${option.label} ${option.detail}`.split(/[，。；、：\s]/).filter(term => term.length >= 2);
      const score = terms.reduce((sum, term) => sum + (normalized.includes(term.toLowerCase()) ? 1 : 0), 0);
      return { id: option.id, score };
    }).filter(item => item.score > 0).sort((a, b) => b.score - a.score).slice(0, 4);
    return {
      summary: "未连接云端AI，已使用本地关键词作初步匹配。请人工检查后再保存。",
      optionIds: scores.map(item => item.id),
      frequency: "sometimes",
      contexts: [],
      example: transcript,
      note: "本地整理结果，未调用大模型；选项可能不完整。",
      followUp: "这件事发生在什么情境？大约多久出现一次？成人做了什么，最后结果怎样？",
      confidence: "low"
    };
  }

  function applyObservation(observation, meta = {}) {
    const allowed = new Set(observation.optionIds || []);
    document.querySelectorAll('input[name="assessmentSignal"]').forEach(input => {
      if (allowed.has(input.value)) input.checked = true;
    });
    if (el("assessmentFrequency") && observation.frequency) el("assessmentFrequency").value = observation.frequency;
    document.querySelectorAll('input[name="assessmentContext"]').forEach(input => {
      if ((observation.contexts || []).includes(input.value)) input.checked = true;
    });
    if (el("assessmentExample")) el("assessmentExample").value = observation.example || el("voiceTranscript")?.value || "";
    if (el("assessmentNote")) {
      const pieces = [observation.summary, observation.note, meta.provider ? `AI整理：${meta.provider}${meta.model ? ` / ${meta.model}` : ""}` : ""].filter(Boolean);
      el("assessmentNote").value = pieces.join("\n");
    }
    const result = el("voiceAiResult");
    if (result) {
      result.className = `voice-ai-result ${meta.local ? "warn" : "success"}`;
      result.innerHTML = `<b>${meta.local ? "本地初步整理完成" : "AI整理完成，等待你确认"}</b><br>${escapeHtml(observation.summary || "已填入表单")}${observation.followUp ? `<div class="voice-followup">建议追问：${escapeHtml(observation.followUp)}</div>` : ""}`;
    }
    setVoiceStatus("已把结果填入多选项、频率、情境和具体事例。请人工检查后再点“保存本次观察”。");
  }

  async function structureWithAi() {
    const transcript = (el("voiceTranscript")?.value || "").replace(/\n【正在识别】.*$/s, "").trim();
    if (!transcript) return alert("请先说一段或输入一段关于孩子的具体描述。");
    const button = el("voiceAiBtn");
    button.disabled = true;
    button.textContent = "AI正在整理…";
    const config = loadAiConfig();
    const module = currentModulePayload();

    try {
      if (!config.accessCode || config.mode === "template" || config.mode === "plus") {
        const fallback = localFallback(transcript);
        applyObservation(fallback, { local: true });
        return;
      }
      const response = await fetch(observationEndpoint(config), {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Growth-OS-Code": config.accessCode },
        body: JSON.stringify({
          transcript,
          child: state.child,
          module,
          current: currentFormState(),
          ai: { provider: config.provider, model: config.model }
        })
      });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.error || `HTTP ${response.status}`);
      applyObservation(data.observation, data.meta || {});
    } catch (error) {
      const fallback = localFallback(transcript);
      applyObservation(fallback, { local: true });
      const result = el("voiceAiResult");
      if (result) result.insertAdjacentHTML("beforeend", `<br><span class="small">云端AI失败：${escapeHtml(error.message)}。已保留本地整理结果。</span>`);
    } finally {
      button.disabled = false;
      button.textContent = "AI整理并填入";
    }
  }

  function injectVoiceCard() {
    const question = document.querySelector(".question-card");
    if (!question || el("voiceObservationCard")) return;
    const card = document.createElement("div");
    card.id = "voiceObservationCard";
    card.className = "voice-card";
    card.innerHTML = `
      <div class="voice-head">
        <div><span class="pill purple">AI语音观察</span><h3>直接说，不用逐项填写</h3></div>
        <button type="button" class="mic-button" id="voiceMicBtn" aria-label="开始或停止语音输入">🎙</button>
      </div>
      <div class="voice-status" id="voiceStatus">点麦克风后，用自然语言描述：什么时候、发生什么、孩子怎么做、成人怎么介入、最后怎样。</div>
      <textarea class="voice-transcript" id="voiceTranscript" placeholder="也可以直接粘贴语音转写或手工输入。允许一次说出多个甚至相互矛盾的表现。"></textarea>
      <div class="voice-actions">
        <button type="button" class="btn" id="voiceAiBtn">AI整理并填入</button>
        <button type="button" class="btn secondary" id="voiceRawBtn">只把原文填入事例</button>
      </div>
      <div id="voiceAiResult"></div>
      <div class="voice-privacy">语音先由浏览器转成文字；只有点击“AI整理并填入”后，文字才会发送到你配置的AI后端。请勿录入不必要的身份、医疗或高度敏感信息。</div>`;
    const intro = question.querySelector(".question-intro");
    if (intro?.nextSibling) question.insertBefore(card, intro.nextSibling); else question.prepend(card);
    el("voiceMicBtn").onclick = startRecognition;
    el("voiceAiBtn").onclick = structureWithAi;
    el("voiceRawBtn").onclick = () => {
      const transcript = (el("voiceTranscript")?.value || "").replace(/\n【正在识别】.*$/s, "").trim();
      if (!transcript) return alert("还没有语音或文字内容。");
      el("assessmentExample").value = transcript;
      setVoiceStatus("原文已填入“具体事例”，还需要你选择行为、频率和情境。", "");
    };
  }

  renderHome = function renderHomeWithFamilyVoice() {
    originalRenderHome();
    injectSampleProfileCard("home");
    injectVoiceCard();
    injectFamilySwitcher();
  };

  renderProfile = function renderProfileWithFamily() {
    originalRenderProfile();
    injectSampleProfileCard("profile");
    injectFamilySwitcher();
  };

  window.addEventListener("beforeunload", () => FAMILY?.syncCurrent());
  window.addEventListener("DOMContentLoaded", () => {
    injectFamilySwitcher();
    injectSampleProfileCard("home");
    injectVoiceCard();
  });
})();
