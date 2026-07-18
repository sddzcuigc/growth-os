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
# The adapter maps this generic legacy anchor to the actionRows SELECT clause.
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
