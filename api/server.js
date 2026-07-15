import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { existsSync, readFileSync } from "node:fs";
import { extname, join, resolve } from "node:path";
import { mkdirSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

loadEnvFile(".runtime.env");
loadEnvFile(".env.local");
loadEnvFile(".env");

const root = process.cwd();
const port = Number(process.env.PORT || 5173);
const host = process.env.HOST || "127.0.0.1";
const baseUrl = process.env.SILICONFLOW_BASE_URL || "https://api.siliconflow.cn/v1";
const model = process.env.SILICONFLOW_MODEL || "zai-org/GLM-5.2";
const apiKey = process.env.SILICONFLOW_API_KEY;
const devAdminEnabled = process.env.NODE_ENV !== "production" && ["127.0.0.1", "localhost"].includes(host) && process.env.ENABLE_TEST_ADMIN !== "false";
const dataDir = process.env.VERCEL ? "/tmp/growth-os" : join(root, "data");
mkdirSync(dataDir, { recursive: true });
const db = new DatabaseSync(join(dataDir, "growth-os.sqlite"));
db.exec(`
  PRAGMA journal_mode=WAL;
  PRAGMA foreign_keys=ON;
  CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, email TEXT UNIQUE NOT NULL, password_hash TEXT NOT NULL, created_at TEXT NOT NULL);
  CREATE TABLE IF NOT EXISTS sessions (token TEXT PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE, expires_at TEXT NOT NULL);
  CREATE TABLE IF NOT EXISTS profiles (id TEXT PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE, name TEXT NOT NULL, age TEXT NOT NULL, avatar TEXT NOT NULL, base_template TEXT NOT NULL, created_at TEXT NOT NULL, UNIQUE(user_id, name));
  CREATE TABLE IF NOT EXISTS snapshots (profile_id TEXT PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE, data_json TEXT NOT NULL, updated_at TEXT NOT NULL);
  CREATE TABLE IF NOT EXISTS memories (id INTEGER PRIMARY KEY, profile_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE, kind TEXT NOT NULL, summary TEXT NOT NULL, evidence_json TEXT NOT NULL, created_at TEXT NOT NULL);
  CREATE TABLE IF NOT EXISTS consents (profile_id TEXT PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE, user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE, consent_version TEXT NOT NULL, guardian_confirmed INTEGER NOT NULL, granted_at TEXT NOT NULL);
  CREATE TABLE IF NOT EXISTS events (id INTEGER PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE, profile_id TEXT REFERENCES profiles(id) ON DELETE CASCADE, event_name TEXT NOT NULL, properties_json TEXT NOT NULL, created_at TEXT NOT NULL);
  CREATE TABLE IF NOT EXISTS journals (id INTEGER PRIMARY KEY, profile_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE, source TEXT NOT NULL, prompt TEXT NOT NULL, content TEXT NOT NULL, tags_json TEXT NOT NULL, created_at TEXT NOT NULL);
  CREATE TABLE IF NOT EXISTS memory_hypotheses (id INTEGER PRIMARY KEY, profile_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE, hypothesis_key TEXT NOT NULL, category TEXT NOT NULL, title TEXT NOT NULL, summary TEXT NOT NULL, confidence REAL NOT NULL, evidence_count INTEGER NOT NULL, counter_count INTEGER NOT NULL, status TEXT NOT NULL, ai_context INTEGER NOT NULL, evidence_json TEXT NOT NULL, updated_at TEXT NOT NULL, UNIQUE(profile_id,hypothesis_key));
  CREATE TABLE IF NOT EXISTS ideas (id INTEGER PRIMARY KEY, profile_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE, title TEXT NOT NULL, note TEXT NOT NULL, source TEXT NOT NULL, status TEXT NOT NULL, next_step TEXT NOT NULL, skill TEXT NOT NULL, ai_json TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
  CREATE TABLE IF NOT EXISTS idea_resurfacings (id INTEGER PRIMARY KEY, profile_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE, idea_id INTEGER NOT NULL REFERENCES ideas(id) ON DELETE CASCADE, prompt_json TEXT NOT NULL, outcome TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
  CREATE TABLE IF NOT EXISTS actions (id INTEGER PRIMARY KEY, profile_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE, title TEXT NOT NULL, detail TEXT NOT NULL, status TEXT NOT NULL, estimate_minutes INTEGER NOT NULL, energy TEXT NOT NULL, importance INTEGER NOT NULL, due_at TEXT NOT NULL, source TEXT NOT NULL, source_ref TEXT NOT NULL, steps_json TEXT NOT NULL, success TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
  CREATE TABLE IF NOT EXISTS habits (id INTEGER PRIMARY KEY, profile_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE, title TEXT NOT NULL, cue TEXT NOT NULL, target_minutes INTEGER NOT NULL, frequency_json TEXT NOT NULL, active INTEGER NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
  CREATE TABLE IF NOT EXISTS habit_logs (id INTEGER PRIMARY KEY, habit_id INTEGER NOT NULL REFERENCES habits(id) ON DELETE CASCADE, log_date TEXT NOT NULL, status TEXT NOT NULL, created_at TEXT NOT NULL, UNIQUE(habit_id,log_date));
  CREATE TABLE IF NOT EXISTS focus_sessions (id INTEGER PRIMARY KEY, profile_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE, action_id INTEGER REFERENCES actions(id) ON DELETE SET NULL, title TEXT NOT NULL, planned_seconds INTEGER NOT NULL, status TEXT NOT NULL, elapsed_seconds INTEGER NOT NULL, resumed_at TEXT NOT NULL, started_at TEXT NOT NULL, ended_at TEXT NOT NULL, outcome TEXT NOT NULL);
  CREATE TABLE IF NOT EXISTS weekly_reviews (id INTEGER PRIMARY KEY, profile_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE, week_start TEXT NOT NULL, report_json TEXT NOT NULL, feedback TEXT NOT NULL, status TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL, UNIQUE(profile_id,week_start));
  CREATE TABLE IF NOT EXISTS family_briefs (id INTEGER PRIMARY KEY, profile_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE, week_start TEXT NOT NULL, report_json TEXT NOT NULL, status TEXT NOT NULL, provider TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL, UNIQUE(profile_id,week_start));
  CREATE TABLE IF NOT EXISTS task_feedback (id INTEGER PRIMARY KEY, profile_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE, task_key TEXT NOT NULL, task_title TEXT NOT NULL, skill TEXT NOT NULL, mode TEXT NOT NULL, difficulty TEXT NOT NULL, enjoyment TEXT NOT NULL, support TEXT NOT NULL, note TEXT NOT NULL, feedback_date TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL, UNIQUE(profile_id,task_key,feedback_date));
  CREATE TABLE IF NOT EXISTS artifacts (id INTEGER PRIMARY KEY, profile_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE, task_key TEXT NOT NULL, title TEXT NOT NULL, skill TEXT NOT NULL, artifact_type TEXT NOT NULL, caption TEXT NOT NULL, content_text TEXT NOT NULL, link_url TEXT NOT NULL, media_mime TEXT NOT NULL, media_data TEXT NOT NULL, ai_context INTEGER NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
  CREATE TABLE IF NOT EXISTS daily_plans (id INTEGER PRIMARY KEY, profile_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE, plan_date TEXT NOT NULL, checkin_json TEXT NOT NULL, plan_json TEXT NOT NULL, excluded_json TEXT NOT NULL, status TEXT NOT NULL, feedback TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL, UNIQUE(profile_id,plan_date));
  CREATE TABLE IF NOT EXISTS daily_plan_feedback (id INTEGER PRIMARY KEY, profile_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE, daily_plan_id INTEGER REFERENCES daily_plans(id) ON DELETE SET NULL, source_ref TEXT NOT NULL, source_type TEXT NOT NULL, reason TEXT NOT NULL, created_at TEXT NOT NULL);
  CREATE TABLE IF NOT EXISTS strategy_insights (id INTEGER PRIMARY KEY, profile_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE, insight_key TEXT NOT NULL, category TEXT NOT NULL, statement TEXT NOT NULL, when_to_use TEXT NOT NULL, question TEXT NOT NULL, evidence_json TEXT NOT NULL, confidence REAL NOT NULL, status TEXT NOT NULL, feedback TEXT NOT NULL, ai_context INTEGER NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL, UNIQUE(profile_id,insight_key));
  CREATE TABLE IF NOT EXISTS action_rescues (id INTEGER PRIMARY KEY, profile_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE, action_id INTEGER NOT NULL REFERENCES actions(id) ON DELETE CASCADE, reason TEXT NOT NULL, response_json TEXT NOT NULL, outcome TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
  CREATE TABLE IF NOT EXISTS growth_goals (id INTEGER PRIMARY KEY, profile_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE, title TEXT NOT NULL, why_text TEXT NOT NULL, success_signal TEXT NOT NULL, first_experiment TEXT NOT NULL, skill TEXT NOT NULL, horizon TEXT NOT NULL, status TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
  CREATE TABLE IF NOT EXISTS self_coach_answers (id INTEGER PRIMARY KEY, profile_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE, question TEXT NOT NULL, answer TEXT NOT NULL, confidence TEXT NOT NULL, evidence_json TEXT NOT NULL, next_question TEXT NOT NULL, provider TEXT NOT NULL, feedback TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
  CREATE TABLE IF NOT EXISTS action_decisions (id INTEGER PRIMARY KEY, profile_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE, action_id INTEGER NOT NULL REFERENCES actions(id) ON DELETE CASCADE, reason TEXT NOT NULL, outcome TEXT NOT NULL, note TEXT NOT NULL, created_at TEXT NOT NULL);
  CREATE INDEX IF NOT EXISTS action_decisions_action_time ON action_decisions(action_id,created_at);
  CREATE INDEX IF NOT EXISTS self_coach_profile_time ON self_coach_answers(profile_id,created_at);
  CREATE INDEX IF NOT EXISTS goals_profile_status ON growth_goals(profile_id,status,updated_at);
  CREATE INDEX IF NOT EXISTS rescues_action_time ON action_rescues(action_id,created_at);
  CREATE INDEX IF NOT EXISTS strategy_profile_status ON strategy_insights(profile_id,status,confidence,updated_at);
  CREATE INDEX IF NOT EXISTS daily_plans_profile_date ON daily_plans(profile_id,plan_date);
  CREATE INDEX IF NOT EXISTS daily_feedback_profile_time ON daily_plan_feedback(profile_id,created_at);
  CREATE INDEX IF NOT EXISTS artifacts_profile_time ON artifacts(profile_id,created_at);
  CREATE INDEX IF NOT EXISTS feedback_profile_time ON task_feedback(profile_id,feedback_date,updated_at);
  CREATE INDEX IF NOT EXISTS reviews_profile_week ON weekly_reviews(profile_id,week_start);
  CREATE INDEX IF NOT EXISTS family_briefs_profile_week ON family_briefs(profile_id,week_start,status);
  CREATE INDEX IF NOT EXISTS focus_profile_status ON focus_sessions(profile_id,status,started_at);
  CREATE INDEX IF NOT EXISTS habits_profile_active ON habits(profile_id,active,updated_at);
  CREATE INDEX IF NOT EXISTS actions_profile_status ON actions(profile_id,status,due_at,updated_at);
  CREATE INDEX IF NOT EXISTS ideas_profile_status ON ideas(profile_id,status,updated_at);
  CREATE INDEX IF NOT EXISTS idea_resurfacings_profile_time ON idea_resurfacings(profile_id,outcome,created_at);
  CREATE INDEX IF NOT EXISTS journals_profile_time ON journals(profile_id, created_at);
  CREATE INDEX IF NOT EXISTS events_profile_time ON events(profile_id, created_at);
`);
ensureColumn("journals", "ai_context", "INTEGER NOT NULL DEFAULT 1");
ensureColumn("task_feedback", "motivation", "TEXT NOT NULL DEFAULT 'unknown'");
ensureColumn("actions", "goal_id", "INTEGER NOT NULL DEFAULT 0");
ensureColumn("ideas", "goal_id", "INTEGER NOT NULL DEFAULT 0");
ensureColumn("ideas", "last_surfaced_at", "TEXT NOT NULL DEFAULT ''");
ensureColumn("ideas", "surface_count", "INTEGER NOT NULL DEFAULT 0");
ensureColumn("ideas", "snoozed_until", "TEXT NOT NULL DEFAULT ''");
ensureColumn("actions", "not_before", "TEXT NOT NULL DEFAULT ''");
ensureColumn("actions", "defer_count", "INTEGER NOT NULL DEFAULT 0");
ensureColumn("actions", "last_defer_reason", "TEXT NOT NULL DEFAULT ''");
ensureColumn("users", "recovery_hash", "TEXT NOT NULL DEFAULT ''");
ensureColumn("users", "recovery_updated_at", "TEXT NOT NULL DEFAULT ''");
const skillNameToId = {
  自我调节: "self-regulation",
  会学会想: "metacognition",
  元认知: "metacognition",
  表达沟通: "communication",
  数据推理: "data-reasoning",
  AI协作: "ai-literacy",
  ai协作: "ai-literacy",
  AI素养: "ai-literacy",
  创造项目: "creation",
  判断协作: "ethics-collaboration",
  身心底座: "wellbeing"
};
const skillIdToName = {
  "self-regulation": "自我调节", metacognition: "会学会想", communication: "表达沟通", "data-reasoning": "数据推理", "ai-literacy": "AI协作", creation: "创造项目", "ethics-collaboration": "判断协作", wellbeing: "身心底座"
};

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml"
};

async function requestHandler(request, response) {
  try {
    const url = new URL(request.url || "/", `http://${request.headers.host}`);
    if (request.method === "POST" && url.pathname === "/api/auth/register") return handleRegister(request, response);
    if (request.method === "POST" && url.pathname === "/api/auth/login") return handleLogin(request, response);
    if (request.method === "POST" && url.pathname === "/api/auth/logout") return handleLogout(request, response);
    if (request.method === "POST" && url.pathname === "/api/auth/recovery/rotate") return handleRotateRecovery(request, response);
    if (request.method === "POST" && url.pathname === "/api/auth/recovery/reset") return handleRecoveryReset(request, response);
    if (request.method === "POST" && url.pathname === "/api/dev/login") return handleDevLogin(request, response);
    if (request.method === "GET" && url.pathname === "/api/account") return handleAccount(request, response);
    if (request.method === "POST" && url.pathname === "/api/profiles") return handleCreateProfile(request, response);
    if (request.method === "GET" && url.pathname === "/api/progress") return handleGetProgress(request, response, url);
    if (request.method === "PUT" && url.pathname === "/api/progress") return handleSaveProgress(request, response);
    if (request.method === "GET" && url.pathname === "/api/export") return handleExport(request, response, url);
    if (request.method === "DELETE" && url.pathname.startsWith("/api/memories/")) return handleDeleteMemory(request, response, url);
    if (request.method === "POST" && url.pathname === "/api/events") return handleEvent(request, response);
    if (request.method === "GET" && url.pathname === "/api/metrics") return handleMetrics(request, response, url);
    if (request.method === "GET" && url.pathname === "/api/journal") return handleListJournal(request, response, url);
    if (request.method === "POST" && url.pathname === "/api/journal") return handleCreateJournal(request, response);
    if (request.method === "DELETE" && url.pathname.startsWith("/api/journal/")) return handleDeleteJournal(request, response, url);
    if (request.method === "POST" && url.pathname === "/api/journal/prompt") return handleJournalPrompt(request, response);
    if (request.method === "GET" && url.pathname === "/api/hypotheses") return handleListHypotheses(request, response, url);
    if (request.method === "POST" && /^\/api\/hypotheses\/\d+\/feedback$/.test(url.pathname)) return handleHypothesisFeedback(request, response, url);
    if (request.method === "GET" && url.pathname === "/api/strategy-insights") return handleListStrategyInsights(request, response, url);
    if (request.method === "POST" && url.pathname === "/api/strategy-insights/generate") return handleGenerateStrategyInsights(request, response);
    if (request.method === "PATCH" && /^\/api\/strategy-insights\/\d+$/.test(url.pathname)) return handleStrategyInsightFeedback(request, response, url);
    if (request.method === "GET" && url.pathname === "/api/ideas") return handleListIdeas(request, response, url);
    if (request.method === "POST" && url.pathname === "/api/ideas") return handleCreateIdea(request, response);
    if (request.method === "PATCH" && /^\/api\/ideas\/\d+$/.test(url.pathname)) return handleUpdateIdea(request, response, url);
    if (request.method === "DELETE" && /^\/api\/ideas\/\d+$/.test(url.pathname)) return handleDeleteIdea(request, response, url);
    if (request.method === "POST" && /^\/api\/ideas\/\d+\/develop$/.test(url.pathname)) return handleDevelopIdea(request, response, url);
    if (request.method === "GET" && url.pathname === "/api/idea-resurfacing") return handleGetIdeaResurfacing(request, response, url);
    if (request.method === "POST" && url.pathname === "/api/idea-resurfacing") return handleCreateIdeaResurfacing(request, response);
    if (request.method === "PATCH" && /^\/api\/idea-resurfacings\/\d+$/.test(url.pathname)) return handleIdeaResurfacingOutcome(request, response, url);
    if (request.method === "GET" && url.pathname === "/api/actions") return handleListActions(request, response, url);
    if (request.method === "POST" && url.pathname === "/api/actions") return handleCreateAction(request, response);
    if (request.method === "POST" && url.pathname === "/api/action-inbox/parse") return handleParseActionInbox(request, response);
    if (request.method === "POST" && url.pathname === "/api/capture/parse") return handleParseCapture(request, response);
    if (request.method === "GET" && url.pathname === "/api/goals") return handleListGoals(request, response, url);
    if (request.method === "POST" && url.pathname === "/api/goals/shape") return handleShapeGoal(request, response);
    if (request.method === "POST" && url.pathname === "/api/goals") return handleCreateGoal(request, response);
    if (request.method === "PATCH" && /^\/api\/goals\/\d+$/.test(url.pathname)) return handleUpdateGoal(request, response, url);
    if (request.method === "DELETE" && /^\/api\/goals\/\d+$/.test(url.pathname)) return handleDeleteGoal(request, response, url);
    if (request.method === "GET" && url.pathname === "/api/self-coach") return handleListSelfCoach(request, response, url);
    if (request.method === "POST" && url.pathname === "/api/self-coach/ask") return handleAskSelfCoach(request, response);
    if (request.method === "PATCH" && /^\/api\/self-coach\/\d+$/.test(url.pathname)) return handleSelfCoachFeedback(request, response, url);
    if (request.method === "DELETE" && /^\/api\/self-coach\/\d+$/.test(url.pathname)) return handleDeleteSelfCoach(request, response, url);
    if (request.method === "PATCH" && /^\/api\/actions\/\d+$/.test(url.pathname)) return handleUpdateAction(request, response, url);
    if (request.method === "DELETE" && /^\/api\/actions\/\d+$/.test(url.pathname)) return handleDeleteAction(request, response, url);
    if (request.method === "POST" && /^\/api\/actions\/\d+\/breakdown$/.test(url.pathname)) return handleBreakdownAction(request, response, url);
    if (request.method === "POST" && /^\/api\/actions\/\d+\/negotiate$/.test(url.pathname)) return handleNegotiateAction(request, response, url);
    if (request.method === "PATCH" && /^\/api\/actions\/\d+\/defer$/.test(url.pathname)) return handleDeferAction(request, response, url);
    if (request.method === "POST" && /^\/api\/actions\/\d+\/rescue$/.test(url.pathname)) return handleActionRescue(request, response, url);
    if (request.method === "PATCH" && /^\/api\/action-rescues\/\d+$/.test(url.pathname)) return handleActionRescueOutcome(request, response, url);
    if (request.method === "GET" && url.pathname === "/api/habits") return handleListHabits(request, response, url);
    if (request.method === "POST" && url.pathname === "/api/habits") return handleCreateHabit(request, response);
    if (request.method === "DELETE" && /^\/api\/habits\/\d+$/.test(url.pathname)) return handleDeleteHabit(request, response, url);
    if (request.method === "POST" && /^\/api\/habits\/\d+\/checkin$/.test(url.pathname)) return handleHabitCheckin(request, response, url);
    if (request.method === "GET" && url.pathname === "/api/focus") return handleGetFocus(request, response, url);
    if (request.method === "POST" && url.pathname === "/api/focus") return handleStartFocus(request, response);
    if (request.method === "PATCH" && /^\/api\/focus\/\d+$/.test(url.pathname)) return handleUpdateFocus(request, response, url);
    if (request.method === "GET" && url.pathname === "/api/reviews") return handleListReviews(request, response, url);
    if (request.method === "POST" && url.pathname === "/api/reviews/generate") return handleGenerateReview(request, response);
    if (request.method === "PATCH" && /^\/api\/reviews\/\d+$/.test(url.pathname)) return handleReviewFeedback(request, response, url);
    if (request.method === "GET" && url.pathname === "/api/family-brief") return handleGetFamilyBrief(request, response, url);
    if (request.method === "POST" && url.pathname === "/api/family-brief/generate") return handleGenerateFamilyBrief(request, response);
    if (request.method === "PATCH" && /^\/api\/family-brief\/\d+$/.test(url.pathname)) return handleUpdateFamilyBrief(request, response, url);
    if (request.method === "DELETE" && /^\/api\/family-brief\/\d+$/.test(url.pathname)) return handleDeleteFamilyBrief(request, response, url);
    if (request.method === "GET" && url.pathname === "/api/task-feedback") return handleListTaskFeedback(request, response, url);
    if (request.method === "POST" && url.pathname === "/api/task-feedback") return handleCreateTaskFeedback(request, response);
    if (request.method === "GET" && url.pathname === "/api/artifacts") return handleListArtifacts(request, response, url);
    if (request.method === "POST" && url.pathname === "/api/artifacts") return handleCreateArtifact(request, response);
    if (request.method === "GET" && /^\/api\/artifacts\/\d+\/media$/.test(url.pathname)) return handleArtifactMedia(request, response, url);
    if (request.method === "PATCH" && /^\/api\/artifacts\/\d+$/.test(url.pathname)) return handleUpdateArtifact(request, response, url);
    if (request.method === "DELETE" && /^\/api\/artifacts\/\d+$/.test(url.pathname)) return handleDeleteArtifact(request, response, url);
    if (request.method === "GET" && url.pathname === "/api/daily-plan") return handleGetDailyPlan(request, response, url);
    if (request.method === "GET" && url.pathname === "/api/daily-plan-feedback") return handleListDailyPlanFeedback(request, response, url);
    if (request.method === "DELETE" && /^\/api\/daily-plan-feedback\/\d+$/.test(url.pathname)) return handleDeleteDailyPlanFeedback(request, response, url);
    if (request.method === "POST" && url.pathname === "/api/daily-plan/generate") return handleGenerateDailyPlan(request, response);
    if (request.method === "PATCH" && /^\/api\/daily-plan\/\d+$/.test(url.pathname)) return handleUpdateDailyPlan(request, response, url);
    if (request.method === "DELETE" && /^\/api\/daily-plan\/\d+$/.test(url.pathname)) return handleDeleteDailyPlan(request, response, url);
    if (request.method === "GET" && url.pathname === "/api/status") {
      sendJson(response, 200, {
        connected: Boolean(apiKey),
        provider: "SiliconFlow",
        model,
        newsAvailable: true
      });
      return;
    }

    if (request.method === "GET" && url.pathname === "/api/context/news") {
      await handleNewsContext(url, response);
      return;
    }

    if (request.method === "POST" && url.pathname === "/api/coach") {
      await handleCoach(request, response);
      return;
    }

    if (request.method === "POST" && url.pathname === "/api/plan") {
      await handlePlan(request, response);
      return;
    }

    if (request.method !== "GET") {
      sendJson(response, 405, { error: "Method not allowed" });
      return;
    }

    const pathname = url.pathname === "/" ? "/index.html" : url.pathname;
    const extension = extname(pathname);
    const isPublicFile = pathname === "/index.html"
      || pathname === "/app.js"
      || extension === ".css"
      || (pathname.startsWith("/assets/") && [".png", ".jpg", ".jpeg", ".webp", ".svg"].includes(extension));
    if (!isPublicFile) {
      sendJson(response, 404, { error: "Not found" });
      return;
    }
    const filePath = safeJoin(root, pathname);
    if (!filePath) {
      sendJson(response, 403, { error: "Forbidden" });
      return;
    }
    const content = await readFile(filePath);
    response.writeHead(200, {
      "content-type": mimeTypes[extname(filePath)] || "application/octet-stream"
    });
    response.end(content);
  } catch (error) {
    if (error.code === "ENOENT") {
      sendJson(response, 404, { error: "Not found" });
      return;
    }
    console.error(error);
    sendJson(response, 500, { error: "Internal server error" });
  }
}

export default requestHandler;

if (!process.env.VERCEL) {
  createServer(requestHandler).listen(port, host, () => {
    console.log(`Talent Task OS running at http://${host}:${port}`);
    console.log(`SiliconFlow model: ${model}`);
  });
}

function nowIso() { return new Date().toISOString(); }
function ensureColumn(table, column, definition) {
  const columns = db.prepare(`PRAGMA table_info(${table})`).all().map((item) => item.name);
  if (!columns.includes(column)) db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
}
function profileId() { return `profile_${randomBytes(10).toString("hex")}`; }
function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  return `${salt}:${scryptSync(password, salt, 64).toString("hex")}`;
}
function verifyPassword(password, stored) {
  const [salt, expectedHex] = String(stored).split(":");
  if (!salt || !expectedHex) return false;
  const actual = scryptSync(password, salt, 64);
  const expected = Buffer.from(expectedHex, "hex");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}
