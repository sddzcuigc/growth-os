(() => {
  const FAMILY_KEY = "growthOSFamilyV1";
  const LEGACY_STATE_KEY = "growthOS";
  const ASSESSMENT_KEY = "growthOSDiscoveryV3";

  const now = () => new Date().toISOString();
  const clone = value => JSON.parse(JSON.stringify(value));

  function response(moduleId, optionIds, example, contexts = ["home"], frequency = "sometimes", note = "来自既有双孩计划样例，仍需用真实事例继续核对") {
    return {
      id: `seed_${moduleId}_${Math.random().toString(36).slice(2, 8)}`,
      moduleId,
      observer: "parent",
      frequency,
      contexts,
      optionIds,
      example,
      note,
      skipped: false,
      createdAt: now()
    };
  }

  function sampleAssessment(responses) {
    return {
      version: 3,
      activeModuleId: "motivation",
      responses,
      report: null,
      selectedRecommendation: null,
      updatedAt: now(),
      seededSample: true
    };
  }

  function brotherSample() {
    return {
      id: "brother",
      relation: "哥哥",
      birth: "2017年4月",
      color: "#5b67f1",
      sampleSummary: "兴趣驱动、知识面广；阅读输入较强，责任闭环、总结迁移和书写输出需要重点验证与培养。",
      state: {
        version: 2.2,
        child: {
          name: "哥哥",
          age: "9岁 · 暑假后四年级",
          birth: "2017年4月",
          interests: ["刘慈欣科幻", "故事", "地理", "漫画经济学", "Minecraft", "羽毛球"],
          focus: [
            { name: "责任闭环", desc: "从提醒走向主动检查、收尾和补救" },
            { name: "反馈与提炼", desc: "把阅读和经历转成总结、方法与迁移" },
            { name: "中文书写", desc: "提升书写速度、清晰度和真实输出能力" },
            { name: "数据分析", desc: "用运动与任务记录提升体能和自我观察" }
          ],
          resources: ["刘慈欣科幻与漫画版《三体》", "故事、地理与漫画经济学读物", "电脑与键盘", "Minecraft", "羽毛球器材", "爷爷奶奶日常提醒", "父母周末技术与复盘支持"],
          sampleSummary: "兴趣驱动、知识面广；阅读相对较强，但总结迁移、中文书写速度、英文书写整洁度和责任收尾仍需持续观察。"
        },
        task: null,
        reviews: [],
        seededSample: true
      },
      assessment: sampleAssessment([
        response("motivation", ["deep_focus", "question_research"], "既有资料显示，他对刘慈欣科幻、故事、地理、漫画经济学、Minecraft和羽毛球有明显兴趣，属于兴趣驱动型；目前仍缺少一次完整的具体行为记录。", ["interest", "alone"], "often"),
        response("learning", ["self_search", "familiar_only"], "既有计划把阅读视为相对优势，同时把总结、提炼和迁移列为重点，说明输入与把方法带到新场景之间可能存在差距。", ["school", "home"], "often"),
        response("execution", ["finish_no_check", "adult_takeover"], "既有双孩计划把执行闭环、责任和收尾列为哥哥的核心培养目标；家长也曾担心作业晚、想直接帮助完成，因此需要同时观察孩子环节和成人介入。", ["home", "school"], "often"),
        response("expression", ["oral_story", "avoid_writing"], "既有资料显示他偏故事驱动、阅读面较广，但中文书写速度慢、英文书写较乱。口头表达优势与文字输出困难需要分别验证。", ["home", "school"], "sometimes"),
        response("body", ["enjoys_movement", "posture_issue"], "已有羽毛球资源和每天运动安排，同时长期关注坐姿、驼背与体能发展。", ["interest", "home"], "sometimes"),
        response("environment", ["stable_time", "elder_support", "materials_devices", "schoolwork_pressure"], "家庭有书、电脑、游戏与运动资源；爷爷奶奶负责日常看卡、提醒一次、打勾和拍照，父母主要在周末处理技术、复杂项目与复盘；现实限制是平日作业多、时间碎。", ["home"], "stable"),
        response("goals", ["goal_autonomy", "goal_learning", "goal_expression", "goal_body", "goal_ai"], "暑假与半年目标重点包括元认知、执行闭环、表达、责任、体能和数字工具能力。", ["home"], "stable")
      ]),
      updatedAt: now()
    };
  }

  function sisterSample() {
    return {
      id: "sister",
      relation: "妹妹",
      birth: "2020年3月",
      color: "#ec6f91",
      sampleSummary: "理解与执行相对较强；当前重点不是过早定方向，而是扩大体验，发现稳定兴趣，发展主动性、创造表达和身体能力。",
      state: {
        version: 2.2,
        child: {
          name: "妹妹",
          age: "6岁 · 暑假后一年级",
          birth: "2020年3月",
          interests: ["亲子阅读", "创造表达", "运动游戏", "键盘探索", "待发现的新兴趣"],
          focus: [
            { name: "责任闭环", desc: "从简单生活责任中形成主动开始和归位" },
            { name: "用户意识", desc: "通过画、讲、做和分享发展创造表达" },
            { name: "挫折恢复", desc: "在多种体验中敢尝试、能暂停并继续" },
            { name: "数据分析", desc: "用简单记录支持身体发展和生活节律" }
          ],
          resources: ["亲子阅读材料", "纸笔与手工材料", "电脑键盘", "户外与运动器材", "爷爷奶奶日常陪伴", "父母晚间阅读和周末项目支持"],
          sampleSummary: "已有资料认为她理解与执行相对较强；兴趣方向尚不应过早确定，需要通过阅读、创作、运动和真实小任务持续发现。"
        },
        task: null,
        reviews: [],
        seededSample: true
      },
      assessment: sampleAssessment([
        response("motivation", ["no_stable_interest"], "既有双孩计划把“发现兴趣”列为妹妹的重要目标，说明当前不应把某个方向当成已确认天赋，需要扩大体验并记录她会主动重复什么。", ["home", "interest"], "sometimes"),
        response("learning", ["hands_on"], "既有资料将她概括为理解与执行相对较强，并安排阅读、基础书写、语言数感、键盘和项目步骤；具体更偏口头、视觉还是动手学习仍需补充事例。", ["home"], "sometimes"),
        response("execution", ["starts_independently", "closes_loop"], "计划为她设置每天一个项目步骤和一个生活责任，并强调睡眠、归位和简单执行。已有资料认为执行相对较强，但仍需区分独立完成和成人提醒后的完成。", ["home"], "sometimes"),
        response("expression", ["draw_build"], "已有计划把创造表达列为重点，适合通过画、做、讲、角色游戏和简单数字创作寻找自然表达通道；这目前是探索方向，不是已确认优势。", ["home", "interest"], "sometimes"),
        response("body", ["enjoys_movement"], "暑假计划为她安排每天约60分钟运动，并把身体发展列为核心目标；仍需记录她最主动参与的运动和持续时间。", ["home", "interest"], "often"),
        response("environment", ["stable_time", "elder_support", "materials_devices", "schoolwork_pressure"], "家庭由爷爷奶奶负责日常秩序和一次提醒，父母负责晚间亲子阅读与周末复杂项目；可使用书、纸笔、电脑键盘和运动资源。", ["home"], "stable"),
        response("goals", ["goal_autonomy", "goal_expression", "goal_body", "goal_talent"], "妹妹的阶段目标是主动性、发现兴趣、创造表达、身体发展，以及从简单生活责任中形成稳定习惯。", ["home"], "stable")
      ]),
      updatedAt: now()
    };
  }

  function createFamily() {
    const brother = brotherSample();
    const sister = sisterSample();
    return {
      version: 1,
      activeChildId: "brother",
      lastLoadedChildId: "brother",
      children: { brother, sister },
      createdAt: now(),
      updatedAt: now()
    };
  }

  function parse(key) {
    try { return JSON.parse(localStorage.getItem(key) || "null"); } catch { return null; }
  }

  function loadFamily() {
    const saved = parse(FAMILY_KEY);
    if (!saved?.children?.brother || !saved?.children?.sister) return createFamily();
    return saved;
  }

  function saveFamily(family) {
    family.updatedAt = now();
    localStorage.setItem(FAMILY_KEY, JSON.stringify(family));
  }

  function syncLegacyIntoActive(family) {
    const activeId = family.lastLoadedChildId || family.activeChildId;
    const child = family.children[activeId];
    if (!child) return;
    const legacyState = parse(LEGACY_STATE_KEY);
    const legacyAssessment = parse(ASSESSMENT_KEY);
    if (legacyState) child.state = legacyState;
    if (legacyAssessment) child.assessment = legacyAssessment;
    child.updatedAt = now();
  }

  function activate(family, childId) {
    const child = family.children[childId];
    if (!child) return;
    family.activeChildId = childId;
    family.lastLoadedChildId = childId;
    localStorage.setItem(LEGACY_STATE_KEY, JSON.stringify(child.state));
    localStorage.setItem(ASSESSMENT_KEY, JSON.stringify(child.assessment));
    saveFamily(family);
  }

  let family = loadFamily();
  syncLegacyIntoActive(family);
  activate(family, family.activeChildId || "brother");

  window.GrowthFamily = {
    key: FAMILY_KEY,
    load() {
      family = loadFamily();
      return clone(family);
    },
    getActiveId() {
      return family.activeChildId;
    },
    getActiveChild() {
      return clone(family.children[family.activeChildId]);
    },
    syncCurrent() {
      const child = family.children[family.activeChildId];
      if (!child) return;
      const legacyState = parse(LEGACY_STATE_KEY);
      const legacyAssessment = parse(ASSESSMENT_KEY);
      if (legacyState) child.state = legacyState;
      if (legacyAssessment) child.assessment = legacyAssessment;
      child.updatedAt = now();
      saveFamily(family);
    },
    switchTo(childId) {
      this.syncCurrent();
      activate(family, childId);
      location.reload();
    },
    resetSamples() {
      family = createFamily();
      activate(family, "brother");
      location.reload();
    },
    exportFamily() {
      this.syncCurrent();
      return clone(family);
    }
  };
})();
