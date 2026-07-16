import { readFileSync } from "node:fs";
import vm from "node:vm";

const requiredSkillIds = [
  "self-regulation",
  "metacognition",
  "communication",
  "data-reasoning",
  "ai-literacy",
  "creation",
  "ethics-collaboration",
  "wellbeing"
];

const requiredContextIds = [
  "preferred-output",
  "ai-help-style",
  "best-focus-time",
  "recent-pride",
  "challenge-edge",
  "collab-boundary"
];

const requiredPromptTerms = [
  "执行功能",
  "元认知",
  "自我调节",
  "主动回忆",
  "间隔练习",
  "深层解释问题",
  "AI素养",
  "只推荐一个"
];

const requiredScienceSources = [
  "UNESCO",
  "World Economic Forum",
  "Education Endowment Foundation",
  "National Academies",
  "Harvard",
  "What Works Clearinghouse"
];

const context = loadAppContext();
const serverSource = readFileSync("api/server.js", "utf8");
const scienceSource = readFileSync("SCIENCE.md", "utf8");
const htmlSource = readFileSync("index.html", "utf8");
const appSourceText = readFileSync("app.js", "utf8");

const failures = [];

for (const id of requiredSkillIds) {
  if (!context.skillFramework[id]) failures.push(`skillFramework missing ${id}`);
}

for (const [id, skill] of Object.entries(context.skillFramework)) {
  for (const field of ["name", "childMeaning", "futureWhy", "trainWith", "evidence"]) {
    if (!skill[field] || (Array.isArray(skill[field]) && skill[field].length === 0)) {
      failures.push(`skillFramework.${id} missing ${field}`);
    }
  }
}

for (const [childId, child] of Object.entries(context.children)) {
  const childSkillIds = child.skills.map((skill) => skill.id);
  for (const id of requiredSkillIds) {
    if (!childSkillIds.includes(id)) failures.push(`${childId} missing skill ${id}`);
  }
  for (const quest of child.quests) {
    if (!requiredSkillIds.includes(quest.skill)) failures.push(`${childId}.${quest.id} uses invalid skill ${quest.skill}`);
    if (!quest.steps?.length) failures.push(`${childId}.${quest.id} has no steps`);
    if (!quest.reflect) failures.push(`${childId}.${quest.id} has no reflection prompt`);
    if (!context.taskExperienceProfiles[quest.id]) failures.push(`${childId}.${quest.id} missing experience profile`);
  }
  if (child.quests.length < 10) failures.push(`${childId} candidate pool is too small: ${child.quests.length}`);
}

const contextIds = context.contextQuestions.map((question) => question.id);
for (const id of requiredContextIds) {
  if (!contextIds.includes(id)) failures.push(`contextQuestions missing ${id}`);
}

for (const principle of context.trainingPrinciples) {
  if (!principle.evidence?.length) failures.push(`training principle ${principle.id} missing evidence`);
}

context.setCoachSession({
  answers: {
    energy: "normal",
    interest: "作品",
    friction: "stuck",
    time: 12
  },
  skipped: []
});
context.setAiCoachResult({
  coachLine: "<b>模型文本</b>",
  recommendation: {
    title: "<img src=x>",
    type: "AI",
    minutes: 12,
    why: "<script>bad</script>",
    steps: ["先想", "<button>再试</button>", "说发现"],
    reflect: "<i>发现了什么</i>",
    skill: "AI素养",
    reward: 21,
    evidenceNote: "主动回忆"
  }
});

const aiQuest = context.aiQuestFromResult(context.getAiCoachResult());
if (aiQuest.skill !== "ai-literacy") {
  failures.push(`AI skill normalization failed: ${aiQuest.skill}`);
}

const questHtml = context.renderQuestCard(aiQuest, { expanded: true });
if (questHtml.includes("<img src=x>") || questHtml.includes("<script>bad</script>") || questHtml.includes("<button>再试</button>")) {
  failures.push("AI quest HTML is not escaped");
}
if (!questHtml.includes("&lt;img src=x&gt;") || !questHtml.includes("&lt;script&gt;bad&lt;/script&gt;")) {
  failures.push("AI quest escaped text is not visible");
}

const recommendationHtml = context.renderRecommendations();
for (const requiredText of ["记下一句值得记住的事", "不会自动变成任务", "我刚想到", "当前服务于"]) {
  if (!recommendationHtml.includes(requiredText)) failures.push(`recommendation page missing ${requiredText}`);
}

