const PLAN_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: [
    "title", "purpose", "shell", "realUser", "problem", "availableTime",
    "coreSkills", "supportSkills", "maintenanceSkills", "outputs", "materials",
    "safety", "rationale", "steps"
  ],
  properties: {
    title: { type: "string" },
    purpose: { type: "string" },
    shell: { type: "string" },
    realUser: { type: "string" },
    problem: { type: "string" },
    availableTime: { type: "integer" },
    coreSkills: { type: "array", items: { type: "string" } },
    supportSkills: { type: "array", items: { type: "string" } },
    maintenanceSkills: { type: "array", items: { type: "string" } },
    outputs: { type: "array", items: { type: "string" } },
    materials: { type: "array", items: { type: "string" } },
    safety: { type: "string" },
    rationale: { type: "string" },
    steps: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: [
          "phase", "title", "purpose", "child", "parent", "elder", "duration",
          "evidence", "standard", "skills", "skillTraining"
        ],
        properties: {
          phase: { type: "string" },
          title: { type: "string" },
          purpose: { type: "string" },
          child: { type: "string" },
          parent: { type: "string" },
          elder: { type: "string" },
          duration: { type: "integer" },
          evidence: { type: "string" },
          standard: { type: "string" },
          skills: { type: "array", items: { type: "string" } },
          skillTraining: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              required: ["skill", "role", "action"],
              properties: {
                skill: { type: "string" },
                role: { type: "string", enum: ["核心训练", "重要支撑", "基础维护"] },
                action: { type: "string" }
              }
            }
          }
        }
      }
    }
  }
};

const SYSTEM_PROMPT = `你是“成长OS”的因材施教规划引擎。你的职责不是套模板，而是根据孩子画像、当前技能证据、家庭资源、真实问题、项目外壳和核心技能，生成一个可执行、可验证、可迁移的综合项目。

必须遵守：
1. 真实目的优先。项目必须服务明确的真实使用者，最终成果能被使用、体验或验证。
2. 熟悉外壳只是入口。核心技能必须真正改写工作流、证据、家长教学和验收标准，不能只作为标签。
3. 每个项目设置1—3项核心技能、3—6项支撑技能和少量维护技能。
4. 输出6—8个连续步骤，覆盖：明确目的、学习必要方法、设计、执行、测试、修改、交付、复盘迁移。
5. 每一步都写清孩子行动、家长怎样教、老人只负责什么、预计时间、证据和完成标准。
6. 家长只示范最小样例，不替孩子完成。老人只守流程和安全。
7. AI只能辅助检查、解释或提示，不能替孩子生成全部成果。
8. 结合年龄、兴趣、已有资源、可用时间和身体安全边界，不做医疗诊断。
9. 方案应具体到家长今天可以照着做，避免空泛口号。
10. 返回内容必须严格符合JSON Schema。`;

function getAllowedOrigins() {
  const defaults = ["https://sddzcuigc.github.io"];
  const configured = (process.env.ALLOWED_ORIGINS || "")
    .split(",")
    .map(item => item.trim())
    .filter(Boolean);
  return [...new Set([...defaults, ...configured])];
}

function setCors(req, res) {
  const origin = req.headers.origin || "";
  const allowed = getAllowedOrigins();
  if (origin && (allowed.includes(origin) || origin.endsWith(".vercel.app"))) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  }
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,X-Growth-OS-Code");
  res.setHeader("Cache-Control", "no-store");
}

function extractOutputText(data) {
  if (typeof data.output_text === "string") return data.output_text;
  for (const item of data.output || []) {
    for (const content of item.content || []) {
      if (content.type === "output_text" && typeof content.text === "string") {
        return content.text;
      }
    }
  }
  return "";
}

function validateAccess(req) {
  const configuredCode = process.env.GROWTH_OS_ACCESS_CODE;
  if (!configuredCode) return { ok: false, status: 503, message: "后端尚未配置 GROWTH_OS_ACCESS_CODE" };
  const suppliedCode = req.headers["x-growth-os-code"];
  if (!suppliedCode || suppliedCode !== configuredCode) {
    return { ok: false, status: 401, message: "访问码不正确" };
  }
  return { ok: true };
}

module.exports = async function handler(req, res) {
  setCors(req, res);

  if (req.method === "OPTIONS") return res.status(204).end();

  const access = validateAccess(req);
  if (!access.ok) return res.status(access.status).json({ ok: false, error: access.message });

  if (req.method === "GET") {
    return res.status(200).json({
      ok: true,
      service: "growth-os-ai",
      model: process.env.OPENAI_MODEL || "gpt-5-mini"
    });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "只支持 GET、POST 和 OPTIONS" });
  }

  if (!process.env.OPENAI_API_KEY) {
    return res.status(503).json({ ok: false, error: "后端尚未配置 OPENAI_API_KEY" });
  }

  const bodyText = JSON.stringify(req.body || {});
  if (bodyText.length > 60000) {
    return res.status(413).json({ ok: false, error: "上下文过大，请精简后重试" });
  }

  const requestContext = req.body || {};
  const userPrompt = `请依据以下成长OS上下文生成一个全新的、真正因材施教的项目方案。所选项目外壳和核心技能必须原样保留，但支撑技能、步骤和证据要根据画像重新设计。\n\n${JSON.stringify(requestContext, null, 2)}`;

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-5-mini",
        instructions: SYSTEM_PROMPT,
        input: userPrompt,
        reasoning: { effort: "medium" },
        text: {
          format: {
            type: "json_schema",
            name: "growth_os_task",
            strict: true,
            schema: PLAN_SCHEMA
          }
        },
        store: false
      })
    });

    const data = await response.json();
    if (!response.ok) {
      const message = data?.error?.message || `OpenAI API 请求失败：${response.status}`;
      return res.status(response.status).json({ ok: false, error: message });
    }

    const outputText = extractOutputText(data);
    if (!outputText) {
      return res.status(502).json({ ok: false, error: "模型没有返回可解析的结构化结果" });
    }

    const task = JSON.parse(outputText);
    return res.status(200).json({
      ok: true,
      task,
      meta: {
        model: process.env.OPENAI_MODEL || "gpt-5-mini",
        responseId: data.id || null,
        generatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    return res.status(500).json({ ok: false, error: error.message || "AI生成失败" });
  }
};