function cookieMap(request) {
  return Object.fromEntries(String(request.headers.cookie || "").split(";").map((part) => part.trim().split("=")).filter(([key]) => key));
}
function currentUser(request) {
  const token = cookieMap(request).growth_session;
  if (!token) return null;
  return db.prepare(`SELECT users.id, users.email FROM sessions JOIN users ON users.id=sessions.user_id WHERE sessions.token=? AND sessions.expires_at>?`).get(token, nowIso()) || null;
}
function requireUser(request, response) {
  const user = currentUser(request);
  if (!user) sendJson(response, 401, { error: "请先登录" });
  return user;
}
function publicProfiles(userId) {
  return db.prepare(`SELECT profiles.id,name,age,avatar,base_template AS baseTemplate,profiles.created_at AS createdAt,
    CASE WHEN consents.guardian_confirmed=1 THEN 1 ELSE 0 END AS consentGranted,
    consents.consent_version AS consentVersion,consents.granted_at AS consentGrantedAt
    FROM profiles LEFT JOIN consents ON consents.profile_id=profiles.id WHERE profiles.user_id=? ORDER BY profiles.created_at`).all(userId)
    .map((profile) => ({ ...profile, consentGranted: Boolean(profile.consentGranted) }));
}
function createSession(response, userId) {
  const token = randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 30 * 86400000).toISOString();
  db.prepare("INSERT INTO sessions(token,user_id,expires_at) VALUES(?,?,?)").run(token, userId, expires);
  response.setHeader("set-cookie", `growth_session=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=2592000`);
}
const recoveryAttempts = new Map();
const dummyRecoveryHash = hashPassword(randomBytes(24).toString("hex"));
function recoveryCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = randomBytes(20);
  const raw = [...bytes].map((byte) => alphabet[byte % alphabet.length]).join("");
  return raw.match(/.{1,4}/g).join("-");
}
function normalizeRecoveryCode(value) {
  return String(value || "").toUpperCase().replace(/[^A-Z2-9]/g, "");
}
function consumeRecoveryAttempt(request, email) {
  const key = `${request.socket?.remoteAddress || "local"}:${email}`;
  const now = Date.now();
  const current = recoveryAttempts.get(key);
  if (!current || now - current.startedAt > 15 * 60000) { recoveryAttempts.set(key, { count: 1, startedAt: now }); return true; }
  if (current.count >= 5) return false;
  current.count += 1;
  return true;
}
async function handleRotateRecovery(request, response) {
  const user = requireUser(request, response); if (!user) return;
  const body = await readBodyJson(request);
  const row = db.prepare("SELECT id,email,password_hash FROM users WHERE id=?").get(user.id);
  const isDevAdmin = row.email === "admin@growth-os.local" && devAdminEnabled;
  if (!isDevAdmin && !verifyPassword(String(body.currentPassword || ""), row.password_hash)) return sendJson(response, 401, { error: "当前密码不正确" });
  const code = recoveryCode();
  db.prepare("UPDATE users SET recovery_hash=?,recovery_updated_at=? WHERE id=?").run(hashPassword(normalizeRecoveryCode(code)), nowIso(), user.id);
  recordEvent(user.id, null, "recovery_rotated", { isDevAdmin });
  sendJson(response, 200, { recoveryCode: code, updatedAt: nowIso() });
}
async function handleRecoveryReset(request, response) {
  const body = await readBodyJson(request);
  const email = String(body.email || "").trim().toLowerCase();
  const code = normalizeRecoveryCode(body.recoveryCode);
  const newPassword = String(body.newPassword || "");
  if (!consumeRecoveryAttempt(request, email)) return sendJson(response, 429, { error: "尝试次数过多，请15分钟后再试" });
  if (!/^\S+@\S+\.\S+$/.test(email) || code.length !== 20 || newPassword.length < 8) return sendJson(response, 400, { error: "恢复信息不正确" });
  const row = db.prepare("SELECT id,email,recovery_hash FROM users WHERE email=?").get(email);
  const validCode = verifyPassword(code, row?.recovery_hash || dummyRecoveryHash);
  if (!row?.recovery_hash || !validCode) return sendJson(response, 400, { error: "恢复信息不正确" });
  db.exec("BEGIN");
  try {
    db.prepare("UPDATE users SET password_hash=?,recovery_hash='',recovery_updated_at=? WHERE id=?").run(hashPassword(newPassword), nowIso(), row.id);
    db.prepare("DELETE FROM sessions WHERE user_id=?").run(row.id);
    db.exec("COMMIT");
  } catch (error) { db.exec("ROLLBACK"); throw error; }
  recoveryAttempts.delete(`${request.socket?.remoteAddress || "local"}:${email}`);
  recordEvent(row.id, null, "recovery_reset", { sessionsRevoked: true });
  createSession(response, row.id);
  sendJson(response, 200, { email: row.email, profiles: publicProfiles(row.id), recoveryConfigured: false, recoveryUpdatedAt: nowIso(), recoveryCodeUsed: true });
}
async function handleRegister(request, response) {
  const body = await readBodyJson(request);
  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");
  if (!/^\S+@\S+\.\S+$/.test(email) || password.length < 8) return sendJson(response, 400, { error: "请输入有效邮箱和至少8位密码" });
  try {
    const code = recoveryCode();
    const result = db.prepare("INSERT INTO users(email,password_hash,created_at,recovery_hash,recovery_updated_at) VALUES(?,?,?,?,?)").run(email, hashPassword(password), nowIso(), hashPassword(normalizeRecoveryCode(code)), nowIso());
    createSession(response, Number(result.lastInsertRowid));
    sendJson(response, 201, { email, profiles: [], recoveryConfigured: true, recoveryUpdatedAt: nowIso(), recoveryCode: code });
  } catch (error) {
    sendJson(response, 409, { error: "这个邮箱已注册" });
  }
}
async function handleLogin(request, response) {
  const body = await readBodyJson(request);
  const email = String(body.email || "").trim().toLowerCase();
  const row = db.prepare("SELECT id,email,password_hash,recovery_hash,recovery_updated_at FROM users WHERE email=?").get(email);
  if (!row || !verifyPassword(String(body.password || ""), row.password_hash)) return sendJson(response, 401, { error: "邮箱或密码不正确" });
  createSession(response, row.id);
  sendJson(response, 200, { email: row.email, profiles: publicProfiles(row.id), recoveryConfigured: Boolean(row.recovery_hash), recoveryUpdatedAt: row.recovery_updated_at || "" });
}
function handleLogout(request, response) {
  const token = cookieMap(request).growth_session;
  if (token) db.prepare("DELETE FROM sessions WHERE token=?").run(token);
  response.setHeader("set-cookie", "growth_session=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0");
  sendJson(response, 200, { ok: true });
}
function handleAccount(request, response) {
  const user = requireUser(request, response); if (!user) return;
  const recovery = db.prepare("SELECT recovery_hash,recovery_updated_at FROM users WHERE id=?").get(user.id);
  sendJson(response, 200, { email: user.email, isTestAdmin: user.email === "admin@growth-os.local", recoveryConfigured: Boolean(recovery?.recovery_hash), recoveryUpdatedAt: recovery?.recovery_updated_at || "", profiles: publicProfiles(user.id) });
}
function ensureDevAdmin() {
  let user = db.prepare("SELECT id,email FROM users WHERE email=?").get("admin@growth-os.local");
  if (!user) {
    const result = db.prepare("INSERT INTO users(email,password_hash,created_at) VALUES(?,?,?)").run("admin@growth-os.local", hashPassword(randomBytes(24).toString("hex")), nowIso());
    user = { id: Number(result.lastInsertRowid), email: "admin@growth-os.local" };
  }
  if (!publicProfiles(user.id).length) {
    const id = profileId();
    db.exec("BEGIN");
    try {
      db.prepare("INSERT INTO profiles(id,user_id,name,age,avatar,base_template,created_at) VALUES(?,?,?,?,?,?,?)").run(id, user.id, "测试冒险家", "9岁", "boy", "brother", nowIso());
      db.prepare("INSERT INTO consents(profile_id,user_id,consent_version,guardian_confirmed,granted_at) VALUES(?,?,?,?,?)").run(id, user.id, "local-test-v1", 1, nowIso());
      db.exec("COMMIT");
    } catch (error) { db.exec("ROLLBACK"); throw error; }
  }
  return user;
}
function handleDevLogin(request, response) {
  if (!devAdminEnabled) return sendJson(response, 404, { error: "Not found" });
  const user = ensureDevAdmin();
  createSession(response, user.id);
  const recovery = db.prepare("SELECT recovery_hash,recovery_updated_at FROM users WHERE id=?").get(user.id);
  sendJson(response, 200, { email: user.email, isTestAdmin: true, recoveryConfigured: Boolean(recovery?.recovery_hash), recoveryUpdatedAt: recovery?.recovery_updated_at || "", profiles: publicProfiles(user.id) });
}
async function handleCreateProfile(request, response) {
  const user = requireUser(request, response); if (!user) return;
  const body = await readBodyJson(request);
  const name = String(body.name || "").trim().slice(0, 20);
  const age = String(body.age || "").trim().slice(0, 20);
  const avatar = body.avatar === "girl" ? "girl" : "boy";
  const baseTemplate = body.baseTemplate === "sister" ? "sister" : "brother";
  const guardianConsent = body.guardianConsent === true;
  const consentVersion = "child-data-v1";
  if (!name || !age) return sendJson(response, 400, { error: "请填写角色名和年龄" });
  if (!guardianConsent) return sendJson(response, 400, { error: "创建儿童角色前需要家长或监护人同意" });
  const id = profileId();
  try {
    db.exec("BEGIN");
    db.prepare("INSERT INTO profiles(id,user_id,name,age,avatar,base_template,created_at) VALUES(?,?,?,?,?,?,?)").run(id, user.id, name, age, avatar, baseTemplate, nowIso());
    db.prepare("INSERT INTO consents(profile_id,user_id,consent_version,guardian_confirmed,granted_at) VALUES(?,?,?,?,?)").run(id, user.id, consentVersion, 1, nowIso());
    recordEvent(user.id, id, "profile_created", { baseTemplate, avatar, consentVersion });
    db.exec("COMMIT");
    sendJson(response, 201, publicProfiles(user.id).find((profile) => profile.id === id));
  } catch { try { db.exec("ROLLBACK"); } catch {} sendJson(response, 409, { error: "角色名已存在" }); }
}
function ownedProfile(userId, id) { return db.prepare("SELECT * FROM profiles WHERE id=? AND user_id=?").get(id, userId); }
function handleGetProgress(request, response, url) {
  const user = requireUser(request, response); if (!user) return;
  const id = String(url.searchParams.get("profileId") || "");
  if (!ownedProfile(user.id, id)) return sendJson(response, 404, { error: "角色不存在" });
  const snapshot = db.prepare("SELECT data_json,updated_at FROM snapshots WHERE profile_id=?").get(id);
  const memories = db.prepare("SELECT id,kind,summary,evidence_json AS evidence,created_at AS createdAt FROM memories WHERE profile_id=? ORDER BY id DESC LIMIT 30").all(id).map((item) => ({...item,evidence:JSON.parse(item.evidence)}));
  sendJson(response, 200, { data: snapshot ? JSON.parse(snapshot.data_json) : {}, updatedAt: snapshot?.updated_at || null, memories });
}
async function handleSaveProgress(request, response) {
  const user = requireUser(request, response); if (!user) return;
  const body = await readBodyJson(request);
  const id = String(body.profileId || "");
  if (!ownedProfile(user.id, id)) return sendJson(response, 404, { error: "角色不存在" });
  const data = body.data && typeof body.data === "object" ? body.data : {};
  db.prepare("INSERT INTO snapshots(profile_id,data_json,updated_at) VALUES(?,?,?) ON CONFLICT(profile_id) DO UPDATE SET data_json=excluded.data_json,updated_at=excluded.updated_at").run(id, JSON.stringify(data).slice(0, 1000000), nowIso());
  const memory = body.memory;
  if (memory?.summary) {
    const result = db.prepare("INSERT INTO memories(profile_id,kind,summary,evidence_json,created_at) VALUES(?,?,?,?,?)").run(id, String(memory.kind || "progress").slice(0,30), String(memory.summary).slice(0,500), JSON.stringify(memory.evidence || {}), nowIso());
    evolveHypotheses(id, { id: Number(result.lastInsertRowid), kind: memory.kind, summary: memory.summary, evidence: memory.evidence || {}, shareWithAi: true });
  }
  sendJson(response, 200, { ok: true, updatedAt: nowIso() });
}
function handleExport(request, response, url) {
  const user = requireUser(request, response); if (!user) return;
  const id = String(url.searchParams.get("profileId") || "");
  const profile = ownedProfile(user.id, id);
  if (!profile) return sendJson(response, 404, { error: "角色不存在" });
  const snapshot = db.prepare("SELECT data_json,updated_at FROM snapshots WHERE profile_id=?").get(id);
  const memories = db.prepare("SELECT kind,summary,evidence_json,created_at FROM memories WHERE profile_id=? ORDER BY id").all(id).map((item) => ({kind:item.kind,summary:item.summary,evidence:JSON.parse(item.evidence_json),createdAt:item.created_at}));
  const taskFeedback = taskFeedbackRows(id, 1000);
  const artifacts = db.prepare("SELECT * FROM artifacts WHERE profile_id=? ORDER BY id").all(id).map((row) => ({ ...publicArtifact(row), mediaData: row.media_data ? `data:${row.media_mime};base64,${row.media_data}` : "" }));
  const strategyInsights = strategyRows(id);
  const growthGoals = goalRows(id);
  const selfCoachAnswers = selfCoachRows(id);
  const actionDecisions = db.prepare("SELECT action_id AS actionId,reason,outcome,note,created_at AS createdAt FROM action_decisions WHERE profile_id=? ORDER BY id").all(id);
  response.setHeader("content-disposition", `attachment; filename="growth-${id}.json"`);
  const ideas = ideaRows(id);
  const ideaResurfacings = db.prepare("SELECT idea_id AS ideaId,prompt_json AS prompt,outcome,created_at AS createdAt,updated_at AS updatedAt FROM idea_resurfacings WHERE profile_id=? ORDER BY id").all(id).map((item) => ({ ...item, prompt: JSON.parse(item.prompt) }));
  const dailyPlanFeedback = db.prepare("SELECT source_ref AS sourceRef,source_type AS sourceType,reason,created_at AS createdAt FROM daily_plan_feedback WHERE profile_id=? ORDER BY id").all(id);
  const familyBriefs = db.prepare("SELECT week_start AS weekStart,report_json AS report,status,provider,created_at AS createdAt,updated_at AS updatedAt FROM family_briefs WHERE profile_id=? ORDER BY week_start").all(id).map((item) => ({ ...item, report: JSON.parse(item.report) }));
  sendJson(response, 200, { schemaVersion: 11, exportedAt: nowIso(), account: user.email, profile: { id, name: profile.name, age: profile.age, avatar: profile.avatar }, progress: snapshot ? JSON.parse(snapshot.data_json) : {}, growthGoals, selfCoachAnswers, actionDecisions, dailyPlanFeedback, familyBriefs, ideas, ideaResurfacings, memories, taskFeedback, artifacts, strategyInsights });
}
function handleDeleteMemory(request, response, url) {
  const user = requireUser(request, response); if (!user) return;
  const id = Number(url.pathname.split("/").pop());
  const memory = db.prepare("SELECT memories.id,memories.profile_id FROM memories JOIN profiles ON profiles.id=memories.profile_id WHERE memories.id=? AND profiles.user_id=?").get(id, user.id);
  if (!memory) return sendJson(response, 404, { error: "记忆不存在" });
  db.prepare("DELETE FROM memories WHERE id=?").run(id);
  retractStrategyEvidence(memory.profile_id, [`memory:${id}`]);
  sendJson(response, 200, { ok: true });
}

const allowedEvents = new Set(["app_opened", "page_viewed", "coach_started", "coach_generated", "coach_failed", "quest_skipped", "quest_completed", "quest_undone", "reflection_saved", "task_feedback_saved", "artifact_saved", "artifact_deleted", "artifact_privacy_changed", "daily_plan_generated", "daily_plan_started", "daily_plan_completed", "daily_plan_swapped", "daily_plan_lightened", "action_inbox_parsed", "action_inbox_clarified", "action_inbox_duplicate", "capture_parsed", "capture_clarified", "capture_confirmed", "goal_shaped", "goal_created", "goal_status_changed", "goal_deleted", "goal_experiment_started", "self_coach_asked", "self_coach_feedback", "self_coach_deleted", "strategy_digest_generated", "strategy_feedback", "action_negotiated", "action_deferred", "action_restored", "action_rescue_requested", "action_rescue_outcome", "recovery_rotated", "recovery_reset", "insights_opened", "plan_generated", "news_synced", "journal_prompted", "journal_saved", "journal_deleted", "idea_captured", "idea_developed", "idea_started", "idea_completed", "idea_deleted", "idea_resurfaced", "idea_resurface_outcome", "action_created", "action_broken_down", "action_completed", "action_reopened", "action_deleted", "habit_created", "habit_done", "habit_skipped", "habit_reopened", "habit_deleted", "focus_started", "focus_paused", "focus_resumed", "focus_finished", "focus_cancelled", "review_generated", "review_feedback", "review_focus_adopted"]);
function recordEvent(userId, profileIdValue, eventName, properties = {}) {
  db.prepare("INSERT INTO events(user_id,profile_id,event_name,properties_json,created_at) VALUES(?,?,?,?,?)")
    .run(userId, profileIdValue || null, eventName, JSON.stringify(properties).slice(0, 4000), nowIso());
}
async function handleEvent(request, response) {
  const user = requireUser(request, response); if (!user) return;
  const body = await readBodyJson(request);
  const profileIdValue = String(body.profileId || "");
  const eventName = String(body.eventName || "");
  if (!allowedEvents.has(eventName)) return sendJson(response, 400, { error: "未知事件" });
  if (profileIdValue && !ownedProfile(user.id, profileIdValue)) return sendJson(response, 404, { error: "角色不存在" });
  const cleanProperties = body.properties && typeof body.properties === "object" ? Object.fromEntries(Object.entries(body.properties).slice(0, 12).map(([key, value]) => [String(key).slice(0, 40), typeof value === "string" ? value.slice(0, 120) : value])) : {};
  recordEvent(user.id, profileIdValue || null, eventName, cleanProperties);
  sendJson(response, 201, { ok: true });
}
function handleMetrics(request, response, url) {
  const user = requireUser(request, response); if (!user) return;
  const profileIdValue = String(url.searchParams.get("profileId") || "");
  if (!ownedProfile(user.id, profileIdValue)) return sendJson(response, 404, { error: "角色不存在" });
  const since = new Date(Date.now() - 7 * 86400000).toISOString();
  const counts = Object.fromEntries(db.prepare("SELECT event_name,COUNT(*) AS count FROM events WHERE profile_id=? AND created_at>=? GROUP BY event_name").all(profileIdValue, since).map((row) => [row.event_name, Number(row.count)]));
  const activeDays = Number(db.prepare("SELECT COUNT(DISTINCT substr(created_at,1,10)) AS count FROM events WHERE profile_id=? AND created_at>=?").get(profileIdValue, since)?.count || 0);
  const generated = counts.coach_generated || 0;
  const completed = counts.quest_completed || 0;
  const skipped = counts.quest_skipped || 0;
  sendJson(response, 200, {
    periodDays: 7,
    activeDays,
    recommendations: generated,
    completed,
    reflections: counts.reflection_saved || 0,
    skipped,
    acceptanceRate: generated ? Math.round((completed / generated) * 100) : 0,
    fullLoops: Math.min(completed, counts.reflection_saved || 0),
    events: counts
  });
}

function journalRows(profileIdValue) {
  return db.prepare("SELECT id,source,prompt,content,tags_json AS tags,ai_context AS shareWithAi,created_at AS createdAt FROM journals WHERE profile_id=? ORDER BY id DESC LIMIT 30").all(profileIdValue)
    .map((item) => ({ ...item, tags: JSON.parse(item.tags), shareWithAi: Boolean(item.shareWithAi) }));
}
function handleListJournal(request, response, url) {
  const user = requireUser(request, response); if (!user) return;
  const profileIdValue = String(url.searchParams.get("profileId") || "");
  if (!ownedProfile(user.id, profileIdValue)) return sendJson(response, 404, { error: "角色不存在" });
  sendJson(response, 200, { entries: journalRows(profileIdValue) });
}
async function handleCreateJournal(request, response) {
  const user = requireUser(request, response); if (!user) return;
  const body = await readBodyJson(request);
  const profileIdValue = String(body.profileId || "");
  if (!ownedProfile(user.id, profileIdValue)) return sendJson(response, 404, { error: "角色不存在" });
  const source = ["self", "ai", "hybrid"].includes(body.source) ? body.source : "self";
  const prompt = String(body.prompt || "").trim().slice(0, 300);
  const content = String(body.content || "").trim().slice(0, 4000);
  const tags = Array.isArray(body.tags) ? body.tags.map(String).map((tag) => tag.slice(0, 24)).slice(0, 8) : [];
  const shareWithAi = body.shareWithAi !== false;
  if (content.length < 2) return sendJson(response, 400, { error: "至少写下一句话" });
  const createdAt = nowIso();
  const result = db.prepare("INSERT INTO journals(profile_id,source,prompt,content,tags_json,ai_context,created_at) VALUES(?,?,?,?,?,?,?)").run(profileIdValue, source, prompt, content, JSON.stringify(tags), shareWithAi ? 1 : 0, createdAt);
  const safeSummary = `第一人称日记：${content.replace(/\s+/g, " ").slice(0, 180)}`;
  const memoryResult = db.prepare("INSERT INTO memories(profile_id,kind,summary,evidence_json,created_at) VALUES(?,?,?,?,?)").run(profileIdValue, "journal", safeSummary, JSON.stringify({ journalId: Number(result.lastInsertRowid), source, tags, shareWithAi }), createdAt);
  if (shareWithAi) evolveHypotheses(profileIdValue, { id: Number(memoryResult.lastInsertRowid), kind: "journal", summary: safeSummary, evidence: { journalId: Number(result.lastInsertRowid), tags }, shareWithAi });
  recordEvent(user.id, profileIdValue, "journal_saved", { source, shareWithAi, tagCount: tags.length, lengthBand: content.length < 80 ? "short" : content.length < 240 ? "medium" : "long" });
  sendJson(response, 201, journalRows(profileIdValue)[0]);
}

function hypothesisConfidence(evidenceCount, counterCount) {
  return Math.max(0.05, Math.min(0.95, 0.25 + Math.log2(evidenceCount + 1) * 0.18 - counterCount * 0.2));
}
function upsertHypothesis(profileIdValue, hypothesis) {
  const existing = db.prepare("SELECT * FROM memory_hypotheses WHERE profile_id=? AND hypothesis_key=?").get(profileIdValue, hypothesis.key);
  const evidence = existing ? JSON.parse(existing.evidence_json) : [];
  const nextEvidence = [{ memoryId: hypothesis.memoryId, note: hypothesis.note, at: nowIso() }, ...evidence.filter((item) => item.memoryId !== hypothesis.memoryId)].slice(0, 20);
  const evidenceCount = existing ? Number(existing.evidence_count) + (evidence.some((item) => item.memoryId === hypothesis.memoryId) ? 0 : 1) : 1;
  const counterCount = Number(existing?.counter_count || 0);
  const confidence = hypothesisConfidence(evidenceCount, counterCount);
  const status = confidence < 0.25 ? "challenged" : "active";
  db.prepare(`INSERT INTO memory_hypotheses(profile_id,hypothesis_key,category,title,summary,confidence,evidence_count,counter_count,status,ai_context,evidence_json,updated_at)
    VALUES(?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(profile_id,hypothesis_key) DO UPDATE SET title=excluded.title,summary=excluded.summary,confidence=excluded.confidence,evidence_count=excluded.evidence_count,status=excluded.status,ai_context=MAX(memory_hypotheses.ai_context,excluded.ai_context),evidence_json=excluded.evidence_json,updated_at=excluded.updated_at`)
    .run(profileIdValue, hypothesis.key, hypothesis.category, hypothesis.title, hypothesis.summary, confidence, evidenceCount, counterCount, status, hypothesis.shareWithAi ? 1 : 0, JSON.stringify(nextEvidence), nowIso());
}
function evolveHypotheses(profileIdValue, memory) {
  const evidence = memory.evidence || {};
  const tags = Array.isArray(evidence.tags) ? evidence.tags.map(String).filter(Boolean).slice(0, 6) : [];
  for (const tag of tags) upsertHypothesis(profileIdValue, { key: `interest:${tag}`, category: "interest", title: `我可能会持续关注「${tag}」`, summary: `这个方向在我的第一人称记录或复盘中出现过。`, memoryId: memory.id, note: String(memory.summary).slice(0, 160), shareWithAi: memory.shareWithAi !== false });
  const skill = String(evidence.skill || "").trim();
  if (skill) upsertHypothesis(profileIdValue, { key: `skill-action:${skill}`, category: "strategy", title: `我正在用行动练习「${skillIdToName[skill] || skill}」`, summary: "这是从实际完成的行动中形成的成长线索。", memoryId: memory.id, note: String(memory.summary).slice(0, 160), shareWithAi: memory.shareWithAi !== false });
}
function removeHypothesisEvidence(profileIdValue, memoryIds) {
  const idSet = new Set(memoryIds.map(Number));
  for (const row of db.prepare("SELECT * FROM memory_hypotheses WHERE profile_id=?").all(profileIdValue)) {
    const nextEvidence = JSON.parse(row.evidence_json).filter((item) => !idSet.has(Number(item.memoryId)));
    if (!nextEvidence.length) {
      db.prepare("DELETE FROM memory_hypotheses WHERE id=?").run(row.id);
      continue;
    }
    const evidenceCount = Math.min(Number(row.evidence_count), nextEvidence.length);
    const confidence = hypothesisConfidence(evidenceCount, Number(row.counter_count));
    const status = confidence < 0.25 ? "challenged" : row.status;
    db.prepare("UPDATE memory_hypotheses SET evidence_json=?,evidence_count=?,confidence=?,status=?,ai_context=?,updated_at=? WHERE id=?").run(JSON.stringify(nextEvidence), evidenceCount, confidence, status, status === "active" && confidence >= 0.35 ? row.ai_context : 0, nowIso(), row.id);
  }
}
function hypothesisRows(profileIdValue) {
  return db.prepare("SELECT id,hypothesis_key AS hypothesisKey,category,title,summary,confidence,evidence_count AS evidenceCount,counter_count AS counterCount,status,ai_context AS aiContext,evidence_json AS evidence,updated_at AS updatedAt FROM memory_hypotheses WHERE profile_id=? ORDER BY confidence DESC,updated_at DESC LIMIT 30").all(profileIdValue)
    .map((item) => ({ ...item, aiContext: Boolean(item.aiContext), confidence: Math.round(Number(item.confidence) * 100), evidence: JSON.parse(item.evidence) }));
}
function handleListHypotheses(request, response, url) {
  const user = requireUser(request, response); if (!user) return;
  const profileIdValue = String(url.searchParams.get("profileId") || "");
  if (!ownedProfile(user.id, profileIdValue)) return sendJson(response, 404, { error: "角色不存在" });
  sendJson(response, 200, { hypotheses: hypothesisRows(profileIdValue) });
}
async function handleHypothesisFeedback(request, response, url) {
  const user = requireUser(request, response); if (!user) return;
  const id = Number(url.pathname.split("/")[3]);
  const body = await readBodyJson(request);
  const value = String(body.value || "");
  if (!["confirm", "unsure", "reject"].includes(value)) return sendJson(response, 400, { error: "未知反馈" });
  const row = db.prepare("SELECT memory_hypotheses.* FROM memory_hypotheses JOIN profiles ON profiles.id=memory_hypotheses.profile_id WHERE memory_hypotheses.id=? AND profiles.user_id=?").get(id, user.id);
  if (!row) return sendJson(response, 404, { error: "成长假设不存在" });
  const evidenceCount = Number(row.evidence_count) + (value === "confirm" ? 1 : 0);
  const counterCount = Number(row.counter_count) + (value === "reject" ? 1 : 0);
  const confidence = value === "unsure" ? Math.max(0.2, Number(row.confidence) - 0.06) : hypothesisConfidence(evidenceCount, counterCount);
  const status = value === "reject" || confidence < 0.25 ? "challenged" : value === "unsure" ? "uncertain" : "active";
  const aiContext = status === "active" && confidence >= 0.35 ? Number(row.ai_context) : 0;
  db.prepare("UPDATE memory_hypotheses SET confidence=?,evidence_count=?,counter_count=?,status=?,ai_context=?,updated_at=? WHERE id=?").run(confidence, evidenceCount, counterCount, status, aiContext, nowIso(), id);
  sendJson(response, 200, hypothesisRows(row.profile_id).find((item) => item.id === id));
}
function strategyRows(profileIdValue) {
  return db.prepare("SELECT id,insight_key AS insightKey,category,statement,when_to_use AS whenToUse,question,evidence_json AS evidence,confidence,status,feedback,ai_context AS aiContext,created_at AS createdAt,updated_at AS updatedAt FROM strategy_insights WHERE profile_id=? ORDER BY CASE status WHEN 'active' THEN 1 WHEN 'uncertain' THEN 2 ELSE 3 END,confidence DESC,updated_at DESC LIMIT 20").all(profileIdValue)
    .map((item) => ({ ...item, evidence: JSON.parse(item.evidence), confidence: Math.round(Number(item.confidence) * 100), aiContext: Boolean(item.aiContext) }));
}
function strategyEvidence(profileIdValue) {
  const evidence = [];
  for (const entry of taskFeedbackRows(profileIdValue, 30)) evidence.push({ ref: `feedback:${entry.id}`, kind: "任务体验", text: `${entry.taskTitle}：难度${reviewTerm(entry.difficulty)}，${reviewTerm(entry.enjoyment)}，希望${reviewTerm(entry.support)}${entry.motivation !== "unknown" ? `，愿意继续因为${reviewTerm(entry.motivation)}` : ""}`, at: entry.updatedAt });
  for (const artifact of artifactRows(profileIdValue, 30).filter((item) => item.shareWithAi)) evidence.push({ ref: `artifact:${artifact.id}`, kind: "作品", text: `${artifact.title}：${artifact.caption || (artifact.type === "text" ? artifact.content.slice(0, 180) : artifactModeLabelServer(artifact.type))}`, at: artifact.updatedAt });
  for (const journal of journalRows(profileIdValue).filter((item) => item.shareWithAi)) evidence.push({ ref: `journal:${journal.id}`, kind: "日记", text: journal.content.slice(0, 220), at: journal.createdAt });
  const memories = db.prepare("SELECT id,kind,summary,evidence_json,created_at FROM memories WHERE profile_id=? ORDER BY id DESC LIMIT 40").all(profileIdValue);
  for (const memory of memories) {
    const detail = JSON.parse(memory.evidence_json || "{}");
    if (detail.shareWithAi === false || memory.kind === "journal" || memory.kind === "artifact") continue;
    evidence.push({ ref: `memory:${memory.id}`, kind: "行动证据", text: String(memory.summary).slice(0, 220), at: memory.created_at });
  }
  return evidence.sort((left, right) => String(right.at).localeCompare(String(left.at))).slice(0, 60);
}
function artifactModeLabelServer(type) { return { photo: "照片作品", audio: "录音作品", link: "链接作品", text: "文字作品" }[type] || "作品"; }
function fallbackStrategyInsights(evidence) {
  const artifacts = evidence.filter((item) => item.ref.startsWith("artifact:"));
  const feedback = evidence.filter((item) => item.ref.startsWith("feedback:"));
  const source = artifacts.length >= 2 ? artifacts.slice(0, 2) : feedback.length >= 2 ? feedback.slice(0, 2) : evidence.slice(0, 2);
  if (source.length < 2) return [];
  return [{ key: artifacts.length >= 2 ? "make-progress-visible" : "start-with-one-small-step", category: artifacts.length >= 2 ? "creating" : "starting", statement: artifacts.length >= 2 ? "把想法留下一个看得见的版本，会让我更容易发现进展。" : "事情有点大时，先找到一个清楚的小步骤更容易开始。", whenToUse: artifacts.length >= 2 ? "有新想法、做完一部分或想继续改进时" : "不知道从哪里开始或感觉任务有点大时", question: "这条方法最近对你有帮助吗？", evidenceRefs: source.map((item) => item.ref), confidence: 0.58 }];
}
function handleListStrategyInsights(request, response, url) {
  const user = requireUser(request, response); if (!user) return;
  const profileIdValue = String(url.searchParams.get("profileId") || "");
  if (!ownedProfile(user.id, profileIdValue)) return sendJson(response, 404, { error: "角色不存在" });
  sendJson(response, 200, { insights: strategyRows(profileIdValue) });
}
async function handleGenerateStrategyInsights(request, response) {
  const user = requireUser(request, response); if (!user) return;
  const body = await readBodyJson(request);
  const profileIdValue = String(body.profileId || "");
  const profile = ownedProfile(user.id, profileIdValue);
  if (!profile) return sendJson(response, 404, { error: "角色不存在" });
  const evidence = strategyEvidence(profileIdValue);
  if (evidence.length < 2) return sendJson(response, 409, { error: "至少需要两条可共享成长证据" });
  const allowedRefs = new Set(evidence.map((item) => item.ref));
  const rejectedKeys = new Set(db.prepare("SELECT insight_key FROM strategy_insights WHERE profile_id=? AND feedback='not_for_me'").all(profileIdValue).map((item) => item.insight_key));
  let generated = fallbackStrategyInsights(evidence);
  let provider = "local";
  if (apiKey) {
    try {
      const apiResponse = await fetch(`${baseUrl.replace(/\/$/, "")}/chat/completions`, { method: "POST", signal: AbortSignal.timeout(30000), headers: { authorization: `Bearer ${apiKey}`, "content-type": "application/json" }, body: JSON.stringify({ model, temperature: 0.38, max_tokens: 900, response_format: { type: "json_object" }, messages: [
        { role: "system", content: "你把儿童成长证据合并成可执行、可纠正的个人策略说明书。每条必须引用至少两个提供的ref；不能诊断、比较、贴人格或天赋标签；只总结什么方法在什么场景可能有帮助。使用第一人称自然中文。只返回JSON。" },
        { role: "user", content: JSON.stringify({ child: { name: profile.name, age: profile.age }, rejectedKeys: [...rejectedKeys], evidence, output: { insights: [{ key: "稳定英文短key", category: "starting/focus/learning/creating/recovery", statement: "第一人称可修正策略", whenToUse: "适用场景", question: "请孩子确认的一句话", evidenceRefs: ["至少2个原始ref"], confidence: "0.35-0.85" }] }, constraints: ["最多5条", "不同策略不得重复", "证据矛盾时降低confidence或不生成", "不得复活rejectedKeys"] }) }
      ] }) });
      if (!apiResponse.ok) throw new Error(`strategy ${apiResponse.status}`);
      const json = parseJsonContent((await apiResponse.json()).choices?.[0]?.message?.content || "{}");
      const parsed = (Array.isArray(json.insights) ? json.insights : []).map((item, index) => {
        const refs = [...new Set((Array.isArray(item.evidenceRefs) ? item.evidenceRefs : []).map(String).filter((ref) => allowedRefs.has(ref)))].slice(0, 8);
        const key = String(item.key || `strategy-${index + 1}`).toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").slice(0, 60);
        return { key, category: ["starting", "focus", "learning", "creating", "recovery"].includes(item.category) ? item.category : "learning", statement: String(item.statement || "").slice(0, 180), whenToUse: String(item.whenToUse || "").slice(0, 160), question: String(item.question || "这条方法对你有帮助吗？").slice(0, 100), evidenceRefs: refs, confidence: Math.max(0.35, Math.min(0.85, Number(item.confidence || 0.55))) };
      }).filter((item) => item.key && item.statement.length >= 8 && item.whenToUse.length >= 4 && item.evidenceRefs.length >= 2 && !rejectedKeys.has(item.key)).slice(0, 5);
      if (parsed.length) { generated = parsed; provider = "siliconflow"; }
    } catch (error) { console.warn("Strategy digest used local fallback:", error.message); }
  }
  const evidenceByRef = new Map(evidence.map((item) => [item.ref, item]));
  const existingStrategies = db.prepare("SELECT insight_key,feedback,confidence,evidence_json FROM strategy_insights WHERE profile_id=?").all(profileIdValue).map((row) => ({ ...row, refs: new Set(JSON.parse(row.evidence_json || "[]").map((item) => item.ref)) }));
  const now = nowIso();
  for (const insight of generated) {
    if (rejectedKeys.has(insight.key)) continue;
    const sources = insight.evidenceRefs.map((ref) => evidenceByRef.get(ref)).filter(Boolean);
    if (sources.length < 2) continue;
    const sourceRefs = new Set(sources.map((item) => item.ref));
    const overlapping = existingStrategies.find((candidate) => {
      if (candidate.insight_key === insight.key) return false;
      const intersection = [...sourceRefs].filter((ref) => candidate.refs.has(ref)).length;
      const union = new Set([...sourceRefs, ...candidate.refs]).size;
      const ratio = union ? intersection / union : 0;
      return ["not_for_me", "unsure"].includes(candidate.feedback) ? ratio >= 0.5 : ratio >= 0.75;
    });
    if (overlapping) continue;
    const existing = db.prepare("SELECT feedback,confidence,created_at FROM strategy_insights WHERE profile_id=? AND insight_key=?").get(profileIdValue, insight.key);
    if (existing?.feedback === "not_for_me") continue;
    const feedback = existing?.feedback || "";
    const status = feedback === "unsure" ? "uncertain" : "active";
    const confidence = feedback === "helpful" ? Math.max(Number(existing.confidence || 0), insight.confidence) : insight.confidence;
    const aiContext = status === "active" && confidence >= 0.55 ? 1 : 0;
    db.prepare("INSERT INTO strategy_insights(profile_id,insight_key,category,statement,when_to_use,question,evidence_json,confidence,status,feedback,ai_context,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(profile_id,insight_key) DO UPDATE SET category=excluded.category,statement=excluded.statement,when_to_use=excluded.when_to_use,question=excluded.question,evidence_json=excluded.evidence_json,confidence=excluded.confidence,status=CASE WHEN strategy_insights.feedback='unsure' THEN 'uncertain' ELSE excluded.status END,ai_context=CASE WHEN strategy_insights.feedback='unsure' THEN 0 ELSE excluded.ai_context END,updated_at=excluded.updated_at")
      .run(profileIdValue, insight.key, insight.category, insight.statement, insight.whenToUse, insight.question, JSON.stringify(sources), confidence, status, feedback, aiContext, existing?.created_at || now, now);
  }
  recordEvent(user.id, profileIdValue, "strategy_digest_generated", { provider, evidenceCount: evidence.length, insightCount: generated.length });
  sendJson(response, 200, { provider, insights: strategyRows(profileIdValue) });
}
async function handleStrategyInsightFeedback(request, response, url) {
  const user = requireUser(request, response); if (!user) return;
  const id = Number(url.pathname.split("/").pop());
  const row = db.prepare("SELECT strategy_insights.* FROM strategy_insights JOIN profiles ON profiles.id=strategy_insights.profile_id WHERE strategy_insights.id=? AND profiles.user_id=?").get(id, user.id);
  if (!row) return sendJson(response, 404, { error: "策略不存在" });
  const body = await readBodyJson(request);
  const feedback = ["helpful", "unsure", "not_for_me"].includes(body.feedback) ? body.feedback : "";
  if (!feedback) return sendJson(response, 400, { error: "未知反馈" });
  const confidence = feedback === "helpful" ? Math.min(0.95, Number(row.confidence) + 0.1) : feedback === "unsure" ? Math.max(0.35, Number(row.confidence) - 0.08) : Math.max(0.15, Number(row.confidence) - 0.25);
  const status = feedback === "not_for_me" ? "challenged" : feedback === "unsure" ? "uncertain" : "active";
  const aiContext = feedback === "helpful" && confidence >= 0.55 ? 1 : 0;
  db.prepare("UPDATE strategy_insights SET confidence=?,status=?,feedback=?,ai_context=?,updated_at=? WHERE id=?").run(confidence, status, feedback, aiContext, nowIso(), id);
  recordEvent(user.id, row.profile_id, "strategy_feedback", { feedback, category: row.category });
  sendJson(response, 200, strategyRows(row.profile_id).find((item) => item.id === id));
}
function retractStrategyEvidence(profileIdValue, refs) {
  const removed = new Set(refs.map(String));
  if (!removed.size) return;
  for (const row of db.prepare("SELECT * FROM strategy_insights WHERE profile_id=?").all(profileIdValue)) {
    const evidence = JSON.parse(row.evidence_json || "[]");
    const next = evidence.filter((item) => !removed.has(String(item.ref)));
    if (next.length === evidence.length) continue;
    const enough = next.length >= 2;
    const status = row.feedback === "not_for_me" ? "challenged" : enough ? row.status : "uncertain";
    db.prepare("UPDATE strategy_insights SET evidence_json=?,confidence=?,status=?,ai_context=?,updated_at=? WHERE id=?")
      .run(JSON.stringify(next), enough ? row.confidence : Math.min(0.45, Number(row.confidence)), status, status === "active" && enough ? row.ai_context : 0, nowIso(), row.id);
  }
}

