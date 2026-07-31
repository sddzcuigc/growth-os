import { createHash, createPublicKey, verify as verifySignature } from "node:crypto";
import { join } from "node:path";
import { mkdirSync } from "node:fs";
import { openGrowthDatabase } from "./database.js";

const FIREBASE_PROJECT_ID = "mail-f14f3";
const FIREBASE_ISSUER = `https://securetoken.google.com/${FIREBASE_PROJECT_ID}`;
const FIREBASE_CERTS_URL = "https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com";
const MAX_STATE_BYTES = 900_000;
const MAX_BACKUPS = 20;
const CLOCK_SKEW_SECONDS = 300;
const dataDir = process.env.GROWTH_OS_DATA_DIR || (process.env.VERCEL ? "/tmp/growth-os" : join(process.cwd(), "data"));
const remoteDatabaseUrl = process.env.TURSO_DATABASE_URL || process.env.LIBSQL_URL || "";
const remoteDatabaseToken = process.env.TURSO_AUTH_TOKEN || process.env.LIBSQL_AUTH_TOKEN || "";
if (!remoteDatabaseUrl) mkdirSync(dataDir, { recursive: true });

const database = openGrowthDatabase({
  localPath: join(dataDir, "growth-os.sqlite"),
  remoteUrl: remoteDatabaseUrl,
  authToken: remoteDatabaseToken,
  isVercel: Boolean(process.env.VERCEL)
});
const db = database.db;

let certCache = { certificates: null, expiresAt: 0 };

db.exec(`
  CREATE TABLE IF NOT EXISTS family_skill_tree_user_states (
    firebase_uid TEXT PRIMARY KEY,
    email TEXT NOT NULL,
    email_hash TEXT NOT NULL,
    data_json TEXT NOT NULL,
    version INTEGER NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS family_skill_tree_user_backups (
    id INTEGER PRIMARY KEY,
    firebase_uid TEXT NOT NULL,
    version INTEGER NOT NULL,
    data_json TEXT NOT NULL,
    created_at TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS family_skill_tree_user_backups_uid_time
    ON family_skill_tree_user_backups(firebase_uid, id DESC);
  CREATE INDEX IF NOT EXISTS family_skill_tree_user_states_email_hash
    ON family_skill_tree_user_states(email_hash);
`);

export default async function handler(request, response) {
  setCors(response);
  if (request.method === "OPTIONS") {
    response.writeHead(204);
    response.end();
    return;
  }

  try {
    const user = await authenticate(request);
    if (!user.emailVerified) {
      return sendJson(response, 403, { error: "请先完成邮箱验证后再同步数据", code: "EMAIL_NOT_VERIFIED" });
    }

    if (request.method === "GET") return handleGet(response, user);
    if (request.method === "POST") return handleBootstrap(request, response, user);
    if (request.method === "PUT") return handleSave(request, response, user);

    response.setHeader("allow", "GET, POST, PUT, OPTIONS");
    return sendJson(response, 405, { error: "Method not allowed" });
  } catch (error) {
    const status = Number(error?.statusCode || 500);
    if (status >= 500) console.error("family-skill-tree-auth", error?.message || error);
    return sendJson(response, status, {
      error: status >= 500 ? "账号云同步服务暂时不可用" : String(error.message || "请求失败"),
      code: error?.code || undefined
    });
  }
}

function handleGet(response, user) {
  const row = getRow(user.uid);
  if (!row) return sendJson(response, 404, { exists: false });
  return sendJson(response, 200, {
    exists: true,
    version: Number(row.version),
    updatedAt: row.updated_at,
    state: safeParse(row.data_json),
    account: publicUser(user)
  });
}

async function handleBootstrap(request, response, user) {
  const existing = getRow(user.uid);
  if (existing) {
    return sendJson(response, 200, {
      created: false,
      version: Number(existing.version),
      updatedAt: existing.updated_at,
      state: safeParse(existing.data_json),
      account: publicUser(user)
    });
  }

  const body = await readJson(request);
  const state = validateState(body?.state);
  const now = new Date().toISOString();
  const dataJson = JSON.stringify(state);
  const email = normalizeEmail(user.email);
  db.prepare(`
    INSERT INTO family_skill_tree_user_states
      (firebase_uid, email, email_hash, data_json, version, created_at, updated_at)
    VALUES (?, ?, ?, ?, 1, ?, ?)
  `).run(user.uid, email, digest(email), dataJson, now, now);

  return sendJson(response, 201, {
    created: true,
    version: 1,
    updatedAt: now,
    state,
    account: publicUser(user)
  });
}

