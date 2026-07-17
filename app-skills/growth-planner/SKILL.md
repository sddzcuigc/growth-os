# Growth Planner Skill

Version: 1.0.0

## Purpose

Turn a child's own words and Growth OS context into a small, realistic plan without replacing the child's choice. This skill is used for both multi-item text extraction and daily recommendations.

## Inputs

- Local date, weekday, timezone and season mode.
- Child age and confirmed portrait only.
- Active SMART goal, weekly project contract and today's project stage.
- Existing open, overdue and unfinished Todo items.
- Existing calendar events, fixed routines and available time windows.
- Recent task feedback and skill priorities.

## Non-negotiable Rules

1. Preserve explicit user-entered items. Never silently rewrite, delete or mark them complete.
2. Prefer carrying forward a relevant unfinished item over creating a duplicate.
3. Every generated Todo must cite one source: `carryover`, `weekly_project`, `daily_goal`, `skill_tree`, `routine_balance` or `user_text`.
4. Every generated Todo must have a visible completion condition, estimated minutes and a first step.
5. Calendar events reserve time. Todo items may be time-blocked, but a due date is not the same as a start time.
6. Never schedule overlapping items. Keep at least 10 minutes between demanding blocks.
7. During summer vacation, plan across the full waking day. Weekdays use a steadier learning/project rhythm; weekends are lighter and favor family, outdoor activity, social connection and weekly-project completion.
8. Include meals, movement and rest gaps. Do not fill every free minute.
9. For ages 6-12, generated focused blocks should usually be 10-30 minutes. Longer work must be split into steps.
10. Water, road, fire, heights, tools and intense exercise require explicit adult or qualified-coach support.
11. Private journals are excluded unless the entry has `shareWithAi=true`.
12. Return JSON only and conform to `output.schema.json`.

## Recommendation Balance

- One current weekly-project step.
- Zero to two relevant carryover items.
- One learning or reading block on summer weekdays; optional and lighter on weekends.
- One physical activity block.
- One life skill, responsibility or communication block when not already covered by fixed routines.
- On summer weekdays, cover morning preparation, one focused learning block, the weekly project, body movement, one life responsibility and a short evening share or reflection across the waking day.
- On summer weekends, keep learning lighter and prioritize family participation, outdoor movement, social connection and a gentle weekly-project step.
- At least one open rest/play window.
- Do not generate more than eight recommendations for one day.

## Extraction Mode

Extract every explicit Todo or event from the user's paragraph. Keep separate items separate. Resolve relative dates from the supplied local date. If one missing fact prevents a safe or usable result, ask exactly one question; otherwise return a preview for confirmation.

## Recommendation Mode

Rank existing unfinished items first by due date, importance, relevance to the weekly project and fit with available time. Create new items only for uncovered project stages or growth-balance needs. Explain each recommendation in one short child-facing sentence.
