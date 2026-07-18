from pathlib import Path
import re

ROOT = Path('.')
server_path = ROOT / 'api/server.js'
app_path = ROOT / 'app.js'
index_path = ROOT / 'index.html'
db_path = ROOT / 'api/database.js'
validator_path = ROOT / 'scripts/validate-product-logic.mjs'


def replace_once(text: str, old: str, new: str, label: str) -> str:
    count = text.count(old)
    if count != 1:
        raise SystemExit(f'{label}: expected one anchor, found {count}')
    return text.replace(old, new, 1)


def insert_after(text: str, anchor: str, addition: str, label: str) -> str:
    return replace_once(text, anchor, anchor + addition, label)

server = server_path.read_text(encoding='utf-8')
if 'GROWTHOS_JOURNEY_KERNEL_V2' in server:
    print('Journey kernel already applied')
    raise SystemExit(0)

# Durable local/remote database adapter.
server = replace_once(
    server,
    'import { DatabaseSync } from "node:sqlite";\n',
    'import { openGrowthDatabase } from "./database.js";\n',
    'database import',
)
server = replace_once(
    server,
    'const dataDir = process.env.VERCEL ? "/tmp/growth-os" : join(root, "data");\nmkdirSync(dataDir, { recursive: true });\nconst db = new DatabaseSync(join(dataDir, "growth-os.sqlite"));\ndb.exec(`\n  PRAGMA journal_mode=WAL;\n',
    'const dataDir = process.env.GROWTH_OS_DATA_DIR || (process.env.VERCEL ? "/tmp/growth-os" : join(root, "data"));\nconst remoteDatabaseUrl = process.env.TURSO_DATABASE_URL || process.env.LIBSQL_URL || "";\nconst remoteDatabaseToken = process.env.TURSO_AUTH_TOKEN || process.env.LIBSQL_AUTH_TOKEN || "";\nif (!remoteDatabaseUrl) mkdirSync(dataDir, { recursive: true });\nconst database = openGrowthDatabase({ localPath: join(dataDir, "growth-os.sqlite"), remoteUrl: remoteDatabaseUrl, authToken: remoteDatabaseToken, isVercel: Boolean(process.env.VERCEL) });\nconst db = database.db;\nconst persistenceMode = database.mode;\nif (!database.remote) db.exec("PRAGMA journal_mode=WAL;");\ndb.exec(`\n',
    'database boot',
)

# Journey/project kernel schema.
artifact_table = '  CREATE TABLE IF NOT EXISTS artifacts (id INTEGER PRIMARY KEY, profile_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE, task_key TEXT NOT NULL, title TEXT NOT NULL, skill TEXT NOT NULL, artifact_type TEXT NOT NULL, caption TEXT NOT NULL, content_text TEXT NOT NULL, link_url TEXT NOT NULL, media_mime TEXT NOT NULL, media_data TEXT NOT NULL, ai_context INTEGER NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL);\n'
server = insert_after(server, artifact_table, '  CREATE TABLE IF NOT EXISTS growth_journeys (id INTEGER PRIMARY KEY, profile_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE, title TEXT NOT NULL, status TEXT NOT NULL, active_goal_id INTEGER NOT NULL DEFAULT 0, active_project_id INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL, updated_at TEXT NOT NULL);\n  CREATE TABLE IF NOT EXISTS growth_projects (id INTEGER PRIMARY KEY, profile_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE, journey_id INTEGER NOT NULL DEFAULT 0, goal_id INTEGER NOT NULL DEFAULT 0, title TEXT NOT NULL, final_product TEXT NOT NULL, status TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL);\n', 'journey tables')
server = insert_after(server, '  CREATE INDEX IF NOT EXISTS artifacts_profile_time ON artifacts(profile_id,created_at);\n', '  CREATE INDEX IF NOT EXISTS growth_journeys_profile_status ON growth_journeys(profile_id,status,updated_at);\n  CREATE INDEX IF NOT EXISTS growth_projects_profile_status ON growth_projects(profile_id,status,updated_at);\n', 'journey indexes')
server = insert_after(server, 'ensureColumn("artifacts", "goal_id", "INTEGER NOT NULL DEFAULT 0");\n', 'ensureColumn("growth_goals", "journey_id", "INTEGER NOT NULL DEFAULT 0");\nensureColumn("actions", "journey_id", "INTEGER NOT NULL DEFAULT 0");\nensureColumn("actions", "project_id", "INTEGER NOT NULL DEFAULT 0");\nensureColumn("weekly_boss_runs", "journey_id", "INTEGER NOT NULL DEFAULT 0");\nensureColumn("growth_evidence", "journey_id", "INTEGER NOT NULL DEFAULT 0");\nensureColumn("growth_evidence", "project_id", "INTEGER NOT NULL DEFAULT 0");\nensureColumn("growth_evidence", "weekly_boss_run_id", "INTEGER NOT NULL DEFAULT 0");\n', 'journey columns')
primary_loop = '''for (const profile of db.prepare("SELECT DISTINCT profile_id FROM growth_goals WHERE status='active'").all()) {
  const primary = db.prepare("SELECT id FROM growth_goals WHERE profile_id=? AND status='active' AND is_primary=1 LIMIT 1").get(profile.profile_id);
  if (!primary) {
    const latest = db.prepare("SELECT id FROM growth_goals WHERE profile_id=? AND status='active' ORDER BY updated_at DESC,id DESC LIMIT 1").get(profile.profile_id);
    if (latest) db.prepare("UPDATE growth_goals SET is_primary=1 WHERE id=?").run(latest.id);
  }
}
'''
server = insert_after(server, primary_loop, 'backfillGrowthJourneys();\n', 'journey backfill call')

