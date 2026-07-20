import { readFileSync, writeFileSync } from "node:fs";

const file = "app.js";
let source = readFileSync(file, "utf8");

const recoveryBefore = `.then(async (response) => { const result = await response.json(); if (!response.ok) throw new Error(result.error); state.account = result; installProfiles(result.profiles); authOverlay.hidden = true; document.querySelector("#auth-login-fields").hidden = false; document.querySelector("#auth-recovery-fields").hidden = true; if (state.profiles.length) await loadCloudProgress(state.childId); render(); showToast("密码已重设，旧设备会自动退出"); })`;
const recoveryAfter = `.then(async (response) => { const result = await response.json(); if (!response.ok) throw new Error(result.error); state.account = result; installProfiles(result.profiles); profileOverlay.hidden = state.profiles.length > 0; render(); authOverlay.hidden = true; document.querySelector("#auth-login-fields").hidden = false; document.querySelector("#auth-recovery-fields").hidden = true; if (state.profiles.length) { try { await loadCloudProgress(state.childId); } catch { showToast("部分云端档案暂时没有载入"); } render(); } showToast("密码已重设，旧设备会自动退出"); })`;

const loginBefore = `.then(async (response) => { const result = await response.json(); if (!response.ok) throw new Error(result.error); const oneTimeCode = result.recoveryCode || ""; const { recoveryCode: _recoveryCode, ...account } = result; state.account = account; installProfiles(result.profiles); authOverlay.hidden = true; profileOverlay.hidden = state.profiles.length > 0; if (state.profiles.length) await loadCloudProgress(state.childId); render(); if (oneTimeCode) showRecoveryCode(oneTimeCode); })`;
const loginAfter = `.then(async (response) => { const result = await response.json(); if (!response.ok) throw new Error(result.error); const oneTimeCode = result.recoveryCode || ""; const { recoveryCode: _recoveryCode, ...account } = result; state.account = account; installProfiles(result.profiles); profileOverlay.hidden = state.profiles.length > 0; render(); authOverlay.hidden = true; if (state.profiles.length) { try { await loadCloudProgress(state.childId); } catch { showToast("部分云端档案暂时没有载入"); } render(); } if (oneTimeCode) showRecoveryCode(oneTimeCode); })`;

if (source.includes(recoveryBefore)) source = source.replace(recoveryBefore, recoveryAfter);
else if (!source.includes(recoveryAfter)) throw new Error("Recovery hydration source not found");

if (source.includes(loginBefore)) source = source.replace(loginBefore, loginAfter);
else if (!source.includes(loginAfter)) throw new Error("Login hydration source not found");

writeFileSync(file, source);
