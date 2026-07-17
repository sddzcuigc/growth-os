import test from "node:test";
import assert from "node:assert/strict";
import { Readable } from "node:stream";
import path from "node:path";
import Database from "libsql";

process.env.VERCEL = "1";
process.env.HOST = "127.0.0.1";
process.env.ENABLE_TEST_ADMIN = "false";
process.env.AI_API_KEY = "test-key";
process.env.AI_BASE_URL = "https://model.test/v1";
const testDataDir = `/tmp/growth-os-delete-race-${process.pid}`;
process.env.GROWTH_OS_DATA_DIR = testDataDir;

let releaseModel;
let markModelStarted;
const modelStarted = new Promise((resolve) => { markModelStarted = resolve; });
const modelGate = new Promise((resolve) => { releaseModel = resolve; });
const originalFetch = globalThis.fetch;
globalThis.fetch = async (url, options) => {
  if (String(url).includes("/chat/completions")) {
    markModelStarted();
    await modelGate;
    return new Response(JSON.stringify({ choices: [{ message: { content: JSON.stringify({ headline: "竞态测试任务册", rationale: "模型完成时角色已经删除", categories: [] }) } }] }), { status: 200, headers: { "content-type": "application/json" } });
  }
  return originalFetch(url, options);
};

const { default: requestHandler } = await import("../../api/server.js");

async function directRequest(requestPath, { method = "GET", body, cookie = "" } = {}) {
  const payload = body === undefined ? "" : JSON.stringify(body);
  const request = Readable.from(payload ? [Buffer.from(payload)] : []);
  request.method = method;
  request.url = requestPath;
  request.headers = { ...(payload ? { "content-type": "application/json", "content-length": String(Buffer.byteLength(payload)) } : {}), ...(cookie ? { cookie } : {}) };
  request.socket = { remoteAddress: "127.0.0.1" };
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

test("a delayed model response cannot recreate child data after account deletion", async () => {
  const email = `race-${Date.now()}@example.test`;
  const password = "DeleteRace123!";
  const registered = await directRequest("/api/auth/register", { method: "POST", body: { email, password } });
  assert.equal(registered.status, 201);
  const cookie = String(registered.headers["set-cookie"]).split(";")[0];
  const profile = await directRequest("/api/profiles", { method: "POST", cookie, body: { name: "并发删除", age: "10岁", avatar: "boy", baseTemplate: "brother", guardianConsent: true } });
  assert.equal(profile.status, 201);

  const categories = ["健康", "学习", "生活", "责任", "表达", "未来"];
  const baseTasks = categories.flatMap((category, categoryIndex) => Array.from({ length: 3 }, (_, index) => ({ id: `${categoryIndex}-${index}`, slot: `${categoryIndex}-${index}`, title: `${category}任务${index + 1}`, category, skill: "metacognition", minutes: 5, contextUsed: ["成长蓝图"] })));
  const pendingMission = directRequest("/api/daily-missions/generate", { method: "POST", cookie, body: { profileId: profile.body.id, baseTasks, child: { name: "并发删除", age: "10岁" }, activeGoals: [], today: { energy: "normal" } } });
  await modelStarted;

  const deleted = await directRequest("/api/account", { method: "DELETE", cookie, body: { password, confirmation: "删除我的账号" } });
  assert.equal(deleted.status, 200);
  releaseModel();
  const missionResult = await pendingMission;
  assert.equal(missionResult.status, 410);
  assert.match(missionResult.body.error, /已删除/);

  const connection = new Database(path.join(testDataDir, "growth-os.sqlite"));
  try {
    assert.equal(connection.prepare("SELECT COUNT(*) AS count FROM users WHERE email=?").get(email).count, 0);
    assert.equal(connection.prepare("SELECT COUNT(*) AS count FROM profiles WHERE id=?").get(profile.body.id).count, 0);
    assert.equal(connection.prepare("SELECT COUNT(*) AS count FROM daily_mission_books WHERE profile_id=?").get(profile.body.id).count, 0);
  } finally { connection.close(); }
});
