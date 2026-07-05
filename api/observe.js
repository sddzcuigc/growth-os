const OBSERVATION_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["summary", "optionIds", "frequency", "contexts", "example", "note", "followUp", "confidence"],
  properties: {
    summary: { type: "string" },
    optionIds: { type: "array", items: { type: "string" } },
    frequency: { type: "string", enum: ["rare", "sometimes", "often", "stable"] },
    contexts: { type: "array", items: { type: "string", enum: ["home", "school", "interest", "peers", "alone", "competition"] } },
    example: { type: "string" },
    note: { type: "string" },
    followUp: { type: "string" },
    confidence: { type: "string", enum: ["low", "medium", "high"] }
  }
};

const SYSTEM_PROMPT = `你是成长OS的儿童观察整理助手。你的任务不是诊断、贴标签或评价孩子，而是把家长的自然语音整理成可核对的行为观察。
必须遵守：
1. 只能从用户原话和当前模块选项中提取，不得编造事实。
2. 可以同时选择多个甚至相互矛盾的optionId，因为孩子在不同情境下可能表现不同。
3. optionIds只能使用请求中提供的id；没有足够依据时返回空数组。
4. 把时间、地点、任务、孩子动作、成人介入和结果整理进example；缺失的信息不要补造。
5. frequency只有在原话有明确线索时才提高；没有线索默认sometimes。
6. contexts只能使用请求中允许的值；无法判断可返回空数组。
7. note应保留不确定性、成人影响、情境差异或需要核对之处。
8. followUp只问一个最有价值的追问，帮助补齐关键事实。
9. 不做医学、心理或教育诊断。
10. 只返回符合Schema的JSON。`;

const PROVIDERS = {
  openai: { kind: "responses", keyEnv: "OPENAI_API_KEY", modelEnv: "OPENAI_MODEL", defaultModel: "gpt-5-mini", endpoint: "https://api.openai.com/v1/responses" },
  deepseek: { kind: "chat", keyEnv: "DEEPSEEK_API_KEY", modelEnv: "DEEPSEEK_MODEL", defaultModel: "deepseek-chat", baseEnv: "DEEPSEEK_BASE_URL", defaultBase: "https://api.deepseek.com" },
  kimi: { kind: "chat", keyEnv: "MOONSHOT_API_KEY", modelEnv: "KIMI_MODEL", baseEnv: "KIMI_BASE_URL", defaultBase: "https://api.moonshot.cn/v1" },
  glm: { kind: "chat", keyEnv: "ZHIPU_API_KEY", modelEnv: "GLM_MODEL", baseEnv: "GLM_BASE_URL", defaultBase: "https://open.bigmodel.cn/api/paas/v4" },
  gpustack: { kind: "chat", keyEnv: "GPUSTACK_API_KEY", modelEnv: "GPUSTACK_MODEL", baseEnv: "GPUSTACK_BASE_URL" },
  custom: { kind: "chat", keyEnv: "CUSTOM_OPENAI_API_KEY", modelEnv: "CUSTOM_OPENAI_MODEL", baseEnv: "CUSTOM_OPENAI_BASE_URL" }
};

function setCors(req, res) {
  const defaults = ["https://sddzcuigc.github.io"];
  const configured = (process.env.ALLOWED_ORIGINS || "").split(",").map(value => value.trim()).filter(Boolean);
  const origin = req.headers.origin || "";
  if (origin && ([...defaults, ...configured].includes(origin) || origin.endsWith(".vercel.app"))) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  }
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,X-Growth-OS-Code");
  res.setHeader("Cache-Control", "no-store");
}

function validateAccess(req) {
  const expected = process.env.GROWTH_OS_ACCESS_CODE;
  if (!expected) return { ok: false, status: 503, message: "后端尚未配置 GROWTH_OS_ACCESS_CODE" };
  if (req.headers["x-growth-os-code"] !== expected) return { ok: false, status: 401, message: "访问码不正确" };
  return { ok: true };
}

function stripJson(text) {
  const raw = String(text || "").trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  return start >= 0 && end > start ? raw.slice(start, end + 1) : raw;
}

function extractResponsesText(data) {
  if (typeof data.output_text === "string") return data.output_text;
  for (const item of data.output || []) {
    for (const content of item.content || []) {
      if (content.type === "output_text" && typeof content.text === "string") return content.text;
    }
  }
  return "";
}