function goalRows(profileIdValue) {
  return db.prepare("SELECT * FROM growth_goals WHERE profile_id=? ORDER BY CASE status WHEN 'active' THEN 1 WHEN 'paused' THEN 2 ELSE 3 END,updated_at DESC,id DESC").all(profileIdValue).map((row) => {
    const actionStats = db.prepare("SELECT SUM(CASE WHEN status='done' THEN 1 ELSE 0 END) AS done,SUM(CASE WHEN status!='done' THEN 1 ELSE 0 END) AS active FROM actions WHERE profile_id=? AND goal_id=?").get(profileIdValue, row.id);
    const ideaStats = db.prepare("SELECT SUM(CASE WHEN status='done' THEN 1 ELSE 0 END) AS done,SUM(CASE WHEN status!='done' THEN 1 ELSE 0 END) AS active FROM ideas WHERE profile_id=? AND goal_id=?").get(profileIdValue, row.id);
    const artifactCount = Number(db.prepare("SELECT COUNT(*) AS count FROM artifacts JOIN actions ON artifacts.task_key=('action:' || actions.id) WHERE artifacts.profile_id=? AND actions.goal_id=?").get(profileIdValue, row.id)?.count || 0);
    const evidenceCount = Number(actionStats?.done || 0) + Number(ideaStats?.done || 0) + artifactCount;
    const activeSteps = Number(actionStats?.active || 0) + Number(ideaStats?.active || 0);
    return { id: Number(row.id), title: row.title, why: row.why_text, successSignal: row.success_signal, firstExperiment: row.first_experiment, skill: row.skill, horizon: row.horizon, status: row.status, evidenceCount, activeSteps, progress: row.status === "done" ? 100 : Math.min(90, evidenceCount * 20 + activeSteps * 5), createdAt: row.created_at, updatedAt: row.updated_at };
  });
}
function ownedGoal(userId, id) {
  return db.prepare("SELECT growth_goals.* FROM growth_goals JOIN profiles ON profiles.id=growth_goals.profile_id WHERE growth_goals.id=? AND profiles.user_id=?").get(id, userId);
}
function handleListGoals(request, response, url) {
  const user = requireUser(request, response); if (!user) return;
  const profileIdValue = String(url.searchParams.get("profileId") || "");
  if (!ownedProfile(user.id, profileIdValue)) return sendJson(response, 404, { error: "角色不存在" });
  sendJson(response, 200, { goals: goalRows(profileIdValue) });
}
function fallbackGoalDraft(text) {
  const skill = /讲|表达|分享|写作/.test(text) ? "communication" : /整理|坚持|按时|习惯|专心/.test(text) ? "self-regulation" : /数据|计算|统计/.test(text) ? "data-reasoning" : /AI|人工智能|模型/.test(text) ? "ai-literacy" : /运动|睡眠|情绪|健康/.test(text) ? "wellbeing" : "creation";
  const title = text.replace(/^(我想|我希望|我要)/, "").replace(/[。！？!?]+$/g, "").trim().slice(0, 80) || "尝试一个新方向";
  return { title, why: "这是我现在愿意投入时间探索的方向", successSignal: `我能展示或说清楚「${title}」的一次真实进步`, firstExperiment: `用10分钟做一个关于「${title}」的最小版本`, skill, horizon: "one_month" };
}
async function handleShapeGoal(request, response) {
  const user = requireUser(request, response); if (!user) return;
  const body = await readBodyJson(request);
  const profileIdValue = String(body.profileId || "");
  const profile = ownedProfile(user.id, profileIdValue);
  if (!profile) return sendJson(response, 404, { error: "角色不存在" });
  const text = String(body.text || "").trim().slice(0, 600);
  if (text.length < 2) return sendJson(response, 400, { error: "先说一个你真心想探索的方向" });
  const fallback = fallbackGoalDraft(text);
  let draft = fallback;
  let provider = "local";
  if (apiKey) {
    try {
      const existing = goalRows(profileIdValue).filter((goal) => goal.status !== "done").map(({ title, why, successSignal, skill }) => ({ title, why, successSignal, skill }));
      const apiResponse = await fetch(`${baseUrl.replace(/\/$/, "")}/chat/completions`, { method: "POST", signal: AbortSignal.timeout(12000), headers: { authorization: `Bearer ${apiKey}`, "content-type": "application/json" }, body: JSON.stringify({ model, temperature: 0.35, max_tokens: 420, response_format: { type: "json_object" }, messages: [
        { role: "system", content: "你帮助6-12岁孩子把一个愿望整理成可探索的成长方向。保留孩子原意，不把愿望改造成成人KPI，不承诺结果，不评价天赋。给一个4周内可观察但非考试化的成功信号，以及10分钟可开始的第一个实验。只返回JSON。" },
        { role: "user", content: JSON.stringify({ child: { name: profile.name, age: profile.age }, text, existingDirections: existing, output: { title: "孩子第一人称能认同的短方向", why: "一句保留内在动机的理由", successSignal: "一个看得见或说得清的进步信号", firstExperiment: "10分钟内能开始的小实验", skill: "self-regulation/metacognition/communication/data-reasoning/ai-literacy/creation/ethics-collaboration/wellbeing", horizon: "one_month或three_months" } }) }
      ] }) });
      if (!apiResponse.ok) throw new Error(`goal shape ${apiResponse.status}`);
      const json = parseJsonContent((await apiResponse.json()).choices?.[0]?.message?.content || "{}");
      draft = { title: String(json.title || fallback.title).trim().slice(0, 100), why: String(json.why || fallback.why).trim().slice(0, 220), successSignal: String(json.successSignal || fallback.successSignal).trim().slice(0, 240), firstExperiment: String(json.firstExperiment || fallback.firstExperiment).trim().slice(0, 220), skill: normalizeSkillId(json.skill || fallback.skill), horizon: ["one_month", "three_months"].includes(json.horizon) ? json.horizon : fallback.horizon };
      provider = "siliconflow";
    } catch (error) { console.warn("Goal shape used local fallback:", error.message); }
  }
  recordEvent(user.id, profileIdValue, "goal_shaped", { provider, skill: draft.skill, horizon: draft.horizon });
  sendJson(response, 200, { draft, provider, model: provider === "siliconflow" ? model : "local" });
}
async function handleCreateGoal(request, response) {
  const user = requireUser(request, response); if (!user) return;
  const body = await readBodyJson(request);
  const profileIdValue = String(body.profileId || "");
  if (!ownedProfile(user.id, profileIdValue)) return sendJson(response, 404, { error: "角色不存在" });
  if (goalRows(profileIdValue).filter((goal) => goal.status === "active").length >= 3) return sendJson(response, 409, { error: "同时保留三个方向就够了，先暂停或完成一个" });
  const title = String(body.title || "").trim().slice(0, 100);
  if (title.length < 2) return sendJson(response, 400, { error: "方向名称太短了" });
  if (goalRows(profileIdValue).some((goal) => goal.status !== "done" && (normalizedTitle(goal.title) === normalizedTitle(title) || serverTitleSimilarity(goal.title, title) >= 0.82))) return sendJson(response, 409, { error: "这个方向已经点亮了，可以继续原来的旅程" });
  const now = nowIso();
  const result = db.prepare("INSERT INTO growth_goals(profile_id,title,why_text,success_signal,first_experiment,skill,horizon,status,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?)").run(profileIdValue, title, String(body.why || "").slice(0, 220), String(body.successSignal || "").slice(0, 240), String(body.firstExperiment || "").slice(0, 220), normalizeSkillId(body.skill || "creation"), ["one_month", "three_months"].includes(body.horizon) ? body.horizon : "one_month", "active", now, now);
  recordEvent(user.id, profileIdValue, "goal_created", { skill: normalizeSkillId(body.skill || "creation"), horizon: body.horizon || "one_month" });
  sendJson(response, 201, goalRows(profileIdValue).find((goal) => goal.id === Number(result.lastInsertRowid)));
}
async function handleUpdateGoal(request, response, url) {
  const user = requireUser(request, response); if (!user) return;
  const id = Number(url.pathname.split("/").pop());
  const goal = ownedGoal(user.id, id);
  if (!goal) return sendJson(response, 404, { error: "成长方向不存在" });
  const body = await readBodyJson(request);
  const status = ["active", "paused", "done"].includes(body.status) ? body.status : goal.status;
  if (status === "active" && goal.status !== "active" && goalRows(goal.profile_id).filter((item) => item.status === "active").length >= 3) return sendJson(response, 409, { error: "同时保留三个方向就够了" });
  db.prepare("UPDATE growth_goals SET status=?,updated_at=? WHERE id=?").run(status, nowIso(), id);
  recordEvent(user.id, goal.profile_id, "goal_status_changed", { status });
  sendJson(response, 200, goalRows(goal.profile_id).find((item) => item.id === id));
}
function handleDeleteGoal(request, response, url) {
  const user = requireUser(request, response); if (!user) return;
  const id = Number(url.pathname.split("/").pop());
  const goal = ownedGoal(user.id, id);
  if (!goal) return sendJson(response, 404, { error: "成长方向不存在" });
  db.exec("BEGIN");
  try {
    db.prepare("UPDATE actions SET goal_id=0 WHERE profile_id=? AND goal_id=?").run(goal.profile_id, id);
    db.prepare("UPDATE ideas SET goal_id=0 WHERE profile_id=? AND goal_id=?").run(goal.profile_id, id);
    db.prepare("DELETE FROM growth_goals WHERE id=?").run(id);
    recordEvent(user.id, goal.profile_id, "goal_deleted", {});
    db.exec("COMMIT");
  } catch (error) { db.exec("ROLLBACK"); throw error; }
  sendJson(response, 200, { ok: true });
}

