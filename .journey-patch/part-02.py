    '  const journey = activeJourneyRow(profileIdValue);\n  const projectId = Number(journey?.active_project_id || 0);\n  const result = db.prepare("INSERT INTO weekly_boss_runs(profile_id,boss_id,difficulty,week_start,source_blueprint_id,source_project_id,shield_total,shield_broken,hp_total,hp_remaining,status,selection_json,created_at,updated_at,journey_id) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)").run(profileIdValue, picked.boss.id, difficulty, weekStart, picked.blueprintRow?.updated_at || "unversioned", String(projectId || ""), 6, 0, 40, 40, "active", JSON.stringify(picked.selection), now, now, Number(journey?.id || 0));',
    'boss insert lineage',
)
server = insert_after(server, '  if (!tasks.length) return sendJson(response, 400, { error: "每天需要1到3项合理核心任务" });\n', '  const expectedProjectId = Number(weekly.source_project_id || 0);\n  if (expectedProjectId && tasks.some((task) => /^project:(\\d+):/.test(task.sourceRef) && Number(task.sourceRef.match(/^project:(\\d+):/)[1]) !== expectedProjectId)) return sendJson(response, 409, { error: "今日任务不属于本周主线项目，请重新同步当前项目" });\n', 'boss project validation')
server = replace_once(
    server,
    '    const evidenceResult = db.prepare("INSERT INTO growth_evidence(profile_id,skill_id,source_type,source_id,evidence_level,summary,observable_json,child_confirmed,guardian_confirmed,ai_context,created_at) VALUES(?,?,?,?,?,?,?,?,?,?,?)").run(row.profile_id, challenge.skillId, "mini_boss", String(row.id), 2, String(body.summary || `完成${challenge.title}`).slice(0, 220), JSON.stringify([String(body.observableFact || challenge.success).slice(0, 220)]), 1, null, body.shareWithAi === false ? 0 : 1, now);',
    '    const weekly = db.prepare("SELECT * FROM weekly_boss_runs WHERE id=?").get(row.weekly_boss_run_id);\n    const evidenceResult = db.prepare("INSERT INTO growth_evidence(profile_id,skill_id,source_type,source_id,evidence_level,summary,observable_json,child_confirmed,guardian_confirmed,ai_context,created_at,journey_id,project_id,weekly_boss_run_id) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)").run(row.profile_id, challenge.skillId, "mini_boss", String(row.id), 2, String(body.summary || `完成${challenge.title}`).slice(0, 220), JSON.stringify({ facts: [String(body.observableFact || challenge.success).slice(0, 220)], challenge: challenge.title }), 1, null, body.shareWithAi === false ? 0 : 1, now, Number(weekly?.journey_id || 0), Number(weekly?.source_project_id || 0), Number(row.weekly_boss_run_id));',
    'mini boss evidence lineage',
)

# Export includes the new lineage.
server = insert_after(server, '  const familyBriefs = db.prepare("SELECT week_start AS weekStart,report_json AS report,status,provider,created_at AS createdAt,updated_at AS updatedAt FROM family_briefs WHERE profile_id=? ORDER BY week_start").all(id).map((item) => ({ ...item, report: JSON.parse(item.report) }));\n', '  const growthJourneys = db.prepare("SELECT id,title,status,active_goal_id AS activeGoalId,active_project_id AS activeProjectId,created_at AS createdAt,updated_at AS updatedAt FROM growth_journeys WHERE profile_id=? ORDER BY id").all(id);\n  const growthProjects = db.prepare("SELECT id,journey_id AS journeyId,goal_id AS goalId,title,final_product AS finalProduct,status,created_at AS createdAt,updated_at AS updatedAt FROM growth_projects WHERE profile_id=? ORDER BY id").all(id);\n  const growthEvidence = db.prepare("SELECT * FROM growth_evidence WHERE profile_id=? ORDER BY id").all(id).map(publicJourneyEvidence);\n', 'export journey vars')
server = replace_once(server, 'schemaVersion: 11,', 'schemaVersion: 13,', 'export schema version')
server = replace_once(server, 'progress: snapshot ? JSON.parse(snapshot.data_json) : {}, growthGoals,', 'progress: snapshot ? JSON.parse(snapshot.data_json) : {}, growthJourneys, growthProjects, growthEvidence, growthGoals,', 'export journey fields')

server_path.write_text(server, encoding='utf-8')