function resolveProvider(ai = {}) {
  const provider = String(ai.provider || "openai").toLowerCase();
  const preset = PROVIDERS[provider];
  if (!preset) throw new Error(`不支持的供应商：${provider}`);
  const model = ai.model || process.env[preset.modelEnv] || preset.defaultModel;
  if (!model) throw new Error(`${provider} 尚未配置模型名称`);
  const apiKey = process.env[preset.keyEnv] || "";
  if (!apiKey && provider !== "gpustack" && provider !== "custom") throw new Error(`${provider} 尚未配置 ${preset.keyEnv}`);
  const baseUrl = ai.baseUrl || process.env[preset.baseEnv] || preset.defaultBase;
  if (preset.kind === "chat" && !baseUrl) throw new Error(`${provider} 尚未配置API基础地址`);
  return { ...preset, provider, model, apiKey, baseUrl };
}

function validateResult(result, allowedOptionIds) {
  const validFrequency = ["rare", "sometimes", "often", "stable"];
  const validContexts = ["home", "school", "interest", "peers", "alone", "competition"];
  if (!result || typeof result !== "object") throw new Error("AI没有返回有效观察结果");
  result.optionIds = [...new Set((result.optionIds || []).filter(id => allowedOptionIds.has(id)))];
  result.contexts = [...new Set((result.contexts || []).filter(id => validContexts.includes(id)))];
  if (!validFrequency.includes(result.frequency)) result.frequency = "sometimes";
  result.summary = String(result.summary || "");
  result.example = String(result.example || "");
  result.note = String(result.note || "");
  result.followUp = String(result.followUp || "");
  result.confidence = ["low", "medium", "high"].includes(result.confidence) ? result.confidence : "low";
  return result;
}

async function callOpenAI(config, prompt) {
  const response = await fetch(config.endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${config.apiKey}` },
    body: JSON.stringify({
      model: config.model,
      instructions: SYSTEM_PROMPT,
      input: prompt,
      reasoning: { effort: "low" },
      text: { format: { type: "json_schema", name: "growth_os_observation", strict: true, schema: OBSERVATION_SCHEMA } },
      store: false
    })
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data?.error?.message || `OpenAI API 请求失败：${response.status}`);
  return { result: JSON.parse(stripJson(extractResponsesText(data))), responseId: data.id || null };
}

async function callCompatible(config, prompt) {
  const endpoint = `${String(config.baseUrl || "").replace(/\/$/, "")}/chat/completions`;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(config.apiKey ? { Authorization: `Bearer ${config.apiKey}` } : {}) },
    body: JSON.stringify({
      model: config.model,
      messages: [
        { role: "system", content: `${SYSTEM_PROMPT}\n严格按照以下JSON Schema返回：${JSON.stringify(OBSERVATION_SCHEMA)}` },
        { role: "user", content: prompt }
      ],
      temperature: 0.1,
      response_format: { type: "json_object" }
    })
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data?.error?.message || `兼容API请求失败：${response.status}`);
  const text = data?.choices?.[0]?.message?.content;
  if (!text) throw new Error("模型没有返回文本内容");
  return { result: JSON.parse(stripJson(text)), responseId: data.id || null };
}

module.exports = async function handler(req, res) {
  setCors(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  const access = validateAccess(req);
  if (!access.ok) return res.status(access.status).json({ ok: false, error: access.message });
  if (req.method === "GET") return res.status(200).json({ ok: true, service: "growth-os-observation-ai", providers: Object.keys(PROVIDERS) });
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "只支持GET、POST和OPTIONS" });

  const body = req.body || {};
  const transcript = String(body.transcript || "").trim();
  if (!transcript) return res.status(400).json({ ok: false, error: "没有收到语音转写文本" });
  if (transcript.length > 12000) return res.status(413).json({ ok: false, error: "语音内容过长，请分段整理" });

  const options = Array.isArray(body.module?.options) ? body.module.options.slice(0, 30) : [];
  const allowedOptionIds = new Set(options.map(option => String(option.id || "")).filter(Boolean));
  const prompt = `请把下面的自然语音整理为一条儿童行为观察。\n\n孩子资料：\n${JSON.stringify(body.child || {}, null, 2)}\n\n当前访谈主题：\n${JSON.stringify({ title: body.module?.title || "", purpose: body.module?.purpose || "", options }, null, 2)}\n\n用户语音原文：\n${transcript}\n\n当前表单已有信息：\n${JSON.stringify(body.current || {}, null, 2)}`;

  try {
    const config = resolveProvider(body.ai || {});
    const called = config.kind === "responses" ? await callOpenAI(config, prompt) : await callCompatible(config, prompt);
    const result = validateResult(called.result, allowedOptionIds);
    return res.status(200).json({
      ok: true,
      observation: result,
      meta: { provider: config.provider, model: config.model, responseId: called.responseId, generatedAt: new Date().toISOString() }
    });
  } catch (error) {
    return res.status(500).json({ ok: false, error: error.message || "AI整理失败" });
  }
};
