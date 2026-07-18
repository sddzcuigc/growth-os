# Fast onboarding by default, user-selectable depth, and live model settings.
app = app_path.read_text(encoding='utf-8')
app = replace_once(
    app,
    'const onboardingQuestionIds = ["current-interest", "growth-wish", "preferred-output", "ai-help-style", "personal-friction", "success-picture"];',
    '''function initialOnboardingQuestionMode() {
  const childId = localStorage.getItem("talent-os-child") || "brother";
  try { return JSON.parse(localStorage.getItem(`talent-os-${childId}-app-settings`) || "{}").questionMode || "fast"; }
  catch { return "fast"; }
}
const onboardingQuestionMode = initialOnboardingQuestionMode();
const onboardingQuestionIds = onboardingQuestionMode === "deep"
  ? ["current-interest", "growth-wish", "preferred-output", "ai-help-style", "personal-friction", "success-picture"]
  : onboardingQuestionMode === "balanced"
    ? ["current-interest", "growth-wish", "preferred-output", "success-picture"]
    : ["current-interest", "growth-wish", "success-picture"];''',
    'question modes',
)
app = replace_once(app, '  journalMode: "hybrid",', '  journalMode: "self",\n  availableModels: [],', 'journal default')
app = replace_once(
    app,
    '    motion: "gentle"\n  });',
    '    motion: "gentle",\n    questionMode: "fast",\n    aiModel: ""\n  });',
    'settings defaults',
)
app = insert_after(
    app,
    'function setAppSettings(nextSettings) {\n  writeJson(storageKey("app-settings"), { ...getAppSettings(), ...nextSettings });\n}\n',
    '''
function selectedAiModel() {
  return String(getAppSettings().aiModel || state.modelStatus.model || "").trim();
}
function aiBody(payload = {}) {
  return JSON.stringify({ model: selectedAiModel(), questionMode: getAppSettings().questionMode || "fast", ...payload });
}
async function loadAvailableModels() {
  const select = document.querySelector("#setting-ai-model");
  const modeSelect = document.querySelector("#setting-question-mode");
  if (modeSelect) modeSelect.value = getAppSettings().questionMode || "fast";
  if (!select) return;
  try {
    const response = await fetch("/api/models");
    if (!response.ok) throw new Error("models");
    const result = await response.json();
    state.availableModels = Array.isArray(result.models) ? result.models : [];
    const chosen = selectedAiModel() || result.defaultModel || state.modelStatus.model;
    const models = [...new Set([chosen, ...state.availableModels])].filter(Boolean);
    select.innerHTML = models.map((id) => `<option value="${escapeHtml(id)}" ${id === chosen ? "selected" : ""}>${escapeHtml(id)}</option>`).join("");
  } catch {
    const fallback = selectedAiModel() || state.modelStatus.model || "zai-org/GLM-5.2";
    select.innerHTML = `<option value="${escapeHtml(fallback)}">${escapeHtml(fallback)}</option>`;
  }
}
''',
    'AI helper functions',
)
app = app.replace('body: JSON.stringify({ profileId:', 'body: aiBody({ profileId:')
app = replace_once(
    app,
    '      newsTopics: document.querySelector("#setting-news-topics")?.value.trim() || "AI教育, 科学发现, 儿童创造力, 未来技能"\n    });',
    '      newsTopics: document.querySelector("#setting-news-topics")?.value.trim() || "AI教育, 科学发现, 儿童创造力, 未来技能",\n      questionMode: document.querySelector("#setting-question-mode")?.value || "fast",\n      aiModel: document.querySelector("#setting-ai-model")?.value || selectedAiModel()\n    });',
    'save preferences',
)
app = replace_once(
    app,
    '  if (openSettingsButton) {\n    openSettings();\n    return;\n  }',
    '  if (openSettingsButton) {\n    openSettings();\n    loadAvailableModels();\n    return;\n  }',
    'load model catalog',
)
app = app.replace('后两题会根据前面的答案变化', '深入模式会根据前面的答案补问；快速模式只问3个关键问题')
app_path.write_text(app, encoding='utf-8')
