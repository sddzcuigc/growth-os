import test from "node:test";
import assert from "node:assert/strict";

const baseUrl = process.env.TEST_BASE_URL || "http://127.0.0.1:5173";

function simulatedWeek() {
  const seed = new Date(Date.UTC(2040, 0, 1 + (Date.now() % 12000)));
  const weekday = seed.getUTCDay() || 7;
  seed.setUTCDate(seed.getUTCDate() - weekday + 1);
  return Array.from({ length: 6 }, (_, index) => {
    const day = new Date(seed);
    day.setUTCDate(seed.getUTCDate() + index);
    return day.toISOString().slice(0, 10);
  });
}

test("six daily evidence runes defeat one weekly Boss and create a reward voucher", async () => {
  const login = await fetch(`${baseUrl}/api/dev/login`, { method: "POST" });
  assert.equal(login.ok, true);
  const cookie = login.headers.get("set-cookie")?.split(";")[0];
  assert.ok(cookie);
  const account = await login.json();
  const profile = account.profiles.find((item) => item.name === "测试冒险家") || account.profiles[0];
  assert.ok(profile?.id);

  const call = async (path, options = {}) => {
    const response = await fetch(`${baseUrl}${path}`, {
      ...options,
      headers: { cookie, ...(options.body ? { "content-type": "application/json" } : {}), ...options.headers }
    });
    const body = await response.json();
    return { response, body };
  };

  const dates = simulatedWeek();
  const initial = await call(`/api/boss/week?profileId=${encodeURIComponent(profile.id)}&date=${dates[0]}`);
  assert.equal(initial.response.ok, true);
  assert.equal(initial.body.week.shieldBroken, 0);
  assert.equal(initial.body.week.hpRemaining, 40);
  assert.ok(initial.body.week.selection.project);
  assert.equal(initial.body.week.selection.project.dailyStages.length, 7);
  assert.equal(initial.body.week.selection.project.successCriteria.length, 3);
  assert.doesNotMatch(initial.body.week.selection.project.weeklyProduct, /用?\s*10\s*分钟|最小版本|做一个关于/);

  const blockedFinal = await call(`/api/boss/week/${initial.body.week.id}/final`, {
    method: "POST",
    body: JSON.stringify({ reflection: "我还没有集齐证据" })
  });
  assert.equal(blockedFinal.response.status, 409);

  let latestState = initial.body;
  for (let index = 0; index < dates.length; index += 1) {
    const sync = await call("/api/boss/daily/sync", {
      method: "POST",
      body: JSON.stringify({
        profileId: profile.id,
        date: dates[index],
        tasks: Array.from({ length: 4 }, (_, taskIndex) => ({
          id: `week-${dates[0]}-day-${index}-core-${taskIndex}`,
          title: `第${index + 1}天核心任务${taskIndex + 1}`,
          status: "completed",
          sourceRef: "test:weekly-boss"
        }))
      })
    });
    assert.equal(sync.response.ok, true);
    assert.equal(sync.body.corePlan.tasks.length, 3);
    assert.equal(sync.body.corePlan.tasks.every((task) => task.taskType === "project"), true);
    assert.equal(sync.body.miniBoss.unlockStatus, "unlocked");
    assert.ok(sync.body.miniBoss.challenge.projectStage);

    const completed = await call(`/api/boss/daily/${sync.body.miniBoss.id}/complete`, {
      method: "POST",
      body: JSON.stringify({
        summary: `第${index + 1}天：我完成任务并说出了使用的方法。`,
        observableFact: `留下第${index + 1}枚可观察证据`,
        shareWithAi: true
      })
    });
    assert.equal(completed.response.ok, true);
    latestState = completed.body;
    assert.equal(latestState.rewarded, true);
    assert.equal(latestState.week.shieldBroken, index + 1);
    assert.equal(latestState.week.hpRemaining, 40 - (index + 1) * 3);

    const repeated = await call(`/api/boss/daily/${sync.body.miniBoss.id}/complete`, {
      method: "POST",
      body: JSON.stringify({ summary: "重复提交不应重复奖励" })
    });
    assert.equal(repeated.response.ok, true);
    assert.equal(repeated.body.rewarded, false);
    assert.equal(repeated.body.week.shieldBroken, index + 1);
  }

  assert.equal(latestState.week.status, "final_ready");
  assert.equal(latestState.evidence.length, 6);

  const final = await call(`/api/boss/week/${latestState.week.id}/final`, {
    method: "POST",
    body: JSON.stringify({ reflection: "我学会了先检查完成标准，遇到困难时把任务缩小，再独立完成收尾。" })
  });
  assert.equal(final.response.ok, true);
  assert.equal(final.body.defeated, true);
  assert.equal(final.body.week.status, "defeated");
  assert.equal(final.body.week.hpRemaining, 0);
  assert.equal(final.body.rewardDrop.status, "offered");
  assert.equal(final.body.rewardDrop.candidates.length, 3);

  const candidate = final.body.rewardDrop.candidates[0];
  const choice = await call(`/api/boss/rewards/${final.body.rewardDrop.id}/choose`, {
    method: "POST",
    body: JSON.stringify({ rewardId: candidate.id })
  });
  assert.equal(choice.response.ok, true);
  assert.equal(choice.body.voucher.reward.id, candidate.id);

  const duplicateChoice = await call(`/api/boss/rewards/${final.body.rewardDrop.id}/choose`, {
    method: "POST",
    body: JSON.stringify({ rewardId: final.body.rewardDrop.candidates[1].id })
  });
  assert.equal(duplicateChoice.response.status, 409);

  if (choice.body.voucher.status === "reserved") {
    const approval = await call(`/api/boss/vouchers/${choice.body.voucher.id}/approve`, { method: "POST" });
    assert.equal(approval.response.ok, true);
  }
  const vouchers = await call(`/api/boss/vouchers?profileId=${encodeURIComponent(profile.id)}`);
  const saved = vouchers.body.vouchers.find((item) => item.id === choice.body.voucher.id);
  assert.ok(saved);
  assert.ok(["approved", "reserved"].includes(saved.status));
});
