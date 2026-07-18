# Support generic OpenAI-compatible model environment variables used by tests and deployments.
server = server_path.read_text(encoding='utf-8')
server = replace_once(server, 'const baseUrl = process.env.SILICONFLOW_BASE_URL || "https://api.siliconflow.cn/v1";\nconst model = process.env.SILICONFLOW_MODEL || "zai-org/GLM-5.2";\nconst apiKey = process.env.SILICONFLOW_API_KEY;\n', 'const baseUrl = process.env.AI_BASE_URL || process.env.SILICONFLOW_BASE_URL || "https://api.siliconflow.cn/v1";\nconst model = process.env.AI_MODEL || process.env.SILICONFLOW_MODEL || "zai-org/GLM-5.2";\nconst apiKey = process.env.AI_API_KEY || process.env.SILICONFLOW_API_KEY;\n', 'generic model environment')

# Persist login failure counters so lockout is deterministic and works across requests.
server = insert_after(server, '  CREATE TABLE IF NOT EXISTS sessions (token TEXT PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE, expires_at TEXT NOT NULL);\n', '  CREATE TABLE IF NOT EXISTS auth_attempts (attempt_key TEXT PRIMARY KEY, attempt_count INTEGER NOT NULL, window_started_at INTEGER NOT NULL, updated_at INTEGER NOT NULL);\n', 'auth attempts table')

auth_helpers = '''function requestIp(request) {
  const forwarded = String(request.headers["x-vercel-forwarded-for"] || request.headers["x-forwarded-for"] || "").split(",")[0].trim();
  return forwarded || request.socket?.remoteAddress || "local";
}
function loginAttemptKey(request, email) { return `${requestIp(request)}:${String(email || "").toLowerCase()}`; }
function loginAttemptConfig() {
  return { limit: Math.max(1, Number(process.env.AUTH_FAILURE_LIMIT || 10)), windowMs: Math.max(1, Number(process.env.AUTH_LOCK_MINUTES || 15)) * 60000 };
}
function isLoginLocked(request, email) {
  const key = loginAttemptKey(request, email);
  const row = db.prepare("SELECT attempt_count,window_started_at FROM auth_attempts WHERE attempt_key=?").get(key);
  if (!row) return false;
  const { limit, windowMs } = loginAttemptConfig();
  if (Date.now() - Number(row.window_started_at) > windowMs) { db.prepare("DELETE FROM auth_attempts WHERE attempt_key=?").run(key); return false; }
  return Number(row.attempt_count) >= limit;
}
function recordLoginFailure(request, email) {
  const key = loginAttemptKey(request, email);
  const now = Date.now();
  const { windowMs } = loginAttemptConfig();
  const row = db.prepare("SELECT attempt_count,window_started_at FROM auth_attempts WHERE attempt_key=?").get(key);
  if (!row || now - Number(row.window_started_at) > windowMs) {
    db.prepare("INSERT INTO auth_attempts(attempt_key,attempt_count,window_started_at,updated_at) VALUES(?,?,?,?) ON CONFLICT(attempt_key) DO UPDATE SET attempt_count=excluded.attempt_count,window_started_at=excluded.window_started_at,updated_at=excluded.updated_at").run(key, 1, now, now);
  } else {
    db.prepare("UPDATE auth_attempts SET attempt_count=attempt_count+1,updated_at=? WHERE attempt_key=?").run(now, key);
  }
}
function clearLoginFailures(request, email) { db.prepare("DELETE FROM auth_attempts WHERE attempt_key=?").run(loginAttemptKey(request, email)); }
'''
server = server.replace('async function handleLogin(request, response) {\n', auth_helpers + 'async function handleLogin(request, response) {\n', 1)
server = replace_once(server, '  const email = loginName;\n  const row = db.prepare("SELECT id,email,password_hash,recovery_hash,recovery_updated_at FROM users WHERE email=?").get(email);\n  if (!row || !verifyPassword(String(body.password || ""), row.password_hash)) return sendJson(response, 401, { error: "邮箱或密码不正确" });\n  createSession(response, row.id);\n', '  const email = loginName;\n  if (isLoginLocked(request, email)) return sendJson(response, 429, { error: "登录失败次数过多，请稍后再试" });\n  const row = db.prepare("SELECT id,email,password_hash,recovery_hash,recovery_updated_at FROM users WHERE email=?").get(email);\n  if (!row || !verifyPassword(String(body.password || ""), row.password_hash)) { recordLoginFailure(request, email); return sendJson(response, 401, { error: "邮箱或密码不正确" }); }\n  clearLoginFailures(request, email);\n  createSession(response, row.id);\n', 'login lockout')
server_path.write_text(server, encoding='utf-8')