function publicSelfCoach(row) {
  const evidence = JSON.parse(row.evidence_json || "[]");
  let answer = row.answer;
  for (const source of evidence) if (source.ref) answer = answer.replaceAll(String(source.ref), String(source.kind || "来源证据"));
  answer = answer.replace(/\b[a-z][a-z_-]*:\d+\b/gi, "来源证据");
  answer = answer.replace(/(?:翻看|查看)了?你所有的记录/g, "查看了你允许AI参考的记录");
  return { id: Number(row.id), question: row.question, answer, confidence: row.confidence, evidence, nextQuestion: row.next_question, provider: row.provider, feedback: row.feedback, createdAt: row.created_at, updatedAt: row.updated_at };
}
function selfCoachRows(profileIdValue) {
  return db.prepare("SELECT * FROM self_coach_answers WHERE profile_id=? ORDER BY id DESC LIMIT 20").all(profileIdValue).map(publicSelfCoach);
}
function handleListSelfCoach(request, response, url) {
  const user = requireUser(request, response); if (!user) return;
  const profileIdValue = String(url.searchParams.get("profileId") || "");
  if (!ownedProfile(user.id, profileIdValue)) return sendJson(response, 404, { error: "角色不存在" });
  sendJson(response, 200, { answers: selfCoachRows(profileIdValue) });
}
function selfCoachEvidence(profileIdValue) {
  const evidence = [];
  for (const goal of goalRows(profileIdValue).filter((item) => item.status !== "done")) evidence.push({ ref: `goal:${goal.id}`, kind: "成长方向", text: `${goal.title}：${goal.why}。进步信号：${goal.successSignal}。当前有${goal.evidenceCount}个成果证据。`, at: goal.updatedAt });
  for (const strategy of strategyRows(profileIdValue).filter((item) => item.aiContext && item.status === "active")) evidence.push({ ref: `strategy:${strategy.id}`, kind: "已确认方法", text: `${strategy.statement}；适合在${strategy.whenToUse}`, at: strategy.updatedAt });
  for (const entry of taskFeedbackRows(profileIdValue, 20)) evidence.push({ ref: `feedback:${entry.id}`, kind: "任务体验", text: `${entry.taskTitle}：${reviewTerm(entry.difficulty)}、${reviewTerm(entry.enjoyment)}，希望${reviewTerm(entry.support)}${entry.motivation !== "unknown" ? `，动力是${reviewTerm(entry.motivation)}` : ""}`, at: entry.updatedAt });
  for (const journal of journalRows(profileIdValue).filter((entry) => entry.shareWithAi).slice(0, 12)) evidence.push({ ref: `journal:${journal.id}`, kind: "我允许AI参考的日记", text: journal.content.slice(0, 260), at: journal.createdAt });
  for (const artifact of artifactRows(profileIdValue, 20).filter((item) => item.shareWithAi)) evidence.push({ ref: `artifact:${artifact.id}`, kind: "作品证据", text: `${artifact.title}：${artifact.caption || (artifact.type === "text" ? artifact.content.slice(0, 180) : artifactModeLabelServer(artifact.type))}`, at: artifact.updatedAt });
  for (const action of actionRows(profileIdValue).slice(0, 30)) evidence.push({ ref: `action:${action.id}`, kind: action.status === "done" ? "已完成行动" : action.status === "someday" ? "以后再看" : action.status === "dropped" ? "已决定不做" : action.notBefore ? "已安排到以后" : "当前行动", text: `${action.title}${action.detail ? `：${action.detail.slice(0, 180)}` : ""}`, at: action.updatedAt });
  const memories = db.prepare("SELECT id,kind,summary,evidence_json,created_at FROM memories WHERE profile_id=? ORDER BY id DESC LIMIT 30").all(profileIdValue);
  for (const memory of memories) {
    const detail = JSON.parse(memory.evidence_json || "{}");
    if (detail.shareWithAi === false || ["journal", "artifact"].includes(memory.kind)) continue;
    evidence.push({ ref: `memory:${memory.id}`, kind: "成长记忆", text: String(memory.summary).slice(0, 260), at: memory.created_at });
  }
  return evidence.filter((item, index, all) => all.findIndex((candidate) => candidate.ref === item.ref) === index).slice(0, 80);
}
function coachTextUnits(value) {
  const text = String(value || "").toLowerCase().replace(/[\s，。！？、；：,.!?;:'"“”‘’（）()\-]/g, "");
  const units = new Set();
  for (let index = 0; index < text.length - 1; index += 1) units.add(text.slice(index, index + 2));
  return units;
}
function rankSelfCoachEvidence(question, evidence) {
  const questionUnits = coachTextUnits(question);
  const kindWeight = { 已确认方法: 5, 任务体验: 4, 成长方向: 4, 作品证据: 3, 已完成行动: 3, 成长记忆: 2, 当前行动: 1, 我允许AI参考的日记: 2 };
  return evidence.map((item) => {
    const units = coachTextUnits(item.text);
    const overlap = [...questionUnits].filter((unit) => units.has(unit)).length;
    return { ...item, score: overlap * 8 + (kindWeight[item.kind] || 0) };
  }).sort((left, right) => right.score - left.score || String(right.at).localeCompare(String(left.at))).slice(0, 18).map(({ score, ...item }) => item);
}
async function handleAskSelfCoach(request, response) {
  const user = requireUser(request, response); if (!user) return;
  const body = await readBodyJson(request);
  const profileIdValue = String(body.profileId || "");
  const profile = ownedProfile(user.id, profileIdValue);
  if (!profile) return sendJson(response, 404, { error: "角色不存在" });
  const question = String(body.question || "").trim().slice(0, 300);
  if (question.length < 2) return sendJson(response, 400, { error: "先问一个你真心想知道的问题" });
  const ranked = rankSelfCoachEvidence(question, selfCoachEvidence(profileIdValue));
  const allowedRefs = new Set(ranked.map((item) => item.ref));
  let answer = ranked.length ? `从目前记录里，我看到一个线索：${ranked[0].text.slice(0, 150)}。这还不是定论，可以继续用新经历验证。` : "成长档案里还没有足够证据回答这个问题。你可以先记录一次真实经历，我们以后再回来看看。";
  let confidence = ranked.length >= 4 ? "some" : "little";
  let selectedEvidence = ranked.slice(0, Math.min(2, ranked.length));
  let nextQuestion = ranked.length ? "这条线索像你吗，还是只有那一次是这样？" : "最近有没有一件小事能帮助我们观察这个问题？";
  let provider = "local";
  if (apiKey && ranked.length) {
    try {
      const recentRejected = selfCoachRows(profileIdValue).filter((item) => item.feedback === "not_me").slice(0, 4).map(({ question: rejectedQuestion, answer: rejectedAnswer }) => ({ question: rejectedQuestion, answer: rejectedAnswer }));
      const apiResponse = await fetch(`${baseUrl.replace(/\/$/, "")}/chat/completions`, { method: "POST", signal: AbortSignal.timeout(12000), headers: { authorization: `Bearer ${apiKey}`, "content-type": "application/json" }, body: JSON.stringify({ model, temperature: 0.25, max_tokens: 620, response_format: { type: "json_object" }, messages: [
        { role: "system", content: "你是6-12岁孩子的成长档案问答伙伴。只能根据提供的evidence回答并引用原始ref；区分事实、观察和线索。不能诊断、预测天赋、比较孩子、推断固定人格，不能把一次经历说成规律。证据不足就明确说还不知道。只能说查看了可参考记录，不得声称查看了所有记录。使用第一人称友好中文，回答问题本身，不说教。只返回JSON。" },
        { role: "user", content: JSON.stringify({ child: { name: profile.name, age: profile.age }, question, evidence: ranked, recentAnswersChildRejected: recentRejected, output: { answer: "不超过220字，明确证据强弱", confidence: "enough/some/little", evidenceRefs: ["1-4个提供的ref"], nextQuestion: "一个帮助孩子继续理解自己的可选问题，不超过45字" } }) }
      ] }) });
      if (!apiResponse.ok) throw new Error(`self coach ${apiResponse.status}`);
      const json = parseJsonContent((await apiResponse.json()).choices?.[0]?.message?.content || "{}");
      const refs = [...new Set((Array.isArray(json.evidenceRefs) ? json.evidenceRefs : []).map(String).filter((ref) => allowedRefs.has(ref)))].slice(0, 4);
      if (refs.length) {
        selectedEvidence = refs.map((ref) => ranked.find((item) => item.ref === ref)).filter(Boolean);
        answer = String(json.answer || answer).trim().slice(0, 500);
        for (const source of ranked) answer = answer.replaceAll(source.ref, source.kind);
        answer = answer.replace(/\b[a-z][a-z_-]*:\d+\b/gi, "来源证据");
        answer = answer.replace(/(?:翻看|查看)了?你所有的记录/g, "查看了你允许AI参考的记录");
        confidence = ["enough", "some", "little"].includes(json.confidence) ? json.confidence : confidence;
        nextQuestion = String(json.nextQuestion || nextQuestion).trim().slice(0, 120);
        provider = "siliconflow";
      }
    } catch (error) { console.warn("Self coach used local fallback:", error.message); }
  }
  const now = nowIso();
  const result = db.prepare("INSERT INTO self_coach_answers(profile_id,question,answer,confidence,evidence_json,next_question,provider,feedback,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?)").run(profileIdValue, question, answer, confidence, JSON.stringify(selectedEvidence), nextQuestion, provider, "", now, now);
  recordEvent(user.id, profileIdValue, "self_coach_asked", { provider, confidence, evidenceCount: selectedEvidence.length });
  sendJson(response, 201, selfCoachRows(profileIdValue).find((item) => item.id === Number(result.lastInsertRowid)));
}
async function handleSelfCoachFeedback(request, response, url) {
  const user = requireUser(request, response); if (!user) return;
  const id = Number(url.pathname.split("/").pop());
  const row = db.prepare("SELECT self_coach_answers.* FROM self_coach_answers JOIN profiles ON profiles.id=self_coach_answers.profile_id WHERE self_coach_answers.id=? AND profiles.user_id=?").get(id, user.id);
  if (!row) return sendJson(response, 404, { error: "回答不存在" });
  const body = await readBodyJson(request);
  const feedback = ["helpful", "not_me"].includes(body.feedback) ? body.feedback : "";
  if (!feedback) return sendJson(response, 400, { error: "未知反馈" });
  db.prepare("UPDATE self_coach_answers SET feedback=?,updated_at=? WHERE id=?").run(feedback, nowIso(), id);
  recordEvent(user.id, row.profile_id, "self_coach_feedback", { feedback });
  sendJson(response, 200, selfCoachRows(row.profile_id).find((item) => item.id === id));
}
function handleDeleteSelfCoach(request, response, url) {
  const user = requireUser(request, response); if (!user) return;
  const id = Number(url.pathname.split("/").pop());
  const row = db.prepare("SELECT self_coach_answers.* FROM self_coach_answers JOIN profiles ON profiles.id=self_coach_answers.profile_id WHERE self_coach_answers.id=? AND profiles.user_id=?").get(id, user.id);
  if (!row) return sendJson(response, 404, { error: "回答不存在" });
  db.prepare("DELETE FROM self_coach_answers WHERE id=?").run(id);
  recordEvent(user.id, row.profile_id, "self_coach_deleted", {});
  sendJson(response, 200, { ok: true });
}

function ideaRows(profileIdValue) {
  return db.prepare("SELECT id,title,note,source,status,next_step AS nextStep,skill,goal_id AS goalId,ai_json AS ai,last_surfaced_at AS lastSurfacedAt,surface_count AS surfaceCount,snoozed_until AS snoozedUntil,created_at AS createdAt,updated_at AS updatedAt FROM ideas WHERE profile_id=? ORDER BY CASE status WHEN 'active' THEN 1 WHEN 'incubating' THEN 2 WHEN 'spark' THEN 3 WHEN 'dismissed' THEN 5 ELSE 4 END,updated_at DESC LIMIT 60").all(profileIdValue)
    .map((item) => ({ ...item, ai: item.ai ? JSON.parse(item.ai) : null }));
}
function ownedIdea(userId, id) {
  return db.prepare("SELECT ideas.* FROM ideas JOIN profiles ON profiles.id=ideas.profile_id WHERE ideas.id=? AND profiles.user_id=?").get(id, userId);
}
function handleListIdeas(request, response, url) {
  const user = requireUser(request, response); if (!user) return;
  const profileIdValue = String(url.searchParams.get("profileId") || "");
  if (!ownedProfile(user.id, profileIdValue)) return sendJson(response, 404, { error: "角色不存在" });
  sendJson(response, 200, { ideas: ideaRows(profileIdValue) });
}
async function handleCreateIdea(request, response) {
  const user = requireUser(request, response); if (!user) return;
  const body = await readBodyJson(request);
  const profileIdValue = String(body.profileId || "");
  if (!ownedProfile(user.id, profileIdValue)) return sendJson(response, 404, { error: "角色不存在" });
  const title = String(body.title || "").trim().slice(0, 80);
  const note = String(body.note || "").trim().slice(0, 2000);
  const source = ["self", "journal", "ai", "news"].includes(body.source) ? body.source : "self";
  const requestedGoalId = Number(body.goalId || 0);
  const goalId = requestedGoalId && db.prepare("SELECT id FROM growth_goals WHERE id=? AND profile_id=? AND status='active'").get(requestedGoalId, profileIdValue) ? requestedGoalId : 0;
  if (!title) return sendJson(response, 400, { error: "先写下一点灵感" });
  const now = nowIso();
  const result = db.prepare("INSERT INTO ideas(profile_id,title,note,source,status,next_step,skill,goal_id,ai_json,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?)").run(profileIdValue, title, note, source, "spark", "", "", goalId, "", now, now);
  recordEvent(user.id, profileIdValue, "idea_captured", { source });
  sendJson(response, 201, ideaRows(profileIdValue).find((item) => item.id === Number(result.lastInsertRowid)));
}
async function handleUpdateIdea(request, response, url) {
  const user = requireUser(request, response); if (!user) return;
  const id = Number(url.pathname.split("/").pop());
  const idea = ownedIdea(user.id, id);
  if (!idea) return sendJson(response, 404, { error: "灵感不存在" });
  const body = await readBodyJson(request);
  const status = ["spark", "incubating", "active", "done"].includes(body.status) ? body.status : idea.status;
  const nextStep = body.nextStep === undefined ? idea.next_step : String(body.nextStep).trim().slice(0, 300);
  db.prepare("UPDATE ideas SET status=?,next_step=?,updated_at=? WHERE id=?").run(status, nextStep, nowIso(), id);
  if (status === "active") ensureIdeaAction(idea.profile_id, { ...idea, next_step: nextStep });
  if (status !== idea.status) recordEvent(user.id, idea.profile_id, status === "active" ? "idea_started" : status === "done" ? "idea_completed" : "idea_developed", { from: idea.status, to: status });
  sendJson(response, 200, ideaRows(idea.profile_id).find((item) => item.id === id));
}
function ensureIdeaAction(profileIdValue, idea) {
  const sourceRef = `idea:${idea.id}`;
  if (db.prepare("SELECT id FROM actions WHERE profile_id=? AND source_ref=? AND status!='done'").get(profileIdValue, sourceRef)) return;
  const title = String(idea.next_step || idea.title).slice(0, 120);
  const now = nowIso();
  db.prepare("INSERT INTO actions(profile_id,title,detail,status,estimate_minutes,energy,importance,due_at,source,source_ref,goal_id,steps_json,success,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)")
    .run(profileIdValue, title, `来自灵感：${idea.title}`, "open", 10, "normal", 2, "", "idea", sourceRef, Number(idea.goal_id || 0), "[]", "完成一个看得见的小版本", now, now);
}
function handleDeleteIdea(request, response, url) {
  const user = requireUser(request, response); if (!user) return;
  const id = Number(url.pathname.split("/").pop());
  const idea = ownedIdea(user.id, id);
  if (!idea) return sendJson(response, 404, { error: "灵感不存在" });
  db.prepare("DELETE FROM ideas WHERE id=?").run(id);
  recordEvent(user.id, idea.profile_id, "idea_deleted", { status: idea.status });
  sendJson(response, 200, { ok: true });
}
async function handleDevelopIdea(request, response, url) {
  const user = requireUser(request, response); if (!user) return;
  const id = Number(url.pathname.split("/")[3]);
  const idea = ownedIdea(user.id, id);
  if (!idea) return sendJson(response, 404, { error: "灵感不存在" });
  const hypotheses = hypothesisRows(idea.profile_id).filter((item) => item.aiContext && item.status === "active").slice(0, 6).map((item) => ({ title: item.title, confidence: item.confidence }));
  const fallback = { question: "你最想让别人看到这个想法的哪一部分？", possibilities: ["做一张图卡", "录一分钟讲解", "搭一个小模型"], tinyNextStep: "用5分钟写下作品名字和它要解决的问题", skill: "creation", success: "留下一个看得见的小版本" };
  let developed = fallback;
  if (apiKey) {
    try {
      const apiResponse = await fetch(`${baseUrl.replace(/\/$/, "")}/chat/completions`, { method: "POST", signal: AbortSignal.timeout(45000), headers: { authorization: `Bearer ${apiKey}`, "content-type": "application/json" }, body: JSON.stringify({ model, temperature: 0.72, max_tokens: 480, response_format: { type: "json_object" }, messages: [
        { role: "system", content: "你是6-12岁孩子的灵感孵化伙伴。帮助孩子把一个模糊想法变成可选择的小项目，但不要替孩子决定。给一个澄清问题、三个差异明显的可能方向、一个10分钟内可做的微行动。只返回JSON，不说教。" },
        { role: "user", content: JSON.stringify({ idea: { title: idea.title, note: idea.note }, growthHypotheses: hypotheses, output: { question: "最多35字", possibilities: ["三个孩子看得懂的方向"], tinyNextStep: "一个10分钟内行动", skill: "八类技能id", success: "这个微行动的完成标准" } }) }
      ] }) });
      if (!apiResponse.ok) throw new Error("develop");
      const json = parseJsonContent((await apiResponse.json()).choices?.[0]?.message?.content || "{}");
      developed = { question: String(json.question || fallback.question).slice(0, 100), possibilities: Array.isArray(json.possibilities) ? json.possibilities.map(String).slice(0, 3) : fallback.possibilities, tinyNextStep: String(json.tinyNextStep || fallback.tinyNextStep).slice(0, 240), skill: normalizeSkillId(json.skill || "creation"), success: String(json.success || fallback.success).slice(0, 160) };
    } catch {}
  }
  db.prepare("UPDATE ideas SET status='incubating',next_step=?,skill=?,ai_json=?,updated_at=? WHERE id=?").run(developed.tinyNextStep, developed.skill, JSON.stringify(developed), nowIso(), id);
  recordEvent(user.id, idea.profile_id, "idea_developed", { skill: developed.skill });
  sendJson(response, 200, ideaRows(idea.profile_id).find((item) => item.id === id));
}

function ideaResurfacingRow(profileIdValue) {
  const row = db.prepare("SELECT idea_resurfacings.id,idea_resurfacings.idea_id AS ideaId,idea_resurfacings.prompt_json AS prompt,idea_resurfacings.created_at AS createdAt,ideas.title,ideas.note,ideas.status,ideas.goal_id AS goalId FROM idea_resurfacings JOIN ideas ON ideas.id=idea_resurfacings.idea_id WHERE idea_resurfacings.profile_id=? AND idea_resurfacings.outcome='' ORDER BY idea_resurfacings.id DESC LIMIT 1").get(profileIdValue);
  return row ? { ...row, prompt: JSON.parse(row.prompt) } : null;
}
function handleGetIdeaResurfacing(request, response, url) {
  const user = requireUser(request, response); if (!user) return;
  const profileIdValue = String(url.searchParams.get("profileId") || "");
  if (!ownedProfile(user.id, profileIdValue)) return sendJson(response, 404, { error: "角色不存在" });
  sendJson(response, 200, { resurfacing: ideaResurfacingRow(profileIdValue) });
}
async function handleCreateIdeaResurfacing(request, response) {
  const user = requireUser(request, response); if (!user) return;
  const body = await readBodyJson(request);
  const profileIdValue = String(body.profileId || "");
  const profile = ownedProfile(user.id, profileIdValue);
  if (!profile) return sendJson(response, 404, { error: "角色不存在" });
  const existing = ideaResurfacingRow(profileIdValue);
  if (existing) return sendJson(response, 200, { resurfacing: existing, reused: true });
  const candidate = db.prepare("SELECT * FROM ideas WHERE profile_id=? AND status IN ('spark','incubating') AND (snoozed_until='' OR snoozed_until<=?) ORDER BY (last_surfaced_at='') DESC,last_surfaced_at ASC,updated_at ASC,id ASC LIMIT 1").get(profileIdValue, nowIso());
  if (!candidate) return sendJson(response, 409, { error: "现在没有需要叫醒的旧灵感，先去收下一颗新火花吧" });
  const goals = goalRows(profileIdValue).filter((item) => item.status === "active").slice(0, 3).map(({ id, title, why, firstExperiment }) => ({ id, title, why, firstExperiment }));
  const strategies = strategyRows(profileIdValue).filter((item) => item.status === "active" && item.aiContext).slice(0, 4).map(({ statement, whenToUse }) => ({ statement, whenToUse }));
  const news = (Array.isArray(body.news) ? body.news : []).slice(0, 5).map((item) => ({ title: String(item.title || "").slice(0, 100), summary: String(item.summary || "").slice(0, 220) })).filter((item) => item.title);
  const fallback = { whyNow: goals.length ? `它可能和“${goals[0].title}”碰出一个新方向` : "这颗灵感安静了一阵，现在可以换个角度看一眼", question: "如果只保留最好玩的一小部分，你想先试哪一点？", tinyStep: `用10分钟给“${candidate.title}”留下一个最小版本`, freshAngle: news[0]?.title ? `试着把它和“${news[0].title}”连起来` : "先做一个能看见、能讲给别人听的小版本" };
  let prompt = fallback;
  let provider = "local";
  if (apiKey) {
    try {
      const apiResponse = await fetch(`${baseUrl.replace(/\/$/, "")}/chat/completions`, { method: "POST", signal: AbortSignal.timeout(12000), headers: { authorization: `Bearer ${apiKey}`, "content-type": "application/json" }, body: JSON.stringify({ model, temperature: 0.68, max_tokens: 420, response_format: { type: "json_object" }, messages: [
        { role: "system", content: "你是6-12岁孩子的灵感唤醒伙伴。一次只温柔唤醒一个旧想法，用成长方向、孩子确认有效的方法和安全消息提供真正不同的新角度。不要催促、评价天赋、制造亏欠感或假装确定。给一个开放问题和一个10分钟内可停止的尝试。只返回JSON。" },
        { role: "user", content: JSON.stringify({ child: { name: profile.name, age: profile.age }, idea: { title: candidate.title, note: candidate.note, status: candidate.status }, current: { energy: String(body.energy || "normal"), availableMinutes: Math.max(5, Math.min(60, Number(body.availableMinutes || 10))) }, growthGoals: goals, confirmedStrategies: strategies, safeMessages: news, output: { whyNow: "不超过40字，说明这次的新连接，不使用应该/必须", question: "一个孩子能回答的开放问题", tinyStep: "10分钟内、可见、可随时停止", freshAngle: "与旧想法不同的新角度" } }) }
      ] }) });
      if (!apiResponse.ok) throw new Error(`resurface ${apiResponse.status}`);
      const json = parseJsonContent((await apiResponse.json()).choices?.[0]?.message?.content || "{}");
      prompt = { whyNow: String(json.whyNow || fallback.whyNow).slice(0, 100), question: String(json.question || fallback.question).slice(0, 120), tinyStep: String(json.tinyStep || fallback.tinyStep).slice(0, 180), freshAngle: String(json.freshAngle || fallback.freshAngle).slice(0, 140) };
      provider = "siliconflow";
    } catch (error) { console.warn("Idea resurfacing used local fallback:", error.message); }
  }
  const now = nowIso();
  const result = db.prepare("INSERT INTO idea_resurfacings(profile_id,idea_id,prompt_json,outcome,created_at,updated_at) VALUES(?,?,?,?,?,?)").run(profileIdValue, candidate.id, JSON.stringify({ ...prompt, provider }), "", now, now);
  db.prepare("UPDATE ideas SET last_surfaced_at=?,surface_count=surface_count+1 WHERE id=?").run(now, candidate.id);
  recordEvent(user.id, profileIdValue, "idea_resurfaced", { ideaId: candidate.id, provider });
  sendJson(response, 201, { resurfacing: ideaResurfacingRow(profileIdValue), reused: false });
}
async function handleIdeaResurfacingOutcome(request, response, url) {
  const user = requireUser(request, response); if (!user) return;
  const id = Number(url.pathname.split("/").pop());
  const row = db.prepare("SELECT idea_resurfacings.*,ideas.title,ideas.note,ideas.goal_id,profiles.user_id FROM idea_resurfacings JOIN ideas ON ideas.id=idea_resurfacings.idea_id JOIN profiles ON profiles.id=idea_resurfacings.profile_id WHERE idea_resurfacings.id=? AND profiles.user_id=?").get(id, user.id);
  if (!row) return sendJson(response, 404, { error: "这次灵感唤醒不存在" });
  if (row.outcome) return sendJson(response, 409, { error: "这颗灵感已经做过决定了" });
  const body = await readBodyJson(request);
  const outcome = ["try", "keep", "later", "dismiss"].includes(body.outcome) ? body.outcome : "";
  if (!outcome) return sendJson(response, 400, { error: "请选择怎样对待这颗灵感" });
  const prompt = JSON.parse(row.prompt_json || "{}");
  const now = nowIso();
  let snoozedUntil = "";
  if (outcome === "keep" || outcome === "later") snoozedUntil = new Date(Date.now() + (outcome === "keep" ? 7 : 30) * 86400000).toISOString();
  db.exec("BEGIN");
  try {
    db.prepare("UPDATE idea_resurfacings SET outcome=?,updated_at=? WHERE id=?").run(outcome, now, id);
    if (outcome === "try") db.prepare("UPDATE ideas SET status='active',next_step=?,snoozed_until='',updated_at=? WHERE id=?").run(String(prompt.tinyStep || row.title).slice(0, 300), now, row.idea_id);
    else if (outcome === "dismiss") db.prepare("UPDATE ideas SET status='dismissed',snoozed_until='',updated_at=? WHERE id=?").run(now, row.idea_id);
    else db.prepare("UPDATE ideas SET snoozed_until=?,updated_at=? WHERE id=?").run(snoozedUntil, now, row.idea_id);
    if (outcome === "try") ensureIdeaAction(row.profile_id, { id: row.idea_id, title: row.title, next_step: prompt.tinyStep, goal_id: row.goal_id });
    db.exec("COMMIT");
  } catch (error) { db.exec("ROLLBACK"); throw error; }
  recordEvent(user.id, row.profile_id, "idea_resurface_outcome", { ideaId: row.idea_id, outcome });
  sendJson(response, 200, { outcome, idea: ideaRows(row.profile_id).find((item) => item.id === row.idea_id), resurfacing: null });
}

function actionRows(profileIdValue) {
  return db.prepare("SELECT id,title,detail,status,estimate_minutes AS estimateMinutes,energy,importance,due_at AS dueAt,source,source_ref AS sourceRef,goal_id AS goalId,not_before AS notBefore,defer_count AS deferCount,last_defer_reason AS lastDeferReason,steps_json AS steps,success,created_at AS createdAt,updated_at AS updatedAt FROM actions WHERE profile_id=? ORDER BY CASE status WHEN 'doing' THEN 1 WHEN 'open' THEN 2 WHEN 'someday' THEN 3 WHEN 'dropped' THEN 4 ELSE 5 END,due_at='',due_at,importance DESC,updated_at DESC LIMIT 100").all(profileIdValue)
    .map((item) => ({ ...item, steps: JSON.parse(item.steps) }));
}
function actionDecisionCalibration(profileIdValue) {
  const rows = db.prepare("SELECT reason,outcome,created_at AS createdAt FROM action_decisions WHERE profile_id=? ORDER BY id DESC LIMIT 20").all(profileIdValue);
  const reasons = ["no_energy", "no_time", "unclear", "not_important"];
  const reasonCounts = Object.fromEntries(reasons.map((reason) => [reason, rows.filter((row) => row.reason === reason).length]));
  const activeSignals = reasons.filter((reason) => reasonCounts[reason] >= 2).sort((left, right) => reasonCounts[right] - reasonCounts[left]);
  return { sampleSize: rows.length, reasonCounts, activeSignals, preferShort: reasonCounts.no_time >= 2, preferLowEnergy: reasonCounts.no_energy >= 2, preferClearStep: reasonCounts.unclear >= 2, preferImportant: reasonCounts.not_important >= 2, rule: "协商原因至少重复两次才调整推荐；这是当前节奏，不是能力或性格标签，样本撤回后校准同步撤回。" };
}
function ownedAction(userId, id) {
  return db.prepare("SELECT actions.* FROM actions JOIN profiles ON profiles.id=actions.profile_id WHERE actions.id=? AND profiles.user_id=?").get(id, userId);
}
function handleListActions(request, response, url) {
  const user = requireUser(request, response); if (!user) return;
  const profileIdValue = String(url.searchParams.get("profileId") || "");
  if (!ownedProfile(user.id, profileIdValue)) return sendJson(response, 404, { error: "角色不存在" });
  sendJson(response, 200, { actions: actionRows(profileIdValue), decisionCalibration: actionDecisionCalibration(profileIdValue) });
}
function localDateTimeValue(date, hour = 18) {
  return `${serverDateKey(date)}T${String(hour).padStart(2, "0")}:00`;
}
function fallbackInboxDraft(text, answer = null) {
  const minuteMatch = text.match(/(\d{1,3})\s*(?:分钟|分|min)/i);
  const answeredMinutes = answer?.field === "minutes" ? Number(answer.value) : 0;
  const estimateMinutes = Math.max(3, Math.min(180, answeredMinutes || Number(minuteMatch?.[1] || 10)));
  const now = new Date();
  let dueAt = "";
  if (answer?.field === "due") {
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(answer.value)) dueAt = answer.value.slice(0, 16);
    else if (/^\d{4}-\d{2}-\d{2}$/.test(answer.value)) dueAt = `${answer.value}T18:00`;
    else if (answer.value === "today") dueAt = localDateTimeValue(now);
    else if (answer.value === "tomorrow") dueAt = localDateTimeValue(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1));
    else if (answer.value === "none") dueAt = "";
  } else if (/后天/.test(text)) { const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2); dueAt = localDateTimeValue(date); }
  else if (/明天/.test(text)) { const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1); dueAt = localDateTimeValue(date); }
  else if (/今天|今晚/.test(text)) dueAt = localDateTimeValue(now, /今晚/.test(text) ? 20 : 18);
  else {
    const weekdayMatch = text.match(/(?:周|星期)([一二三四五六日天])/);
    if (weekdayMatch) {
      const target = { 一: 1, 二: 2, 三: 3, 四: 4, 五: 5, 六: 6, 日: 0, 天: 0 }[weekdayMatch[1]];
      let add = (target - now.getDay() + 7) % 7;
      if (add === 0) add = 7;
      dueAt = localDateTimeValue(new Date(now.getFullYear(), now.getMonth(), now.getDate() + add));
    }
  }
  const title = text.replace(/(?:大概|约)?\d{1,3}\s*(?:分钟|分|mins?)/gi, "").replace(/[，,。；;]+$/g, "").trim().slice(0, 80) || "新的行动";
  const importance = answer?.field === "importance" ? Math.max(1, Math.min(3, Number(answer.value || 2))) : /必须|重要|截止|要交|别忘/.test(text) ? 3 : 2;
  return { title, detail: "", estimateMinutes, energy: estimateMinutes <= 10 ? "low" : estimateMinutes <= 25 ? "normal" : "high", importance, dueAt, firstStep: "先准备需要的东西，把第一小步做出来" };
}
function findDuplicateAction(profileIdValue, title) {
  const normalized = normalizedTitle(title);
  if (!normalized) return null;
  return actionRows(profileIdValue).find((action) => {
    if (action.status === "done") return false;
    const candidate = normalizedTitle(action.title);
    return candidate === normalized || (Math.min(candidate.length, normalized.length) >= 5 && (candidate.includes(normalized) || normalized.includes(candidate))) || serverTitleSimilarity(action.title, title) >= 0.82;
  }) || null;
}
function fallbackCaptureDraft(text, answer) {
  const selectedCategory = answer?.field === "category" && ["action", "idea", "journal"].includes(answer.value) ? answer.value : "";
  const actionCue = /要|得|需要|记得|别忘|完成|准备|提交|交作业|截止|明天|今晚|周[一二三四五六日天]/.test(text);
  const journalCue = /今天|刚才|我发现|我感觉|我明白|原来|让我|开心|难过|生气|害怕|紧张|骄傲/.test(text);
  const ideaCue = /想到|点子|灵感|如果|发明|设计|想象|做一个|能不能/.test(text);
  const category = selectedCategory || (actionCue && !ideaCue ? "action" : journalCue && !actionCue ? "journal" : ideaCue && !actionCue ? "idea" : "");
  const action = fallbackInboxDraft(text, answer);
  const cleanTitle = text.replace(/[。！？!?]+$/g, "").trim().slice(0, 60);
  return {
    category,
    title: cleanTitle || "刚刚想到的事",
    content: text,
    tags: category === "idea" ? ["灵感"] : category === "journal" ? ["发现"] : [],
    action
  };
}
function matchingGoalId(profileIdValue, text) {
  const active = goalRows(profileIdValue).filter((goal) => goal.status === "active");
  const ranked = active.map((goal) => ({ id: goal.id, score: serverTitleSimilarity(goal.title, text) + (normalizedTitle(text).includes(normalizedTitle(goal.title)) ? 1 : 0) })).sort((left, right) => right.score - left.score);
  return ranked[0]?.score >= 0.28 ? ranked[0].id : 0;
}
async function handleParseCapture(request, response) {
  const user = requireUser(request, response); if (!user) return;
  const body = await readBodyJson(request);
  const profileIdValue = String(body.profileId || "");
  const profile = ownedProfile(user.id, profileIdValue);
  if (!profile) return sendJson(response, 404, { error: "角色不存在" });
  const input = String(body.text || "").trim().slice(0, 1000);
  if (input.length < 2) return sendJson(response, 400, { error: "把刚想到的说一句就好" });
  const answer = body.answer && typeof body.answer === "object" ? { field: String(body.answer.field || "").slice(0, 30), value: String(body.answer.value || "").slice(0, 80) } : null;
  const fallback = fallbackCaptureDraft(input, answer);
  fallback.goalId = matchingGoalId(profileIdValue, input);
  let result;
  if (!fallback.category && !answer) {
    result = { status: "question", question: "你希望我把它放在哪里？", answerField: "category", options: [{ label: "要做的事", value: "action" }, { label: "一个灵感", value: "idea" }, { label: "我的感悟", value: "journal" }], provider: "local" };
  } else if (fallback.category === "action" && !answer && !/(\d{1,3})\s*(?:分钟|分|min)/i.test(input)) {
    result = { status: "question", question: "这件事大概需要多久？", answerField: "minutes", options: [{ label: "5分钟", value: "5" }, { label: "10分钟", value: "10" }, { label: "20分钟", value: "20" }, { label: "半小时", value: "30" }], provider: "local" };
  } else {
    result = { status: "ready", draft: fallback, provider: "local" };
  }
  if (apiKey) {
    try {
      const existingActions = actionRows(profileIdValue).filter((item) => item.status !== "done").slice(0, 15).map(({ id, title, estimateMinutes, dueAt, status }) => ({ id, title, estimateMinutes, dueAt, status }));
      const recentIdeas = ideaRows(profileIdValue).slice(0, 8).map(({ title, note, status }) => ({ title, note: note.slice(0, 160), status }));
      const recentJournal = journalRows(profileIdValue).filter((entry) => entry.shareWithAi).slice(0, 5).map(({ content, tags }) => ({ content: content.slice(0, 180), tags }));
      const activeGoals = goalRows(profileIdValue).filter((goal) => goal.status === "active").map(({ id, title, why, successSignal, skill }) => ({ id, title, why, successSignal, skill }));
      const apiResponse = await fetch(`${baseUrl.replace(/\/$/, "")}/chat/completions`, { method: "POST", signal: AbortSignal.timeout(10000), headers: { authorization: `Bearer ${apiKey}`, "content-type": "application/json" }, body: JSON.stringify({ model, temperature: 0.2, max_tokens: 600, response_format: { type: "json_object" }, messages: [
        { role: "system", content: "你帮助6-12岁孩子整理一句随手记录。先判断它是action要做的事、idea想探索的灵感、journal感受或自我发现。不要把每个想法都变成任务。如果意图真的不清楚或行动缺少最影响执行的一项信息，只问一个可点选问题；已有answer后不得继续追问。保留孩子的第一人称原意，不诊断、不贴标签。只返回JSON。" },
        { role: "user", content: JSON.stringify({ localDate: serverDateKey(), child: { name: profile.name, age: profile.age }, input, answer, existingActions, recentIdeas, recentJournal, activeGoals, output: { status: "question或ready", question: "最多一个短问题", answerField: "category或minutes", options: [{ label: "2-4个短选项", value: "机器值" }], draft: { category: "action/idea/journal", title: "简短标题", content: "保留第一人称的正文", tags: ["0-4个短标签"], goalId: "只有明显相关时复制activeGoals中的id，否则0", action: { title: "动作开头的行动名", detail: "必要补充", estimateMinutes: "3-180", energy: "low/normal/high", importance: "1-3", dueAt: "YYYY-MM-DDTHH:mm或空", firstStep: "马上能做的第一小步" } } } }) }
      ] }) });
      if (!apiResponse.ok) throw new Error(`capture ${apiResponse.status}`);
      const json = parseJsonContent((await apiResponse.json()).choices?.[0]?.message?.content || "{}");
      const category = ["action", "idea", "journal"].includes(json.draft?.category) ? json.draft.category : fallback.category;
      const actionFallback = fallback.action;
      const action = { title: String(json.draft?.action?.title || actionFallback.title).trim().slice(0, 100), detail: String(json.draft?.action?.detail || actionFallback.detail).trim().slice(0, 500), estimateMinutes: Math.max(3, Math.min(180, Number(json.draft?.action?.estimateMinutes || actionFallback.estimateMinutes))), energy: ["low", "normal", "high"].includes(json.draft?.action?.energy) ? json.draft.action.energy : actionFallback.energy, importance: Math.max(1, Math.min(3, Number(json.draft?.action?.importance || actionFallback.importance))), dueAt: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(json.draft?.action?.dueAt) ? String(json.draft.action.dueAt).slice(0, 16) : actionFallback.dueAt, firstStep: String(json.draft?.action?.firstStep || actionFallback.firstStep).slice(0, 160) };
      const requestedGoalId = Number(json.draft?.goalId || fallback.goalId || 0);
      const goalId = activeGoals.some((goal) => goal.id === requestedGoalId) ? requestedGoalId : 0;
      const draft = { category, title: String(json.draft?.title || fallback.title).trim().slice(0, 80), content: String(json.draft?.content || input).trim().slice(0, 4000), tags: Array.isArray(json.draft?.tags) ? json.draft.tags.map(String).map((tag) => tag.slice(0, 24)).slice(0, 4) : fallback.tags, goalId, action };
      const wantsQuestion = !answer && json.status === "question" && String(json.question || "").trim() && Array.isArray(json.options) && json.options.length >= 2;
      result = wantsQuestion ? { status: "question", question: String(json.question).slice(0, 80), answerField: ["category", "minutes"].includes(json.answerField) ? json.answerField : "category", options: json.options.slice(0, 4).map((option) => ({ label: String(option.label || option.value).slice(0, 24), value: String(option.value || option.label).slice(0, 80) })), provider: "siliconflow" } : { status: "ready", draft, provider: "siliconflow" };
    } catch (error) { console.warn("Capture used local fallback:", error.message); }
  }
  if (result.status === "ready" && result.draft.category === "action") {
    const duplicate = findDuplicateAction(profileIdValue, result.draft.action.title);
    if (duplicate) result = { status: "duplicate", duplicate, draft: result.draft, provider: result.provider };
  }
  recordEvent(user.id, profileIdValue, answer ? "capture_clarified" : "capture_parsed", { status: result.status, category: result.draft?.category || "unclear", provider: result.provider, answerField: result.answerField || "" });
  sendJson(response, 200, result);
}
async function handleParseActionInbox(request, response) {
  const user = requireUser(request, response); if (!user) return;
  const body = await readBodyJson(request);
  const profileIdValue = String(body.profileId || "");
  const profile = ownedProfile(user.id, profileIdValue);
  if (!profile) return sendJson(response, 404, { error: "角色不存在" });
  const text = String(body.text || "").trim().slice(0, 500);
  if (text.length < 2) return sendJson(response, 400, { error: "把想到的事情说一句就好" });
  const answer = body.answer && typeof body.answer === "object" ? { field: String(body.answer.field || "").slice(0, 30), value: String(body.answer.value || "").slice(0, 80) } : null;
  const fallback = fallbackInboxDraft(text, answer);
  let result = !answer && !/(\d{1,3})\s*(?:分钟|分|min)/i.test(text) ? { status: "question", question: "这件事大概需要多久？", options: [{ label: "5分钟", value: "5" }, { label: "10分钟", value: "10" }, { label: "20分钟", value: "20" }, { label: "半小时", value: "30" }], answerField: "minutes", draft: fallback, provider: "local" } : { status: "ready", draft: fallback, provider: "local" };
  if (apiKey) {
    try {
      const existingActions = actionRows(profileIdValue).filter((item) => item.status !== "done").slice(0, 20).map(({ id, title, estimateMinutes, dueAt, status }) => ({ id, title, estimateMinutes, dueAt, status }));
      const snapshot = db.prepare("SELECT data_json FROM snapshots WHERE profile_id=?").get(profileIdValue);
      const snapshotData = snapshot ? JSON.parse(snapshot.data_json) : {};
      const schedule = Array.isArray(snapshotData["schedule-items"]) ? snapshotData["schedule-items"].slice(0, 10).map(({ title, start, energy }) => ({ title, start, energy })) : [];
      const apiResponse = await fetch(`${baseUrl.replace(/\/$/, "")}/chat/completions`, { method: "POST", signal: AbortSignal.timeout(10000), headers: { authorization: `Bearer ${apiKey}`, "content-type": "application/json" }, body: JSON.stringify({ model, temperature: 0.25, max_tokens: 480, response_format: { type: "json_object" }, messages: [
        { role: "system", content: "你把6-12岁孩子的一句话整理成待办草稿。保留孩子原意，不扩大范围，不说教。如果缺少最影响执行的一项信息，只问一个可点选问题；已有answer后不得继续追问。日期按给定本地日期理解。只返回JSON。" },
        { role: "user", content: JSON.stringify({ localDate: serverDateKey(), localWeekday: new Intl.DateTimeFormat("zh-CN", { weekday: "long" }).format(new Date()), child: { name: profile.name, age: profile.age }, text, answer, existingActions, schedule, output: { status: "question或ready", question: "最多一个短问题", answerField: "minutes/due/importance", options: [{ label: "2-4个短选项", value: "机器值" }], draft: { title: "清楚的行动名", detail: "必要补充", estimateMinutes: "3-180", energy: "low/normal/high", importance: "1-3", dueAt: "YYYY-MM-DDTHH:mm或空", firstStep: "马上能做的第一小步" } } }) }
      ] }) });
      if (!apiResponse.ok) throw new Error(`inbox ${apiResponse.status}`);
      const json = parseJsonContent((await apiResponse.json()).choices?.[0]?.message?.content || "{}");
      const draft = { title: String(json.draft?.title || fallback.title).trim().slice(0, 100), detail: String(json.draft?.detail || fallback.detail).trim().slice(0, 500), estimateMinutes: Math.max(3, Math.min(180, Number(json.draft?.estimateMinutes || fallback.estimateMinutes))), energy: ["low", "normal", "high"].includes(json.draft?.energy) ? json.draft.energy : fallback.energy, importance: Math.max(1, Math.min(3, Number(json.draft?.importance || fallback.importance))), dueAt: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(json.draft?.dueAt) ? String(json.draft.dueAt).slice(0, 16) : fallback.dueAt, firstStep: String(json.draft?.firstStep || fallback.firstStep).slice(0, 160) };
      const wantsQuestion = !answer && json.status === "question" && String(json.question || "").trim() && Array.isArray(json.options) && json.options.length >= 2;
      result = wantsQuestion ? { status: "question", question: String(json.question).slice(0, 80), options: json.options.slice(0, 4).map((option) => ({ label: String(option.label || option.value).slice(0, 24), value: String(option.value || option.label).slice(0, 80) })), answerField: ["minutes", "due", "importance"].includes(json.answerField) ? json.answerField : "minutes", draft, provider: "siliconflow" } : { status: "ready", draft, provider: "siliconflow" };
    } catch (error) { console.warn("Action inbox used local fallback:", error.message); }
  }
  if (result.status === "ready") {
    const duplicate = findDuplicateAction(profileIdValue, result.draft.title);
    if (duplicate) {
      recordEvent(user.id, profileIdValue, "action_inbox_duplicate", { actionId: duplicate.id });
      return sendJson(response, 200, { status: "duplicate", duplicate, draft: result.draft, provider: result.provider });
    }
  }
  recordEvent(user.id, profileIdValue, answer ? "action_inbox_clarified" : "action_inbox_parsed", { status: result.status, provider: result.provider, answerField: result.answerField || "", lengthBand: text.length < 40 ? "short" : "long" });
  sendJson(response, 200, result);
}
async function handleCreateAction(request, response) {
  const user = requireUser(request, response); if (!user) return;
  const body = await readBodyJson(request);
  const profileIdValue = String(body.profileId || "");
  if (!ownedProfile(user.id, profileIdValue)) return sendJson(response, 404, { error: "角色不存在" });
  const title = String(body.title || "").trim().slice(0, 120);
  if (!title) return sendJson(response, 400, { error: "先写下要做什么" });
  const estimate = Math.max(3, Math.min(180, Number(body.estimateMinutes || 10)));
  const energy = ["low", "normal", "high"].includes(body.energy) ? body.energy : "normal";
  const importance = Math.max(1, Math.min(3, Number(body.importance || 2)));
  const requestedGoalId = Number(body.goalId || 0);
  const goalId = requestedGoalId && db.prepare("SELECT id FROM growth_goals WHERE id=? AND profile_id=? AND status='active'").get(requestedGoalId, profileIdValue) ? requestedGoalId : 0;
  const dueAt = String(body.dueAt || "").slice(0, 30);
  const now = nowIso();
  const result = db.prepare("INSERT INTO actions(profile_id,title,detail,status,estimate_minutes,energy,importance,due_at,source,source_ref,goal_id,steps_json,success,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)")
    .run(profileIdValue, title, String(body.detail || "").slice(0, 1000), "open", estimate, energy, importance, dueAt, "self", "", goalId, "[]", "", now, now);
  recordEvent(user.id, profileIdValue, "action_created", { estimate, energy, importance, hasDue: Boolean(dueAt), goalId });
  sendJson(response, 201, actionRows(profileIdValue).find((item) => item.id === Number(result.lastInsertRowid)));
}
async function handleUpdateAction(request, response, url) {
  const user = requireUser(request, response); if (!user) return;
  const id = Number(url.pathname.split("/").pop());
  const action = ownedAction(user.id, id);
  if (!action) return sendJson(response, 404, { error: "行动不存在" });
  const body = await readBodyJson(request);
  const status = ["open", "doing", "done", "someday", "dropped"].includes(body.status) ? body.status : action.status;
  const title = body.title === undefined ? action.title : String(body.title).trim().slice(0, 120);
  const dueAt = body.dueAt === undefined ? action.due_at : String(body.dueAt).slice(0, 30);
  const restore = (["someday", "dropped"].includes(action.status) || Boolean(action.not_before)) && ["open", "doing"].includes(status);
  db.prepare("UPDATE actions SET title=?,status=?,due_at=?,not_before=CASE WHEN ? THEN '' ELSE not_before END,updated_at=? WHERE id=?").run(title || action.title, status, dueAt, restore ? 1 : 0, nowIso(), id);
  if (status !== action.status) {
    if (status === "done") {
      const evidence = { actionId: id, skill: "self-regulation", estimateMinutes: action.estimate_minutes, source: action.source, shareWithAi: true };
      const memoryResult = db.prepare("INSERT INTO memories(profile_id,kind,summary,evidence_json,created_at) VALUES(?,?,?,?,?)").run(action.profile_id, "action", `自主行动完成：${title || action.title}`, JSON.stringify(evidence), nowIso());
      evolveHypotheses(action.profile_id, { id: Number(memoryResult.lastInsertRowid), kind: "action", summary: `自主行动完成：${title || action.title}`, evidence, shareWithAi: true });
    } else if (action.status === "done") {
      const memoryIds = db.prepare("SELECT id FROM memories WHERE profile_id=? AND kind='action' AND json_extract(evidence_json,'$.actionId')=?").all(action.profile_id, id).map((item) => Number(item.id));
      db.prepare("DELETE FROM memories WHERE profile_id=? AND kind='action' AND json_extract(evidence_json,'$.actionId')=?").run(action.profile_id, id);
      removeHypothesisEvidence(action.profile_id, memoryIds);
      retractStrategyEvidence(action.profile_id, memoryIds.map((memoryId) => `memory:${memoryId}`));
    }
    recordEvent(user.id, action.profile_id, status === "done" ? "action_completed" : restore ? "action_restored" : "action_reopened", { source: action.source, estimate: action.estimate_minutes, from: action.status, to: status });
  }
  sendJson(response, 200, actionRows(action.profile_id).find((item) => item.id === id));
}
function fallbackActionNegotiation(action, reason) {
  const copy = {
    no_energy: "现在的能量不适合硬撑，可以缩小或换一天。",
    no_time: "时间不够时，主动改计划比匆忙开始更有用。",
    unclear: "还不知道怎么做，不代表做不到，可以先把第一步弄清楚。",
    not_important: "发现一件事不再重要，是在保护真正重要的时间。"
  };
  return { message: copy[reason] || "可以重新决定这件事现在是否值得做。", tinyStep: action.steps_json && JSON.parse(action.steps_json)[0] || `只用5分钟，为「${action.title}」准备第一样需要的东西`, support: "选择延期或放下都不会扣经验，也不是失败。", provider: "local" };
}
async function handleNegotiateAction(request, response, url) {
  const user = requireUser(request, response); if (!user) return;
  const id = Number(url.pathname.split("/")[3]);
  const action = ownedAction(user.id, id);
  if (!action) return sendJson(response, 404, { error: "行动不存在" });
  if (!["open", "doing"].includes(action.status)) return sendJson(response, 409, { error: "这个行动当前不需要协商" });
  const body = await readBodyJson(request);
  const reason = ["no_energy", "no_time", "unclear", "not_important"].includes(body.reason) ? body.reason : "";
  if (!reason) return sendJson(response, 400, { error: "先选一个现在不想做的原因" });
  let result = fallbackActionNegotiation(action, reason);
  if (apiKey) {
    try {
      const strategies = strategyRows(action.profile_id).filter((item) => item.aiContext && item.status === "active").slice(0, 4).map(({ statement, whenToUse }) => ({ statement, whenToUse }));
      const recentDecisions = db.prepare("SELECT reason,outcome,created_at AS createdAt FROM action_decisions WHERE profile_id=? ORDER BY id DESC LIMIT 8").all(action.profile_id);
      const apiResponse = await fetch(`${baseUrl.replace(/\/$/, "")}/chat/completions`, { method: "POST", signal: AbortSignal.timeout(10000), headers: { authorization: `Bearer ${apiKey}`, "content-type": "application/json" }, body: JSON.stringify({ model, temperature: 0.3, max_tokens: 360, response_format: { type: "json_object" }, messages: [
        { role: "system", content: "你是6-12岁孩子的任务协商伙伴。孩子有权延期、缩小或放下一件事。根据原因提供一个5分钟内可做的小版本，但不劝说、不羞辱、不制造损失恐惧，也不把延期解释为懒惰。只返回JSON。" },
        { role: "user", content: JSON.stringify({ action: { title: action.title, detail: action.detail, estimateMinutes: action.estimate_minutes, dueAt: action.due_at, deferCount: action.defer_count }, reason, confirmedStrategies: strategies, recentDecisions, output: { message: "一句承认现实的回应", tinyStep: "5分钟内可完成的具体小版本", support: "一句明确说明延期或放下不是失败的话" } }) }
      ] }) });
      if (!apiResponse.ok) throw new Error(`action negotiate ${apiResponse.status}`);
      const json = parseJsonContent((await apiResponse.json()).choices?.[0]?.message?.content || "{}");
      result = { message: String(json.message || result.message).slice(0, 140), tinyStep: String(json.tinyStep || result.tinyStep).slice(0, 180), support: String(json.support || result.support).slice(0, 120), provider: "siliconflow" };
    } catch (error) { console.warn("Action negotiation used local fallback:", error.message); }
  }
  recordEvent(user.id, action.profile_id, "action_negotiated", { reason, provider: result.provider, deferCount: Number(action.defer_count || 0) });
  sendJson(response, 200, { reason, suggestion: result });
}
async function handleDeferAction(request, response, url) {
  const user = requireUser(request, response); if (!user) return;
  const id = Number(url.pathname.split("/")[3]);
  const action = ownedAction(user.id, id);
  if (!action) return sendJson(response, 404, { error: "行动不存在" });
  if (!["open", "doing"].includes(action.status)) return sendJson(response, 409, { error: "这个行动当前不能这样调整" });
  const body = await readBodyJson(request);
  const reason = ["no_energy", "no_time", "unclear", "not_important"].includes(body.reason) ? body.reason : "";
  const outcome = ["shrink", "tomorrow", "someday", "drop"].includes(body.outcome) ? body.outcome : "";
  if (!reason || !outcome) return sendJson(response, 400, { error: "协商选择不完整" });
  const tinyStep = String(body.tinyStep || "").trim().slice(0, 180) || fallbackActionNegotiation(action, reason).tinyStep;
  let status = action.status;
  let notBefore = action.not_before || "";
  let estimate = Number(action.estimate_minutes || 10);
  let steps = JSON.parse(action.steps_json || "[]");
  if (outcome === "shrink") { status = "open"; notBefore = ""; estimate = Math.min(5, estimate); steps = [tinyStep, ...steps.filter((step) => step !== tinyStep)].slice(0, 8); }
  if (outcome === "tomorrow") { status = "open"; notBefore = localDateTimeValue(new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + 1), 6); }
  if (outcome === "someday") { status = "someday"; notBefore = ""; }
  if (outcome === "drop") { status = "dropped"; notBefore = ""; }
  const now = nowIso();
  db.exec("BEGIN");
  try {
    db.prepare("UPDATE actions SET status=?,estimate_minutes=?,not_before=?,defer_count=defer_count+1,last_defer_reason=?,steps_json=?,updated_at=? WHERE id=?").run(status, estimate, notBefore, reason, JSON.stringify(steps), now, id);
    db.prepare("INSERT INTO action_decisions(profile_id,action_id,reason,outcome,note,created_at) VALUES(?,?,?,?,?,?)").run(action.profile_id, id, reason, outcome, tinyStep, now);
    recordEvent(user.id, action.profile_id, "action_deferred", { reason, outcome, deferCount: Number(action.defer_count || 0) + 1 });
    db.exec("COMMIT");
  } catch (error) { db.exec("ROLLBACK"); throw error; }
  sendJson(response, 200, { action: actionRows(action.profile_id).find((item) => item.id === id), decision: { reason, outcome, tinyStep, createdAt: now } });
}
function handleDeleteAction(request, response, url) {
  const user = requireUser(request, response); if (!user) return;
  const id = Number(url.pathname.split("/").pop());
  const action = ownedAction(user.id, id);
  if (!action) return sendJson(response, 404, { error: "行动不存在" });
  const memoryIds = db.prepare("SELECT id FROM memories WHERE profile_id=? AND kind='action' AND json_extract(evidence_json,'$.actionId')=?").all(action.profile_id, id).map((item) => Number(item.id));
  db.prepare("DELETE FROM memories WHERE profile_id=? AND kind='action' AND json_extract(evidence_json,'$.actionId')=?").run(action.profile_id, id);
  removeHypothesisEvidence(action.profile_id, memoryIds);
  retractStrategyEvidence(action.profile_id, memoryIds.map((memoryId) => `memory:${memoryId}`));
  const rescueMemoryIds = db.prepare("SELECT id FROM memories WHERE profile_id=? AND kind='rescue' AND json_extract(evidence_json,'$.actionId')=?").all(action.profile_id, id).map((item) => Number(item.id));
  db.prepare("DELETE FROM memories WHERE profile_id=? AND kind='rescue' AND json_extract(evidence_json,'$.actionId')=?").run(action.profile_id, id);
  removeHypothesisEvidence(action.profile_id, rescueMemoryIds);
  retractStrategyEvidence(action.profile_id, rescueMemoryIds.map((memoryId) => `memory:${memoryId}`));
  db.prepare("DELETE FROM actions WHERE id=?").run(id);
  recordEvent(user.id, action.profile_id, "action_deleted", { status: action.status });
  sendJson(response, 200, { ok: true });
}
async function handleBreakdownAction(request, response, url) {
  const user = requireUser(request, response); if (!user) return;
  const id = Number(url.pathname.split("/")[3]);
  const action = ownedAction(user.id, id);
  if (!action) return sendJson(response, 404, { error: "行动不存在" });
  const fallback = { steps: ["准备需要的东西", "只做最小的一步", "检查并留下结果"], success: "我能指出已经完成的成果", estimateMinutes: Math.max(5, Math.min(20, action.estimate_minutes)) };
  let result = fallback;
  if (apiKey) {
    try {
      const apiResponse = await fetch(`${baseUrl.replace(/\/$/, "")}/chat/completions`, { method: "POST", signal: AbortSignal.timeout(45000), headers: { authorization: `Bearer ${apiKey}`, "content-type": "application/json" }, body: JSON.stringify({ model, temperature: 0.45, max_tokens: 360, response_format: { type: "json_object" }, messages: [
        { role: "system", content: "你帮助6-12岁孩子把模糊事项拆成可独立执行的小步。步骤必须短、具体、孩子自己看得懂；不增加原任务范围。只返回JSON。" },
        { role: "user", content: JSON.stringify({ action: { title: action.title, detail: action.detail, estimateMinutes: action.estimate_minutes, energy: action.energy }, output: { steps: ["3-5个短步骤"], success: "可观察完成标准", estimateMinutes: "合理总分钟数" } }) }
      ] }) });
      if (!apiResponse.ok) throw new Error("breakdown");
      const json = parseJsonContent((await apiResponse.json()).choices?.[0]?.message?.content || "{}");
      result = { steps: Array.isArray(json.steps) ? json.steps.map(String).slice(0, 5) : fallback.steps, success: String(json.success || fallback.success).slice(0, 160), estimateMinutes: Math.max(3, Math.min(180, Number(json.estimateMinutes || fallback.estimateMinutes))) };
    } catch (error) { console.warn("Action breakdown used local fallback:", error.message); }
  }
  db.prepare("UPDATE actions SET steps_json=?,success=?,estimate_minutes=?,updated_at=? WHERE id=?").run(JSON.stringify(result.steps), result.success, result.estimateMinutes, nowIso(), id);
  recordEvent(user.id, action.profile_id, "action_broken_down", { stepCount: result.steps.length, estimate: result.estimateMinutes });
  sendJson(response, 200, actionRows(action.profile_id).find((item) => item.id === id));
}
function publicActionRescue(row) {
  return { id: Number(row.id), actionId: Number(row.action_id), reason: row.reason, response: JSON.parse(row.response_json), outcome: row.outcome, createdAt: row.created_at, updatedAt: row.updated_at };
}
async function handleActionRescue(request, response, url) {
  const user = requireUser(request, response); if (!user) return;
  const id = Number(url.pathname.split("/")[3]);
  const action = ownedAction(user.id, id);
  if (!action) return sendJson(response, 404, { error: "行动不存在" });
  const body = await readBodyJson(request);
  const reason = ["cannot_start", "too_hard", "low_energy", "missing_things"].includes(body.reason) ? body.reason : "cannot_start";
  const fallbackByReason = {
    cannot_start: { message: "先不用想完整任务，只找到开头。", tinyStep: "把需要的东西放到面前，然后只做第一个动作", support: "开始一点点，也算在前进。" },
    too_hard: { message: "难度太大时，可以先做一个更小版本。", tinyStep: "只完成最容易看见的一小部分，其他先不管", support: "缩小任务不是退步，是在换方法。" },
    low_energy: { message: "现在能量不多，就用最省力的方式试一下。", tinyStep: "坐好、喝口水，只做两分钟能完成的部分", support: "照顾状态也是会管理自己。" },
    missing_things: { message: "缺东西时先别硬做，找一个替代办法。", tinyStep: "列出缺少的东西，再选一个现在不用它也能做的步骤", support: "先解决条件，再继续任务。" }
  };
  let rescue = { ...fallbackByReason[reason], provider: "local" };
  if (apiKey) {
    try {
      const strategies = strategyRows(action.profile_id).filter((item) => item.aiContext && item.status === "active").slice(0, 5).map(({ statement, whenToUse, confidence, feedback }) => ({ statement, whenToUse, confidence, feedback }));
      const apiResponse = await fetch(`${baseUrl.replace(/\/$/, "")}/chat/completions`, { method: "POST", signal: AbortSignal.timeout(12000), headers: { authorization: `Bearer ${apiKey}`, "content-type": "application/json" }, body: JSON.stringify({ model, temperature: 0.36, max_tokens: 300, response_format: { type: "json_object" }, messages: [
        { role: "system", content: "你帮助6-12岁孩子在执行任务卡住时恢复行动。只给一个非常具体、范围更小的步骤，不增加任务，不评价、不说教、不把卡住称为失败或懒惰。只返回JSON。" },
        { role: "user", content: JSON.stringify({ action: { title: action.title, detail: action.detail, steps: JSON.parse(action.steps_json || "[]"), estimateMinutes: action.estimate_minutes }, reason, confirmedStrategies: strategies, output: { message: "一句理解当下的话", tinyStep: "马上能做、最多5分钟的单一步骤", support: "一句不施压的支持" } }) }
      ] }) });
      if (!apiResponse.ok) throw new Error(`rescue ${apiResponse.status}`);
      const json = parseJsonContent((await apiResponse.json()).choices?.[0]?.message?.content || "{}");
      rescue = { message: String(json.message || rescue.message).slice(0, 100), tinyStep: String(json.tinyStep || rescue.tinyStep).slice(0, 160), support: String(json.support || rescue.support).slice(0, 100), provider: "siliconflow" };
    } catch (error) { console.warn("Action rescue used local fallback:", error.message); }
  }
  const now = nowIso();
  const result = db.prepare("INSERT INTO action_rescues(profile_id,action_id,reason,response_json,outcome,created_at,updated_at) VALUES(?,?,?,?,?,?,?)").run(action.profile_id, id, reason, JSON.stringify(rescue), "", now, now);
  recordEvent(user.id, action.profile_id, "action_rescue_requested", { reason, provider: rescue.provider, actionId: id });
  sendJson(response, 201, publicActionRescue(db.prepare("SELECT * FROM action_rescues WHERE id=?").get(Number(result.lastInsertRowid))));
}
async function handleActionRescueOutcome(request, response, url) {
  const user = requireUser(request, response); if (!user) return;
  const id = Number(url.pathname.split("/").pop());
  const row = db.prepare("SELECT action_rescues.* FROM action_rescues JOIN profiles ON profiles.id=action_rescues.profile_id WHERE action_rescues.id=? AND profiles.user_id=?").get(id, user.id);
  if (!row) return sendJson(response, 404, { error: "救援记录不存在" });
  if (row.outcome) return sendJson(response, 409, { error: "这次选择已经记录" });
  const body = await readBodyJson(request);
  const outcome = ["try_step", "five_minutes", "pause_today"].includes(body.outcome) ? body.outcome : "try_step";
  const rescue = JSON.parse(row.response_json);
  const action = db.prepare("SELECT * FROM actions WHERE id=?").get(row.action_id);
  if (!action) return sendJson(response, 404, { error: "行动不存在" });
  if (outcome === "try_step") {
    const steps = JSON.parse(action.steps_json || "[]").map(String);
    const nextSteps = [rescue.tinyStep, ...steps.filter((step) => step !== rescue.tinyStep)].slice(0, 6);
    db.prepare("UPDATE actions SET steps_json=?,updated_at=? WHERE id=?").run(JSON.stringify(nextSteps), nowIso(), action.id);
    const evidence = { rescueId: id, actionId: Number(action.id), reason: row.reason, outcome, skill: "self-regulation", shareWithAi: true };
    const summary = `卡住后采用了一个更小步骤：${rescue.tinyStep}`;
    const memory = db.prepare("INSERT INTO memories(profile_id,kind,summary,evidence_json,created_at) VALUES(?,?,?,?,?)").run(row.profile_id, "rescue", summary, JSON.stringify(evidence), nowIso());
    evolveHypotheses(row.profile_id, { id: Number(memory.lastInsertRowid), kind: "rescue", summary, evidence, shareWithAi: true });
  }
  if (outcome === "five_minutes") {
    const focus = db.prepare("SELECT * FROM focus_sessions WHERE profile_id=? AND action_id=? AND status IN ('active','paused') ORDER BY id DESC LIMIT 1").get(row.profile_id, row.action_id);
    if (focus) { const elapsed = focusElapsedSeconds(focus); db.prepare("UPDATE focus_sessions SET planned_seconds=? WHERE id=?").run(Math.max(elapsed + 1, Math.min(Number(focus.planned_seconds), elapsed + 300)), focus.id); }
  }
  db.prepare("UPDATE action_rescues SET outcome=?,updated_at=? WHERE id=?").run(outcome, nowIso(), id);
  recordEvent(user.id, row.profile_id, "action_rescue_outcome", { reason: row.reason, outcome, actionId: row.action_id });
  const focus = db.prepare("SELECT * FROM focus_sessions WHERE profile_id=? AND action_id=? AND status IN ('active','paused') ORDER BY id DESC LIMIT 1").get(row.profile_id, row.action_id);
  sendJson(response, 200, { rescue: publicActionRescue(db.prepare("SELECT * FROM action_rescues WHERE id=?").get(id)), action: actionRows(row.profile_id).find((item) => item.id === Number(row.action_id)), focus: publicFocus(focus) });
}

