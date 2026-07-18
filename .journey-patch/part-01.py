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
server = insert_after(server, 'function handleListGoals(request, response, url) {\n', journey_helpers, 'journey helpers')

# Goal creation/activation links the kernel.
server = replace_once(
    server,
    '  recordEvent(user.id, profileIdValue, "goal_created", { skill: normalizeSkillId(body.skill || "creation"), horizon: body.horizon || "one_month" });\n  sendJson(response, 201, goalRows(profileIdValue).find((goal) => goal.id === Number(result.lastInsertRowid)));',
    '  const createdGoalId = Number(result.lastInsertRowid);\n  ensureJourneyForGoal(profileIdValue, createdGoalId, true);\n  recordEvent(user.id, profileIdValue, "goal_created", { skill: normalizeSkillId(body.skill || "creation"), horizon: body.horizon || "one_month", journeyId: Number(activeJourneyRow(profileIdValue)?.id || 0) });\n  sendJson(response, 201, goalRows(profileIdValue).find((goal) => goal.id === createdGoalId));',
    'goal creation journey',
)
server = insert_after(server, '  db.prepare("UPDATE growth_goals SET status=?,is_primary=?,updated_at=? WHERE id=?").run(status, status === "active" ? 1 : 0, nowIso(), id);\n', '  if (status === "active") ensureJourneyForGoal(goal.profile_id, id, true);\n', 'goal activation journey')

# Action lineage and evidence.
server = insert_after(server, '  const goalId = requestedGoalId && db.prepare("SELECT id FROM growth_goals WHERE id=? AND profile_id=? AND status=\'active\'").get(requestedGoalId, profileIdValue) ? requestedGoalId : 0;\n', '  const journeyLink = goalId ? ensureJourneyForGoal(profileIdValue, goalId, false) : null;\n  const activeJourney = journeyLink?.journey || activeJourneyRow(profileIdValue);\n  const journeyId = Number(body.journeyId || activeJourney?.id || 0);\n  const projectId = Number(body.projectId || journeyLink?.project?.id || activeJourney?.active_project_id || 0);\n', 'action lineage vars')
server = replace_once(
    server,
    'INSERT INTO actions(profile_id,title,detail,status,estimate_minutes,energy,importance,due_at,source,source_ref,goal_id,steps_json,success,item_kind,start_at,end_at,reminder_at,recurrence_json,my_day_date,skill_id,planner_reason,generated,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
    'INSERT INTO actions(profile_id,title,detail,status,estimate_minutes,energy,importance,due_at,source,source_ref,goal_id,steps_json,success,item_kind,start_at,end_at,reminder_at,recurrence_json,my_day_date,skill_id,planner_reason,generated,created_at,updated_at,journey_id,project_id) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
    'action insert sql',
)
server = replace_once(
    server,
    'body.generated ? 1 : 0, now, now);',
    'body.generated ? 1 : 0, now, now, journeyId, projectId);',
    'action insert values',
)
# public action must expose IDs (the object currently starts at id).
server = replace_once(server, 'return { id: Number(row.id), title: row.title,', 'return { id: Number(row.id), journeyId: Number(row.journey_id || 0), projectId: Number(row.project_id || 0), title: row.title,', 'action public lineage')
server = insert_after(
    server,
    '      evolveHypotheses(action.profile_id, { id: Number(memoryResult.lastInsertRowid), kind: "action", summary: `自主行动完成：${title || action.title}`, evidence, shareWithAi: true });\n',
    '      upsertJourneyEvidence({ profileId: action.profile_id, journeyId: Number(action.journey_id || 0), projectId: Number(action.project_id || 0), skillId: action.skill_id || "self-regulation", sourceType: "action", sourceId: String(id), level: 2, summary: `完成行动：${title || action.title}`, observable: { actionId: id, estimateMinutes: Number(action.estimate_minutes), source: action.source } });\n',
    'action completion evidence',
)
server = insert_after(server, '      retractStrategyEvidence(action.profile_id, memoryIds.map((memoryId) => `memory:${memoryId}`));\n', '      db.prepare("DELETE FROM growth_evidence WHERE profile_id=? AND source_type=\'action\' AND source_id=?").run(action.profile_id, String(id));\n', 'action evidence revoke')

# Blueprint uses structured evidence.
server = replace_once(
    server,
    '  return { portrait, dailyCompletions, journals, feedback, artifacts, goals, actions, hypotheses };',
    '  const structuredEvidence = db.prepare("SELECT * FROM growth_evidence WHERE profile_id=? AND ai_context=1 ORDER BY created_at DESC,id DESC LIMIT 120").all(profileIdValue).map(publicJourneyEvidence);\n  const journeys = db.prepare("SELECT id,title,status,active_goal_id AS activeGoalId,active_project_id AS activeProjectId,updated_at AS updatedAt FROM growth_journeys WHERE profile_id=? ORDER BY updated_at DESC,id DESC LIMIT 12").all(profileIdValue);\n  const projects = db.prepare("SELECT id,journey_id AS journeyId,goal_id AS goalId,title,final_product AS finalProduct,status,updated_at AS updatedAt FROM growth_projects WHERE profile_id=? ORDER BY updated_at DESC,id DESC LIMIT 12").all(profileIdValue);\n  return { portrait, dailyCompletions, journals, feedback, artifacts, goals, actions, hypotheses, structuredEvidence, journeys, projects };',
    'blueprint structured evidence',
)
server = insert_after(server, '  score += evidence.goals.filter((item) => item.skill === skillId).length * 3;\n', '  score += (evidence.structuredEvidence || []).filter((item) => item.skillId === skillId).reduce((sum, item) => sum + Math.max(1, Number(item.evidenceLevel || 1)) * 1.5, 0);\n', 'blueprint evidence score')

# Boss lineage.
server = replace_once(server, 'return { id: Number(row.id), profileId: row.profile_id,', 'return { id: Number(row.id), journeyId: Number(row.journey_id || 0), profileId: row.profile_id,', 'boss public journey')
server = replace_once(
    server,
    '  const result = db.prepare("INSERT INTO weekly_boss_runs(profile_id,boss_id,difficulty,week_start,source_blueprint_id,source_project_id,shield_total,shield_broken,hp_total,hp_remaining,status,selection_json,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)").run(profileIdValue, picked.boss.id, difficulty, weekStart, picked.blueprintRow?.updated_at || "unversioned", String(picked.goal?.id || ""), 6, 0, 40, 40, "active", JSON.stringify(picked.selection), now, now);',