context.setGrowthPlan({ weeklyGoal: "完成一个科学小项目", focusSkill: "creation", constraints: "周三有课" });
context.setScheduleItems([{ id: "test-schedule", title: "周三课程", start: "2026-07-15T19:00", energy: "low" }]);
context.setNewsContext([{ id: "test-news", title: "AI教育新工具", source: "测试来源", date: "2026-07-12" }]);
const payload = context.buildCoachPayload();
if (!payload.skillFramework || !payload.learningDesignRules?.length || !payload.evidenceSources) {
  failures.push("coach payload missing science framework");
}
if (!payload.planningContext || !Array.isArray(payload.planningContext.upcomingSchedule) || !Array.isArray(payload.planningContext.newsMessages)) {
  failures.push("coach payload missing plan/schedule/news context");
}
if (payload.planningContext.weeklyPlan.weeklyGoal !== "完成一个科学小项目" || payload.planningContext.upcomingSchedule.length !== 1 || payload.planningContext.newsMessages.length !== 1) {
  failures.push("coach payload did not carry saved plan/schedule/news values");
}
if (!payload.diversityPolicy?.requiredDifferenceCount || !payload.history?.recentRecommendations) {
  failures.push("coach payload missing diversity memory");
}

const initialEconomy = context.economyState();
context.toggleDone("story-four");
const rewardedEconomy = context.economyState();
if (rewardedEconomy.earnedXp <= initialEconomy.earnedXp || rewardedEconomy.earnedGems <= initialEconomy.earnedGems) {
  failures.push("completion does not update real XP and gems");
}

const firstLocal = context.recommendedQuests(1)[0];
context.rememberRecommendation(firstLocal, "test");
const nextLocal = context.recommendedQuests(1)[0];
if (firstLocal.id === nextLocal.id && context.children.brother.quests.length > 1) {
  failures.push("recommendation cooldown did not rotate the top candidate");
}