async function handleSave(request, response, user) {
  const body = await readJson(request);
  const state = validateState(body?.state);
  const expectedVersion = Number(body?.expectedVersion || 0);
  const existing = getRow(user.uid);
  const now = new Date().toISOString();
  const email = normalizeEmail(user.email);

  if (!existing) {
    db.prepare(`
      INSERT INTO family_skill_tree_user_states
        (firebase_uid, email, email_hash, data_json, version, created_at, updated_at)
      VALUES (?, ?, ?, ?, 1, ?, ?)
    `).run(user.uid, email, digest(email), JSON.stringify(state), now, now);
    return sendJson(response, 201, { created: true, version: 1, updatedAt: now, account: publicUser(user) });
  }

  const currentVersion = Number(existing.version);
  if (expectedVersion && expectedVersion !== currentVersion) {
    return sendJson(response, 409, {
      conflict: true,
      version: currentVersion,
      updatedAt: existing.updated_at,
      state: safeParse(existing.data_json),
      account: publicUser(user)
    });
  }

  db.prepare(`
    INSERT INTO family_skill_tree_user_backups (firebase_uid, version, data_json, created_at)
    VALUES (?, ?, ?, ?)
  `).run(user.uid, currentVersion, existing.data_json, now);

  const nextVersion = currentVersion + 1;
  db.prepare(`
    UPDATE family_skill_tree_user_states
    SET email=?, email_hash=?, data_json=?, version=?, updated_at=?
    WHERE firebase_uid=?
  `).run(email, digest(email), JSON.stringify(state), nextVersion, now, user.uid);

  db.prepare(`
    DELETE FROM family_skill_tree_user_backups
    WHERE firebase_uid=? AND id NOT IN (
      SELECT id FROM family_skill_tree_user_backups
      WHERE firebase_uid=? ORDER BY id DESC LIMIT ?
    )
  `).run(user.uid, user.uid, MAX_BACKUPS);

  return sendJson(response, 200, { created: false, version: nextVersion, updatedAt: now, account: publicUser(user) });
}

function getRow(uid) {
  return db.prepare(`
    SELECT firebase_uid, email, data_json, version, created_at, updated_at
    FROM family_skill_tree_user_states WHERE firebase_uid=?
  `).get(uid);
}

async function authenticate(request) {
  const authorization = String(request.headers.authorization || "");
  const token = authorization.match(/^Bearer\s+(.+)$/i)?.[1]?.trim();
  if (!token) throw httpError(401, "请先登录", "AUTH_REQUIRED");

  const parts = token.split(".");
  if (parts.length !== 3) throw httpError(401, "登录凭证格式无效", "INVALID_TOKEN");

  const header = parseBase64UrlJson(parts[0]);
  const payload = parseBase64UrlJson(parts[1]);
  if (header.alg !== "RS256" || !header.kid) throw httpError(401, "登录凭证算法无效", "INVALID_TOKEN");

  const now = Math.floor(Date.now() / 1000);
  if (payload.aud !== FIREBASE_PROJECT_ID || payload.iss !== FIREBASE_ISSUER) {
    throw httpError(401, "登录凭证不属于当前应用", "INVALID_TOKEN");
  }
  if (!payload.sub || typeof payload.sub !== "string" || payload.sub.length > 128) {
    throw httpError(401, "登录用户标识无效", "INVALID_TOKEN");
  }
  if (!Number.isFinite(payload.exp) || payload.exp < now - CLOCK_SKEW_SECONDS) {
    throw httpError(401, "登录已过期，请重新登录", "TOKEN_EXPIRED");
  }
  if (!Number.isFinite(payload.iat) || payload.iat > now + CLOCK_SKEW_SECONDS) {
    throw httpError(401, "登录凭证时间无效", "INVALID_TOKEN");
  }
  if (!payload.email) throw httpError(403, "此账号没有可用邮箱", "EMAIL_REQUIRED");

  const certificates = await getGoogleCertificates();
  const certificate = certificates[header.kid];
  if (!certificate) {
    certCache = { certificates: null, expiresAt: 0 };
    throw httpError(401, "登录凭证签名密钥已更新，请重试", "TOKEN_KEY_MISMATCH");
  }

  const signingInput = Buffer.from(`${parts[0]}.${parts[1]}`);
  const signature = base64UrlToBuffer(parts[2]);
  const key = createPublicKey(certificate);
  const valid = verifySignature("RSA-SHA256", signingInput, key, signature);
  if (!valid) throw httpError(401, "登录凭证签名无效", "INVALID_TOKEN");

  return {
    uid: payload.sub,
    email: String(payload.email),
    emailVerified: payload.email_verified === true,
    provider: String(payload.firebase?.sign_in_provider || "unknown")
  };
}

