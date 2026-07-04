const TTL_SECONDS = 7 * 24 * 60 * 60;

function setCors(req, res) {
  const origin = req.headers.origin || "";
  const defaults = ["https://sddzcuigc.github.io"];
  const configured = (process.env.ALLOWED_ORIGINS || "")
    .split(",")
    .map(value => value.trim())
    .filter(Boolean);
  const allowed = new Set([...defaults, ...configured]);

  if (origin && (allowed.has(origin) || origin.endsWith(".vercel.app"))) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  }
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization,X-Growth-OS-Code");
  res.setHeader("Cache-Control", "no-store");
}

function readBearer(req) {
  const header = req.headers.authorization || "";
  return header.startsWith("Bearer ") ? header.slice(7) : "";
}

function requireBridgeAuth(req, res) {
  const expected = process.env.GROWTH_OS_BRIDGE_KEY;
  if (!expected) {
    res.status(503).json({ ok: false, error: "后端尚未配置 GROWTH_OS_BRIDGE_KEY" });
    return false;
  }

  const supplied = readBearer(req) || req.headers["x-growth-os-code"] || "";
  if (supplied !== expected) {
    res.status(401).json({ ok: false, error: "桥接访问码不正确" });
    return false;
  }
  return true;
}

function getRedisConfig() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    throw new Error("后端尚未配置 Upstash Redis 环境变量");
  }
  return { url: url.replace(/\/$/, ""), token };
}

async function redis(command) {
  const { url, token } = getRedisConfig();
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(command)
  });
  const data = await response.json();
  if (!response.ok || data.error) {
    throw new Error(data.error || `Redis 请求失败：${response.status}`);
  }
  return data.result;
}

function requestKey(id) {
  return `growthos:bridge:request:${id}`;
}

function makeRequestId() {
  const date = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `GROWTH-${date}-${random}`;
}

async function saveRequest(record) {
  await redis(["SET", requestKey(record.id), JSON.stringify(record), "EX", TTL_SECONDS]);
}

async function getRequest(id) {
  const raw = await redis(["GET", requestKey(id)]);
  return raw ? JSON.parse(raw) : null;
}

async function setLatest(id) {
  await redis(["SET", "growthos:bridge:latest", id, "EX", TTL_SECONDS]);
}

async function getLatestId() {
  return await redis(["GET", "growthos:bridge:latest"]);
}

function validatePlan(plan) {
  const required = [
    "title", "purpose", "shell", "realUser", "problem", "availableTime",
    "coreSkills", "supportSkills", "maintenanceSkills", "outputs", "materials",
    "safety", "rationale", "steps"
  ];
  for (const key of required) {
    if (plan?.[key] === undefined) throw new Error(`方案缺少字段：${key}`);
  }
  if (!Array.isArray(plan.steps) || plan.steps.length < 6) {
    throw new Error("方案工作流必须至少包含6步");
  }
  return plan;
}

module.exports = {
  setCors,
  requireBridgeAuth,
  makeRequestId,
  saveRequest,
  getRequest,
  setLatest,
  getLatestId,
  validatePlan
};