function serverDateKey(date = new Date()) {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}
function habitDueOn(frequency, date) {
  const day = date.getDay();
  if (frequency.mode === "weekdays") return day >= 1 && day <= 5;
  if (frequency.mode === "custom") return (frequency.days || []).map(Number).includes(day);
  return true;
}
function habitRows(profileIdValue) {
  const habits = db.prepare("SELECT id,title,cue,target_minutes AS targetMinutes,frequency_json AS frequency,active,created_at AS createdAt,updated_at AS updatedAt FROM habits WHERE profile_id=? AND active=1 ORDER BY updated_at DESC").all(profileIdValue);
  const today = new Date();
  const todayKeyValue = serverDateKey(today);
  return habits.map((habit) => {
    const frequency = JSON.parse(habit.frequency);
    const logs = db.prepare("SELECT log_date AS date,status FROM habit_logs WHERE habit_id=? ORDER BY log_date DESC LIMIT 120").all(habit.id);
    const byDate = new Map(logs.map((log) => [log.date, log.status]));
    let streak = 0;
    for (let offset = 0; offset < 120; offset += 1) {
      const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() - offset);
      if (!habitDueOn(frequency, date)) continue;
      const key = serverDateKey(date);
      const status = byDate.get(key);
      if (status === "done") { streak += 1; continue; }
      if (status === "skip" || (offset === 0 && !status)) continue;
      break;
    }
    return { ...habit, active: Boolean(habit.active), frequency, dueToday: habitDueOn(frequency, today), todayStatus: byDate.get(todayKeyValue) || "pending", streak, totalDone: logs.filter((log) => log.status === "done").length, recentLogs: logs.slice(0, 90) };
  });
}
function ownedHabit(userId, id) {
  return db.prepare("SELECT habits.* FROM habits JOIN profiles ON profiles.id=habits.profile_id WHERE habits.id=? AND profiles.user_id=?").get(id, userId);
}
function handleListHabits(request, response, url) {
  const user = requireUser(request, response); if (!user) return;
  const profileIdValue = String(url.searchParams.get("profileId") || "");
  if (!ownedProfile(user.id, profileIdValue)) return sendJson(response, 404, { error: "角色不存在" });
  sendJson(response, 200, { habits: habitRows(profileIdValue) });
}
async function handleCreateHabit(request, response) {
  const user = requireUser(request, response); if (!user) return;
  const body = await readBodyJson(request);
  const profileIdValue = String(body.profileId || "");
  if (!ownedProfile(user.id, profileIdValue)) return sendJson(response, 404, { error: "角色不存在" });
  const title = String(body.title || "").trim().slice(0, 80);
  if (!title) return sendJson(response, 400, { error: "先写下想保持的小行动" });
  const mode = ["daily", "weekdays", "custom"].includes(body.frequency?.mode) ? body.frequency.mode : "daily";
  const frequency = { mode, days: mode === "custom" ? (body.frequency.days || []).map(Number).filter((day) => day >= 0 && day <= 6).slice(0, 7) : [] };
  const targetMinutes = Math.max(1, Math.min(60, Number(body.targetMinutes || 5)));
  const now = nowIso();
  const result = db.prepare("INSERT INTO habits(profile_id,title,cue,target_minutes,frequency_json,active,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?)").run(profileIdValue, title, String(body.cue || "").trim().slice(0, 120), targetMinutes, JSON.stringify(frequency), 1, now, now);
  recordEvent(user.id, profileIdValue, "habit_created", { mode, targetMinutes });
  sendJson(response, 201, habitRows(profileIdValue).find((item) => item.id === Number(result.lastInsertRowid)));
}
async function handleHabitCheckin(request, response, url) {
  const user = requireUser(request, response); if (!user) return;
  const id = Number(url.pathname.split("/")[3]);
  const habit = ownedHabit(user.id, id);
  if (!habit) return sendJson(response, 404, { error: "习惯不存在" });
  const body = await readBodyJson(request);
  const status = ["done", "skip", "pending"].includes(body.status) ? body.status : "done";
  const date = serverDateKey();
  if (status === "pending") db.prepare("DELETE FROM habit_logs WHERE habit_id=? AND log_date=?").run(id, date);
  else db.prepare("INSERT INTO habit_logs(habit_id,log_date,status,created_at) VALUES(?,?,?,?) ON CONFLICT(habit_id,log_date) DO UPDATE SET status=excluded.status,created_at=excluded.created_at").run(id, date, status, nowIso());
  const updatedHabit = habitRows(habit.profile_id).find((item) => item.id === id);
  if (status === "done" && [3, 7, 14, 30, 60, 100].includes(updatedHabit.streak)) {
    const evidence = { habitId: id, logDate: date, streak: updatedHabit.streak, skill: "self-regulation", shareWithAi: true };
    if (!db.prepare("SELECT id FROM memories WHERE profile_id=? AND kind='habit' AND json_extract(evidence_json,'$.habitId')=? AND json_extract(evidence_json,'$.logDate')=?").get(habit.profile_id, id, date)) {
      const summary = `微习惯「${habit.title}」保持了${updatedHabit.streak}次连续节奏`;
      const memoryResult = db.prepare("INSERT INTO memories(profile_id,kind,summary,evidence_json,created_at) VALUES(?,?,?,?,?)").run(habit.profile_id, "habit", summary, JSON.stringify(evidence), nowIso());
      evolveHypotheses(habit.profile_id, { id: Number(memoryResult.lastInsertRowid), kind: "habit", summary, evidence, shareWithAi: true });
    }
  }
  if (status === "pending") {
    const memoryIds = db.prepare("SELECT id FROM memories WHERE profile_id=? AND kind='habit' AND json_extract(evidence_json,'$.habitId')=? AND json_extract(evidence_json,'$.logDate')=?").all(habit.profile_id, id, date).map((item) => Number(item.id));
    db.prepare("DELETE FROM memories WHERE profile_id=? AND kind='habit' AND json_extract(evidence_json,'$.habitId')=? AND json_extract(evidence_json,'$.logDate')=?").run(habit.profile_id, id, date);
    removeHypothesisEvidence(habit.profile_id, memoryIds);
    retractStrategyEvidence(habit.profile_id, memoryIds.map((memoryId) => `memory:${memoryId}`));
  }
  recordEvent(user.id, habit.profile_id, status === "done" ? "habit_done" : status === "skip" ? "habit_skipped" : "habit_reopened", { targetMinutes: habit.target_minutes });
  sendJson(response, 200, updatedHabit);
}
function handleDeleteHabit(request, response, url) {
  const user = requireUser(request, response); if (!user) return;
  const id = Number(url.pathname.split("/").pop());
  const habit = ownedHabit(user.id, id);
  if (!habit) return sendJson(response, 404, { error: "习惯不存在" });
  const memoryIds = db.prepare("SELECT id FROM memories WHERE profile_id=? AND kind='habit' AND json_extract(evidence_json,'$.habitId')=?").all(habit.profile_id, id).map((item) => Number(item.id));
  db.prepare("DELETE FROM memories WHERE profile_id=? AND kind='habit' AND json_extract(evidence_json,'$.habitId')=?").run(habit.profile_id, id);
  removeHypothesisEvidence(habit.profile_id, memoryIds);
  retractStrategyEvidence(habit.profile_id, memoryIds.map((memoryId) => `memory:${memoryId}`));
  db.prepare("DELETE FROM habits WHERE id=?").run(id);
  recordEvent(user.id, habit.profile_id, "habit_deleted", {});
  sendJson(response, 200, { ok: true });
}

