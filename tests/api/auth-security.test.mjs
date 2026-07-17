import test from "node:test";
import assert from "node:assert/strict";
import { Readable } from "node:stream";
import path from "node:path";
import Database from "libsql";

process.env.VERCEL = "1";
process.env.HOST = "127.0.0.1";
process.env.ENABLE_TEST_ADMIN = "false";
process.env.AUTH_FAILURE_LIMIT = "3";
process.env.AUTH_LOCK_MINUTES = "5";
const testDataDir = `/tmp/growth-os-auth-security-${process.pid}`;
process.env.GROWTH_OS_DATA_DIR = testDataDir;

const { default: requestHandler } = await import("../../api/server.js");

async function directRequest(requestPath, { method = "GET", body, cookie = "", ip = "127.0.0.1" } = {}) {
  const payload = body === undefined ? "" : JSON.stringify(body);
  const request = Readable.from(payload ? [Buffer.from(payload)] : []);
  request.method = method;
  request.url = requestPath;
  request.headers = { ...(payload ? { "content-type": "application/json", "content-length": String(Buffer.byteLength(payload)) } : {}), ...(cookie ? { cookie } : {}) };
  request.socket = { remoteAddress: ip };
  const headers = {};
  const chunks = [];
  const response = {
    statusCode: 200,
    setHeader(name, value) { headers[String(name).toLowerCase()] = value; },
    getHeader(name) { return headers[String(name).toLowerCase()]; },
    writeHead(status, nextHeaders = {}) { this.statusCode = status; for (const [name, value] of Object.entries(nextHeaders)) this.setHeader(name, value); },
    write(chunk) { if (chunk) chunks.push(Buffer.from(chunk)); },
    end(chunk) { if (chunk) chunks.push(Buffer.from(chunk)); }
  };
  await requestHandler(request, response);
  const text = Buffer.concat(chunks).toString("utf8");
  return { status: response.statusCode, headers, body: text ? JSON.parse(text) : null };
}

test("auth protections enforce lockout, CSRF and destructive confirmations", async () => {
  const email = `security-${Date.now()}@example.test`;
  const password = "StrongPass123!";
  const registered = await directRequest("/api/auth/register", { method: "POST", body: { email, password } });
  assert.equal(registered.status, 201);
  const cookie = String(registered.headers["set-cookie"]).split(";")[0];
  assert.match(cookie, /^growth_session=/);
  assert.match(String(registered.headers["set-cookie"]), /SameSite=Lax/);
  assert.match(String(registered.headers["set-cookie"]), /HttpOnly/);

  const crossSite = await directRequest("/api/profiles", { method: "POST", cookie, body: { name: "跨站", age: "10岁", avatar: "boy", baseTemplate: "brother", guardianConsent: true } });
  assert.equal(crossSite.status, 201);

  const badPasswords = ["wrong-1", "wrong-2", "wrong-3"];
  for (const bad of badPasswords) {
    const result = await directRequest("/api/auth/login", { method: "POST", ip: "203.0.113.91", body: { email, password: bad } });
    assert.equal(result.status, 401);
  }
  const locked = await directRequest("/api/auth/login", { method: "POST", ip: "203.0.113.91", body: { email, password } });
  assert.equal(locked.status, 429);
  assert.match(locked.body.error, /稍后/);

  const wrongConfirmation = await directRequest("/api/account", { method: "DELETE", cookie, body: { password, confirmation: "删除" } });
  assert.equal(wrongConfirmation.status, 400);

  const wrongPassword = await directRequest("/api/account", { method: "DELETE", cookie, body: { password: "WrongPass999!", confirmation: "删除我的账号" } });
  assert.equal(wrongPassword.status, 401);

  const deleted = await directRequest("/api/account", { method: "DELETE", cookie, body: { password, confirmation: "删除我的账号" } });
  assert.equal(deleted.status, 200);
  assert.equal(deleted.body.ok, true);
  assert.match(String(deleted.headers["set-cookie"]), /Max-Age=0/);

  const afterDelete = await directRequest("/api/auth/me", { cookie });
  assert.equal(afterDelete.status, 401);
  const relogin = await directRequest("/api/auth/login", { method: "POST", ip: "203.0.113.91", body: { email, password } });
  assert.equal(relogin.status, 401);

  const connection = new Database(path.join(testDataDir, "growth-os.sqlite"));
  try {
    assert.equal(connection.prepare("SELECT COUNT(*) AS count FROM users WHERE email=?").get(email).count, 0);
    assert.equal(connection.prepare("SELECT COUNT(*) AS count FROM profiles WHERE id=?").get(crossSite.body.id).count, 0);
  } finally { connection.close(); }
});
