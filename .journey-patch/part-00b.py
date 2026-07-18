# Scope ambiguous anchors to the intended function instead of modifying every match.
_base_replace_once = replace_once
_base_insert_after = insert_after


def _replace_in_function(text: str, function_anchor: str, next_anchor: str, old: str, new: str, label: str) -> str:
    start = text.find(function_anchor)
    end = text.find(next_anchor, start + len(function_anchor))
    if start < 0 or end < 0:
        raise SystemExit(f'{label}: function boundary not found')
    segment = text[start:end]
    count = segment.count(old)
    if count != 1:
        raise SystemExit(f'{label}: expected one scoped anchor, found {count}')
    return text[:start] + segment.replace(old, new, 1) + text[end:]


def insert_after(text: str, anchor: str, addition: str, label: str) -> str:
    if label == 'action lineage vars':
        return _replace_in_function(
            text,
            'async function handleCreateAction(request, response) {',
            'async function handleUpdateAction(request, response, url) {',
            anchor,
            anchor + addition,
            label,
        )
    if label == 'app load journey':
        return _replace_in_function(
            text,
            'async function loadCloudProgress(profileId) {',
            'function getPrefs() {',
            anchor,
            anchor + addition,
            label,
        )
    return _base_insert_after(text, anchor, addition, label)


def replace_once(text: str, old: str, new: str, label: str) -> str:
    if label in {'action insert sql', 'action insert values'}:
        return _replace_in_function(
            text,
            'async function handleCreateAction(request, response) {',
            'async function handleUpdateAction(request, response, url) {',
            old,
            new,
            label,
        )
    if label == 'action public lineage':
        query_old = 'SELECT id,title,detail,status,estimate_minutes AS estimateMinutes,energy,importance,due_at AS dueAt,source,source_ref AS sourceRef,goal_id AS goalId,'
        query_new = 'SELECT id,journey_id AS journeyId,project_id AS projectId,title,detail,status,estimate_minutes AS estimateMinutes,energy,importance,due_at AS dueAt,source,source_ref AS sourceRef,goal_id AS goalId,'
        return _base_replace_once(text, query_old, query_new, 'action row lineage')
    return _base_replace_once(text, old, new, label)