async function getGoogleCertificates() {
  if (certCache.certificates && Date.now() < certCache.expiresAt) return certCache.certificates;
  const response = await fetch(FIREBASE_CERTS_URL, { cache: "no-store" });
  if (!response.ok) throw httpError(503, "暂时无法验证登录身份", "CERT_FETCH_FAILED");
  const certificates = await response.json();
  const cacheControl = response.headers.get("cache-control") || "";
  const maxAge = Number(cacheControl.match(/max-age=(\d+)/i)?.[1] || 3600);
  certCache = {
    certificates,
    expiresAt: Date.now() + Math.max(300, maxAge - 60) * 1000
  };
  return certificates;
}

function validateState(state) {
  if (!state || typeof state !== "object" || !Array.isArray(state.children)) {
    throw httpError(400, "状态数据格式无效", "INVALID_STATE");
  }
  if (state.children.length < 1 || state.children.length > 20) {
    throw httpError(400, "儿童档案数量无效", "INVALID_STATE");
  }
  const json = JSON.stringify(state);
  if (Buffer.byteLength(json, "utf8") > MAX_STATE_BYTES) {
    throw httpError(413, "状态数据过大", "STATE_TOO_LARGE");
  }
  return state;
}

async function readJson(request) {
  if (request.body && typeof request.body === "object") return request.body;
  let raw = "";
  for await (const chunk of request) {
    raw += chunk;
    if (Buffer.byteLength(raw, "utf8") > MAX_STATE_BYTES + 20_000) {
      throw httpError(413, "请求体过大", "BODY_TOO_LARGE");
    }
  }
  try {
    return raw ? JSON.parse(raw) : {};
  } catch {
    throw httpError(400, "JSON 格式无效", "INVALID_JSON");
  }
}

function publicUser(user) {
  return { uid: user.uid, email: user.email, emailVerified: user.emailVerified, provider: user.provider };
}

function parseBase64UrlJson(value) {
  try {
    return JSON.parse(base64UrlToBuffer(value).toString("utf8"));
  } catch {
    throw httpError(401, "登录凭证无法解析", "INVALID_TOKEN");
  }
}

function base64UrlToBuffer(value) {
  const normalized = String(value).replace(/-/g, "+").replace(/_/g, "/");
  const padding = normalized.length % 4 ? "=".repeat(4 - (normalized.length % 4)) : "";
  return Buffer.from(normalized + padding, "base64");
}

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

function digest(value) {
  return createHash("sha256").update(String(value)).digest("hex");
}

function safeParse(value) {
  try { return JSON.parse(value); }
  catch { return null; }
}

function httpError(statusCode, message, code) {
  return Object.assign(new Error(message), { statusCode, code });
}

function setCors(response) {
  response.setHeader("access-control-allow-origin", "*");
  response.setHeader("access-control-allow-methods", "GET, POST, PUT, OPTIONS");
  response.setHeader("access-control-allow-headers", "authorization, content-type");
  response.setHeader("access-control-max-age", "86400");
  response.setHeader("cache-control", "no-store");
  response.setHeader("x-content-type-options", "nosniff");
}

function sendJson(response, status, payload) {
  response.writeHead(status, { "content-type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(payload));
}
