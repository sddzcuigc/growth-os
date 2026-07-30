import { createHash, timingSafeEqual } from "node:crypto";
import { join } from "node:path";
import { mkdirSync } from "node:fs";
import { openGrowthDatabase } from "./database.js";

const MAX_STATE_BYTES = 900_000;
const MAX_BACKUPS = 20;
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

db.exec(`
  CREATE TABLE IF NOT EXISTS family_skill_tree_states (
    family_id TEXT PRIMARY KEY,
    token_hash TEXT NOT NULL,
    data_json TEXT NOT NULL,
    version INTEGER NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS family_skill_tree_backups (
    id INTEGER PRIMARY KEY,
    family_id TEXT NOT NULL,
    version INTEGER NOT NULL,
    data_json TEXT NOT NULL,
    created_at TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS family_skill_tree_backups_family_time
    ON family_skill_tree_backups(family_id, id DESC);
`);

export default async function handler(request, response) {
  setCors(response);
  if (request.method === "OPTIONS") {
    response.writeHead(204);
    response.end();
    return;
  }

  try {
    const token = getToken(request);
    if (!token) return sendJson(response, 401, { error: "缺少家庭同步码" });
    if (!/^[A-Za-z0-9_-]{24,256}$/.test(token)) return sendJson(response, 400, { error: "家庭同步码格式无效" });

    const familyId = digest(token).slice(0, 32);
    const tokenHash = digest(`skill-tree:${token}`);

    if (request.method === "GET") return handleGet(response, familyId, tokenHash);
    if (request.method === "POST") return handleBootstrap(request, response, familyId, tokenHash);
    if (request.method === "PUT") return handleSave(request, response, familyId, tokenHash);

    response.setHeader("allow", "GET, POST, PUT, OPTIONS");
    return sendJson(response, 405, { error: "Method not allowed" });
  } catch (error) {
    console.error("family-skill-tree", error?.message || error);
    return sendJson(response, Number(error?.statusCode || 500), { error: error?.statusCode ? String(error.message) : "云同步服务暂时不可用" });
  }
}

function handleGet(response, familyId, tokenHash) {
  const row = getRow(familyId);
  if (!row) return sendJson(response, 404, { exists: false });
  if (!sameHash(row.token_hash, tokenHash)) return sendJson(response, 403, { error: "家庭同步码不正确" });
  return sendJson(response, 200, {
    exists: true,
    familyId,
    version: Number(row.version),
    updatedAt: row.updated_at,
    state: safeParse(row.data_json)
  });
}

async function handleBootstrap(request, response, familyId, tokenHash) {
  const existing = getRow(familyId);
  if (existing) {
    if (!sameHash(existing.token_hash, tokenHash)) return sendJson(response, 403, { error: "家庭同步码不正确" });
    return sendJson(response, 200, {
      created: false,
      familyId,
      version: Number(existing.version),
      updatedAt: existing.updated_at,
      state: safeParse(existing.data_json)
    });
  }

  const body = await readJson(request);
  const state = validateState(body?.state);
  const now = new Date().toISOString();
  const dataJson = JSON.stringify(state);
  db.prepare(`
    INSERT INTO family_skill_tree_states
      (family_id, token_hash, data_json, version, created_at, updated_at)
    VALUES (?, ?, ?, 1, ?, ?)
  `).run(familyId, tokenHash, dataJson, now, now);

  return sendJson(response, 201, { created: true, familyId, version: 1, updatedAt: now, state });
}

