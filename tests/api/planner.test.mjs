import test from "node:test";
import assert from "node:assert/strict";

const baseUrl = process.env.TEST_BASE_URL || "http://127.0.0.1:5173";

test("planner persists Todo/events, carries unfinished work and distinguishes summer weekdays", async () => {
  const login = await fetch(`${baseUrl}/api/dev/login`, { method: "POST" });
  assert.equal(login.ok, true);
  const cookie = login.headers.get("set-cookie")?.split(";")[0];
  const account = await login.json();
  const profile = account.profiles[0];
  const stamp = Date.now();
  const call = async (path, options = {}) => {
    const response = await fetch(`${baseUrl}${path}`, { ...options, headers: { cookie, ...(options.body ? { "content-type": "application/json" } : {}), ...options.headers } });
    const body = await response.json();
    return { response, body };
  };

  const overdue = await call("/api/actions", { method: "POST", body: JSON.stringify({ profileId: profile.id, title: `未完成阅读-${stamp}`, dueAt: "2040-07-01T18:00", estimateMinutes: 20, importance: 3 }) });
  assert.equal(overdue.response.status, 201);

  const event = await call("/api/actions", { method: "POST", body: JSON.stringify({ profileId: profile.id, title: `周末球类活动-${stamp}`, itemKind: "event", startAt: "2040-07-07T09:30", endAt: "2040-07-07T10:30", recurrence: "weekends", estimateMinutes: 60 }) });
  assert.equal(event.response.status, 201);
  assert.equal(event.body.itemKind, "event");
  assert.equal(event.body.recurrence.mode, "weekends");
  const beforeRecurringStart = await call(`/api/planner/today?profileId=${encodeURIComponent(profile.id)}&date=2040-06-30`);
  assert.equal(beforeRecurringStart.body.scheduled.some((item) => item.id === event.body.id), false);

  const weekday = await call(`/api/planner/today?profileId=${encodeURIComponent(profile.id)}&date=2040-07-04`);
  assert.equal(weekday.response.ok, true);
  assert.equal(weekday.body.dayMode, "summer_weekday");
  assert.ok(weekday.body.overdue.some((item) => item.id === overdue.body.id));

  const weekend = await call(`/api/planner/today?profileId=${encodeURIComponent(profile.id)}&date=2040-07-07`);
  assert.equal(weekend.body.dayMode, "summer_weekend");
  assert.ok(weekend.body.scheduled.some((item) => item.id === event.body.id));
  const completedOccurrence = await call(`/api/actions/${event.body.id}`, { method: "PATCH", body: JSON.stringify({ status: "done", occurrenceDate: "2040-07-07" }) });
  assert.equal(completedOccurrence.response.ok, true);
  assert.equal(completedOccurrence.body.occurrenceStatus, "done");
  const sameOccurrence = await call(`/api/planner/today?profileId=${encodeURIComponent(profile.id)}&date=2040-07-07`);
  assert.equal(sameOccurrence.body.scheduled.find((item) => item.id === event.body.id).status, "done");
  const nextOccurrence = await call(`/api/planner/today?profileId=${encodeURIComponent(profile.id)}&date=2040-07-08`);
  assert.equal(nextOccurrence.body.scheduled.find((item) => item.id === event.body.id).status, "open");

  const parsed = await call("/api/planner/parse", { method: "POST", body: JSON.stringify({ profileId: profile.id, date: "2040-07-04", fast: true, text: "上午9点阅读20分钟；下午3点游泳课；晚上每天整理书包10分钟" }) });
  assert.equal(parsed.response.ok, true);
  assert.equal(parsed.body.mode, "ready");
  assert.equal(parsed.body.items.length, 3);
  assert.ok(parsed.body.items.some((item) => item.kind === "event"));
  assert.ok(parsed.body.items.some((item) => item.recurrence.mode === "daily"));
  const tomorrow = await call("/api/planner/parse", { method: "POST", body: JSON.stringify({ profileId: profile.id, date: "2040-07-04", fast: true, text: "明天上午九点整理科学实验记录" }) });
  assert.equal(tomorrow.body.items[0].dueAt.slice(0, 10), "2040-07-05");
  assert.equal(tomorrow.body.items[0].dueAt.slice(11, 16), "09:00");
  assert.equal(tomorrow.body.items[0].myDayDate, "2040-07-05");

  const recommendations = await call("/api/planner/recommend", { method: "POST", body: JSON.stringify({ profileId: profile.id, date: "2040-07-04", energy: "normal", fast: true }) });
  assert.equal(recommendations.response.ok, true);
  assert.ok(recommendations.body.items.length >= 2);
  assert.ok(recommendations.body.items.length <= 8);
  assert.ok(recommendations.body.items.every((item) => item.sourceType && item.reason && item.estimateMinutes));

  const accepted = await call("/api/planner/accept", { method: "POST", body: JSON.stringify({ profileId: profile.id, date: "2040-07-04", items: [recommendations.body.items[0]] }) });
  assert.equal(accepted.response.status, 201);
  assert.ok(accepted.body.savedIds.length >= 1);
  assert.ok(accepted.body.scheduled.length >= 1);
});
