(() => {
  const KERNEL_VERSION = 'decision-kernel-3.0';
  const PHASE_DURATION = [0.65, 0.8, 0.75, 1, 1, 0.75, 0.7];
  const PROBLEM_SKILL_RULES = [
    { pattern: /整理|分类|查找|文件|归档|版本|书架/, skills: ['文件管理', '责任闭环'] },
    { pattern: /预算|价格|数量|材料|时间|路线|成本/, skills: ['数学预算', '任务拆解'] },
    { pattern: /记录|变化|次数|比较|效果|训练/, skills: ['数据分析', '反馈与提炼'] },
    { pattern: /讲解|故事|写作|说明|表达|阅读/, skills: ['深度阅读', '中文书写'] },
    { pattern: /妹妹|家人|同学|用户|使用|合作/, skills: ['用户意识', '合作分工'] },
    { pattern: /电脑|程序|自动|流程|AI|人工智能/, skills: ['计算思维', 'AI协作', '打字'] }
  ];

  const compact = (value, limit = 28) => {
    const text = String(value || '').replace(/\s+/g, ' ').trim();
    return text.length > limit ? `${text.slice(0, limit)}…` : text;
  };
  const stableHash = value => {
    let hash = 2166136261;
    for (const char of String(value)) {
      hash ^= char.charCodeAt(0);
      hash = Math.imul(hash, 16777619);
    }
    return (hash >>> 0).toString(36);
  };
  const scopeFor = minutes => {
    if (minutes <= 20) return { label: '轻量版', outputLimit: 3, depth: '只完成一个可用最小版本' };
    if (minutes >= 60) return { label: '深度版', outputLimit: 8, depth: '完成可交付版本，并增加一次解释或答辩' };
    return { label: '标准版', outputLimit: 5, depth: '完成可测试、可修改的标准版本' };
  };
  const addScore = (scores, skill, amount) => {
    if (!skill || !SKILL_META[skill]) return;
    scores.set(skill, (scores.get(skill) || 0) + amount);
  };

  function chooseSupport(template, core, problem) {
    const scores = new Map();
    template.support.forEach((skill, index) => addScore(scores, skill, 12 - index));
    focusSkills().forEach(skill => addScore(scores, skill, 10));
    for (const rule of PROBLEM_SKILL_RULES) {
      if (rule.pattern.test(problem)) rule.skills.forEach(skill => addScore(scores, skill, 9));
    }
    return [...scores.entries()]
      .filter(([skill]) => !core.includes(skill))
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'zh-CN'))
      .slice(0, 6)
      .map(([skill]) => skill);
  }

  function buildBaseSteps(template, realUser, problem, availableTime, scope) {
    const shellSteps = template.steps;
    const problemLabel = compact(problem, 34);
    const titles = [
      `和${realUser}确认真正要解决的问题`,
      shellSteps[1],
      `围绕“${problemLabel}”设计第一版方案`,
      shellSteps[3],
      shellSteps[4],
      `请${realUser}真实试用并记录障碍`,
      `根据反馈修改、交付并约定维护`
    ];
    const childActions = [
      `${shellSteps[0]}。把“${problem}”改写成一句可验证的任务：给谁用、解决什么、怎样算成功。`,
      `${shellSteps[1]}。只学习完成本项目必需的方法，并做一个最小样例验证是否理解。`,
      `${shellSteps[2]}。方案必须直接回应“${problemLabel}”，标出先后顺序、材料限制和今天只做哪一步。`,
      `${shellSteps[3]}。先做最小可用版本，不追求一次完美；记录一个真实卡点。`,
      `${shellSteps[4]}。补齐核心成果，检查是否仍在解决“${problemLabel}”，删掉无关装饰。`,
      `${shellSteps[5]}。让${realUser}在不被提示的情况下实际使用，记录看不懂、找不到、做不到或不愿用的地方。`,
      `${shellSteps[6]}。根据反馈至少修改一处，完成清理归位、版本保存和下一次维护约定。`
    ];
    const evidences = [
      `一张任务委托卡：使用者=${realUser}、问题=${problemLabel}、成功标准`,
      '方法要点、来源或最小样例',
      '方案草图、步骤清单和取舍说明',
      '第一版成果、卡点与一次自主尝试',
      '可测试版本、检查清单或过程数据',
      `${realUser}的具体反馈和观察记录`,
      '修改前后对比、最终成果、维护规则和迁移卡'
    ];
    const standards = [
      `孩子能说清${realUser}为什么需要它，并给出至少2条可检查的成功标准。`,
      '能用自己的话解释方法，并独立完成一个小样例。',
      `方案中的每一步都能说明怎样解决“${problemLabel}”。`,
      '出现可见、可保存的第一版成果；卡住后没有由成人接管。',
      `成果已达到“${scope.depth}”，核心功能可以被实际使用。`,
      `${realUser}完成一次真实试用，至少留下2条具体而非“好/不好”的反馈。`,
      '至少根据反馈修改一处，完成交付、归位和可复用方法总结。'
    ];
    return titles.map((title, index) => ({
      id: makeId(),
      phase: PHASES[index],
      title,
      purpose: standards[index],
      child: childActions[index],
      parent: BASE_PARENTS[index],
      elder: BASE_ELDERS[index],
      duration: Math.max(15, Math.round(availableTime * PHASE_DURATION[index])),
      evidence: evidences[index],
      standard: standards[index],
      skills: [],
      skillTraining: [],
      done: false,
      note: ''
    }));
  }

  function attachSkill(steps, skill, role) {
    const plugin = SKILL_PLUGINS[skill];
    if (!plugin) return;
    const phase = Math.max(0, Math.min(steps.length - 1, Number(plugin.phase) || 0));
    const step = steps[phase];
    if (!step.skills.includes(skill)) step.skills.push(skill);
    if (!step.skillTraining.some(item => item.skill === skill && item.role === role)) {
      step.skillTraining.push({ skill, role, action: plugin.action });
    }
    if (role === '核心训练') {
      step.title = `${step.title}｜重点训练：${skill}`;
      step.child += ` 核心要求：${plugin.action}`;
      step.parent += ` ${plugin.parent}`;
      step.evidence += `；${plugin.evidence}`;
      step.standard += ` ${skill}验收：${plugin.standard}`;
      steps[0].purpose += ` 本项目重点观察“${skill}”是否从提示走向自主。`;
      steps.at(-1).standard += ` 孩子能说明本项目中“${skill}”真正起作用的做法。`;
    } else if (role === '重要支撑') {
      step.child += ` 支撑练习：${plugin.action}`;
    }
  }

  function compileTaskV3({ shell, coreSkills, realUser, problem, availableTime }) {
    const template = TEMPLATES[shell] || TEMPLATES[SHELLS[0]];
    const selectedShell = TEMPLATES[shell] ? shell : SHELLS[0];
    const core = uniq(coreSkills).filter(skill => SKILL_META[skill]).slice(0, 3);
    if (!core.length) core.push('任务拆解');
    const userText = compact(realUser || '家人', 18);
    const problemText = String(problem || template.purpose).trim();
    const minutes = Math.max(15, Math.min(120, Number(availableTime) || 35));
    const scope = scopeFor(minutes);
    const support = chooseSupport(template, core, problemText);
    const maintenance = uniq([...template.maintain, '责任闭环', '反馈与提炼'])
      .filter(skill => !core.includes(skill) && !support.includes(skill))
      .slice(0, 3);
    const steps = buildBaseSteps(template, userText, problemText, minutes, scope);

    core.forEach(skill => attachSkill(steps, skill, '核心训练'));
    support.forEach(skill => attachSkill(steps, skill, '重要支撑'));
    maintenance.forEach(skill => attachSkill(steps, skill, '基础维护'));

    steps.forEach((step, index) => {
      if (!step.skills.length) {
        const fallback = support[index % Math.max(1, support.length)] || core[index % core.length];
        if (fallback) step.skills.push(fallback);
      }
    });

    const skillOutputs = core.map(skill => SKILL_PLUGINS[skill]?.output).filter(Boolean);
    const profileMaterials = (state.child?.resources || [])
      .filter(item => selectedShell.includes(item) || item.includes(selectedShell) || /电脑|纸|笔|书|器材|地图/.test(item))
      .slice(0, 3);
    const outputs = uniq([...template.outputs, ...skillOutputs, scope.label === '深度版' ? '讲解或答辩记录' : ''])
      .slice(0, scope.outputLimit);
    const fingerprintSource = [selectedShell, core.join('+'), userText, minutes, problemText, state.child?.name || ''].join('|');

    return {
      id: makeId(),
      compilerVersion: KERNEL_VERSION,
      fingerprint: `${selectedShell}|${stableHash(fingerprintSource)}`,
      compiledAt: new Date().toISOString(),
      generatedBy: '可解释决策内核',
      title: `${template.title}（${core.join('＋')}·${scope.label}）`,
      purpose: `为${userText}解决“${problemText}”。以${selectedShell}为项目外壳，重点训练${core.join('、')}，${scope.depth}。`,
      shell: selectedShell,
      realUser: userText,
      problem: problemText,
      availableTime: minutes,
      coreSkills: core,
      supportSkills: support,
      maintenanceSkills: maintenance,
      outputs,
      materials: uniq([...template.materials, ...profileMaterials]),
      safety: template.safety,
      rationale: `外壳来自孩子兴趣；核心技能直接改写对应步骤、家长提示、证据与标准；真实问题进入任务定义、方案设计、用户测试和交付四个关键阶段。`,
      decisionTrace: {
        scope: scope.label,
        shell: selectedShell,
        coreSkills: core,
        supportSkills: support,
        problemSignals: PROBLEM_SKILL_RULES.filter(rule => rule.pattern.test(problemText)).flatMap(rule => rule.skills)
      },
      steps
    };
  }

  compileTask = compileTaskV3;

  const legacyRenderGenerator = renderGenerator;
  renderGenerator = function renderGeneratorV3() {
    legacyRenderGenerator();
    const signal = el('profileSignal');
    if (signal) signal.innerHTML = signal.innerHTML.replace('模板回退编译器', '确定性决策内核（当前不调用AI）');
  };

  const legacyGo = go;
  go = function goV3(page) {
    legacyGo(page);
    if (page === 'generator') el('pageSub').textContent = '输入变化会真实改写任务、步骤、证据与标准';
  };

  try {
    const key = 'growthOSAI';
    const raw = JSON.parse(localStorage.getItem(key) || 'null');
    if (!raw || raw.mode === 'plus') {
      localStorage.setItem(key, JSON.stringify({ ...(raw || {}), mode: 'template', fallback: true }));
    }
  } catch (error) {
    console.warn('无法迁移成长OS内核设置', error);
  }
})();