for (const term of requiredPromptTerms) {
  if (!serverSource.includes(term)) failures.push(`server prompt missing ${term}`);
}
for (const term of ["planningContext", "recentRecommendations", "至少改变3项", "/api/plan", "/api/context/news", "highestRecentOverlap"]) {
  if (!serverSource.includes(term)) failures.push(`server planning pipeline missing ${term}`);
}
for (const term of ["node:sqlite", "/api/auth/register", "/api/auth/login", "/api/dev/login", "/api/profiles", "/api/progress", "/api/export", "/api/memories/", "/api/events", "/api/metrics", "/api/journal", "/api/journal/prompt", "/api/hypotheses", "/api/ideas", "/api/actions", "/api/habits", "/api/focus", "/api/reviews", "/api/task-feedback", "/api/artifacts", "/api/daily-plan", "handleDevelopIdea", "handleBreakdownAction", "handleHabitCheckin", "handleStartFocus", "handleUpdateFocus", "handleGenerateReview", "handleReviewFeedback", "handleCreateTaskFeedback", "handleCreateArtifact", "handleArtifactMedia", "handleUpdateArtifact", "handleDeleteArtifact", "handleGenerateDailyPlan", "handleUpdateDailyPlan", "handleDeleteDailyPlan", "dailyPlanCandidates", "retractArtifactMemory", "feedbackCalibration", "reviewEvidence", "focusElapsedSeconds", "ensureIdeaAction", "hypothesisConfidence", "evolveHypotheses", "CREATE TABLE IF NOT EXISTS memories", "CREATE TABLE IF NOT EXISTS consents", "CREATE TABLE IF NOT EXISTS events", "CREATE TABLE IF NOT EXISTS journals", "CREATE TABLE IF NOT EXISTS memory_hypotheses", "CREATE TABLE IF NOT EXISTS ideas", "CREATE TABLE IF NOT EXISTS actions", "CREATE TABLE IF NOT EXISTS habits", "CREATE TABLE IF NOT EXISTS habit_logs", "CREATE TABLE IF NOT EXISTS focus_sessions", "CREATE TABLE IF NOT EXISTS weekly_reviews", "CREATE TABLE IF NOT EXISTS task_feedback", "CREATE TABLE IF NOT EXISTS artifacts", "CREATE TABLE IF NOT EXISTS daily_plans"]) {
  if (!serverSource.includes(term)) failures.push(`persistent account system missing ${term}`);
}
for (const term of ["本周成长罗盘", "generate-review", "review-feedback", "generateWeeklyReview", "sendReviewFeedback", "confirmedWeeklyReview", "loadReviews"]) {
  if (!appSourceText.includes(term)) failures.push(`weekly growth compass missing ${term}`);
}
for (const term of ["刚才说的是哪个任务", "下次怎么帮", "taskCalibration", "recentTaskFeedback", "feedbackTaskOptions", "calibrationCopy", "loadTaskFeedback", "保存体验，让下一个任务更适合我"]) {
  if (!appSourceText.includes(term)) failures.push(`adaptive task feedback missing ${term}`);
}
for (const term of ["pace=shrink", "preferredSupport", "不得推断能力高低或固定偏好", "少量样本只能探索"]) {
  if (!serverSource.includes(term)) failures.push(`feedback calibration safety missing ${term}`);
}
for (const term of ["ensureColumn(\"task_feedback\", \"motivation\"", "preferredMotivators", "motivationCounts", "动力线索至少重复两次", "motivationSupport", "motivator: motivation.motivator"]) if (!serverSource.includes(term)) failures.push(`motivation calibration server missing ${term}`);
if (!serverSource.includes("schemaVersion: 11")) failures.push("export schema missing child-controlled family brief version");
for (const term of ["CREATE TABLE IF NOT EXISTS idea_resurfacings", "/api/idea-resurfacing", "handleCreateIdeaResurfacing", "handleIdeaResurfacingOutcome", "snoozed_until", "idea_resurface_outcome"]) {
  if (!serverSource.includes(term)) failures.push(`idea resurfacing backend missing ${term}`);
}
for (const term of ["CREATE TABLE IF NOT EXISTS growth_goals", "/api/goals/shape", "handleShapeGoal", "handleCreateGoal", "handleUpdateGoal", "handleDeleteGoal", "goalRows", "同时保留三个方向就够了", "goal_id AS goalId", "matchingGoalId", "goalTitle"]) if (!serverSource.includes(term)) failures.push(`growth goals server missing ${term}`);
for (const term of ["当前成长主线", "生成SMART目标", "采用这个目标", "安排第一个行动", "shapeGrowthGoal", "confirmGrowthGoal", "startGoalExperiment", "currentJourney", "capture-goal-link", "daily-goal-link"]) if (!appSourceText.includes(term)) failures.push(`growth goals UI missing ${term}`);
for (const term of ["CREATE TABLE IF NOT EXISTS self_coach_answers", "/api/self-coach/ask", "handleAskSelfCoach", "selfCoachEvidence", "rankSelfCoachEvidence", "entry.shareWithAi", "只能根据提供的evidence回答", "allowedRefs", "证据不足就明确说还不知道", "handleSelfCoachFeedback", "handleDeleteSelfCoach"]) if (!serverSource.includes(term)) failures.push(`self coach server missing ${term}`);
for (const term of ["问问我的成长档案", "只根据我的证据回答", "askSelfCoach", "feedbackSelfCoach", "deleteSelfCoachAnswer", "查看${item.evidence.length}条来源", "这对我有帮助", "这不像我"]) if (!appSourceText.includes(term)) failures.push(`self coach UI missing ${term}`);
for (const term of ["CREATE TABLE IF NOT EXISTS action_decisions", "not_before", "defer_count", "/negotiate", "/defer", "handleNegotiateAction", "handleDeferAction", "孩子有权延期、缩小或放下一件事", "也不是失败", "status = \"someday\"", "status = \"dropped\""]) if (!serverSource.includes(term)) failures.push(`action negotiation server missing ${term}`);
for (const term of ["现在不合适", "现在为什么不适合做", "现在没力气", "缩成5分钟", "明天再做", "放到以后", "不做了", "以后再看", "requestActionNegotiation", "applyActionNegotiation"]) if (!appSourceText.includes(term)) failures.push(`action negotiation UI missing ${term}`);
for (const term of ["actionDecisionCalibration", "reasonCounts", "activeSignals", "reasonCounts.no_time >= 2", "reasonCounts.no_energy >= 2", "reasonCounts.unclear >= 2", "reasonCounts.not_important >= 2", "这是当前节奏，不是能力或性格标签", "decisionCalibration.preferShort", "decisionCalibration.preferLowEnergy", "decisionCalibration.preferClearStep", "decisionCalibration.preferImportant"]) if (!serverSource.includes(term)) failures.push(`decision calibration server missing ${term}`);
for (const term of ["AI正在适应我的当前节奏", "至少两次出现同一原因才调整推荐", "renderDecisionCalibration", "calibration.preferShort", "calibration.preferLowEnergy", "calibration.preferClearStep", "calibration.preferImportant"]) if (!appSourceText.includes(term)) failures.push(`decision calibration UI missing ${term}`);
for (const term of ["节奏适配", "优先短任务", "优先低能量", "优先明确第一步", "优先重要事项", "daily-rhythm-link"]) if (!appSourceText.includes(term)) failures.push(`decision calibration transparency missing ${term}`);
for (const term of ["这次什么最让我愿意继续", "motivationLabels", "reflect-motivation", "motivationCopy", "看见我变好", "做出了东西", "plan.motivator"]) if (!appSourceText.includes(term)) failures.push(`motivation feedback UI missing ${term}`);
for (const term of ["childFacingReviewText", "禁止暴露英文枚举", "just_right", "拆成小步"]) {
  if (!serverSource.includes(term)) failures.push(`child-facing feedback translation missing ${term}`);
}
for (const term of ["我的作品架", "set-artifact-mode", "save-artifact", "toggle-artifact-privacy", "delete-artifact", "saveArtifact", "loadArtifacts", "artifactEvidence", "允许AI参考作品名称和我的说明，不读取照片或录音原文件", "Math.min(12, artifactEvidence * 3)"]) {
  if (!appSourceText.includes(term)) failures.push(`artifact evidence experience missing ${term}`);
}
for (const term of ["2 * 1024 * 1024", "image/jpeg", "audio/mpeg", "x-content-type-options", "private, no-store", "不得假装看过或听过原文件"]) {
  if (!serverSource.includes(term)) failures.push(`artifact media safety missing ${term}`);
}
if (!serverSource.includes("if (shareWithAi) createArtifactMemory") || !serverSource.includes("retractArtifactMemory(row.profile_id, id)")) failures.push("artifact privacy does not control AI memory");
if (!serverSource.includes("serverDateKey(new Date(item.createdAt)) >= weekStart") || serverSource.includes("item.createdAt.slice(0, 10) >= weekStart")) failures.push("weekly evidence uses UTC date slicing instead of local dates");
for (const term of ["今天只选一种节奏", "当前主线 · 现在先过这一关", "quick-daily-start", "start-daily-plan", "swap-daily-plan", "lighten-daily-plan", "renderDailyCompass", "generateDailyPlan", "loadDailyPlan", "做完了吗", "去记录"]) {
  if (!appSourceText.includes(term)) failures.push(`daily adaptive compass missing ${term}`);
}
for (const term of ["只能从候选中选择一个ref，不创造新任务", "sourceType: \"recharge\"", "daily_plan_swapped", "daily_plan_lightened", "excluded_json"]) {
  if (!serverSource.includes(term)) failures.push(`daily plan arbitration missing ${term}`);
}
for (const term of ["completingRecharge", "completingMission", "我恢复好了", "状态照顾好了，选下一步", "completingRecharge || completingMission ? \"completed\" : \"accepted\""]) {
  if (!appSourceText.includes(term)) failures.push(`recharge plan completion UI missing ${term}`);
}
for (const term of ["daily_plan_completed", "feedback === \"completed\" ? \"completed\""]) {
  if (!serverSource.includes(term)) failures.push(`recharge plan completion backend missing ${term}`);
}
for (const term of ["/api/action-inbox/parse", "handleParseActionInbox", "fallbackInboxDraft", "findDuplicateAction", "已有answer后不得继续追问", "action_inbox_duplicate"]) {
  if (!serverSource.includes(term)) failures.push(`AI action inbox server missing ${term}`);
}
if (!serverSource.includes("AbortSignal.timeout(10000)")) failures.push("AI action inbox can block the child for too long");
for (const term of ["随手记一句", "帮我收好", "AI只问一个关键问题", "确认加入行动台", "parseActionInbox", "confirmActionInbox", "openDuplicateAction", "answer-action-inbox"]) {
  if (!appSourceText.includes(term)) failures.push(`AI action inbox UI missing ${term}`);
}
for (const term of ["/api/capture/parse", "handleParseCapture", "fallbackCaptureDraft", "不要把每个想法都变成任务", "capture_parsed", "capture_clarified"]) if (!serverSource.includes(term)) failures.push(`unified capture server missing ${term}`);
for (const term of ["要做的事、突然的灵感、今天的感悟都可以", "灵感火花", "成长感悟", "放进灵感池", "capture-ai-context", "capture_confirmed"]) if (!appSourceText.includes(term)) failures.push(`unified capture UI missing ${term}`);
for (const term of ["生成一个问题", "第2步", "在这里回答AI的问题", "写一句后可继续问", "保存回答", "if (state.journalMode !== \"self\") await requestJournalPrompt(false)"]) if (!appSourceText.includes(term)) failures.push(`guided journal flow missing ${term}`);
for (const term of ["clearContextAnswer", "edit-context-answer", ">修改</button>"]) if (!appSourceText.includes(term)) failures.push(`editable context answers missing ${term}`);
for (const term of ["onboardingQuestionIds", "renderProfileOnboarding", "finishProfileOnboarding", "AI先认识我", "onboarding-goal-project", "用这个目标开始", "needsProfileOnboarding"]) if (!appSourceText.includes(term)) failures.push(`guided profile onboarding missing ${term}`);
for (const term of ["isVagueGrowthGoal", "skillTreeGoalSuggestions", "choose-goal-suggestion", "技能树给出的具体目标建议", "这才是具体的SMART目标"]) if (!appSourceText.includes(term)) failures.push(`concrete goal choice flow missing ${term}`);
for (const term of ["choose-daily-mission", "preferredRef", "选这项", "mission-picks"]) if (!appSourceText.includes(term)) failures.push(`daily mission choice flow missing ${term}`);
for (const term of ["isVagueGoalText", "preferredRef"]) if (!serverSource.includes(term)) failures.push(`server goal or mission choice guard missing ${term}`);
for (const term of ["mode必须为clarify", "goalClarifications", "目标设计需要连接GLM", "系统不会改用模板", "GLM没有满足该技能的安全约束", "GLM给出了不安全的水上练习选项", "家长只在岸上看"]) if (!serverSource.includes(term)) failures.push(`LLM-only goal clarification missing ${term}`);
for (const term of ["goalQuestion", "goalClarifications", "answer-goal-clarification", "GLM生成的SMART目标", "不会套用通用模板"]) if (!appSourceText.includes(term)) failures.push(`LLM goal clarification UI missing ${term}`);
if (appSourceText.includes("function onboardingGoalDraft()")) failures.push("onboarding still uses a local goal template");
for (const term of ["ensureBuiltInDemoAccount", "builtin-admin@growth-os.local", 'loginName === "admin"', '"崔护"', '"9岁3个月"']) if (!serverSource.includes(term)) failures.push(`built-in demo account missing ${term}`);
for (const term of ["内置测试：账号 admin", "邮箱或测试账号"]) if (!htmlSource.includes(term)) failures.push(`built-in demo login UI missing ${term}`);
for (const term of [">今天</b>", ">想法</b>", ">目标</b>", ">安排</b>", ">记录</b>"]) if (!htmlSource.includes(term)) failures.push(`workflow navigation missing ${term}`);
if (appSourceText.includes('<div class="action-quick-add"')) failures.push("legacy multi-field quick-add is still rendered");
for (const term of ["/api/auth/recovery/rotate", "/api/auth/recovery/reset", "recoveryCode", "normalizeRecoveryCode", "dummyRecoveryHash", "consumeRecoveryAttempt", "DELETE FROM sessions WHERE user_id", "recovery_hash", "recovery_updated_at"]) {
  if (!serverSource.includes(term)) failures.push(`account recovery security missing ${term}`);
}
for (const term of ["recovery_rotated", "recovery_reset", "sessionsRevoked"]) if (!serverSource.includes(term)) failures.push(`account recovery audit missing ${term}`);
for (const term of ["使用恢复码", "重设密码并登录", "保存这枚恢复码", "rotate-recovery-code", "copy-recovery-code", "showRecoveryCode", "recovery-current-password"]) {
  if (!htmlSource.includes(term) && !appSourceText.includes(term)) failures.push(`account recovery UI missing ${term}`);
}
if (!serverSource.includes("current.count >= 5") || !serverSource.includes("15 * 60000")) failures.push("recovery reset rate limit missing");
if (!serverSource.includes("hashPassword(normalizeRecoveryCode(code))")) failures.push("recovery code stored without scrypt hash");
for (const term of ["/api/strategy-insights", "handleGenerateStrategyInsights", "handleStrategyInsightFeedback", "strategyEvidence", "fallbackStrategyInsights", "retractStrategyEvidence", "CREATE TABLE IF NOT EXISTS strategy_insights", "每条必须引用至少两个提供的ref", "不得复活rejectedKeys"]) {
  if (!serverSource.includes(term)) failures.push(`strategy memory digest missing ${term}`);
}
for (const term of ["我的使用说明书", "整理我的方法", "generate-strategies", "strategy-feedback", "generateStrategyInsights", "sendStrategyFeedback", "strategyInsights", "strategyInsights.some((item) => item.aiContext) ? 8 : 20"]) {
  if (!appSourceText.includes(term)) failures.push(`child strategy manual missing ${term}`);
}
if (!serverSource.includes("item.shareWithAi &&") || !serverSource.includes("journalRows(profileIdValue).filter((item) => item.shareWithAi)")) failures.push("private evidence can enter strategy digest");
if (!serverSource.includes("sources.length < 2") || !serverSource.includes("item.evidenceRefs.length >= 2")) failures.push("single evidence can become a stable strategy");
for (const term of ["`artifact:${id}`", "`journal:${id}`", "`memory:${id}`"]) if (!serverSource.includes(term)) failures.push(`strategy evidence retraction missing ${term}`);
for (const term of ["existingStrategies", "ratio >= 0.5", "ratio >= 0.75", "Math.max(Number(existing.confidence || 0), insight.confidence)"]) if (!serverSource.includes(term)) failures.push(`strategy regeneration guard missing ${term}`);
for (const term of ["action-rescues", "handleActionRescue", "handleActionRescueOutcome", "CREATE TABLE IF NOT EXISTS action_rescues", "action_rescue_requested", "action_rescue_outcome", "confirmedStrategies", "AbortSignal.timeout(12000)"]) {
  if (!serverSource.includes(term)) failures.push(`focus rescue server missing ${term}`);
}
for (const term of ["我卡住了", "不知道第一步", "感觉太难", "现在没力气", "缺少东西", "先试这一步", "只试5分钟", "今天先停", "requestFocusRescue", "applyFocusRescue", "focusRescueOpen"]) {
  if (!htmlSource.includes(term) && !appSourceText.includes(term)) failures.push(`focus rescue UI missing ${term}`);
}
for (const term of ["卡住后采用了一个更小步骤", "kind,summary,evidence_json", "planned_seconds", "elapsed + 300"]) if (!serverSource.includes(term)) failures.push(`focus rescue learning loop missing ${term}`);
if (serverSource.includes("卡住是失败") || appSourceText.includes("卡住是失败")) failures.push("focus rescue uses punitive language");

