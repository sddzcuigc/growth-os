import { readFileSync, writeFileSync } from "node:fs";

function replaceExact(text, before, after, label) {
  if (!text.includes(before)) throw new Error(`Missing expected source: ${label}`);
  return text.replace(before, after);
}

let app = readFileSync("app.js", "utf8");
app = replaceExact(app,
`  account: null,
  profiles: [],`,
`  account: null,
  accountHydrating: true,
  profiles: [],`,
"account hydration state");

app = replaceExact(app,
`function installProfiles(profiles) {
  state.profiles = profiles || [];
  for (const profile of state.profiles) {
    const template = children[profile.baseTemplate] || children.brother;
    children[profile.id] = { ...structuredClone(template), name: profile.name, shortAge: profile.age, avatar: profile.avatar };
  }
  if (!state.profiles.some((profile) => profile.id === state.childId)) state.childId = state.profiles[0]?.id || "brother";
}

async function loadAccount() {
  let account;
  try {
    const response = await fetch("/api/account");
    if (!response.ok) throw new Error("signed-out");
    account = await response.json();
  } catch {
    const localTest = typeof location !== "undefined" && ["127.0.0.1", "localhost"].includes(location.hostname);
    if (localTest) {
      try {
        const response = await fetch("/api/dev/login", { method: "POST" });
        if (!response.ok) throw new Error("dev-login");
        account = await response.json();
      } catch {}
    }
  }
  if (!account) { authOverlay.hidden = false; return; }
  state.account = account;
  installProfiles(state.account.profiles);
  authOverlay.hidden = true;
  if (!state.profiles.length) profileOverlay.hidden = false;
  else {
    try { await loadCloudProgress(state.childId); }
    catch (error) { console.warn("成长档案加载失败", error); showToast("部分云端档案暂时没有载入"); }
  }
  render();
}`,
`function installProfiles(profiles) {
  const previousProfileIds = state.profiles.map((profile) => profile.id);
  state.profiles = Array.isArray(profiles) ? profiles : [];
  for (const id of previousProfileIds) {
    if (!state.profiles.some((profile) => profile.id === id)) delete children[id];
  }
  for (const profile of state.profiles) {
    const template = children[profile.baseTemplate] || children.brother;
    children[profile.id] = { ...structuredClone(template), name: profile.name, shortAge: profile.age, avatar: profile.avatar };
  }
  if (!state.profiles.some((profile) => profile.id === state.childId)) state.childId = state.profiles[0]?.id || "brother";
  if (state.profiles.length) localStorage.setItem("talent-os-child", state.childId);
  else localStorage.removeItem("talent-os-child");
}

async function loadAccount() {
  state.accountHydrating = true;
  let account;
  try {
    const response = await fetch("/api/account");
    if (!response.ok) throw new Error("signed-out");
    account = await response.json();
  } catch {
    const localTest = typeof location !== "undefined" && ["127.0.0.1", "localhost"].includes(location.hostname);
    if (localTest) {
      try {
        const response = await fetch("/api/dev/login", { method: "POST" });
        if (!response.ok) throw new Error("dev-login");
        account = await response.json();
      } catch {}
    }
  }
  if (!account) {
    state.account = null;
    state.profiles = [];
    state.accountHydrating = false;
    authOverlay.hidden = false;
    profileOverlay.hidden = true;
    document.body.classList.remove("account-loading");
    render();
    return;
  }
  state.account = account;
  installProfiles(account.profiles);
  authOverlay.hidden = true;
  profileOverlay.hidden = state.profiles.length > 0;
  state.accountHydrating = false;
  render();
  document.body.classList.remove("account-loading");
  if (state.profiles.length) {
    try { await loadCloudProgress(state.childId); }
    catch (error) { console.warn("成长档案加载失败", error); showToast("部分云端档案暂时没有载入"); }
    render();
  }
}`,
"profile installation and account hydration");