async function handleSave(request, response, familyId, tokenHash) {
  const body = await readJson(request);
  const state = validateState(body?.state);
  const expectedVersion = Number(body?.expectedVersion || 0);
  const existing = getRow(familyId);

  if (!existing) {
    const now = new Date().toISOString();
    db.prepare(`
      INSERT INTO family_skill_tree_states
        (family_id, token_hash, data_json, version, created_at, updated_at)
      VALUES (?, ?, ?, 1, ?, ?)
    `).run(familyId, tokenHash, JSON.stringify(state), now, now);
    return sendJson(response, 201, { created: true, familyId, version: 1, updatedAt: now });
  }

  if (!sameHash(existing.token_hash, tokenHash)) return sendJson(response, 403, { error: "家庭同步码不正确" });
  const currentVersion = Number(existing.version);
  if (expectedVersion && expectedVersion !== currentVersion) {
    return sendJson(response, 409, {
      conflict: true,
      familyId,
      version: currentVersion,
      updatedAt: existing.updated_at,
      state: safeParse(existing.data_json)
    });
  }

  const now = new Date().toISOString();
  db.prepare(`
    INSERT INTO family_skill_tree_backups (family_id, version, data_json, created_at)
    VALUES (?, ?, ?, ?)
  `).run(familyId, currentVersion, existing.data_json, now);

  const nextVersion = currentVersion + 1;
  db.prepare(`
    UPDATE family_skill_tree_states
    SET data_json=?, version=?, updated_at=?
    WHERE family_id=?
  `).run(JSON.stringify(state), nextVersion, now, familyId);

  db.prepare(`
    DELETE FROM family_skill_tree_backups
    WHERE family_id=? AND id NOT IN (
      SELECT id FROM family_skill_tree_backups
      WHERE family_id=? ORDER BY id DESC LIMIT ?
    )
  `).run(familyId, familyId, MAX_BACKUPS);

  return sendJson(response, 200, { created: false, familyId, version: nextVersion, updatedAt: now });
}

function getRow(familyId) {
  return db.prepare(`
    SELECT family_id, token_hash, data_json, version, created_at, updated_at
    FROM family_skill_tree_states WHERE family_id=?
  `).get(familyId);
}

function validateState(state) {
  if (!state || typeof state !== "object" || !Array.isArray(state.children)) {
    throw Object.assign(new Error("状态数据格式无效"), { statusCode: 400 });
  }
  if (state.children.length < 1 || state.children.length > 20) {
    throw Object.assign(new Error("儿童档案数量无效"), { statusCode: 400 });
  }
  const json = JSON.stringify(state);
  if (Buffer.byteLength(json, "utf8") > MAX_STATE_BYTES) {
    throw Object.assign(new Error("状态数据过大"), { statusCode: 413 });
  }
  return state;
}

async function readJson(request) {
  if (request.body && typeof request.body === "object") return request.body;
  let raw = "";
  for await (const chunk of request) {
    raw += chunk;
    if (Buffer.byteLength(raw, "utf8") > MAX_STATE_BYTES + 20_000) {
      throw Object.assign(new Error("请求体过大"), { statusCode: 413 });
    }
  }
  try {
    return raw ? JSON.parse(raw) : {};
  } catch {
    throw Object.assign(new Error("JSON 格式无效"), { statusCode: 400 });
  }
}

function getToken(request) {
  const authorization = String(request.headers.authorization || "");
  const bearer = authorization.match(/^Bearer\s+(.+)$/i)?.[1];
  return String(bearer || request.headers["x-family-sync-token"] || "").trim();
}

function digest(value) {
  return createHash("sha256").update(String(value)).digest("hex");
}

function sameHash(a, b) {
  const left = Buffer.from(String(a));
  const right = Buffer.from(String(b));
  return left.length === right.length && timingSafeEqual(left, right);
}

function safeParse(value) {
  try { return JSON.parse(value); }
  catch { return null; }
}

function setCors(response) {
  response.setHeader("access-control-allow-origin", "*");
  response.setHeader("access-control-allow-methods", "GET, POST, PUT, OPTIONS");
  response.setHeader("access-control-allow-headers", "authorization, content-type, x-family-sync-token");
  response.setHeader("access-control-max-age", "86400");
  response.setHeader("cache-control", "no-store");
  response.setHeader("x-content-type-options", "nosniff");
}

function sendJson(response, status, payload) {
  response.writeHead(status, { "content-type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(payload));
}