for (const term of ["draft: draft || undefined", "只追问草稿中尚未说清", "followup: isFollowup", "AbortSignal.timeout(5000)"]) if (!serverSource.includes(term)) failures.push(`journal follow-up server missing ${term}`);
for (const term of ["沿着这句继续问", "journalDraft", "ask-journal-followup", "state.journalDraft = \"\""]) if (!appSourceText.includes(term)) failures.push(`journal follow-up UI missing ${term}`);
for (const term of ["专注舱", "start-focus", "toggle-focus-pause", "finish-focus-action", "focusPattern", "loadFocus", "renderFocusOverlay"]) {
  if (!htmlSource.includes(term) && !appSourceText.includes(term)) failures.push(`focus execution mode missing ${term}`);
}
if (!serverSource.includes("elapsed_seconds) >= 30")) failures.push("zero-length focus sessions count as meaningful sessions");
for (const term of ["我的节奏", "create-habit", "checkin-habit", "habitRhythm", "habitRewardLedger", "loadHabits", "今天暂停，不责怪自己"]) {
  if (!appSourceText.includes(term)) failures.push(`habit rhythm system missing ${term}`);
}
if (!appSourceText.includes("Math.min(32")) failures.push("daily habit XP cap is missing");
for (const term of ["[3, 7, 14, 30, 60, 100]", "kind='habit'", "habit_reopened"]) {
  if (!serverSource.includes(term)) failures.push(`habit milestone memory missing ${term}`);
}
for (const term of ["我的行动台", "create-action", "breakdown-action", "update-action", "rankedActions", "actionQueue", "loadActions"]) {
  if (!appSourceText.includes(term)) failures.push(`adaptive action desk missing ${term}`);
}
for (const term of ["主线信号站", "capture-idea", "develop-idea", "set-idea-status", "journal-to-idea", "ideaPipeline", "loadIdeas", "内置测试账号"]) {
  if (!appSourceText.includes(term)) failures.push(`idea incubation or dev admin UI missing ${term}`);
}
for (const term of ["唤醒一颗旧灵感", "decide-idea-resurfacing", "继续收藏", "过阵子再看", "放下它", "loadIdeaResurfacing"]) {
  if (!appSourceText.includes(term)) failures.push(`idea resurfacing UI missing ${term}`);
}
for (const term of ["轻松开始", "正常推进", "认真挑战", "先休息一下", "quick-daily-start", "state.dailyCheckin.intent"]) {
  if (!appSourceText.includes(term)) failures.push(`daily intention UI missing ${term}`);
}
for (const term of ["checkin.intent === \"finish\"", "checkin.intent === \"create\"", "checkin.intent === \"reset\"", "checkin.intent === \"recharge\""]) {
  if (!serverSource.includes(term)) failures.push(`daily intention ranking missing ${term}`);
}
for (const term of ["CREATE TABLE IF NOT EXISTS daily_plan_feedback", "dailyPlanFeedbackCalibration", "recommendationCalibration", "swapReason", "dailyPlanFeedback", "handleListDailyPlanFeedback", "handleDeleteDailyPlanFeedback"]) {
  if (!serverSource.includes(term)) failures.push(`daily recommendation feedback backend missing ${term}`);
}
for (const term of ["这次为什么想换", "感觉有点大", "现在没兴趣", "不知道怎么开始", "只是现在不合适", "dailySwapOpen", "我的换选记录", "deleteDailyPlanFeedback"]) {
  if (!appSourceText.includes(term)) failures.push(`daily recommendation feedback UI missing ${term}`);
}
for (const term of ["CREATE TABLE IF NOT EXISTS family_briefs", "familyBriefEvidence", "journalTextIncluded: false", "handleGenerateFamilyBrief", "handleUpdateFamilyBrief", "handleDeleteFamilyBrief", "familyBriefs"]) {
  if (!serverSource.includes(term)) failures.push(`family brief privacy backend missing ${term}`);
}
for (const term of ["给家长看的本周简报", "我愿意给家长看", "收回分享", "renderFamilyBriefCard", "generateFamilyBrief", "updateFamilyBrief"]) {
  if (!appSourceText.includes(term)) failures.push(`child-controlled family brief UI missing ${term}`);
}
for (const term of ["versionNumber", "versionCount", "groupKey(row)"]) {
  if (!serverSource.includes(term)) failures.push(`artifact version backend missing ${term}`);
}
for (const term of ["做下一版", "旧版本不会被覆盖", "startArtifactRevision", "artifactRevision"]) {
  if (!appSourceText.includes(term)) failures.push(`artifact version UI missing ${term}`);
}
if (!serverSource.includes('process.env.NODE_ENV !== "production"') || !serverSource.includes("devAdminEnabled")) failures.push("dev admin is not production-gated");
for (const term of ["主线成长日记", "requestJournalPrompt", "saveJournalEntry", "recentJournal", "activeHypotheses", "set-journal-mode", "delete-journal", "journal-ai-context", "shareWithAi", "hypothesis-feedback", "关于我的成长假设"]) {
  if (!appSourceText.includes(term)) failures.push(`journal experience missing ${term}`);
}
if (!serverSource.includes("if (shareWithAi) evolveHypotheses") || !appSourceText.includes("memory.evidence?.shareWithAi !== false")) {
  failures.push("private journal data can influence AI context");
}
const privateJournal = { content: "秘密内容", shareWithAi: false };
const sharedJournal = { content: "可用于AI的内容", shareWithAi: true };
if (context.aiEligibleJournals([privateJournal, sharedJournal]).some((item) => item.content === "秘密内容")) failures.push("private journal entered AI context");
if (context.aiEligibleMemories([{ evidence: { shareWithAi: false }, summary: "秘密记忆" }, { evidence: {}, summary: "公开记忆" }]).some((item) => item.summary === "秘密记忆")) failures.push("private memory entered AI context");
if (context.aiEligibleHypotheses([{ aiContext: false, status: "challenged", confidence: 90 }, { aiContext: true, status: "active", confidence: 60 }]).length !== 1) failures.push("challenged hypothesis entered AI context");
if (context.actionReward({ estimateMinutes: 10, importance: 3 }) <= context.actionReward({ estimateMinutes: 5, importance: 1 })) failures.push("action rewards ignore effort and importance");
if (!appSourceText.includes("Math.min(60") || !appSourceText.includes("actionRewardLedger")) failures.push("daily action XP cap is missing");
for (const term of ["profile-consent", "guardianConsent", "trackEvent", "最近7天使用指标", "监护人同意已记录"]) {
  if (!htmlSource.includes(term) && !appSourceText.includes(term)) failures.push(`consent or metrics UI missing ${term}`);
}

