const crypto = require("crypto");

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
  return header.startsWith("Bearer ") ? header.slice(7).trim() : "";
}

function readSuppliedKey(req) {
  return readBearer(req) || String(req.headers["x-growth-os-code"] || "");
}

function safeEqual(left, right) {
  const a = Buffer.from(String(left || ""));
  const b = Buffer.from(String(right || ""));
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

function requireBridgeAuth(req, res) {
  const expected = process.env.GROWTH_OS_BRIDGE_KEY || "";
  if (!expected) {
    res.status(503).json({ ok: false, error: "后端尚未配置 GROWTH_OS_BRIDGE_KEY" });
    return false;
  }

  const supplied = readSuppliedKey(req);
  if (!safeEqual(supplied, expected)) {
    res.status(401).json({ ok: false, error: "桥接访问码不正确" });
    return false;
  }
  return true;
}

function resolveRedisEnvironment() {
  const candidates = [
    {
      family: "UPSTASH_REDIS_REST_*",
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN
    },
    {
      family: "KV_REST_API_*",
      url: process.env.KV_REST_API_URL,
      token: process.env.KV_REST_API_TOKEN
    },
    {
      family: "REDIS_REST_*",
      url: process.env.REDIS_REST_URL,
      token: process.env.REDIS_REST_TOKEN
    }
  ];
  return candidates.find(item => item.url && item.token) || null;
}

function getRedisConfig() {
  const config = resolveRedisEnvironment();
  if (!config) {
    throw new Error("后端尚未配置 Upstash Redis REST 环境变量");
  }
  return {
    ...config,
    url: String(config.url).replace(/\/$/, ""),
    token: String(config.token)
  };
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

  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error(`Redis 返回了无法解析的响应：${response.status}`);
  }

  if (!response.ok || data.error) {
    throw new Error(data.error || `Redis 请求失败：${response.status}`);
  }
  return data.result;
}

async function getBridgeHealth(req) {
  const expected = process.env.GROWTH_OS_BRIDGE_KEY || "";
  const supplied = readSuppliedKey(req);
  const redisConfig = resolveRedisEnvironment();
  let redisReachable = false;
  let redisError = "";

  if (redisConfig) {
    try {
      redisReachable = (await redis(["PING"])) === "PONG";
      if (!redisReachable) redisError = "Redis PING未返回PONG";
    } catch (error) {
      redisError = error.message || "Redis连接失败";
    }
  }

  const authConfigured = Boolean(expected);
  const authValid = supplied ? safeEqual(supplied, expected) : null;
  const redisConfigured = Boolean(redisConfig);
  const ready = authConfigured && redisConfigured && redisReachable;

  return {
    ok: ready,
    ready,
    version: "1.1",
    authConfigured,
    authValid,
    redisConfigured,
    redisReachable,
    redisVariableFamily: redisConfig?.family || null,
    redisError: redisError || null
  };
}

function requestKey(id) {
  return `growthos:bridge:request:${id}`;
}

function makeRequestId() {
  const date = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  const random = crypto.randomBytes(5).toString("hex").toUpperCase();
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
  getBridgeHealth,
  makeRequestId,
  saveRequest,
  getRequest,
  setLatest,
  getLatestId,
  validatePlan
};