app = replaceExact(app,
`  if (event.target.closest("[data-action='create-profile']")) {
    const payload = { name: document.querySelector("#profile-name")?.value.trim(), age: document.querySelector("#profile-age")?.value.trim(), avatar: document.querySelector("#profile-avatar")?.value, baseTemplate: document.querySelector("#profile-template")?.value, guardianConsent: Boolean(document.querySelector("#profile-consent")?.checked) };
    const error = document.querySelector("#profile-error");
    fetch("/api/profiles", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) })
      .then(async (response) => { const profile = await response.json(); if (!response.ok) throw new Error(profile.error); installProfiles([...state.profiles, profile]); state.childId = profile.id; profileOverlay.hidden = true; render(); showToast("新角色已创建"); })
      .catch((failure) => { error.textContent = failure.message || "创建失败"; });
    return;
  }`,
`  if (event.target.closest("[data-action='create-profile']")) {
    const button = event.target.closest("[data-action='create-profile']");
    const payload = { name: document.querySelector("#profile-name")?.value.trim(), age: document.querySelector("#profile-age")?.value.trim(), avatar: document.querySelector("#profile-avatar")?.value, baseTemplate: document.querySelector("#profile-template")?.value, guardianConsent: Boolean(document.querySelector("#profile-consent")?.checked) };
    const error = document.querySelector("#profile-error");
    error.textContent = "";
    button.disabled = true;
    button.textContent = "正在创建...";
    try {
      const response = await fetch("/api/profiles", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
      const profile = await response.json();
      if (!response.ok) throw new Error(profile.error || "创建失败");
      const profiles = [...state.profiles.filter((item) => item.id !== profile.id), profile];
      state.account = { ...state.account, profiles };
      installProfiles(profiles);
      state.childId = profile.id;
      localStorage.setItem("talent-os-child", profile.id);
      profileOverlay.hidden = true;
      render();
      showToast("新角色已创建");
      try { await loadCloudProgress(profile.id); } catch {}
      render();
    } catch (failure) {
      error.textContent = failure.message || "创建失败";
      button.disabled = false;
      button.textContent = "创建角色";
    }
    return;
  }`,
"create profile success flow");

app = replaceExact(app,
`render();
loadRuntimeStatus();
loadAccount();
setTimeout(() => trackEvent("app_opened", { page: state.page }), 800);`,
`document.body.classList.add("account-loading");
render();
loadRuntimeStatus();
loadAccount().finally(() => document.body.classList.remove("account-loading"));
setTimeout(() => trackEvent("app_opened", { page: state.page }), 800);`,
"startup hydration gate");
writeFileSync("app.js", app);

let server = readFileSync("api/server.js", "utf8");
server = replaceExact(server,
`const demoLoginEnabled = process.env.DEMO_LOGIN_ENABLED !== "false";`,
`const demoLoginEnabled = devAdminEnabled && process.env.DEMO_LOGIN_ENABLED === "true";`,
"demo login default");
server = replaceExact(server,
`function currentUser(request) {
  const token = cookieMap(request).growth_session;
  if (!token) return null;
  return db.prepare(\`SELECT users.id, users.email FROM sessions JOIN users ON users.id=sessions.user_id WHERE sessions.token=? AND sessions.expires_at>?\`).get(token, nowIso()) || null;
}`,
`function currentUser(request) {
  const token = cookieMap(request).growth_session;
  if (!token) return null;
  const user = db.prepare(\`SELECT users.id, users.email FROM sessions JOIN users ON users.id=sessions.user_id WHERE sessions.token=? AND sessions.expires_at>?\`).get(token, nowIso()) || null;
  if (!demoLoginEnabled && user?.email === "builtin-admin@growth-os.local") return null;
  return user;
}`,
"invalidate production demo sessions");
writeFileSync("api/server.js", server);

let html = readFileSync("index.html", "utf8");
html = html.replace("<body>", '<body class="account-loading">');
html = html.replace(/\s*<small class="demo-login-hint">[^<]*<\/small>/, "");
writeFileSync("index.html", html);

let css = readFileSync("styles.css", "utf8");
if (!css.includes("/* account-hydration-fix */")) css += `\n\n/* account-hydration-fix */\n[hidden] { display: none !important; }\nbody.account-loading .child-switcher,\nbody.account-loading #app-content,\nbody.account-loading .level-panel,\nbody.account-loading .tabbar,\nbody.account-loading .top-actions { visibility: hidden; }\nbody.account-loading .screen::after {\n  content: "正在载入成长档案…";\n  position: absolute;\n  inset: 46% 20px auto;\n  z-index: 120;\n  padding: 14px;\n  border: 3px solid #3d3324;\n  border-radius: 8px;\n  background: #f4dfad;\n  text-align: center;\n  font-weight: 800;\n  box-shadow: 0 6px 0 rgba(0,0,0,.25);\n}\n`;
writeFileSync("styles.css", css);

let authTest = readFileSync("tests/api/auth-security.test.mjs", "utf8");
authTest = replaceExact(authTest,
`  const registered = await directRequest("/api/auth/register", { method: "POST", body: { email, password } });`,
`  const demoLogin = await directRequest("/api/auth/login", { method: "POST", body: { email: "admin", password: "admin" } });
  assert.equal(demoLogin.status, 401);

  const registered = await directRequest("/api/auth/register", { method: "POST", body: { email, password } });`,
"production demo login regression test");
writeFileSync("tests/api/auth-security.test.mjs", authTest);
