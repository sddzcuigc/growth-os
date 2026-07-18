  if (!project) {
    const plan = parseStoredJson(goal.plan_json, {});
    const finalProduct = String(goal.success_signal || plan.objective || goal.title).slice(0, 220);
    const result = db.prepare("INSERT INTO growth_projects(profile_id,journey_id,goal_id,title,final_product,status,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?)")
      .run(profileIdValue, journey.id, goal.id, `${goal.title} · 四周项目`.slice(0, 120), finalProduct, activate ? "active" : "paused", now, now);
    project = db.prepare("SELECT * FROM growth_projects WHERE id=?").get(Number(result.lastInsertRowid));
  }
  if (activate) {
    db.prepare("UPDATE growth_journeys SET status='paused',updated_at=? WHERE profile_id=? AND id!=?").run(now, profileIdValue, journey.id);
    db.prepare("UPDATE growth_projects SET status='paused',updated_at=? WHERE profile_id=? AND id!=?").run(now, profileIdValue, project.id);
    db.prepare("UPDATE growth_journeys SET title=?,status='active',active_goal_id=?,active_project_id=?,updated_at=? WHERE id=?")
      .run(goal.title, goal.id, project.id, now, journey.id);
    db.prepare("UPDATE growth_projects SET status='active',updated_at=? WHERE id=?").run(now, project.id);
  }
  return { journey: db.prepare("SELECT * FROM growth_journeys WHERE id=?").get(journey.id), project: db.prepare("SELECT * FROM growth_projects WHERE id=?").get(project.id) };
}
function activeJourneyRow(profileIdValue) {
  let journey = db.prepare("SELECT * FROM growth_journeys WHERE profile_id=? AND status='active' ORDER BY updated_at DESC,id DESC LIMIT 1").get(profileIdValue);
  if (journey) return journey;
  const goal = db.prepare("SELECT id FROM growth_goals WHERE profile_id=? AND status='active' ORDER BY is_primary DESC,updated_at DESC,id DESC LIMIT 1").get(profileIdValue);
  return goal ? ensureJourneyForGoal(profileIdValue, goal.id, true)?.journey || null : null;
}
function backfillGrowthJourneys() {
  for (const goal of db.prepare("SELECT * FROM growth_goals ORDER BY profile_id,is_primary,id").all()) ensureJourneyForGoal(goal.profile_id, goal.id, Boolean(goal.status === 'active' && goal.is_primary));
  db.prepare("UPDATE actions SET journey_id=COALESCE((SELECT journey_id FROM growth_goals WHERE growth_goals.id=actions.goal_id),0) WHERE journey_id=0 AND goal_id>0").run();
  db.prepare("UPDATE actions SET project_id=COALESCE((SELECT active_project_id FROM growth_journeys WHERE growth_journeys.id=actions.journey_id),0) WHERE project_id=0 AND journey_id>0").run();
}
function upsertJourneyEvidence({ profileId, journeyId = 0, projectId = 0, weeklyBossRunId = 0, skillId = 'creation', sourceType, sourceId, level = 1, summary, observable = {} }) {
  const now = nowIso();
  db.prepare("INSERT INTO growth_evidence(profile_id,skill_id,source_type,source_id,evidence_level,summary,observable_json,child_confirmed,guardian_confirmed,ai_context,created_at,journey_id,project_id,weekly_boss_run_id) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(profile_id,source_type,source_id) DO UPDATE SET skill_id=excluded.skill_id,evidence_level=excluded.evidence_level,summary=excluded.summary,observable_json=excluded.observable_json,ai_context=excluded.ai_context,journey_id=excluded.journey_id,project_id=excluded.project_id,weekly_boss_run_id=excluded.weekly_boss_run_id")
    .run(profileId, normalizeSkillId(skillId), sourceType, String(sourceId), level, String(summary || '').slice(0, 240), JSON.stringify(observable), 1, null, 1, now, Number(journeyId || 0), Number(projectId || 0), Number(weeklyBossRunId || 0));
}
function publicJourneyEvidence(row) {
  return { id: Number(row.id), journeyId: Number(row.journey_id || 0), projectId: Number(row.project_id || 0), weeklyBossRunId: Number(row.weekly_boss_run_id || 0), skillId: row.skill_id, sourceType: row.source_type, sourceId: row.source_id, evidenceLevel: Number(row.evidence_level), summary: row.summary, observable: parseStoredJson(row.observable_json, {}), createdAt: row.created_at };
}
function handleGetJourney(request, response, url) {
  const user = requireUser(request, response); if (!user) return;
  const profileIdValue = String(url.searchParams.get("profileId") || "");
  if (!ownedProfile(user.id, profileIdValue)) return sendJson(response, 404, { error: "角色不存在" });
  const row = activeJourneyRow(profileIdValue);
  if (!row) return sendJson(response, 200, { journey: null });
  const goal = goalRows(profileIdValue).find((item) => item.id === Number(row.active_goal_id)) || null;
  const projectRow = db.prepare("SELECT * FROM growth_projects WHERE id=? AND profile_id=?").get(row.active_project_id, profileIdValue);
  const project = projectRow ? { id: Number(projectRow.id), journeyId: Number(projectRow.journey_id), goalId: Number(projectRow.goal_id), title: projectRow.title, finalProduct: projectRow.final_product, status: projectRow.status, updatedAt: projectRow.updated_at } : null;
  const actions = actionRows(profileIdValue).filter((item) => Number(item.journeyId || 0) === Number(row.id));
  const bossRow = db.prepare("SELECT * FROM weekly_boss_runs WHERE profile_id=? AND journey_id=? ORDER BY week_start DESC,id DESC LIMIT 1").get(profileIdValue, row.id);
  const evidence = db.prepare("SELECT * FROM growth_evidence WHERE profile_id=? AND journey_id=? ORDER BY created_at DESC,id DESC LIMIT 80").all(profileIdValue, row.id).map(publicJourneyEvidence);
  sendJson(response, 200, { journey: { id: Number(row.id), title: row.title, status: row.status, goal, project, actions, boss: publicWeeklyBoss(bossRow), evidence, counts: { actions: actions.length, completedActions: actions.filter((item) => item.status === 'done').length, evidence: evidence.length }, updatedAt: row.updated_at } });
}

'''