for (const source of requiredScienceSources) {
  if (!scienceSource.includes(source)) failures.push(`SCIENCE.md missing ${source}`);
}

for (const term of ["tutorial-overlay", "next-tutorial", "skip-tutorial"]) {
  if (!htmlSource.includes(term)) failures.push(`tutorial UI missing ${term}`);
}
for (const term of ["tutorialSteps", "openTutorial", "finishTutorial", "talent-os-tutorial-complete", "重看新手引导"]) {
  if (!appSourceText.includes(term)) failures.push(`tutorial logic missing ${term}`);
}

for (const term of ["realProfile ? 1", "bonus-rewards", "renderGemStore", "buy-gem-item", "spentGems", "奖励同步收回", "data-theme"]) {
  if (!appSourceText.includes(term) && !htmlSource.includes(term) && !readFileSync("onboarding.css", "utf8").includes(term)) failures.push(`real economy missing ${term}`);
}
for (const term of ["personal-friction", "/api/onboarding/question", "smart", "keyResults", "weeklyPlan", "SMART目标", "OKR", "keyResultTitle"]) if (!appSourceText.includes(term) && !serverSource.includes(term)) failures.push(`SMART/OKR workflow missing ${term}`);
for (const term of ["/api/onboarding/portrait", "AI目前这样理解我", "confirmOnboardingPortrait", "saveOnboardingPortraitCorrection", "已用你的更正覆盖AI判断", "confirmedPortrait"]) if (!appSourceText.includes(term) && !serverSource.includes(term)) failures.push(`correctable AI portrait missing ${term}`);
for (const term of ["surpriseRewardRoll", "surprise-rolls", "chance: 0.35", "dailyCap: 2", "不能反复重抽"]) if (!appSourceText.includes(term)) failures.push(`bounded surprise reward missing ${term}`);