function focusElapsedSeconds(session, now = Date.now()) {
  const stored = Number(session.elapsed_seconds || 0);
  if (session.status !== "active" || !session.resumed_at) return stored;
  return stored + Math.max(0, Math.floor((now - new Date(session.resumed_at).getTime()) / 1000));
}
function publicFocus(session) {
  if (!session) return null;
  const elapsedSeconds = focusElapsedSeconds(session);
  return { id: session.id, actionId: session.action_id, title: session.title, plannedSeconds: session.planned_seconds, status: session.status, elapsedSeconds, remainingSeconds: Math.max(0, session.planned_seconds - elapsedSeconds), startedAt: session.started_at, endedAt: session.ended_at || "", outcome: session.outcome || "" };
}
function ownedFocus(userId, id) {
  return db.prepare("SELECT focus_sessions.* FROM focus_sessions JOIN profiles ON profiles.id=focus_sessions.profile_id WHERE focus_sessions.id=? AND profiles.user_id=?").get(id, userId);
}
function focusSummary(profileIdValue) {
  const since = new Date(Date.now() - 7 * 86400000).toISOString();
  const rows = db.prepare("SELECT * FROM focus_sessions WHERE profile_id=? AND status IN ('completed','cancelled') AND started_at>=? ORDER BY id DESC LIMIT 30").all(profileIdValue, since);
  const weekSeconds = rows.reduce((sum, row) => sum + Number(row.elapsed_seconds || 0), 0);
  return { weekSeconds, completedSessions: rows.filter((row) => row.status === "completed" && Number(row.elapsed_seconds) >= 30).length, recent: rows.slice(0, 12).map(publicFocus) };
}
function handleGetFocus(request, response, url) {
  const user = requireUser(request, response); if (!user) return;
  const profileIdValue = String(url.searchParams.get("profileId") || "");
  if (!ownedProfile(user.id, profileIdValue)) return sendJson(response, 404, { error: "角色不存在" });
  const active = db.prepare("SELECT * FROM focus_sessions WHERE profile_id=? AND status IN ('active','paused') ORDER BY id DESC LIMIT 1").get(profileIdValue);
  sendJson(response, 200, { active: publicFocus(active), summary: focusSummary(profileIdValue) });
}
async function handleStartFocus(request, response) {
  const user = requireUser(request, response); if (!user) return;
  const body = await readBodyJson(request);
  const profileIdValue = String(body.profileId || "");
  if (!ownedProfile(user.id, profileIdValue)) return sendJson(response, 404, { error: "角色不存在" });
  const existing = db.prepare("SELECT * FROM focus_sessions WHERE profile_id=? AND status IN ('active','paused') ORDER BY id DESC LIMIT 1").get(profileIdValue);
  if (existing) return sendJson(response, 200, { ...publicFocus(existing), resumed: true });
  const actionId = Number(body.actionId || 0) || null;
  let title = String(body.title || "专注一小步").trim().slice(0, 120);
  if (actionId) {
    const action = ownedAction(user.id, actionId);
    if (!action || action.profile_id !== profileIdValue) return sendJson(response, 404, { error: "行动不存在" });
    title = action.title;
  }
  const plannedSeconds = Math.max(60, Math.min(3600, Number(body.plannedMinutes || 10) * 60));
  const now = nowIso();
  const result = db.prepare("INSERT INTO focus_sessions(profile_id,action_id,title,planned_seconds,status,elapsed_seconds,resumed_at,started_at,ended_at,outcome) VALUES(?,?,?,?,?,?,?,?,?,?)").run(profileIdValue, actionId, title, plannedSeconds, "active", 0, now, now, "", "");
  recordEvent(user.id, profileIdValue, "focus_started", { plannedMinutes: plannedSeconds / 60, hasAction: Boolean(actionId) });
  sendJson(response, 201, publicFocus(db.prepare("SELECT * FROM focus_sessions WHERE id=?").get(Number(result.lastInsertRowid))));
}
async function handleUpdateFocus(request, response, url) {
  const user = requireUser(request, response); if (!user) return;
  const id = Number(url.pathname.split("/").pop());
  const session = ownedFocus(user.id, id);
  if (!session) return sendJson(response, 404, { error: "专注会话不存在" });
  const body = await readBodyJson(request);
  const command = String(body.command || "");
  const now = nowIso();
  if (command === "pause" && session.status === "active") {
    db.prepare("UPDATE focus_sessions SET status='paused',elapsed_seconds=?,resumed_at='' WHERE id=?").run(focusElapsedSeconds(session), id);
    recordEvent(user.id, session.profile_id, "focus_paused", {});
  } else if (command === "resume" && session.status === "paused") {
    db.prepare("UPDATE focus_sessions SET status='active',resumed_at=? WHERE id=?").run(now, id);
    recordEvent(user.id, session.profile_id, "focus_resumed", {});
  } else if (["finish", "cancel"].includes(command) && ["active", "paused"].includes(session.status)) {
    const elapsed = focusElapsedSeconds(session);
    const status = command === "finish" ? "completed" : "cancelled";
    const outcome = String(body.outcome || "").slice(0, 40);
    db.prepare("UPDATE focus_sessions SET status=?,elapsed_seconds=?,resumed_at='',ended_at=?,outcome=? WHERE id=?").run(status, elapsed, now, outcome, id);
    recordEvent(user.id, session.profile_id, command === "finish" ? "focus_finished" : "focus_cancelled", { elapsedSeconds: elapsed, outcome });
  } else return sendJson(response, 400, { error: "当前状态不能执行这个操作" });
  const updated = db.prepare("SELECT * FROM focus_sessions WHERE id=?").get(id);
  sendJson(response, 200, { session: publicFocus(updated), summary: focusSummary(session.profile_id) });
}

