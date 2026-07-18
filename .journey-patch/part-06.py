# Complete account deletion and protect delayed AI writes after deletion.
server = server_path.read_text(encoding='utf-8')
server = insert_after(server, '    if (request.method === "GET" && url.pathname === "/api/account") return handleAccount(request, response);\n', '    if (request.method === "GET" && url.pathname === "/api/auth/me") return handleAccount(request, response);\n    if (request.method === "DELETE" && url.pathname === "/api/account") return handleDeleteAccount(request, response);\n', 'account routes')

delete_account_handler = '''async function handleDeleteAccount(request, response) {
  const user = requireUser(request, response); if (!user) return;
  const body = await readBodyJson(request);
  if (String(body.confirmation || "").trim() !== "删除我的账号") return sendJson(response, 400, { error: "请输入“删除我的账号”确认永久删除" });
  const row = db.prepare("SELECT password_hash FROM users WHERE id=?").get(user.id);
  if (!row || !verifyPassword(String(body.password || ""), row.password_hash)) return sendJson(response, 401, { error: "当前密码不正确" });
  db.exec("BEGIN");
  try {
    db.prepare("DELETE FROM users WHERE id=?").run(user.id);
    db.exec("COMMIT");
  } catch (error) { db.exec("ROLLBACK"); throw error; }
  response.setHeader("set-cookie", "growth_session=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0");
  sendJson(response, 200, { ok: true, deletedAt: nowIso() });
}
'''
server = server.replace('async function handleCreateProfile(request, response) {\n', delete_account_handler + 'async function handleCreateProfile(request, response) {\n', 1)
server = insert_after(server, 'function ownedProfile(userId, id) { return db.prepare("SELECT * FROM profiles WHERE id=? AND user_id=?").get(id, userId); }\n', 'function revalidateProfileAfterAsync(userId, id, response) {\n  if (ownedProfile(userId, id)) return true;\n  sendJson(response, 410, { error: "账号或角色已删除，本次生成未保存" });\n  return false;\n}\n', 'async profile revalidation')
server = replace_once(server, '    : await generateDailyMissionBook(profile, body, baseTasks);\n  const now = nowIso();\n', '    : await generateDailyMissionBook(profile, body, baseTasks);\n  if (!revalidateProfileAfterAsync(user.id, profileIdValue, response)) return;\n  const now = nowIso();\n', 'daily mission deletion race')
server_path.write_text(server, encoding='utf-8')