for (const term of ["is_primary", "activeGoalId", "promotePrimaryGoal", "daily_mission_books", "goal_id AS goalId", "artifacts.goal_id", "ensureColumn(\"task_feedback\", \"goal_id\"", "ensureColumn(\"journals\", \"goal_id\""]) {
  if (!serverSource.includes(term)) failures.push(`unified journey data model missing ${term}`);
}
for (const term of ["renderCurrentJourneySpine", "当前主线路线台", "sourceType === \"mission\"", "current-mission", "generateDailyMissionBook"]) {
  if (!appSourceText.includes(term) && !serverSource.includes(term)) failures.push(`unified journey workflow missing ${term}`);
}

if (failures.length) {
  console.error(failures.map((failure) => `- ${failure}`).join("\n"));
  process.exit(1);
}

console.log("Product logic validation passed.");

function loadAppContext() {
  class MockClassList {
    toggle() {}
  }

  function makeElement() {
    return {
      innerHTML: "",
      textContent: "",
      className: "",
      style: {},
      scrollTop: 0,
      classList: new MockClassList(),
      querySelector(selector) {
        return selector === "i" ? { textContent: "" } : null;
      }
    };
  }

  const store = new Map();
  const sandbox = {
    console,
    Date,
    setTimeout: () => 0,
    clearTimeout() {},
    setInterval: () => 0,
    clearInterval() {},
    localStorage: {
      getItem: (key) => (store.has(key) ? store.get(key) : null),
      setItem: (key, value) => store.set(key, String(value)),
      removeItem: (key) => store.delete(key)
    },
    document: {
      querySelector: () => makeElement(),
      querySelectorAll: (selector) => {
        if (selector === ".tab") return [];
        if (selector === ".child-card") return [];
        return [];
      },
      addEventListener() {}
    }
  };
  const appSource = readFileSync("app.js", "utf8");
  vm.runInNewContext(`${appSource}\nthis.__APP__ = { children, skillFramework, contextQuestions, trainingPrinciples, taskExperienceProfiles, aiQuestFromResult, buildCoachPayload, getAiCoachResult, renderQuestCard, renderRecommendations, setAiCoachResult, setCoachSession, recommendedQuests, rememberRecommendation, economyState, toggleDone, setGrowthPlan, setScheduleItems, setNewsContext, aiEligibleMemories, aiEligibleJournals, aiEligibleHypotheses, actionReward };`, sandbox);
  return sandbox.__APP__;
}
