(() => {
  const family = window.GrowthFamily;
  if (!family || typeof compileTask !== "function") return;
  const child = family.getActiveChild();
  if (!child || child.state?.task) return;

  const isSister = child.id === "sister";
  const initial = isSister
    ? {
        shell: "故事会",
        coreSkills: ["责任闭环", "用户意识", "挫折恢复"],
        realUser: "家人",
        problem: "通过一次短小、可完成、可分享的故事或手工作品，观察妹妹会主动选择什么、怎样表达、能否完成归位和收尾。",
        availableTime: 20
      }
    : {
        shell: "刘慈欣科幻",
        coreSkills: ["责任闭环", "反馈与提炼", "中文书写"],
        realUser: "妹妹和爷爷奶奶",
        problem: "把科幻阅读兴趣变成家人可使用的成果，同时观察哥哥能否总结方法、清楚表达并完成检查收尾。",
        availableTime: 35
      };

  chosenShell = initial.shell;
  chosenSkills = [...initial.coreSkills];
  state.task = compileTask(initial);
  save();
})();