function currentWeekStart() {
  const today = new Date();
  const day = today.getDay() || 7;
  return serverDateKey(new Date(today.getFullYear(), today.getMonth(), today.getDate() - day + 1));
}
function reviewRows(profileIdValue) {
  return db.prepare("SELECT id,week_start AS weekStart,report_json AS report,feedback,status,created_at AS createdAt,updated_at AS updatedAt FROM weekly_reviews WHERE profile_id=? ORDER BY week_start DESC LIMIT 12").all(profileIdValue)
    .map((item) => ({ ...item, report: JSON.parse(item.report) }));
}
function ownedReview(userId, id) {
  return db.prepare("SELECT weekly_reviews.* FROM weekly_reviews JOIN profiles ON profiles.id=weekly_reviews.profile_id WHERE weekly_reviews.id=? AND profiles.user_id=?").get(id, userId);
}
function handleListReviews(request, response, url) {
  const user = requireUser(request, response); if (!user) return;
  const profileIdValue = String(url.searchParams.get("profileId") || "");
  if (!ownedProfile(user.id, profileIdValue)) return sendJson(response, 404, { error: "角色不存在" });
  sendJson(response, 200, { currentWeek: currentWeekStart(), reviews: reviewRows(profileIdValue) });
}
function reviewEvidence(profileIdValue) {
  const weekStart = currentWeekStart();
  const hypotheses = hypothesisRows(profileIdValue).filter((item) => item.status === "active").slice(0, 8).map((item) => ({ title: item.title, confidence: item.confidence, evidenceCount: item.evidenceCount }));
  const journals = journalRows(profileIdValue).filter((entry) => entry.shareWithAi && serverDateKey(new Date(entry.createdAt)) >= weekStart).slice(0, 8).map((entry) => ({ content: entry.content.slice(0, 500), tags: entry.tags, createdAt: entry.createdAt }));
  const actions = actionRows(profileIdValue).filter((item) => serverDateKey(new Date(item.updatedAt)) >= weekStart).slice(0, 30).map((item) => ({ title: item.title, status: item.status, estimateMinutes: item.estimateMinutes, source: item.source }));
  const habits = habitRows(profileIdValue).map((item) => ({ title: item.title, streak: item.streak, totalDone: item.totalDone, todayStatus: item.todayStatus, targetMinutes: item.targetMinutes }));
  const focus = focusSummary(profileIdValue);
  const ideas = ideaRows(profileIdValue).filter((item) => serverDateKey(new Date(item.updatedAt)) >= weekStart).slice(0, 12).map((item) => ({ title: item.title, status: item.status, nextStep: item.nextStep, skill: item.skill }));
  const feedback = taskFeedbackRows(profileIdValue).filter((entry) => entry.feedbackDate >= weekStart).slice(0, 12);
  const artifacts = artifactRows(profileIdValue).filter((item) => item.shareWithAi && serverDateKey(new Date(item.createdAt)) >= weekStart).slice(0, 12).map(({ title, skill, type, caption, taskKey, createdAt }) => ({ title, skill: skillIdToName[skill] || skill, type: reviewTerm(type), caption, taskKey, createdAt }));
  const strategies = strategyRows(profileIdValue).filter((item) => item.aiContext && item.status === "active").slice(0, 6).map(({ statement, whenToUse, confidence, feedback, evidence }) => ({ statement, whenToUse, confidence, feedback, evidenceCount: evidence.length }));
  const goals = goalRows(profileIdValue).filter((item) => item.status !== "done").slice(0, 3).map(({ id, title, why, successSignal, skill, progress, evidenceCount, activeSteps }) => ({ id, title, why, successSignal, skill: skillIdToName[skill] || skill, progress, evidenceCount, activeSteps }));
  const calibration = feedbackCalibration(feedback);
  const decisionCalibration = actionDecisionCalibration(profileIdValue);
  const recentDecisions = db.prepare("SELECT reason,outcome,created_at AS createdAt FROM action_decisions WHERE profile_id=? AND created_at>=? ORDER BY id DESC LIMIT 12").all(profileIdValue, `${weekStart}T00:00:00.000Z`).map((item) => ({ reason: reviewTerm(item.reason), outcome: reviewTerm(item.outcome), createdAt: item.createdAt }));
  return { weekStart, actions, habits, focus: { weekMinutes: Math.round(focus.weekSeconds / 60), completedSessions: focus.completedSessions }, goals, journals, hypotheses, ideas, artifacts, strategies, taskDecisions: { calibration: { ...decisionCalibration, activeSignals: decisionCalibration.activeSignals.map(reviewTerm) }, recent: recentDecisions }, taskExperience: { calibration: { sampleSize: calibration.sampleSize, challengeTrend: { observe: "继续观察", shrink: "下一步缩小", steady: "挑战度较合适", stretch: "增加一点挑战" }[calibration.pace], preferredSupport: reviewTerm(calibration.preferredSupport), preferredModes: calibration.preferredModes.map(reviewTerm), preferredMotivators: calibration.preferredMotivators.map(reviewTerm), motivationEvidence: calibration.motivationEvidence, rule: calibration.rule }, recent: feedback.map(({ taskTitle, skill, mode, difficulty, enjoyment, support, motivation, feedbackDate }) => ({ taskTitle, skill: skillIdToName[skill] || skill, mode: reviewTerm(mode), difficulty: reviewTerm(difficulty), enjoyment: reviewTerm(enjoyment), support: reviewTerm(support), motivation: reviewTerm(motivation), feedbackDate })) } };
}
const reviewTerms = { "self-regulation": "自我调节", metacognition: "会学会想", communication: "表达沟通", "data-reasoning": "数据推理", "ai-literacy": "AI协作", creation: "创造项目", "ethics-collaboration": "判断协作", wellbeing: "身心底座", too_easy: "太简单", just_right: "刚刚好", too_hard: "太难", stuck: "卡住了", fun: "有趣", neutral: "一般", boring: "无聊", none: "自己尝试", hint: "一个提示", steps: "拆成小步", together: "一起完成", autonomy: "可以自己选择", progress: "看见一点进步", curiosity: "想知道结果", making: "做出一个东西", connection: "和别人连接或分享", purpose: "觉得这件事有用", unknown: "还不确定", no_energy: "当时没力气", no_time: "当时时间不够", unclear: "当时不知道怎么做", not_important: "当时觉得不重要", shrink: "缩成小版本", tomorrow: "安排到明天", someday: "放到以后", drop: "决定不做", organize: "整理", design: "设计", experiment: "实验", practice: "练习", photo: "照片", audio: "录音", text: "文字", link: "链接", done: "完成", skip: "暂停" };
function reviewTerm(value) { return reviewTerms[String(value || "")] || String(value || ""); }
function childFacingReviewText(value) {
  return Object.entries(reviewTerms).sort((left, right) => right[0].length - left[0].length).reduce((text, [term, label]) => text.replaceAll(term, label), String(value || ""));
}
function fallbackReview(evidence) {
  const completed = evidence.actions.filter((item) => item.status === "done");
  const activeIdea = evidence.ideas.find((item) => ["active", "incubating"].includes(item.status));
  const strongestHabit = [...evidence.habits].sort((left, right) => right.streak - left.streak)[0];
  return {
    headline: "这一周，我在把想法变成行动",
    wins: [completed[0] ? `完成了「${completed[0].title}」` : "开始记录自己的行动", strongestHabit?.streak ? `「${strongestHabit.title}」保持了${strongestHabit.streak}次节奏` : "尝试找到适合自己的节奏", evidence.focus.weekMinutes ? `真实专注了约${evidence.focus.weekMinutes}分钟` : "开始观察自己的专注状态"],
    patterns: [{ observation: "小步骤比大目标更容易开始", evidence: "来自行动、习惯和专注记录", confidence: "线索" }],
    nextFocus: { title: activeIdea?.title || "完成一个看得见的小版本", why: "延续已经开始的方向，比同时开启很多新任务更轻松。", tinyExperiment: activeIdea?.nextStep || "选一件事，只做10分钟并留下结果" },
    question: "这里面哪一点最像你这一周的真实感受？",
    gentleReset: "如果这周有些事没完成，不需要补做全部，只选一个最想继续的。"
  };
}
async function handleGenerateReview(request, response) {
  const user = requireUser(request, response); if (!user) return;
  const body = await readBodyJson(request);
  const profileIdValue = String(body.profileId || "");
  const profile = ownedProfile(user.id, profileIdValue);
  if (!profile) return sendJson(response, 404, { error: "角色不存在" });
  const evidence = reviewEvidence(profileIdValue);
  let report = fallbackReview(evidence);
  let provider = "local";
  if (apiKey) {
    try {
      const apiResponse = await fetch(`${baseUrl.replace(/\/$/, "")}/chat/completions`, { method: "POST", signal: AbortSignal.timeout(60000), headers: { authorization: `Bearer ${apiKey}`, "content-type": "application/json" }, body: JSON.stringify({ model, temperature: 0.48, max_tokens: 900, response_format: { type: "json_object" }, messages: [
        { role: "system", content: "你是6-12岁孩子的每周成长回顾伙伴。只根据提供的行为证据总结，不诊断、不比较、不贴标签。日记是孩子第一人称表达，但要温和转述，不直接暴露隐私原文。区分事实、观察和线索。所有给孩子看的文字必须使用自然中文，禁止暴露英文枚举、技能ID、数据库字段或内部代码。只返回JSON。" },
        { role: "user", content: JSON.stringify({ child: { name: profile.name, age: profile.age }, evidence, output: { headline: "一句本周标题", wins: ["3条有具体证据的收获"], patterns: [{ observation: "可修正观察", evidence: "证据来源", confidence: "线索/正在形成/证据较强" }], nextFocus: { title: "下周一个重点", why: "原因", tinyExperiment: "10分钟内小实验" }, question: "请孩子确认的问题", gentleReset: "未完成时的温和重启建议" } }) }
      ] }) });
      if (!apiResponse.ok) throw new Error(`review ${apiResponse.status}`);
      const json = parseJsonContent((await apiResponse.json()).choices?.[0]?.message?.content || "{}");
      report = {
        headline: String(json.headline || report.headline).slice(0, 100),
        wins: (Array.isArray(json.wins) ? json.wins : report.wins).map(String).slice(0, 3),
        patterns: (Array.isArray(json.patterns) ? json.patterns : report.patterns).slice(0, 3).map((item) => ({ observation: String(item.observation || "").slice(0, 140), evidence: String(item.evidence || "").slice(0, 180), confidence: ["线索", "正在形成", "证据较强"].includes(item.confidence) ? item.confidence : "线索" })),
        nextFocus: { title: String(json.nextFocus?.title || report.nextFocus.title).slice(0, 100), why: String(json.nextFocus?.why || report.nextFocus.why).slice(0, 180), tinyExperiment: String(json.nextFocus?.tinyExperiment || report.nextFocus.tinyExperiment).slice(0, 180) },
        question: String(json.question || report.question).slice(0, 120), gentleReset: String(json.gentleReset || report.gentleReset).slice(0, 180)
      };
      report = { ...report, headline: childFacingReviewText(report.headline), wins: report.wins.map(childFacingReviewText), patterns: report.patterns.map((item) => ({ ...item, observation: childFacingReviewText(item.observation), evidence: childFacingReviewText(item.evidence) })), nextFocus: { ...report.nextFocus, title: childFacingReviewText(report.nextFocus.title), why: childFacingReviewText(report.nextFocus.why), tinyExperiment: childFacingReviewText(report.nextFocus.tinyExperiment) }, question: childFacingReviewText(report.question), gentleReset: childFacingReviewText(report.gentleReset) };
      provider = "siliconflow";
    } catch (error) { console.warn("Weekly review used local fallback:", error.message); }
  }
  const now = nowIso();
  db.prepare("INSERT INTO weekly_reviews(profile_id,week_start,report_json,feedback,status,created_at,updated_at) VALUES(?,?,?,?,?,?,?) ON CONFLICT(profile_id,week_start) DO UPDATE SET report_json=excluded.report_json,feedback='',status='draft',updated_at=excluded.updated_at").run(profileIdValue, evidence.weekStart, JSON.stringify({ ...report, provider, evidenceSummary: { actions: evidence.actions.length, goals: evidence.goals.length, taskDecisions: evidence.taskDecisions.recent.length, journals: evidence.journals.length, ideas: evidence.ideas.length, artifacts: evidence.artifacts.length, strategies: evidence.strategies.length, taskFeedback: evidence.taskExperience.recent.length, focusMinutes: evidence.focus.weekMinutes } }), "", "draft", now, now);
  recordEvent(user.id, profileIdValue, "review_generated", { provider, actionCount: evidence.actions.length, journalCount: evidence.journals.length });
  sendJson(response, 200, reviewRows(profileIdValue)[0]);
}
async function handleReviewFeedback(request, response, url) {
  const user = requireUser(request, response); if (!user) return;
  const id = Number(url.pathname.split("/").pop());
  const review = ownedReview(user.id, id);
  if (!review) return sendJson(response, 404, { error: "周报不存在" });
  const body = await readBodyJson(request);
  const feedback = ["accurate", "not_me", "try_focus"].includes(body.feedback) ? body.feedback : "";
  if (!feedback) return sendJson(response, 400, { error: "未知反馈" });
  const status = feedback === "not_me" ? "challenged" : "confirmed";
  db.prepare("UPDATE weekly_reviews SET feedback=?,status=?,updated_at=? WHERE id=?").run(feedback, status, nowIso(), id);
  recordEvent(user.id, review.profile_id, feedback === "try_focus" ? "review_focus_adopted" : "review_feedback", { feedback });
  sendJson(response, 200, reviewRows(review.profile_id).find((item) => item.id === id));
}
function publicFamilyBrief(row) {
  if (!row) return null;
  return { id: Number(row.id), weekStart: row.week_start, report: JSON.parse(row.report_json), status: row.status, provider: row.provider, createdAt: row.created_at, updatedAt: row.updated_at };
}
function currentFamilyBrief(profileIdValue) {
  return publicFamilyBrief(db.prepare("SELECT * FROM family_briefs WHERE profile_id=? AND week_start=?").get(profileIdValue, currentWeekStart()));
}
function handleGetFamilyBrief(request, response, url) {
  const user = requireUser(request, response); if (!user) return;
  const profileIdValue = String(url.searchParams.get("profileId") || "");
  if (!ownedProfile(user.id, profileIdValue)) return sendJson(response, 404, { error: "角色不存在" });
  sendJson(response, 200, { familyBrief: currentFamilyBrief(profileIdValue) });
}
function familyBriefEvidence(profileIdValue) {
  const evidence = reviewEvidence(profileIdValue);
  return {
    weekStart: evidence.weekStart,
    actions: evidence.actions.map(({ title, status, estimateMinutes, source }) => ({ title, status, estimateMinutes, source })),
    habits: evidence.habits.map(({ title, streak, totalDone, targetMinutes }) => ({ title, streak, totalDone, targetMinutes })),
    focus: evidence.focus,
    goals: evidence.goals.map(({ title, progress, evidenceCount, activeSteps }) => ({ title, progress, evidenceCount, activeSteps })),
    ideas: evidence.ideas.map(({ title, status, skill }) => ({ title, status, skill })),
    artifacts: evidence.artifacts.map(({ title, skill, type }) => ({ title, skill, type })),
    strategies: evidence.strategies.map(({ statement, whenToUse, confidence, feedback, evidenceCount }) => ({ statement, whenToUse, confidence, feedback, evidenceCount })),
    taskExperience: { calibration: evidence.taskExperience.calibration, recent: evidence.taskExperience.recent.map(({ taskTitle, skill, mode, difficulty, enjoyment, support, motivation, feedbackDate }) => ({ taskTitle, skill, mode, difficulty, enjoyment, support, motivation, feedbackDate })) },
    privacy: { journalTextIncluded: false, selfCoachTextIncluded: false, privateArtifactsIncluded: false }
  };
}
function fallbackFamilyBrief(profile, evidence) {
  const completed = evidence.actions.filter((item) => item.status === "done");
  const habit = [...evidence.habits].sort((left, right) => right.streak - left.streak)[0];
  const strategy = evidence.strategies[0];
  return {
    headline: `${profile.name}这周正在练习自己做决定`,
    visibleProgress: completed[0] ? `独立推进了「${completed[0].title}」${evidence.artifacts[0] ? `，并留下了作品「${evidence.artifacts[0].title}」` : ""}` : habit?.streak ? `「${habit.title}」保持了${habit.streak}次自己的节奏` : "开始记录自己的行动、状态和选择",
    childStrategy: strategy?.statement || "事情有点大时，先给一个清楚的小步骤更容易开始。",
    lessNagging: strategy ? `需要开始时，可以先问“你想用自己的哪个办法？”，给孩子一点选择空间。` : "一次只确认眼前的一小步，完成后先问感受，不急着追加下一项。",
    conversationStarter: "这周哪一次是你自己决定怎么做的？",
    boundary: "这份简报只使用行动、习惯、专注、作品标题和孩子确认的方法，不包含日记或私人问答。"
  };
}
async function handleGenerateFamilyBrief(request, response) {
  const user = requireUser(request, response); if (!user) return;
  const body = await readBodyJson(request);
  const profileIdValue = String(body.profileId || "");
  const profile = ownedProfile(user.id, profileIdValue);
  if (!profile) return sendJson(response, 404, { error: "角色不存在" });
  const evidence = familyBriefEvidence(profileIdValue);
  let report = fallbackFamilyBrief(profile, evidence);
  let provider = "local";
  if (apiKey) {
    try {
      const apiResponse = await fetch(`${baseUrl.replace(/\/$/, "")}/chat/completions`, { method: "POST", signal: AbortSignal.timeout(12000), headers: { authorization: `Bearer ${apiKey}`, "content-type": "application/json" }, body: JSON.stringify({ model, temperature: 0.38, max_tokens: 650, response_format: { type: "json_object" }, messages: [
        { role: "system", content: "你为6-12岁孩子生成一份由孩子决定是否分享给家长的成长简报。只能使用提供的结构化行为证据。不得推测人格、天赋、诊断或比较；不得要求家长监控、惩罚或加任务。目标是帮助家长少催促、多看见自主性。绝不提及或虚构日记、私人感悟、问答原文。只返回JSON。" },
        { role: "user", content: JSON.stringify({ child: { name: profile.name, age: profile.age }, evidence, output: { headline: "温和短标题", visibleProgress: "一条有事实依据的可见进展", childStrategy: "孩子正在尝试的可修正方法", lessNagging: "家长本周只做的一条少催促建议", conversationStarter: "不带考问感的开放问题", boundary: "明确未使用日记和私人问答" } }) }
      ] }) });
      if (!apiResponse.ok) throw new Error(`family brief ${apiResponse.status}`);
      const json = parseJsonContent((await apiResponse.json()).choices?.[0]?.message?.content || "{}");
      report = { headline: String(json.headline || report.headline).slice(0, 100), visibleProgress: String(json.visibleProgress || report.visibleProgress).slice(0, 220), childStrategy: String(json.childStrategy || report.childStrategy).slice(0, 200), lessNagging: String(json.lessNagging || report.lessNagging).slice(0, 220), conversationStarter: String(json.conversationStarter || report.conversationStarter).slice(0, 140), boundary: "这份简报只使用行动、习惯、专注、作品标题和孩子确认的方法，不包含日记或私人问答。" };
      provider = "siliconflow";
    } catch (error) { console.warn("Family brief used local fallback:", error.message); }
  }
  const now = nowIso();
  db.prepare("INSERT INTO family_briefs(profile_id,week_start,report_json,status,provider,created_at,updated_at) VALUES(?,?,?,?,?,?,?) ON CONFLICT(profile_id,week_start) DO UPDATE SET report_json=excluded.report_json,status='draft',provider=excluded.provider,updated_at=excluded.updated_at").run(profileIdValue, evidence.weekStart, JSON.stringify(report), "draft", provider, now, now);
  recordEvent(user.id, profileIdValue, "review_generated", { familyBrief: true, provider, journalTextIncluded: false });
  sendJson(response, 200, currentFamilyBrief(profileIdValue));
}
async function handleUpdateFamilyBrief(request, response, url) {
  const user = requireUser(request, response); if (!user) return;
  const id = Number(url.pathname.split("/").pop());
  const row = db.prepare("SELECT family_briefs.* FROM family_briefs JOIN profiles ON profiles.id=family_briefs.profile_id WHERE family_briefs.id=? AND profiles.user_id=?").get(id, user.id);
  if (!row) return sendJson(response, 404, { error: "家庭简报不存在" });
  const body = await readBodyJson(request);
  const status = body.status === "shared" ? "shared" : body.status === "draft" ? "draft" : "";
  if (!status) return sendJson(response, 400, { error: "未知分享状态" });
  db.prepare("UPDATE family_briefs SET status=?,updated_at=? WHERE id=?").run(status, nowIso(), id);
  recordEvent(user.id, row.profile_id, "review_feedback", { familyBrief: true, status });
  sendJson(response, 200, currentFamilyBrief(row.profile_id));
}
function handleDeleteFamilyBrief(request, response, url) {
  const user = requireUser(request, response); if (!user) return;
  const id = Number(url.pathname.split("/").pop());
  const row = db.prepare("SELECT family_briefs.* FROM family_briefs JOIN profiles ON profiles.id=family_briefs.profile_id WHERE family_briefs.id=? AND profiles.user_id=?").get(id, user.id);
  if (!row) return sendJson(response, 404, { error: "家庭简报不存在" });
  db.prepare("DELETE FROM family_briefs WHERE id=?").run(id);
  sendJson(response, 200, { ok: true });
}
function publicTaskFeedback(row) {
  return { id: Number(row.id), taskKey: row.task_key, taskTitle: row.task_title, skill: row.skill, mode: row.mode, difficulty: row.difficulty, enjoyment: row.enjoyment, support: row.support, motivation: row.motivation || "unknown", note: row.note, feedbackDate: row.feedback_date, createdAt: row.created_at, updatedAt: row.updated_at };
}
function taskFeedbackRows(profileIdValue, limit = 40) {
  return db.prepare("SELECT * FROM task_feedback WHERE profile_id=? ORDER BY updated_at DESC,id DESC LIMIT ?").all(profileIdValue, limit).map(publicTaskFeedback);
}
function feedbackCalibration(entries) {
  const recent = entries.slice(0, 20);
  const count = (field, value) => recent.filter((entry) => entry[field] === value).length;
  const tooEasy = count("difficulty", "too_easy");
  const justRight = count("difficulty", "just_right");
  const tooHard = count("difficulty", "too_hard") + count("difficulty", "stuck");
  const supportCounts = Object.fromEntries(["none", "hint", "steps", "together"].map((value) => [value, count("support", value)]));
  const modeStats = new Map();
  for (const entry of recent) {
    if (!entry.mode) continue;
    const stats = modeStats.get(entry.mode) || { fun: 0, boring: 0, total: 0 };
    stats.total += 1;
    if (entry.enjoyment === "fun") stats.fun += 1;
    if (entry.enjoyment === "boring") stats.boring += 1;
    modeStats.set(entry.mode, stats);
  }
  const preferredModes = [...modeStats.entries()].filter(([, stats]) => stats.fun > stats.boring).sort((a, b) => b[1].fun - a[1].fun).slice(0, 3).map(([mode]) => mode);
  const avoidModes = [...modeStats.entries()].filter(([, stats]) => stats.boring > stats.fun && stats.total >= 2).sort((a, b) => b[1].boring - a[1].boring).slice(0, 3).map(([mode]) => mode);
  const maxSupportCount = Math.max(0, ...Object.values(supportCounts));
  const preferredSupport = maxSupportCount ? recent.find((entry) => supportCounts[entry.support] === maxSupportCount)?.support : "unknown";
  const motivationValues = ["autonomy", "progress", "curiosity", "making", "connection", "purpose"];
  const motivationCounts = Object.fromEntries(motivationValues.map((value) => [value, count("motivation", value)]));
  const preferredMotivators = Object.entries(motivationCounts).filter(([, total]) => total >= 2).sort((left, right) => right[1] - left[1]).slice(0, 2).map(([value]) => value);
  return { sampleSize: recent.length, difficulty: { tooEasy, justRight, tooHard }, pace: recent.length < 2 ? "observe" : tooHard >= tooEasy + 2 ? "shrink" : tooEasy >= tooHard + 2 ? "stretch" : "steady", preferredSupport: preferredSupport || "unknown", preferredModes, avoidModes, motivationCounts, preferredMotivators, motivationEvidence: Object.values(motivationCounts).reduce((sum, value) => sum + value, 0), rule: "反馈是当下体验，不是能力标签；少量样本只能探索，不能定论；动力线索至少重复两次才参与个性化，且可随情境改变。" };
}
function handleListTaskFeedback(request, response, url) {
  const user = requireUser(request, response); if (!user) return;
  const profileIdValue = String(url.searchParams.get("profileId") || "");
  if (!ownedProfile(user.id, profileIdValue)) return sendJson(response, 404, { error: "角色不存在" });
  const entries = taskFeedbackRows(profileIdValue);
  sendJson(response, 200, { entries, calibration: feedbackCalibration(entries) });
}
async function handleCreateTaskFeedback(request, response) {
  const user = requireUser(request, response); if (!user) return;
  const body = await readBodyJson(request);
  const profileIdValue = String(body.profileId || "");
  if (!ownedProfile(user.id, profileIdValue)) return sendJson(response, 404, { error: "角色不存在" });
  const taskKey = String(body.taskKey || "").trim().slice(0, 120);
  const taskTitle = String(body.taskTitle || "").trim().slice(0, 120);
  if (!taskKey || !taskTitle) return sendJson(response, 400, { error: "请选择刚完成的任务" });
  const difficulty = ["too_easy", "just_right", "too_hard", "stuck"].includes(body.difficulty) ? body.difficulty : "just_right";
  const enjoyment = ["fun", "neutral", "boring"].includes(body.enjoyment) ? body.enjoyment : "neutral";
  const support = ["none", "hint", "steps", "together"].includes(body.support) ? body.support : "none";
  const motivation = ["autonomy", "progress", "curiosity", "making", "connection", "purpose", "unknown"].includes(body.motivation) ? body.motivation : "unknown";
  const skill = normalizeSkillId(body.skill || "metacognition");
  const mode = String(body.mode || "practice").trim().slice(0, 30);
  const note = String(body.note || "").trim().slice(0, 500);
  const feedbackDate = /^\d{4}-\d{2}-\d{2}$/.test(body.feedbackDate) ? body.feedbackDate : nowIso().slice(0, 10);
  const now = nowIso();
  db.prepare("INSERT INTO task_feedback(profile_id,task_key,task_title,skill,mode,difficulty,enjoyment,support,motivation,note,feedback_date,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(profile_id,task_key,feedback_date) DO UPDATE SET task_title=excluded.task_title,skill=excluded.skill,mode=excluded.mode,difficulty=excluded.difficulty,enjoyment=excluded.enjoyment,support=excluded.support,motivation=excluded.motivation,note=excluded.note,updated_at=excluded.updated_at")
    .run(profileIdValue, taskKey, taskTitle, skill, mode, difficulty, enjoyment, support, motivation, note, feedbackDate, now, now);
  recordEvent(user.id, profileIdValue, "task_feedback_saved", { difficulty, enjoyment, support, motivation, skill, mode });
  const entries = taskFeedbackRows(profileIdValue);
  sendJson(response, 201, { entry: entries.find((entry) => entry.taskKey === taskKey && entry.feedbackDate === feedbackDate), calibration: feedbackCalibration(entries) });
}
function publicArtifact(row) {
  return { id: Number(row.id), taskKey: row.task_key, title: row.title, skill: row.skill, type: row.artifact_type, caption: row.caption, content: row.content_text, linkUrl: row.link_url, mediaMime: row.media_mime, hasMedia: Boolean(row.media_data), shareWithAi: Boolean(row.ai_context), mediaUrl: row.media_data ? `/api/artifacts/${row.id}/media` : "", versionNumber: Number(row.versionNumber || 1), versionCount: Number(row.versionCount || 1), createdAt: row.created_at, updatedAt: row.updated_at };
}
function artifactRows(profileIdValue, limit = 60) {
  const rows = db.prepare("SELECT * FROM artifacts WHERE profile_id=? ORDER BY created_at ASC,id ASC LIMIT ?").all(profileIdValue, limit);
  const groupKey = (row) => row.task_key === "self" ? `self:${String(row.title).trim().toLowerCase()}` : row.task_key;
  const totals = rows.reduce((map, row) => map.set(groupKey(row), (map.get(groupKey(row)) || 0) + 1), new Map());
  const seen = new Map();
  return rows.map((row) => { const key = groupKey(row); const versionNumber = (seen.get(key) || 0) + 1; seen.set(key, versionNumber); return publicArtifact({ ...row, versionNumber, versionCount: totals.get(key) }); }).reverse();
}
function ownedArtifact(userId, id) {
  return db.prepare("SELECT artifacts.* FROM artifacts JOIN profiles ON profiles.id=artifacts.profile_id WHERE artifacts.id=? AND profiles.user_id=?").get(id, userId);
}
function artifactSummary(artifact) {
  const detail = String(artifact.caption || artifact.content_text || "").replace(/\s+/g, " ").slice(0, 160);
  return `作品证据：「${artifact.title}」${detail ? `。${detail}` : ""}`;
}
function createArtifactMemory(profileIdValue, artifact) {
  const evidence = { artifactId: Number(artifact.id), skill: artifact.skill, artifactType: artifact.artifact_type, taskKey: artifact.task_key, shareWithAi: true };
  const result = db.prepare("INSERT INTO memories(profile_id,kind,summary,evidence_json,created_at) VALUES(?,?,?,?,?)").run(profileIdValue, "artifact", artifactSummary(artifact), JSON.stringify(evidence), nowIso());
  evolveHypotheses(profileIdValue, { id: Number(result.lastInsertRowid), kind: "artifact", summary: artifactSummary(artifact), evidence, shareWithAi: true });
}
function retractArtifactMemory(profileIdValue, artifactId) {
  const memoryIds = db.prepare("SELECT id FROM memories WHERE profile_id=? AND kind='artifact' AND json_extract(evidence_json,'$.artifactId')=?").all(profileIdValue, artifactId).map((item) => Number(item.id));
  db.prepare("DELETE FROM memories WHERE profile_id=? AND kind='artifact' AND json_extract(evidence_json,'$.artifactId')=?").run(profileIdValue, artifactId);
  removeHypothesisEvidence(profileIdValue, memoryIds);
}
function handleListArtifacts(request, response, url) {
  const user = requireUser(request, response); if (!user) return;
  const profileIdValue = String(url.searchParams.get("profileId") || "");
  if (!ownedProfile(user.id, profileIdValue)) return sendJson(response, 404, { error: "角色不存在" });
  sendJson(response, 200, { artifacts: artifactRows(profileIdValue) });
}
async function handleCreateArtifact(request, response) {
  const user = requireUser(request, response); if (!user) return;
  if (Number(request.headers["content-length"] || 0) > 3000000) return sendJson(response, 413, { error: "作品文件不能超过2MB" });
  const body = await readBodyJson(request);
  const profileIdValue = String(body.profileId || "");
  if (!ownedProfile(user.id, profileIdValue)) return sendJson(response, 404, { error: "角色不存在" });
  const type = ["text", "photo", "audio", "link"].includes(body.type) ? body.type : "text";
  const title = String(body.title || "").trim().slice(0, 100);
  const taskKey = String(body.taskKey || "self").trim().slice(0, 120);
  const skill = normalizeSkillId(body.skill || "creation");
  const caption = String(body.caption || "").trim().slice(0, 500);
  const contentText = String(body.content || "").trim().slice(0, 4000);
  const shareWithAi = body.shareWithAi !== false;
  if (title.length < 2) return sendJson(response, 400, { error: "给作品取一个名字" });
  let linkUrl = "";
  let mediaMime = "";
  let mediaData = "";
  if (type === "text" && contentText.length < 2) return sendJson(response, 400, { error: "至少写下一句话" });
  if (type === "link") {
    try { const parsed = new URL(String(body.linkUrl || "")); if (!["http:", "https:"].includes(parsed.protocol)) throw new Error("protocol"); linkUrl = parsed.toString().slice(0, 1000); }
    catch { return sendJson(response, 400, { error: "请输入有效的 http 或 https 链接" }); }
  }
  if (["photo", "audio"].includes(type)) {
    const match = String(body.mediaData || "").match(/^data:([a-z0-9.+-]+\/[a-z0-9.+-]+);base64,([A-Za-z0-9+/=]+)$/i);
    const allowed = type === "photo" ? new Set(["image/jpeg", "image/png", "image/webp"]) : new Set(["audio/mpeg", "audio/mp4", "audio/wav", "audio/ogg", "audio/webm"]);
    if (!match || !allowed.has(match[1].toLowerCase())) return sendJson(response, 400, { error: type === "photo" ? "只支持 JPG、PNG、WebP 图片" : "只支持 MP3、M4A、WAV、OGG、WebM 录音" });
    const bytes = Buffer.from(match[2], "base64");
    if (!bytes.length || bytes.length > 2 * 1024 * 1024) return sendJson(response, 413, { error: "作品文件不能超过2MB" });
    mediaMime = match[1].toLowerCase();
    mediaData = match[2];
  }
  const now = nowIso();
  const result = db.prepare("INSERT INTO artifacts(profile_id,task_key,title,skill,artifact_type,caption,content_text,link_url,media_mime,media_data,ai_context,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)").run(profileIdValue, taskKey, title, skill, type, caption, contentText, linkUrl, mediaMime, mediaData, shareWithAi ? 1 : 0, now, now);
  const row = db.prepare("SELECT * FROM artifacts WHERE id=?").get(Number(result.lastInsertRowid));
  if (shareWithAi) createArtifactMemory(profileIdValue, row);
  recordEvent(user.id, profileIdValue, "artifact_saved", { type, skill, shareWithAi, hasTask: taskKey !== "self" });
  sendJson(response, 201, artifactRows(profileIdValue).find((item) => item.id === Number(result.lastInsertRowid)));
}
function handleArtifactMedia(request, response, url) {
  const user = requireUser(request, response); if (!user) return;
  const id = Number(url.pathname.split("/")[3]);
  const row = ownedArtifact(user.id, id);
  if (!row || !row.media_data) return sendJson(response, 404, { error: "作品媒体不存在" });
  response.writeHead(200, { "content-type": row.media_mime, "cache-control": "private, no-store", "x-content-type-options": "nosniff" });
  response.end(Buffer.from(row.media_data, "base64"));
}
async function handleUpdateArtifact(request, response, url) {
  const user = requireUser(request, response); if (!user) return;
  const id = Number(url.pathname.split("/").pop());
  const row = ownedArtifact(user.id, id);
  if (!row) return sendJson(response, 404, { error: "作品不存在" });
  const body = await readBodyJson(request);
  const shareWithAi = body.shareWithAi === true;
  if (shareWithAi !== Boolean(row.ai_context)) {
    db.prepare("UPDATE artifacts SET ai_context=?,updated_at=? WHERE id=?").run(shareWithAi ? 1 : 0, nowIso(), id);
    if (shareWithAi) createArtifactMemory(row.profile_id, { ...row, ai_context: 1 }); else { retractArtifactMemory(row.profile_id, id); retractStrategyEvidence(row.profile_id, [`artifact:${id}`]); }
    recordEvent(user.id, row.profile_id, "artifact_privacy_changed", { shareWithAi, type: row.artifact_type });
  }
  sendJson(response, 200, publicArtifact(db.prepare("SELECT * FROM artifacts WHERE id=?").get(id)));
}
function handleDeleteArtifact(request, response, url) {
  const user = requireUser(request, response); if (!user) return;
  const id = Number(url.pathname.split("/").pop());
  const row = ownedArtifact(user.id, id);
  if (!row) return sendJson(response, 404, { error: "作品不存在" });
  retractArtifactMemory(row.profile_id, id);
  retractStrategyEvidence(row.profile_id, [`artifact:${id}`]);
  db.prepare("DELETE FROM artifacts WHERE id=?").run(id);
  recordEvent(user.id, row.profile_id, "artifact_deleted", { type: row.artifact_type, skill: row.skill });
  sendJson(response, 200, { ok: true });
}
function publicDailyPlan(row) {
  if (!row) return null;
  return { id: Number(row.id), date: row.plan_date, checkin: JSON.parse(row.checkin_json), plan: JSON.parse(row.plan_json), excluded: JSON.parse(row.excluded_json), status: row.status, feedback: row.feedback, createdAt: row.created_at, updatedAt: row.updated_at };
}
function todayDailyPlan(profileIdValue) {
  return publicDailyPlan(db.prepare("SELECT * FROM daily_plans WHERE profile_id=? AND plan_date=?").get(profileIdValue, serverDateKey()));
}
function dailyPlanFeedbackCalibration(profileIdValue) {
  const rows = db.prepare("SELECT source_type AS sourceType,reason,created_at AS createdAt FROM daily_plan_feedback WHERE profile_id=? ORDER BY id DESC LIMIT 20").all(profileIdValue);
  const reasons = ["too_big", "not_interesting", "unclear", "not_now"];
  const reasonCounts = Object.fromEntries(reasons.map((reason) => [reason, rows.filter((row) => row.reason === reason).length]));
  const avoidedSourceCounts = {};
  for (const row of rows.filter((item) => item.reason === "not_interesting")) avoidedSourceCounts[row.sourceType] = (avoidedSourceCounts[row.sourceType] || 0) + 1;
  const avoidedSourceTypes = Object.entries(avoidedSourceCounts).filter(([, count]) => count >= 2).sort((a, b) => b[1] - a[1]).map(([sourceType]) => sourceType);
  return { sampleSize: rows.length, reasonCounts, activeSignals: reasons.filter((reason) => reasonCounts[reason] >= 2), preferTiny: reasonCounts.too_big >= 2, preferClear: reasonCounts.unclear >= 2, avoidedSourceTypes, rule: "同一换选原因至少重复两次才调整以后推荐；单次反馈只影响当次，当前偏好不是固定性格。" };
}
function dailyPlanFeedbackRows(profileIdValue) {
  return db.prepare("SELECT id,source_ref AS sourceRef,source_type AS sourceType,reason,created_at AS createdAt FROM daily_plan_feedback WHERE profile_id=? ORDER BY id DESC LIMIT 30").all(profileIdValue);
}
function handleListDailyPlanFeedback(request, response, url) {
  const user = requireUser(request, response); if (!user) return;
  const profileIdValue = String(url.searchParams.get("profileId") || "");
  if (!ownedProfile(user.id, profileIdValue)) return sendJson(response, 404, { error: "角色不存在" });
  sendJson(response, 200, { feedback: dailyPlanFeedbackRows(profileIdValue), calibration: dailyPlanFeedbackCalibration(profileIdValue) });
}
function handleDeleteDailyPlanFeedback(request, response, url) {
  const user = requireUser(request, response); if (!user) return;
  const id = Number(url.pathname.split("/").pop());
  const row = db.prepare("SELECT daily_plan_feedback.* FROM daily_plan_feedback JOIN profiles ON profiles.id=daily_plan_feedback.profile_id WHERE daily_plan_feedback.id=? AND profiles.user_id=?").get(id, user.id);
  if (!row) return sendJson(response, 404, { error: "推荐反馈不存在" });
  db.prepare("DELETE FROM daily_plan_feedback WHERE id=?").run(id);
  const calibration = dailyPlanFeedbackCalibration(row.profile_id);
  const current = db.prepare("SELECT id,plan_json FROM daily_plans WHERE profile_id=? AND plan_date=?").get(row.profile_id, serverDateKey());
  if (current) {
    const plan = JSON.parse(current.plan_json || "{}");
    db.prepare("UPDATE daily_plans SET plan_json=?,updated_at=? WHERE id=?").run(JSON.stringify({ ...plan, recommendationSignals: calibration.activeSignals }), nowIso(), current.id);
  }
  sendJson(response, 200, { ok: true, calibration, dailyPlan: todayDailyPlan(row.profile_id) });
}
function dailyPlanCandidates(profileIdValue, checkin, excluded = [], swapContext = {}) {
  const excludedSet = new Set(excluded.map(String));
  const energyRank = { low: 1, normal: 2, high: 3 };
  const available = Number(checkin.minutes || 10);
  const energy = energyRank[checkin.energy] || 2;
  const decisionCalibration = actionDecisionCalibration(profileIdValue);
  const feedbackCalibration = dailyPlanFeedbackCalibration(profileIdValue);
  const goalsById = new Map(goalRows(profileIdValue).filter((goal) => goal.status === "active").map((goal) => [goal.id, goal]));
  const candidates = [];
  for (const action of actionRows(profileIdValue).filter((item) => ["open", "doing"].includes(item.status) && (!item.notBefore || new Date(item.notBefore).getTime() <= Date.now()))) {
    const ref = `action:${action.id}`;
    if (excludedSet.has(ref)) continue;
    const dueHours = action.dueAt ? (new Date(action.dueAt).getTime() - Date.now()) / 3600000 : Infinity;
    let score = action.status === "doing" ? 70 : 40;
    score += Number(action.importance || 2) * 12;
    if (dueHours <= 0) score += 45; else if (dueHours <= 24) score += 32; else if (dueHours <= 72) score += 15;
    score += Number(action.estimateMinutes) <= available ? 28 : -Math.min(30, Number(action.estimateMinutes) - available);
    score += (energyRank[action.energy] || 2) <= energy ? 12 : -12;
    if (checkin.intent === "finish") score += 18;
    if (checkin.intent === "recharge") score -= 24;
    if (decisionCalibration.preferShort) score += Number(action.estimateMinutes) <= 10 ? 14 : -10;
    if (decisionCalibration.preferLowEnergy) score += action.energy === "low" ? 12 : -8;
    if (decisionCalibration.preferClearStep) score += action.steps.length ? 12 : -7;
    if (decisionCalibration.preferImportant) score += Number(action.importance) >= 2 ? 10 : -10;
    if (feedbackCalibration.preferTiny) score += Number(action.estimateMinutes) <= 10 ? 16 : -12;
    if (feedbackCalibration.preferClear) score += action.steps.length || action.detail ? 12 : -8;
    if (feedbackCalibration.avoidedSourceTypes.includes("action")) score -= 10;
    if (swapContext.reason === "too_big") score += Number(action.estimateMinutes) <= 5 ? 32 : Number(action.estimateMinutes) <= 10 ? 12 : -28;
    if (swapContext.reason === "unclear") score += action.steps.length || action.detail ? 24 : -16;
    if (swapContext.reason === "not_interesting" && swapContext.previousSourceType === "action") score -= 80;
    const goal = goalsById.get(Number(action.goalId || 0));
    if (goal) score += 18;
    candidates.push({ ref, sourceType: "action", sourceId: Number(action.id), goalId: goal?.id || 0, goalTitle: goal?.title || "", title: action.title, detail: action.detail, minutes: Math.min(available, Number(action.estimateMinutes || 10)), energy: action.energy, score, firstStep: action.steps[0] || "先准备需要的东西，只开始第一小步", whyHint: goal ? `它正在推进「${goal.title}」` : action.status === "doing" ? "这是已经开始的事情" : dueHours <= 24 ? "它临近时间了" : "它适合现在的时间和精力" });
  }
  for (const habit of habitRows(profileIdValue).filter((item) => item.dueToday && item.todayStatus === "pending")) {
    const ref = `habit:${habit.id}`;
    if (excludedSet.has(ref)) continue;
    candidates.push({ ref, sourceType: "habit", sourceId: Number(habit.id), title: habit.title, detail: habit.cue ? `${habit.cue}之后做` : "今天的小节奏", minutes: Math.min(available, Number(habit.targetMinutes || 5)), energy: "low", score: 52 + (checkin.intent === "reset" ? 70 : 0) + (checkin.intent === "recharge" ? -12 : 0) + (decisionCalibration.preferShort ? 10 : 0) + (decisionCalibration.preferLowEnergy ? 10 : 0) + (feedbackCalibration.preferTiny ? 12 : 0) + (feedbackCalibration.avoidedSourceTypes.includes("habit") ? -10 : 0) + (swapContext.reason === "too_big" ? 28 : 0) + (swapContext.reason === "unclear" ? 18 : 0) + (swapContext.reason === "not_interesting" && swapContext.previousSourceType === "habit" ? -80 : 0), firstStep: habit.cue ? `等到「${habit.cue}」后，只做${Math.min(available, habit.targetMinutes)}分钟` : "现在只做最小的一次", whyHint: checkin.intent === "reset" ? "这是你刚刚选择要保持的小节奏" : "这是今天还没有完成的小习惯" });
  }
  for (const idea of ideaRows(profileIdValue).filter((item) => ["active", "incubating"].includes(item.status))) {
    const ref = `idea:${idea.id}`;
    if (excludedSet.has(ref)) continue;
    const goal = goalsById.get(Number(idea.goalId || 0));
    candidates.push({ ref, sourceType: "idea", sourceId: Number(idea.id), goalId: goal?.id || 0, goalTitle: goal?.title || "", title: idea.title, detail: idea.nextStep, minutes: Math.min(available, 10), energy: "normal", score: 38 + (checkin.intent === "create" ? 42 : 0) + (checkin.intent === "recharge" ? -18 : 0) + (goal ? 18 : 0) + (decisionCalibration.preferShort ? 8 : 0) + (decisionCalibration.preferLowEnergy ? -5 : 0) + (decisionCalibration.preferClearStep && idea.nextStep ? 8 : 0) + (feedbackCalibration.preferTiny ? 8 : 0) + (feedbackCalibration.preferClear && idea.nextStep ? 10 : 0) + (feedbackCalibration.avoidedSourceTypes.includes("idea") ? -10 : 0) + (swapContext.reason === "unclear" && idea.nextStep ? 18 : 0) + (swapContext.reason === "not_interesting" && swapContext.previousSourceType === "idea" ? -80 : 0), firstStep: idea.nextStep || "先写下这个想法最想解决的问题", whyHint: goal ? `它是「${goal.title}」方向的一颗灵感` : "它来自你自己保存的灵感" });
  }
  const rechargeRef = "recharge:today";
  if (!excludedSet.has(rechargeRef)) candidates.push({ ref: rechargeRef, sourceType: "recharge", sourceId: 0, title: checkin.energy === "low" ? "两分钟恢复能量" : "活动一下再出发", detail: "喝水、伸展、看看远处", minutes: Math.min(5, available), energy: "low", score: (checkin.intent === "recharge" ? 110 : checkin.energy === "low" ? 78 : 12) + (feedbackCalibration.preferTiny ? 10 : 0) + (feedbackCalibration.avoidedSourceTypes.includes("recharge") ? -10 : 0) + (swapContext.reason === "too_big" ? 34 : 0) + (swapContext.reason === "not_interesting" && swapContext.previousSourceType === "recharge" ? -80 : 0), firstStep: "先喝几口水，再慢慢伸展肩膀", whyHint: checkin.intent === "recharge" ? "这是你刚刚主动选择的恢复时间" : "照顾状态也是今天的重要一步" });
  return candidates.sort((left, right) => right.score - left.score).slice(0, 18);
}
function handleGetDailyPlan(request, response, url) {
  const user = requireUser(request, response); if (!user) return;
  const profileIdValue = String(url.searchParams.get("profileId") || "");
  if (!ownedProfile(user.id, profileIdValue)) return sendJson(response, 404, { error: "角色不存在" });
  sendJson(response, 200, { date: serverDateKey(), dailyPlan: todayDailyPlan(profileIdValue) });
}
function motivationSupport(calibration, checkin) {
  if (checkin.energy === "low") return { motivator: "wellbeing", text: "只做第一小步就可以，先照顾好自己的状态" };
  const motivator = calibration.preferredMotivators?.[0] || "unknown";
  const messages = {
    autonomy: "你可以自己选择怎么完成，也可以决定做到哪一步",
    progress: "做完这一小步，就能看见一点真实进度",
    curiosity: "先试一小步，看看接下来会发生什么",
    making: "先做出一个看得见的小版本，不需要完美",
    connection: "做完后可以把你的发现讲给一个人听",
    purpose: "这一步会让后面的事情更轻松"
  };
  return { motivator, text: messages[motivator] || "完成后回来告诉我真实感觉" };
}
async function handleGenerateDailyPlan(request, response) {
  const user = requireUser(request, response); if (!user) return;
  const body = await readBodyJson(request);
  const profileIdValue = String(body.profileId || "");
  const profile = ownedProfile(user.id, profileIdValue);
  if (!profile) return sendJson(response, 404, { error: "角色不存在" });
  const previous = todayDailyPlan(profileIdValue);
  const swap = body.swap === true;
  const lighter = body.lighter === true;
  const swapReason = ["too_big", "not_interesting", "unclear", "not_now"].includes(body.swapReason) ? body.swapReason : "";
  if (swap && swapReason && previous?.plan?.ref) db.prepare("INSERT INTO daily_plan_feedback(profile_id,daily_plan_id,source_ref,source_type,reason,created_at) VALUES(?,?,?,?,?,?)").run(profileIdValue, previous.id, previous.plan.ref, previous.plan.sourceType || "unknown", swapReason, nowIso());
  const checkin = { energy: lighter ? "low" : ["low", "normal", "high"].includes(body.energy) ? body.energy : previous?.checkin.energy || "normal", minutes: lighter ? 5 : [5, 10, 20, 30].includes(Number(body.minutes)) ? Number(body.minutes) : Number(previous?.checkin.minutes || 10), intent: ["finish", "create", "learn", "reset", "recharge"].includes(body.intent) ? body.intent : previous?.checkin.intent || "finish" };
  const excluded = [...new Set([...(previous?.excluded || []), ...(swap && previous?.plan.ref ? [previous.plan.ref] : [])])].slice(-12);
  const recommendationCalibration = dailyPlanFeedbackCalibration(profileIdValue);
  const candidates = dailyPlanCandidates(profileIdValue, checkin, excluded, { reason: swapReason, previousSourceType: previous?.plan?.sourceType || "" });
  if (!candidates.length) return sendJson(response, 409, { error: "今天的候选都看过了，先休息一下吧" });
  const fallback = candidates[0];
  const calibration = feedbackCalibration(taskFeedbackRows(profileIdValue));
  const decisionCalibration = actionDecisionCalibration(profileIdValue);
  const motivation = motivationSupport(calibration, checkin);
  let selected = { ref: fallback.ref, title: fallback.title, minutes: fallback.minutes, why: fallback.whyHint, firstStep: fallback.firstStep, support: motivation.text, motivator: motivation.motivator, provider: "local" };
  if (apiKey) {
    try {
      const apiResponse = await fetch(`${baseUrl.replace(/\/$/, "")}/chat/completions`, { method: "POST", signal: AbortSignal.timeout(12000), headers: { authorization: `Bearer ${apiKey}`, "content-type": "application/json" }, body: JSON.stringify({ model, temperature: 0.38, max_tokens: 420, response_format: { type: "json_object" }, messages: [
        { role: "system", content: "你是6-12岁孩子的每日下一步教练。只能从候选中选择一个ref，不创造新任务。根据当下能量、时间、意图、截止时间和体验校准选择。decisionCalibration只有在同一协商原因重复至少两次后才激活，要尊重它但不能把当前节奏说成固定性格；截止紧急事项仍可优先。preferredMotivators只有在重复证据达到阈值后才会出现；support要贴合它。语气简短温和，不评价孩子好坏，不用成人管理口吻。只返回JSON。" },
        { role: "user", content: JSON.stringify({ child: { name: profile.name, age: profile.age }, checkin, swapReason, calibration, decisionCalibration, recommendationCalibration, candidates: candidates.map(({ score, ...candidate }) => candidate), output: { ref: "必须原样复制候选ref", title: "孩子看到的短标题", minutes: "不超过可用时间", why: "一句具体理由", firstStep: "马上能做的第一步", support: "一句低压力支持" } }) }
      ] }) });
      if (!apiResponse.ok) throw new Error(`daily plan ${apiResponse.status}`);
      const json = parseJsonContent((await apiResponse.json()).choices?.[0]?.message?.content || "{}");
      const matched = candidates.find((candidate) => candidate.ref === json.ref) || fallback;
      selected = { ref: matched.ref, title: String(json.title || matched.title).slice(0, 80), minutes: Math.max(2, Math.min(checkin.minutes, Number(json.minutes || matched.minutes))), why: String(json.why || matched.whyHint).slice(0, 140), firstStep: String(json.firstStep || matched.firstStep).slice(0, 180), support: String(json.support || motivation.text).slice(0, 100), motivator: motivation.motivator, provider: "siliconflow" };
    } catch (error) { console.warn("Daily plan used local fallback:", error.message); }
  }
  const source = candidates.find((candidate) => candidate.ref === selected.ref) || fallback;
  const plan = { ...selected, sourceType: source.sourceType, sourceId: source.sourceId, goalId: source.goalId || 0, goalTitle: source.goalTitle || "", decisionSignals: decisionCalibration.activeSignals, recommendationSignals: recommendationCalibration.activeSignals };
  const now = nowIso();
  db.prepare("INSERT INTO daily_plans(profile_id,plan_date,checkin_json,plan_json,excluded_json,status,feedback,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?) ON CONFLICT(profile_id,plan_date) DO UPDATE SET checkin_json=excluded.checkin_json,plan_json=excluded.plan_json,excluded_json=excluded.excluded_json,status='ready',feedback='',updated_at=excluded.updated_at").run(profileIdValue, serverDateKey(), JSON.stringify(checkin), JSON.stringify(plan), JSON.stringify(excluded), "ready", "", now, now);
  recordEvent(user.id, profileIdValue, swap ? "daily_plan_swapped" : lighter ? "daily_plan_lightened" : "daily_plan_generated", { sourceType: plan.sourceType, minutes: plan.minutes, provider: plan.provider, energy: checkin.energy, intent: checkin.intent, swapReason: swapReason || undefined });
  sendJson(response, 200, todayDailyPlan(profileIdValue));
}
async function handleUpdateDailyPlan(request, response, url) {
  const user = requireUser(request, response); if (!user) return;
  const id = Number(url.pathname.split("/").pop());
  const row = db.prepare("SELECT daily_plans.* FROM daily_plans JOIN profiles ON profiles.id=daily_plans.profile_id WHERE daily_plans.id=? AND profiles.user_id=?").get(id, user.id);
  if (!row) return sendJson(response, 404, { error: "今日下一步不存在" });
  const body = await readBodyJson(request);
  const feedback = ["accepted", "not_now", "completed"].includes(body.feedback) ? body.feedback : "accepted";
  const status = feedback === "completed" ? "completed" : feedback === "accepted" ? "started" : "ready";
  db.prepare("UPDATE daily_plans SET status=?,feedback=?,updated_at=? WHERE id=?").run(status, feedback, nowIso(), id);
  const eventName = feedback === "completed" ? "daily_plan_completed" : feedback === "accepted" ? "daily_plan_started" : "daily_plan_swapped";
  recordEvent(user.id, row.profile_id, eventName, { feedback });
  sendJson(response, 200, todayDailyPlan(row.profile_id));
}
function handleDeleteDailyPlan(request, response, url) {
  const user = requireUser(request, response); if (!user) return;
  const id = Number(url.pathname.split("/").pop());
  const row = db.prepare("SELECT daily_plans.* FROM daily_plans JOIN profiles ON profiles.id=daily_plans.profile_id WHERE daily_plans.id=? AND profiles.user_id=?").get(id, user.id);
  if (!row) return sendJson(response, 404, { error: "今日下一步不存在" });
  db.prepare("DELETE FROM daily_plans WHERE id=?").run(id);
  sendJson(response, 200, { ok: true });
}
function handleDeleteJournal(request, response, url) {
  const user = requireUser(request, response); if (!user) return;
  const id = Number(url.pathname.split("/").pop());
  const row = db.prepare("SELECT journals.id,journals.profile_id FROM journals JOIN profiles ON profiles.id=journals.profile_id WHERE journals.id=? AND profiles.user_id=?").get(id, user.id);
  if (!row) return sendJson(response, 404, { error: "日记不存在" });
  db.exec("BEGIN");
  try {
    const memoryIds = db.prepare("SELECT id FROM memories WHERE profile_id=? AND kind='journal' AND json_extract(evidence_json,'$.journalId')=?").all(row.profile_id, id).map((item) => Number(item.id));
    db.prepare("DELETE FROM memories WHERE profile_id=? AND kind='journal' AND json_extract(evidence_json,'$.journalId')=?").run(row.profile_id, id);
    removeHypothesisEvidence(row.profile_id, memoryIds);
    db.prepare("DELETE FROM journals WHERE id=?").run(id);
    retractStrategyEvidence(row.profile_id, [`journal:${id}`]);
    recordEvent(user.id, row.profile_id, "journal_deleted", {});
    db.exec("COMMIT");
  } catch (error) { db.exec("ROLLBACK"); throw error; }
  sendJson(response, 200, { ok: true });
}
async function handleJournalPrompt(request, response) {
  const user = requireUser(request, response); if (!user) return;
  const body = await readBodyJson(request);
  const profileIdValue = String(body.profileId || "");
  const profile = ownedProfile(user.id, profileIdValue);
  if (!profile) return sendJson(response, 404, { error: "角色不存在" });
  const draft = String(body.draft || "").trim().slice(0, 1800);
  const isFollowup = draft.length >= 2;
  const recent = journalRows(profileIdValue).filter((entry) => entry.shareWithAi).slice(0, 5).map((entry) => ({ prompt: entry.prompt, content: entry.content.slice(0, 500), tags: entry.tags, createdAt: entry.createdAt }));
  const fallbackQuestions = isFollowup
    ? ["这件事里，哪一小部分对你最重要？", "当时你最先想到的是什么？", "如果再试一次，你想保留或改变什么？", "这个想法让你还想探索什么？"]
    : ["今天有没有一个瞬间，让你想说‘原来我可以这样’？", "今天哪个想法最舍不得忘记？", "如果把今天变成一张卡片，你会画什么、写什么？", "今天遇到的哪件小事，让你对自己多懂了一点？"];
  if (!apiKey) return sendJson(response, 200, { question: fallbackQuestions[parseInt(stableHash(`${profileIdValue}-${new Date().toISOString().slice(0,10)}`).slice(0,2), 36) % fallbackQuestions.length], source: "local" });
  try {
    const apiResponse = await fetch(`${baseUrl.replace(/\/$/, "")}/chat/completions`, {
      method: "POST", signal: AbortSignal.timeout(45000), headers: { authorization: `Bearer ${apiKey}`, "content-type": "application/json" },
      body: JSON.stringify({ model, temperature: 0.7, max_tokens: 220, response_format: { type: "json_object" }, messages: [
        { role: "system", content: "你是6-12岁孩子的成长日记伙伴。只问一个温和、具体、没有标准答案的问题，帮助孩子记录感悟、灵感、困惑或自我发现。如果给了草稿，只追问草稿中尚未说清、但值得孩子自己探索的一点，不总结、不改写、不替孩子下结论。不要诊断，不要说教，不要重复近期问题。只返回JSON。" },
        { role: "user", content: JSON.stringify({ child: { name: profile.name, age: profile.age }, mode: String(body.mode || "hybrid"), draft: draft || undefined, recentJournal: recent, todayContext: body.todayContext || {}, output: { question: "最多38字", starter: "一个可选的回答开头，最多20字", suggestedTags: ["2-4个短标签"] } }) }
      ] })
    });
    if (!apiResponse.ok) throw new Error(`journal prompt ${apiResponse.status}`);
    const json = parseJsonContent((await apiResponse.json()).choices?.[0]?.message?.content || "{}");
    recordEvent(user.id, profileIdValue, "journal_prompted", { provider: "siliconflow", followup: isFollowup });
    sendJson(response, 200, { question: String(json.question || fallbackQuestions[0]).slice(0, 100), starter: String(json.starter || "").slice(0, 60), suggestedTags: Array.isArray(json.suggestedTags) ? json.suggestedTags.map(String).slice(0, 4) : [], source: "ai", model });
  } catch {
    sendJson(response, 200, { question: fallbackQuestions[Math.floor(Math.random() * fallbackQuestions.length)], starter: "我今天发现……", suggestedTags: ["灵感", "发现"], source: "local" });
  }
}

