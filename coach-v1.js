(() => {
  const ROUTE_KEY = 'growthOSCoachRoute';
  const PROFILE_VERSION = 1;
  const legacyRenderSkills = typeof window.renderSkills === 'function' ? window.renderSkills : null;
  const legacyRenderGenerator = typeof window.renderGenerator === 'function' ? window.renderGenerator : null;
  const legacyRenderWorkflow = typeof window.renderWorkflow === 'function' ? window.renderWorkflow : null;
  const legacyRenderReview = typeof window.renderReview === 'function' ? window.renderReview : null;

  const TASK_LIBRARY = [
    {
      id: 'story-detective', title: '故事侦探：找出人物真正的选择', kind: '阅读表达', shell: '故事会', age: [7, 12],
      interests: ['故事', '阅读', '科幻', '漫画'], skills: ['深度阅读', '反馈与提炼', '中文书写'], duration: 25, energy: 2, challenge: .48,
      goal: '把“读过”变成“看懂人物为什么这样做”。', deliverable: '一张人物选择卡＋3分钟讲解',
      standard: '能说出人物目标、阻碍、选择、结果，并引用一处原文或情节作为证据。',
      parentSupport: '只追问“你的证据在哪里”，不替孩子总结。', materials: ['一本正在读的故事书', '纸笔'],
      steps: ['选一个今天最有争议的人物', '写下目标—阻碍—选择—结果', '找一处情节作为证据', '讲给家人听并根据疑问修改']
    },
    {
      id: 'minecraft-rescue', title: 'Minecraft救援站：为一家人设计安全基地', kind: '工程创造', shell: 'Minecraft', age: [7, 13],
      interests: ['Minecraft', '游戏', '建筑', '科幻'], skills: ['任务拆解', '数学预算', '计算思维'], duration: 40, energy: 3, challenge: .62,
      goal: '把游戏兴趣转化为需求分析、规划和测试。', deliverable: '基地平面图＋可用建筑＋测试记录',
      standard: '基地至少解决食物、睡眠、防御和撤离四个真实需求，并让家人实际测试一次。',
      parentSupport: '先看纸上方案，再开放游戏时间；只检查需求是否真的解决。', materials: ['Minecraft', '纸笔'],
      steps: ['确定灾害情境和居住人数', '画平面图并列出四个必要系统', '限制材料并拆成施工顺序', '建造最小版本', '邀请家人测试并修改一处']
    },
    {
      id: 'family-route', title: '家庭探索官：设计一条真的能走的路线', kind: '生活项目', shell: '地理探索', age: [8, 13],
      interests: ['地理', '地图', '旅行', '探索'], skills: ['信息可信度', '数学预算', '任务拆解'], duration: 35, energy: 2, challenge: .58,
      goal: '把地理兴趣转化为真实规划能力。', deliverable: '路线图＋时间预算＋物品清单',
      standard: '路线包含出发时间、交通方式、费用、风险点和备选方案，家人能按它执行。',
      parentSupport: '只负责最终安全确认，不替孩子查完所有信息。', materials: ['地图或地图软件', '纸笔'],
      steps: ['确定对象、时间和限制', '比较两条路线', '估算时间和费用', '列出风险点与备选方案', '请家人审查并修改']
    },
    {
      id: 'badminton-data', title: '羽毛球进步实验：哪种练法最有效', kind: '运动实验', shell: '羽毛球', age: [7, 13],
      interests: ['羽毛球', '运动', '挑战', '数据'], skills: ['数据分析', '挫折恢复', '反馈与提炼'], duration: 25, energy: 3, challenge: .5,
      goal: '让运动不只靠感觉，而是学会记录、比较和调整。', deliverable: '三次训练记录＋一张趋势图',
      standard: '完成至少三轮同条件测试，能用数据说明哪种练习更有效。',
      parentSupport: '帮忙计时或录像，不直接纠正每一个动作。', materials: ['球拍', '羽毛球', '记录纸'],
      steps: ['记录当前连续击球基线', '选择一种练习方法', '完成三轮同条件测试', '画出前后变化', '解释数据并决定下一次练法']
    },
    {
      id: 'home-chef', title: '小主厨委托：为家人完成一道菜', kind: '生活责任', shell: '家庭做饭', age: [6, 13],
      interests: ['做饭', '美食', '家庭', '动手'], skills: ['责任闭环', '数学预算', '用户意识'], duration: 45, energy: 3, challenge: .55,
      goal: '在真实服务中练习计划、责任和用户反馈。', deliverable: '菜单＋清单＋成品＋清理记录',
      standard: '家人实际品尝，孩子完成准备、制作和收尾中适龄可独立承担的部分。',
      parentSupport: '刀具、明火近距离看护；不接管清单、摆盘和清理。', materials: ['食材', '厨房工具'],
      steps: ['询问家人的口味和限制', '列食材、数量和步骤', '完成低风险准备工作', '在成人看护下制作', '请家人反馈并完成清理归位']
    },
    {
      id: 'family-library', title: '家庭图书馆：让别人30秒找到一本书', kind: '整理系统', shell: '刘慈欣科幻', age: [7, 13],
      interests: ['阅读', '科幻', '故事', '整理'], skills: ['文件管理', '责任闭环', '用户意识'], duration: 30, energy: 2, challenge: .46,
      goal: '把阅读资源变成一个真正可使用的系统。', deliverable: '分类规则＋标签＋查找测试',
      standard: '一个不参与整理的家人能在30秒内按规则找到指定书。',
      parentSupport: '只作为测试用户，不用自己的分类习惯替代孩子方案。', materials: ['家中图书', '标签纸'],
      steps: ['采访家人平时怎样找书', '提出两种分类办法并选择一种', '完成一小层书架的最小版本', '让家人查找三本书', '根据失败点修改并约定维护']
    },
    {
      id: 'ai-checker', title: 'AI侦错员：找出AI回答里不可靠的地方', kind: '数字素养', shell: '地理探索', age: [9, 13],
      interests: ['AI', '电脑', '科学', '提问'], skills: ['AI协作', '信息可信度', '深度阅读'], duration: 25, energy: 2, challenge: .66,
      goal: '从“会问AI”升级为“会验证AI”。', deliverable: 'AI回答核验表',
      standard: '至少核对两个来源，指出一条可信内容、一条不确定内容和一条需要修正的内容。',
      parentSupport: '不替孩子判断答案，只追问来源和证据。', materials: ['AI工具', '可靠资料或书籍'],
      steps: ['提出一个孩子真的想知道的问题', '先写自己的猜测', '询问AI并标记关键结论', '用两个来源核对', '写出采用、保留和拒绝的内容']
    },
    {
      id: 'keyboard-publisher', title: '小编辑出版：把一段口述变成可读作品', kind: '数字表达', shell: '故事会', age: [6, 12],
      interests: ['故事', '画画', '电脑', '表达'], skills: ['打字', '中文书写', '反馈与提炼'], duration: 20, energy: 1, challenge: .42,
      goal: '降低书写阻力，同时保留孩子自己的语言。', deliverable: '一页电子小作品',
      standard: '作品有标题、三段内容和一次修改，孩子能指出修改前后哪里更清楚。',
      parentSupport: '允许先口述，不代打；只示范一个排版动作。', materials: ['电脑或平板', '一张照片或一幅画'],
      steps: ['围绕一张图口述一个小故事', '列出开头—变化—结尾', '自己输入或分段输入', '朗读检查不清楚的地方', '请家人读并修改一处']
    },
    {
      id: 'sibling-teacher', title: '教会妹妹：把一个方法讲到别人会做', kind: '合作表达', shell: '故事会', age: [7, 13],
      interests: ['妹妹', '家庭', '教学', '故事'], skills: ['合作分工', '用户意识', '迁移应用'], duration: 20, energy: 2, challenge: .5,
      goal: '用真实教学检验自己是否真正理解。', deliverable: '三步教学卡＋妹妹独立尝试记录',
      standard: '妹妹在不被直接代做的情况下完成一次尝试，哥哥根据她的困难修改讲法。',
      parentSupport: '只观察双方互动，避免替哥哥讲或替妹妹做。', materials: ['任意孩子已会的小技能'],
      steps: ['选一个妹妹愿意学的小技能', '拆成三个动作', '先示范一次再让妹妹尝试', '记录妹妹卡住的位置', '改变讲法并再次测试']
    },
    {
      id: 'room-reset', title: '十分钟房间复位：设计不用催的收尾系统', kind: '生活责任', shell: '家庭做饭', age: [6, 13],
      interests: ['整理', '挑战', '家庭'], skills: ['责任闭环', '任务拆解', '数据分析'], duration: 15, energy: 2, challenge: .4,
      goal: '把“听到提醒才整理”变成可执行的自我管理系统。', deliverable: '复位清单＋计时记录',
      standard: '连续三次按同一清单完成，提醒次数下降，并能主动发现一个遗漏。',
      parentSupport: '只在开始前提醒一次，结束后问“还有什么没收尾”。', materials: ['计时器', '纸笔'],
      steps: ['拍下开始前状态', '列出不超过五个复位动作', '计时完成一次', '检查遗漏并调整顺序', '连续三次记录时间和提醒次数']
    },
    {
      id: 'science-question', title: '家庭科学记者：把一个“为什么”查清楚', kind: '科学研究', shell: '刘慈欣科幻', age: [8, 13],
      interests: ['科学', '科幻', '为什么', '实验'], skills: ['深度阅读', '信息可信度', '反馈与提炼'], duration: 30, energy: 2, challenge: .6,
      goal: '保护好奇心，同时形成证据意识。', deliverable: '一页问题报告＋口头解释',
      standard: '能区分事实、推测和仍不知道的部分，并引用两个不同来源。',
      parentSupport: '不急着给答案，帮助缩小问题范围。', materials: ['书籍或可靠网站', '纸笔'],
      steps: ['把大问题改成一个可查的小问题', '写下原来的猜测', '查两个来源并记录证据', '比较一致与冲突', '用自己的话向家人解释']
    },
    {
      id: 'mini-market', title: '家庭小卖部：用20元做一次采购决策', kind: '数学生活', shell: '家庭做饭', age: [7, 12],
      interests: ['购物', '零食', '数学', '家庭'], skills: ['数学预算', '用户意识', '任务拆解'], duration: 25, energy: 2, challenge: .52,
      goal: '把口算和数感放进真实取舍。', deliverable: '采购方案＋预算核对',
      standard: '总价不超预算，能说明为什么放弃一个选项，并核对估算与实际差异。',
      parentSupport: '先让孩子估算，不直接报总价。', materials: ['20元预算', '商品价格信息'],
      steps: ['询问两位家人的需要', '列出三个采购方案', '估算每个方案总价', '做出选择并解释取舍', '核对实际价格和误差']
    },
    {
      id: 'creative-card', title: '给家人做一张真正有用的提醒卡', kind: '创造表达', shell: '故事会', age: [5, 10],
      interests: ['画画', '手工', '家庭', '创造'], skills: ['用户意识', '中文书写', '责任闭环'], duration: 20, energy: 1, challenge: .35,
      goal: '让创作不只是好看，而是真正帮助别人。', deliverable: '一张提醒卡＋一次真实使用',
      standard: '使用者一眼看懂要做什么，并在使用后给出具体反馈。',
      parentSupport: '只帮助确认安全和材料，不替孩子决定画面。', materials: ['纸笔或手工材料'],
      steps: ['找一个家里经常忘记的小问题', '问使用者最需要看到什么', '画出第一版提醒卡', '放到真实位置测试', '根据使用反馈修改']
    },
    {
      id: 'movement-course', title: '客厅闯关赛：设计一条全家能玩的运动路线', kind: '运动创造', shell: '羽毛球', age: [5, 10],
      interests: ['运动', '游戏', '闯关', '家庭'], skills: ['任务拆解', '合作分工', '用户意识'], duration: 25, energy: 3, challenge: .4,
      goal: '在身体活动中发展规划、规则和合作。', deliverable: '四关路线＋计分规则',
      standard: '至少两位家人能安全完成，规则清楚，并根据一次试玩修改。',
      parentSupport: '负责排除危险，不替孩子设计全部关卡。', materials: ['安全软物品', '计时器'],
      steps: ['确定参与者和安全限制', '设计四个不同动作关卡', '画路线并写简单规则', '全家试玩一次', '根据太难或不清楚的地方修改']
    }
  ];

  const OPTION_SKILL_MAP = {
    deep_focus: ['深度阅读'], question_research: ['信息可信度', '深度阅读'], self_search: ['信息可信度'],
    hands_on: ['任务拆解', '计算思维'], starts_independently: ['责任闭环'], closes_loop: ['责任闭环'],
    oral_story: ['反馈与提炼'], draw_build: ['用户意识'], enjoys_movement: ['挫折恢复'],
    finish_no_check: ['责任闭环'], adult_takeover: ['责任闭环'], avoid_writing: ['中文书写'], posture_issue: ['责任闭环']
  };

  const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, value));
  const unique = items => [...new Set(items.filter(Boolean))];
  const esc = value => typeof window.escapeHtml === 'function' ? window.escapeHtml(value) : String(value).replace(/[&<>'"]/g, '');
  const now = () => new Date().toISOString();
  const activeFamilyChild = () => window.GrowthFamily?.getActiveChild?.() || null;
  const ageNumber = () => Number(String(state.child?.age || '').match(/\d+/)?.[0] || 9);
  const normalizeText = value => String(value || '').toLowerCase().replace(/[《》“”‘’\s]/g, '');
  const fuzzyMatch = (a, b) => {
    const x = normalizeText(a), y = normalizeText(b);
    return x && y && (x.includes(y) || y.includes(x));
  };

  function defaultCoachProfile() {
    const interests = state.child?.interests || [];
    const focus = state.child?.focus || [];
    const skillConfidence = {};
    Object.entries(state.skills || {}).forEach(([skill, data]) => {
      skillConfidence[skill] = clamp((Number(data.level || 0) + 1) / 6, .12, .9);
    });
    const interestSignals = Object.fromEntries(interests.map(item => [item, .72]));
    const goals = unique(focus.map(item => item.name).filter(name => state.skills?.[name]));
    const strengths = Object.entries(state.skills || {}).filter(([, data]) => Number(data.level || 0) >= 2).map(([name]) => name);
    return {
      version: PROFILE_VERSION,
      dailyMinutes: ageNumber() <= 6 ? 20 : 30,
      parentSupport: '10分钟',
      energy: 'normal',
      goals: goals.length ? goals : ['责任闭环', '反馈与提炼'],
      strengths,
      challenges: goals,
      interestSignals,
      skillConfidence,
      history: [],
      dismissed: [],
      refreshSeed: 0,
      onboardingComplete: false,
      updatedAt: now()
    };
  }

  function profile() {
    if (!state.coachProfile || state.coachProfile.version !== PROFILE_VERSION) {
      state.coachProfile = { ...defaultCoachProfile(), ...(state.coachProfile || {}), version: PROFILE_VERSION };
      saveState();
    }
    state.coachProfile.history ||= [];
    state.coachProfile.dismissed ||= [];
    state.coachProfile.interestSignals ||= {};
    state.coachProfile.skillConfidence ||= {};
    return state.coachProfile;
  }

  function saveState() {
    if (typeof window.save === 'function') window.save();
    else if (typeof save === 'function') save();
    window.GrowthFamily?.syncCurrent?.();
  }

  function assessmentSignals() {
    const responses = activeFamilyChild()?.assessment?.responses || [];
    const skills = [];
    responses.forEach(response => (response.optionIds || []).forEach(option => skills.push(...(OPTION_SKILL_MAP[option] || []))));
    return skills;
  }

  function talentHypotheses() {
    const p = profile();
    const counts = {};
    assessmentSignals().forEach(skill => { counts[skill] = (counts[skill] || 0) + 2; });
    (p.strengths || []).forEach(skill => { counts[skill] = (counts[skill] || 0) + 3; });
    Object.entries(p.skillConfidence || {}).forEach(([skill, confidence]) => {
      if (confidence >= .58) counts[skill] = (counts[skill] || 0) + Math.round(confidence * 4);
    });
    (p.history || []).filter(item => item.type === 'completed' && item.enjoyment >= 4 && item.independence >= 2)
      .forEach(item => (item.skills || []).forEach(skill => { counts[skill] = (counts[skill] || 0) + 3; }));
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([skill, evidence]) => ({ skill, evidence, confidence: clamp(.25 + evidence * .09, .3, .92) }));
  }

  function scoreTask(task) {
    const p = profile();
    const childInterests = unique([...(state.child?.interests || []), ...Object.keys(p.interestSignals || {}).filter(key => p.interestSignals[key] >= .55)]);
    let interest = 0;
    for (const tag of task.interests) {
      const matched = childInterests.find(item => fuzzyMatch(item, tag));
      if (matched) interest = Math.max(interest, p.interestSignals[matched] || .75);
    }
    const skillConfidence = task.skills.map(skill => p.skillConfidence[skill] ?? clamp(((state.skills?.[skill]?.level || 0) + 1) / 6, .15, .85));
    const currentAbility = skillConfidence.reduce((sum, value) => sum + value, 0) / Math.max(1, skillConfidence.length);
    const targetChallenge = clamp(.36 + currentAbility * .42, .38, .76);
    const zpd = clamp(1 - Math.abs(task.challenge - targetChallenge) / .45);
    const goalMatches = task.skills.filter(skill => (p.goals || []).includes(skill) || (p.challenges || []).includes(skill)).length;
    const growth = clamp(.25 + goalMatches / Math.max(1, task.skills.length) * .75);
    const talentSkills = talentHypotheses().map(item => item.skill);
    const talent = clamp(task.skills.filter(skill => talentSkills.includes(skill)).length / Math.max(1, task.skills.length) + interest * .4);
    const resourceText = (state.child?.resources || []).join('|');
    const resource = task.materials.some(item => [...(state.child?.resources || []), ...task.interests].some(resourceItem => fuzzyMatch(resourceItem, item))) || task.interests.some(tag => fuzzyMatch(resourceText, tag)) ? 1 : .62;
    const timeRatio = task.duration / Math.max(10, Number(p.dailyMinutes || 30));
    const time = timeRatio <= 1 ? 1 : clamp(1 - (timeRatio - 1) * .65, .25, 1);
    const recentIds = (p.history || []).slice(0, 8).map(item => item.taskId);
    const novelty = recentIds.includes(task.id) ? .2 : 1;
    const dismissed = (p.dismissed || []).includes(task.id) ? .15 : 1;
    const age = ageNumber();
    const ageFit = age >= task.age[0] && age <= task.age[1] ? 1 : .25;
    const energyMap = { low: 1, normal: 2, high: 3 };
    const energyFit = Math.abs(task.energy - (energyMap[p.energy] || 2)) <= 1 ? 1 : .55;
    const raw = interest * .28 + growth * .22 + zpd * .18 + talent * .12 + resource * .08 + time * .06 + novelty * .03 + energyFit * .03;
    const score = Math.round(clamp(raw * dismissed * ageFit) * 100);
    const reasons = [];
    if (interest >= .6) reasons.push('贴合当前兴趣');
    if (goalMatches) reasons.push(`正好补强${task.skills.filter(skill => (p.goals || []).includes(skill) || (p.challenges || []).includes(skill)).slice(0, 2).join('、')}`);
    if (talent >= .55) reasons.push('与已出现的优势迹象相符');
    if (zpd >= .75) reasons.push('难度位于可挑战但不易挫败的区间');
    if (time >= .9) reasons.push(`适合今天${p.dailyMinutes}分钟时间`);
    return { task, score, reasons: reasons.slice(0, 3), components: { interest, growth, zpd, talent, resource, time, novelty } };
  }

  function recommendations() {
    const scored = TASK_LIBRARY.map(scoreTask).sort((a, b) => b.score - a.score || a.task.id.localeCompare(b.task.id));
    const selected = [];
    const usedKinds = new Set();
    const offset = profile().refreshSeed % 3;
    const candidates = [...scored.slice(offset), ...scored.slice(0, offset)];
    for (const item of candidates) {
      if (selected.length >= 3) break;
      if (!usedKinds.has(item.task.kind) || selected.length >= 2) {
        selected.push(item);
        usedKinds.add(item.task.kind);
      }
    }
    return selected;
  }

  function profileCompleteness() {
    const p = profile();
    const checks = [
      state.child?.interests?.length >= 3,
      p.goals?.length >= 2,
      p.strengths?.length >= 1,
      p.challenges?.length >= 1,
      p.dailyMinutes >= 10,
      (p.history || []).some(item => item.type === 'completed')
    ];
    return Math.round(checks.filter(Boolean).length / checks.length * 100);
  }

  function activeTaskProgress() {
    const task = state.task;
    if (!task?.steps?.length) return null;
    const done = task.steps.filter(step => step.done).length;
    return { task, done, total: task.steps.length, complete: done === task.steps.length };
  }

  function recommendationCard(item, index) {
    const { task, score, reasons, components } = item;
    return `<article class="coach-task-card" data-task-card="${esc(task.id)}">
      <div class="coach-task-rank">${index + 1}</div>
      <div class="coach-task-top">
        <div>
          <div class="coach-kicker">${esc(task.kind)} · 匹配度 ${score}%</div>
          <h3>${esc(task.title)}</h3>
        </div>
        <div class="coach-duration">${task.duration}<small>分钟</small></div>
      </div>
      <p class="coach-goal">${esc(task.goal)}</p>
      <div class="coach-reasons">${reasons.map(reason => `<span>${esc(reason)}</span>`).join('')}</div>
      <div class="coach-skill-row">${task.skills.map(skill => `<span>${esc(skill)}</span>`).join('')}</div>
      <div class="coach-output"><b>真实成果：</b>${esc(task.deliverable)}</div>
      <div class="coach-task-actions">
        <button type="button" class="coach-btn ghost" data-explain-task="${esc(task.id)}">为什么推荐</button>
        <button type="button" class="coach-btn primary" data-accept-task="${esc(task.id)}">开始这个任务</button>
      </div>
      <div class="coach-score-bars" hidden data-score-panel="${esc(task.id)}">
        ${Object.entries({兴趣: components.interest, 成长价值: components.growth, 难度适配: components.zpd, 天赋迹象: components.talent, 资源适配: components.resource, 时间适配: components.time}).map(([label, value]) => `<div><span>${label}</span><i><b style="width:${Math.round(value * 100)}%"></b></i><em>${Math.round(value * 100)}</em></div>`).join('')}
      </div>
    </article>`;
  }

  function renderHomeCoach() {
    const home = document.getElementById('home');
    if (!home) return;
    const child = activeFamilyChild();
    const p = profile();
    const recs = recommendations();
    const progress = activeTaskProgress();
    const talents = talentHypotheses();
    const completed = (p.history || []).filter(item => item.type === 'completed').length;

    home.innerHTML = `<div class="coach-home">
      <section class="coach-hero">
        <div class="coach-brand-row">
          <div>
            <div class="coach-brand">成长OS <span>AI成长教练</span></div>
            <p>不是给所有孩子同一张计划，而是每天推荐此刻最适合他的任务。</p>
          </div>
          <button type="button" class="coach-icon-btn" id="coachSettings" aria-label="完善孩子画像">⚙</button>
        </div>
        <div class="coach-child-switch">
          <button type="button" data-coach-child="brother" class="${child?.id === 'brother' ? 'active' : ''}">哥哥</button>
          <button type="button" data-coach-child="sister" class="${child?.id === 'sister' ? 'active' : ''}">妹妹</button>
        </div>
        <div class="coach-summary-grid">
          <div><strong>${profileCompleteness()}%</strong><span>画像完整度</span></div>
          <div><strong>${completed}</strong><span>有效任务反馈</span></div>
          <div><strong>${talents.length}</strong><span>优势假设</span></div>
        </div>
      </section>

      ${progress ? `<section class="coach-active-task">
        <div><span>正在进行</span><h2>${esc(progress.task.title)}</h2><p>${progress.done}/${progress.total} 步已完成 · ${progress.task.coreSkills?.map(esc).join('、') || ''}</p></div>
        <div class="coach-active-actions">
          <button class="coach-btn ghost" type="button" data-go-route="workflow">继续执行</button>
          ${progress.complete ? '<button class="coach-btn primary" type="button" id="coachFeedbackNow">提交结果</button>' : ''}
        </div>
      </section>` : ''}

      <section class="coach-context-bar">
        <div><span>今天可用</span><b>${p.dailyMinutes}分钟</b></div>
        <div><span>孩子状态</span><b>${({low:'低能量',normal:'正常',high:'精力充足'})[p.energy] || '正常'}</b></div>
        <div><span>家长支持</span><b>${esc(p.parentSupport)}</b></div>
        <button type="button" id="coachQuickContext">调整</button>
      </section>

      <section class="coach-section-head">
        <div><span>今日智能推荐</span><h2>最适合${esc(child?.relation || state.child?.name || '孩子')}的 3 个任务</h2></div>
        <button type="button" id="coachRefresh">换一批</button>
      </section>
      <div class="coach-task-list">${recs.map(recommendationCard).join('')}</div>

      <section class="coach-insight-grid">
        <article>
          <span>当前优势假设</span>
          <h3>${talents.length ? talents.slice(0, 3).map(item => item.skill).join(' · ') : '需要更多真实任务证据'}</h3>
          <p>优势不是一次测试定型，而是“主动投入＋快速进步＋能迁移”反复出现后逐步确认。</p>
          <button type="button" data-go-route="profile">查看画像依据</button>
        </article>
        <article>
          <span>本轮推荐策略</span>
          <h3>${p.goals?.slice(0, 2).join('＋') || '兴趣探索＋能力补强'}</h3>
          <p>兴趣负责让孩子愿意开始，能力差距决定任务如何设计，反馈决定下一轮难度。</p>
          <button type="button" id="coachWeeklyReport">生成家庭周报</button>
        </article>
      </section>

      ${!p.onboardingComplete ? `<section class="coach-onboarding-callout"><div><b>先用3分钟校准画像</b><p>补充时间、优势迹象和当前困难，推荐会明显更准。</p></div><button id="coachStartOnboarding" class="coach-btn primary">开始校准</button></section>` : ''}
    </div>`;

    bindHomeEvents();
  }

  function bindHomeEvents() {
    document.querySelectorAll('[data-coach-child]').forEach(button => button.addEventListener('click', () => {
      const id = button.dataset.coachChild;
      if (id && id !== window.GrowthFamily?.getActiveId?.()) {
        sessionStorage.setItem(ROUTE_KEY, 'home');
        window.GrowthFamily?.switchTo?.(id);
      }
    }));
    document.getElementById('coachSettings')?.addEventListener('click', openOnboarding);
    document.getElementById('coachStartOnboarding')?.addEventListener('click', openOnboarding);
    document.getElementById('coachQuickContext')?.addEventListener('click', openQuickContext);
    document.getElementById('coachRefresh')?.addEventListener('click', () => {
      profile().refreshSeed += 1;
      saveState();
      renderHomeCoach();
    });
    document.querySelectorAll('[data-explain-task]').forEach(button => button.addEventListener('click', () => {
      const panel = document.querySelector(`[data-score-panel="${CSS.escape(button.dataset.explainTask)}"]`);
      if (panel) panel.hidden = !panel.hidden;
    }));
    document.querySelectorAll('[data-accept-task]').forEach(button => button.addEventListener('click', () => acceptTask(button.dataset.acceptTask)));
    document.querySelectorAll('[data-go-route]').forEach(button => button.addEventListener('click', () => goCoach(button.dataset.goRoute)));
    document.getElementById('coachFeedbackNow')?.addEventListener('click', openTaskFeedback);
    document.getElementById('coachWeeklyReport')?.addEventListener('click', openWeeklyReport);
  }

  function createTaskFromRecommendation(task, scoreData) {
    const total = task.steps.length;
    const perStep = Math.max(8, Math.round(task.duration / total));
    const phases = ['明确真实目的', '设计与准备', '完成第一版', '真实测试', '修改与收尾'];
    return {
      id: typeof makeId === 'function' ? makeId() : `${Date.now()}`,
      compilerVersion: 'coach-recommender-1.0',
      recommendationId: task.id,
      recommendationScore: scoreData.score,
      generatedBy: '可解释成长推荐引擎',
      compiledAt: now(),
      title: task.title,
      purpose: task.goal,
      shell: task.shell,
      realUser: '家人或真实使用者',
      problem: task.goal,
      availableTime: task.duration,
      coreSkills: task.skills.slice(0, 3),
      supportSkills: unique(['用户意识', '反馈与提炼'].filter(skill => !task.skills.includes(skill))),
      maintenanceSkills: unique(['责任闭环'].filter(skill => !task.skills.includes(skill))),
      outputs: [task.deliverable],
      materials: task.materials,
      safety: task.parentSupport,
      rationale: scoreData.reasons.join('；'),
      recommendationMeta: { kind: task.kind, interests: task.interests, challenge: task.challenge, reasons: scoreData.reasons },
      steps: task.steps.map((title, index) => ({
        id: typeof makeId === 'function' ? makeId() : `${Date.now()}_${index}`,
        phase: phases[Math.min(index, phases.length - 1)],
        title,
        purpose: index === total - 1 ? task.standard : `完成“${title}”并留下可检查结果。`,
        child: title,
        parent: index === 0 ? task.parentSupport : '只给一个提示，不接管任务；记录孩子是否主动继续。',
        elder: '提醒一次，守时间和安全，不替孩子完成。',
        duration: perStep,
        evidence: index === total - 1 ? task.deliverable : '照片、文字、数据或口头说明中的一种',
        standard: index === total - 1 ? task.standard : '孩子能说清本步做了什么、结果是什么、下一步是什么。',
        skills: [task.skills[index % task.skills.length]],
        skillTraining: [{ skill: task.skills[index % task.skills.length], role: index < task.skills.length ? '核心训练' : '重要支撑', action: title }],
        done: false,
        note: ''
      }))
    };
  }

  function acceptTask(taskId) {
    const item = TASK_LIBRARY.map(scoreTask).find(entry => entry.task.id === taskId);
    if (!item) return;
    state.task = createTaskFromRecommendation(item.task, item);
    const p = profile();
    p.history.unshift({ type: 'accepted', taskId, title: item.task.title, skills: item.task.skills, score: item.score, at: now() });
    p.history = p.history.slice(0, 60);
    saveState();
    goCoach('workflow');
  }

  function openOnboarding() {
    const p = profile();
    const allSkills = Object.keys(state.skills || {});
    const talentOptions = ['深度阅读', '任务拆解', '数据分析', '中文书写', '计算思维', '合作分工', '责任闭环', '挫折恢复'];
    const challengeOptions = ['责任闭环', '中文书写', '反馈与提炼', '任务拆解', '挫折恢复', '用户意识', '数据分析', '打字'];
    const sheet = document.getElementById('sheet');
    if (!sheet) return;
    sheet.innerHTML = `<div class="coach-modal-head"><div><span>3分钟画像校准</span><h2>让推荐更像这个孩子</h2></div><button type="button" id="coachCloseModal">×</button></div>
      <div class="coach-form-block"><label>真实兴趣（用逗号分隔）</label><textarea id="coachInterests">${esc((state.child?.interests || []).join('，'))}</textarea><small>只写孩子会主动靠近、愿意重复的内容，不写家长希望他喜欢的。</small></div>
      <div class="coach-form-block"><label>目前已经出现的优势迹象</label><div class="coach-choice-grid">${talentOptions.map(skill => `<button type="button" class="coach-choice ${(p.strengths || []).includes(skill) ? 'selected' : ''}" data-coach-strength="${esc(skill)}">${esc(skill)}</button>`).join('')}</div></div>
      <div class="coach-form-block"><label>当前最需要解决的困难（最多3项）</label><div class="coach-choice-grid">${challengeOptions.map(skill => `<button type="button" class="coach-choice ${(p.challenges || []).includes(skill) ? 'selected' : ''}" data-coach-challenge="${esc(skill)}">${esc(skill)}</button>`).join('')}</div></div>
      <div class="coach-form-block"><label>未来一个月最重要的目标（最多3项）</label><div class="coach-choice-grid">${allSkills.slice(0, 16).map(skill => `<button type="button" class="coach-choice ${(p.goals || []).includes(skill) ? 'selected' : ''}" data-coach-goal="${esc(skill)}">${esc(skill)}</button>`).join('')}</div></div>
      <div class="coach-form-row">
        <div><label>每天可用时间</label><select id="coachMinutes"><option value="15">15分钟</option><option value="20">20分钟</option><option value="30">30分钟</option><option value="40">40分钟</option><option value="60">60分钟</option></select></div>
        <div><label>家长可支持</label><select id="coachSupport"><option>不固定</option><option>5分钟</option><option>10分钟</option><option>20分钟</option><option>30分钟</option></select></div>
      </div>
      <button type="button" class="coach-btn primary full" id="coachSaveProfile">保存并重新推荐</button>`;
    document.getElementById('coachMinutes').value = String(p.dailyMinutes || 30);
    document.getElementById('coachSupport').value = p.parentSupport || '10分钟';
    bindToggleChoices('[data-coach-strength]', 5);
    bindToggleChoices('[data-coach-challenge]', 3);
    bindToggleChoices('[data-coach-goal]', 3);
    document.getElementById('coachCloseModal')?.addEventListener('click', closeCoachModal);
    document.getElementById('coachSaveProfile')?.addEventListener('click', () => {
      const interests = document.getElementById('coachInterests').value.split(/[，,\n]/).map(item => item.trim()).filter(Boolean);
      state.child.interests = unique(interests);
      p.strengths = selectedValues('[data-coach-strength]');
      p.challenges = selectedValues('[data-coach-challenge]');
      p.goals = selectedValues('[data-coach-goal]');
      p.dailyMinutes = Number(document.getElementById('coachMinutes').value || 30);
      p.parentSupport = document.getElementById('coachSupport').value;
      p.onboardingComplete = true;
      p.updatedAt = now();
      state.child.interests.forEach(item => { p.interestSignals[item] ??= .72; });
      saveState();
      closeCoachModal();
      renderHomeCoach();
    });
    document.getElementById('modal')?.classList.add('open');
  }

  function bindToggleChoices(selector, max) {
    document.querySelectorAll(selector).forEach(button => button.addEventListener('click', () => {
      const selected = [...document.querySelectorAll(`${selector}.selected`)];
      if (!button.classList.contains('selected') && selected.length >= max) {
        alert(`最多选择${max}项。`);
        return;
      }
      button.classList.toggle('selected');
    }));
  }

  function selectedValues(selector) {
    return [...document.querySelectorAll(`${selector}.selected`)].map(button => button.textContent.trim());
  }

  function openQuickContext() {
    const p = profile();
    const sheet = document.getElementById('sheet');
    sheet.innerHTML = `<div class="coach-modal-head"><div><span>今天的实际情况</span><h2>任务应该适应生活，而不是反过来</h2></div><button type="button" id="coachCloseModal">×</button></div>
      <div class="coach-form-block"><label>今天能投入多少时间</label><input type="range" min="10" max="60" step="5" value="${p.dailyMinutes}" id="coachQuickMinutes"><div class="coach-range-value"><b id="coachQuickMinutesValue">${p.dailyMinutes}</b> 分钟</div></div>
      <div class="coach-form-block"><label>孩子今天的能量状态</label><div class="coach-choice-grid three"><button data-energy="low" class="coach-choice ${p.energy === 'low' ? 'selected' : ''}">低能量</button><button data-energy="normal" class="coach-choice ${p.energy === 'normal' ? 'selected' : ''}">正常</button><button data-energy="high" class="coach-choice ${p.energy === 'high' ? 'selected' : ''}">精力充足</button></div></div>
      <button type="button" class="coach-btn primary full" id="coachSaveContext">按今天状态重新推荐</button>`;
    document.getElementById('coachQuickMinutes')?.addEventListener('input', event => { document.getElementById('coachQuickMinutesValue').textContent = event.target.value; });
    document.querySelectorAll('[data-energy]').forEach(button => button.addEventListener('click', () => {
      document.querySelectorAll('[data-energy]').forEach(item => item.classList.remove('selected'));
      button.classList.add('selected');
    }));
    document.getElementById('coachCloseModal')?.addEventListener('click', closeCoachModal);
    document.getElementById('coachSaveContext')?.addEventListener('click', () => {
      p.dailyMinutes = Number(document.getElementById('coachQuickMinutes').value || 30);
      p.energy = document.querySelector('[data-energy].selected')?.dataset.energy || 'normal';
      p.refreshSeed += 1;
      p.updatedAt = now();
      saveState();
      closeCoachModal();
      renderHomeCoach();
    });
    document.getElementById('modal')?.classList.add('open');
  }

  function closeCoachModal() {
    document.getElementById('modal')?.classList.remove('open');
  }

  function openTaskFeedback() {
    const task = state.task;
    if (!task) return;
    const sheet = document.getElementById('sheet');
    sheet.innerHTML = `<div class="coach-modal-head"><div><span>完成反馈</span><h2>这次任务告诉了我们什么</h2></div><button type="button" id="coachCloseModal">×</button></div>
      <div class="coach-feedback-title">${esc(task.title)}</div>
      ${ratingBlock('喜欢程度', 'enjoyment', ['不喜欢', '一般', '愿意再做', '很投入', '主动延伸'], 4)}
      ${ratingBlock('独立程度', 'independence', ['成人接管', '多次提醒', '少量提示', '基本独立'], 3)}
      ${ratingBlock('实际难度', 'difficulty', ['太简单', '稍简单', '正合适', '有挑战', '太难'], 3)}
      <div class="coach-form-block"><label>发生了什么具体事实</label><textarea id="coachFeedbackNote" placeholder="例如：主动做了35分钟；卡在预算；提醒一次后自己修改了路线……"></textarea></div>
      <label class="coach-check"><input type="checkbox" id="coachOutcome" checked> 形成了可以展示、使用或验证的真实成果</label>
      <button type="button" class="coach-btn primary full" id="coachSubmitFeedback">保存证据并更新下一轮推荐</button>`;
    bindRatingButtons();
    document.getElementById('coachCloseModal')?.addEventListener('click', closeCoachModal);
    document.getElementById('coachSubmitFeedback')?.addEventListener('click', submitTaskFeedback);
    document.getElementById('modal')?.classList.add('open');
  }

  function ratingBlock(label, name, labels, selected) {
    return `<div class="coach-form-block"><label>${label}</label><div class="coach-rating" data-rating-group="${name}">${labels.map((text, index) => `<button type="button" data-rating-value="${index + 1}" class="${index + 1 === selected ? 'selected' : ''}">${index + 1}<small>${text}</small></button>`).join('')}</div></div>`;
  }

  function bindRatingButtons() {
    document.querySelectorAll('[data-rating-group]').forEach(group => group.querySelectorAll('button').forEach(button => button.addEventListener('click', () => {
      group.querySelectorAll('button').forEach(item => item.classList.remove('selected'));
      button.classList.add('selected');
    })));
  }

  function submitTaskFeedback() {
    const task = state.task;
    const p = profile();
    const readRating = name => Number(document.querySelector(`[data-rating-group="${name}"] button.selected`)?.dataset.ratingValue || 3);
    const enjoyment = readRating('enjoyment');
    const independence = readRating('independence');
    const difficulty = readRating('difficulty');
    const outcome = document.getElementById('coachOutcome').checked;
    const note = document.getElementById('coachFeedbackNote').value.trim();
    const skills = task.coreSkills || [];
    const interests = task.recommendationMeta?.interests || [task.shell];
    const quality = clamp((enjoyment / 5) * .3 + (independence / 4) * .35 + (outcome ? .25 : 0) + (difficulty === 3 || difficulty === 4 ? .1 : .03));

    interests.forEach(tag => {
      const current = p.interestSignals[tag] ?? .5;
      p.interestSignals[tag] = clamp(current * .72 + (enjoyment / 5) * .28, .08, .96);
    });
    skills.forEach(skill => {
      const current = p.skillConfidence[skill] ?? .35;
      const evidence = clamp((independence / 4) * .55 + (outcome ? .3 : 0) + (difficulty >= 3 && difficulty <= 4 ? .15 : .05));
      p.skillConfidence[skill] = clamp(current * .78 + evidence * .22, .08, .96);
      if (state.skills?.[skill]) {
        state.skills[skill].evidence ||= [];
        state.skills[skill].evidence.push({ date: now().slice(0, 10), shell: task.shell, strong: outcome && independence >= 3 && quality >= .7, transfer: note, source: 'coach-feedback' });
      }
    });
    p.history.unshift({
      type: 'completed', taskId: task.recommendationId || task.id, title: task.title, skills, interests,
      enjoyment, independence, difficulty, outcome, note, quality: Math.round(quality * 100), at: now()
    });
    p.history = p.history.slice(0, 60);
    task.completedAt = now();
    task.feedback = { enjoyment, independence, difficulty, outcome, note };
    saveState();
    closeCoachModal();
    goCoach('home');
  }

  function openWeeklyReport() {
    const p = profile();
    const recent = (p.history || []).filter(item => item.type === 'completed').slice(0, 7);
    const talents = talentHypotheses();
    const strongestInterest = Object.entries(p.interestSignals || {}).sort((a, b) => b[1] - a[1]).slice(0, 3);
    const sheet = document.getElementById('sheet');
    sheet.innerHTML = `<div class="coach-modal-head"><div><span>家庭成长周报</span><h2>${esc(state.child?.name || '孩子')}的本周成长证据</h2></div><button type="button" id="coachCloseModal">×</button></div>
      <div class="coach-report-score"><strong>${recent.length}</strong><span>个有反馈的真实任务</span></div>
      <div class="coach-report-block"><b>正在形成的优势假设</b>${talents.length ? talents.map(item => `<p>${esc(item.skill)} · 置信度 ${Math.round(item.confidence * 100)}% · 证据权重 ${item.evidence}</p>`).join('') : '<p>证据仍不足，建议继续做不同类型的小任务。</p>'}</div>
      <div class="coach-report-block"><b>最稳定的兴趣信号</b><p>${strongestInterest.length ? strongestInterest.map(([name, value]) => `${esc(name)} ${Math.round(value * 100)}%`).join(' · ') : '尚未形成稳定信号'}</p></div>
      <div class="coach-report-block"><b>最近完成记录</b>${recent.length ? recent.map(item => `<p>• ${esc(item.title)}：喜欢 ${item.enjoyment}/5，独立 ${item.independence}/4，证据质量 ${item.quality}%</p>`).join('') : '<p>完成一次任务并提交反馈后，这里会生成真正基于证据的报告。</p>'}</div>
      <div class="coach-report-block"><b>下周建议</b><p>保持一个高兴趣任务、一个短板补强任务、一个陌生探索任务，避免把“喜欢”误当成天赋，也避免只练薄弱项。</p></div>
      <button type="button" class="coach-btn primary full" id="coachCopyReport">复制周报文本</button>`;
    document.getElementById('coachCloseModal')?.addEventListener('click', closeCoachModal);
    document.getElementById('coachCopyReport')?.addEventListener('click', async () => {
      const text = sheet.innerText.replace('×', '').replace('复制周报文本', '').trim();
      try { await navigator.clipboard.writeText(text); alert('周报已复制。'); } catch { alert('当前浏览器不允许自动复制，请长按选择文字。'); }
    });
    document.getElementById('modal')?.classList.add('open');
  }

  function renderProfileCoach() {
    const section = document.getElementById('profile');
    if (!section) return;
    const p = profile();
    const talents = talentHypotheses();
    const interests = Object.entries(p.interestSignals || {}).sort((a, b) => b[1] - a[1]);
    section.innerHTML = `<div class="coach-page-head"><span>动态孩子画像</span><h2>${esc(state.child?.name || '孩子')} · ${esc(state.child?.age || '')}</h2><p>这里不贴固定标签，只记录“目前有哪些证据支持什么判断”。</p></div>
      <section class="coach-profile-card"><div><span>画像完整度</span><strong>${profileCompleteness()}%</strong></div><button type="button" id="coachEditProfile">重新校准</button></section>
      <div class="coach-section-title">兴趣信号</div>
      <section class="coach-signal-list">${interests.length ? interests.map(([name, value]) => `<div><span>${esc(name)}</span><i><b style="width:${Math.round(value * 100)}%"></b></i><em>${Math.round(value * 100)}%</em></div>`).join('') : '<p>还没有兴趣反馈。</p>'}</section>
      <div class="coach-section-title">优势假设（不是定论）</div>
      <section class="coach-talent-list">${talents.length ? talents.map(item => `<article><div><b>${esc(item.skill)}</b><span>${Math.round(item.confidence * 100)}%置信度</span></div><p>来自评估选项、已有能力等级和真实任务反馈的综合证据。还需要跨任务重复出现。</p></article>`).join('') : '<article><p>目前证据不足。先让孩子接触不同类型任务，再观察主动投入、学习速度和迁移表现。</p></article>'}</section>
      <div class="coach-section-title">本月推荐目标</div>
      <section class="coach-tag-panel">${(p.goals || []).map(item => `<span>${esc(item)}</span>`).join('')}</section>
      <div class="coach-section-title">当前困难</div>
      <section class="coach-tag-panel warn">${(p.challenges || []).map(item => `<span>${esc(item)}</span>`).join('')}</section>
      <div class="coach-section-title">家庭可用资源</div>
      <section class="coach-resource-list">${(state.child?.resources || []).map(item => `<span>${esc(item)}</span>`).join('')}</section>`;
    document.getElementById('coachEditProfile')?.addEventListener('click', openOnboarding);
  }

  function renderSkillsCoach() {
    legacyRenderSkills?.();
    const section = document.getElementById('skills');
    if (!section || section.querySelector('.coach-skill-summary')) return;
    const p = profile();
    const summary = document.createElement('section');
    summary.className = 'coach-skill-summary';
    summary.innerHTML = `<div><span>推荐引擎使用的能力置信度</span><h2>能力不是一次评分，而是持续更新的概率判断</h2></div><div class="coach-signal-list">${Object.entries(p.skillConfidence || {}).sort((a,b)=>b[1]-a[1]).slice(0,6).map(([skill,value])=>`<div><span>${esc(skill)}</span><i><b style="width:${Math.round(value*100)}%"></b></i><em>${Math.round(value*100)}%</em></div>`).join('')}</div>`;
    section.prepend(summary);
  }

  function renderWorkflowCoach() {
    legacyRenderWorkflow?.();
    const section = document.getElementById('workflow');
    if (!section) return;
    const task = state.task;
    const intro = document.createElement('section');
    intro.className = 'coach-workflow-intro';
    intro.innerHTML = `<span>AI推荐依据</span><p>${esc(task?.rationale || '该任务来自孩子兴趣、能力水平和当前培养目标的综合匹配。')}</p>`;
    section.prepend(intro);
    const footer = document.createElement('section');
    footer.className = 'coach-feedback-callout';
    footer.innerHTML = `<div><b>任务做完后，不要只打一个“完成”</b><p>喜欢程度、独立程度、实际难度和真实成果，才会让下一轮推荐变准。</p></div><button type="button" class="coach-btn primary" id="coachWorkflowFeedback">提交任务反馈</button>`;
    section.append(footer);
    document.getElementById('coachWorkflowFeedback')?.addEventListener('click', openTaskFeedback);
  }

  function goCoach(page) {
    const allowed = ['home', 'profile', 'skills', 'generator', 'workflow', 'review'];
    const route = allowed.includes(page) ? page : 'home';
    sessionStorage.setItem(ROUTE_KEY, route);
    document.querySelectorAll('.page').forEach(node => node.classList.remove('active'));
    document.getElementById(route)?.classList.add('active');
    document.querySelectorAll('nav button').forEach(node => node.classList.toggle('active', node.dataset.page === route));
    const titles = {
      home: ['今日推荐', 'AI根据兴趣、天赋迹象和当前能力推荐任务'],
      profile: ['动态画像', '每一个判断都必须有真实行为证据'],
      skills: ['能力证据', '观察孩子正在形成的能力，而不是贴标签'],
      generator: ['任务实验室', '家长也可以手动发起一个真实任务'],
      workflow: ['任务执行', '完成、证据、反馈和能力更新形成闭环'],
      review: ['成长证据', '把一次经历变成下一次更准确的推荐']
    }[route];
    const title = document.getElementById('pageTitle');
    const sub = document.getElementById('pageSub');
    if (title) title.textContent = titles[0];
    if (sub) sub.textContent = titles[1];
    ({ home: renderHomeCoach, profile: renderProfileCoach, skills: renderSkillsCoach, generator: legacyRenderGenerator, workflow: renderWorkflowCoach, review: legacyRenderReview }[route])?.();
    window.scrollTo({ top: 0, behavior: 'auto' });
  }

  window.renderHome = renderHomeCoach;
  window.renderProfile = renderProfileCoach;
  window.renderSkills = renderSkillsCoach;
  window.renderWorkflow = renderWorkflowCoach;
  window.go = goCoach;
  window.GrowthCoach = { recommendations, scoreTask, profile, openOnboarding, openTaskFeedback, go: goCoach };

  const restore = () => goCoach(sessionStorage.getItem(ROUTE_KEY) || 'home');
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', restore, { once: true });
  else restore();
})();
