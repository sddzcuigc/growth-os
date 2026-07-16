const DEFAULT_MANIFEST_URL = "/assets/growth-os/assets_manifest_final.json";

export const EVIDENCE_LABELS = Object.freeze({
  start: "自主开始",
  persistence: "坚持推进",
  method: "方法使用",
  result: "真实成果",
  reflection: "复盘理解",
  transfer: "迁移应用",
});

export async function loadBossManifest(url = DEFAULT_MANIFEST_URL) {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) throw new Error(`Boss manifest load failed: ${response.status}`);
  const manifest = await response.json();
  assertManifest(manifest);
  return manifest;
}

export function assertManifest(manifest) {
  if (!manifest || typeof manifest !== "object") throw new TypeError("Manifest must be an object");
  if (!Array.isArray(manifest.worlds) || manifest.worlds.length !== 10) throw new Error("Expected 10 worlds");
  if (!Array.isArray(manifest.bosses) || manifest.bosses.length !== 100) throw new Error("Expected 100 bosses");
  if (!Array.isArray(manifest.rewards) || manifest.rewards.length !== 100) throw new Error("Expected 100 rewards");
}

export function selectWeeklyBoss(manifest, { worldId, completedBossIds = [] } = {}) {
  const pool = manifest.bosses.filter((boss) => {
    if (worldId && boss.worldId !== worldId) return false;
    return !completedBossIds.includes(boss.id);
  });
  return pool[0] || manifest.bosses.find((boss) => !completedBossIds.includes(boss.id)) || manifest.bosses[0];
}

export function calculateEvidenceDamage(boss, evidence = {}) {
  const enabledTypes = boss.evidenceTypes || Object.keys(EVIDENCE_LABELS);
  const points = enabledTypes.reduce((sum, type) => sum + Math.max(0, Number(evidence[type] || 0)), 0);
  return Math.min(Number(boss.baseHp || 40), points * 8);
}

export function pickRewardChoices(manifest, { enabledRewardIds, count = 3, seed = Date.now() } = {}) {
  const enabled = manifest.rewards.filter((reward) => {
    if (reward.enabledByDefault === false) return false;
    return !enabledRewardIds || enabledRewardIds.includes(reward.id);
  });
  const weighted = [];
  const rarityWeight = { fine: 50, rare: 30, epic: 15, legendary: 5 };
  for (const reward of enabled) {
    const weight = rarityWeight[reward.rarity] || 10;
    for (let index = 0; index < weight; index += 1) weighted.push(reward);
  }
  const random = mulberry32(Number(seed) >>> 0);
  const selected = [];
  while (selected.length < Math.min(count, enabled.length) && weighted.length) {
    const reward = weighted[Math.floor(random() * weighted.length)];
    if (!selected.some((item) => item.id === reward.id)) selected.push(reward);
  }
  return selected;
}

export function renderBossSystem(root, manifest, options = {}) {
  if (!(root instanceof Element)) throw new TypeError("root must be a DOM Element");
  const state = {
    worldId: options.worldId || manifest.worlds[0].id,
    selectedBossId: options.selectedBossId || null,
  };

  const render = () => {
    const world = manifest.worlds.find((item) => item.id === state.worldId) || manifest.worlds[0];
    const bosses = manifest.bosses.filter((boss) => boss.worldId === world.id);
    const selectedBoss = bosses.find((boss) => boss.id === state.selectedBossId) || bosses[0];
    state.selectedBossId = selectedBoss.id;

    root.innerHTML = `
      <section class="growth-boss-shell">
        <header class="growth-boss-hero" style="background-image:linear-gradient(180deg,rgba(10,14,20,.18),rgba(10,14,20,.92)),url('${world.mainScene}')">
          <small>${escapeHtml(world.abilityDomain)}</small>
          <h1>${escapeHtml(world.nameZh)}</h1>
          <p>每天完成核心任务解锁小Boss；周日用六种成长证据挑战周Boss。</p>
        </header>
        <nav class="growth-world-tabs" aria-label="成长世界">
          ${manifest.worlds.map((item) => `<button type="button" data-world-id="${item.id}" aria-current="${item.id === world.id ? "page" : "false"}">${item.index}. ${escapeHtml(item.nameZh)}</button>`).join("")}
        </nav>
        <div class="growth-boss-layout">
          <section class="growth-boss-atlas" aria-label="Boss图鉴">
            ${bosses.map((boss) => `<button type="button" class="growth-boss-card ${boss.id === selectedBoss.id ? "active" : ""}" data-boss-id="${boss.id}"><img src="${boss.card}" alt="${escapeHtml(boss.nameZh)}"><strong>${boss.id} ${escapeHtml(boss.nameZh)}</strong><span>${escapeHtml(boss.futureSkill)}</span></button>`).join("")}
          </section>
          <aside class="growth-boss-detail">
            <img src="${selectedBoss.portrait}" alt="${escapeHtml(selectedBoss.nameZh)}">
            <small>${escapeHtml(selectedBoss.bossLevel)} · ${escapeHtml(selectedBoss.futureSkill)}</small>
            <h2>${escapeHtml(selectedBoss.nameZh)}</h2>
            <p><b>Boss攻击：</b>${escapeHtml(selectedBoss.attack)}</p>
            <p><b>本周胜利证据：</b>${escapeHtml(selectedBoss.weeklyVictoryEvidence)}</p>
            <p><b>周日决战：</b>${escapeHtml(selectedBoss.sundayBattle)}</p>
            <div class="growth-evidence-grid">
              ${(selectedBoss.evidenceTypes || []).map((type) => `<span>${escapeHtml(EVIDENCE_LABELS[type] || type)}</span>`).join("")}
            </div>
            <button type="button" class="growth-primary" data-action="start-weekly-boss">开始本周Boss战</button>
          </aside>
        </div>
      </section>`;

    root.querySelectorAll("[data-world-id]").forEach((button) => button.addEventListener("click", () => {
      state.worldId = button.dataset.worldId;
      state.selectedBossId = null;
      render();
    }));
    root.querySelectorAll("[data-boss-id]").forEach((button) => button.addEventListener("click", () => {
      state.selectedBossId = button.dataset.bossId;
      render();
    }));
    root.querySelector("[data-action='start-weekly-boss']")?.addEventListener("click", () => {
      options.onStartBoss?.(selectedBoss);
    });
  };
  render();
  return { setWorld(worldId) { state.worldId = worldId; state.selectedBossId = null; render(); } };
}

function mulberry32(seed) {
  return function random() {
    let t = seed += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[char]));
}
