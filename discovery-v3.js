(() => {
  const DISCOVERY_KEY = "growthOSDiscoveryV3";
  const OLD_DISCOVERY_KEY = "growthOSDiscoveryV2";
  const legacyRenderGenerator = renderGenerator;
  const legacyRenderWorkflow = renderWorkflow;

  const OBSERVERS = {
    parent: "家长观察",
    child: "孩子自述",
    teacher: "老师反馈",
    elder: "老人/其他照料者",
    coach: "教练/兴趣老师"
  };

  const FREQUENCIES = {
    rare: { label: "偶尔出现", weight: 1 },
    sometimes: { label: "有时出现", weight: 2 },
    often: { label: "经常出现", weight: 3 },
    stable: { label: "多数时候稳定出现", weight: 4 }
  };

  const CONTEXTS = {
    home: "家庭日常",
    school: "学校课堂/作业",
    interest: "兴趣活动",
    peers: "同伴相处",
    alone: "独处时",
    competition: "比赛或压力情境"
  };

  const MODULES = [
    {
      id: "motivation",
      title: "自主兴趣与内在动机",
      purpose: "观察孩子在没有催促、没有即时奖励时，会自然靠近什么，以及能持续多久。",
      prompt: "下面哪些行为真实出现过？可以多选，甚至同时选看似矛盾的项，因为孩子在不同情境下可能完全不同。",
      options: [
        { id: "self_start", label: "会自己发起一件事", detail: "不等成人安排，主动拿起书、工具、球拍或打开一个要研究的内容。", kind: "strength", traits: ["内在动机", "自主性"], skills: ["责任闭环"] },
        { id: "deep_focus", label: "喜欢的事情能持续投入", detail: "能连续投入20分钟以上，过程中较少需要提醒。", kind: "strength", traits: ["持续专注", "内在动机"], skills: ["挫折恢复"] },
        { id: "question_research", label: "会反复提问、查资料或试验", detail: "不满足于知道答案，还想弄清原因、规则或更好的办法。", kind: "strength", traits: ["探究倾向", "好奇心"], skills: ["信息可信度", "深度阅读"] },
        { id: "make_output", label: "愿意把兴趣变成作品或成果", detail: "会搭建、记录、画图、写攻略、讲给别人或整理成可使用的东西。", kind: "strength", traits: ["创造与产出", "项目意识"], skills: ["用户意识"] },
        { id: "share_teach", label: "喜欢展示、讲解或教别人", detail: "愿意把自己会的内容讲给同学、兄弟姐妹或家人。", kind: "strength", traits: ["表达驱动", "带动他人"], skills: ["合作分工", "用户意识"] },
        { id: "only_with_company", label: "只有成人陪着才容易持续", detail: "成人一离开，兴趣或任务很快停止。", kind: "challenge", traits: [], skills: ["责任闭环", "挫折恢复"] },
        { id: "switch_fast", label: "兴趣切换很快，常开头多、收尾少", detail: "短时间觉得很多事都好玩，但很少形成稳定成果。", kind: "challenge", traits: [], skills: ["任务拆解", "责任闭环"] },
        { id: "reward_driven", label: "主要依靠奖励、催促或竞争才开始", detail: "没有外部刺激时很少主动进入。", kind: "challenge", traits: [], skills: ["责任闭环"] },
        { id: "no_stable_interest", label: "目前还没观察到稳定兴趣", detail: "可以如实选择，系统会把它记为待观察，而不是强行判断。", kind: "unknown", traits: [], skills: [] }
      ]
    },
    {
      id: "learning",
      title: "学习、理解与解决问题方式",
      purpose: "区分孩子是怎样学会的、遇到未知时采用什么策略，而不只看考试分数。",
      prompt: "请选择符合实际的学习行为。可以同时选择优势和困难项。",
      options: [
        { id: "oral_fast", label: "听别人解释时理解较快", detail: "能抓住重点，并用自己的话复述。", kind: "strength", traits: ["语言理解"], skills: ["深度阅读"] },
        { id: "visual_fast", label: "看图、示范或结构图更容易理解", detail: "视觉化后明显比只听文字更顺畅。", kind: "strength", traits: ["视觉空间加工"], skills: ["计算思维"] },
        { id: "hands_on", label: "动手试过以后才真正理解", detail: "通过搭建、操作、实验或运动动作学习更有效。", kind: "strength", traits: ["实践学习"], skills: ["反馈与提炼"] },
        { id: "self_search", label: "会自己查资料并比较办法", detail: "会搜索、看书、问不同的人或验证答案。", kind: "strength", traits: ["自主学习", "探究倾向"], skills: ["信息可信度", "AI协作"] },
        { id: "explain_reason", label: "能说清为什么这样做", detail: "不仅会做，还能解释条件、步骤或依据。", kind: "strength", traits: ["逻辑表达"], skills: ["深度阅读", "反馈与提炼"] },
        { id: "understand_not_write", label: "理解了，但写不出来或写得很慢", detail: "口头能说，落到书写、作文或答题时明显受阻。", kind: "challenge", traits: [], skills: ["中文书写", "打字"] },
        { id: "familiar_only", label: "熟悉题会做，换个情境就不会", detail: "方法没有迁移到新题、新材料或真实问题。", kind: "challenge", traits: [], skills: ["迁移应用", "反馈与提炼"] },
        { id: "careless", label: "理解不差，但常因漏看、抄错或不检查失分", detail: "错误更多发生在执行和检查，而不是概念理解。", kind: "challenge", traits: [], skills: ["责任闭环", "数据分析"] },
        { id: "copy_answer", label: "遇到难题容易直接找答案或等别人讲", detail: "较少先自己尝试、提出假设或说明卡点。", kind: "challenge", traits: [], skills: ["挫折恢复", "AI协作"] }
      ]
    },
    {
      id: "execution",
      title: "任务执行与自我管理",
      purpose: "把“拖拉、马虎、不自觉”拆成启动、规划、持续、检查、收尾五个具体环节。",
      prompt: "请选择孩子在真实任务中的表现。不同环节可以一强一弱。",
      options: [
        { id: "starts_independently", label: "知道要做什么后能自己开始", detail: "不需要反复催促或成人坐在旁边。", kind: "strength", traits: ["自主启动"], skills: ["责任闭环"] },
        { id: "plans_steps", label: "会先想步骤或准备材料", detail: "能说出先做什么、后做什么。", kind: "strength", traits: ["规划能力"], skills: ["任务拆解"] },
        { id: "persists", label: "中途遇到小困难仍能继续", detail: "不会一受阻就离开任务。", kind: "strength", traits: ["坚持与恢复"], skills: ["挫折恢复"] },
        { id: "self_checks", label: "完成后会主动检查并修改", detail: "能发现遗漏、错误或不方便之处。", kind: "strength", traits: ["质量意识"], skills: ["责任闭环", "反馈与提炼"] },
        { id: "closes_loop", label: "能收尾、归位、保存并交付", detail: "不是只做核心动作，也能处理最后的整理和说明。", kind: "strength", traits: ["责任闭环"], skills: ["责任闭环", "文件管理"] },
        { id: "hard_to_start", label: "启动最困难，需要多次催促", detail: "知道任务但迟迟不进入。", kind: "challenge", traits: [], skills: ["责任闭环", "任务拆解"] },
        { id: "multi_step_confused", label: "步骤一多就乱，不知道下一步", detail: "容易漏材料、漏条件或反复返工。", kind: "challenge", traits: [], skills: ["任务拆解", "计算思维"] },
        { id: "finish_no_check", label: "做完就走，很少检查和收尾", detail: "容易留下错误、物品混乱或没有保存成果。", kind: "challenge", traits: [], skills: ["责任闭环", "文件管理"] },
        { id: "adult_takeover", label: "一慢或一错，成人容易接管", detail: "这既是孩子表现，也是家庭互动模式，需要一起调整。", kind: "challenge", traits: [], skills: ["挫折恢复", "责任闭环"] }
      ]
    },
    {
      id: "expression",
      title: "表达、创造与成果呈现",
      purpose: "识别孩子最自然的表达通道，再决定怎样逐步补文字、结构和面向他人的表达。",
      prompt: "请选择他更自然或更困难的表达方式。",
      options: [
        { id: "oral_story", label: "口头讲述生动，愿意说给别人听", detail: "能讲事件、人物或自己的想法。", kind: "strength", traits: ["口头表达", "故事感"], skills: ["用户意识"] },
        { id: "draw_build", label: "更喜欢画图、搭建、模型或动作表达", detail: "非文字表达明显更自然。", kind: "strength", traits: ["空间创造", "视觉表达"], skills: ["计算思维"] },
        { id: "writes_voluntarily", label: "会主动写、记录、做清单或创作", detail: "书写不是只在作业要求下发生。", kind: "strength", traits: ["文字表达"], skills: ["中文书写"] },
        { id: "digital_create", label: "愿意用电脑制作文档、视频、程序或攻略", detail: "数字工具被用来创造而不只是消费。", kind: "strength", traits: ["数字创造"], skills: ["打字", "文件管理", "AI协作"] },
        { id: "adjust_for_audience", label: "会根据听众反应调整讲法或作品", detail: "能意识到别人是否看懂、是否方便使用。", kind: "strength", traits: ["同理与用户意识"], skills: ["用户意识"] },
        { id: "talk_unstructured", label: "很愿意说，但顺序乱、重点不清", detail: "信息多但别人难以跟上。", kind: "challenge", traits: [], skills: ["任务拆解", "反馈与提炼"] },
        { id: "avoid_writing", label: "有想法但抗拒写字或文字输出", detail: "可能受书写速度、字形、结构或挫败感影响。", kind: "challenge", traits: [], skills: ["中文书写", "挫折恢复"] },
        { id: "cannot_explain", label: "会做，但难以解释过程和理由", detail: "方法停留在直觉，尚未形成可迁移表达。", kind: "challenge", traits: [], skills: ["深度阅读", "反馈与提炼", "迁移应用"] }
      ]
    },
    {
      id: "emotion",
      title: "情绪、挫折与恢复",
      purpose: "不是判断孩子“脾气好不好”，而是观察触发点、恢复时间、有效支持和能否重新回到任务。",
      prompt: "请选择失败、被批评、比赛或难题情境中真实出现过的反应。",
      options: [
        { id: "name_emotion", label: "能说出自己在难受什么、需要什么", detail: "能表达卡点，而不是只有情绪行为。", kind: "strength", traits: ["情绪觉察"], skills: ["挫折恢复"] },
        { id: "pause_return", label: "短暂休息后能回到任务", detail: "恢复后还能继续，而不是整件事取消。", kind: "strength", traits: ["恢复力"], skills: ["挫折恢复"] },
        { id: "try_alternative", label: "失败后会换一种办法再试", detail: "能调整策略，不只重复同一种做法。", kind: "strength", traits: ["问题解决", "恢复力"], skills: ["反馈与提炼"] },
        { id: "accept_feedback", label: "能听取具体反馈并修改", detail: "不把修改等同于否定自己。", kind: "strength", traits: ["成长型反馈"], skills: ["用户意识", "反馈与提炼"] },
        { id: "strong_reaction", label: "容易哭、发火、顶嘴或情绪升级", detail: "需要继续观察触发点和恢复时间。", kind: "challenge", traits: [], skills: ["挫折恢复"] },
        { id: "quit_immediately", label: "一错或一输就直接放弃", detail: "很难从失败返回任务。", kind: "challenge", traits: [], skills: ["挫折恢复"] },
        { id: "avoid_hide", label: "会逃避、隐瞒错误或假装不在乎", detail: "可能是在保护自己免受再次失败。", kind: "challenge", traits: [], skills: ["挫折恢复", "责任闭环"] },
        { id: "needs_rescue", label: "只有成人解决问题后才能恢复", detail: "安慰有效，但孩子较少自己形成恢复步骤。", kind: "challenge", traits: [], skills: ["挫折恢复", "反馈与提炼"] }
      ]
    },
    {
      id: "social",
      title: "合作、边界与同伴关系",
      purpose: "把领导力、合作、冲突、退让和被欺负分开观察，而不是简单归为外向或内向。",
      prompt: "请选择在同学、兄弟姐妹、团队活动中出现过的行为。",
      options: [
        { id: "initiate_coop", label: "会主动邀请别人一起完成事情", detail: "能提出共同目标或自然组织活动。", kind: "strength", traits: ["合作发起", "带动他人"], skills: ["合作分工"] },
        { id: "listen_negotiate", label: "能听别人意见并协商分歧", detail: "不必都同意，但能继续合作。", kind: "strength", traits: ["协商能力"], skills: ["合作分工", "用户意识"] },
        { id: "clear_boundary", label: "能清楚表达不愿意、不同意或需要帮助", detail: "有边界但不依赖攻击。", kind: "strength", traits: ["边界表达"], skills: ["合作分工"] },
        { id: "notice_others", label: "能注意别人是否难受、跟不上或被忽略", detail: "会调整做法或提供帮助。", kind: "strength", traits: ["同理心"], skills: ["用户意识"] },
        { id: "over_control", label: "喜欢带头，但容易变成命令或包办", detail: "领导意愿强，倾听和分工仍需训练。", kind: "challenge", traits: ["带动他人"], skills: ["合作分工", "用户意识"] },
        { id: "over_yield", label: "常常退让、不敢表达或怕破坏关系", detail: "可能需要训练边界和求助。", kind: "challenge", traits: [], skills: ["合作分工", "挫折恢复"] },
        { id: "conflict_escalates", label: "容易争抢、辱骂、推搡或冲突升级", detail: "需要区分触发点、规则理解和表达方式。", kind: "challenge", traits: [], skills: ["合作分工", "挫折恢复"] },
        { id: "misread_social", label: "常看不懂玩笑、规则、拒绝或他人意图", detail: "可能在特定社交情境中需要更明确的脚本。", kind: "challenge", traits: [], skills: ["用户意识", "合作分工"] }
      ]
    },
    {
      id: "body",
      title: "身体状态与生活节律",
      purpose: "身体、睡眠、运动和姿态会影响专注、情绪和执行，但本模块只记录生活表现，不做医学诊断。",
      prompt: "请选择近一个月较常见的状态。身体不适或持续异常应由专业人员评估。",
      options: [
        { id: "regular_sleep", label: "作息较稳定，白天精神基本充足", detail: "入睡、起床和日间状态相对规律。", kind: "strength", traits: ["生活节律"], skills: ["责任闭环"] },
        { id: "enjoys_movement", label: "愿意主动运动或参加户外活动", detail: "运动主要来自内在意愿，而非完全被安排。", kind: "strength", traits: ["身体投入"], skills: ["数据分析"] },
        { id: "physical_persistence", label: "运动中能持续练习并接受重复", detail: "愿意为动作或成绩改进多次。", kind: "strength", traits: ["身体学习", "坚持与恢复"], skills: ["挫折恢复", "数据分析"] },
        { id: "body_awareness", label: "能感知疲劳、疼痛、姿态或需要休息", detail: "会表达身体信号并作出合理调整。", kind: "strength", traits: ["身体觉察"], skills: ["反馈与提炼"] },
        { id: "daytime_tired", label: "白天容易困、累或注意力明显下降", detail: "需要记录出现时间和与睡眠、任务的关系。", kind: "challenge", traits: [], skills: ["数据分析"] },
        { id: "low_activity", label: "久坐较多，主动运动很少", detail: "活动往往需要成人安排。", kind: "challenge", traits: [], skills: ["责任闭环", "数据分析"] },
        { id: "posture_issue", label: "坐姿、低头或驼背问题反复出现", detail: "需要通过环境、提醒和短时训练持续观察。", kind: "challenge", traits: [], skills: ["责任闭环", "数据分析"] },
        { id: "screen_sleep", label: "屏幕、入睡或起床节律不稳定", detail: "不同日子差异大，影响第二天状态。", kind: "challenge", traits: [], skills: ["责任闭环", "数据分析"] }
      ]
    },
    {
      id: "environment",
      title: "家庭环境、资源与现实限制",
      purpose: "判断培养方案能否落地。家庭资源和互动方式不是背景信息，而是任务设计的一部分。",
      prompt: "请选择当前真实存在的资源和限制，可同时多选。",
      options: [
        { id: "stable_time", label: "每周有相对固定的亲子时间", detail: "哪怕不长，但可以稳定用于讨论、示范或复盘。", kind: "resource", traits: [], skills: [] },
        { id: "adult_skill", label: "家长能提供某项真实技能示范", detail: "如技术、阅读、写作、运动、做饭、职业经验等。", kind: "resource", traits: [], skills: [] },
        { id: "elder_support", label: "老人或其他照料者能守流程和安全", detail: "可以提醒、记录或陪伴，但不负责复杂教学。", kind: "resource", traits: [], skills: [] },
        { id: "materials_devices", label: "家里有可用的书、电脑、器材或空间", detail: "可以支持真实项目而不必额外高投入。", kind: "resource", traits: [], skills: [] },
        { id: "schoolwork_pressure", label: "作业多、时间碎，平日很难安排额外任务", detail: "项目必须足够小，并尽量与真实生活或学习结合。", kind: "constraint", traits: [], skills: ["任务拆解"] },
        { id: "adult_inconsistent", label: "不同成人要求不一致", detail: "有人严格、有人包办或奖励规则经常变化。", kind: "constraint", traits: [], skills: ["责任闭环"] },
        { id: "adult_overhelp", label: "成人着急时常替孩子做、讲答案或收尾", detail: "会影响对孩子真实能力的判断。", kind: "constraint", traits: [], skills: ["挫折恢复", "责任闭环"] },
        { id: "limited_resources", label: "设备、空间、经济或交通资源有限", detail: "项目需要优先使用现有材料和低成本方案。", kind: "constraint", traits: [], skills: ["数学预算"] }
      ]
    },
    {
      id: "goals",
      title: "半年目标与优先级",
      purpose: "把“希望更优秀”改写为半年内可观察、可验证的具体变化。",
      prompt: "半年后最希望看到哪些变化？可以多选，随后再写你最担心持续恶化的行为。",
      options: [
        { id: "goal_autonomy", label: "更主动，减少反复催促", detail: "能自己启动、检查和收尾。", kind: "goal", traits: [], skills: ["责任闭环"] },
        { id: "goal_learning", label: "形成自己的学习和解决问题方法", detail: "遇到不会时先尝试、查证、表达卡点。", kind: "goal", traits: [], skills: ["反馈与提炼", "深度阅读"] },
        { id: "goal_expression", label: "表达、写作或作品呈现明显提升", detail: "别人能看懂、听懂并实际使用。", kind: "goal", traits: [], skills: ["中文书写", "用户意识"] },
        { id: "goal_body", label: "体力、姿态和生活节律更稳定", detail: "有可持续的运动和作息习惯。", kind: "goal", traits: [], skills: ["数据分析", "责任闭环"] },
        { id: "goal_social", label: "合作、边界和同伴关系更成熟", detail: "既不欺负别人，也不默默承受。", kind: "goal", traits: [], skills: ["合作分工", "用户意识"] },
        { id: "goal_talent", label: "找到一两个愿意长期投入的优势方向", detail: "通过持续产出和真实挑战验证，而不是只凭兴趣测试。", kind: "goal", traits: [], skills: ["迁移应用"] },
        { id: "goal_ai", label: "学会负责任地使用AI和数字工具", detail: "让AI辅助思考和验证，而不是替代学习。", kind: "goal", traits: [], skills: ["AI协作", "信息可信度"] },
        { id: "goal_resilience", label: "遇到失败能更快恢复并继续", detail: "形成一套可重复的恢复步骤。", kind: "goal", traits: [], skills: ["挫折恢复"] }
      ]
    }
  ];

  function emptyState() {
    return {
      version: 3,
      activeModuleId: MODULES[0].id,
      responses: [],
      report: null,
      selectedRecommendation: null,
      updatedAt: new Date().toISOString()
    };
  }

  function migrateV2() {
    try {
      const old = JSON.parse(localStorage.getItem(OLD_DISCOVERY_KEY) || "null");
      if (!old?.answers?.length) return null;
      const map = {
        spark: "motivation",
        learning: "learning",
        school: "learning",
        execution: "execution",
        frustration: "emotion",
        expression: "expression",
        social: "social",
        body: "body",
        environment: "environment",
        goal: "goals",
        supplement: "environment"
      };
      const migrated = emptyState();
      migrated.responses = old.answers.map(item => ({
        id: item.id || makeId(),
        moduleId: map[item.domain] || "environment",
        observer: "parent",
        frequency: "sometimes",
        contexts: ["home"],
        optionIds: [],
        example: item.text || "",
        note: "由V5.0旧版对话迁移",
        createdAt: item.createdAt || new Date().toISOString()
      }));
      return migrated;
    } catch {
      return null;
    }
  }

  function loadAssessment() {
    try {
      const saved = JSON.parse(localStorage.getItem(DISCOVERY_KEY) || "null");
      if (saved) return { ...emptyState(), ...saved };
      return migrateV2() || emptyState();
    } catch {
      return emptyState();
    }
  }

  let assessment = loadAssessment();

  function saveAssessment() {
    assessment.updatedAt = new Date().toISOString();
    localStorage.setItem(DISCOVERY_KEY, JSON.stringify(assessment));
  }

  function unique(values) {
    return [...new Set(values.filter(Boolean))];
  }

  function moduleById(id) {
    return MODULES.find(module => module.id === id) || MODULES[0];
  }

  function optionById(module, id) {
    return module.options.find(option => option.id === id);
  }

  function moduleResponses(id) {
    return assessment.responses.filter(response => response.moduleId === id);
  }

  function completedModules() {
    return new Set(assessment.responses.map(response => response.moduleId));
  }

  function nextUnansweredModule() {
    const done = completedModules();
    return MODULES.find(module => !done.has(module.id)) || MODULES.at(-1);
  }

  function flowMap(active) {
    const labels = ["全面了解", "形成发现", "技能路线", "项目策划", "执行验证"];
    return `<div class="flow-map">${labels.map((label, index) => `<div class="flow-step ${index === active ? "active" : ""}"><span>${index + 1}</span>${label}</div>`).join("")}</div>`;
  }

  function moduleStrip(activeId) {
    const done = completedModules();
    return `<div class="module-strip">${MODULES.map((module, index) => `<button type="button" class="module-tab ${module.id === activeId ? "active" : ""} ${done.has(module.id) ? "done" : ""}" data-module-tab="${module.id}">${index + 1}. ${escapeHtml(module.title)}</button>`).join("")}</div>`;
  }

  function selectedLabels(response) {
    const module = moduleById(response.moduleId);
    return response.optionIds.map(id => optionById(module, id)?.label).filter(Boolean);
  }

  function responseSummary(response) {
    const labels = selectedLabels(response);
    const observer = OBSERVERS[response.observer] || response.observer;
    const frequency = FREQUENCIES[response.frequency]?.label || "未注明频率";
    const contexts = response.contexts.map(id => CONTEXTS[id] || id).join("、") || "未注明情境";
    return `${observer}｜${frequency}｜${contexts}${labels.length ? `｜${labels.join("；")}` : ""}`;
  }

  function reflectionFor(module, optionIds, example) {
    const selected = optionIds.map(id => optionById(module, id)).filter(Boolean);
    const strengths = selected.filter(item => item.kind === "strength");
    const challenges = selected.filter(item => item.kind === "challenge");
    const resources = selected.filter(item => ["resource", "constraint", "goal"].includes(item.kind));
    if (strengths.length && challenges.length) {
      return `这一主题同时出现优势和困难，说明不能给孩子贴单一标签。更可能是受任务难度、场景、成人参与方式或兴趣程度影响。后续会把这种“情境差异”单独保留。`;
    }
    if (strengths.length) {
      return `这里出现了可继续验证的优势线索，但还不能直接称为稳定天赋。需要看它是否在不同时间、不同任务和较少催促的情况下重复出现，并最终形成真实成果。`;
    }
    if (challenges.length) {
      return `这里记录的是需要支持的行为环节，不是性格缺陷。项目设计会把它改写成可训练、可观察的小动作，而不是简单要求“自觉一点”。`;
    }
    if (resources.length) {
      return `这些资源和限制会直接改变项目的长度、难度和成人分工，系统不会生成脱离家庭现实的计划。`;
    }
    return example ? `这条具体事例会作为后续判断依据。系统不会仅凭选项数量下结论。` : `当前信息仍然有限，建议补充一个真实场景。`;
  }

  function renderHomeV3() {
    const module = moduleById(assessment.activeModuleId);
    const done = completedModules();
    const percent = Math.round(done.size / MODULES.length * 100);
    const history = moduleResponses(module.id);
    const taskCard = state.task ? `<div class="card"><div class="row between"><span class="pill green">已有执行项目</span><button type="button" class="btn ghost small-btn" id="openExistingTaskBtn">进入执行</button></div><h3>${escapeHtml(state.task.title)}</h3><div class="small">旧项目可以继续执行，但新的孩子发现会用于下一轮项目策划。</div></div>` : "";

    el("home").innerHTML = `
      <div class="card assessment-hero">
        <span class="pill glass">结构化访谈 · 不是性格测试</span>
        <h2>用多情境证据理解孩子</h2>
        <div class="small">每个主题都允许多选，并记录频率、情境、观察者和具体事例。相互矛盾的信息不会被抹掉，而会作为重要线索。</div>
        <div class="assessment-progress"><div class="progress"><div class="bar" style="width:${percent}%"></div></div><b>${done.size}/${MODULES.length}</b></div>
      </div>
      ${flowMap(0)}
      <div class="card principle-card"><b>判断原则</b><div class="small">单次表现不是天赋；家长感受不是完整事实；优势和困难可以同时存在；真正重要的是行为是否跨时间、跨情境重复，并能形成成果。</div></div>
      ${taskCard}
      ${moduleStrip(module.id)}
      <div class="question-card">
        <span class="pill purple">主题 ${MODULES.indexOf(module) + 1}/${MODULES.length}</span>
        <h2>${escapeHtml(module.title)}</h2>
        <div class="question-intro"><b>为什么问：</b>${escapeHtml(module.purpose)}<br><b>怎样回答：</b>${escapeHtml(module.prompt)}</div>
        <div class="multi-grid">
          ${module.options.map(option => `<label class="multi-option"><input type="checkbox" name="assessmentSignal" value="${option.id}"><div><b>${escapeHtml(option.label)}</b><span>${escapeHtml(option.detail)}</span></div></label>`).join("")}
        </div>
        <div class="form-two">
          <div class="field"><label>信息来自谁</label><select id="assessmentObserver">${Object.entries(OBSERVERS).map(([value, label]) => `<option value="${value}">${escapeHtml(label)}</option>`).join("")}</select></div>
          <div class="field"><label>大约多久出现一次</label><select id="assessmentFrequency">${Object.entries(FREQUENCIES).map(([value, item]) => `<option value="${value}" ${value === "sometimes" ? "selected" : ""}>${escapeHtml(item.label)}</option>`).join("")}</select></div>
        </div>
        <div class="field"><label>主要出现在哪些情境（可多选）</label><div class="context-grid">${Object.entries(CONTEXTS).map(([value, label]) => `<span class="context-chip"><input type="checkbox" id="ctx_${value}" name="assessmentContext" value="${value}"><label for="ctx_${value}">${escapeHtml(label)}</label></span>`).join("")}</div></div>
        <div class="field"><label>至少写一个具体事例</label><textarea id="assessmentExample" placeholder="例如：上周做数学作业时，他前20分钟自己完成，但遇到应用题后直接喊不会；我只问了‘你卡在哪一步’，他又继续做了10分钟。"></textarea></div>
        <div class="field"><label>补充说明（可选）</label><textarea id="assessmentNote" placeholder="可补充与年龄、身体状态、成人做法或特殊环境有关的信息"></textarea></div>
        <div class="evidence-hint">高质量事例包含：什么时候、在哪里、任务是什么、孩子具体做了什么、成人是否介入、最后结果怎样。没有具体事例时，系统会降低结论置信度。</div>
        <div class="assessment-actions"><button type="button" class="btn" id="saveAssessmentResponseBtn">保存本次观察</button><button type="button" class="btn ghost" id="skipAssessmentModuleBtn">暂时不了解，先跳过</button></div>
      </div>
      ${history.length ? `<div class="section-title">这个主题已有 ${history.length} 条观察</div><div class="answer-history">${history.map((response, index) => `<details><summary>${escapeHtml(responseSummary(response))}</summary><div class="small"><b>事例：</b>${escapeHtml(response.example || "未提供")}${response.note ? `<br><b>补充：</b>${escapeHtml(response.note)}` : ""}</div><button type="button" class="btn ghost small-btn" style="margin-top:8px" data-delete-response="${response.id}">删除这条</button></details>`).join("")}</div>` : ""}
      <div class="grid2"><button type="button" class="btn secondary" id="goNextModuleBtn">进入下一个未完成主题</button><button type="button" class="btn green" id="generateAssessmentReportBtn" ${assessment.responses.length < 3 ? "disabled" : ""}>生成阶段性发现</button></div>
      ${assessment.responses.length ? `<button type="button" class="btn ghost full" style="margin-top:10px" id="resetAssessmentBtn">清空本轮访谈</button>` : ""}`;

    document.querySelectorAll("[data-module-tab]").forEach(button => button.addEventListener("click", () => {
      assessment.activeModuleId = button.dataset.moduleTab;
      saveAssessment();
      renderHome();
    }));
    el("saveAssessmentResponseBtn").onclick = () => saveCurrentResponse(false);
    el("skipAssessmentModuleBtn").onclick = () => saveCurrentResponse(true);
    el("goNextModuleBtn").onclick = () => {
      assessment.activeModuleId = nextUnansweredModule().id;
      saveAssessment();
      renderHome();
    };
    el("generateAssessmentReportBtn").onclick = () => {
      buildReport();
      go("profile");
    };
    el("openExistingTaskBtn")?.addEventListener("click", () => go("workflow"));
    document.querySelectorAll("[data-delete-response]").forEach(button => button.addEventListener("click", () => {
      assessment.responses = assessment.responses.filter(response => response.id !== button.dataset.deleteResponse);
      assessment.report = null;
      saveAssessment();
      renderHome();
    }));
    el("resetAssessmentBtn")?.addEventListener("click", () => {
      if (!confirm("确认清空本轮结构化访谈吗？已有项目和技能证据不会删除。")) return;
      assessment = emptyState();
      saveAssessment();
      renderHome();
    });
  }

  function saveCurrentResponse(skipped) {
    const module = moduleById(assessment.activeModuleId);
    const optionIds = skipped ? [] : [...document.querySelectorAll('input[name="assessmentSignal"]:checked')].map(input => input.value);
    const contexts = skipped ? [] : [...document.querySelectorAll('input[name="assessmentContext"]:checked')].map(input => input.value);
    const example = skipped ? "当前回答者暂时不了解这一主题，需要后续向孩子、老师或其他照料者补充。" : el("assessmentExample").value.trim();
    const note = skipped ? "标记为待补充" : el("assessmentNote").value.trim();
    if (!skipped && !optionIds.length && !example) return alert("至少多选一项行为，或填写一个具体事例。");
    assessment.responses.push({
      id: makeId(),
      moduleId: module.id,
      observer: skipped ? "parent" : el("assessmentObserver").value,
      frequency: skipped ? "rare" : el("assessmentFrequency").value,
      contexts,
      optionIds,
      example,
      note,
      skipped,
      createdAt: new Date().toISOString()
    });
    assessment.report = null;
    const reflection = reflectionFor(module, optionIds, example);
    const currentIndex = MODULES.indexOf(module);
    assessment.activeModuleId = MODULES[currentIndex + 1]?.id || module.id;
    saveAssessment();
    renderHome();
    el("home").insertAdjacentHTML("afterbegin", `<div class="reflection-card"><b>系统如何理解刚才的信息</b><br>${escapeHtml(reflection)}</div>`);
    scrollTo(0, 0);
  }

  function signalRecords() {
    const records = [];
    for (const response of assessment.responses) {
      const module = moduleById(response.moduleId);
      for (const optionId of response.optionIds) {
        const option = optionById(module, optionId);
        if (!option) continue;
        records.push({ response, module, option });
      }
    }
    return records;
  }

  function confidenceFor(evidences) {
    const validExamples = evidences.filter(item => (item.response.example || "").length >= 20);
    const sources = new Set(evidences.map(item => item.response.observer));
    const contexts = new Set(evidences.flatMap(item => item.response.contexts));
    if (validExamples.length >= 2 && (sources.size >= 2 || contexts.size >= 3)) return "较高";
    if (validExamples.length >= 1 && evidences.some(item => FREQUENCIES[item.response.frequency]?.weight >= 3)) return "中等";
    return "初步";
  }

  function evidenceText(record) {
    const source = OBSERVERS[record.response.observer] || record.response.observer;
    const context = record.response.contexts.map(id => CONTEXTS[id] || id).join("、") || "情境未注明";
    const example = record.response.example ? `：${record.response.example}` : "";
    return `${source}在${context}观察到“${record.option.label}”${example}`;
  }

  function detectConflicts(records) {
    const conflicts = [];
    for (const module of MODULES) {
      const moduleRecords = records.filter(record => record.module.id === module.id);
      const hasStrength = moduleRecords.some(record => record.option.kind === "strength");
      const hasChallenge = moduleRecords.some(record => record.option.kind === "challenge");
      if (hasStrength && hasChallenge) {
        conflicts.push(`${module.title}中同时出现优势与困难，说明表现可能随兴趣、任务难度、场景或成人介入方式变化。`);
      }
      const sources = new Set(moduleResponses(module.id).map(response => response.observer));
      if (sources.size >= 2) {
        const sourceResponses = moduleResponses(module.id);
        const signatures = new Set(sourceResponses.map(response => response.optionIds.slice().sort().join("|")));
        if (signatures.size > 1) conflicts.push(`${module.title}在不同观察者之间并不完全一致，需要继续核对孩子在不同场景中的表现。`);
      }
    }
    return unique(conflicts);
  }

  function extractShells(text) {
    const mapping = [
      ["刘慈欣科幻", ["刘慈欣", "科幻", "三体", "宇宙"]],
      ["《基督山伯爵》", ["基督山伯爵", "人物关系"]],
      ["Minecraft", ["minecraft", "我的世界", "搭建", "建造"]],
      ["羽毛球", ["羽毛球", "球拍"]],
      ["家庭做饭", ["做饭", "菜谱", "厨房"]],
      ["故事会", ["故事", "小说", "作文", "讲故事"]],
      ["地理探索", ["地理", "地图", "路线", "旅行"]],
      ["塞尔达探索", ["塞尔达", "王国之泪", "游戏攻略"]]
    ];
    const lower = text.toLowerCase();
    return mapping.filter(([, words]) => words.some(word => lower.includes(word.toLowerCase()))).map(([shell]) => shell);
  }

  function buildReport() {
    const records = signalRecords();
    const traitMap = new Map();
    const skillMap = new Map();

    for (const record of records) {
      const frequency = FREQUENCIES[record.response.frequency]?.weight || 1;
      const contextBonus = Math.min(1.5, record.response.contexts.length * 0.35);
      const exampleBonus = (record.response.example || "").length >= 20 ? 1 : 0;
      const weight = frequency + contextBonus + exampleBonus;

      if (record.option.kind === "strength") {
        for (const trait of record.option.traits || []) {
          if (!traitMap.has(trait)) traitMap.set(trait, { score: 0, evidences: [] });
          const target = traitMap.get(trait);
          target.score += weight;
          target.evidences.push(record);
        }
      }

      if (["challenge", "goal", "constraint"].includes(record.option.kind)) {
        for (const skill of record.option.skills || []) {
          if (!skillMap.has(skill)) skillMap.set(skill, { score: 0, evidences: [] });
          const target = skillMap.get(skill);
          target.score += weight * (record.option.kind === "challenge" ? 1 : 0.55);
          target.evidences.push(record);
        }
      }
    }

    const strengths = [...traitMap.entries()]
      .sort((a, b) => b[1].score - a[1].score)
      .slice(0, 6)
      .map(([name, data]) => ({
        name,
        confidence: confidenceFor(data.evidences),
        evidence: data.evidences.slice(0, 3).map(evidenceText),
        interpretation: "这是值得继续验证的优势线索。只有在不同时间和情境中重复出现，并能形成成果，才可逐步确认其稳定性。"
      }));

    const needs = [...skillMap.entries()]
      .filter(([skill]) => SKILL_META[skill])
      .sort((a, b) => b[1].score - a[1].score)
      .slice(0, 6)
      .map(([skill, data]) => ({
        skill,
        name: SKILL_META[skill][1],
        confidence: confidenceFor(data.evidences),
        evidence: data.evidences.slice(0, 3).map(evidenceText),
        target: SKILL_META[skill][3]
      }));

    if (!strengths.length) {
      strengths.push({
        name: "优势线索仍不足",
        confidence: "待观察",
        evidence: ["现有回答中还没有跨情境、带具体事例的稳定优势行为。"],
        interpretation: "下一轮应优先观察孩子在没有催促时会主动做什么、持续多久、是否愿意形成成果。"
      });
    }

    if (!needs.length) {
      needs.push({
        skill: "反馈与提炼",
        name: "用真实项目继续观察",
        confidence: "待观察",
        evidence: ["当前没有足够重复的困难线索。"],
        target: "通过一个短项目观察启动、规划、持续、检查、收尾和复盘。"
      });
    }

    const facts = assessment.responses
      .filter(response => !response.skipped && ((response.example || "").length >= 10 || response.optionIds.length))
      .slice(-12)
      .map(response => ({
        title: moduleById(response.moduleId).title,
        summary: responseSummary(response),
        example: response.example || "未提供具体事例"
      }));

    const unanswered = MODULES.filter(module => !completedModules().has(module.id)).map(module => `尚未覆盖：${module.title}`);
    const weakEvidence = assessment.responses
      .filter(response => !response.skipped && (response.example || "").length < 20)
      .map(response => `${moduleById(response.moduleId).title}缺少足够具体的行为事例`);
    const skipped = assessment.responses.filter(response => response.skipped).map(response => `${moduleById(response.moduleId).title}仍需向其他观察者补充`);
    const conflicts = detectConflicts(records);

    const coreSkills = unique(needs.map(item => item.skill)).slice(0, 3);
    if (coreSkills.length < 3) {
      ["责任闭环", "任务拆解", "反馈与提炼"].forEach(skill => {
        if (coreSkills.length < 3 && !coreSkills.includes(skill)) coreSkills.push(skill);
      });
    }

    const positiveSkills = unique(records.filter(record => record.option.kind === "strength").flatMap(record => record.option.skills || []));
    const supportSkills = unique([...positiveSkills, "用户意识", "反馈与提炼"])
      .filter(skill => SKILL_META[skill] && !coreSkills.includes(skill))
      .slice(0, 5);
    const maintenanceSkills = unique(["责任闭环", "挫折恢复", "迁移应用"])
      .filter(skill => !coreSkills.includes(skill) && !supportSkills.includes(skill));

    const allText = assessment.responses.map(response => `${selectedLabels(response).join(" ")} ${response.example || ""} ${response.note || ""}`).join(" ");
    const interests = unique([...extractShells(allText), ...(state.child.interests || []).filter(item => SHELLS.includes(item))]);
    const directionScores = Object.entries(PROFESSIONS).map(([name, skills]) => ({
      name,
      score: skills.filter(skill => [...coreSkills, ...supportSkills].includes(skill)).length
    })).sort((a, b) => b.score - a.score);

    assessment.report = {
      generatedAt: new Date().toISOString(),
      responseCount: assessment.responses.length,
      sourceCount: new Set(assessment.responses.map(response => response.observer)).size,
      contextCount: new Set(assessment.responses.flatMap(response => response.contexts)).size,
      moduleCount: completedModules().size,
      facts,
      strengths,
      needs,
      conflicts,
      unknowns: unique([...unanswered, ...skipped, ...weakEvidence]).slice(0, 10),
      coreSkills,
      supportSkills,
      maintenanceSkills,
      interests,
      possibleDirections: directionScores.slice(0, 3).map(item => item.name)
    };

    state.child.focus = needs.slice(0, 3).map(item => ({ name: item.skill, desc: item.target }));
    if (interests.length) state.child.interests = unique([...interests, ...(state.child.interests || [])]);
    save();
    saveAssessment();
    return assessment.report;
  }

  function confidenceClass(value) {
    return value === "较高" ? "high" : value === "中等" ? "medium" : "";
  }

  function renderProfileV3() {
    const report = assessment.report;
    if (!report) {
      el("profile").innerHTML = `${flowMap(1)}<div class="card empty-state"><h2>还没有形成阶段性发现</h2><p>至少保存三条观察后，可以先生成阶段性发现；覆盖更多主题和观察者后，结论会更可靠。</p><button type="button" class="btn" id="backToAssessmentBtn">返回全面了解</button></div>`;
      el("backToAssessmentBtn").onclick = () => go("home");
      return;
    }

    el("profile").innerHTML = `
      ${flowMap(1)}
      <div class="card principle-card"><b>这不是测评结论，而是当前证据下的工作假设</b><div class="small">天赋需要跨时间、跨情境、低催促和真实成果共同验证。矛盾信息不会被平均掉，而会成为下一步追问和项目设计的依据。</div></div>
      <div class="coverage-grid">
        <div class="coverage-item ${report.moduleCount >= 7 ? "good" : "warn"}"><b>${report.moduleCount}/${MODULES.length}</b>主题覆盖</div>
        <div class="coverage-item ${report.sourceCount >= 2 ? "good" : "warn"}"><b>${report.sourceCount}</b>信息来源</div>
        <div class="coverage-item ${report.contextCount >= 3 ? "good" : "warn"}"><b>${report.contextCount}</b>观察情境</div>
        <div class="coverage-item"><b>${report.responseCount}</b>观察记录</div>
      </div>
      <div class="report-section"><div class="section-title">已经明确观察到的事实</div>${report.facts.length ? report.facts.map(item => `<div class="fact-card"><b>${escapeHtml(item.title)}</b><div class="small">${escapeHtml(item.summary)}</div><div class="evidence-line">${escapeHtml(item.example)}</div></div>`).join("") : `<div class="unknown-card">目前缺少带具体事例的事实记录。</div>`}</div>
      <div class="report-section"><div class="section-title">优势与天赋苗头</div>${report.strengths.map(item => `<div class="hypothesis-card"><div class="report-head"><b>${escapeHtml(item.name)}</b><span class="confidence ${confidenceClass(item.confidence)}">${escapeHtml(item.confidence)}</span></div><ul class="evidence-list">${item.evidence.map(value => `<li>${escapeHtml(value)}</li>`).join("")}</ul><div class="small">${escapeHtml(item.interpretation)}</div></div>`).join("")}</div>
      <div class="report-section"><div class="section-title">当前最值得支持的能力</div>${report.needs.map(item => `<div class="need-card"><div class="report-head"><b>${escapeHtml(item.name)}</b><span class="confidence ${confidenceClass(item.confidence)}">${escapeHtml(item.confidence)}</span></div><span class="pill orange" style="margin-top:8px">技能树：${escapeHtml(item.skill)}</span><ul class="evidence-list">${item.evidence.map(value => `<li>${escapeHtml(value)}</li>`).join("")}</ul><div class="small"><b>可训练目标：</b>${escapeHtml(item.target)}</div></div>`).join("")}</div>
      ${report.conflicts.length ? `<div class="report-section"><div class="section-title">矛盾与情境差异</div>${report.conflicts.map(value => `<div class="conflict-card">${escapeHtml(value)}</div>`).join("")}</div>` : ""}
      <div class="report-section"><div class="section-title">仍然不知道什么</div>${report.unknowns.length ? report.unknowns.map(value => `<div class="unknown-card">${escapeHtml(value)}</div>`).join("") : `<div class="unknown-card">核心主题已有初步覆盖，但仍需用项目执行继续验证。</div>`}</div>
      <div class="card"><b>值得继续验证的未来方向</b><div class="row wrap" style="margin-top:10px">${report.possibleDirections.map(value => `<span class="pill blue">${escapeHtml(value)}</span>`).join("")}</div></div>
      <div class="grid2"><button type="button" class="btn secondary" id="continueAssessmentBtn">继续补充证据</button><button type="button" class="btn" id="viewRoadmapBtn">形成技能路线</button></div>`;

    el("continueAssessmentBtn").onclick = () => go("home");
    el("viewRoadmapBtn").onclick = () => go("skills");
  }

  function skillRoadmapItem(skill, index, role) {
    const meta = SKILL_META[skill] || ["综合能力", "成长能力", "未来方向", "通过项目继续验证"];
    return `<div class="roadmap-item"><div class="roadmap-number">${index + 1}</div><div><b>${escapeHtml(skill)}</b><div class="skill-chain">${escapeHtml(meta[0])} → ${escapeHtml(meta[1])} → ${escapeHtml(meta[2])}</div><div class="small">${escapeHtml(role)}：${escapeHtml(meta[3])}</div></div></div>`;
  }

  function renderSkillsV3() {
    const report = assessment.report;
    if (!report) {
      el("skills").innerHTML = `${flowMap(2)}<div class="card empty-state"><h2>技能路线必须建立在观察证据上</h2><button type="button" class="btn" id="skillsBackBtn">先完成结构化访谈</button></div>`;
      el("skillsBackBtn").onclick = () => go("home");
      return;
    }

    el("skills").innerHTML = `
      ${flowMap(2)}
      <div class="card profile-signal"><span class="pill purple">系统自动映射</span><h2>不让家长先猜应该练什么</h2><div class="small">路线由重复困难、半年目标、优势线索和家庭条件共同决定。一次项目只集中补1—3项核心能力。</div></div>
      <div class="roadmap-layer"><span class="pill green">第一层 · 利用优势进入</span><h3>让孩子愿意投入并形成成果</h3>${report.strengths.slice(0, 4).map((item, index) => `<div class="roadmap-item"><div class="roadmap-number">${index + 1}</div><div><b>${escapeHtml(item.name)}</b><div class="small">把这条优势作为项目外壳或表达方式，不把兴趣本身变成额外作业。</div></div></div>`).join("")}</div>
      <div class="roadmap-layer"><span class="pill orange">第二层 · 当前核心补强</span><h3>本轮项目重点观察和训练</h3>${report.coreSkills.map((skill, index) => skillRoadmapItem(skill, index, "核心训练")).join("")}</div>
      <div class="roadmap-layer"><span class="pill blue">第三层 · 重要支撑</span><h3>在项目中自然发生</h3>${report.supportSkills.map((skill, index) => skillRoadmapItem(skill, index, "重要支撑")).join("")}</div>
      <div class="roadmap-layer"><span class="pill gray">第四层 · 长期维护</span><h3>每个项目都检查的底层能力</h3>${report.maintenanceSkills.map((skill, index) => skillRoadmapItem(skill, index, "基础维护")).join("")}</div>
      <button type="button" class="btn full" id="planProjectsBtn">根据路线策划项目</button>`;
    el("planProjectsBtn").onclick = () => go("generator");
  }

  function resetGeneratorScaffold() {
    el("generator").innerHTML = `
      <div class="card profile-signal" id="profileSignal"></div>
      <div class="field"><label>选择孩子熟悉的项目外壳</label><div id="shellTags" class="row wrap"></div></div>
      <div class="field"><label>核心补强能力（最多3项）</label><div id="skillTags" class="row wrap"></div></div>
      <div class="field"><label>真实使用者</label><input id="realUser" value="家人"></div>
      <div class="field"><label>当前真实问题</label><textarea id="realProblem"></textarea></div>
      <div class="field"><label>每天可用时间</label><select id="availableTime"><option value="20">约20分钟</option><option value="35" selected>约35分钟</option><option value="60">约60分钟</option></select></div>
      <button class="btn full" type="button" onclick="generateTask()">生成完整工作流</button>
      <div id="generatedTask"></div>`;
  }

  function recommendationShells(report) {
    return unique([...report.interests, ...(state.child.interests || []).filter(item => SHELLS.includes(item)), "刘慈欣科幻", "Minecraft", "故事会"]).filter(item => TEMPLATES[item]).slice(0, 3);
  }

  function recommendations(report) {
    return recommendationShells(report).map((shell, index) => {
      const template = TEMPLATES[shell];
      const need = report.needs[index % report.needs.length];
      const strength = report.strengths[index % report.strengths.length];
      const skills = unique([...report.coreSkills.slice(0, 2), ...template.support]).slice(0, 3);
      return {
        shell,
        title: template.title,
        purpose: template.purpose,
        strength: strength?.name || "已有兴趣资源",
        need: need?.name || "真实任务执行",
        target: need?.target || "通过项目继续观察",
        skills,
        realUser: index === 0 ? "家人" : index === 1 ? "妹妹、同学或朋友" : "一个真实使用者",
        problem: `利用“${strength?.name || shell}”作为进入点，通过真实成果重点训练“${need?.skill || report.coreSkills[0]}”，并观察孩子能否减少提醒、形成方法和完成收尾。`,
        availableTime: index === 0 ? 35 : 25
      };
    });
  }

  function renderGeneratorV3() {
    resetGeneratorScaffold();
    legacyRenderGenerator();
    const report = assessment.report;
    const section = el("generator");
    if (!report) {
      section.insertAdjacentHTML("afterbegin", `${flowMap(3)}<div class="card empty-state"><h2>项目不能脱离孩子发现直接生成</h2><button type="button" class="btn" id="projectBackBtn">返回全面了解</button></div>`);
      el("projectBackBtn").onclick = () => go("home");
      [...section.children].forEach(node => {
        if (!node.classList.contains("flow-map") && !node.classList.contains("empty-state")) node.style.display = "none";
      });
      return;
    }

    const fields = [el("shellTags")?.closest(".field"), el("skillTags")?.closest(".field"), el("realUser")?.closest(".field"), el("realProblem")?.closest(".field"), el("availableTime")?.closest(".field")].filter(Boolean);
    const manualButton = [...section.querySelectorAll(":scope > button")].find(button => button.getAttribute("onclick") === "generateTask()");
    fields.forEach(node => node.style.display = "none");
    if (manualButton) manualButton.style.display = "none";

    el("profileSignal").innerHTML = `<span class="pill purple">由观察证据自动推荐</span><h3>家长不需要先决定技能</h3><div class="small">推荐同时考虑优势线索、主要支持需求、家庭资源、时间限制和真实使用者。选择项目后仍可在高级调整中修改。</div>`;
    const recs = recommendations(report);
    let container = document.createElement("div");
    container.id = "projectRecommendationsV3";
    const bridgeAnchor = el("plusActionCard") || el("aiControlCard") || el("profileSignal");
    bridgeAnchor.insertAdjacentElement("afterend", container);
    container.innerHTML = `${flowMap(3)}<div class="section-title">建议先比较，而不是立刻决定</div>${recs.map((rec, index) => `<div class="recommendation-card ${index === 0 ? "recommended" : ""}"><div class="row between"><span class="pill ${index === 0 ? "green" : "blue"}">${index === 0 ? "优先推荐" : `备选 ${index}`}</span><span class="small">${escapeHtml(rec.shell)}</span></div><h2>${escapeHtml(rec.title)}</h2><div class="small">${escapeHtml(rec.purpose)}</div><div class="reason-row"><b>利用优势：</b>${escapeHtml(rec.strength)}</div><div class="reason-row"><b>重点支持：</b>${escapeHtml(rec.need)}——${escapeHtml(rec.target)}</div><div class="reason-row"><b>本轮核心技能：</b>${rec.skills.map(escapeHtml).join("、")}</div><button type="button" class="btn ${index === 0 ? "green" : "secondary"} full" data-use-project="${index}">用这个项目生成方案</button></div>`).join("")}<button type="button" class="btn ghost full" id="toggleAdvancedV3Btn">高级调整</button><div class="advanced-panel" id="advancedV3Panel"></div>`;

    const advanced = el("advancedV3Panel");
    [...fields, manualButton].filter(Boolean).forEach(node => {
      node.style.display = "";
      advanced.appendChild(node);
    });
    el("toggleAdvancedV3Btn").onclick = () => advanced.classList.toggle("open");
    document.querySelectorAll("[data-use-project]").forEach(button => button.addEventListener("click", () => {
      const rec = recs[Number(button.dataset.useProject)];
      chosenShell = rec.shell;
      chosenSkills = [...rec.skills];
      assessment.selectedRecommendation = rec;
      saveAssessment();
      el("realUser").value = rec.realUser;
      el("realProblem").value = rec.problem;
      el("availableTime").value = String(rec.availableTime);
      generateTask();
    }));
  }

  function renderWorkflowV3() {
    legacyRenderWorkflow();
    const report = assessment.report;
    const section = el("workflow");
    let card = el("assessmentExperimentCard");
    if (!card) {
      card = document.createElement("div");
      card.id = "assessmentExperimentCard";
      card.className = "card profile-signal";
      section.insertBefore(card, section.firstChild);
    }
    card.innerHTML = `${flowMap(4)}<b>项目是验证假设的实验</b><div class="small">重点记录：孩子在哪些情境表现更好、成人介入多少、卡点发生在哪一环、是否能自行恢复、能否检查收尾。${report ? `本轮重点能力：${report.coreSkills.map(escapeHtml).join("、")}。` : ""}</div>`;
    let button = el("openEvidenceReviewBtn");
    if (!button) {
      button = document.createElement("button");
      button.id = "openEvidenceReviewBtn";
      button.type = "button";
      button.className = "btn secondary full";
      button.style.marginTop = "10px";
      button.textContent = "完成后提交证据与复盘";
      section.appendChild(button);
    }
    button.onclick = () => go("review");
  }

  go = function goV3(page) {
    document.querySelectorAll(".page").forEach(node => node.classList.remove("active"));
    el(page).classList.add("active");
    document.querySelectorAll("nav button").forEach(node => node.classList.toggle("active", node.dataset.page === page));
    const titles = {
      home: ["全面了解", "多选行为观察，而不是单选性格测试"],
      profile: ["阶段性发现", "事实、假设、困难、矛盾和未知分开呈现"],
      skills: ["未来技能路线", "由证据自动确定培养优先级"],
      generator: ["项目策划", "利用优势进入，用真实项目补关键能力"],
      workflow: ["执行验证", "结果反过来修正孩子画像"],
      review: ["证据与复盘", "用事实判断能力是否真的变化"]
    }[page];
    el("pageTitle").textContent = titles[0];
    el("pageSub").textContent = titles[1];
    ({ home: renderHome, profile: renderProfile, skills: renderSkills, generator: renderGenerator, workflow: renderWorkflow, review: renderReview }[page])();
    scrollTo(0, 0);
  };

  renderHome = renderHomeV3;
  renderProfile = renderProfileV3;
  renderSkills = renderSkillsV3;
  renderGenerator = renderGeneratorV3;
  renderWorkflow = renderWorkflowV3;

  window.addEventListener("DOMContentLoaded", () => renderHome());
})();
