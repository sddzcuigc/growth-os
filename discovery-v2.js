(() => {
  const DISCOVERY_KEY = "growthOSDiscoveryV2";
  const legacyRenderHome = renderHome;
  const legacyRenderProfile = renderProfile;
  const legacyRenderSkills = renderSkills;
  const legacyRenderGenerator = renderGenerator;
  const legacyRenderWorkflow = renderWorkflow;

  const QUESTIONS = [
    {
      id: "spark",
      title: "内在兴趣",
      ask: "先不谈成绩。最近一个月，有没有什么事情是他不用催，自己会反复去做、去问或去研究的？请讲一个具体场景。",
      quick: ["会自己看很久的书", "喜欢搭建或动手", "喜欢游戏里研究规则", "暂时想不到"]
    },
    {
      id: "learning",
      title: "学习方式",
      ask: "当他遇到一个不会的问题时，通常会怎么做？比如自己试、查资料、问大人、模仿别人，还是很快放弃？最好说一次真实经历。",
      quick: ["先自己试", "喜欢直接问答案", "会查视频或资料", "容易卡住放弃"]
    },
    {
      id: "school",
      title: "学校表现",
      ask: "在学校里，哪些科目或活动他明显学得快、愿意展示？哪些地方最费劲？不要只说分数，也说课堂、作业和考试中的表现。",
      quick: ["数学理解快", "语文表达吃力", "英语容易马虎", "动手活动更投入"]
    },
    {
      id: "execution",
      title: "执行与收尾",
      ask: "他做一件事时，开始、持续、检查、收尾这四段，哪一段最强，哪一段最容易出问题？平时需要催到什么程度？",
      quick: ["开始快但不收尾", "拖延，需要多次催", "能做完但容易马虎", "基本能独立完成"]
    },
    {
      id: "frustration",
      title: "挫折反应",
      ask: "失败、被批评、比赛输了或者作业做错时，他最常见的反应是什么？多久能恢复？什么办法最有效？",
      quick: ["会生气或哭", "容易直接放弃", "缓一会还能继续", "会自己复盘再试"]
    },
    {
      id: "expression",
      title: "表达与创造",
      ask: "他更擅长用哪种方式表达自己：说、写、画、搭建、表演、运动还是做东西？别人能不能看懂或用上他的成果？",
      quick: ["很会讲但不爱写", "喜欢画图或搭建", "愿意表演展示", "表达常常说不清"]
    },
    {
      id: "social",
      title: "合作与边界",
      ask: "他和同学、兄弟姐妹相处时，通常扮演什么角色？会不会主动合作、争抢、退让、被欺负，或者不知道怎样表达边界？",
      quick: ["喜欢带着别人做", "容易和人起冲突", "有时不敢表达", "合作基本自然"]
    },
    {
      id: "body",
      title: "身体与状态",
      ask: "他的体力、运动、睡眠、坐姿和日常精神状态怎样？有哪些长期想改善但一直没有稳定做到的地方？",
      quick: ["体力不错，喜欢运动", "容易累或不爱动", "坐姿和驼背需要改善", "睡眠或作息不稳定"]
    },
    {
      id: "environment",
      title: "家庭资源",
      ask: "家庭现在能稳定提供哪些资源和陪伴？比如书、电脑、运动器材、每周时间、老人协助、父母擅长的事情。也说说最现实的限制。",
      quick: ["有电脑和书", "周末才能集中陪伴", "老人平时可以提醒", "时间很碎，作业很多"]
    },
    {
      id: "goal",
      title: "半年目标",
      ask: "假设半年后只能看到三种明显变化，你最希望是什么？又最担心他继续形成什么习惯？",
      quick: ["更主动、不拖拉", "身体更强、姿态更好", "表达和写作明显提升", "找到真正擅长并愿意长期做的方向"]
    }
  ];

  const SKILL_GAP_RULES = [
    { skill: "责任闭环", words: ["催", "拖", "忘", "收尾", "检查", "马虎", "归位", "磨蹭"], label: "完成与收尾能力", goal: "从被催着做，走向主动检查、收尾和补救" },
    { skill: "任务拆解", words: ["不知道先", "乱", "不会安排", "任务多", "作业晚", "复杂", "拖延"], label: "复杂任务拆解", goal: "把大任务拆成今天能完成的一小步" },
    { skill: "挫折恢复", words: ["放弃", "哭", "生气", "急", "失败", "不想做", "受不了"], label: "遇挫后的恢复", goal: "卡住时能说清困难、尝试一种办法并重新进入任务" },
    { skill: "中文书写", words: ["不会写", "写字", "语文差", "作文", "字差", "不爱写"], label: "书写与文字表达", goal: "让真实成果清楚、准确，并逐步保留自己的表达" },
    { skill: "深度阅读", words: ["读不懂", "理解", "阅读", "复述", "题意", "语文"], label: "阅读理解与信息提取", goal: "从材料中提取目标、条件、因果和证据" },
    { skill: "反馈与提炼", words: ["不会总结", "复盘", "重复犯", "说不清为什么", "方法"], label: "复盘与方法提炼", goal: "把一次经历变成下次可复用的方法" },
    { skill: "合作分工", words: ["打架", "冲突", "争抢", "合作", "指挥", "退让"], label: "合作与冲突处理", goal: "明确角色、边界、交接和分歧处理" },
    { skill: "用户意识", words: ["不听别人", "别人看不懂", "自顾自", "同理", "使用"], label: "理解别人和真实使用者", goal: "观察别人怎么用，并根据具体反馈修改" },
    { skill: "数据分析", words: ["粗心", "马虎", "凭感觉", "记录", "变化", "运动"], label: "用数据观察变化", goal: "用连续记录代替模糊感觉" },
    { skill: "文件管理", words: ["找不到", "乱放", "电脑", "文件", "整理"], label: "信息和文件管理", goal: "建立能查找、能维护的命名和归档规则" },
    { skill: "计算思维", words: ["步骤", "规则", "编程", "流程", "自动化", "为什么"], label: "流程化解决问题", goal: "把问题转成输入、步骤、条件、输出和测试" },
    { skill: "AI协作", words: ["AI", "人工智能", "电脑", "提示词", "模型"], label: "负责任地使用AI", goal: "先定义目标和标准，再让AI解释、检查和辅助" },
    { skill: "信息可信度", words: ["查资料", "真假", "来源", "视频", "搜索"], label: "信息检索与判断", goal: "比较来源，说明为什么相信" },
    { skill: "打字", words: ["打字", "键盘", "电脑输入"], label: "数字输入与表达", goal: "准确输入、修改、排版和保存版本" },
    { skill: "迁移应用", words: ["举一反三", "换题不会", "只会这一种", "迁移"], label: "举一反三", goal: "把方法带到新场景并说明边界" }
  ];

  const STRENGTH_RULES = [
    { name: "持续兴趣与内在动机", words: ["不用催", "反复", "很久", "主动", "沉浸", "每天都", "自己会"], meaning: "这是长期项目最重要的燃料，适合作为任务外壳，而不是把兴趣本身变成额外作业。" },
    { name: "好奇心与探究倾向", words: ["为什么", "研究", "查资料", "原理", "拆开", "试验", "想知道"], meaning: "可能适合科学、工程、数据和AI方向，但还要观察能否把好奇转成有结果的探索。" },
    { name: "空间建构与系统感", words: ["Minecraft", "我的世界", "搭建", "拼装", "地图", "画图", "结构"], meaning: "适合用搭建、地图、流程和可视化承载抽象学习。" },
    { name: "故事与人物感受力", words: ["故事", "人物", "讲给", "表演", "想象", "小说"], meaning: "可以发展阅读、叙事、同理心和公共表达。" },
    { name: "运动投入与身体学习", words: ["羽毛球", "跑", "跳", "运动", "比赛", "街舞", "体力不错"], meaning: "适合用挑战、数据和教别人动作来发展自律与反馈能力。" },
    { name: "数字工具亲和力", words: ["电脑", "打字", "编程", "AI", "游戏规则", "做视频"], meaning: "可以较早进入数字创作和人机协作，但要防止只消费、不输出。" },
    { name: "领导与带动他人", words: ["带着别人", "组织", "教妹妹", "讲给同学", "主动分工"], meaning: "可能具备组织和公共表达潜力，需要同步训练倾听、边界和交接。" },
    { name: "独立尝试与问题解决", words: ["先自己试", "再试", "自己解决", "会调整", "复盘"], meaning: "这是自主学习的核心苗头，值得在真实项目里继续验证。" }
  ];

  function emptyDiscovery() {
    return {
      version: 2,
      answers: [],
      supplementing: false,
      report: null,
      selectedRecommendation: null,
      updatedAt: new Date().toISOString()
    };
  }

  function loadDiscovery() {
    try {
      return { ...emptyDiscovery(), ...(JSON.parse(localStorage.getItem(DISCOVERY_KEY) || "null") || {}) };
    } catch {
      return emptyDiscovery();
    }
  }

  let discovery = loadDiscovery();

  function saveDiscovery() {
    discovery.updatedAt = new Date().toISOString();
    localStorage.setItem(DISCOVERY_KEY, JSON.stringify(discovery));
  }

  function unique(values) {
    return [...new Set(values.filter(Boolean))];
  }

  function answeredDomainIds() {
    return new Set(discovery.answers.filter(item => item.domain !== "supplement").map(item => item.domain));
  }

  function nextQuestion() {
    if (discovery.supplementing) {
      return {
        id: "supplement",
        title: "补充与纠正",
        ask: "请直接补充任何你认为重要、但前面没有问到的情况。也可以纠正系统刚才的理解。最好带一个具体场景。",
        quick: ["补充一个学校里的情况", "补充一个家庭里的情况", "纠正一条判断", "暂时没有"]
      };
    }
    const answered = answeredDomainIds();
    return QUESTIONS.find(question => !answered.has(question.id)) || null;
  }

  function snippet(text, length = 42) {
    const clean = String(text || "").replace(/\s+/g, " ").trim();
    return clean.length > length ? `${clean.slice(0, length)}…` : clean;
  }

  function acknowledge(question, text) {
    const value = String(text || "");
    if (value.includes("暂时") || value.includes("不知道") || value.includes("想不到")) {
      return "没关系，我先把这一项记为“还需要观察”，不会为了凑结论而猜。";
    }
    const special = {
      spark: "我先记下这个主动投入的场景。真正值得关注的不是“喜欢”两个字，而是他在没有催促时能持续做什么。后面还要验证这种投入能不能迁移到有计划、有收尾的项目里。",
      learning: "这能看出他面对未知时的默认策略。接下来我会区分：他是缺方法、缺耐心，还是其实已经有自主解决问题的苗头。",
      school: "成绩只是结果，你提供的课堂、作业和考试表现更有价值。它能帮助区分理解能力、表达能力和执行习惯。",
      execution: "这一条很关键。很多孩子不是“能力差”，而是卡在启动、持续、检查或收尾中的某一环，项目设计必须精准补这一环。",
      frustration: "我不会把情绪反应直接当成性格标签。更重要的是他多久恢复、靠什么恢复，以及成人是否会过早接管。",
      expression: "这说明我们以后不能只用写作来判断能力。任务成果可以先从他更自然的表达通道进入，再逐步补文字和结构。",
      social: "我会把合作、边界和是否容易受欺负分开判断，不能简单归结为“内向”或“脾气大”。",
      body: "身体状态会直接影响专注、情绪和学习效率，所以它不是附属项，而是成长系统的底层条件。",
      environment: "项目必须适应真实家庭，而不是要求家庭围着项目转。你说的时间、设备和陪伴限制会直接影响任务颗粒度。",
      goal: "我会把你的期待转成可观察行为，而不是空泛目标。之后每个项目都要能验证这些变化是否真的发生。",
      supplement: "这条补充会进入画像证据。系统的判断可以被你随时纠正，不会把一次描述固化成永久标签。"
    };
    return special[question.id] || "我已经记下这个具体场景，后面会和其他信息交叉验证。";
  }

  function submitAnswer(text) {
    const question = nextQuestion();
    const clean = String(text || "").trim();
    if (!question || !clean) return;
    discovery.answers.push({
      id: makeId(),
      domain: question.id,
      domainTitle: question.title,
      question: question.ask,
      text: clean,
      ack: acknowledge(question, clean),
      createdAt: new Date().toISOString()
    });
    discovery.supplementing = false;
    discovery.report = null;
    saveDiscovery();
    renderHome();
  }

  function allAnswerText() {
    return discovery.answers.map(item => item.text).join("\n");
  }

  function evidenceFor(words) {
    const answer = discovery.answers.find(item => words.some(word => item.text.toLowerCase().includes(word.toLowerCase())));
    return answer ? snippet(answer.text, 68) : "来自当前对话的综合线索";
  }

  function countMatches(text, words) {
    const lower = text.toLowerCase();
    return words.reduce((count, word) => count + (lower.includes(word.toLowerCase()) ? 1 : 0), 0);
  }

  function extractInterests(text) {
    const pairs = [
      ["刘慈欣科幻", ["刘慈欣", "科幻", "三体"]],
      ["《基督山伯爵》", ["基督山伯爵"]],
      ["Minecraft", ["minecraft", "我的世界", "搭建"]],
      ["羽毛球", ["羽毛球"]],
      ["家庭做饭", ["做饭", "厨房", "菜"]],
      ["故事会", ["故事", "写作", "作文", "小说"]],
      ["地理探索", ["地理", "地图", "旅行", "路线"]],
      ["塞尔达探索", ["塞尔达", "王国之泪"]]
    ];
    const found = pairs.filter(([, words]) => words.some(word => text.toLowerCase().includes(word.toLowerCase()))).map(([shell]) => shell);
    return unique([...found, ...(state.child.interests || []).filter(item => SHELLS.includes(item))]);
  }

  function buildReport() {
    const text = allAnswerText();
    const strengths = STRENGTH_RULES
      .map(rule => ({ ...rule, score: countMatches(text, rule.words) }))
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map(item => ({
        name: item.name,
        evidence: evidenceFor(item.words),
        confidence: item.score >= 2 ? "较高" : "初步",
        meaning: item.meaning
      }));

    if (!strengths.length && discovery.answers.length) {
      strengths.push({
        name: "仍在寻找稳定优势",
        evidence: snippet(discovery.answers[0].text, 68),
        confidence: "待验证",
        meaning: "当前信息还不足以判断稳定优势，下一步应继续观察孩子在没有催促时会持续投入什么。"
      });
    }

    const gapCandidates = SKILL_GAP_RULES
      .map(rule => ({ ...rule, score: countMatches(text, rule.words) }))
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score);

    const gaps = gapCandidates.slice(0, 5).map(item => ({
      name: item.label,
      skill: item.skill,
      evidence: evidenceFor(item.words),
      confidence: item.score >= 2 ? "较高" : "初步",
      goal: item.goal
    }));

    if (!gaps.length) {
      gaps.push({
        name: "需要用真实项目继续诊断",
        skill: "反馈与提炼",
        evidence: "当前对话中没有出现稳定、重复的困难线索。",
        confidence: "待验证",
        goal: "通过一个短项目观察启动、持续、检查、收尾和复盘五个环节。"
      });
    }

    const answered = answeredDomainIds();
    const unknowns = QUESTIONS
      .filter(question => !answered.has(question.id))
      .map(question => `还不了解：${question.title}`);
    discovery.answers
      .filter(item => /不知道|暂时|想不到|不确定/.test(item.text))
      .forEach(item => unknowns.push(`“${item.domainTitle}”仍缺少具体场景`));

    const coreSkills = unique(gaps.map(item => item.skill)).slice(0, 3);
    if (coreSkills.length < 3) {
      ["责任闭环", "任务拆解", "反馈与提炼"].forEach(skill => {
        if (coreSkills.length < 3 && !coreSkills.includes(skill)) coreSkills.push(skill);
      });
    }

    const supportSkills = unique([
      ...gapCandidates.slice(3, 7).map(item => item.skill),
      ...(text.includes("电脑") || text.includes("AI") ? ["AI协作", "文件管理"] : []),
      ...(text.includes("故事") || text.includes("语文") ? ["深度阅读", "中文书写"] : []),
      ...(text.includes("运动") || text.includes("羽毛球") ? ["数据分析", "挫折恢复"] : []),
      "用户意识"
    ]).filter(skill => !coreSkills.includes(skill)).slice(0, 5);

    const interests = extractInterests(text);
    const directionScores = Object.entries(PROFESSIONS).map(([name, skills]) => ({
      name,
      score: skills.filter(skill => [...coreSkills, ...supportSkills].includes(skill)).length
    })).sort((a, b) => b.score - a.score);

    const report = {
      generatedAt: new Date().toISOString(),
      answerCount: discovery.answers.length,
      strengths,
      gaps,
      unknowns: unique(unknowns).slice(0, 6),
      coreSkills,
      supportSkills,
      maintenanceSkills: unique(["责任闭环", "挫折恢复", "迁移应用"]).filter(skill => !coreSkills.includes(skill) && !supportSkills.includes(skill)),
      interests,
      possibleDirections: directionScores.slice(0, 3).map(item => item.name)
    };

    discovery.report = report;
    discovery.supplementing = false;
    saveDiscovery();
    applyReportToChild(report);
    return report;
  }

  function applyReportToChild(report) {
    if (report.interests.length) {
      state.child.interests = unique([...report.interests, ...(state.child.interests || [])]);
    }
    state.child.focus = report.gaps.slice(0, 3).map(item => ({ name: item.skill, desc: item.goal }));
    save();
  }

  function ensureReport() {
    return discovery.report || buildReport();
  }

  function flowMap(active) {
    const labels = ["聊孩子", "形成发现", "成长路线", "推荐项目", "执行验证"];
    return `<div class="flow-map">${labels.map((label, index) => `<div class="flow-step ${index === active ? "active" : ""}"><span>${index + 1}</span>${label}</div>`).join("")}</div>`;
  }

  function renderConversationMessages() {
    const first = `<div class="chat-message ai">我先不让你选技能，也不急着生成任务。我们先通过具体场景认识孩子。\n\n我会区分“真正稳定的优势”“暂时表现”和“仍需验证的猜测”，不会因为一句话就给孩子贴标签。</div>`;
    const history = discovery.answers.map(item => `
      <div class="chat-message user">${escapeHtml(item.text)}</div>
      <div class="chat-message ai">${escapeHtml(item.ack)}</div>`).join("");
    const question = nextQuestion();
    const current = question
      ? `<div class="chat-message ai"><b>${escapeHtml(question.title)}</b>\n${escapeHtml(question.ask)}</div>`
      : `<div class="chat-message system">核心问题已经问完。现在可以生成初步发现，也可以继续补充或纠正。</div>`;
    return first + history + current;
  }

  function renderHomeV2() {
    const answered = answeredDomainIds().size;
    const question = nextQuestion();
    const percent = Math.min(100, Math.round(answered / QUESTIONS.length * 100));
    const taskCard = state.task ? `
      <div class="card">
        <div class="row between"><span class="pill green">正在执行</span><button class="btn ghost small-btn" type="button" id="openCurrentWorkflowBtn">进入项目</button></div>
        <h3>${escapeHtml(state.task.title)}</h3>
        <div class="small">当前项目只是验证画像的实验，不是永久课程。执行结果会反过来修正判断。</div>
      </div>` : "";

    el("home").innerHTML = `
      <div class="card conversation-hero">
        <span class="pill glass">第一步 · 先理解孩子</span>
        <h2>先聊孩子，再谈培养</h2>
        <div class="small">不用填复杂表格。一次回答一个具体场景，系统负责提炼、追问和发现缺失信息。</div>
        <div class="discovery-progress"><div class="progress"><div class="bar" style="width:${percent}%"></div></div><b>${answered}/${QUESTIONS.length}</b></div>
      </div>
      ${flowMap(0)}
      ${taskCard}
      <div class="chat-wrap" id="discoveryChat">${renderConversationMessages()}</div>
      ${question ? `
        <div class="quick-replies">${question.quick.map(value => `<button type="button" class="quick-reply" data-quick-answer="${escapeHtml(value)}">${escapeHtml(value)}</button>`).join("")}</div>
        <div class="answer-box">
          <textarea id="discoveryAnswer" placeholder="尽量说一个真实场景：发生了什么、他怎么做、成人是否提醒、最后结果怎样"></textarea>
          <div class="answer-actions">
            <button type="button" class="btn" id="submitDiscoveryAnswerBtn">发送回答</button>
            <button type="button" class="btn ghost" id="skipDiscoveryQuestionBtn">先跳过</button>
          </div>
        </div>` : ""}
      <div class="grid2" style="margin-top:14px">
        <button type="button" class="btn secondary" id="addSupplementBtn">随时补充或纠正</button>
        <button type="button" class="btn green" id="buildInsightBtn" ${discovery.answers.length < 3 ? "disabled" : ""}>${discovery.report ? "更新孩子发现" : "生成初步发现"}</button>
      </div>
      ${discovery.answers.length ? `<button type="button" class="btn ghost full" id="resetDiscoveryBtn" style="margin-top:10px">重新开始了解</button>` : ""}`;

    document.querySelectorAll("[data-quick-answer]").forEach(button => {
      button.addEventListener("click", () => {
        const field = el("discoveryAnswer");
        if (field) field.value = button.dataset.quickAnswer;
      });
    });
    el("submitDiscoveryAnswerBtn")?.addEventListener("click", () => submitAnswer(el("discoveryAnswer").value));
    el("discoveryAnswer")?.addEventListener("keydown", event => {
      if ((event.ctrlKey || event.metaKey) && event.key === "Enter") submitAnswer(event.currentTarget.value);
    });
    el("skipDiscoveryQuestionBtn")?.addEventListener("click", () => submitAnswer("暂时不确定，先跳过，后续继续观察。"));
    el("addSupplementBtn")?.addEventListener("click", () => {
      discovery.supplementing = true;
      saveDiscovery();
      renderHome();
    });
    el("buildInsightBtn")?.addEventListener("click", () => {
      buildReport();
      go("profile");
    });
    el("resetDiscoveryBtn")?.addEventListener("click", () => {
      if (!confirm("确认清空这次对孩子的对话和发现吗？现有项目与技能证据不会删除。")) return;
      discovery = emptyDiscovery();
      saveDiscovery();
      renderHome();
    });
    el("openCurrentWorkflowBtn")?.addEventListener("click", () => go("workflow"));
    setTimeout(() => window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" }), 40);
  }

  function confidenceClass(value) {
    return value === "较高" ? "high" : value === "初步" ? "medium" : "";
  }

  function renderProfileV2() {
    const report = discovery.report;
    if (!report) {
      el("profile").innerHTML = `${flowMap(1)}<div class="card discovery-empty"><h2>还没有形成孩子发现</h2><p>先通过几个具体问题了解孩子，再生成带证据的初步判断。</p><button type="button" class="btn" id="goDiscoveryBtn">开始聊孩子</button></div>`;
      el("goDiscoveryBtn").onclick = () => go("home");
      return;
    }

    const strengths = report.strengths.map(item => `
      <div class="insight-card strength">
        <div class="row between"><b>${escapeHtml(item.name)}</b><span class="confidence ${confidenceClass(item.confidence)}">${escapeHtml(item.confidence)}</span></div>
        <div class="evidence-line"><b>依据：</b>${escapeHtml(item.evidence)}</div>
        <div class="small" style="margin-top:8px">${escapeHtml(item.meaning)}</div>
      </div>`).join("");
    const gaps = report.gaps.map(item => `
      <div class="insight-card gap">
        <div class="row between"><b>${escapeHtml(item.name)}</b><span class="confidence ${confidenceClass(item.confidence)}">${escapeHtml(item.confidence)}</span></div>
        <div class="evidence-line"><b>依据：</b>${escapeHtml(item.evidence)}</div>
        <div class="small" style="margin-top:8px"><b>不是贴标签：</b>${escapeHtml(item.goal)}</div>
        <span class="pill orange" style="margin-top:9px">对应能力：${escapeHtml(item.skill)}</span>
      </div>`).join("");
    const unknowns = report.unknowns.length
      ? report.unknowns.map(item => `<div class="insight-card unknown">${escapeHtml(item)}</div>`).join("")
      : `<div class="insight-card unknown">核心维度已有初步信息，但所有结论仍需要通过真实项目继续验证。</div>`;

    el("profile").innerHTML = `
      ${flowMap(1)}
      <div class="hypothesis-note"><b>这是一组待验证假设，不是给孩子定型。</b><br>每条发现都附带证据和置信度。你可以继续补充、纠正，项目执行结果也会更新画像。</div>
      <div class="section-title">可能的优势与天赋苗头</div>
      <div class="insight-grid">${strengths}</div>
      <div class="section-title">当前最值得补的环节</div>
      <div class="insight-grid">${gaps}</div>
      <div class="section-title">仍然不知道什么</div>
      <div class="insight-grid">${unknowns}</div>
      <div class="card">
        <b>可能适合继续验证的未来方向</b>
        <div class="row wrap" style="margin-top:10px">${report.possibleDirections.map(item => `<span class="pill blue">${escapeHtml(item)}</span>`).join("")}</div>
      </div>
      <div class="grid2">
        <button type="button" class="btn secondary" id="correctInsightBtn">补充或纠正</button>
        <button type="button" class="btn" id="openRoadmapBtn">查看成长路线</button>
      </div>`;
    el("correctInsightBtn").onclick = () => {
      discovery.supplementing = true;
      saveDiscovery();
      go("home");
    };
    el("openRoadmapBtn").onclick = () => go("skills");
  }

  function skillRoadmapItem(skill, index, role) {
    const meta = SKILL_META[skill] || ["综合能力", "成长能力", "未来方向", "通过真实项目留下证据"];
    return `<div class="roadmap-item"><div class="roadmap-number">${index + 1}</div><div><b>${escapeHtml(skill)}</b><div class="skill-chain">${escapeHtml(meta[0])} → ${escapeHtml(meta[1])} → ${escapeHtml(meta[2])}</div><div class="small">${role}：${escapeHtml(meta[3])}</div></div></div>`;
  }

  function renderSkillsV2() {
    const report = discovery.report;
    if (!report) {
      el("skills").innerHTML = `${flowMap(2)}<div class="card discovery-empty"><h2>成长路线要从孩子发现出发</h2><button type="button" class="btn" id="goDiscoveryFromSkillsBtn">先了解孩子</button></div>`;
      el("goDiscoveryFromSkillsBtn").onclick = () => go("home");
      return;
    }

    const strengthNames = report.strengths.map(item => item.name);
    el("skills").innerHTML = `
      ${flowMap(2)}
      <div class="card profile-signal">
        <span class="pill purple">自动映射，不让家长猜技能</span>
        <h2>从发现到未来能力</h2>
        <div class="small">路线不是“多学几门课”，而是用孩子愿意投入的外壳，集中补最关键的行为能力，再用真实成果验证。</div>
      </div>
      <div class="roadmap-layer">
        <span class="pill green">第一层 · 利用优势</span>
        <h3>让孩子愿意进入项目</h3>
        ${strengthNames.map((name, index) => `<div class="roadmap-item"><div class="roadmap-number">${index + 1}</div><div><b>${escapeHtml(name)}</b><div class="small">不把兴趣变成额外作业，而是让它承担阅读、规划、表达、合作或数据任务。</div></div></div>`).join("")}
      </div>
      <div class="roadmap-layer">
        <span class="pill orange">第二层 · 本阶段重点补强</span>
        <h3>一次只抓1—3个关键环节</h3>
        ${report.coreSkills.map((skill, index) => skillRoadmapItem(skill, index, "核心训练" )).join("")}
      </div>
      <div class="roadmap-layer">
        <span class="pill blue">第三层 · 重要支撑</span>
        <h3>在项目中自然发生，不额外堆课</h3>
        ${report.supportSkills.map((skill, index) => skillRoadmapItem(skill, index, "重要支撑")).join("")}
      </div>
      <div class="roadmap-layer">
        <span class="pill gray">第四层 · 长期维护</span>
        <h3>每个项目都要检查的底层能力</h3>
        ${report.maintenanceSkills.map((skill, index) => skillRoadmapItem(skill, index, "基础维护")).join("")}
      </div>
      <button type="button" class="btn full" id="openProjectsBtn">让系统推荐合适项目</button>`;
    el("openProjectsBtn").onclick = () => go("generator");
  }

  function recommendationShells(report) {
    const preferred = report.interests.filter(shell => SHELLS.includes(shell));
    const fallback = (state.child.interests || []).filter(shell => SHELLS.includes(shell));
    return unique([...preferred, ...fallback, "刘慈欣科幻", "Minecraft", "故事会"]).slice(0, 3);
  }

  function recommendations(report) {
    return recommendationShells(report).map((shell, index) => {
      const template = TEMPLATES[shell];
      const shellSkills = template.support.filter(skill => !report.coreSkills.includes(skill));
      const skills = unique([...report.coreSkills.slice(0, 2), ...shellSkills]).slice(0, 3);
      const leverage = report.strengths[index % report.strengths.length]?.name || "现有兴趣";
      const gap = report.gaps[index % report.gaps.length];
      return {
        shell,
        title: template.title,
        purpose: template.purpose,
        skills,
        leverage,
        gapName: gap?.name || "完成真实任务",
        gapGoal: gap?.goal || "通过真实成果验证能力",
        realUser: index === 0 ? "家人" : index === 1 ? "妹妹或同学" : "一个真实使用者",
        problem: `利用“${leverage}”作为进入点，重点改善“${gap?.name || report.coreSkills[0]}”，完成一个能被真实使用和评价的成果。`,
        availableTime: index === 0 ? 35 : 25
      };
    });
  }

  function selectRecommendation(rec) {
    chosenShell = rec.shell;
    chosenSkills = [...rec.skills];
    discovery.selectedRecommendation = rec;
    saveDiscovery();
    el("realUser").value = rec.realUser;
    el("realProblem").value = rec.problem;
    el("availableTime").value = String(rec.availableTime);
    generateTask();
  }

  function renderGeneratorV2() {
    legacyRenderGenerator();
    const report = discovery.report;
    const section = el("generator");
    if (!report) {
      section.insertAdjacentHTML("afterbegin", `${flowMap(3)}<div class="card discovery-empty"><h2>先了解孩子，再推荐项目</h2><p>不再让你先选项目外壳和技能。</p><button type="button" class="btn" id="goDiscoveryFromProjectBtn">返回聊孩子</button></div>`);
      el("goDiscoveryFromProjectBtn").onclick = () => go("home");
      [el("profileSignal"), el("aiControlCard"), el("plusActionCard")].filter(Boolean).forEach(node => node.style.display = "none");
      return;
    }

    const shellField = el("shellTags")?.closest(".field");
    const skillField = el("skillTags")?.closest(".field");
    const realUserField = el("realUser")?.closest(".field");
    const problemField = el("realProblem")?.closest(".field");
    const timeField = el("availableTime")?.closest(".field");
    const oldGenerateButton = [...section.querySelectorAll(":scope > button")].find(button => button.getAttribute("onclick") === "generateTask()");
    [shellField, skillField, realUserField, problemField, timeField, oldGenerateButton].filter(Boolean).forEach(node => node.style.display = "none");

    el("profileSignal").innerHTML = `<span class="pill purple">系统已经替你做了第一轮判断</span><h3>不用先选技能</h3><div class="small">下面三个项目由孩子的兴趣线索、当前短板、未来能力和家庭资源共同生成。你只需要判断哪个最像他愿意进入的真实挑战。</div>`;

    let container = el("projectRecommendations");
    if (!container) {
      container = document.createElement("div");
      container.id = "projectRecommendations";
      const bridgeCard = el("plusActionCard") || el("aiControlCard") || el("profileSignal");
      bridgeCard.insertAdjacentElement("afterend", container);
    }

    const recs = recommendations(report);
    container.innerHTML = `${flowMap(3)}
      <div class="section-title">系统推荐的三个项目</div>
      ${recs.map((rec, index) => `
        <div class="recommendation-card ${index === 0 ? "recommended" : ""}">
          <div class="row between"><span class="pill ${index === 0 ? "green" : "blue"}">${index === 0 ? "最推荐" : `备选${index}`}</span><span class="small">${escapeHtml(rec.shell)}</span></div>
          <h2>${escapeHtml(rec.title)}</h2>
          <div class="small">${escapeHtml(rec.purpose)}</div>
          <div class="recommendation-reasons">
            <div class="reason-row"><b>利用优势：</b>${escapeHtml(rec.leverage)}</div>
            <div class="reason-row"><b>重点补强：</b>${escapeHtml(rec.gapName)}——${escapeHtml(rec.gapGoal)}</div>
            <div class="reason-row"><b>未来技能：</b>${rec.skills.map(escapeHtml).join("、")}</div>
          </div>
          <button type="button" class="btn ${index === 0 ? "green" : "secondary"} full" data-use-recommendation="${index}">用这个项目生成完整方案</button>
        </div>`).join("")}
      <button type="button" class="btn ghost full" id="toggleAdvancedProjectBtn">高级调整：手动改外壳、技能和时间</button>
      <div class="advanced-panel" id="advancedProjectPanel"></div>`;

    const advanced = el("advancedProjectPanel");
    [shellField, skillField, realUserField, problemField, timeField, oldGenerateButton].filter(Boolean).forEach(node => {
      node.style.display = "";
      advanced.appendChild(node);
    });
    el("toggleAdvancedProjectBtn").onclick = () => advanced.classList.toggle("open");
    document.querySelectorAll("[data-use-recommendation]").forEach(button => {
      button.addEventListener("click", () => selectRecommendation(recs[Number(button.dataset.useRecommendation)]));
    });
  }

  function renderWorkflowV2() {
    legacyRenderWorkflow();
    const report = discovery.report;
    const section = el("workflow");
    let why = el("workflowWhyCard");
    if (!why) {
      why = document.createElement("div");
      why.id = "workflowWhyCard";
      why.className = "card profile-signal";
      section.insertBefore(why, section.firstChild);
    }
    why.innerHTML = `${flowMap(4)}<b>这个项目也是一次诊断实验</b><div class="small">重点观察：${report ? report.coreSkills.map(escapeHtml).join("、") : state.task.coreSkills.map(escapeHtml).join("、")}。完成情况、提醒次数、卡点和真实用户反馈会反过来修正孩子画像。</div>`;

    let reviewButton = el("workflowReviewBtn");
    if (!reviewButton) {
      reviewButton = document.createElement("button");
      reviewButton.id = "workflowReviewBtn";
      reviewButton.type = "button";
      reviewButton.className = "btn secondary full";
      reviewButton.style.marginTop = "10px";
      reviewButton.textContent = "项目完成后：提交证据并复盘";
      section.appendChild(reviewButton);
    }
    reviewButton.onclick = () => go("review");
  }

  go = function goV2(page) {
    document.querySelectorAll(".page").forEach(node => node.classList.remove("active"));
    el(page).classList.add("active");
    document.querySelectorAll("nav button").forEach(node => node.classList.toggle("active", node.dataset.page === page));
    const titles = {
      home: ["聊孩子", "先理解，再判断，再培养"],
      profile: ["孩子发现", "每条结论都要有依据，也允许被纠正"],
      skills: ["未来技能路线", "自动把优势和短板映射成培养优先级"],
      generator: ["项目推荐", "系统推荐，不让家长先做专家判断"],
      workflow: ["执行与验证", "项目结果反过来修正画像"],
      review: ["证据与复盘", "用事实决定能力是否真的提升"]
    }[page];
    el("pageTitle").textContent = titles[0];
    el("pageSub").textContent = titles[1];
    ({
      home: renderHome,
      profile: renderProfile,
      skills: renderSkills,
      generator: renderGenerator,
      workflow: renderWorkflow,
      review: renderReview
    }[page])();
    scrollTo(0, 0);
  };

  renderHome = renderHomeV2;
  renderProfile = renderProfileV2;
  renderSkills = renderSkillsV2;
  renderGenerator = renderGeneratorV2;
  renderWorkflow = renderWorkflowV2;

  window.addEventListener("DOMContentLoaded", () => {
    renderHome();
  });
})();
