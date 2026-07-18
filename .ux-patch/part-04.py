# Public demo login and request-selectable SiliconFlow chat models.
server = server_path.read_text(encoding='utf-8')
server = insert_after(
    server,
    'const devAdminEnabled = process.env.NODE_ENV !== "production" && ["127.0.0.1", "localhost"].includes(host) && process.env.ENABLE_TEST_ADMIN !== "false";\n',
    'const demoLoginEnabled = process.env.DEMO_LOGIN_ENABLED !== "false";\n',
    'demo login flag',
)
server = replace_once(server, '  if (devAdminEnabled && loginName === "admin") {', '  if (demoLoginEnabled && loginName === "admin") {', 'public demo login')
helpers = '''
function requestedModel(value) {
  const candidate = String(value || "").trim();
  return /^[A-Za-z0-9._/-]{3,160}$/.test(candidate) ? candidate : model;
}
let modelCatalogCache = { expiresAt: 0, models: [] };
async function siliconFlowChatModels() {
  if (!apiKey) return [model];
  if (modelCatalogCache.expiresAt > Date.now() && modelCatalogCache.models.length) return modelCatalogCache.models;
  const response = await fetch(`${baseUrl.replace(/\\/$/, "")}/models?type=text&sub_type=chat`, {
    headers: { authorization: `Bearer ${apiKey}` }, signal: AbortSignal.timeout(5000)
  });
  if (!response.ok) throw new Error(`models ${response.status}`);
  const json = await response.json();
  const models = (Array.isArray(json.data) ? json.data : [])
    .map((item) => String(item?.id || ""))
    .filter((id) => /^[A-Za-z0-9._/-]{3,160}$/.test(id))
    .sort();
  modelCatalogCache = { expiresAt: Date.now() + 10 * 60000, models: models.length ? models : [model] };
  return modelCatalogCache.models;
}
async function handleModels(request, response) {
  try { sendJson(response, 200, { defaultModel: model, models: await siliconFlowChatModels() }); }
  catch { sendJson(response, 200, { defaultModel: model, models: [model] }); }
}
'''
server = insert_after(server, 'function nowIso() { return new Date().toISOString(); }\n', helpers, 'model helpers')
server = server.replace(
    'body: JSON.stringify({ model,',
    'body: JSON.stringify({ model: requestedModel(typeof body !== "undefined" ? body?.model : typeof payload !== "undefined" ? payload?.model : ""),',
)
server = insert_after(
    server,
    '    if (request.method === "POST" && url.pathname === "/api/dev/login") return handleDevLogin(request, response);\n',
    '    if (request.method === "GET" && url.pathname === "/api/models") return handleModels(request, response);\n',
    'models route',
)
server_path.write_text(server, encoding='utf-8')
