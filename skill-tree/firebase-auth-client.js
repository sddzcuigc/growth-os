(() => {
  const CONFIG = {
    apiKey: "AIzaSyCXR558cLgEwtLHmH_MjwG1hB0xgMHX-74",
    authDomain: "mail-f14f3.firebaseapp.com",
    projectId: "mail-f14f3",
    storageBucket: "mail-f14f3.firebasestorage.app",
    messagingSenderId: "161956583208",
    appId: "1:161956583208:web:85caab60e48b7cb1b6a21d",
    measurementId: "G-C3VBPX90B8"
  };
  const ACCOUNT_API = "https://growth-os-ten-pearl.vercel.app/api/family-skill-tree-auth";
  const VERSION_KEY = "cui-family-skill-tree-account-version";
  const DIRTY_KEY = "cui-family-skill-tree-account-dirty";
  const BOUND_UID_KEY = "cui-family-skill-tree-account-uid";
  const LOCAL_MODE_KEY = "cui-family-skill-tree-local-mode";

  let auth;
  let currentUser = null;
  let accountVersion = Number(localStorage.getItem(VERSION_KEY) || 0);
  let accountSyncing = false;
  let accountTimer = null;

  injectStyles();
  const ui = injectUi();
  wrapLocalSave();
  bindUi();
  updateAccountUi();
  initializeFirebase();

  function injectStyles() {
    const style = document.createElement("style");
    style.textContent = `
      .auth-gate{position:fixed;inset:0;z-index:300;display:grid;place-items:center;padding:16px;background:linear-gradient(145deg,rgba(17,55,43,.95),rgba(31,85,58,.93));backdrop-filter:blur(10px)}
      .auth-gate.hidden{display:none}.auth-card{width:min(520px,100%);border-radius:30px;padding:24px;background:linear-gradient(160deg,#fffdf3,#effbea);box-shadow:0 28px 80px rgba(0,0,0,.34);border:1px solid rgba(255,255,255,.65);color:#254337}
      .auth-brand{display:flex;gap:14px;align-items:center;margin-bottom:16px}.auth-logo{width:62px;height:62px;border-radius:20px;display:grid;place-items:center;font-size:36px;background:linear-gradient(145deg,#dff7cb,#fff3a8)}
      .auth-brand h2{margin:0;font-size:28px}.auth-brand p{margin:5px 0 0;color:#708179}.auth-form{display:grid;gap:11px}.auth-form input{width:100%;padding:14px 15px;border:1px solid #cad9cd;border-radius:15px;background:white;font-size:16px}
      .auth-actions{display:grid;grid-template-columns:1fr 1fr;gap:9px}.auth-actions .wide{grid-column:1/-1}.google-auth-btn{background:white!important;color:#35453e!important;border:1px solid #d4dfd6!important}
      .auth-status{min-height:24px;margin:10px 0 2px;color:#65776e;font-size:14px;line-height:1.5}.auth-status.error{color:#b13e38}.auth-status.ok{color:#2e8147}.auth-minor{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}.auth-minor button{border:0;background:transparent;color:#427351;font-weight:800;text-decoration:underline;cursor:pointer}
      .account-sync-card{grid-column:1/-1;margin-top:8px;padding:16px;border-radius:20px;background:linear-gradient(145deg,#eef9ef,#fffdf4);border:1px solid rgba(52,112,73,.16)}
      .account-sync-head{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:8px}.account-sync-head strong{font-size:19px}.account-sync-status{display:inline-flex;padding:7px 10px;border-radius:999px;background:#e8eee9;color:#64726a;font-size:12px;font-weight:900}.account-sync-status.ok{background:#dff5df;color:#2e7b42}.account-sync-status.pending{background:#fff0b9;color:#7b5b10}.account-sync-status.error{background:#ffe0de;color:#a33e38}
      .account-user-row{display:flex;align-items:center;gap:11px;padding:12px;border-radius:16px;background:rgba(255,255,255,.82);margin:10px 0}.account-avatar{width:44px;height:44px;border-radius:14px;display:grid;place-items:center;background:#e5f6df;font-size:22px}.account-user-row strong,.account-user-row small{display:block}.account-user-row small{margin-top:3px;color:#74857c}
      .account-actions{display:flex;flex-wrap:wrap;gap:8px}.account-note{display:block;margin-top:10px;color:#7d8d84;font-size:12px;line-height:1.5}.legacy-sync-wrap{grid-column:1/-1;margin-top:8px}.legacy-sync-wrap summary{cursor:pointer;font-weight:900;color:#64786c}.account-top-chip{margin-left:auto;background:rgba(255,255,255,.13);color:#fff;border:1px solid rgba(255,255,255,.22);border-radius:999px;padding:8px 12px;font-weight:800;font-size:13px;white-space:nowrap}
      @media(max-width:640px){.auth-card{padding:19px;border-radius:24px}.auth-actions{grid-template-columns:1fr}.auth-actions .wide{grid-column:auto}.auth-brand h2{font-size:24px}.account-actions{display:grid;grid-template-columns:1fr 1fr}.account-top-chip{display:none}}
    `;
    document.head.appendChild(style);
  }

  function injectUi() {
    const gate = document.createElement("div");
    gate.className = "auth-gate";
    gate.id = "firebaseAuthGate";
    gate.innerHTML = `
      <div class="auth-card">
        <div class="auth-brand"><div class="auth-logo">🌳</div><div><h2>进入崔家成长森林</h2><p>登录后换手机也能找回全部成长记录</p></div></div>
        <div class="auth-form">
          <input id="firebaseAuthEmail" type="email" autocomplete="email" placeholder="家长邮箱">
          <input id="firebaseAuthPassword" type="password" autocomplete="current-password" minlength="6" placeholder="密码（至少 6 位）">
          <div class="auth-actions">
            <button class="btn btn-green" id="firebaseEmailLogin" type="button">邮箱登录</button>
            <button class="btn btn-gold" id="firebaseEmailRegister" type="button">注册并发激活邮件</button>
            <button class="btn google-auth-btn wide" id="firebaseGoogleLogin" type="button">G　使用 Google 登录</button>
          </div>
          <div class="auth-status" id="firebaseAuthStatus">正在初始化登录服务……</div>
          <div class="auth-minor">
            <button id="firebaseResetPassword" type="button">忘记密码</button>
            <button id="firebaseResendVerify" type="button">重发激活邮件</button>
            <button id="firebaseRefreshVerify" type="button">我已激活，重新检查</button>
            <button id="firebaseLocalMode" type="button">暂时只在本机使用</button>
          </div>
        </div>
      </div>`;
    document.body.appendChild(gate);

    const parentTools = document.querySelector("#parentDialog .parent-tools");
    const oldSync = parentTools?.querySelector(".sync-card");
    const card = document.createElement("div");
    card.className = "account-sync-card";
    card.innerHTML = `
      <div class="account-sync-head"><strong>👤 家长账号与云同步</strong><span class="account-sync-status" id="firebaseAccountStatus">尚未登录</span></div>
      <p>使用邮箱或 Google 登录后，树、技能果实、浇水次数、练习时间、金币和宝石会自动保存到 Turso 云数据库。</p>
      <div class="account-user-row"><div class="account-avatar">📧</div><div><strong id="firebaseAccountEmail">未登录</strong><small id="firebaseAccountProvider">可以继续使用本机模式</small></div></div>
      <div class="account-actions">
        <button class="btn btn-green" id="firebaseOpenLogin" type="button">登录 / 注册</button>
        <button class="btn btn-white" id="firebaseAccountPull" type="button">下载云端</button>
        <button class="btn btn-white" id="firebaseAccountPush" type="button">上传本机</button>
        <button class="btn btn-red" id="firebaseAccountLogout" type="button">退出账号</button>
      </div>
      <small class="account-note">邮箱密码由 Firebase Authentication 处理，本站后端只验证短期登录令牌；成长数据仍保存在现有 Turso 数据库。</small>`;
    if (parentTools) parentTools.insertBefore(card, oldSync || null);
    if (oldSync) {
      const details = document.createElement("details");
      details.className = "legacy-sync-wrap";
      details.innerHTML = "<summary>旧版家庭同步码（兼容与恢复）</summary>";
      oldSync.replaceWith(details);
      details.appendChild(oldSync);
    }

    const nav = document.querySelector(".game-nav");
    const parentButton = document.getElementById("parentToolsBtn");
    const chip = document.createElement("span");
    chip.className = "account-top-chip";
    chip.id = "firebaseTopAccount";
    chip.textContent = "本机模式";
    if (nav && parentButton) nav.insertBefore(chip, parentButton);

    return {
      gate,
      email: gate.querySelector("#firebaseAuthEmail"),
      password: gate.querySelector("#firebaseAuthPassword"),
      status: gate.querySelector("#firebaseAuthStatus"),
      accountStatus: card.querySelector("#firebaseAccountStatus"),
      accountEmail: card.querySelector("#firebaseAccountEmail"),
      accountProvider: card.querySelector("#firebaseAccountProvider"),
      openLogin: card.querySelector("#firebaseOpenLogin"),
      pull: card.querySelector("#firebaseAccountPull"),
      push: card.querySelector("#firebaseAccountPush"),
      logout: card.querySelector("#firebaseAccountLogout"),
      topChip: chip
    };
  }

  function wrapLocalSave() {
    if (typeof saveState !== "function") return;
    const original = saveState;
    saveState = function wrappedSaveState(...args) {
      const result = original.apply(this, args);
      localStorage.setItem(DIRTY_KEY, "1");
      markDirty();
      return result;
    };
  }

  function bindUi() {
    document.getElementById("firebaseEmailRegister").addEventListener("click", registerEmail);
    document.getElementById("firebaseEmailLogin").addEventListener("click", loginEmail);
    document.getElementById("firebaseGoogleLogin").addEventListener("click", loginGoogle);
    document.getElementById("firebaseResetPassword").addEventListener("click", resetPassword);
    document.getElementById("firebaseResendVerify").addEventListener("click", resendVerification);
    document.getElementById("firebaseRefreshVerify").addEventListener("click", refreshVerification);
    document.getElementById("firebaseLocalMode").addEventListener("click", () => {
      localStorage.setItem(LOCAL_MODE_KEY, "1");
      hideGate();
      updateAccountUi("本机模式");
      notify("当前仅保存在本机，可随时登录");
    });
    ui.openLogin.addEventListener("click", () => {
      localStorage.removeItem(LOCAL_MODE_KEY);
      showGate();
    });
    ui.pull.addEventListener("click", () => pullAccount(true));
    ui.push.addEventListener("click", () => pushAccount(true));
    ui.logout.addEventListener("click", logout);
  }

  function initializeFirebase() {
    try {
      if (!window.firebase) throw new Error("Firebase SDK 未加载");
      if (!firebase.apps.length) firebase.initializeApp(CONFIG);
      auth = firebase.auth();
      auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL).catch(() => {});
      auth.getRedirectResult().catch(() => {});
      auth.onAuthStateChanged(async user => {
        currentUser = user;
        if (user) {
          await user.reload().catch(() => {});
          currentUser = auth.currentUser;
          ui.email.value = currentUser?.email || "";
          localStorage.removeItem(LOCAL_MODE_KEY);
          if (currentUser?.emailVerified) {
            hideGate();
            setStatus("登录成功，正在恢复成长森林……", "ok");
            await bootstrapAccount();
          } else {
            showGate("请先到邮箱点击激活链接。", "error");
            updateAccountUi("等待邮箱激活", "pending");
          }
        } else {
          updateAccountUi();
          if (localStorage.getItem(LOCAL_MODE_KEY) === "1") hideGate();
          else showGate("首次注册后需要点击邮箱中的激活链接。");
        }
      });
    } catch (error) {
      setStatus(`登录服务初始化失败：${friendlyError(error)}`, "error");
      updateAccountUi("登录服务不可用", "error");
    }
  }

  async function registerEmail() {
    try {
      const email = ui.email.value.trim();
      const password = ui.password.value;
      if (!email || password.length < 6) return setStatus("请输入正确邮箱，密码至少 6 位。", "error");
      setStatus("正在创建账号……");
      const result = await auth.createUserWithEmailAndPassword(email, password);
      await result.user.sendEmailVerification({ url: `${location.origin}/?verified=1` });
      currentUser = result.user;
      setStatus("激活邮件已发送。点击邮件中的链接后，回来点“我已激活”。", "ok");
      updateAccountUi("等待邮箱激活", "pending");
    } catch (error) {
      setStatus(friendlyError(error), "error");
    }
  }

  async function loginEmail() {
    try {
      setStatus("正在登录……");
      await auth.signInWithEmailAndPassword(ui.email.value.trim(), ui.password.value);
      if (!auth.currentUser?.emailVerified) showGate("账号尚未激活，请先查看激活邮件。", "error");
    } catch (error) {
      setStatus(friendlyError(error), "error");
    }
  }

  async function loginGoogle() {
    const provider = new firebase.auth.GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    try {
      setStatus("正在打开 Google 登录……");
      await auth.signInWithPopup(provider);
    } catch (error) {
      if (["auth/popup-blocked", "auth/operation-not-supported-in-this-environment"].includes(error.code)) {
        await auth.signInWithRedirect(provider);
      } else {
        setStatus(friendlyError(error), "error");
      }
    }
  }

  async function resetPassword() {
    const email = ui.email.value.trim();
    if (!email) return setStatus("先填写需要找回密码的邮箱。", "error");
    try {
      await auth.sendPasswordResetEmail(email);
      setStatus("重置密码邮件已发送。", "ok");
    } catch (error) {
      setStatus(friendlyError(error), "error");
    }
  }

  async function resendVerification() {
    try {
      if (!auth.currentUser) throw new Error("请先用邮箱密码登录");
      await auth.currentUser.sendEmailVerification({ url: `${location.origin}/?verified=1` });
      setStatus("新的激活邮件已经发送。", "ok");
    } catch (error) {
      setStatus(friendlyError(error), "error");
    }
  }

  async function refreshVerification() {
    try {
      if (!auth.currentUser) throw new Error("请先输入邮箱和密码登录");
      await auth.currentUser.reload();
      currentUser = auth.currentUser;
      if (currentUser.emailVerified) {
        hideGate();
        setStatus("邮箱已激活，正在同步……", "ok");
        await bootstrapAccount();
      } else {
        setStatus("暂时还没有检测到激活，请确认点开了最新邮件中的链接。", "error");
      }
      updateAccountUi();
    } catch (error) {
      setStatus(friendlyError(error), "error");
    }
  }

  async function logout() {
    if (!currentUser) return;
    await auth.signOut();
    localStorage.removeItem(BOUND_UID_KEY);
    localStorage.removeItem(VERSION_KEY);
    accountVersion = 0;
    showGate("已退出账号，本机记录仍然保留。");
    updateAccountUi();
  }

  async function idToken() {
    if (!currentUser) throw new Error("请先登录");
    return currentUser.getIdToken();
  }

  async function requestAccount(method, body) {
    const response = await fetch(ACCOUNT_API, {
      method,
      headers: { authorization: `Bearer ${await idToken()}`, "content-type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
      cache: "no-store"
    });
    let data = {};
    try { data = await response.json(); } catch {}
    return { response, data };
  }

  async function bootstrapAccount() {
    if (!currentUser?.emailVerified || accountSyncing) return;
    accountSyncing = true;
    updateAccountUi("正在连接账号……", "pending");
    try {
      const result = await requestAccount("GET");
      const boundUid = localStorage.getItem(BOUND_UID_KEY);
      if (result.response.status === 404) {
        let uploadState = state;
        if (typeof syncToken !== "undefined" && syncToken && typeof cloudRequest === "function") {
          try {
            const legacy = await cloudRequest("GET");
            if (legacy.response.ok && legacy.data?.state?.children && confirm("检测到旧同步码中的云端数据，是否迁移到当前邮箱账号？")) {
              uploadState = migrate(legacy.data.state);
              ensureRequiredSkills(uploadState);
            }
          } catch {}
        }
        const created = await requestAccount("POST", { state: uploadState });
        if (!created.response.ok) throw new Error(created.data.error || `HTTP ${created.response.status}`);
        if (uploadState !== state) {
          state = uploadState;
          selectedChildId = state.children[0]?.id;
          render();
        }
        accountVersion = Number(created.data.version || 1);
        localStorage.setItem(VERSION_KEY, String(accountVersion));
        localStorage.setItem(BOUND_UID_KEY, currentUser.uid);
        localStorage.removeItem(DIRTY_KEY);
        updateAccountUi("本机数据已迁移到账号", "ok");
        notify("成长数据已保存到账号");
      } else if (!result.response.ok) {
        throw new Error(result.data.error || `HTTP ${result.response.status}`);
      } else if (boundUid !== currentUser.uid) {
        const useLocal = confirm("这个账号已经有云端成长数据。\n\n点“确定”使用当前设备数据覆盖云端；点“取消”下载账号里的云端数据。");
        if (useLocal) {
          accountVersion = Number(result.data.version || 0);
          await pushAccount(true, true);
        } else {
          applyAccountState(result.data);
        }
      } else if (localStorage.getItem(DIRTY_KEY) === "1") {
        accountVersion = Number(result.data.version || 0);
        await pushAccount(false, true);
      } else {
        applyAccountState(result.data);
      }
    } catch (error) {
      updateAccountUi("账号云同步暂时不可用", "error");
      notify(friendlyError(error));
    } finally {
      accountSyncing = false;
    }
  }

  async function pullAccount(manual = false) {
    if (!currentUser?.emailVerified) return manual && showGate("请先登录并完成邮箱激活", "error");
    if (accountSyncing) return;
    accountSyncing = true;
    updateAccountUi("正在下载……", "pending");
    try {
      const result = await requestAccount("GET");
      if (result.response.status === 404) {
        if (manual && confirm("账号里还没有数据，是否上传当前设备数据？")) await pushAccount(true, true);
        else updateAccountUi("账号云端尚无数据", "pending");
        return;
      }
      if (!result.response.ok) throw new Error(result.data.error || `HTTP ${result.response.status}`);
      applyAccountState(result.data);
      if (manual) notify("已下载账号云端数据");
    } catch (error) {
      updateAccountUi("下载失败，本机数据仍安全", "error");
      if (manual) notify(friendlyError(error));
    } finally {
      accountSyncing = false;
    }
  }

  async function pushAccount(manual = false, alreadyLocked = false) {
    if (!currentUser?.emailVerified) return manual && showGate("请先登录并完成邮箱激活", "error");
    if (accountSyncing && !alreadyLocked) return;
    accountSyncing = true;
    clearTimeout(accountTimer);
    updateAccountUi("正在上传……", "pending");
    try {
      let result = await requestAccount("PUT", { state, expectedVersion: accountVersion });
      if (result.response.status === 409) {
        accountVersion = Number(result.data.version || 0);
        localStorage.setItem(VERSION_KEY, String(accountVersion));
        if (manual) {
          const overwrite = confirm("账号云端有其他设备的新修改。\n\n点“确定”用本机覆盖；点“取消”下载云端版本。");
          if (overwrite) result = await requestAccount("PUT", { state, expectedVersion: accountVersion });
          else { applyAccountState(result.data); return; }
        } else {
          updateAccountUi("发现其他设备的新版本", "error");
          notify("发现同步冲突，请在家长工具中处理");
          return;
        }
      }
      if (!result.response.ok) throw new Error(result.data.error || `HTTP ${result.response.status}`);
      accountVersion = Number(result.data.version || accountVersion || 1);
      localStorage.setItem(VERSION_KEY, String(accountVersion));
      localStorage.setItem(BOUND_UID_KEY, currentUser.uid);
      localStorage.removeItem(DIRTY_KEY);
      updateAccountUi(`已同步 · 版本 ${accountVersion}`, "ok");
      if (manual) notify("本机数据已上传到账号");
    } catch (error) {
      localStorage.setItem(DIRTY_KEY, "1");
      updateAccountUi("上传失败，已保留在本机", "error");
      if (manual) notify(friendlyError(error));
    } finally {
      accountSyncing = false;
    }
  }

  function applyAccountState(data) {
    if (!data?.state?.children) return;
    const keep = selectedChildId;
    state = migrate(data.state);
    ensureRequiredSkills(state);
    selectedChildId = state.children.some(child => child.id === keep) ? keep : state.children[0]?.id;
    accountVersion = Number(data.version || 0);
    localStorage.setItem(VERSION_KEY, String(accountVersion));
    localStorage.setItem(BOUND_UID_KEY, currentUser.uid);
    localStorage.removeItem(DIRTY_KEY);
    const json = JSON.stringify(state);
    localStorage.setItem(ACTIVE_KEY, json);
    if (typeof lastLocalJson !== "undefined") lastLocalJson = json;
    render();
    updateAccountUi(`已同步 · 版本 ${accountVersion}`, "ok");
  }

  function markDirty() {
    if (!currentUser?.emailVerified) return;
    updateAccountUi("等待同步", "pending");
    clearTimeout(accountTimer);
    accountTimer = setTimeout(() => pushAccount(false), 1200);
  }

  function updateAccountUi(message = "", kind = "") {
    const logged = Boolean(currentUser);
    const verified = Boolean(currentUser?.emailVerified);
    ui.accountStatus.textContent = message || (verified ? (localStorage.getItem(DIRTY_KEY) === "1" ? "等待同步" : `云端已连接 · v${accountVersion || 1}`) : logged ? "等待邮箱激活" : "尚未登录");
    ui.accountStatus.className = `account-sync-status ${kind || (verified ? "ok" : logged ? "pending" : "")}`;
    ui.accountEmail.textContent = logged ? (currentUser.email || "已登录") : "未登录";
    ui.accountProvider.textContent = logged ? (verified ? `${providerLabel(currentUser)} · 邮箱已验证` : "请到邮箱点击激活链接") : "可以使用邮箱或 Google 登录";
    ui.topChip.textContent = verified ? (currentUser.email || "已登录") : logged ? "待激活" : "本机模式";
    ui.pull.disabled = !verified;
    ui.push.disabled = !verified;
    ui.logout.disabled = !logged;
  }

  function providerLabel(user) {
    const providerId = user?.providerData?.[0]?.providerId;
    if (providerId === "google.com") return "Google 账号";
    if (providerId === "password") return "邮箱密码";
    return "Firebase 账号";
  }

  function showGate(message = "", kind = "") {
    if (message) setStatus(message, kind);
    ui.gate.classList.remove("hidden");
  }

  function hideGate() {
    ui.gate.classList.add("hidden");
  }

  function setStatus(text, kind = "") {
    ui.status.textContent = text;
    ui.status.className = `auth-status ${kind}`;
  }

  function friendlyError(error) {
    const map = {
      "auth/invalid-credential": "邮箱或密码不正确",
      "auth/user-not-found": "账号不存在",
      "auth/wrong-password": "邮箱或密码不正确",
      "auth/email-already-in-use": "这个邮箱已经注册，请直接登录",
      "auth/weak-password": "密码至少需要 6 位",
      "auth/invalid-email": "邮箱格式不正确",
      "auth/too-many-requests": "尝试次数过多，请稍后再试",
      "auth/popup-closed-by-user": "已取消 Google 登录",
      "auth/unauthorized-domain": "当前网站域名尚未加入 Firebase 授权域名",
      "auth/operation-not-allowed": "Firebase 控制台尚未启用这种登录方式",
      "auth/network-request-failed": "网络连接失败"
    };
    return map[error?.code] || error?.message || "操作失败";
  }

  function notify(text) {
    if (typeof showToast === "function") showToast(text);
    else alert(text);
  }
})();
