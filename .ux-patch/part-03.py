# Wrap every catalog/generated quest with category and measurable completion criteria.
app = app_path.read_text(encoding='utf-8')
old_name = 'function dailyTodoCatalog()'
start = app.find(old_name)
if start < 0:
    raise SystemExit('dailyTodoCatalog not found')
app = app[:start] + app[start:].replace(old_name, 'function rawDailyTodoCatalog()', 1)
end = function_end(app, start)
wrapper = '''

// GROWTHOS_CONCRETE_TASKS_V2
const clearTaskCategories = ["身体运动", "阅读表达", "数学数据", "生活自理", "创造项目", "AI与工具", "家庭责任", "户外探索"];
function inferClearTaskCategory(task) {
  const text = `${task?.category || ""} ${task?.type || ""} ${task?.title || ""}`;
  if (/跳绳|跑步|运动|姿态|平板|球|身体/.test(text)) return "身体运动";
  if (/阅读|故事|复述|写作|讲解|表达/.test(text)) return "阅读表达";
  if (/数学|计算|数据|统计|预算|比较/.test(text)) return "数学数据";
  if (/整理|书包|洗|做饭|生活|收纳/.test(text)) return "生活自理";
  if (/AI|电脑|打字|文件|核验/.test(text)) return "AI与工具";
  if (/家庭|合作|家务|分工|帮助/.test(text)) return "家庭责任";
  if (/户外|观察|地图|路线|自然/.test(text)) return "户外探索";
  return "创造项目";
}
function measurableSuccess(task, category, minutes) {
  const supplied = String(task?.success || task?.successCriteria || "").trim();
  if (/\\d|分钟|秒|次|个|页|米|字|道|拍照|录音|讲给|勾选/.test(supplied)) return supplied;
  const text = `${task?.title || ""} ${task?.steps?.join(" ") || ""}`;
  if (/跳绳/.test(text)) return "连续跳绳3分钟，基础目标180次，挑战目标300次，记录总次数";
  if (/跑步|快走/.test(text)) return `连续运动${Math.max(5, minutes)}分钟，记录时间或距离`;
  if (/阅读|读书/.test(text)) return "读完4页，并用自己的话复述3句话";
  if (/数学|计算|口算/.test(text)) return "完成10道题，至少答对8道，并订正错题";
  if (/写作|作文|日记/.test(text)) return "写满5行或80字，完成后自己检查1遍";
  if (/打字/.test(text)) return "10分钟输入100字，错字不超过5个，并保存文件";
  if (/整理|书包|收纳/.test(text)) return "10分钟内按清单检查5项，完成后拍照或勾选确认";
  if (category === "身体运动") return `连续完成${Math.max(5, minutes)}分钟，记录次数、时间或距离中的1项`;
  if (category === "阅读表达") return `在${minutes}分钟内完成1段阅读，并讲出3个要点`;
  if (category === "数学数据") return `在${minutes}分钟内完成10个可核对的小题或记录项`;
  return `在${minutes}分钟内完成1个看得见、能检查的结果`;
}
function concretizeQuest(task, index = 0) {
  const minutes = Math.max(3, Math.min(60, Number(task?.minutes || 10)));
  const category = clearTaskCategories.includes(task?.category) ? task.category : inferClearTaskCategory(task);
  const success = measurableSuccess(task, category, minutes);
  const steps = Array.isArray(task?.steps) && task.steps.length
    ? task.steps.slice(0, 4).map(String)
    : ["准备需要的东西", `连续做${minutes}分钟`, "按完成标准检查并记录结果"];
  return { ...task, category, type: category, minutes, success, completionCheck: success, steps, firstStep: String(task?.firstStep || steps[0] || "先准备好需要的东西").slice(0, 120), id: task?.id || `clear-task-${index}` };
}
function dailyTodoCatalog() {
  return rawDailyTodoCatalog().map(concretizeQuest);
}
'''
app = app[:end] + wrapper + app[end:]
app_path.write_text(app, encoding='utf-8')