# Frontend reads the server journey and uses the real project id for Boss task refs.
app = app_path.read_text(encoding='utf-8')
app = insert_after(app, '  goals: [],\n', '  journey: null,\n', 'app journey state')
app = insert_after(app, 'async function loadGrowthBlueprint() {\n', '''async function loadJourney() {
  if (!currentProfile()) return;
  try {
    const response = await fetch(`/api/journey?profileId=${encodeURIComponent(state.childId)}`);
    if (!response.ok) return;
    state.journey = (await response.json()).journey || null;
  } catch {}
}

''', 'app journey loader')
app = insert_after(app, '  await loadBossSystem();\n', '  await loadJourney();\n', 'app load journey')
app = replace_once(app, 'const projectId = state.bossState?.week?.id || journey?.id || "unconfirmed";', 'const projectId = state.bossState?.week?.sourceProjectId || state.journey?.project?.id || "unconfirmed";', 'app boss project ref')
app = replace_once(app, 'return state.goals.find((goal) => goal.status === "active" && goal.isPrimary) || state.goals.find((goal) => goal.status === "active") || null;', 'return state.journey?.goal || state.goals.find((goal) => goal.status === "active" && goal.isPrimary) || state.goals.find((goal) => goal.status === "active") || null;', 'app current journey')
app = replace_once(app, '        goalId: activeGoal.id\n', '        goalId: activeGoal.id,\n        journeyId: activeGoal.journeyId || state.journey?.id || 0\n', 'app action journey')
app_path.write_text(app, encoding='utf-8')

# Remove exposed shared demo credentials from the production login UI.
index = index_path.read_text(encoding='utf-8')
index = re.sub(r'\s*<small class="demo-login-hint">[^<]*</small>', '', index, count=1)
index_path.write_text(index, encoding='utf-8')

# Local node:sqlite; remote libSQL is loaded only when configured.
db_path.write_text('''import { createRequire } from "node:module";
import { DatabaseSync } from "node:sqlite";

const require = createRequire(import.meta.url);
let RemoteDatabase = null;

function cleanRow(row) {
  if (!row || typeof row !== "object") return row;
  const { _metadata, ...clean } = row;
  return { ...clean };
}

function wrapStatement(statement) {
  return {
    run: (...args) => statement.run(...args),
    get: (...args) => cleanRow(statement.get(...args)),
    all: (...args) => statement.all(...args).map(cleanRow)
  };
}

function wrapDatabase(raw) {
  return {
    exec: (sql) => raw.exec(sql),
    prepare: (sql) => wrapStatement(raw.prepare(sql)),
    close: () => raw.close?.()
  };
}

function remoteConstructor() {
  if (RemoteDatabase) return RemoteDatabase;
  const loaded = require("libsql");
  RemoteDatabase = loaded?.default || loaded;
  return RemoteDatabase;
}

export function openGrowthDatabase({ localPath, remoteUrl = "", authToken = "", isVercel = false }) {
  const normalizedUrl = String(remoteUrl || "").trim();
  const remote = /^(?:libsql|https?|wss?):\\/\\//i.test(normalizedUrl);
  if (normalizedUrl && !remote) throw new Error("TURSO_DATABASE_URL 必须使用 libsql、https、http、wss 或 ws 协议");
  if (remote && /^libsql:\\/\\//i.test(normalizedUrl) && !authToken) throw new Error("远程 libSQL 数据库缺少 TURSO_AUTH_TOKEN");
  const RawDatabase = remote ? remoteConstructor() : DatabaseSync;
  const raw = remote ? new RawDatabase(normalizedUrl, { authToken }) : new RawDatabase(localPath);
  return { db: wrapDatabase(raw), remote, mode: remote ? "remote-libsql" : isVercel ? "ephemeral" : "local-sqlite", label: remote ? normalizedUrl.replace(/:\\/\\/.*@/, "://***@") : localPath };
}
''', encoding='utf-8')

# Add a compact validation gate without depending on exact formatting of the old validator.
validator = validator_path.read_text(encoding='utf-8')
validator += '''
// Journey kernel deployment gates.
const journeyServer = readFileSync(resolve(root, "api/server.js"), "utf8");
const journeyApp = readFileSync(resolve(root, "app.js"), "utf8");
assert.ok(journeyServer.includes("GROWTHOS_JOURNEY_KERNEL_V2"), "Journey kernel marker is missing");
assert.ok(journeyServer.includes('url.pathname === "/api/journey"'), "Journey API route is missing");
assert.ok(journeyServer.includes("growth_journeys"), "Journey table is missing");
assert.ok(journeyServer.includes("weekly_boss_run_id"), "Evidence lineage is missing");
assert.ok(journeyApp.includes("state.journey?.goal"), "Frontend does not read the server journey");
assert.ok(!journeyServer.includes('loginName === "admin"'), "Production shared admin login must not exist");
'''
validator_path.write_text(validator, encoding='utf-8')

print('Applied GrowthOS Journey kernel v2')