async function handleCoach(request, response) {
  if (!apiKey) {
    sendJson(response, 500, {
      error: "Missing SILICONFLOW_API_KEY. Create .env.local or export the variable before running npm start."
    });
    return;
  }

  const payload = await readBodyJson(request);
  const result = await callSiliconFlow(payload);
  sendJson(response, 200, result);
}

async function handlePlan(request, response) {
  if (!apiKey) {
    sendJson(response, 500, { error: "Missing SILICONFLOW_API_KEY" });
    return;
  }
  const payload = await readBodyJson(request);
  const result = await callSiliconFlowPlan(payload);
  sendJson(response, 200, result);
}

async function callSiliconFlowPlan(payload) {
  const apiResponse = await fetch(`${baseUrl.replace(/\/$/, "")}/chat/completions`, {
    method: "POST",
    signal: AbortSignal.timeout(60000),
    headers: {
      authorization: `Bearer ${apiKey}`,
      "content-type": "application/json"
    },
    body: JSON.stringify({
      model,
      temperature: 0.56,
      max_tokens: 1200,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: [
            "你是6-10岁儿童的成长计划设计师。",
            "计划必须来自孩子技能树、长期画像、复盘、已有周计划、近期日程和安全新闻上下文。",
            "长期记忆只作为可修正的行为证据，不得把它当作固定人格标签。",
            "每周只设一个清楚目标，拆成3-5个可独立完成的里程碑。",
            "日程繁忙时减少任务量，新闻只用作安全的项目灵感。",
            "禁止诊断、贴标签、制造焦虑或成人化竞争。",
            "只返回合法JSON。"
          ].join("\n")
        },
        {
          role: "user",
          content: JSON.stringify({
            task: "生成一份个性化本周成长计划",
            outputSchema: {
              weeklyGoal: "一句孩子看得懂的本周目标",
              focusSkill: "八类能力之一的id",
              constraints: "如何适配日程和能量",
              rationale: "为什么此刻选这个目标，最多60字",
              milestones: [{ title: "里程碑短标题", when: "建议时间", skill: "能力id", success: "完成标准" }]
            },
            payload
          })
        }
      ]
    })
  });
  if (!apiResponse.ok) {
    const text = await apiResponse.text();
    throw new Error(`SiliconFlow plan error ${apiResponse.status}: ${text.slice(0, 500)}`);
  }
  const data = await apiResponse.json();
  const json = parseJsonContent(data.choices?.[0]?.message?.content || "{}");
  return {
    provider: "siliconflow",
    model,
    weeklyGoal: String(json.weeklyGoal || payload?.planningContext?.weeklyPlan?.weeklyGoal || "完成一个能展示的小成果").slice(0, 120),
    focusSkill: normalizeSkillId(json.focusSkill || payload?.planningContext?.weeklyPlan?.focusSkill || "creation"),
    constraints: String(json.constraints || payload?.planningContext?.weeklyPlan?.constraints || "每次只做一个小步骤").slice(0, 180),
    rationale: String(json.rationale || "结合技能树和本周安排选择了这个方向。").slice(0, 180),
    milestones: (Array.isArray(json.milestones) ? json.milestones : []).slice(0, 5).map((item) => ({
      title: String(item?.title || "小步骤").slice(0, 60),
      when: String(item?.when || "本周").slice(0, 40),
      skill: normalizeSkillId(item?.skill || json.focusSkill || "creation"),
      success: String(item?.success || "孩子能自己说出完成了什么").slice(0, 100)
    }))
  };
}

async function handleNewsContext(url, response) {
  const rawTopics = String(url.searchParams.get("topics") || "AI education, science discovery, creativity, future skills");
  const topics = rawTopics
    .split(/[,，;；]/)
    .map((topic) => topic.trim().replace(/[(){}[\]<>]/g, ""))
    .filter(Boolean)
    .slice(0, 6);
  const topicQuery = topics.map((topic) => `"${topic.replaceAll('"', "")}"`).join(" OR ");
  const query = topics.length > 1 ? `(${topicQuery})` : topicQuery;
  const endpoint = new URL("https://api.gdeltproject.org/api/v2/doc/doc");
  endpoint.searchParams.set("query", query || '"AI education"');
  endpoint.searchParams.set("mode", "artlist");
  endpoint.searchParams.set("maxrecords", "30");
  endpoint.searchParams.set("format", "json");
  endpoint.searchParams.set("timespan", "7d");
  endpoint.searchParams.set("sort", "datedesc");

  let newsResponse;
  try {
    newsResponse = await fetch(endpoint, { signal: AbortSignal.timeout(6000) });
  } catch (error) {
    await fetchFallbackTechNews(topics, response);
    return;
  }
  if (!newsResponse.ok) {
    await fetchFallbackTechNews(topics, response);
    return;
  }
  const news = await newsResponse.json();
  const blocked = /战争|战火|武器|杀害|死亡|犯罪|色情|毒品|暴力|war\b|weapon|killed|murder|crime|sexual|drug\b|violence|election|politic/i;
  const seenDomains = new Set();
  const items = (Array.isArray(news.articles) ? news.articles : [])
    .filter((article) => article?.title && !blocked.test(String(article.title)))
    .filter((article) => {
      const domain = String(article.domain || "");
      if (!domain || seenDomains.has(domain)) return false;
      seenDomains.add(domain);
      return true;
    })
    .slice(0, 8)
    .map((article) => ({
      id: `news-${stableHash(`${article.url}-${article.title}`)}`,
      title: String(article.title).slice(0, 160),
      summary: "",
      source: String(article.domain || article.sourcecountry || "GDELT").slice(0, 80),
      domain: String(article.domain || "").slice(0, 80),
      date: formatNewsDate(article.seendate),
      url: String(article.url || "").slice(0, 500),
      language: String(article.language || "").slice(0, 30)
    }));
  if (!items.length) {
    await fetchFallbackTechNews(topics, response);
    return;
  }
  sendJson(response, 200, { provider: "GDELT DOC 2.0", topics, items });
}

async function fetchFallbackTechNews(topics, response) {
  const englishWords = topics.flatMap((topic) => String(topic).match(/[A-Za-z][A-Za-z0-9-]*/g) || []);
  const meaningfulWords = [...new Set(englishWords)].filter((word) => word.length > 2 || word.toUpperCase() === "AI");
  const query = meaningfulWords.length >= 2 ? meaningfulWords.slice(0, 3).join(" ") : "AI education";
  const endpoint = new URL("https://hn.algolia.com/api/v1/search_by_date");
  endpoint.searchParams.set("query", query);
  endpoint.searchParams.set("tags", "story");
  endpoint.searchParams.set("hitsPerPage", "30");
  let fallbackResponse;
  try {
    fallbackResponse = await fetch(endpoint, { signal: AbortSignal.timeout(12000) });
  } catch {
    sendJson(response, 502, { error: "News sources unavailable" });
    return;
  }
  if (!fallbackResponse.ok) {
    sendJson(response, 502, { error: `Fallback news source ${fallbackResponse.status}` });
    return;
  }
  const data = await fallbackResponse.json();
  const blocked = /战争|武器|杀害|死亡|犯罪|色情|毒品|暴力|war\b|weapon|killed|murder|crime|sexual|drug\b|violence|election|politic|psychosis|fraud|insurance|disability|market/i;
  const relevant = /educat|learn|science|student|school|child|creativ|discover|robot|space|nature|climate/i;
  const items = (Array.isArray(data.hits) ? data.hits : [])
    .map((hit) => ({
      title: hit.title || hit.story_title || "",
      url: hit.url || hit.story_url || "",
      author: hit.author || ""
    }))
    .filter((item) => item.title && item.url && !blocked.test(item.title) && relevant.test(item.title))
    .slice(0, 8)
    .map((item) => ({
      id: `news-${stableHash(`${item.url}-${item.title}`)}`,
      title: String(item.title).slice(0, 160),
      summary: "",
      source: "Hacker News / Algolia",
      domain: safeDomain(item.url),
      date: new Date().toISOString().slice(0, 10),
      url: String(item.url).slice(0, 500),
      language: "English"
    }));
  sendJson(response, 200, { provider: "HN Search by Algolia", topics, items });
}

function safeDomain(value) {
  try {
    return new URL(value).hostname;
  } catch {
    return "";
  }
}

function formatNewsDate(value) {
  const text = String(value || "");
  const match = text.match(/^(\d{4})(\d{2})(\d{2})/);
  return match ? `${match[1]}-${match[2]}-${match[3]}` : text.slice(0, 10);
}

function stableHash(value) {
  let hash = 0;
  for (const char of String(value || "")) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return hash.toString(36);
}

function normalizedTitle(value) {
  return String(value || "").toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "");
}

function serverTitleSimilarity(left, right) {
  const a = normalizedTitle(left);
  const b = normalizedTitle(right);
  if (!a || !b) return 0;
  if (a === b) return 1;
  const grams = (text) => new Set(Array.from({ length: Math.max(1, text.length - 1) }, (_, index) => text.slice(index, index + 2)));
  const leftSet = grams(a);
  const rightSet = grams(b);
  const intersection = [...leftSet].filter((item) => rightSet.has(item)).length;
  return intersection / new Set([...leftSet, ...rightSet]).size;
}

function serverRecommendationSimilarity(left, right) {
  if (!left || !right) return 0;
  let score = serverTitleSimilarity(left.title, right.title) * 0.34;
  for (const field of ["skill", "mode", "setting", "output", "interaction"]) {
    if (left[field] && right[field] && String(left[field]) === String(right[field])) score += 0.132;
  }
  return Math.min(1, score);
}

function highestRecentOverlap(recommendation, payload) {
  const recent = [
    ...(payload?.history?.avoidedToday || []),
    ...(payload?.history?.recentRecommendations || [])
  ].slice(0, 16);
  return recent.reduce((highest, item) => Math.max(highest, serverRecommendationSimilarity(recommendation, item)), 0);
}

async function callSiliconFlow(payload) {
  const firstJson = await requestCoachCompletion(payload);
  const firstResult = normalizeCoachJson(firstJson, payload);
  const firstOverlap = highestRecentOverlap(firstResult.recommendation, payload);
  if (firstOverlap < 0.68) return firstResult;

  const retryPayload = {
    ...payload,
    diversityRetry: {
      rejectedRecommendation: firstResult.recommendation,
      overlap: firstOverlap,
      instruction: "上一版与近期任务过于相似。必须改变至少三个维度后重新生成。"
    }
  };
  const retryJson = await requestCoachCompletion(retryPayload, 0.76);
  const retryResult = normalizeCoachJson(retryJson, retryPayload);
  const retryOverlap = highestRecentOverlap(retryResult.recommendation, retryPayload);
  return retryOverlap < firstOverlap ? retryResult : firstResult;
}

async function requestCoachCompletion(payload, temperature = 0.64) {
  const prompt = buildCoachPrompt(payload);
  const apiResponse = await fetch(`${baseUrl.replace(/\/$/, "")}/chat/completions`, {
    method: "POST",
    signal: AbortSignal.timeout(60000),
    headers: {
      authorization: `Bearer ${apiKey}`,
      "content-type": "application/json"
    },
    body: JSON.stringify({
      model,
      temperature,
      max_tokens: 800,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: [
            "你是儿童成长任务推荐系统的AI小教练。",
            "你面对的是6-10岁儿童，语气短、温和、像游戏NPC，不说教。",
            "你基于执行功能、元认知、自我调节、主动回忆、间隔练习、深层解释问题、自主感、成长型思维、项目学习和AI素养原则给任务。",
            "每次只推荐一个刚刚好的任务。",
            "禁止诊断、贴标签、制造焦虑，也不要把父母任务转嫁给孩子。",
            "如果证据不足，优先问一个低压力问题收集上下文。",
            "history.longTermMemories是跨天记忆，优先寻找可重复的兴趣、有效方法和困难变化，但不得给孩子贴标签。",
            "history.recentJournal是孩子第一人称记录，优先尊重其表达；单篇日记只能作为当下线索，不能直接推断稳定人格或天赋。",
            "history.activeHypotheses是有证据和置信度的可修正假设。置信度低于70%时只能作为探索线索；有反证时不得用确定语气。",
            "history.taskCalibration和recentTaskFeedback是孩子对具体任务的当下体验。用它校准任务长度、挑战度、玩法和支持方式，但不得推断能力高低或固定偏好。",
            "history.artifactEvidence是孩子主动允许AI参考的真实作品证据。优先延续已有作品或建议一个可见的小版本；照片和录音只有元数据与孩子说明，不得假装看过或听过原文件。",
            "history.strategyInsights是由至少两条证据压缩出的个人方法说明。feedback=helpful可以优先采用；未确认的只能作为尝试；被否定或不确定的策略不会出现在这里。",
            "只返回合法JSON，不要Markdown。"
          ].join("\n")
        },
        { role: "user", content: prompt }
      ]
    })
  });

  if (!apiResponse.ok) {
    const text = await apiResponse.text();
    throw new Error(`SiliconFlow error ${apiResponse.status}: ${text.slice(0, 500)}`);
  }

  const data = await apiResponse.json();
  const content = data.choices?.[0]?.message?.content || "{}";
  return parseJsonContent(content);
}

function buildCoachPrompt(payload) {
  return JSON.stringify({
    task: "根据孩子画像、今天回答、历史复盘和候选任务，生成下一步对话或一个推荐任务。",
    outputSchema: {
      coachLine: "一句给孩子看的短话，最多28字",
      question: "如果还需要问孩子，就给一个问题；否则为空字符串",
      options: ["2-4个孩子可点选的短选项"],
      recommendation: {
        title: "任务名，8字以内优先",
        type: "任务类型",
        minutes: "数字",
        why: "为什么适合这个孩子，最多35字",
        steps: ["3-4个很短步骤"],
        reflect: "做完问孩子的一句话",
        skill: "会升级的能力id或名称",
        mode: "活动玩法英文id，例如 explore/experiment/teach/design/movement/organize/collaborate/story",
        setting: "场景英文id，例如 home/outdoor/computer/book/family/craft",
        output: "可见产物英文id，例如 map/audio/card/photo/verdict/prototype/comparison",
        interaction: "互动英文id：solo/ai/partner/family",
        reward: "数字",
        evidenceNote: "对应的学习科学依据，最多28字",
        contextUsed: ["实际使用到的上下文，如技能树/周计划/周三日程/某条新闻"]
      },
      skillUpdate: {
        name: "能力名",
        delta: "1-6之间的数字",
        reason: "为什么加经验"
      }
    },
    constraints: [
      "如果answers不足以推荐，优先提出一个问题。",
      "如果能推荐，只给一个任务，不要给多个。",
      "任务必须适合孩子今天可用时间。",
      "步骤必须孩子能自己看懂。",
      "任务必须落在八类长期技能之一：自我调节、会学会想、表达沟通、数据推理、AI协作、创造项目、判断协作、身心底座。",
      "优先使用具体行为证据，而不是人格判断。",
      "必须读取history.taskCalibration：pace=shrink时缩短步骤或降低同时处理的信息量；pace=stretch时增加一点挑战；observe时不得据单次反馈定型。preferredSupport决定提示方式，avoidModes只在至少两次无聊反馈后弱化相似玩法。",
      "history.artifactEvidence可以证明孩子留下过某种产物，但不能证明固定天赋。若引用作品，contextUsed必须写出作品名称。",
      "优先使用history.strategyInsights调整第一步和支持方式，减少重复读取零散记忆；任何策略都不能覆盖孩子今天明确选择的能量、时间和意图。",
      "不要出现成人管理语气。",
            "必须读取planningContext：周计划决定近期目标，日程决定可用时间和能量，新闻消息只能转化为安全的真实问题或项目灵感。",
            "planningContext.ideaPipeline是孩子主动保存并正在孵化的灵感。优先帮助它向前一小步，但不能让单一灵感垄断所有推荐。",
            "planningContext.actionQueue是孩子自己的行动队列。不要重复创建已有行动；日程冲突时建议缩小或延后，而不是继续加任务。",
            "planningContext.decisionCalibration只有同一协商原因至少重复两次才会激活。按当前节奏调整时长、能量、第一步或重要性，但不能称为固定偏好、能力或性格。",
            "planningContext.habitRhythm是孩子主动建立的微习惯。已完成时不要重复推荐；暂停表示主动调节，不得描述为失败或懒惰。",
            "planningContext.focusPattern是真实专注记录。只能用于调整任务长度和节奏，不得用专注分钟数评价孩子好坏。",
            "planningContext.confirmedWeeklyReview只有孩子未否认的周报结论。若feedback为空只能作为线索；已确认的下周重点也不能覆盖孩子今天的真实状态。",
      "新闻若涉及灾难、暴力、政治冲突、犯罪、成人焦虑或与孩子无关，必须忽略。",
      "对比history.recentRecommendations和history.avoidedToday，不能只改标题或换同义词。",
      "与最近一次任务相比，skill、mode、setting、output、interaction至少改变3项；如果保留同一技能，必须改变玩法和产物。",
      "如果存在diversityRetry，上一版已被判定重复，必须明显重做。"
    ],
    payload
  });
}

function normalizeCoachJson(json, payload) {
  const fallbackQuest = payload?.candidateQuests?.[0] || {};
  return {
    provider: "siliconflow",
    model,
    coachLine: String(json.coachLine || "我来帮你选一个刚刚好的任务。").slice(0, 80),
    question: String(json.question || ""),
    options: Array.isArray(json.options) ? json.options.slice(0, 4).map(String) : [],
    recommendation: {
      title: String(json.recommendation?.title || fallbackQuest.title || "小任务").slice(0, 40),
      type: String(json.recommendation?.type || fallbackQuest.type || "成长"),
      minutes: Number(json.recommendation?.minutes || fallbackQuest.minutes || 10),
      why: String(json.recommendation?.why || fallbackQuest.why || "这个任务适合你现在的状态。").slice(0, 100),
      steps: normalizeSteps(json.recommendation?.steps || fallbackQuest.steps),
      reflect: String(json.recommendation?.reflect || fallbackQuest.reflect || "做完后你发现了什么？").slice(0, 80),
      skill: normalizeSkillId(json.recommendation?.skill || fallbackQuest.skill || "metacognition"),
      mode: String(json.recommendation?.mode || fallbackQuest.mode || "practice").slice(0, 30),
      setting: String(json.recommendation?.setting || fallbackQuest.setting || "home").slice(0, 30),
      output: String(json.recommendation?.output || fallbackQuest.output || "result").slice(0, 30),
      interaction: String(json.recommendation?.interaction || fallbackQuest.interaction || "solo").slice(0, 30),
      reward: Number(json.recommendation?.reward || fallbackQuest.reward || 20),
      evidenceNote: String(json.recommendation?.evidenceNote || "脚手架 + 复盘").slice(0, 80),
      contextUsed: Array.isArray(json.recommendation?.contextUsed) ? json.recommendation.contextUsed.map(String).slice(0, 6) : []
    },
    skillUpdate: {
      name: String(json.skillUpdate?.name || ""),
      delta: Number(json.skillUpdate?.delta || 0),
      reason: String(json.skillUpdate?.reason || "")
    }
  };
}

function normalizeSkillId(value) {
  const raw = String(value || "").trim();
  const allowed = new Set([
    "self-regulation",
    "metacognition",
    "communication",
    "data-reasoning",
    "ai-literacy",
    "creation",
    "ethics-collaboration",
    "wellbeing"
  ]);
  if (allowed.has(raw)) return raw;
  return skillNameToId[raw] || "metacognition";
}

function normalizeSteps(steps) {
  const normalized = Array.isArray(steps) ? steps : [];
  return normalized.map(String).filter(Boolean).slice(0, 4);
}

function parseJsonContent(content) {
  try {
    return JSON.parse(content);
  } catch {
    const match = content.match(/\{[\s\S]*\}/);
    if (!match) return {};
    try {
      return JSON.parse(match[0]);
    } catch {
      return {};
    }
  }
}

async function readBodyJson(request) {
  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString("utf8");
  if (!raw) return {};
  return JSON.parse(raw);
}

function sendJson(response, status, body) {
  response.writeHead(status, { "content-type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(body));
}

function safeJoin(base, pathname) {
  const normalized = pathname.replace(/^\/+/, "");
  const resolved = resolve(join(base, normalized));
  return resolved.startsWith(resolve(base)) ? resolved : null;
}

function loadEnvFile(path) {
  if (!existsSync(path)) return;
  const lines = readFileSync(path, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const equalsIndex = trimmed.indexOf("=");
    if (equalsIndex === -1) continue;
    const key = trimmed.slice(0, equalsIndex).trim();
    const value = trimmed.slice(equalsIndex + 1).trim().replace(/^['"]|['"]$/g, "");
    if (!process.env[key]) process.env[key] = value;
  }
}