# API route and storage status.
server = insert_after(server, '    if (request.method === "GET" && url.pathname === "/api/goals") return handleListGoals(request, response, url);\n', '    if (request.method === "GET" && url.pathname === "/api/journey") return handleGetJourney(request, response, url);\n', 'journey route')
server = replace_once(
    server,
    '''        connected: Boolean(apiKey),
        provider: "SiliconFlow",
        model,
        newsAvailable: true
''',
    '''        connected: Boolean(apiKey),
        provider: "SiliconFlow",
        model,
        newsAvailable: true,
        storage: { mode: persistenceMode, durable: persistenceMode !== "ephemeral", label: database.label }
''',
    'status storage',
)

# Shared demo credentials are available only to the explicit local development gate.
server = replace_once(
    server,
    '  if (loginName === "admin") {\n',
    '  if (devAdminEnabled && loginName === "admin") {\n',
    'development-only admin guard',
)

# Goal records expose their journey.
server = replace_once(server, 'return { id: Number(row.id), title: row.title, why: row.why_text,', 'return { id: Number(row.id), journeyId: Number(row.journey_id || 0), title: row.title, why: row.why_text,', 'goal journey public')

journey_helpers = r'''
// GROWTHOS_JOURNEY_KERNEL_V2
function ensureJourneyForGoal(profileIdValue, goalId, activate = true) {
  const goal = db.prepare("SELECT * FROM growth_goals WHERE id=? AND profile_id=?").get(Number(goalId || 0), profileIdValue);
  if (!goal) return null;
  const now = nowIso();
  let journey = goal.journey_id ? db.prepare("SELECT * FROM growth_journeys WHERE id=? AND profile_id=?").get(goal.journey_id, profileIdValue) : null;
  if (!journey) {
    const result = db.prepare("INSERT INTO growth_journeys(profile_id,title,status,active_goal_id,active_project_id,created_at,updated_at) VALUES(?,?,?,?,?,?,?)")
      .run(profileIdValue, goal.title, activate ? "active" : "paused", goal.id, 0, now, now);
    journey = db.prepare("SELECT * FROM growth_journeys WHERE id=?").get(Number(result.lastInsertRowid));
    db.prepare("UPDATE growth_goals SET journey_id=? WHERE id=?").run(journey.id, goal.id);
  }
  let project = db.prepare("SELECT * FROM growth_projects WHERE profile_id=? AND journey_id=? ORDER BY id DESC LIMIT 1").get(profileIdValue, journey.id);
