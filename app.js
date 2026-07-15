const children = {
  brother: {
    name: "哥哥",
    shortAge: "9岁3个月",
    avatar: "boy",
    level: 12,
    xp: 860,
    xpMax: 1200,
    gems: 1280,
    hearts: 7,
    playerType: "故事世界探索者",
    motto: "我喜欢有世界、有角色、有规则的事情。我的升级方向，是把兴趣变成能展示的作品。",
    selfWords: [
      "我不是只能被催着做事的人，我可以学会自己检查。",
      "我遇到不会时容易停住，所以任务要先拆小。",
      "我喜欢阅读和游戏世界，可以把它们变成作品。"
    ],
    psychology: [
      { title: "执行功能", text: "把事情拆小、按顺序做、最后检查。它像大脑里的任务背包。" },
      { title: "元认知", text: "知道自己哪里会、哪里不会，然后换一种办法。" },
      { title: "兴趣转化", text: "喜欢一件事后，给它加目标、限制和成果，它就会变成能力。" }
    ],
    traits: [
      { name: "故事感", score: 86, I: "我容易被人物、冲突和世界观吸引。", grow: "把读过的内容讲成地图、人物卡或小作品。" },
      { name: "知识好奇", score: 78, I: "我愿意读很多不同主题的书。", grow: "每周只挑一个点讲清楚，不把阅读变考试。" },
      { name: "深潜兴趣", score: 74, I: "我感兴趣时能玩很久、看很久。", grow: "给兴趣加一个小目标，让它留下成果。" },
      { name: "任务闭环", score: 40, I: "我容易忘物品、忘步骤、忘收尾。", grow: "每次只练一个闭环：准备、执行、检查、归位。" },
      { name: "困难切换", score: 42, I: "我遇到不会的题，容易卡住不动。", grow: "学会三招：跳过、求助、换方法。" }
    ],
    skills: [
      { id: "self-regulation", icon: "🎒", name: "自我调节", level: 2, progress: 38, next: "准备、执行、检查、归位", science: "执行功能 / 自我调节" },
      { id: "metacognition", icon: "🧠", name: "会学会想", level: 2, progress: 35, next: "卡住时跳过、求助、换方法", science: "元认知 / 自主学习" },
      { id: "communication", icon: "📖", name: "表达沟通", level: 4, progress: 70, next: "讲清角色目标、困难和选择", science: "语言组织 / 多模态表达" },
      { id: "data-reasoning", icon: "🧮", name: "数据推理", level: 3, progress: 55, next: "用表格做资源预算和比较", science: "数学 / 数据素养" },
      { id: "ai-literacy", icon: "🤖", name: "AI协作", level: 2, progress: 36, next: "先自己想，再让AI查漏", science: "AI素养 / 人机协作" },
      { id: "creation", icon: "🧱", name: "创造项目", level: 3, progress: 56, next: "把 Minecraft 变成作品", science: "项目学习 / 设计思维" },
      { id: "ethics-collaboration", icon: "🤝", name: "判断协作", level: 2, progress: 42, next: "说明AI帮了什么、自己决定了什么", science: "伦理判断 / 协作" },
      { id: "wellbeing", icon: "🏃", name: "身心底座", level: 2, progress: 42, next: "睡眠、姿态、核心和呼吸", science: "身心状态 / 学习准备度" }
    ],
    quests: [
      {
        id: "bag-check",
        title: "明天不慌背包术",
        type: "生活",
        skill: "self-regulation",
        minutes: 8,
        energy: "low",
        tags: ["整理", "闭环", "低压"],
        why: "你容易忘物品。这个任务练的是自己检查，不是让别人一直提醒。",
        steps: ["全部拿出来", "分成作业/书/杂物", "明天要用的放前面", "拍照确认"],
        reflect: "我自己发现少了什么吗？",
        reward: 22
      },
      {
        id: "story-four",
        title: "人物四格卡",
        type: "阅读",
        skill: "communication",
        minutes: 12,
        energy: "normal",
        tags: ["阅读", "表达", "故事"],
        why: "你喜欢故事。四格卡能把喜欢读，升级成会表达。",
        steps: ["选一个人物", "写他想要什么", "写遇到什么困难", "写他做了什么选择"],
        reflect: "我能不能用自己的话讲出来？",
        reward: 30
      },
      {
        id: "stuck-three",
        title: "卡住三招训练",
        type: "学习",
        skill: "metacognition",
        minutes: 10,
        energy: "normal",
        tags: ["困难", "方法", "学习"],
        why: "你遇到不会容易停住。今天只练怎么不卡死。",
        steps: ["找一道卡住的题", "先跳过 2 分钟", "写一个求助问题", "换一种方法再试"],
        reflect: "我用了跳过、求助、换方法中的哪一招？",
        reward: 28
      },
      {
        id: "minecraft-wall",
        title: "村庄防御小图纸",
        type: "项目",
        skill: "creation",
        minutes: 20,
        energy: "high",
        tags: ["Minecraft", "设计", "游戏"],
        why: "你喜欢游戏里的战斗。先设计防御，战斗就变成项目能力。",
        steps: ["画城墙位置", "标出门和照明", "估算材料", "写一个测试规则"],
        reflect: "我的设计解决了哪个问题？",
        reward: 42
      },
      {
        id: "typing-save",
        title: "书摘打字存档",
        type: "工具",
        skill: "ai-literacy",
        minutes: 15,
        energy: "normal",
        tags: ["打字", "文件", "阅读"],
        why: "未来很多作品都要靠打字和文件管理。先从自己喜欢的书摘开始。",
        steps: ["选 80-120 字", "打出来", "改错别字", "保存成清楚的文件名"],
        reflect: "我的文件名别人看得懂吗？",
        reward: 26
      },
      {
        id: "core-balance",
        title: "姿态能量条",
        type: "身体",
        skill: "wellbeing",
        minutes: 8,
        energy: "low",
        tags: ["运动", "姿态", "低压"],
        why: "身体舒服，大脑才更容易专注。今天练一点点就够。",
        steps: ["平板支撑 20 秒", "靠墙站 1 分钟", "单脚站各 30 秒", "深呼吸 5 次"],
        reflect: "做完后身体更松还是更累？",
        reward: 18
      },
      {
        id: "fact-check-duel",
        title: "AI真假侦探",
        type: "实验",
        skill: "ai-literacy",
        minutes: 12,
        energy: "normal",
        tags: ["AI", "核验", "判断"],
        why: "你会读很多知识。今天练习不急着相信AI，而是找证据核对。",
        steps: ["问AI一个熟悉的问题", "圈出一句可核对的话", "找书或可靠网页验证", "给答案盖可信或存疑章"],
        reflect: "哪条证据让我改变了判断？",
        reward: 34
      },
      {
        id: "teach-back-minute",
        title: "一分钟小老师",
        type: "讲解",
        skill: "communication",
        minutes: 8,
        energy: "low",
        tags: ["口述", "教别人", "低压"],
        why: "把刚懂的内容讲给别人听，能看见自己真正懂了多少。",
        steps: ["选一个刚学会的点", "不用看书讲一分钟", "请对方问一个问题", "补上没讲清的一句"],
        reflect: "哪一句最难讲清楚？",
        reward: 24
      },
      {
        id: "family-route",
        title: "家庭路线设计师",
        type: "户外",
        skill: "data-reasoning",
        minutes: 18,
        energy: "high",
        tags: ["地图", "比较", "户外"],
        why: "你喜欢地图和规则。比较两条真实路线，会把空间感变成推理。",
        steps: ["选一个附近目的地", "画两条可走路线", "比较时间和红绿灯", "说出推荐哪条及理由"],
        reflect: "我的选择依据是什么？",
        reward: 38
      },
      {
        id: "team-role-card",
        title: "合作角色卡",
        type: "协作",
        skill: "ethics-collaboration",
        minutes: 10,
        energy: "normal",
        tags: ["分工", "协作", "选择"],
        why: "合作不是一起忙，而是每个人知道自己负责什么。",
        steps: ["选一个两人小任务", "各自选一个角色", "说清完成标准", "结束后互相感谢一个贡献"],
        reflect: "我的角色帮团队解决了什么？",
        reward: 28
      }
    ]
  },
  sister: {
    name: "妹妹",
    shortAge: "6岁4个月",
    avatar: "girl",
    level: 10,
    xp: 640,
    xpMax: 1000,
    gems: 1160,
    hearts: 8,
    playerType: "小小创造指挥官",
    motto: "我能把事情做完，也要学会自己选择、自己提问、自己创造。",
    selfWords: [
      "我做得快，不代表我必须做更多。",
      "我可以选择自己想做的作品。",
      "不完美也可以展示，因为作品会越做越好。"
    ],
    psychology: [
      { title: "自主感", text: "自己选择任务，大脑会更愿意投入。" },
      { title: "成长型思维", text: "做不好不是失败，而是知道下一次怎么变好。" },
      { title: "创造表达", text: "把想法画出来、搭出来、讲出来，才会看见自己的兴趣。" }
    ],
    traits: [
      { name: "完成力", score: 88, I: "我接到任务后通常能完成。", grow: "完成后说说我自己的办法，而不是只等表扬。" },
      { name: "表达清楚", score: 82, I: "我能把一件事讲明白。", grow: "给作品讲 3 句话：名字、做法、最喜欢哪里。" },
      { name: "数感空间", score: 78, I: "我对分类、数量和变化比较敏感。", grow: "用商店、搭建和观察来玩数学。" },
      { name: "主动选择", score: 54, I: "我还在找真正喜欢的方向。", grow: "每天从几个任务里自己选一个。" },
      { name: "允许不完美", score: 58, I: "我有时会怕做得不好。", grow: "先完成一个小版本，再升级。" }
    ],
    skills: [
      { id: "self-regulation", icon: "🎒", name: "自我调节", level: 3, progress: 76, next: "完成后说出自己的办法", science: "执行功能 / 自我调节" },
      { id: "metacognition", icon: "🧠", name: "会学会想", level: 2, progress: 52, next: "说出哪里顺、哪里要换方法", science: "元认知 / 自主学习" },
      { id: "communication", icon: "📚", name: "表达沟通", level: 3, progress: 66, next: "讲清开始、变化、结尾", science: "语言组织 / 多模态表达" },
      { id: "data-reasoning", icon: "🧮", name: "数据推理", level: 3, progress: 68, next: "用商店、分类和找零玩数学", science: "数学 / 数据素养" },
      { id: "ai-literacy", icon: "🤖", name: "AI协作", level: 1, progress: 30, next: "让AI问问题，不让AI代做", science: "AI素养 / 人机协作" },
      { id: "creation", icon: "🎨", name: "创造项目", level: 3, progress: 62, next: "给作品命名并讲3句", science: "项目学习 / 设计思维" },
      { id: "ethics-collaboration", icon: "🤝", name: "判断协作", level: 2, progress: 50, next: "说出我想自己做哪一步", science: "伦理判断 / 协作" },
      { id: "wellbeing", icon: "🤸", name: "身心底座", level: 2, progress: 56, next: "跑跳、平衡、抛接", science: "身心状态 / 学习准备度" }
    ],
    quests: [
      {
        id: "choose-art",
        title: "三选一作品",
        type: "创造",
        skill: "metacognition",
        minutes: 18,
        energy: "normal",
        tags: ["选择", "作品", "创造"],
        why: "你很会完成任务。今天练的是先自己选择。",
        steps: ["从画画/搭建/故事选一个", "做一个小作品", "给它取名字", "讲最喜欢哪里"],
        reflect: "这是我自己选的吗？",
        reward: 32
      },
      {
        id: "tiny-shop",
        title: "小商店找零",
        type: "数学",
        skill: "data-reasoning",
        minutes: 15,
        energy: "normal",
        tags: ["数学", "分类", "游戏"],
        why: "你的数感不错。商店游戏能让数学变成真实规则。",
        steps: ["选 5 个物品", "写价格", "让家人买 2 个", "算一算一共多少"],
        reflect: "我用了数数、凑十还是心算？",
        reward: 30
      },
      {
        id: "story-three",
        title: "三句话故事",
        type: "表达",
        skill: "communication",
        minutes: 8,
        energy: "low",
        tags: ["故事", "表达", "低压"],
        why: "你表达清楚。三句话能让故事更有顺序。",
        steps: ["一句开始", "一句发生了什么", "一句最后怎样"],
        reflect: "别人听完知道发生了什么吗？",
        reward: 20
      },
      {
        id: "balance-game",
        title: "平衡小挑战",
        type: "身体",
        skill: "wellbeing",
        minutes: 10,
        energy: "high",
        tags: ["运动", "协调", "游戏"],
        why: "跑跳和平衡会帮你以后学羽毛球。",
        steps: ["单脚站", "跳格子", "抛接球", "自己选一个加难动作"],
        reflect: "哪个动作最稳？哪个还要练？",
        reward: 24
      },
      {
        id: "weather-draw",
        title: "天气观察画",
        type: "科学",
        skill: "creation",
        minutes: 12,
        energy: "low",
        tags: ["观察", "画画", "科学"],
        why: "你可以用画来发现变化。观察是科学的第一步。",
        steps: ["看天空", "画云或阳光", "写今天热/凉/有风", "说一个变化"],
        reflect: "我发现了什么变化？",
        reward: 22
      },
      {
        id: "first-version",
        title: "先做小版本",
        type: "心态",
        skill: "metacognition",
        minutes: 10,
        energy: "normal",
        tags: ["勇气", "作品", "方法"],
        why: "你不用一开始就做完美。先做小版本，才有升级机会。",
        steps: ["选一个小任务", "只做第一版", "圈出一个满意点", "说下次升级哪里"],
        reflect: "我敢不敢展示第一版？",
        reward: 26
      },
      {
        id: "morning-sequence",
        title: "晨间三步棋",
        type: "生活",
        skill: "self-regulation",
        minutes: 8,
        energy: "low",
        tags: ["顺序", "自主", "低压"],
        why: "你很会完成事情。今天把三个早晨动作排成自己的顺序。",
        steps: ["选三个早晨动作", "画成三张小卡", "自己排顺序", "试一次并换掉不顺的一步"],
        reflect: "哪个顺序让我最省心？",
        reward: 20
      },
      {
        id: "question-ladder",
        title: "AI问题阶梯",
        type: "AI",
        skill: "ai-literacy",
        minutes: 10,
        energy: "normal",
        tags: ["AI", "提问", "比较"],
        why: "AI回答好不好，常常取决于我们会不会把问题说清楚。",
        steps: ["问AI一个简单问题", "加上对象和目标再问", "比较两次答案", "选出更有用的一句"],
        reflect: "我加了什么信息后答案变好了？",
        reward: 26
      },
      {
        id: "nature-sort-hunt",
        title: "自然分类寻宝",
        type: "观察",
        skill: "data-reasoning",
        minutes: 12,
        energy: "high",
        tags: ["户外", "分类", "观察"],
        why: "你对分类和数量很敏感，可以在真实世界里发现自己的规则。",
        steps: ["找到六个安全小物", "想一种分类办法", "再换一种分类办法", "说哪种规则更好用"],
        reflect: "同样的东西为什么能分成两种？",
        reward: 28
      },
      {
        id: "helper-choice",
        title: "家庭小队分工",
        type: "协作",
        skill: "ethics-collaboration",
        minutes: 10,
        energy: "normal",
        tags: ["家庭", "分工", "自主"],
        why: "你可以练习自己选择贡献，而不是只等别人分配。",
        steps: ["找一件两人能做的事", "说出自己想负责哪步", "一起完成", "交换说一句对方帮了什么"],
        reflect: "我选的那一步真的有帮助吗？",
        reward: 24
      }
    ]
  }
};

const taskExperienceProfiles = {
  "bag-check": { mode: "organize", setting: "home", output: "photo", interaction: "solo" },
  "story-four": { mode: "story", setting: "book", output: "card", interaction: "solo" },
  "stuck-three": { mode: "strategy", setting: "desk", output: "question", interaction: "solo" },
  "minecraft-wall": { mode: "design", setting: "game", output: "blueprint", interaction: "solo" },
  "typing-save": { mode: "digital", setting: "computer", output: "file", interaction: "solo" },
  "core-balance": { mode: "movement", setting: "floor", output: "body-signal", interaction: "solo" },
  "fact-check-duel": { mode: "experiment", setting: "computer", output: "verdict", interaction: "ai" },
  "teach-back-minute": { mode: "teach", setting: "family", output: "audio", interaction: "partner" },
  "family-route": { mode: "explore", setting: "outdoor", output: "map", interaction: "family" },
  "team-role-card": { mode: "collaborate", setting: "home", output: "role-card", interaction: "partner" },
  "choose-art": { mode: "choose", setting: "craft", output: "artifact", interaction: "solo" },
  "tiny-shop": { mode: "roleplay", setting: "home", output: "calculation", interaction: "family" },
  "story-three": { mode: "story", setting: "family", output: "audio", interaction: "partner" },
  "balance-game": { mode: "movement", setting: "floor", output: "challenge-record", interaction: "solo" },
  "weather-draw": { mode: "observe", setting: "outdoor", output: "drawing", interaction: "solo" },
  "first-version": { mode: "iterate", setting: "craft", output: "prototype", interaction: "solo" },
  "morning-sequence": { mode: "organize", setting: "home", output: "sequence-card", interaction: "solo" },
  "question-ladder": { mode: "experiment", setting: "computer", output: "comparison", interaction: "ai" },
  "nature-sort-hunt": { mode: "explore", setting: "outdoor", output: "classification", interaction: "solo" },
  "helper-choice": { mode: "collaborate", setting: "home", output: "shared-result", interaction: "family" }
};

const experienceLabels = {
  mode: {
    organize: "整理",
    story: "讲故事",
    strategy: "解难题",
    design: "设计",
    digital: "数字工具",
    movement: "身体挑战",
    experiment: "做实验",
    teach: "教别人",
    explore: "去探索",
    collaborate: "合作",
    choose: "自主选择",
    roleplay: "角色扮演",
    observe: "观察",
    iterate: "迭代"
  },
  setting: {
    home: "家里",
    book: "书中",
    desk: "书桌",
    game: "游戏世界",
    computer: "电脑前",
    floor: "活动区",
    family: "家人旁",
    outdoor: "户外",
    craft: "创作区"
  },
  output: {
    photo: "照片",
    card: "卡片",
    question: "好问题",
    blueprint: "图纸",
    file: "文件",
    "body-signal": "身体感受",
    verdict: "核验结论",
    audio: "口述",
    map: "地图",
    "role-card": "角色卡",
    artifact: "作品",
    calculation: "计算结果",
    "challenge-record": "挑战记录",
    drawing: "观察画",
    prototype: "第一版",
    "sequence-card": "顺序卡",
    comparison: "对比结果",
    classification: "分类规则",
    "shared-result": "共同成果"
  },
  interaction: {
    solo: "自己完成",
    ai: "和AI核对",
    partner: "两人互动",
    family: "家庭互动"
  }
};

const pageNames = {
  profile: "今日",
  discover: "灵感",
  skills: "能力",
  plan: "计划",
  execute: "记录"
};

const gemStoreItems = [
  { id: "classic", name: "原野营地", cost: 0, note: "默认像素营地" },
  { id: "forest", name: "森林营地", cost: 18, note: "完成大约6个小任务可解锁" },
  { id: "sunset", name: "落日营地", cost: 30, note: "暖色边框与任务高光" }
];

const energyLabels = {
  low: "低能量",
  normal: "普通能量",
  high: "高能量"
};

const evidenceSources = {
  UNESCO_STUDENT_AI: "UNESCO学生AI能力框架",
  WEF_FUTURE_JOBS: "WEF未来工作技能",
  EEF_META: "EEF元认知与自我调节",
  HPL2: "How People Learn II",
  HARVARD_EF: "哈佛执行功能",
  WWC_STUDY: "WWC学习策略证据"
};

const skillFramework = {
  "self-regulation": {
    name: "自我调节",
    childMeaning: "我能开始、坚持、检查和收尾。",
    futureWhy: "AI时代任务更开放，能自我管理的人更能把想法变成结果。",
    trainWith: ["准备清单", "一步一步做", "完成后自己检查"],
    evidence: ["HARVARD_EF", "EEF_META", "HPL2"]
  },
  metacognition: {
    name: "会学会想",
    childMeaning: "我知道自己哪里会、哪里不会，还会换办法。",
    futureWhy: "AI会给答案，但人要判断自己是否理解、是否需要换策略。",
    trainWith: ["说出卡点", "换一种办法", "复盘哪一步有效"],
    evidence: ["EEF_META", "WWC_STUDY", "HPL2"]
  },
  communication: {
    name: "表达沟通",
    childMeaning: "我能把想法、问题和作品讲清楚。",
    futureWhy: "人要向AI表达目标，也要向他人解释判断和成果。",
    trainWith: ["三句话讲清", "人物四格卡", "作品展示"],
    evidence: ["UNESCO_STUDENT_AI", "WEF_FUTURE_JOBS", "HPL2"]
  },
  "data-reasoning": {
    name: "数据推理",
    childMeaning: "我会比较、分类、记录和发现规律。",
    futureWhy: "AI和未来工作都离不开数据、模式、验证和数学感。",
    trainWith: ["生活表格", "资源预算", "分类和找零"],
    evidence: ["WEF_FUTURE_JOBS", "UNESCO_STUDENT_AI", "WWC_STUDY"]
  },
  "ai-literacy": {
    name: "AI协作",
    childMeaning: "我会让AI提问、提示、检查，但不替我完成。",
    futureWhy: "关键不是会点AI，而是会定义问题、验证输出、保留人的决定。",
    trainWith: ["先自己想", "AI查漏", "说明AI帮了什么"],
    evidence: ["UNESCO_STUDENT_AI", "WEF_FUTURE_JOBS"]
  },
  creation: {
    name: "创造项目",
    childMeaning: "我能把兴趣变成作品，并不断改进。",
    futureWhy: "AI降低生成成本，人的价值更在提出问题、设计作品和迭代。",
    trainWith: ["小版本", "真实作品", "展示和迭代"],
    evidence: ["UNESCO_STUDENT_AI", "HPL2", "WEF_FUTURE_JOBS"]
  },
  "ethics-collaboration": {
    name: "判断协作",
    childMeaning: "我会判断是否公平、可靠，也会和别人分工。",
    futureWhy: "AI输出需要伦理、责任、来源和团队协作来把关。",
    trainWith: ["角色分工", "来源说明", "公平检查"],
    evidence: ["UNESCO_STUDENT_AI", "WEF_FUTURE_JOBS"]
  },
  wellbeing: {
    name: "身心底座",
    childMeaning: "我照顾身体和情绪，让大脑更容易学习。",
    futureWhy: "睡眠、运动和情绪会影响注意、执行功能和长期学习。",
    trainWith: ["短运动", "呼吸放松", "睡眠和姿态记录"],
    evidence: ["HARVARD_EF", "HPL2"]
  }
};

const trainingPrinciples = [
  { id: "one-main-task", name: "一次一个主任务", childTip: "先赢一小局。", evidence: ["HPL2"] },
  { id: "ask-before-recommend", name: "先问再推荐", childTip: "任务要适合今天的我。", evidence: ["HPL2", "EEF_META"] },
  { id: "scaffold", name: "脚手架", childTip: "先给提示，再慢慢自己做。", evidence: ["EEF_META", "HARVARD_EF"] },
  { id: "retrieval-explain", name: "主动回忆和解释", childTip: "说出来，才知道会不会。", evidence: ["WWC_STUDY"] },
  { id: "reflection", name: "复盘迁移", childTip: "想想哪一步有用，下次再用。", evidence: ["EEF_META"] },
  { id: "desirable-difficulty", name: "刚好挑战", childTip: "有一点难，但能完成。", evidence: ["WWC_STUDY", "HPL2"] }
];

const skillNameToId = {
  自我调节: "self-regulation",
  会学会想: "metacognition",
  元认知: "metacognition",
  表达沟通: "communication",
  数据推理: "data-reasoning",
  AI协作: "ai-literacy",
  ai协作: "ai-literacy",
  AI素养: "ai-literacy",
  创造项目: "creation",
  判断协作: "ethics-collaboration",
  身心底座: "wellbeing"
};

const coachQuestions = [
  {
    id: "energy",
    title: "今天你的能量像哪一种？",
    hint: "AI先知道你的状态，再决定任务大小。",
    answers: [
      { label: "有点累", value: "low", tags: ["低压"] },
      { label: "还可以", value: "normal", tags: [] },
      { label: "很有劲", value: "high", tags: ["挑战"] }
    ]
  },
  {
    id: "interest",
    title: "今天你更想碰哪类事？",
    hint: "不是考试，先从愿意开始的地方进门。",
    answers: [
      { label: "读故事", value: "阅读", tags: ["阅读", "故事"] },
      { label: "做作品", value: "作品", tags: ["作品", "创造", "设计"] },
      { label: "动一动", value: "运动", tags: ["运动", "协调"] },
      { label: "整理一下", value: "整理", tags: ["整理", "闭环"] },
      { label: "电脑工具", value: "工具", tags: ["打字", "文件"] }
    ]
  },
  {
    id: "friction",
    title: "你最容易在哪一步卡住？",
    hint: "说出卡点，就能选对升级方法。",
    answers: [
      { label: "不想开始", value: "start", skill: "self-regulation", tags: ["低压"] },
      { label: "遇难停住", value: "stuck", skill: "metacognition", tags: ["困难", "方法"] },
      { label: "容易忘", value: "forget", skill: "self-regulation", tags: ["整理", "闭环"] },
      { label: "怕做不好", value: "perfect", skill: "metacognition", tags: ["勇气"] },
      { label: "没卡住", value: "none", tags: [] }
    ]
  },
  {
    id: "time",
    title: "你现在愿意投入多久？",
    hint: "时间越真实，推荐越不容易压垮你。",
    answers: [
      { label: "8分钟", value: 8 },
      { label: "12分钟", value: 12 },
      { label: "15分钟", value: 15 },
      { label: "20分钟", value: 20 }
    ]
  }
];

const contextQuestions = [
  {
    id: "current-interest",
    title: "最近什么最容易让你忘记时间？",
    why: "先从真实兴趣出发，任务才不会像额外作业。",
    options: ["读故事和知识", "搭建和动手", "画画和设计", "观察和探索"]
  },
  {
    id: "growth-wish",
    title: "接下来你最想让哪件事变容易？",
    why: "这会成为第一条成长方向，以后随时可以修改。",
    options: ["更容易开始做完", "更会学习思考", "更敢表达分享", "做出自己的作品"]
  },
  {
    id: "preferred-output",
    title: "你最喜欢把想法变成什么？",
    why: "决定任务用讲、画、搭建、打字还是表格来做。",
    options: ["讲出来", "画出来", "搭出来", "打出来"]
  },
  {
    id: "ai-help-style",
    title: "你希望AI怎么帮你？",
    why: "AI应该提问、解释、检查，不能直接替你完成。",
    options: ["问我问题", "给我提示", "帮我检查", "解释方法"]
  },
  {
    id: "best-focus-time",
    title: "你什么时候最容易专心？",
    why: "推荐任务要顺着真实能量，而不是硬安排。",
    options: ["早上", "下午", "晚上", "不固定"]
  },
  {
    id: "recent-pride",
    title: "最近哪件事让你有点骄傲？",
    why: "找到有效成功经验，比只看短板更重要。",
    options: ["读懂了", "做完了", "讲清了", "帮到别人"]
  },
  {
    id: "challenge-edge",
    title: "任务多难你最愿意试？",
    why: "最有效的训练通常在刚好有一点挑战的位置。",
    options: ["很轻松", "有点挑战", "难一点也行", "今天别太难"]
  },
  {
    id: "collab-boundary",
    title: "合作时你想负责哪一步？",
    why: "协作要有真实角色，不能只让一个人指挥或执行。",
    options: ["想点子", "找资料", "动手做", "检查展示"]
  }
];

const onboardingQuestionIds = ["current-interest", "growth-wish", "preferred-output", "ai-help-style", "personal-friction", "success-picture"];

const state = {
  childId: localStorage.getItem("talent-os-child") || "brother",
  page: localStorage.getItem("talent-os-page") || "profile",
  aiLoading: false,
  aiError: "",
  planLoading: false,
  modelStatus: { connected: false, model: "GLM-5.2", provider: "SiliconFlow", newsAvailable: false },
  account: null,
  profiles: [],
  cloudMemories: [],
  metrics: { activeDays: 0, recommendations: 0, completed: 0, reflections: 0, acceptanceRate: 0, fullLoops: 0 },
  journals: [],
  hypotheses: [],
  strategyInsights: [],
  strategyLoading: false,
  selfCoachAnswers: [],
  selfCoachQuestion: "",
  selfCoachLoading: false,
  goals: [],
  goalText: "",
  goalDraft: null,
  goalLoading: false,
  ideas: [],
  ideaLoadingId: null,
  ideaResurfacing: null,
  ideaResurfacingLoading: false,
  actions: [],
  actionLoadingId: null,
  decisionCalibration: { sampleSize: 0, reasonCounts: {}, activeSignals: [], preferShort: false, preferLowEnergy: false, preferClearStep: false, preferImportant: false },
  habits: [],
  focusSession: null,
  focusSummary: { weekSeconds: 0, completedSessions: 0, recent: [] },
  focusTimer: null,
  focusRescueOpen: false,
  focusRescue: null,
  focusRescueLoading: false,
  reviews: [],
  reviewLoading: false,
  familyBrief: null,
  familyBriefLoading: false,
  taskFeedback: [],
  feedbackCalibration: { sampleSize: 0, difficulty: { tooEasy: 0, justRight: 0, tooHard: 0 }, pace: "observe", preferredSupport: "unknown", preferredModes: [], avoidModes: [], motivationCounts: {}, preferredMotivators: [], motivationEvidence: 0 },
  artifacts: [],
  artifactMode: "text",
  artifactSaving: false,
  artifactRevision: null,
  dailyPlan: null,
  dailyCheckin: { energy: "", minutes: 0, intent: "" },
  dailyPlanLoading: false,
  dailySwapOpen: false,
  dailyPlanFeedback: [],
  dailyRecommendationCalibration: { sampleSize: 0, reasonCounts: {}, activeSignals: [], preferTiny: false, preferClear: false, avoidedSourceTypes: [] },
  showPlanningDetails: false,
  showQuestCoach: false,
  actionInboxResult: null,
  actionInboxLoading: false,
  actionInboxText: "",
  actionNegotiation: null,
  captureShareWithAi: true,
  journalMode: "hybrid",
  journalPrompt: null,
  journalLoading: false,
  journalDraft: "",
  journalTags: "",
  journalShareWithAi: true,
  onboardingLoading: false,
  onboardingError: "",
  onboardingQuestionLoading: false,
  syncTimer: null
};

if (!children[state.childId]) state.childId = "brother";
if (!pageNames[state.page]) state.page = "profile";

const content = document.querySelector("#app-content");
const tabs = document.querySelectorAll(".tab");
const childSwitcher = document.querySelector("#child-switcher");
const gemCount = document.querySelector(".gem-button span:nth-child(2)");
const levelFace = document.querySelector("#level-face");
const levelValue = document.querySelector("#level-value");
const levelHearts = document.querySelector("#level-hearts");
const xpBar = document.querySelector("#xp-bar");
const xpNumber = document.querySelector("#xp-number");
const settingsOverlay = document.querySelector("#settings-overlay");
const settingsContent = document.querySelector("#settings-content");
const pixelToast = document.querySelector("#pixel-toast");
const authOverlay = document.querySelector("#auth-overlay");
const recoveryCodeOverlay = document.querySelector("#recovery-code-overlay");
const recoveryCodeValue = document.querySelector("#recovery-code-value");
const profileOverlay = document.querySelector("#profile-overlay");
const insightsOverlay = document.querySelector("#insights-overlay");
const insightsContent = document.querySelector("#insights-content");
const focusOverlay = document.querySelector("#focus-overlay");
const focusTitle = document.querySelector("#focus-title");
const focusClock = document.querySelector("#focus-clock");
const focusProgress = document.querySelector("#focus-progress");
const focusMessage = document.querySelector("#focus-message");
const focusRescuePanel = document.querySelector("#focus-rescue");
const tutorialOverlay = document.querySelector("#tutorial-overlay");
const tutorialProgress = document.querySelector("#tutorial-progress");
const tutorialVisual = document.querySelector("#tutorial-visual");
const tutorialKicker = document.querySelector("#tutorial-kicker");
const tutorialTitle = document.querySelector("#tutorial-title");
const tutorialCopy = document.querySelector("#tutorial-copy");
let tutorialStep = 0;

function showRecoveryCode(code) {
  if (!recoveryCodeOverlay || !recoveryCodeValue) return;
  recoveryCodeValue.textContent = String(code || "");
  recoveryCodeOverlay.hidden = false;
}

const tutorialSteps = [
  { icon: "face", kicker: "第一步 · 这是你的冒险", title: "先选对自己的角色", copy: "哥哥和妹妹有各自独立的任务、技能树和成长记录，切换角色不会混在一起。" },
  { icon: "question", kicker: "第二步 · 告诉AI今天的状态", title: "回答几个很短的问题", copy: "没有标准答案。按今天真实的精力、兴趣和时间回答，AI才会给你不同的任务。" },
  { icon: "quest", kicker: "第三步 · 只做眼前这一关", title: "AI每次推荐一个下一步", copy: "觉得合适就开始；不喜欢可以点“换一个”，系统会记住，下次少推荐相似任务。" },
  { icon: "gem", kicker: "第四步 · 看得见的成长", title: "完成任务会获得经验和宝石", copy: "经验会真实累计并升级。任务结束后告诉AI哪里有趣、哪里太难，推荐会越来越像你。" },
  { icon: "map", kicker: "第五步 · 你在决定路线", title: "路线不是固定课程表", copy: "技能树、计划、日程和新消息会一起影响任务。现在去回答第一个问题吧。" }
];

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function child() {
  return children[state.childId];
}

function todayKey() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

function localDateKey(value) {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) return todayKey();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

function storageKey(name) {
  return `talent-os-${state.childId}-${name}`;
}

function readJson(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) || fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
  queueCloudSync();
}

function currentProfile() {
  return state.profiles.find((profile) => profile.id === state.childId) || null;
}

function collectProfileSnapshot() {
  const prefix = storageKey("");
  const data = {};
  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index);
    if (key?.startsWith(prefix)) data[key.slice(prefix.length)] = readJson(key, localStorage.getItem(key));
  }
  return data;
}

function queueCloudSync(memory = null) {
  if (!state.account || !currentProfile()) return;
  clearTimeout(state.syncTimer);
  state.syncTimer = setTimeout(() => saveProgressToCloud(memory), 500);
}

async function saveProgressToCloud(memory = null) {
  if (!currentProfile()) return;
  try {
    await fetch("/api/progress", { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify({ profileId: state.childId, data: collectProfileSnapshot(), memory }) });
  } catch { showToast("云端暂时离线，进度已保存在本机"); }
}

function trackEvent(eventName, properties = {}) {
  if (!state.account || !currentProfile()) return;
  fetch("/api/events", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ profileId: state.childId, eventName, properties }) }).catch(() => {});
}

function aiEligibleMemories(memories) {
  return memories.filter((memory) => memory.evidence?.shareWithAi !== false);
}

function aiEligibleJournals(journals) {
  return journals.filter((entry) => entry.shareWithAi === true);
}

function aiEligibleHypotheses(hypotheses) {
  return hypotheses.filter((item) => item.aiContext === true && item.status === "active" && Number(item.confidence) >= 35);
}

async function loadMetrics() {
  if (!currentProfile()) return;
  try {
    const response = await fetch(`/api/metrics?profileId=${encodeURIComponent(state.childId)}`);
    if (response.ok) state.metrics = await response.json();
  } catch {}
}

async function loadJournals() {
  if (!currentProfile()) return;
  try {
    const response = await fetch(`/api/journal?profileId=${encodeURIComponent(state.childId)}`);
    if (response.ok) state.journals = (await response.json()).entries || [];
  } catch {}
}

async function loadHypotheses() {
  if (!currentProfile()) return;
  try {
    const response = await fetch(`/api/hypotheses?profileId=${encodeURIComponent(state.childId)}`);
    if (response.ok) state.hypotheses = (await response.json()).hypotheses || [];
  } catch {}
}

async function loadStrategyInsights() {
  if (!currentProfile()) return;
  try {
    const response = await fetch(`/api/strategy-insights?profileId=${encodeURIComponent(state.childId)}`);
    if (response.ok) state.strategyInsights = (await response.json()).insights || [];
  } catch {}
}

async function loadSelfCoach() {
  if (!currentProfile()) return;
  try {
    const response = await fetch(`/api/self-coach?profileId=${encodeURIComponent(state.childId)}`);
    if (response.ok) state.selfCoachAnswers = (await response.json()).answers || [];
  } catch {}
}

async function generateStrategyInsights() {
  if (state.strategyLoading) return;
  state.strategyLoading = true;
  if (!insightsOverlay.hidden) insightsContent.innerHTML = renderInsightsPanel();
  try {
    const response = await fetch("/api/strategy-insights/generate", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ profileId: state.childId }) });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "暂时无法整理说明书");
    state.strategyInsights = result.insights || [];
    showToast(result.provider === "siliconflow" ? "GLM整理了新的个人策略" : "已根据现有证据整理策略");
  } catch (error) { showToast(error.message || "暂时无法整理说明书"); }
  finally { state.strategyLoading = false; if (!insightsOverlay.hidden) insightsContent.innerHTML = renderInsightsPanel(); }
}

async function sendStrategyFeedback(id, feedback) {
  try {
    const response = await fetch(`/api/strategy-insights/${encodeURIComponent(id)}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ feedback }) });
    const insight = await response.json();
    if (!response.ok) throw new Error("feedback");
    state.strategyInsights = state.strategyInsights.map((item) => item.id === insight.id ? insight : item);
    insightsContent.innerHTML = renderInsightsPanel();
    showToast(feedback === "not_for_me" ? "已移出AI参考，这条方法不适合我" : feedback === "unsure" ? "先保留观察，不急着确定" : "记住了：这条方法对我有帮助");
  } catch { showToast("暂时无法保存策略反馈"); }
}

async function loadIdeas() {
  if (!currentProfile()) return;
  try {
    const response = await fetch(`/api/ideas?profileId=${encodeURIComponent(state.childId)}`);
    if (response.ok) state.ideas = (await response.json()).ideas || [];
  } catch {}
}

async function loadFamilyBrief() {
  if (!currentProfile()) return;
  try {
    const response = await fetch(`/api/family-brief?profileId=${encodeURIComponent(state.childId)}`);
    if (response.ok) state.familyBrief = (await response.json()).familyBrief || null;
  } catch {}
}

async function loadDailyPlanFeedback() {
  if (!currentProfile()) return;
  try {
    const response = await fetch(`/api/daily-plan-feedback?profileId=${encodeURIComponent(state.childId)}`);
    if (response.ok) {
      const result = await response.json();
      state.dailyPlanFeedback = result.feedback || [];
      state.dailyRecommendationCalibration = result.calibration || state.dailyRecommendationCalibration;
    }
  } catch {}
}

async function loadIdeaResurfacing() {
  if (!currentProfile()) return;
  try {
    const response = await fetch(`/api/idea-resurfacing?profileId=${encodeURIComponent(state.childId)}`);
    if (response.ok) state.ideaResurfacing = (await response.json()).resurfacing || null;
  } catch {}
}

async function loadGoals() {
  if (!currentProfile()) return;
  try {
    const response = await fetch(`/api/goals?profileId=${encodeURIComponent(state.childId)}`);
    if (response.ok) state.goals = (await response.json()).goals || [];
  } catch {}
}

async function loadActions() {
  if (!currentProfile()) return;
  try {
    const response = await fetch(`/api/actions?profileId=${encodeURIComponent(state.childId)}`);
    if (response.ok) {
      const result = await response.json();
      state.actions = result.actions || [];
      state.decisionCalibration = result.decisionCalibration || state.decisionCalibration;
    }
  } catch {}
}

async function loadHabits() {
  if (!currentProfile()) return;
  try {
    const response = await fetch(`/api/habits?profileId=${encodeURIComponent(state.childId)}`);
    if (response.ok) state.habits = (await response.json()).habits || [];
  } catch {}
}

async function loadFocus() {
  if (!currentProfile()) return;
  try {
    const response = await fetch(`/api/focus?profileId=${encodeURIComponent(state.childId)}`);
    if (!response.ok) return;
    const result = await response.json();
    state.focusSession = result.active;
    state.focusSummary = result.summary || state.focusSummary;
    renderFocusOverlay();
  } catch {}
}

async function loadReviews() {
  if (!currentProfile()) return;
  try {
    const response = await fetch(`/api/reviews?profileId=${encodeURIComponent(state.childId)}`);
    if (response.ok) state.reviews = (await response.json()).reviews || [];
  } catch {}
}

async function loadTaskFeedback() {
  if (!currentProfile()) return;
  try {
    const response = await fetch(`/api/task-feedback?profileId=${encodeURIComponent(state.childId)}`);
    if (!response.ok) return;
    const result = await response.json();
    state.taskFeedback = result.entries || [];
    state.feedbackCalibration = result.calibration || state.feedbackCalibration;
  } catch {}
}

async function loadArtifacts() {
  if (!currentProfile()) return;
  try {
    const response = await fetch(`/api/artifacts?profileId=${encodeURIComponent(state.childId)}`);
    if (response.ok) state.artifacts = (await response.json()).artifacts || [];
  } catch {}
}

async function loadDailyPlan() {
  if (!currentProfile()) return;
  try {
    const response = await fetch(`/api/daily-plan?profileId=${encodeURIComponent(state.childId)}`);
    if (response.ok) state.dailyPlan = (await response.json()).dailyPlan || null;
  } catch {}
}

async function generateWeeklyReview() {
  if (state.reviewLoading) return;
  state.reviewLoading = true;
  if (!insightsOverlay.hidden) insightsContent.innerHTML = renderInsightsPanel();
  try {
    const response = await fetch("/api/reviews/generate", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ profileId: state.childId }) });
    const review = await response.json();
    if (!response.ok) throw new Error(review.error || "review");
    state.reviews = [review, ...state.reviews.filter((item) => item.id !== review.id)];
    showToast("本周成长罗盘已经生成");
  } catch { showToast("暂时无法生成成长罗盘"); }
  finally { state.reviewLoading = false; if (!insightsOverlay.hidden) insightsContent.innerHTML = renderInsightsPanel(); }
}

async function sendReviewFeedback(id, feedback) {
  try {
    const response = await fetch(`/api/reviews/${encodeURIComponent(id)}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ feedback }) });
    const review = await response.json();
    if (!response.ok) throw new Error("feedback");
    state.reviews = state.reviews.map((item) => item.id === review.id ? review : item);
    if (feedback === "try_focus") {
      setGrowthPlan({ weeklyGoal: review.report.nextFocus.title, focusSkill: getGrowthPlan().focusSkill || "creation", constraints: review.report.nextFocus.tinyExperiment, rationale: review.report.nextFocus.why, milestones: [{ title: review.report.nextFocus.tinyExperiment, when: "本周", skill: getGrowthPlan().focusSkill || "creation", success: "完成一个看得见的小实验" }] });
      clearAiCoachResult();
      showToast("下周重点已加入成长计划");
    } else showToast(feedback === "not_me" ? "已记录：这份总结有点不像我" : "谢谢确认，系统会保留这份证据");
    insightsContent.innerHTML = renderInsightsPanel();
  } catch { showToast("暂时无法保存周报反馈"); }
}

async function generateFamilyBrief() {
  if (state.familyBriefLoading) return;
  state.familyBriefLoading = true;
  if (!insightsOverlay.hidden) insightsContent.innerHTML = renderInsightsPanel();
  try {
    const response = await fetch("/api/family-brief/generate", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ profileId: state.childId }) });
    const brief = await response.json();
    if (!response.ok) throw new Error(brief.error || "暂时无法生成家庭简报");
    state.familyBrief = brief;
    showToast(brief.provider === "siliconflow" ? "GLM整理好了家庭简报草稿" : "家庭简报草稿已经整理好");
  } catch (error) { showToast(error.message || "暂时无法生成家庭简报"); }
  finally { state.familyBriefLoading = false; if (!insightsOverlay.hidden) insightsContent.innerHTML = renderInsightsPanel(); }
}

async function updateFamilyBrief(status) {
  if (!state.familyBrief) return;
  try {
    const response = await fetch(`/api/family-brief/${encodeURIComponent(state.familyBrief.id)}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ status }) });
    const brief = await response.json();
    if (!response.ok) throw new Error(brief.error || "状态更新失败");
    state.familyBrief = brief;
    if (!insightsOverlay.hidden) insightsContent.innerHTML = renderInsightsPanel();
    if (!settingsOverlay.hidden) settingsContent.innerHTML = renderSettingsPanel();
    showToast(status === "shared" ? "已经同意给家长看，可以随时收回" : "已经收回，家长设置中不再显示");
  } catch (error) { showToast(error.message || "暂时无法更新分享状态"); }
}

async function deleteFamilyBrief() {
  if (!state.familyBrief) return;
  try {
    const response = await fetch(`/api/family-brief/${encodeURIComponent(state.familyBrief.id)}`, { method: "DELETE" });
    if (!response.ok) throw new Error("delete");
    state.familyBrief = null;
    if (!insightsOverlay.hidden) insightsContent.innerHTML = renderInsightsPanel();
    if (!settingsOverlay.hidden) settingsContent.innerHTML = renderSettingsPanel();
    showToast("家庭简报草稿已经删除");
  } catch { showToast("暂时无法删除家庭简报"); }
}

function focusRemaining() {
  const session = state.focusSession;
  if (!session) return 0;
  if (session.status === "paused") return Math.max(0, Number(session.remainingSeconds || 0));
  const sinceLoad = Math.max(0, Math.floor((Date.now() - Number(session.clientLoadedAt || Date.now())) / 1000));
  return Math.max(0, Number(session.remainingSeconds || 0) - sinceLoad);
}

function renderFocusOverlay() {
  const session = state.focusSession;
  if (!focusOverlay) return;
  if (!session || !["active", "paused"].includes(session.status)) {
    focusOverlay.hidden = true;
    state.focusRescueOpen = false; state.focusRescue = null; state.focusRescueLoading = false;
    clearInterval(state.focusTimer); state.focusTimer = null;
    return;
  }
  focusOverlay.hidden = false;
  focusTitle.textContent = session.title;
  const remaining = focusRemaining();
  const minutes = String(Math.floor(remaining / 60)).padStart(2, "0");
  const seconds = String(remaining % 60).padStart(2, "0");
  focusClock.textContent = `${minutes}:${seconds}`;
  focusProgress.style.width = `${Math.min(100, Math.round(((session.plannedSeconds - remaining) / session.plannedSeconds) * 100))}%`;
  focusMessage.textContent = session.status === "paused" ? "已经暂停。准备好时再继续。" : remaining === 0 ? "计划时间到了，可以结束，也可以继续。" : "不用着急，做一个小步骤就好。";
  const pauseButton = focusOverlay.querySelector("[data-action='toggle-focus-pause']");
  if (pauseButton) pauseButton.textContent = session.status === "paused" ? "继续" : "暂停";
  const stuckButton = focusOverlay.querySelector("[data-action='open-focus-rescue']");
  if (stuckButton) stuckButton.hidden = state.focusRescueOpen;
  focusOverlay.querySelector(".focus-dialog")?.classList.toggle("rescue-open", state.focusRescueOpen);
  if (focusRescuePanel) {
    focusRescuePanel.hidden = !state.focusRescueOpen;
    if (state.focusRescueOpen) {
      focusRescuePanel.innerHTML = state.focusRescueLoading ? `<strong>AI正在把这一步变小...</strong><div class="thinking-dots"><span></span><span></span><span></span></div>` : state.focusRescue ? `<small>${state.focusRescue.response.provider === "siliconflow" ? "GLM卡点救援" : "本地卡点救援"}</small><p>${escapeHtml(state.focusRescue.response.message)}</p><div class="rescue-tiny-step"><small>现在只试这一步</small><strong>${escapeHtml(state.focusRescue.response.tinyStep)}</strong></div><blockquote>${escapeHtml(state.focusRescue.response.support)}</blockquote><div class="rescue-outcomes"><button type="button" data-action="apply-focus-rescue" data-outcome="try_step">先试这一步</button><button type="button" data-action="apply-focus-rescue" data-outcome="five_minutes">只试5分钟</button><button type="button" data-action="apply-focus-rescue" data-outcome="pause_today">今天先停</button></div>` : `<strong>现在卡在哪里？</strong><div class="rescue-reasons"><button type="button" data-action="request-focus-rescue" data-reason="cannot_start">不知道第一步</button><button type="button" data-action="request-focus-rescue" data-reason="too_hard">感觉太难</button><button type="button" data-action="request-focus-rescue" data-reason="low_energy">现在没力气</button><button type="button" data-action="request-focus-rescue" data-reason="missing_things">缺少东西</button></div><button class="rescue-back" type="button" data-action="close-focus-rescue">先回去继续</button>`;
    }
  }
  if (!state.focusTimer) state.focusTimer = setInterval(renderFocusOverlay, 1000);
}

async function requestFocusRescue(reason) {
  const session = state.focusSession;
  if (!session?.actionId || state.focusRescueLoading) return;
  if (session.status === "active") await changeFocus("pause");
  state.focusRescueLoading = true; renderFocusOverlay();
  try {
    const response = await fetch(`/api/actions/${encodeURIComponent(session.actionId)}/rescue`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ reason }) });
    const rescue = await response.json();
    if (!response.ok) throw new Error(rescue.error || "rescue");
    state.focusRescue = rescue;
  } catch { showToast("AI暂时没回应，先暂停一下也可以"); }
  finally { state.focusRescueLoading = false; renderFocusOverlay(); }
}

async function applyFocusRescue(outcome) {
  if (!state.focusRescue) return;
  try {
    const response = await fetch(`/api/action-rescues/${encodeURIComponent(state.focusRescue.id)}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ outcome }) });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "outcome");
    if (result.action) state.actions = state.actions.map((item) => item.id === result.action.id ? result.action : item);
    if (result.focus) state.focusSession = { ...result.focus, clientLoadedAt: Date.now() };
    state.focusRescue = null; state.focusRescueOpen = false;
    if (outcome === "pause_today") { await changeFocus("cancel"); showToast("今天先停，不需要责怪自己"); return; }
    if (outcome === "try_step") await loadCloudProgress(state.childId);
    if (state.focusSession?.status === "paused") await changeFocus("resume"); else renderFocusOverlay();
    showToast(outcome === "five_minutes" ? "计时已经缩到最多再试5分钟" : "小步骤已写回行动卡");
  } catch { showToast("暂时无法保存这次选择"); }
}

async function closeFocusRescue() {
  state.focusRescueOpen = false; state.focusRescue = null; renderFocusOverlay();
  if (state.focusSession?.status === "paused") await changeFocus("resume");
}

async function startFocus(action) {
  const plannedMinutes = Number(document.querySelector("#focus-minutes")?.value || Math.min(20, action.estimateMinutes || 10));
  try {
    const response = await fetch("/api/focus", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ profileId: state.childId, actionId: action.id, title: action.title, plannedMinutes }) });
    const session = await response.json();
    if (!response.ok) throw new Error(session.error || "start");
    state.focusSession = { ...session, clientLoadedAt: Date.now() };
    renderFocusOverlay();
  } catch { showToast("暂时无法开始专注"); }
}

async function changeFocus(command, completeAction = false) {
  const session = state.focusSession;
  if (!session) return;
  try {
    const response = await fetch(`/api/focus/${encodeURIComponent(session.id)}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ command, outcome: completeAction ? "action_done" : command === "cancel" ? "left_early" : "focus_only" }) });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "focus");
    state.focusSummary = result.summary || state.focusSummary;
    state.focusSession = ["active", "paused"].includes(result.session?.status) ? { ...result.session, clientLoadedAt: Date.now() } : null;
    renderFocusOverlay();
    if (completeAction && session.actionId) await updateAction(session.actionId, "done");
    else { showToast(command === "cancel" ? "这次先停在这里，也算了解了自己的状态" : "专注记录已保存"); render(); }
  } catch { showToast("暂时无法更新专注状态"); }
}

async function createHabitFromForm() {
  const title = document.querySelector("#habit-title")?.value.trim() || "";
  if (!title) { showToast("先写下想保持的小行动"); return; }
  const payload = { profileId: state.childId, title, cue: document.querySelector("#habit-cue")?.value.trim() || "", targetMinutes: Number(document.querySelector("#habit-minutes")?.value || 5), frequency: { mode: document.querySelector("#habit-frequency")?.value || "daily" } };
  try {
    const response = await fetch("/api/habits", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
    const habit = await response.json();
    if (!response.ok) throw new Error(habit.error || "保存失败");
    state.habits = [habit, ...state.habits]; showToast("微习惯已加入我的节奏"); render();
  } catch (error) { showToast(error.message || "习惯保存失败"); }
}

async function checkinHabit(id, status) {
  try {
    const response = await fetch(`/api/habits/${encodeURIComponent(id)}/checkin`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ status }) });
    const habit = await response.json();
    if (!response.ok) throw new Error("checkin");
    state.habits = state.habits.map((item) => item.id === habit.id ? habit : item);
    const surprise = status === "done" ? syncSurpriseBonus(`habit:${id}:${todayKey()}`, true) : status === "pending" ? (syncSurpriseBonus(`habit:${id}:${todayKey()}`, false), { bonus: 0 }) : { bonus: 0 };
    showToast(status === "done" ? `今天的节奏完成了 · +8经验 +${rewardToGems(8)}宝石${surprise.bonus ? ` · 彩蛋+${surprise.bonus}` : ""}` : status === "skip" ? "今天暂停，不责怪自己" : "已撤销今天记录，奖励同步收回"); render();
  } catch { showToast("暂时无法记录习惯"); }
}

function actionScore(action) {
  const energy = getCoachSession().answers.energy || getPrefs().energy || "normal";
  const time = Number(getCoachSession().answers.time || 15);
  let score = Number(action.importance || 2) * 20;
  if (action.status === "doing") score += 25;
  if (action.energy === energy) score += 16;
  if (Number(action.estimateMinutes) <= time) score += 14;
  else score -= 12;
  if (action.dueAt) {
    const hours = (new Date(action.dueAt).getTime() - Date.now()) / 3600000;
    if (hours <= 0) score += 70;
    else if (hours <= 24) score += 50;
    else if (hours <= 72) score += 28;
  }
  if (action.source === "idea") score += 6;
  const calibration = state.decisionCalibration || {};
  if (calibration.preferShort) score += Number(action.estimateMinutes) <= 10 ? 14 : -10;
  if (calibration.preferLowEnergy) score += action.energy === "low" ? 12 : -8;
  if (calibration.preferClearStep) score += action.steps?.length ? 12 : -7;
  if (calibration.preferImportant) score += Number(action.importance) >= 2 ? 10 : -10;
  return score;
}

function rankedActions() {
  return state.actions.filter((action) => ["open", "doing"].includes(action.status) && (!action.notBefore || new Date(action.notBefore).getTime() <= Date.now())).map((action) => ({ ...action, score: actionScore(action) })).sort((left, right) => right.score - left.score);
}

async function parseActionInbox(answer = null) {
  const inputText = document.querySelector("#action-inbox-text")?.value.trim();
  if (!answer && inputText !== undefined) state.actionInboxText = inputText;
  if (state.actionInboxText.length < 2) { showToast("把想到的事情说一句就好"); return; }
  state.actionInboxLoading = true;
  render();
  try {
    const response = await fetch("/api/capture/parse", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ profileId: state.childId, text: state.actionInboxText, answer }) });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "AI暂时没听清");
    state.actionInboxResult = result;
  } catch (error) { showToast(error.message || "AI暂时无法整理这件事"); }
  finally { state.actionInboxLoading = false; render(); }
}

async function confirmActionInbox() {
  const draft = state.actionInboxResult?.draft;
  if (!draft) return;
  try {
    if (draft.category === "action") {
      const actionDraft = draft.action;
      const detail = [actionDraft.detail, actionDraft.firstStep ? `第一步：${actionDraft.firstStep}` : ""].filter(Boolean).join("\n");
      const response = await fetch("/api/actions", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ profileId: state.childId, title: actionDraft.title, detail, estimateMinutes: actionDraft.estimateMinutes, energy: actionDraft.energy, importance: actionDraft.importance, dueAt: actionDraft.dueAt, goalId: draft.goalId || 0 }) });
      const action = await response.json();
      if (!response.ok) throw new Error(action.error || "保存失败");
      state.actions = [action, ...state.actions];
    } else if (draft.category === "idea") {
      const response = await fetch("/api/ideas", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ profileId: state.childId, title: draft.title, note: draft.content, source: "self", goalId: draft.goalId || 0 }) });
      const idea = await response.json();
      if (!response.ok) throw new Error(idea.error || "保存失败");
      state.ideas = [idea, ...state.ideas];
    } else {
      const response = await fetch("/api/journal", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ profileId: state.childId, source: "self", prompt: "", content: draft.content, tags: draft.tags, shareWithAi: state.captureShareWithAi }) });
      const entry = await response.json();
      if (!response.ok) throw new Error(entry.error || "保存失败");
      state.journals = [entry, ...state.journals].slice(0, 30);
      await loadCloudProgress(state.childId);
    }
    trackEvent("capture_confirmed", { category: draft.category, shareWithAi: draft.category === "journal" ? state.captureShareWithAi : undefined });
    if (draft.goalId) await loadGoals();
    state.actionInboxResult = null;
    state.actionInboxText = "";
    showToast(draft.category === "action" ? "已经加入行动台，AI会一起排序" : draft.category === "idea" ? "已经放进灵感池，不会变成压力清单" : "已经写进成长日记");
    render();
  } catch (error) { showToast(error.message || "暂时没有保存成功"); }
}

async function openDuplicateAction(id) {
  state.showPlanningDetails = true;
  const action = state.actions.find((item) => item.id === Number(id));
  if (action && action.status !== "doing") await updateAction(action.id, "doing");
  else render();
  showToast("没有重复新建，已经打开原来的行动");
}

function inboxDueLabel(value) {
  if (!value) return "不设截止时间";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "时间待确认" : date.toLocaleString("zh-CN", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });
}

async function createActionFromForm() {
  const title = document.querySelector("#action-title")?.value.trim() || "";
  if (!title) { showToast("先写下要做什么"); return; }
  const payload = { profileId: state.childId, title, estimateMinutes: Number(document.querySelector("#action-estimate")?.value || 10), importance: Number(document.querySelector("#action-importance")?.value || 2), energy: getCoachSession().answers.energy || getPrefs().energy || "normal", dueAt: document.querySelector("#action-due")?.value || "" };
  try {
    const response = await fetch("/api/actions", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
    const action = await response.json();
    if (!response.ok) throw new Error(action.error || "保存失败");
    state.actions = [action, ...state.actions];
    showToast("行动已加入，系统会自动安排顺序"); render();
  } catch (error) { showToast(error.message || "行动保存失败"); }
}

async function updateAction(id, status) {
  try {
    const response = await fetch(`/api/actions/${encodeURIComponent(id)}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ status }) });
    const action = await response.json();
    if (!response.ok) throw new Error("update");
    state.actions = state.actions.map((item) => item.id === action.id ? action : item);
    const surprise = status === "done" ? syncSurpriseBonus(`action:${action.id}`, true) : status === "open" ? (syncSurpriseBonus(`action:${action.id}`, false), { bonus: 0 }) : { bonus: 0 };
    showToast(status === "done" ? `完成了 · +${actionReward(action)}经验 +${rewardToGems(actionReward(action))}宝石${surprise.bonus ? ` · 惊喜宝箱+${surprise.bonus}` : ""}` : status === "doing" ? "已经把它放到现在做" : "行动已重新打开，奖励已同步撤回"); render();
  } catch { showToast("暂时无法更新行动"); }
}

async function breakdownAction(id) {
  state.actionLoadingId = Number(id); render();
  try {
    const response = await fetch(`/api/actions/${encodeURIComponent(id)}/breakdown`, { method: "POST" });
    const action = await response.json();
    if (!response.ok) throw new Error("breakdown");
    state.actions = state.actions.map((item) => item.id === action.id ? action : item);
    showToast("AI已经把它拆成小步");
  } catch { showToast("AI暂时无法拆解"); }
  finally { state.actionLoadingId = null; render(); }
}

function openActionNegotiation(id) {
  state.actionNegotiation = { actionId: Number(id), loading: false, result: null };
  render();
}

async function requestActionNegotiation(id, reason) {
  state.actionNegotiation = { actionId: Number(id), reason, loading: true, result: null };
  render();
  try {
    const response = await fetch(`/api/actions/${encodeURIComponent(id)}/negotiate`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ reason }) });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "AI暂时无法一起商量");
    state.actionNegotiation = { actionId: Number(id), reason, loading: false, result };
  } catch (error) { state.actionNegotiation = null; showToast(error.message || "暂时无法一起商量"); }
  render();
}

async function applyActionNegotiation(id, outcome) {
  const negotiation = state.actionNegotiation;
  if (!negotiation || negotiation.actionId !== Number(id)) return;
  try {
    const response = await fetch(`/api/actions/${encodeURIComponent(id)}/defer`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ reason: negotiation.reason, outcome, tinyStep: negotiation.result?.suggestion?.tinyStep || "" }) });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "调整失败");
    state.actions = state.actions.map((item) => item.id === result.action.id ? result.action : item);
    await loadActions();
    state.actionNegotiation = null;
    const sourceIsCurrentPlan = state.dailyPlan?.plan?.sourceType === "action" && Number(state.dailyPlan.plan.sourceId) === Number(id);
    if (sourceIsCurrentPlan && outcome === "shrink") state.dailyPlan = { ...state.dailyPlan, plan: { ...state.dailyPlan.plan, minutes: Math.min(5, result.action.estimateMinutes), firstStep: result.decision.tinyStep, support: "已经缩小，只试这一小步就够了" } };
    if (sourceIsCurrentPlan && outcome !== "shrink") await generateDailyPlan({ swap: true });
    else render();
    showToast({ shrink: "已经缩成5分钟小版本", tomorrow: "已经安排到明天，今天不再提醒", someday: "已放进以后再看", drop: "已经决定不做，不会再推荐" }[outcome]);
  } catch (error) { showToast(error.message || "暂时无法保存这个决定"); }
}

async function createIdea({ title, note = "", source = "self" }) {
  if (!title?.trim()) { showToast("先写下一点灵感"); return; }
  try {
    const response = await fetch("/api/ideas", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ profileId: state.childId, title: title.trim(), note, source }) });
    const idea = await response.json();
    if (!response.ok) throw new Error(idea.error || "保存失败");
    state.ideas = [idea, ...state.ideas];
    showToast("灵感已放进孵化池");
    render();
  } catch (error) { showToast(error.message || "灵感保存失败"); }
}

async function developIdea(id) {
  state.ideaLoadingId = Number(id); render();
  try {
    const response = await fetch(`/api/ideas/${encodeURIComponent(id)}/develop`, { method: "POST" });
    const idea = await response.json();
    if (!response.ok) throw new Error(idea.error || "AI孵化失败");
    state.ideas = state.ideas.map((item) => item.id === idea.id ? idea : item);
    showToast("AI把灵感拆成了一个微行动");
  } catch (error) { showToast(error.message || "AI暂时无法孵化"); }
  finally { state.ideaLoadingId = null; render(); }
}

async function updateIdeaStatus(id, status) {
  try {
    const response = await fetch(`/api/ideas/${encodeURIComponent(id)}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ status }) });
    const idea = await response.json();
    if (!response.ok) throw new Error("更新失败");
    state.ideas = state.ideas.map((item) => item.id === idea.id ? idea : item);
    if (status === "active") await loadActions();
    showToast(status === "active" ? "这颗灵感已经开始行动" : status === "done" ? "灵感已经长成成果" : "状态已更新");
    render();
  } catch { showToast("暂时无法更新灵感"); }
}

async function requestIdeaResurfacing() {
  if (state.ideaResurfacingLoading) return;
  state.ideaResurfacingLoading = true;
  render();
  try {
    const answers = getCoachSession().answers || {};
    const response = await fetch("/api/idea-resurfacing", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ profileId: state.childId, energy: answers.energy || getPrefs().energy || "normal", availableMinutes: Number(answers.time || 10), news: getAppSettings().useNews ? getNewsContext() : [] }) });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "暂时没有灵感想醒来");
    state.ideaResurfacing = result.resurfacing;
    await loadIdeas();
  } catch (error) { showToast(error.message || "暂时无法唤醒灵感"); }
  finally { state.ideaResurfacingLoading = false; render(); }
}

async function decideIdeaResurfacing(outcome) {
  const resurfacing = state.ideaResurfacing;
  if (!resurfacing || state.ideaResurfacingLoading) return;
  state.ideaResurfacingLoading = true;
  render();
  try {
    const response = await fetch(`/api/idea-resurfacings/${encodeURIComponent(resurfacing.id)}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ outcome }) });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "决定暂时没保存");
    state.ideaResurfacing = null;
    await loadIdeas();
    if (outcome === "try") await loadActions();
    showToast({ try: "10分钟尝试已放进行动台", keep: "继续收藏，7天内不会再打扰", later: "先休息30天，到时再看看", dismiss: "已经放下，以后不再推荐" }[outcome]);
  } catch (error) { showToast(error.message || "决定暂时没保存"); }
  finally { state.ideaResurfacingLoading = false; render(); }
}

async function requestJournalPrompt(useDraft = false) {
  if (!currentProfile() || state.journalLoading) return;
  const area = document.querySelector("#journal-content");
  const tagInput = document.querySelector("#journal-tags");
  const consent = document.querySelector("#journal-ai-context");
  state.journalDraft = area?.value || state.journalDraft;
  state.journalTags = tagInput?.value || state.journalTags;
  state.journalShareWithAi = consent?.checked ?? state.journalShareWithAi;
  state.journalLoading = true;
  render();
  try {
    const response = await fetch("/api/journal/prompt", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ profileId: state.childId, mode: state.journalMode, draft: useDraft ? state.journalDraft : "", todayContext: { answers: getCoachSession().answers, completed: doneToday().map((quest) => quest.title), latestReflection: getLogs()[0] || null } }) });
    if (!response.ok) throw new Error("journal-prompt");
    state.journalPrompt = await response.json();
  } catch { showToast("AI暂时没想好问题，你也可以自由写"); }
  finally { state.journalLoading = false; render(); }
}

async function saveJournalEntry() {
  const contentValue = document.querySelector("#journal-content")?.value.trim() || "";
  const tagValue = document.querySelector("#journal-tags")?.value || "";
  const tags = tagValue.split(/[,，]/).map((tag) => tag.trim()).filter(Boolean).slice(0, 8);
  const shareWithAi = Boolean(document.querySelector("#journal-ai-context")?.checked);
  if (contentValue.length < 2) { showToast("至少写下一句话"); return; }
  try {
    const response = await fetch("/api/journal", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ profileId: state.childId, source: state.journalMode, prompt: state.journalPrompt?.question || "", content: contentValue, tags, shareWithAi }) });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "journal-save");
    state.journals = [result, ...state.journals].slice(0, 30);
    state.journalPrompt = null;
    state.journalDraft = "";
    state.journalTags = "";
    await loadCloudProgress(state.childId);
    const rewarded = grantBonusReward(`journal:${result.id}`, { xp: 6, gems: 1, label: "留下成长日记" });
    if (!rewarded) showToast("这条想法已经记进成长档案");
    render();
  } catch (error) { showToast(error.message || "日记保存失败"); }
}

function hydrateProfileData(data) {
  const prefix = storageKey("");
  for (const [name, value] of Object.entries(data || {})) localStorage.setItem(`${prefix}${name}`, typeof value === "string" ? value : JSON.stringify(value));
}

function installProfiles(profiles) {
  state.profiles = profiles || [];
  for (const profile of state.profiles) {
    const template = children[profile.baseTemplate] || children.brother;
    children[profile.id] = { ...structuredClone(template), name: profile.name, shortAge: profile.age, avatar: profile.avatar };
  }
  if (!state.profiles.some((profile) => profile.id === state.childId)) state.childId = state.profiles[0]?.id || "brother";
}

async function loadAccount() {
  let account;
  try {
    const response = await fetch("/api/account");
    if (!response.ok) throw new Error("signed-out");
    account = await response.json();
  } catch {
    const localTest = typeof location !== "undefined" && ["127.0.0.1", "localhost"].includes(location.hostname);
    if (localTest) {
      try {
        const response = await fetch("/api/dev/login", { method: "POST" });
        if (!response.ok) throw new Error("dev-login");
        account = await response.json();
      } catch {}
    }
  }
  if (!account) { authOverlay.hidden = false; return; }
  state.account = account;
  installProfiles(state.account.profiles);
  authOverlay.hidden = true;
  if (!state.profiles.length) profileOverlay.hidden = false;
  else {
    try { await loadCloudProgress(state.childId); }
    catch (error) { console.warn("成长档案加载失败", error); showToast("部分云端档案暂时没有载入"); }
  }
  render();
}

async function loadCloudProgress(profileId) {
  if (!state.account || !state.profiles.some((profile) => profile.id === profileId)) return;
  const response = await fetch(`/api/progress?profileId=${encodeURIComponent(profileId)}`);
  if (!response.ok) return;
  const result = await response.json();
  hydrateProfileData(result.data);
  state.cloudMemories = result.memories || [];
  await loadMetrics();
  await loadJournals();
  await loadHypotheses();
  await loadStrategyInsights();
  await loadSelfCoach();
  await loadGoals();
  await loadIdeas();
  await loadIdeaResurfacing();
  await loadActions();
  await loadHabits();
  await loadFocus();
  await loadReviews();
  await loadFamilyBrief();
  await loadTaskFeedback();
  await loadArtifacts();
  await loadDailyPlan();
  await loadDailyPlanFeedback();
}

function getPrefs() {
  return readJson(storageKey("prefs"), { energy: "normal", likedTags: [], hardTags: [] });
}

function setPrefs(nextPrefs) {
  writeJson(storageKey("prefs"), { ...getPrefs(), ...nextPrefs });
}

function getAppSettings() {
  return readJson(storageKey("app-settings"), {
    dailyTarget: 1,
    useNews: true,
    newsTopics: "AI教育, 科学发现, 儿童创造力, 未来技能",
    motion: "gentle"
  });
}

function setAppSettings(nextSettings) {
  writeJson(storageKey("app-settings"), { ...getAppSettings(), ...nextSettings });
}

function getGrowthPlan() {
  return readJson(storageKey("growth-plan"), {
    weeklyGoal: "",
    focusSkill: "",
    constraints: "",
    rationale: "",
    milestones: [],
    updatedAt: ""
  });
}

function setGrowthPlan(plan) {
  writeJson(storageKey("growth-plan"), { ...getGrowthPlan(), ...plan, updatedAt: new Date().toISOString() });
}

function getScheduleItems() {
  return readJson(storageKey("schedule-items"), []);
}

function setScheduleItems(items) {
  writeJson(storageKey("schedule-items"), items.slice(0, 30));
}

function getNewsContext() {
  return readJson(storageKey("news-context"), []);
}

function setNewsContext(items) {
  writeJson(storageKey("news-context"), items.slice(0, 20));
}

function getCompletions() {
  return readJson(storageKey("completions"), {});
}

function setCompletions(completions) {
  writeJson(storageKey("completions"), completions);
}

function isDone(taskId) {
  return Boolean(getCompletions()[todayKey()]?.[taskId]);
}

function toggleDone(taskId) {
  const completions = getCompletions();
  completions[todayKey()] ||= {};
  if (completions[todayKey()][taskId]) {
    delete completions[todayKey()][taskId];
    trackEvent("quest_undone", { taskId });
  } else {
    const reward = currentQuestReward(taskId);
    const surprise = surpriseRewardRoll(`quest:${taskId}`);
    completions[todayKey()][taskId] = {
      doneAt: Date.now(),
      reward,
      gems: rewardToGems(reward) + surprise.bonus,
      surpriseGems: surprise.bonus
    };
    const completedQuest = questById(taskId) || aiQuestFromResult(getAiCoachResult());
    if (completedQuest) {
      rememberRecommendation(completedQuest, "completed");
      queueCloudSync({ kind: "completion", summary: `${child().name}完成了「${completedQuest.title}」，获得${reward}经验`, evidence: { taskId, skill: completedQuest.skill, reward } });
      trackEvent("quest_completed", { taskId, skill: completedQuest.skill, reward });
    }
  }
  setCompletions(completions);
  if (completions[todayKey()][taskId]) {
    const reward = Number(completions[todayKey()][taskId].reward || 0);
    const surprise = Number(completions[todayKey()][taskId].surpriseGems || 0);
    showToast(`任务完成 · +${reward}经验 +${rewardToGems(reward)}宝石${surprise ? ` · 惊喜宝箱+${surprise}` : ""}`);
  } else {
    showToast("已撤销完成，经验和宝石同步收回");
  }
}

function currentQuestReward(taskId) {
  return questById(taskId)?.reward || getAiCoachResult()?.recommendation?.reward || 0;
}

function rewardToGems(xp) {
  return Math.max(1, Math.round(Number(xp || 0) / 6));
}

function surpriseRewardRoll(key) {
  const rolls = readJson(storageKey("surprise-rolls"), {});
  if (rolls[key]) return rolls[key];
  const winsToday = Object.values(rolls).filter((roll) => roll.date === todayKey() && Number(roll.bonus || 0) > 0).length;
  const randomValue = globalThis.crypto?.getRandomValues ? globalThis.crypto.getRandomValues(new Uint32Array(1))[0] / 4294967296 : Math.random();
  const bonus = winsToday < 2 && randomValue < 0.35 ? (randomValue < 0.08 ? 2 : 1) : 0;
  const roll = { bonus, date: todayKey(), chance: 0.35, dailyCap: 2 };
  writeJson(storageKey("surprise-rolls"), { ...rolls, [key]: roll });
  return roll;
}

function syncSurpriseBonus(key, active) {
  const roll = surpriseRewardRoll(key);
  const rewards = readJson(storageKey("bonus-rewards"), {});
  const rewardKey = `surprise:${key}`;
  if (active && roll.bonus) rewards[rewardKey] = { xp: 0, gems: roll.bonus, label: "惊喜宝箱", earnedAt: new Date().toISOString(), countsAsCompletion: false };
  else delete rewards[rewardKey];
  writeJson(storageKey("bonus-rewards"), rewards);
  return roll;
}

function actionReward(action) {
  return Math.min(24, 4 + Math.ceil(Number(action.estimateMinutes || 10) / 5) + Number(action.importance || 2) * 3);
}

function actionRewardLedger() {
  const byDay = new Map();
  const completedActions = state.actions.filter((item) => item.status === "done");
  for (const action of completedActions) {
    const day = localDateKey(action.updatedAt);
    byDay.set(day, Math.min(60, (byDay.get(day) || 0) + actionReward(action)));
  }
  const xp = [...byDay.values()].reduce((sum, value) => sum + value, 0);
  return { xp, gems: xp ? Math.max(1, Math.round(xp / 6)) : 0, completed: completedActions.length };
}

function habitRewardLedger() {
  const byDay = new Map();
  let completed = 0;
  for (const habit of state.habits) {
    for (const log of habit.recentLogs || []) {
      if (log.status !== "done") continue;
      completed += 1;
      byDay.set(log.date, Math.min(32, (byDay.get(log.date) || 0) + 8));
    }
  }
  const xp = [...byDay.values()].reduce((sum, value) => sum + value, 0);
  return { xp, gems: xp ? Math.max(1, Math.round(xp / 6)) : 0, completed };
}

function getLogs() {
  return readJson(storageKey("reflection-logs"), []);
}

function setLogs(logs) {
  writeJson(storageKey("reflection-logs"), logs.slice(0, 18));
}

function getAiCoachResult() {
  return readJson(storageKey(`ai-coach-${todayKey()}`), null);
}

function setAiCoachResult(result) {
  writeJson(storageKey(`ai-coach-${todayKey()}`), result);
  const quest = aiQuestFromResult(result);
  if (quest) rememberRecommendation(quest, "ai");
}

function clearAiCoachResult() {
  localStorage.removeItem(storageKey(`ai-coach-${todayKey()}`));
}

function getRecommendationHistory() {
  return readJson(storageKey("recommendation-history"), []);
}

function setRecommendationHistory(history) {
  writeJson(storageKey("recommendation-history"), history.slice(0, 40));
}

function rememberRecommendation(quest, source = "local") {
  const profile = taskProfile(quest);
  const record = {
    id: quest.id,
    title: quest.title,
    type: quest.type,
    skill: normalizeSkillId(quest.skill),
    mode: profile.mode,
    setting: profile.setting,
    output: profile.output,
    interaction: profile.interaction,
    signature: taskSignature(quest),
    source,
    date: todayKey(),
    recommendedAt: Date.now()
  };
  const history = getRecommendationHistory();
  if (history[0]?.signature === record.signature && history[0]?.date === record.date) return;
  setRecommendationHistory([record, ...history]);
}

function getCoachSession() {
  return readJson(storageKey(`coach-${todayKey()}`), { answers: {}, skipped: [], avoidedRecommendations: [] });
}

function setCoachSession(session) {
  writeJson(storageKey(`coach-${todayKey()}`), session);
}

function resetCoachSession() {
  localStorage.removeItem(storageKey(`coach-${todayKey()}`));
  clearAiCoachResult();
}

function answeredQuestions() {
  const answers = getCoachSession().answers;
  return coachQuestions.filter((question) => answers[question.id] !== undefined);
}

function nextCoachQuestion() {
  const answers = getCoachSession().answers;
  return coachQuestions.find((question) => answers[question.id] === undefined);
}

function coachAnswerDetails() {
  const answers = getCoachSession().answers;
  return coachQuestions
    .map((question) => {
      const answer = question.answers.find((item) => String(item.value) === String(answers[question.id]));
      return answer ? { question, answer } : null;
    })
    .filter(Boolean);
}

function coachTags() {
  return coachAnswerDetails().flatMap(({ answer }) => answer.tags || []);
}

function maxMinutes() {
  return Number(getCoachSession().answers.time || 99);
}

function getContextProfile() {
  return readJson(storageKey("context-profile"), {});
}

function setContextAnswer(questionId, value) {
  writeJson(storageKey("context-profile"), {
    ...getContextProfile(),
    [questionId]: {
      value,
      answeredAt: new Date().toISOString()
    }
  });
}

function clearContextAnswer(questionId) {
  const profile = { ...getContextProfile() };
  delete profile[questionId];
  writeJson(storageKey("context-profile"), profile);
}

function nextContextQuestion() {
  const profile = getContextProfile();
  return contextQuestions.find((question) => !profile[question.id]);
}

function contextAnswerDetails() {
  const profile = getContextProfile();
  return contextQuestions
    .map((question) => {
      const answer = profile[question.id]?.value;
      return answer ? { question, answer } : null;
    })
    .filter(Boolean);
}

function getOnboardingState() {
  return readJson(storageKey("onboarding"), { started: false, complete: false });
}

function needsProfileOnboarding() {
  if (!state.account || !currentProfile()) return false;
  const onboarding = getOnboardingState();
  if (onboarding.complete) return false;
  if (!onboarding.started && contextAnswerDetails().length >= 4) return false;
  return true;
}

function onboardingAnswerDetails() {
  const profile = getContextProfile();
  return onboardingQuestionIds.map((id) => {
    const question = onboardingQuestionDefinition(id);
    const answer = profile[id]?.value;
    return question && answer ? { question, answer } : null;
  }).filter(Boolean);
}

function onboardingQuestionDefinition(id) {
  const saved = readJson(storageKey("onboarding-questions"), {});
  if (saved[id]) return saved[id];
  const fixed = contextQuestions.find((item) => item.id === id);
  if (fixed) return fixed;
  const profile = getContextProfile();
  const wish = profile["growth-wish"]?.value || "变得更好";
  const interest = profile["current-interest"]?.value || "喜欢的事情";
  return id === "personal-friction"
    ? { id, title: `当你想“${wish}”时，最常被什么挡住？`, why: "找到真正卡点，目标才会适合你。", options: ["不知道怎么开始", "做到一半容易停", "担心做不好", "常被别的事打断"] }
    : { id, title: `如果用“${interest}”练习，一个月后你最想看到什么？`, why: "你认同的结果，才值得成为目标。", options: ["我能自己开始", "我能坚持做完", "我有作品能展示", "我能讲清学会了什么"] };
}

function nextOnboardingQuestion() {
  const profile = getContextProfile();
  const id = onboardingQuestionIds.find((questionId) => !profile[questionId]);
  return id ? onboardingQuestionDefinition(id) : null;
}

async function requestOnboardingQuestion(questionId) {
  if (!["personal-friction", "success-picture"].includes(questionId) || state.onboardingQuestionLoading) return;
  state.onboardingQuestionLoading = true;
  render();
  try {
    const answers = Object.fromEntries(onboardingAnswerDetails().map(({ question, answer }) => [question.id, answer]));
    const response = await fetch("/api/onboarding/question", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ profileId: state.childId, questionId, answers }) });
    const result = await response.json();
    if (!response.ok || !result.question) throw new Error("question");
    writeJson(storageKey("onboarding-questions"), { ...readJson(storageKey("onboarding-questions"), {}), [questionId]: result.question });
  } catch { /* The tailored local fallback remains available. */ }
  finally { state.onboardingQuestionLoading = false; render(); }
}

function onboardingGoalDraft() {
  const profile = getContextProfile();
  const wish = profile["growth-wish"]?.value || "做出自己的作品";
  const interest = profile["current-interest"]?.value || "喜欢的事情";
  const map = {
    "更容易开始做完": { skill: "self-regulation", title: "我想更容易开始并做完", signal: "我能自己开始一件小事，并在结束后检查一次" },
    "更会学习思考": { skill: "metacognition", title: "我想更会学习和思考", signal: "我能说出哪里会、哪里卡住，并换一种办法" },
    "更敢表达分享": { skill: "communication", title: "我想更敢表达和分享", signal: "我能把一个想法讲清楚或展示给别人" },
    "做出自己的作品": { skill: "creation", title: "我想做出自己的作品", signal: "我能留下一个看得见、可以继续修改的小作品" }
  };
  const selected = map[wish] || map["做出自己的作品"];
  const why = `我喜欢${interest}，想从这里开始探索`;
  const firstExperiment = `用10分钟，把“${interest}”变成一个最小版本`;
  return { title: selected.title, why, successSignal: `四周内完成3次练习，并做到：${selected.signal}`, firstExperiment, skill: selected.skill, horizon: "one_month", objective: `${selected.title}，并留下看得见的进步`, smart: { specific: selected.title, measurable: "完成3次小练习、1件成果和2次复盘", achievable: "每天只推进5到15分钟", relevant: why, timeBound: "四周完成第一轮" }, keyResults: [{ id:"kr1", title:"完成3次小练习", target:3, unit:"次" }, { id:"kr2", title:"留下1件可展示成果", target:1, unit:"件" }, { id:"kr3", title:"完成2次任务复盘", target:2, unit:"次" }], weeklyPlan:["第1周：完成最小版本", "第2周：再做一次并改进", "第3周：解决一个卡点", "第4周：展示并复盘"] };
}

function renderProfileOnboarding() {
  const question = nextOnboardingQuestion();
  const answers = onboardingAnswerDetails();
  const progress = answers.length;
  const percent = Math.round((progress / onboardingQuestionIds.length) * 100);
  if (!question) {
    const draft = onboardingGoalDraft();
    return `<section class="profile-onboarding complete"><header><span>认识完成 · ${onboardingQuestionIds.length}/${onboardingQuestionIds.length}</span><strong>AI有了第一版理解</strong><p>这不是标签，以后的行动、作品和反馈还会继续修正它。</p></header><div class="onboarding-route"><small>第一条成长方向</small><h2>${escapeHtml(draft.title)}</h2><p>${escapeHtml(draft.why)}</p><strong>先试：${escapeHtml(draft.firstExperiment)}</strong></div><div class="onboarding-summary">${answers.map(({ question: item, answer }) => `<span>${escapeHtml(item.title.replace("？", ""))}<b>${escapeHtml(answer)}</b></span>`).join("")}</div>${state.onboardingError ? `<p class="onboarding-error">${escapeHtml(state.onboardingError)}</p>` : ""}<button class="onboarding-primary" type="button" data-action="finish-profile-onboarding" ${state.onboardingLoading ? "disabled" : ""}>${state.onboardingLoading ? "正在建立成长路线..." : "建立路线，进入今天"}</button></section>`;
  }
  return `<section class="profile-onboarding"><header><span>${state.onboardingQuestionLoading ? "AI正在设计下一问" : "AI先认识我"} · ${progress + 1}/${onboardingQuestionIds.length}</span><strong>${escapeHtml(child().name)}，先不急着接任务</strong><p>每次只回答一个。后两题会根据前面的答案变化，没有标准答案。</p><div class="onboarding-progress"><i style="width:${percent}%"></i></div></header>${state.onboardingQuestionLoading ? `<article class="onboarding-question onboarding-thinking"><small>正在结合你刚才的回答</small><h2>AI在想一个真正有用的问题</h2><div class="thinking-dots"><span></span><span></span><span></span></div></article>` : `<article class="onboarding-question"><small>${["personal-friction","success-picture"].includes(question.id) ? "为我生成的问题" : "关于我自己"}</small><h2>${escapeHtml(question.title)}</h2><p>${escapeHtml(question.why)}</p><div>${question.options.map((option) => `<button type="button" data-action="answer-onboarding" data-question="${escapeHtml(question.id)}" data-value="${escapeHtml(option)}">${escapeHtml(option)}</button>`).join("")}</div></article>`}${answers.length && !state.onboardingQuestionLoading ? `<button class="onboarding-back" type="button" data-action="undo-onboarding-answer" data-question="${escapeHtml(answers.at(-1).question.id)}">返回上一题</button>` : ""}<footer><span>认识我</span><i>→</i><span>SMART目标</span><i>→</i><span>OKR</span><i>→</i><span>今日一步</span></footer></section>`;
}

async function finishProfileOnboarding() {
  if (state.onboardingLoading) return;
  state.onboardingLoading = true;
  state.onboardingError = "";
  render();
  try {
    if (!state.goals.some((goal) => goal.status === "active")) {
      const fallback = onboardingGoalDraft();
      const context = Object.fromEntries(onboardingAnswerDetails().map(({ question, answer }) => [question.id, { question: question.title, answer }]));
      const shapeResponse = await fetch("/api/goals/shape", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ profileId: state.childId, text: `${fallback.title}。${fallback.why}`, context }) });
      const shaped = await shapeResponse.json();
      const draft = shapeResponse.ok && shaped.draft ? shaped.draft : fallback;
      const response = await fetch("/api/goals", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ profileId: state.childId, ...draft }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "SMART目标建立失败");
      state.goals = [result, ...state.goals];
      const actionResponse = await fetch("/api/actions", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ profileId: state.childId, title: result.firstExperiment, detail: `来自SMART目标：${result.title}\n对应OKR：${result.keyResults?.[0]?.title || "完成第一次小练习"}`, estimateMinutes: 10, energy: "normal", importance: 3, goalId: result.id }) });
      if (actionResponse.ok) state.actions = [await actionResponse.json(), ...state.actions];
      const dailyResponse = await fetch("/api/daily-plan/generate", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ profileId: state.childId, energy: "normal", minutes: 10, intent: "finish" }) });
      if (dailyResponse.ok) state.dailyPlan = await dailyResponse.json();
    }
    writeJson(storageKey("onboarding"), { started: true, complete: true, completedAt: new Date().toISOString() });
    const rewarded = grantBonusReward("onboarding:first-profile", { xp: 10, gems: 2, label: "完成第一版成长画像" });
    state.page = "profile";
    state.dailyPlan = null;
    state.dailyCheckin = { energy: "", minutes: 0, intent: "" };
    if (!rewarded) showToast("SMART目标和今日一步已经准备好");
  } catch (error) {
    state.onboardingError = error.message || "暂时无法建立成长路线";
  } finally {
    state.onboardingLoading = false;
    render();
  }
}

function completedIds() {
  const completions = getCompletions();
  return Object.values(completions).flatMap((day) => Object.keys(day));
}

function totalLocalXp() {
  return rewardLedger().xp;
}

function rewardLedger() {
  const c = child();
  const rewards = Object.fromEntries(c.quests.map((quest) => [quest.id, quest.reward]));
  const completions = getCompletions();
  const questLedger = Object.values(completions).reduce((ledger, day) => {
    for (const [id, value] of Object.entries(day || {})) {
      const xp = Number(value?.reward) || rewards[id] || 0;
      ledger.xp += xp;
      ledger.gems += Number(value?.gems) || rewardToGems(xp);
      ledger.completed += 1;
    }
    return ledger;
  }, { xp: 0, gems: 0, completed: 0 });
  const actions = actionRewardLedger();
  const habits = habitRewardLedger();
  const bonuses = Object.values(readJson(storageKey("bonus-rewards"), {})).reduce((ledger, reward) => ({ xp: ledger.xp + Number(reward.xp || 0), gems: ledger.gems + Number(reward.gems || 0), completed: ledger.completed + (reward.countsAsCompletion === false ? 0 : 1) }), { xp: 0, gems: 0, completed: 0 });
  return { xp: questLedger.xp + actions.xp + habits.xp + bonuses.xp, gems: questLedger.gems + actions.gems + habits.gems + bonuses.gems, completed: questLedger.completed + actions.completed + habits.completed + bonuses.completed };
}

function grantBonusReward(key, { xp, gems, label }) {
  const rewards = readJson(storageKey("bonus-rewards"), {});
  if (rewards[key]) return false;
  rewards[key] = { xp, gems, label, earnedAt: new Date().toISOString() };
  writeJson(storageKey("bonus-rewards"), rewards);
  showToast(`${label} · +${xp}经验 +${gems}宝石`);
  return true;
}

function revokeBonusReward(key) {
  const rewards = readJson(storageKey("bonus-rewards"), {});
  if (!rewards[key]) return;
  delete rewards[key];
  writeJson(storageKey("bonus-rewards"), rewards);
}

function getGemWallet() {
  return readJson(storageKey("gem-wallet"), { unlocked: ["classic"], equipped: "classic", transactions: [] });
}

function spentGems() {
  return getGemWallet().transactions.reduce((total, item) => total + Math.max(0, Number(item.cost || 0)), 0);
}

function levelThresholdAfter(currentThreshold) {
  return Math.ceil((currentThreshold * 1.15) / 50) * 50;
}

function economyState() {
  const c = child();
  const ledger = rewardLedger();
  const realProfile = Boolean(currentProfile());
  let level = realProfile ? 1 : c.level;
  let xp = (realProfile ? 0 : c.xp) + ledger.xp;
  let xpMax = realProfile ? 100 : c.xpMax;
  while (xp >= xpMax) {
    xp -= xpMax;
    level += 1;
    xpMax = levelThresholdAfter(xpMax);
  }
  const activeDays = Object.entries(getCompletions())
    .filter(([, tasks]) => Object.keys(tasks || {}).length > 0)
    .map(([date]) => date)
    .filter((date) => {
      const distance = Math.round((new Date(`${todayKey()}T00:00:00`) - new Date(`${date}T00:00:00`)) / 86400000);
      return distance >= 0 && distance < 8;
    }).length;
  return {
    level,
    xp,
    xpMax,
    gems: Math.max(0, (realProfile ? 0 : c.gems) + ledger.gems - spentGems()),
    earnedXp: ledger.xp,
    earnedGems: ledger.gems,
    completed: ledger.completed,
    hearts: Math.min(8, activeDays)
  };
}

function renderGemStore() {
  const economy = economyState();
  const wallet = getGemWallet();
  return `<section class="settings-section gem-store" id="gem-store"><div class="gem-store-head"><div><span class="gem-store-gem" aria-hidden="true"></span><span><h3>宝石营地</h3><small>宝石只能靠真实成长行动获得</small></span></div><strong>${economy.gems}</strong></div><div class="gem-store-items">${gemStoreItems.map((item) => { const unlocked = wallet.unlocked.includes(item.id); const equipped = wallet.equipped === item.id; const canBuy = economy.gems >= item.cost; return `<article class="${equipped ? "equipped" : ""}"><span class="theme-swatch ${escapeHtml(item.id)}" aria-hidden="true"><i></i></span><div><strong>${escapeHtml(item.name)}</strong><small>${escapeHtml(item.note)}</small></div><button type="button" data-action="buy-gem-item" data-item-id="${escapeHtml(item.id)}" ${!unlocked && !canBuy ? "disabled" : ""}>${equipped ? "使用中" : unlocked ? "使用" : `${item.cost}宝石`}</button></article>`; }).join("")}</div><p>每次成长都有固定奖励；另有35%概率出现1至2颗惊喜宝石，每天最多两次。概率公开、不能付费抽取，撤销完成会收回奖励且不能反复重抽。</p></section>`;
}

function buyGemItem(itemId) {
  const item = gemStoreItems.find((entry) => entry.id === itemId);
  if (!item) return;
  const wallet = getGemWallet();
  const unlocked = wallet.unlocked.includes(item.id);
  if (!unlocked && economyState().gems < item.cost) { showToast("宝石还不够，先完成一个真实任务"); return; }
  const nextWallet = {
    unlocked: unlocked ? wallet.unlocked : [...wallet.unlocked, item.id],
    equipped: item.id,
    transactions: unlocked ? wallet.transactions : [{ itemId: item.id, cost: item.cost, spentAt: new Date().toISOString() }, ...wallet.transactions]
  };
  writeJson(storageKey("gem-wallet"), nextWallet);
  updateShell();
  settingsContent.innerHTML = renderSettingsPanel();
  showToast(unlocked ? `已换成${item.name}` : `解锁${item.name} · -${item.cost}宝石`);
}

function taskProfile(task) {
  const mapped = taskExperienceProfiles[task?.id] || {};
  return {
    mode: task?.mode || mapped.mode || "practice",
    setting: task?.setting || mapped.setting || "home",
    output: task?.output || mapped.output || "result",
    interaction: task?.interaction || mapped.interaction || "solo"
  };
}

function experienceLabel(group, value) {
  return experienceLabels[group]?.[value] || String(value || "");
}

function normalizeTaskText(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[\s，。！？、：；,.!?;:'"“”‘’（）()《》【】\-_/]/g, "");
}

function textBigrams(value) {
  const normalized = normalizeTaskText(value);
  if (!normalized) return [];
  if (normalized.length === 1) return [normalized];
  return Array.from({ length: normalized.length - 1 }, (_, index) => normalized.slice(index, index + 2));
}

function titleSimilarity(left, right) {
  const leftSet = new Set(textBigrams(left));
  const rightSet = new Set(textBigrams(right));
  if (!leftSet.size || !rightSet.size) return 0;
  const intersection = [...leftSet].filter((item) => rightSet.has(item)).length;
  const union = new Set([...leftSet, ...rightSet]).size;
  return union ? intersection / union : 0;
}

function taskSimilarity(left, right) {
  if (!left || !right) return 0;
  if (left.id && right.id && left.id === right.id) return 1;
  const leftProfile = taskProfile(left);
  const rightProfile = taskProfile(right);
  let score = titleSimilarity(left.title, right.title) * 0.35;
  if (normalizeSkillId(left.skill) === normalizeSkillId(right.skill)) score += 0.18;
  if (leftProfile.mode === rightProfile.mode) score += 0.2;
  if (leftProfile.output === rightProfile.output) score += 0.14;
  if (leftProfile.setting === rightProfile.setting) score += 0.07;
  if (leftProfile.interaction === rightProfile.interaction) score += 0.06;
  return Math.min(1, score);
}

function taskSignature(task) {
  const profile = taskProfile(task);
  return [
    normalizeTaskText(task?.title),
    normalizeSkillId(task?.skill),
    profile.mode,
    profile.setting,
    profile.output,
    profile.interaction
  ].join("|");
}

function recentCompletionRecords(maxDays = 10) {
  const now = new Date(`${todayKey()}T00:00:00`);
  return Object.entries(getCompletions()).flatMap(([date, tasks]) => {
    const completedDate = new Date(`${date}T00:00:00`);
    const ageDays = Math.round((now - completedDate) / 86400000);
    if (ageDays < 0 || ageDays > maxDays) return [];
    return Object.keys(tasks || {}).map((id) => ({ id, date, ageDays, ...questById(id) }));
  });
}

function usageCount(records, field, value) {
  return records.filter((record) => {
    if (field === "skill") return normalizeSkillId(record.skill) === normalizeSkillId(value);
    return taskProfile(record)[field] === value;
  }).length;
}

function dailyQuestJitter(questId) {
  const value = parseInt(simpleHash(`${todayKey()}-${state.childId}-${questId}`).slice(0, 5), 36);
  return (value % 13) - 6;
}

function diversityTargets() {
  const history = getRecommendationHistory().slice(0, 12);
  const profiles = child().quests.map((quest) => ({ ...taskProfile(quest), skill: quest.skill }));
  const leastUsed = (field, limit = 3) => [...new Set(profiles.map((profile) => profile[field]))]
    .sort((left, right) => usageCount(history, field, left) - usageCount(history, field, right))
    .slice(0, limit);
  return {
    preferredModes: leastUsed("mode"),
    preferredSkills: leastUsed("skill"),
    preferredOutputs: leastUsed("output"),
    requiredDifferenceCount: 3
  };
}

function questScore(quest, index) {
  const prefs = getPrefs();
  const session = getCoachSession();
  const sessionEnergy = session.answers.energy || prefs.energy;
  const tags = coachTags();
  const profile = taskProfile(quest);
  const calibration = state.feedbackCalibration || {};
  const history = getRecommendationHistory().slice(0, 12);
  const completions = recentCompletionRecords(10);
  const avoided = session.avoidedRecommendations || [];
  let score = 100 - index * 2 + dailyQuestJitter(quest.id);
  if (quest.energy === sessionEnergy) score += 22;
  if (sessionEnergy === "low" && quest.minutes <= 10) score += 12;
  if (sessionEnergy === "high" && quest.minutes >= 15) score += 8;
  if (quest.minutes <= maxMinutes()) score += 12;
  if (quest.minutes > maxMinutes()) score -= 28;
  if (calibration.pace === "shrink") score += quest.minutes <= 10 ? 18 : -18;
  if (calibration.pace === "stretch") score += quest.minutes >= 15 ? 12 : -4;
  if (calibration.preferredModes?.includes(profile.mode)) score += 12;
  if (calibration.avoidModes?.includes(profile.mode)) score -= 24;
  if (session.answers.friction && quest.skill === coachQuestions[2].answers.find((answer) => answer.value === session.answers.friction)?.skill) score += 24;
  if (session.skipped?.includes(quest.id)) score -= 140;
  if (isDone(quest.id)) score -= 90;
  for (const tag of tags) {
    if (quest.tags.includes(tag)) score += 16;
  }
  for (const tag of quest.tags) {
    if (prefs.likedTags.includes(tag)) score += 12;
    if (prefs.hardTags.includes(tag)) score -= 6;
  }
  const logs = getLogs();
  if (logs[0]?.difficulty === "太难" && quest.minutes <= 10) score += 14;
  if (logs[0]?.fun === "有趣" && quest.tags.some((tag) => logs[0].likedTags?.includes(tag))) score += 16;

  for (const completion of completions) {
    if (completion.id === quest.id) score -= Math.max(30, 120 - completion.ageDays * 12);
  }

  history.forEach((recent, historyIndex) => {
    const similarity = taskSimilarity(quest, recent);
    const recencyWeight = historyIndex < 3 ? 64 : historyIndex < 7 ? 36 : 20;
    score -= Math.round(similarity * recencyWeight);
    if (normalizeTaskText(quest.title) === normalizeTaskText(recent.title)) score -= 100;
  });

  avoided.forEach((recent) => {
    score -= Math.round(taskSimilarity(quest, recent) * 180);
  });

  score += Math.max(0, 4 - usageCount(history, "mode", profile.mode)) * 6;
  score += Math.max(0, 3 - usageCount(history, "skill", quest.skill)) * 5;
  score += Math.max(0, 3 - usageCount(history, "output", profile.output)) * 4;
  if (history[0] && taskProfile(history[0]).mode === profile.mode) score -= 24;
  if (history[0] && normalizeSkillId(history[0].skill) === normalizeSkillId(quest.skill)) score -= 16;
  return score;
}

function recommendedQuests(limit = 3) {
  return [...child().quests]
    .map((quest, index) => ({ ...quest, ...taskProfile(quest), score: questScore(quest, index) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

function recommendedQuest() {
  return recommendedQuests(1)[0];
}

function aiQuestFromResult(result) {
  const item = result?.recommendation;
  if (!item) return null;
  const title = String(item.title || "AI小任务");
  const skill = normalizeSkillId(item.skill);
  const profile = {
    mode: String(item.mode || item.activityMode || "practice"),
    setting: String(item.setting || "home"),
    output: String(item.output || "result"),
    interaction: String(item.interaction || "solo")
  };
  return {
    id: `ai-${todayKey()}-${simpleHash(`${title}-${item.skill || ""}-${profile.mode}-${profile.output}`)}`,
    title,
    type: String(item.type || "成长"),
    skill,
    ...profile,
    minutes: Number(item.minutes || 10),
    energy: getCoachSession().answers.energy || "normal",
    tags: [
      "AI推荐",
      experienceLabel("mode", profile.mode),
      experienceLabel("output", profile.output)
    ].filter(Boolean),
    why: String(item.why || result.coachLine || "这个任务适合你现在的状态。"),
    steps: Array.isArray(item.steps) && item.steps.length ? item.steps.map(String).slice(0, 4) : ["先做第一步", "做完检查", "说出一个发现"],
    reflect: String(item.reflect || "做完后你发现了什么？"),
    reward: Number(item.reward || 20),
    evidenceNote: String(item.evidenceNote || skillEvidenceNote(skill)),
    contextUsed: Array.isArray(item.contextUsed) ? item.contextUsed.map(String).slice(0, 6) : []
  };
}

function simpleHash(value) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return hash.toString(36);
}

function questById(taskId) {
  return child().quests.find((quest) => quest.id === taskId);
}

function normalizeSkillId(value) {
  const raw = String(value || "").trim();
  if (skillFramework[raw]) return raw;
  return skillNameToId[raw] || "metacognition";
}

function skillEvidenceNote(skillId) {
  const skill = skillFramework[normalizeSkillId(skillId)];
  if (!skill) return "脚手架 + 复盘";
  return skill.trainWith.slice(0, 2).join(" + ");
}

const pixelIconBySkill = {
  "self-regulation": "skill-check",
  metacognition: "skill-book",
  communication: "skill-book",
  "data-reasoning": "skill-pencil",
  "ai-literacy": "skill-ai",
  creation: "flow-build",
  "ethics-collaboration": "flow-share",
  wellbeing: "flow-find"
};

function pixelIcon(name, alt = "", className = "pixel-icon") {
  return `<img class="${className}" src="assets/pixel/${name}.png" alt="${escapeHtml(alt)}" />`;
}

function renderFamilyBriefCard(parentView = false) {
  const brief = state.familyBrief;
  if (!brief) return "";
  if (parentView && brief.status !== "shared") return "";
  const report = brief.report;
  return `<article class="family-brief-card ${escapeHtml(brief.status)}"><header><span>${parentView ? "孩子同意分享" : brief.status === "shared" ? "正在与家长分享" : "只有我能看到草稿"}</span><small>${escapeHtml(brief.weekStart)} · ${brief.provider === "siliconflow" ? "GLM证据整理" : "本地证据整理"}</small></header><h4>${escapeHtml(report.headline)}</h4><div><small>这周看得见的进展</small><p>${escapeHtml(report.visibleProgress)}</p></div><div><small>我正在尝试的方法</small><p>${escapeHtml(report.childStrategy)}</p></div><div class="family-less-nag"><small>给家长的一条少催促建议</small><strong>${escapeHtml(report.lessNagging)}</strong></div><blockquote>可以聊一聊：${escapeHtml(report.conversationStarter)}</blockquote><p class="family-boundary">${escapeHtml(report.boundary)}</p>${parentView ? "" : `<footer>${brief.status === "shared" ? `<button type="button" data-action="update-family-brief" data-status="draft">收回分享</button>` : `<button type="button" data-action="update-family-brief" data-status="shared">我愿意给家长看</button>`}<button type="button" data-action="delete-family-brief">删除草稿</button></footer>`}</article>`;
}

function renderSettingsPanel() {
  const economy = economyState();
  const settings = getAppSettings();
  const plan = getGrowthPlan();
  const scheduleCount = getScheduleItems().length;
  const newsCount = getNewsContext().length;
  const status = state.modelStatus;
  const modelLabel = String(status.model || "GLM-5.2").split("/").pop();
  return `
    <section class="settings-section">
      <h3>云端账户</h3>
      <p class="settings-note">${escapeHtml(state.account?.email || "未登录")} ${state.account?.isTestAdmin ? '<b class="dev-admin-badge">本地测试管理员</b>' : ""} · ${state.profiles.length}个成长角色 · ${state.cloudMemories.length}条长期记忆</p>
      <div class="consent-status ${currentProfile()?.consentGranted ? "granted" : "missing"}"><strong>${currentProfile()?.consentGranted ? "监护人同意已记录" : "缺少监护人同意"}</strong><span>${currentProfile()?.consentGranted ? `版本 ${escapeHtml(currentProfile().consentVersion || "child-data-v1")}` : "请重新创建合规角色"}</span></div>
      <div class="recovery-settings"><label>账户恢复码 <span>${state.account?.recoveryConfigured ? `已配置${state.account.recoveryUpdatedAt ? ` · ${escapeHtml(new Date(state.account.recoveryUpdatedAt).toLocaleDateString("zh-CN"))}` : ""}` : "尚未配置"}</span>${state.account?.isTestAdmin ? "" : `<input id="recovery-current-password" type="password" autocomplete="current-password" placeholder="输入当前密码后生成新恢复码" />`}</label><button class="settings-action secondary-settings-action" type="button" data-action="rotate-recovery-code">${state.account?.recoveryConfigured ? "换一枚恢复码" : "生成恢复码"}</button></div>
      <button class="settings-action" type="button" data-action="export-progress">导出当前角色进度</button>
      <button class="settings-action secondary-settings-action" type="button" data-action="open-profile-creator">新建成长角色</button>
      <button class="settings-action secondary-settings-action" type="button" data-action="logout">退出登录</button>
    </section>
    <section class="settings-section">
      <h3>最近7天使用指标</h3>
      <div class="settings-stat-grid family-metrics">
        <span><strong>${state.metrics.activeDays || 0}</strong>活跃天数</span>
        <span><strong>${state.metrics.fullLoops || 0}</strong>完整闭环</span>
        <span><strong>${state.metrics.acceptanceRate || 0}%</strong>推荐接受率</span>
      </div>
      <p class="settings-note">指标只统计必要产品事件，不保存孩子输入的自由文本。它用于判断系统是否真的有帮助，而不是评价孩子。</p>
    </section>
    ${renderGemStore()}
    <section class="settings-section family-parent-view">
      <h3>本周家庭简报</h3>
      ${state.familyBrief?.status === "shared" ? renderFamilyBriefCard(true) : `<p class="settings-note">孩子还没有同意分享本周简报。草稿、日记和私人问答不会在这里显示。</p>`}
    </section>
    <section class="settings-section">
      <h3>${child().name}的真实成长账本</h3>
      <div class="settings-stat-grid">
        <span><strong>Lv.${economy.level}</strong>当前等级</span>
        <span><strong>${economy.earnedXp}</strong>任务经验</span>
        <span><strong>${economy.earnedGems}</strong>获得宝石</span>
      </div>
      <p class="settings-note">真实角色从Lv.1、0经验、0宝石开始。任务、行动、习惯、日记、作品和复盘都会留下奖励记录；每约6点经验换1颗宝石。升级后门槛提高15%，撤销完成会同步撤回奖励。</p>
    </section>
    <section class="settings-section">
      <h3>AI规划引擎</h3>
      <div class="settings-stat-grid">
        <span><strong>${status.connected ? "已连接" : "待连接"}</strong>${escapeHtml(status.provider)}</span>
        <span><strong>${escapeHtml(modelLabel)}</strong>任务模型</span>
        <span><strong>${plan.weeklyGoal ? "1" : "0"}/${scheduleCount}/${newsCount}</strong>计划/日程/消息</span>
      </div>
      <p class="settings-note">生成任务时会同时读取技能树、孩子画像、最近复盘、成长计划、近期日程和已筛选新闻消息。</p>
    </section>
    <section class="settings-section">
      <h3>推荐偏好</h3>
      <label class="setting-row">每日主任务数
        <select id="setting-daily-target">
          ${[1, 2, 3].map((value) => `<option value="${value}" ${Number(settings.dailyTarget) === value ? "selected" : ""}>${value}个</option>`).join("")}
        </select>
      </label>
      <label class="setting-row">使用新闻上下文
        <input id="setting-use-news" type="checkbox" ${settings.useNews ? "checked" : ""} />
      </label>
      <label class="setting-row setting-row-stack">新闻主题
        <input id="setting-news-topics" type="text" value="${escapeHtml(settings.newsTopics)}" maxlength="100" />
      </label>
      <button class="settings-action" type="button" data-action="save-settings">保存设置</button>
      <button class="settings-action secondary-settings-action" type="button" data-action="sync-news">同步安全新闻消息</button>
      <button class="settings-action secondary-settings-action" type="button" data-action="open-context-manager">管理计划与日程</button>
      <button class="settings-action secondary-settings-action" type="button" data-action="open-tutorial">重看新手引导</button>
    </section>
  `;
}

async function askSelfCoach(preset = "") {
  const input = document.querySelector("#self-coach-question");
  const question = String(preset || input?.value || state.selfCoachQuestion).trim();
  if (question.length < 2 || state.selfCoachLoading) { showToast("先问一个你真心想知道的问题"); return; }
  state.selfCoachQuestion = question;
  state.selfCoachLoading = true;
  if (!insightsOverlay.hidden) insightsContent.innerHTML = renderInsightsPanel();
  try {
    const response = await fetch("/api/self-coach/ask", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ profileId: state.childId, question }) });
    const answer = await response.json();
    if (!response.ok) throw new Error(answer.error || "AI暂时不知道怎么回答");
    state.selfCoachAnswers = [answer, ...state.selfCoachAnswers.filter((item) => item.id !== answer.id)].slice(0, 20);
    state.selfCoachQuestion = "";
  } catch (error) { showToast(error.message || "成长档案暂时无法回答"); }
  finally { state.selfCoachLoading = false; if (!insightsOverlay.hidden) insightsContent.innerHTML = renderInsightsPanel(); }
}

async function feedbackSelfCoach(id, feedback) {
  try {
    const response = await fetch(`/api/self-coach/${encodeURIComponent(id)}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ feedback }) });
    const answer = await response.json();
    if (!response.ok) throw new Error("feedback");
    state.selfCoachAnswers = state.selfCoachAnswers.map((item) => item.id === answer.id ? answer : item);
    insightsContent.innerHTML = renderInsightsPanel();
    showToast(feedback === "helpful" ? "记住了，这种回答方式对你有帮助" : "收到，下次不会沿用这条回答");
  } catch { showToast("暂时无法保存反馈"); }
}

async function deleteSelfCoachAnswer(id) {
  try {
    const response = await fetch(`/api/self-coach/${encodeURIComponent(id)}`, { method: "DELETE" });
    if (!response.ok) throw new Error("delete");
    state.selfCoachAnswers = state.selfCoachAnswers.filter((item) => item.id !== Number(id));
    insightsContent.innerHTML = renderInsightsPanel();
    showToast("这次问答已经删除");
  } catch { showToast("暂时无法删除这次问答"); }
}

function renderInsightsPanel() {
  const economy = economyState();
  const memories = state.cloudMemories.slice(0, 12);
  const strongest = [...child().skills].sort((left, right) => skillProgress(right) - skillProgress(left)).slice(0, 3);
  const logs = getLogs();
  const funCount = logs.filter((log) => log.fun === "有趣").length;
  const review = state.reviews[0];
  const confidenceLabel = (value) => value >= 70 ? "证据较强" : value >= 45 ? "正在形成" : "只是线索";
  const strategyCategory = { starting: "开始任务", focus: "保持专注", learning: "学习方法", creating: "推进作品", recovery: "恢复状态" };
  const coachConfidence = { enough: "有多条证据", some: "有一些线索", little: "证据还很少" };
  const coachPrompts = ["我卡住时，什么办法可能有用？", "最近我正在推进什么？", "什么任务更容易让我愿意继续？"];
  const swapReasonLabels = { too_big: "感觉有点大", not_interesting: "当时没兴趣", unclear: "不知道怎么开始", not_now: "只是当时不合适" };
  const swapSourceLabels = { action: "行动", habit: "小习惯", idea: "灵感", recharge: "恢复活动" };
  return `
    <section class="insight-hero">
      <span class="face ${escapeHtml(child().avatar)} large"></span>
      <div><small>不是分数，是成长证据</small><h3>${escapeHtml(child().name)}正在成为更懂自己的人</h3><p>Lv.${economy.level} · 完成${economy.completed}个行动 · ${memories.length}条长期记忆</p></div>
    </section>
    <section class="insights-section self-coach-section"><div class="page-head"><div><h3>问问我的成长档案</h3><small>只根据我的证据回答</small></div></div>
      <div class="self-coach-prompts">${coachPrompts.map((question) => `<button type="button" data-action="ask-self-coach-preset" data-question="${escapeHtml(question)}">${escapeHtml(question)}</button>`).join("")}</div>
      <div class="self-coach-input"><input id="self-coach-question" maxlength="300" value="${escapeHtml(state.selfCoachQuestion)}" placeholder="例如：我什么时候更容易开始？" ${state.selfCoachLoading ? "disabled" : ""} /><button type="button" data-action="ask-self-coach" ${state.selfCoachLoading ? "disabled" : ""}>${state.selfCoachLoading ? "正在查找证据..." : "问一问"}</button></div>
      <div class="self-coach-history">${state.selfCoachAnswers.slice(0, 6).map((item) => `<article class="self-coach-answer ${escapeHtml(item.feedback || "")}"><header><span>${escapeHtml(coachConfidence[item.confidence] || "证据线索")}</span><small>${item.provider === "siliconflow" ? "GLM有来源回答" : "本地有来源回答"}</small></header><h4>${escapeHtml(item.question)}</h4><p>${escapeHtml(item.answer)}</p>${item.evidence.length ? `<details><summary>查看${item.evidence.length}条来源</summary>${item.evidence.map((source) => `<div><b>${escapeHtml(source.kind)}</b><span>${escapeHtml(source.text)}</span></div>`).join("")}</details>` : `<div class="self-coach-no-evidence">成长档案还没有足够来源</div>`}${item.nextQuestion ? `<button class="self-coach-next" type="button" data-action="ask-self-coach-preset" data-question="${escapeHtml(item.nextQuestion)}">还可以想：${escapeHtml(item.nextQuestion)}</button>` : ""}<footer><button type="button" data-action="self-coach-feedback" data-answer-id="${item.id}" data-feedback="helpful">这对我有帮助</button><button type="button" data-action="self-coach-feedback" data-answer-id="${item.id}" data-feedback="not_me">这不像我</button><button type="button" data-action="delete-self-coach" data-answer-id="${item.id}">删除</button></footer>${item.feedback ? `<small class="self-coach-feedback-state">${item.feedback === "helpful" ? "我已确认有帮助" : "我已否定这条回答"}</small>` : ""}</article>`).join("") || `<p class="empty-state">你可以主动问自己，而不只是等AI给结论。</p>`}</div>
    </section>
    <section class="insights-section weekly-compass"><div class="page-head"><h3>本周成长罗盘</h3><button type="button" data-action="generate-review" ${state.reviewLoading ? "disabled" : ""}>${state.reviewLoading ? "AI正在整理证据..." : review ? "重新生成" : "生成本周罗盘"}</button></div>
      ${review ? `<article class="review-card ${escapeHtml(review.status)}"><small>${escapeHtml(review.weekStart)} · ${review.report.provider === "siliconflow" ? "GLM证据总结" : "本地证据总结"}</small><h4>${escapeHtml(review.report.headline)}</h4><div class="review-wins">${review.report.wins.map((win) => `<p>✓ ${escapeHtml(win)}</p>`).join("")}</div><div class="review-patterns">${review.report.patterns.map((pattern) => `<div><span>${escapeHtml(pattern.confidence)}</span><strong>${escapeHtml(pattern.observation)}</strong><small>${escapeHtml(pattern.evidence)}</small></div>`).join("")}</div><div class="review-focus"><small>下周只试一个方向</small><h5>${escapeHtml(review.report.nextFocus.title)}</h5><p>${escapeHtml(review.report.nextFocus.why)}</p><strong>${escapeHtml(review.report.nextFocus.tinyExperiment)}</strong></div><blockquote>${escapeHtml(review.report.question)}</blockquote><p class="gentle-reset">${escapeHtml(review.report.gentleReset)}</p><div class="review-actions"><button type="button" data-action="review-feedback" data-review-id="${review.id}" data-feedback="accurate">像我</button><button type="button" data-action="review-feedback" data-review-id="${review.id}" data-feedback="not_me">有点不像</button><button type="button" data-action="review-feedback" data-review-id="${review.id}" data-feedback="try_focus">下周试这个</button></div>${review.feedback ? `<em>已反馈：${review.feedback === "accurate" ? "像我" : review.feedback === "not_me" ? "有点不像" : "已加入下周计划"}</em>` : ""}</article>` : `<p class="empty-state">系统会根据本周行动、习惯、专注、灵感和可共享日记生成一份可纠正的总结。</p>`}
    </section>
    <section class="insights-section family-brief-section"><div class="page-head"><div><h3>给家长看的本周简报</h3><small>先由我看，再由我决定</small></div><button type="button" data-action="generate-family-brief" ${state.familyBriefLoading ? "disabled" : ""}>${state.familyBriefLoading ? "AI正在整理..." : state.familyBrief ? "重新生成" : "生成草稿"}</button></div>
      <p class="section-note">只用行动、习惯、专注、作品标题和我确认的方法，不读取日记或私人问答。</p>
      ${state.familyBrief ? renderFamilyBriefCard(false) : `<p class="empty-state">生成后先只有你能看见，点“我愿意给家长看”才会出现在设置页。</p>`}
    </section>
    <section class="insights-section recommendation-memory"><div class="page-head"><div><h3>我的换选记录</h3><small>我可以随时撤回</small></div><span>${state.dailyRecommendationCalibration.activeSignals.length ? "AI正在适应" : "继续观察"}</span></div>
      <p class="section-note">同一原因至少出现两次才会调整以后推荐，这些是当前需要，不是我的固定特点。</p>
      <div>${state.dailyPlanFeedback.slice(0, 8).map((item) => `<article><span>${escapeHtml(swapSourceLabels[item.sourceType] || "推荐")}</span><strong>${escapeHtml(swapReasonLabels[item.reason] || "换了一次")}</strong><time>${escapeHtml(new Date(item.createdAt).toLocaleDateString("zh-CN", { month: "2-digit", day: "2-digit" }))}</time><button type="button" data-action="delete-daily-feedback" data-feedback-id="${item.id}" aria-label="撤回这次换选原因">撤回</button></article>`).join("") || `<p class="empty-state">换任务时告诉AI原因，这里才会出现记录。</p>`}</div>
    </section>
    <section class="insights-section strategy-section"><div class="page-head"><div><h3>我的使用说明书</h3><small>从多条证据里找有效方法</small></div><button type="button" data-action="generate-strategies" ${state.strategyLoading ? "disabled" : ""}>${state.strategyLoading ? "AI正在合并记忆..." : state.strategyInsights.length ? "重新整理" : "整理我的方法"}</button></div>
      <div class="strategy-list">${state.strategyInsights.length ? state.strategyInsights.map((item) => `<article class="strategy-card ${escapeHtml(item.status)}"><header><span>${escapeHtml(strategyCategory[item.category] || "我的方法")}</span><strong>${item.confidence}%</strong></header><h4>${escapeHtml(item.statement)}</h4><div class="strategy-when"><small>什么时候用</small><p>${escapeHtml(item.whenToUse)}</p></div><details><summary>${item.evidence.length}条来源证据</summary>${item.evidence.slice(0, 4).map((source) => `<p><b>${escapeHtml(source.kind)}</b>${escapeHtml(source.text)}</p>`).join("")}</details><blockquote>${escapeHtml(item.question)}</blockquote><div class="strategy-actions"><button type="button" data-action="strategy-feedback" data-strategy-id="${item.id}" data-feedback="helpful">对我有帮助</button><button type="button" data-action="strategy-feedback" data-strategy-id="${item.id}" data-feedback="unsure">再观察</button><button type="button" data-action="strategy-feedback" data-strategy-id="${item.id}" data-feedback="not_for_me">不适合我</button></div><small class="strategy-context">${item.aiContext ? "AI可以参考" : "暂不进入AI"}${item.feedback ? ` · ${item.feedback === "helpful" ? "我已确认" : item.feedback === "unsure" ? "等待更多证据" : "我已否定"}` : " · 尚未确认"}</small></article>`).join("") : `<p class="empty-state">至少积累两条可共享证据后，系统才会整理方法，不会从一次经历下结论。</p>`}</div>
    </section>
    <section class="insights-section"><h3>本周看见的变化</h3><div class="insight-stat-grid"><span><b>${economy.earnedXp}</b>行动经验</span><span><b>${funCount}</b>次觉得有趣</span><span><b>${getRecommendationHistory().length}</b>次个性推荐</span></div></section>
    <section class="insights-section"><h3>正在生长的能力</h3><div class="growth-skill-list">${strongest.map((skill) => `<article><div><b>${escapeHtml(skill.name)}</b><small>${escapeHtml(skill.next)}</small></div><strong>${skillProgress(skill)}%</strong></article>`).join("")}</div></section>
    <section class="insights-section hypothesis-section"><div class="page-head"><h3>关于我的成长假设</h3><small>不是定论，可以反驳</small></div>
      <div class="hypothesis-list">${state.hypotheses.length ? state.hypotheses.slice(0, 8).map((item) => `<article class="${escapeHtml(item.status)}"><div class="hypothesis-head"><span>${escapeHtml(confidenceLabel(item.confidence))}</span><strong>${item.confidence}%</strong></div><h4>${escapeHtml(item.title)}</h4><p>${escapeHtml(item.summary)}</p><div class="confidence-track"><i style="width:${Math.max(4, item.confidence)}%"></i></div><small>${item.evidenceCount}条证据 · ${item.counterCount}条反证${item.aiContext ? " · AI可参考" : " · 暂不进入AI"}</small><div class="hypothesis-actions"><button type="button" data-action="hypothesis-feedback" data-hypothesis-id="${item.id}" data-value="confirm">像我</button><button type="button" data-action="hypothesis-feedback" data-hypothesis-id="${item.id}" data-value="unsure">还不确定</button><button type="button" data-action="hypothesis-feedback" data-hypothesis-id="${item.id}" data-value="reject">不像我</button></div></article>`).join("") : `<p class="empty-state">多记录几次日记或完成行动后，系统才会提出可验证的成长假设。</p>`}</div>
    </section>
    <section class="insights-section"><div class="page-head"><h3>我保存的成长证据</h3><small>私人记录不会给AI参考</small></div>
      <div class="memory-list">${memories.length ? memories.map((memory) => { const privateMemory = memory.evidence?.shareWithAi === false; return `<article class="${privateMemory ? "private-memory" : ""}"><span>${privateMemory ? "私人记录" : memory.kind === "completion" ? "行动" : "成长证据"}</span><p>${escapeHtml(memory.summary)}</p>${privateMemory ? `<small>AI不参考</small>` : ""}<button type="button" data-action="forget-memory" data-memory-id="${memory.id}">${privateMemory ? "删除" : "这不像我"}</button></article>`; }).join("") : `<p class="empty-state">完成任务并复盘后，这里会出现有来源的长期记忆。</p>`}</div>
    </section>
    <p class="insight-ethics">成长档案只描述可观察行为，不做天赋定论。任何记忆都可以删除或在之后被新证据修正。</p>`;
}

function openInsights() {
  if (!insightsOverlay || !insightsContent) return;
  insightsContent.innerHTML = renderInsightsPanel();
  insightsOverlay.hidden = false;
}

function renderTutorial() {
  if (!tutorialOverlay) return;
  const step = tutorialSteps[tutorialStep];
  tutorialProgress.innerHTML = tutorialSteps.map((_, index) => `<i class="${index <= tutorialStep ? "active" : ""}"></i>`).join("");
  tutorialVisual.className = `tutorial-visual tutorial-${step.icon}`;
  tutorialKicker.textContent = step.kicker;
  tutorialTitle.textContent = step.title;
  tutorialCopy.textContent = step.copy;
  const nextButton = tutorialOverlay.querySelector("[data-action='next-tutorial']");
  if (nextButton) nextButton.textContent = tutorialStep === tutorialSteps.length - 1 ? "开始冒险" : "下一步";
}

function openTutorial() {
  closeSettings();
  tutorialStep = 0;
  renderTutorial();
  tutorialOverlay.hidden = false;
}

function finishTutorial() {
  if (tutorialOverlay) tutorialOverlay.hidden = true;
  localStorage.setItem("talent-os-tutorial-complete", "1");
  state.page = "profile";
  localStorage.setItem("talent-os-page", state.page);
  render();
  content?.focus();
}

function openSettings(section = "") {
  if (!settingsOverlay || !settingsContent) return;
  settingsContent.innerHTML = renderSettingsPanel();
  settingsOverlay.hidden = false;
  if (section) settingsContent.querySelector(`#${section}`)?.scrollIntoView({ block: "start" });
}

function closeSettings() {
  if (settingsOverlay) settingsOverlay.hidden = true;
}

function showToast(message) {
  if (!pixelToast) return;
  pixelToast.textContent = message;
  pixelToast.hidden = false;
  setTimeout(() => {
    pixelToast.hidden = true;
  }, 1800);
}

async function loadRuntimeStatus() {
  if (typeof fetch !== "function") return;
  try {
    const response = await fetch("/api/status");
    if (!response.ok) return;
    state.modelStatus = await response.json();
    if (!settingsOverlay?.hidden && settingsContent) settingsContent.innerHTML = renderSettingsPanel();
  } catch {
    state.modelStatus.connected = false;
  }
}

async function syncNewsContext() {
  if (typeof fetch !== "function") return;
  const settings = getAppSettings();
  showToast("正在同步新闻上下文...");
  try {
    const response = await fetch(`/api/context/news?topics=${encodeURIComponent(settings.newsTopics)}`);
    if (!response.ok) throw new Error(`news ${response.status}`);
    const result = await response.json();
    setNewsContext(Array.isArray(result.items) ? result.items : []);
    state.modelStatus.newsAvailable = true;
    trackEvent("news_synced", { count: getNewsContext().length, provider: result.provider || "" });
    showToast(`已同步${getNewsContext().length}条安全消息`);
    if (!settingsOverlay?.hidden && settingsContent) settingsContent.innerHTML = renderSettingsPanel();
    if (state.page === "plan") render();
  } catch {
    showToast("新闻同步失败，可继续使用手动消息");
  }
}

function renderJourney(progress, total) {
  const done = progress >= total;
  const items = [
    { label: "回答", active: !done, done: progress > 0 },
    { label: "推荐", active: done, done },
    { label: "完成", active: false, done: doneToday().length > 0 },
    { label: "复盘", active: state.page === "execute", done: getLogs().length > 0 }
  ];
  return `
    <div class="journey-strip" aria-label="今日成长步骤">
      ${items.map((item, index) => `
        <span class="${item.done ? "done" : ""} ${item.active ? "active" : ""}">
          <b>${index + 1}</b>${item.label}
        </span>
      `).join("")}
    </div>
  `;
}

function doneToday() {
  const fixedDone = child().quests.filter((quest) => isDone(quest.id));
  const aiQuest = aiQuestFromResult(getAiCoachResult());
  return aiQuest && isDone(aiQuest.id) ? [...fixedDone, aiQuest] : fixedDone;
}

function skillProgress(skill) {
  const doneForSkill = completedIds().filter((id) => questById(id)?.skill === skill.id).length;
  const artifactEvidence = state.artifacts.filter((artifact) => normalizeSkillId(artifact.skill) === skill.id).length;
  return Math.min(100, skill.progress + doneForSkill * 4 + Math.min(12, artifactEvidence * 3));
}

function dotRow(score) {
  const active = Math.max(1, Math.round(score / 16.7));
  return Array.from({ length: 6 }, (_, index) => `<span class="${index < active ? "on" : ""}"></span>`).join("");
}

function recommendationDifferenceSummary(quest) {
  const history = getRecommendationHistory();
  const currentSignature = taskSignature(quest);
  const previous = history.find((record) => record.signature !== currentSignature);
  const profile = taskProfile(quest);
  if (!previous) {
    return `本次体验：${experienceLabel("mode", profile.mode)} · ${experienceLabel("setting", profile.setting)} · ${experienceLabel("output", profile.output)}`;
  }
  const previousProfile = taskProfile(previous);
  const differences = [];
  if (profile.mode !== previousProfile.mode) differences.push(`玩法换成${experienceLabel("mode", profile.mode)}`);
  if (profile.setting !== previousProfile.setting) differences.push(`场景换到${experienceLabel("setting", profile.setting)}`);
  if (profile.output !== previousProfile.output) differences.push(`产出改为${experienceLabel("output", profile.output)}`);
  if (profile.interaction !== previousProfile.interaction) differences.push(`互动改为${experienceLabel("interaction", profile.interaction)}`);
  if (normalizeSkillId(quest.skill) !== normalizeSkillId(previous.skill)) {
    differences.push(`能力改练${skillFramework[normalizeSkillId(quest.skill)]?.name || "新能力"}`);
  }
  return differences.length ? `相比上次：${differences.slice(0, 3).join("；")}` : "本次保留同一能力，但更换了具体挑战。";
}

function renderQuestCard(quest, options = {}) {
  const done = isDone(quest.id);
  const taskId = escapeHtml(quest.id);
  const evidenceNote = quest.evidenceNote || skillEvidenceNote(quest.skill);
  const experience = taskProfile(quest);
  const visibleTags = [...new Set([
    ...(quest.tags || []),
    experienceLabel("mode", experience.mode),
    experienceLabel("output", experience.output)
  ].filter(Boolean))];
  return `
    <article class="quest-card ${done ? "done" : ""}">
      <div class="quest-top">
        <span class="quest-type">${escapeHtml(quest.type)}</span>
        <span>${Number(quest.minutes) || 10}分钟 · ${escapeHtml(energyLabels[quest.energy] || "普通能量")}</span>
      </div>
      <h3>${escapeHtml(quest.title)}</h3>
      <p>${escapeHtml(quest.why)}</p>
      <div class="quest-tags">
        ${visibleTags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join("")}
      </div>
      ${options.expanded ? `
        <ol class="quest-steps">
          ${(quest.steps || []).map((step) => `<li>${escapeHtml(step)}</li>`).join("")}
        </ol>
        <div class="quest-reflect">想一想：${escapeHtml(quest.reflect)}</div>
        <div class="novelty-note">${escapeHtml(recommendationDifferenceSummary(quest))}</div>
        ${(quest.contextUsed || []).length ? `<div class="context-used-note"><strong>AI参考了</strong>${quest.contextUsed.map((item) => `<span>${escapeHtml(item)}</span>`).join("")}</div>` : ""}
        <div class="science-note">训练方法：${escapeHtml(evidenceNote)}</div>
      ` : ""}
      ${options.readOnly ? `
        <div class="read-only-note">${escapeHtml(skillFramework[normalizeSkillId(quest.skill)]?.name || "能力")}候选，不是待办清单</div>
      ` : `
        <button class="primary-action" type="button" data-action="toggle-task" data-task-id="${taskId}" data-reward="${Number(quest.reward) || 0}">
          ${done ? "已完成，经验已到账" : `我做完了 +${Number(quest.reward) || 0}经验`}
        </button>
      `}
    </article>
  `;
}

async function generateDailyPlan(options = {}) {
  if (state.dailyPlanLoading) return;
  state.dailyPlanLoading = true;
  render();
  try {
    const response = await fetch("/api/daily-plan/generate", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ profileId: state.childId, energy: state.dailyCheckin.energy || state.dailyPlan?.checkin.energy || "normal", minutes: Number(state.dailyCheckin.minutes || state.dailyPlan?.checkin.minutes || 10), intent: state.dailyCheckin.intent || state.dailyPlan?.checkin.intent || "finish", swap: options.swap === true, swapReason: options.swapReason || "", lighter: options.lighter === true }) });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "今天暂时选不出下一步");
    state.dailyPlan = result;
    state.dailyCheckin = { energy: result.checkin.energy, minutes: result.checkin.minutes, intent: result.checkin.intent };
    state.dailySwapOpen = false;
    showToast(options.swap ? "换成了另一件真正不同的事" : options.lighter ? "已经缩成更轻的一小步" : "AI已经选好现在的下一步");
  } catch (error) { showToast(error.message || "暂时无法安排下一步"); }
  finally { state.dailyPlanLoading = false; render(); }
}

async function deleteDailyPlanFeedback(id) {
  try {
    const response = await fetch(`/api/daily-plan-feedback/${encodeURIComponent(id)}`, { method: "DELETE" });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "撤回失败");
    state.dailyPlanFeedback = state.dailyPlanFeedback.filter((item) => item.id !== Number(id));
    state.dailyRecommendationCalibration = result.calibration || state.dailyRecommendationCalibration;
    if (result.dailyPlan) state.dailyPlan = result.dailyPlan;
    if (!insightsOverlay.hidden) insightsContent.innerHTML = renderInsightsPanel();
    showToast("这次换选原因已撤回，AI校准已经重算");
  } catch (error) { showToast(error.message || "暂时无法撤回"); }
}

function dailyPlanSourceDone() {
  const plan = state.dailyPlan?.plan;
  if (!plan) return false;
  if (plan.sourceType === "action") return state.actions.find((item) => item.id === Number(plan.sourceId))?.status === "done";
  if (plan.sourceType === "habit") return state.habits.find((item) => item.id === Number(plan.sourceId))?.todayStatus === "done";
  if (plan.sourceType === "idea") return state.ideas.find((item) => item.id === Number(plan.sourceId))?.status === "done";
  return false;
}

async function startDailyPlan() {
  const daily = state.dailyPlan;
  if (!daily?.plan) return;
  const plan = daily.plan;
  const completingRecharge = plan.sourceType === "recharge" && daily.status === "started";
  try {
    const response = await fetch(`/api/daily-plan/${encodeURIComponent(daily.id)}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ feedback: completingRecharge ? "completed" : "accepted" }) });
    if (!response.ok) throw new Error("今日状态保存失败");
    state.dailyPlan = await response.json();
  } catch {
    showToast("状态暂时没有保存，请再试一次");
    return;
  }
  if (plan.sourceType === "recharge") {
    render();
    showToast(completingRecharge ? "恢复完成，状态已经照顾好了" : `现在只做：${plan.firstStep}`);
    return;
  }
  if (plan.sourceType === "action") {
    const action = state.actions.find((item) => item.id === Number(plan.sourceId));
    if (action) { if (action.status !== "doing") await updateAction(action.id, "doing"); await startFocus({ ...action, estimateMinutes: plan.minutes }); return; }
  }
  if (plan.sourceType === "habit") { state.showPlanningDetails = true; render(); showToast("习惯已经展开，只完成这一次就好"); return; }
  if (plan.sourceType === "idea") { state.page = "discover"; render(); showToast("已经打开这颗灵感，从最小一步开始"); return; }
}

function renderDailyCompass() {
  const daily = state.dailyPlan;
  if (state.dailyPlanLoading) return `<section class="panel daily-compass checkin loading"><div class="daily-kicker">AI今日指挥台</div><h2>正在从已有事项中选择</h2><p>不会再加一张新清单，只找现在最合适的一步。</p><div class="thinking-dots"><span></span><span></span><span></span></div></section>`;
  if (!daily) {
    const energy = state.dailyCheckin.energy;
    const minutes = state.dailyCheckin.minutes;
    const stage = !energy ? "energy" : !minutes ? "minutes" : "intent";
    const questions = { energy: ["你现在的能量怎么样？", "没有标准答案，按真实感觉选。"], minutes: ["你现在有多少时间？", "只看眼前这一小段时间。"], intent: ["这一小段，你更想怎样？", "方向由你选，AI只帮你找最合适的一步。"] };
    const choices = {
      energy: [["low","有点累"],["normal","还可以"],["high","很有劲"]],
      minutes: [[5,"5分钟"],[10,"10分钟"],[20,"20分钟"],[30,"半小时"]],
      intent: [["finish","推进一件事"],["create","创造点东西"],["reset","保持小节奏"],["recharge","先恢复能量"]]
    };
    return `<section class="panel daily-compass checkin"><div class="daily-kicker">AI今日指挥台 · ${stage === "energy" ? "1" : stage === "minutes" ? "2" : "3"}/3</div><h2>${questions[stage][0]}</h2><p>${questions[stage][1]}</p>
      <div class="daily-answer-grid intent-${stage}">${choices[stage].map(([value,label]) => `<button type="button" data-action="daily-checkin" data-field="${stage}" data-value="${value}">${label}</button>`).join("")}</div>
      ${stage !== "energy" ? `<button class="daily-back" type="button" data-action="daily-checkin-back" data-stage="${stage}">上一步</button>` : ""}</section>`;
  }
  const plan = daily.plan;
  const sourceLabels = { action: "来自我的行动", habit: "来自我的节奏", idea: "来自我的灵感", recharge: "来自我的状态" };
  const rhythmLabels = { no_time: "优先短任务", no_energy: "优先低能量", unclear: "优先明确第一步", not_important: "优先重要事项" };
  const recommendationLabels = { too_big: "最近更需要小任务", not_interesting: "正在增加不同类型", unclear: "最近更需要清楚第一步", not_now: "尊重当下时机" };
  const sourceDone = dailyPlanSourceDone();
  const planCompleted = sourceDone || daily.status === "completed";
  const primaryLabel = plan.sourceType === "recharge"
    ? daily.status === "started" ? "我恢复好了" : "开始恢复"
    : daily.status === "started" ? "继续这一小步" : "现在开始";
  const nextLabel = plan.sourceType === "recharge" ? "状态照顾好了，选下一步" : "这件完成了，选下一步";
  const intentLabels = { finish: "我想推进", create: "我想创造", reset: "我想保持节奏", recharge: "我想先恢复", learn: "我想学习" };
  return `<section class="panel daily-compass ready ${escapeHtml(daily.status)}"><header><div><span>现在只做这一件</span><small>${plan.provider === "siliconflow" ? "GLM选择" : "本地选择"} · ${escapeHtml(sourceLabels[plan.sourceType] || "个性化下一步")}</small></div><strong>${plan.minutes}分钟</strong></header>
    <h2>${escapeHtml(plan.title)}</h2><p>${escapeHtml(plan.why)}</p>${plan.goalTitle ? `<div class="daily-goal-link">正在推进：${escapeHtml(plan.goalTitle)}${plan.keyResultTitle ? `<small>对应 ${escapeHtml(plan.keyResultTitle)}</small>` : ""}</div>` : ""}${plan.decisionSignals?.length ? `<div class="daily-rhythm-link">节奏适配：${plan.decisionSignals.map((signal) => escapeHtml(rhythmLabels[signal] || signal)).join(" · ")}</div>` : ""}${plan.recommendationSignals?.length ? `<div class="daily-recommendation-link">AI正在适应：${plan.recommendationSignals.map((signal) => escapeHtml(recommendationLabels[signal] || signal)).join(" · ")}</div>` : ""}<div class="daily-first-step"><small>第一小步</small><strong>${escapeHtml(plan.firstStep)}</strong></div><blockquote><small>${escapeHtml(plan.motivator && plan.motivator !== "unknown" ? motivationLabels[plan.motivator] || "个性化支持" : "低压力支持")}</small>${escapeHtml(plan.support)}</blockquote>
    <div class="daily-actions">${planCompleted ? `<button class="daily-primary" type="button" data-action="daily-plan-next">${nextLabel}</button>` : `<button class="daily-primary" type="button" data-action="start-daily-plan">${primaryLabel}</button>`}<button type="button" data-action="open-daily-swap">换一个</button><button type="button" data-action="lighten-daily-plan" ${plan.minutes <= 5 ? "disabled" : ""}>轻一点</button></div>
    ${state.dailySwapOpen ? `<div class="daily-swap-dialog"><strong>这次为什么想换？</strong><small>只选最接近的一项，帮助AI少猜一点。</small><div><button type="button" data-action="swap-daily-plan" data-reason="too_big">感觉有点大</button><button type="button" data-action="swap-daily-plan" data-reason="not_interesting">现在没兴趣</button><button type="button" data-action="swap-daily-plan" data-reason="unclear">不知道怎么开始</button><button type="button" data-action="swap-daily-plan" data-reason="not_now">只是现在不合适</button></div><button class="daily-swap-cancel" type="button" data-action="close-daily-swap">不换了</button></div>` : ""}
    <footer><span>${escapeHtml(intentLabels[daily.checkin.intent] || "我的选择")} · ${escapeHtml({ low: "低能量", normal: "普通能量", high: "高能量" }[daily.checkin.energy] || "当前状态")} · ${daily.checkin.minutes}分钟</span><button type="button" data-action="reset-daily-plan">重新回答</button></footer></section>`;
}

function actionReason(action) {
  const reasons = [];
  if (action.dueAt) {
    const hours = (new Date(action.dueAt).getTime() - Date.now()) / 3600000;
    if (hours <= 0) reasons.push("已经到时间");
    else if (hours <= 24) reasons.push("今天截止");
    else if (hours <= 72) reasons.push("近期要做");
  }
  if (action.energy === (getCoachSession().answers.energy || getPrefs().energy)) reasons.push("适合当前能量");
  if (Number(action.estimateMinutes) <= Number(getCoachSession().answers.time || 15)) reasons.push("现在有时间完成");
  if (Number(action.importance) === 3) reasons.push("很重要");
  return reasons.slice(0, 3);
}

function renderActionInbox() {
  const result = state.actionInboxResult;
  if (state.actionInboxLoading) return `<div class="action-inbox thinking"><strong>AI正在听你想表达什么</strong><div class="thinking-dots"><span></span><span></span><span></span></div></div>`;
  if (!result) return `<div class="action-inbox capture-inbox"><label for="action-inbox-text">随手记一句</label><div><input id="action-inbox-text" maxlength="1000" value="${escapeHtml(state.actionInboxText)}" placeholder="要做的事、突然的灵感、今天的感悟都可以" /><button type="button" data-action="parse-action-inbox">帮我收好</button></div><small>AI先判断放进哪里，由你确认后才保存。</small></div>`;
  if (result.status === "question") return `<div class="action-inbox question"><small>AI只问一个关键问题</small><strong>${escapeHtml(result.question)}</strong><div class="inbox-options">${result.options.map((option) => `<button type="button" data-action="answer-action-inbox" data-field="${escapeHtml(result.answerField)}" data-value="${escapeHtml(option.value)}">${escapeHtml(option.label)}</button>`).join("")}</div><button class="inbox-back" type="button" data-action="edit-action-inbox">修改原话</button></div>`;
  if (result.status === "duplicate") return `<div class="action-inbox duplicate"><small>这件事已经在行动台</small><strong>${escapeHtml(result.duplicate.title)}</strong><p>${result.duplicate.estimateMinutes}分钟 · ${result.duplicate.status === "doing" ? "正在做" : "等待开始"}</p><div><button type="button" data-action="open-duplicate-action" data-action-id="${result.duplicate.id}">打开原来的行动</button><button type="button" data-action="edit-action-inbox">换种说法</button></div></div>`;
  const draft = result.draft;
  const categoryLabel = { action: "要做的事", idea: "灵感火花", journal: "成长感悟" }[draft.category] || "随手记录";
  const linkedGoal = state.goals.find((goal) => goal.id === Number(draft.goalId || 0));
  if (draft.category === "action") {
    const action = draft.action;
    return `<div class="action-inbox preview capture-preview action"><header><small>${result.provider === "siliconflow" ? "GLM判断" : "本地判断"} · ${categoryLabel}</small><button type="button" data-action="edit-action-inbox">修改</button></header><h3>${escapeHtml(action.title)}</h3>${action.detail ? `<p>${escapeHtml(action.detail)}</p>` : ""}${linkedGoal ? `<div class="capture-goal-link">正在推进：${escapeHtml(linkedGoal.title)}</div>` : ""}<div class="inbox-facts"><span>${action.estimateMinutes}分钟</span><span>${escapeHtml({ low: "低能量", normal: "普通能量", high: "高能量" }[action.energy] || "普通能量")}</span><span>${action.importance === 3 ? "很重要" : action.importance === 1 ? "普通" : "重要"}</span><span>${escapeHtml(inboxDueLabel(action.dueAt))}</span></div><div class="inbox-first-step"><small>第一小步</small><strong>${escapeHtml(action.firstStep)}</strong></div><button class="inbox-confirm" type="button" data-action="confirm-action-inbox">确认加入行动台</button></div>`;
  }
  return `<div class="action-inbox preview capture-preview ${escapeHtml(draft.category)}"><header><small>${result.provider === "siliconflow" ? "GLM判断" : "本地判断"} · ${categoryLabel}</small><button type="button" data-action="edit-action-inbox">修改</button></header><h3>${escapeHtml(draft.title)}</h3><p>${escapeHtml(draft.content)}</p>${linkedGoal && draft.category === "idea" ? `<div class="capture-goal-link">正在探索：${escapeHtml(linkedGoal.title)}</div>` : ""}${draft.tags?.length ? `<div class="inbox-facts">${draft.tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join("")}</div>` : ""}${draft.category === "journal" ? `<label class="capture-memory-consent"><input id="capture-ai-context" type="checkbox" ${state.captureShareWithAi ? "checked" : ""} />允许AI以后参考这条感悟</label>` : `<div class="capture-gentle-note">先保存成灵感，不会自动加入待办。</div>`}<button class="inbox-confirm" type="button" data-action="confirm-action-inbox">${draft.category === "idea" ? "放进灵感池" : "写进成长日记"}</button></div>`;
}

function renderActionNegotiation(action) {
  const negotiation = state.actionNegotiation;
  if (!negotiation || negotiation.actionId !== Number(action.id)) return "";
  if (negotiation.loading) return `<div class="action-negotiation loading"><strong>AI正在和你一起重新决定</strong><div class="thinking-dots"><span></span><span></span><span></span></div></div>`;
  if (!negotiation.result) return `<div class="action-negotiation"><header><strong>现在为什么不适合做？</strong><button type="button" data-action="close-action-negotiation">×</button></header><p>选真实原因，不会扣经验。</p><div class="negotiation-reasons">${[["no_energy","现在没力气"],["no_time","现在没时间"],["unclear","不知道怎么做"],["not_important","它不重要了"]].map(([value,label]) => `<button type="button" data-action="request-action-negotiation" data-action-id="${action.id}" data-reason="${value}">${label}</button>`).join("")}</div></div>`;
  const suggestion = negotiation.result.suggestion;
  return `<div class="action-negotiation result"><header><small>${suggestion.provider === "siliconflow" ? "GLM协商建议" : "本地协商建议"}</small><button type="button" data-action="close-action-negotiation">×</button></header><p>${escapeHtml(suggestion.message)}</p><div class="negotiation-tiny"><small>如果想缩小</small><strong>${escapeHtml(suggestion.tinyStep)}</strong></div><em>${escapeHtml(suggestion.support)}</em><div class="negotiation-outcomes"><button type="button" data-action="apply-action-negotiation" data-action-id="${action.id}" data-outcome="shrink">缩成5分钟</button><button type="button" data-action="apply-action-negotiation" data-action-id="${action.id}" data-outcome="tomorrow">明天再做</button><button type="button" data-action="apply-action-negotiation" data-action-id="${action.id}" data-outcome="someday">放到以后</button><button type="button" data-action="apply-action-negotiation" data-action-id="${action.id}" data-outcome="drop">不做了</button></div></div>`;
}

function renderDecisionCalibration() {
  const calibration = state.decisionCalibration || {};
  if (!Number(calibration.sampleSize || 0)) return "";
  const copy = { no_time: "最近几次时间不够，AI会优先短任务", no_energy: "最近几次能量不足，AI会优先低能量任务", unclear: "最近几次第一步不清楚，AI会优先步骤明确的任务", not_important: "最近几次任务不再重要，AI会提高重要事项优先级" };
  const signals = (calibration.activeSignals || []).map((signal) => copy[signal]).filter(Boolean);
  return `<div class="decision-calibration ${signals.length ? "active" : "observing"}"><strong>${signals.length ? "AI正在适应我的当前节奏" : "AI还在观察当前节奏"}</strong><p>${signals.length ? signals.join("；") : `已有${calibration.sampleSize}次协商，至少两次出现同一原因才调整推荐。`}</p><small>这是当前节奏，不是能力或性格标签。</small></div>`;
}

function renderActionDesk() {
  const ranked = rankedActions();
  const current = ranked[0];
  const later = ranked.slice(1, 6);
  const parked = state.actions.filter((action) => ["someday", "dropped"].includes(action.status) || (["open", "doing"].includes(action.status) && action.notBefore && new Date(action.notBefore).getTime() > Date.now())).slice(0, 12);
  const doneCount = state.actions.filter((action) => action.status === "done").length;
  return `
    <section class="panel action-desk">
      <div class="page-head"><h2 class="panel-title">${pixelIcon("skill-check", "")} 我的行动台</h2><span class="tag">${ranked.length}待行动 · ${Math.round((state.focusSummary.weekSeconds || 0) / 60)}分钟专注</span></div>
      ${renderActionInbox()}
      ${renderDecisionCalibration()}
      ${current ? `<article class="now-action ${escapeHtml(current.status)}"><header><span>现在做</span><small>${current.estimateMinutes}分钟 · ${energyLabels[current.energy] || "普通能量"}</small></header><h3>${escapeHtml(current.title)}</h3>${current.detail ? `<p>${escapeHtml(current.detail)}</p>` : ""}<div class="action-reasons">${actionReason(current).map((reason) => `<i>${escapeHtml(reason)}</i>`).join("") || "<i>当前最合适</i>"}</div>${current.steps.length ? `<ol>${current.steps.map((step) => `<li>${escapeHtml(step)}</li>`).join("")}</ol><strong class="action-success">完成标准：${escapeHtml(current.success)}</strong>` : ""}<div class="focus-launch"><select id="focus-minutes" aria-label="专注时长"><option value="5">5分钟</option><option value="10" selected>10分钟</option><option value="20">20分钟</option></select><button type="button" data-action="start-focus" data-action-id="${current.id}">进入专注舱</button></div>${renderActionNegotiation(current)}<footer>${current.steps.length ? "" : `<button type="button" data-action="breakdown-action" data-action-id="${current.id}">${state.actionLoadingId === current.id ? "AI拆解中..." : "让AI拆小"}</button>`}<button type="button" data-action="open-action-negotiation" data-action-id="${current.id}">现在不合适</button><button type="button" data-action="update-action" data-status="done" data-action-id="${current.id}">我完成了</button><button class="action-remove" type="button" data-action="delete-action" data-action-id="${current.id}" aria-label="删除行动">×</button></footer></article>` : `<div class="action-empty"><strong>现在没有必须做的事</strong><p>可以去灵感工坊抓住一个想法，或者安心休息。</p></div>`}
      ${later.length ? `<div class="later-actions"><h3>接下来</h3>${later.map((action) => `<article><button class="action-check" type="button" data-action="update-action" data-status="done" data-action-id="${action.id}" aria-label="完成行动">○</button><div><strong>${escapeHtml(action.title)}</strong><small>${action.estimateMinutes}分钟${action.dueAt ? ` · ${escapeHtml(new Date(action.dueAt).toLocaleString("zh-CN", { month:"2-digit", day:"2-digit", hour:"2-digit", minute:"2-digit" }))}` : ""}</small></div><button type="button" data-action="update-action" data-status="doing" data-action-id="${action.id}">现在做</button></article>`).join("")}</div>` : ""}
      ${parked.length ? `<details class="parked-actions"><summary>以后再看 · ${parked.length}</summary>${parked.map((action) => `<article><div><strong>${escapeHtml(action.title)}</strong><small>${action.status === "dropped" ? "已决定不做" : action.status === "someday" ? "没有日期" : `安排到${escapeHtml(new Date(action.notBefore).toLocaleDateString("zh-CN", { month:"2-digit", day:"2-digit" }))}`}${action.deferCount ? ` · 调整${action.deferCount}次` : ""}</small></div><button type="button" data-action="update-action" data-status="open" data-action-id="${action.id}">重新加入</button><button type="button" data-action="delete-action" data-action-id="${action.id}">删除</button></article>`).join("")}</details>` : ""}
    </section>`;
}

function renderHabitRhythm() {
  const dueHabits = state.habits.filter((habit) => habit.dueToday);
  const doneTodayCount = dueHabits.filter((habit) => habit.todayStatus === "done").length;
  const modeLabel = { daily: "每天", weekdays: "上学日", custom: "自选日期" };
  return `
    <section class="panel habit-rhythm">
      <div class="page-head"><h2 class="panel-title">${pixelIcon("flow-learn", "")} 我的节奏</h2><span class="tag">今天 ${doneTodayCount}/${dueHabits.length}</span></div>
      <p class="section-note">习惯要小到容易开始。暂停一天不是失败，重点是找到适合自己的节奏。</p>
      <div class="habit-create"><input id="habit-title" maxlength="80" placeholder="我想保持……" /><input id="habit-cue" maxlength="120" placeholder="在什么之后做？" /><select id="habit-minutes" aria-label="习惯时长"><option value="2">2分钟</option><option value="5" selected>5分钟</option><option value="10">10分钟</option></select><select id="habit-frequency" aria-label="习惯频率"><option value="daily">每天</option><option value="weekdays">上学日</option></select><button type="button" data-action="create-habit">新建</button></div>
      <div class="habit-list">${state.habits.map((habit) => `<article class="${escapeHtml(habit.todayStatus)}"><div class="habit-mark">${habit.todayStatus === "done" ? "✓" : habit.todayStatus === "skip" ? "Ⅱ" : "·"}</div><div><strong>${escapeHtml(habit.title)}</strong><small>${modeLabel[habit.frequency.mode] || "每天"} · ${habit.targetMinutes}分钟${habit.cue ? ` · ${escapeHtml(habit.cue)}之后` : ""}</small><span>连续节奏 ${habit.streak}次 · 共完成 ${habit.totalDone}次</span></div><footer>${habit.todayStatus === "pending" ? `<button type="button" data-action="checkin-habit" data-status="done" data-habit-id="${habit.id}">今天完成</button><button type="button" data-action="checkin-habit" data-status="skip" data-habit-id="${habit.id}">今天暂停</button>` : `<button type="button" data-action="checkin-habit" data-status="pending" data-habit-id="${habit.id}">撤销</button>`}<button class="habit-delete" type="button" data-action="delete-habit" data-habit-id="${habit.id}" aria-label="删除习惯">×</button></footer></article>`).join("") || `<p class="empty-state">从一个2分钟的小动作开始，比立一个很大的目标更容易坚持。</p>`}</div>
    </section>`;
}

function renderToday() {
  const c = child();
  const question = nextCoachQuestion();
  const progress = answeredQuestions().length;
  const aiResult = getAiCoachResult();
  const quest = aiQuestFromResult(aiResult) || recommendedQuest();
  const sourceLabel = aiResult ? "GLM-5.2推荐" : "本地推荐";
  const contextAnswers = contextAnswerDetails();
  const latestLog = getLogs()[0];
  return `
    <section class="growth-loop-guide"><strong>今天的成长循环</strong><div><span class="done">认识我</span><i>→</i><span class="done">选方向</span><i>→</i><span class="active">做一步</span><i>→</i><span>留记录</span></div></section>
    ${renderDailyCompass()}
    ${state.showPlanningDetails ? "" : `<section class="panel quick-capture-panel">${renderActionInbox()}</section>`}
    ${state.showPlanningDetails ? `${renderActionDesk()}${renderHabitRhythm()}<section class="panel planning-toggle"><button type="button" data-action="toggle-planning-details">收起全部清单</button></section>` : `<section class="panel planning-toggle"><div><button type="button" data-action="toggle-planning-details">管理全部行动与习惯</button>${state.dailyPlan ? "" : `<button type="button" data-action="toggle-quest-coach">${state.showQuestCoach ? "收起探索任务" : "探索一个新任务"}</button>`}</div><small>${rankedActions().length}个现在可做 · ${state.habits.filter((item) => item.dueToday && item.todayStatus === "pending").length}个今日习惯</small></section>`}
    ${!state.dailyPlan && state.showQuestCoach ? `
    <section class="panel kid-hero-panel">
      <span class="kicker">${c.shortAge} · ${c.playerType}</span>
      <h1>${c.name}，先回答AI几句话</h1>
      <p>不用先看一堆清单。你回答，AI给你一个刚刚好的任务。</p>
      ${renderJourney(progress, coachQuestions.length)}
      <div class="signal-chips">
        <span>画像 ${contextAnswers.length}/${contextQuestions.length}</span>
        <span>${latestLog ? `上次：${escapeHtml(latestLog.difficulty)}` : "还没有复盘"}</span>
        <span>${escapeHtml(sourceLabel)}</span>
      </div>
    </section>

    <section class="panel">
      <div class="page-head">
        <h2 class="panel-title">${pixelIcon("skill-ai", "")} AI小教练</h2>
        <span class="tag">${progress} / ${coachQuestions.length}</span>
      </div>
      ${question ? `
        <article class="coach-card">
          <strong>${question.title}</strong>
          <p>${question.hint}</p>
          <div class="answer-grid">
            ${question.answers.map((answer) => `
              <button type="button" data-action="answer-coach" data-question="${question.id}" data-value="${answer.value}">
                ${answer.label}
              </button>
            `).join("")}
          </div>
        </article>
      ` : state.aiLoading ? `
        <article class="coach-card thinking">
          <strong>AI正在想一个刚刚好的任务</strong>
          <p>我会看你的回答、孩子画像和最近复盘，只给一个任务。</p>
          <div class="thinking-dots"><span></span><span></span><span></span></div>
        </article>
      ` : `
        <article class="coach-card ready">
          <strong>今天推荐这个任务</strong>
          <p>${escapeHtml(aiResult?.coachLine || recommendReason(quest))}</p>
          ${state.aiError ? `<p class="coach-error">模型暂时没连上，先用本地推荐。</p>` : ""}
          <div class="coach-summary">
            ${coachAnswerDetails().map(({ question, answer }) => `<span>${escapeHtml(question.title.replace("？", ""))}：${escapeHtml(answer.label)}</span>`).join("")}
            <span>${escapeHtml(sourceLabel)}</span>
          </div>
          ${renderQuestCard(quest, { expanded: true })}
          <div class="coach-actions">
            <button type="button" data-action="skip-quest" data-task-id="${escapeHtml(quest.id)}">换一个</button>
            <button type="button" data-action="reset-coach">重新回答</button>
          </div>
        </article>
      `}
    </section>
    ` : ""}

    <section class="panel">
      <h2 class="panel-title">${pixelIcon("nav-home", "")} 今天认识自己</h2>
      <div class="self-word-list">
        ${c.selfWords.map((word) => `<p>${word}</p>`).join("")}
      </div>
    </section>
  `;
}

function recommendReason(quest) {
  const details = coachAnswerDetails();
  const energy = details.find(({ question }) => question.id === "energy")?.answer.label;
  const interest = details.find(({ question }) => question.id === "interest")?.answer.label;
  const friction = details.find(({ question }) => question.id === "friction")?.answer.label;
  const time = details.find(({ question }) => question.id === "time")?.answer.label;
  return `因为你说今天${energy || "状态还可以"}、想${interest || "做点事"}、卡点是${friction || "未知"}，而且愿意用${time || "一点"}，所以先给你「${quest.title}」。`;
}

async function requestAiCoachRecommendation() {
  trackEvent("coach_started", { answeredQuestions: answeredQuestions().length });
  state.aiLoading = true;
  state.aiError = "";
  clearAiCoachResult();
  render();
  try {
    const response = await fetch("/api/coach", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(buildCoachPayload())
    });
    if (!response.ok) {
      throw new Error(`coach api ${response.status}`);
    }
    const result = await response.json();
    setAiCoachResult(result);
    trackEvent("coach_generated", { skill: result.recommendation?.skill || "", mode: result.recommendation?.mode || "", minutes: result.recommendation?.minutes || 0 });
  } catch (error) {
    console.warn(error);
    state.aiError = "AI暂时不可用";
    trackEvent("coach_failed", { reason: "request_failed" });
    const fallback = recommendedQuest();
    if (fallback) rememberRecommendation(fallback, "local-fallback");
  } finally {
    state.aiLoading = false;
    render();
  }
}

async function requestAiGrowthPlan() {
  if (typeof fetch !== "function") return;
  state.planLoading = true;
  render();
  try {
    const response = await fetch("/api/plan", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(buildCoachPayload())
    });
    if (!response.ok) throw new Error(`plan api ${response.status}`);
    const result = await response.json();
    setGrowthPlan({
      weeklyGoal: result.weeklyGoal || getGrowthPlan().weeklyGoal,
      focusSkill: normalizeSkillId(result.focusSkill || getGrowthPlan().focusSkill),
      constraints: result.constraints || getGrowthPlan().constraints,
      rationale: result.rationale || "",
      milestones: Array.isArray(result.milestones) ? result.milestones.slice(0, 5) : []
    });
    clearAiCoachResult();
    trackEvent("plan_generated", { milestoneCount: Array.isArray(result.milestones) ? result.milestones.length : 0, focusSkill: result.focusSkill || "" });
    showToast("本周计划已由GLM生成");
  } catch (error) {
    console.warn(error);
    showToast("计划生成失败，请检查模型连接");
  } finally {
    state.planLoading = false;
    render();
  }
}

function buildCoachPayload() {
  const c = child();
  const session = getCoachSession();
  const recentRecommendations = getRecommendationHistory().slice(0, 12);
  const appSettings = getAppSettings();
  const upcomingSchedule = getScheduleItems()
    .filter((item) => !item.start || new Date(item.start).getTime() >= Date.now() - 86400000)
    .slice(0, 12);
  const newsMessages = appSettings.useNews ? getNewsContext().slice(0, 8).map((item) => ({
    title: item.title,
    summary: item.summary || "",
    source: item.source || item.domain || "",
    date: item.date || "",
    url: item.url || ""
  })) : [];
  return {
    childId: state.childId,
    child: {
      name: c.name,
      age: c.shortAge,
      playerType: c.playerType,
      motto: c.motto,
      traits: c.traits,
      skills: c.skills.map((skill) => ({
        ...skill,
        progress: skillProgress(skill)
      }))
    },
    skillFramework,
    evidenceSources,
    today: {
      date: todayKey(),
      answers: Object.fromEntries(coachAnswerDetails().map(({ question, answer }) => [question.id, answer.label])),
      rawAnswers: getCoachSession().answers,
      maxMinutes: maxMinutes(),
      tags: coachTags()
    },
    durableContext: Object.fromEntries(contextAnswerDetails().map(({ question, answer }) => [question.id, {
      question: question.title,
      answer
    }])),
    planningContext: {
      weeklyPlan: getGrowthPlan(),
      growthDirections: state.goals.filter((goal) => goal.status === "active").map(({ id, title, why, successSignal, firstExperiment, skill, progress, evidenceCount }) => ({ id, title, why, successSignal, firstExperiment, skill, progress, evidenceCount })),
      upcomingSchedule,
      newsMessages,
      dailyTaskTarget: Number(appSettings.dailyTarget || 1),
      ideaPipeline: state.ideas.filter((idea) => ["incubating", "active"].includes(idea.status)).slice(0, 8).map((idea) => ({ title: idea.title, status: idea.status, nextStep: idea.nextStep, skill: idea.skill, goalId: idea.goalId || 0 })),
      actionQueue: rankedActions().slice(0, 12).map((action) => ({ title: action.title, status: action.status, estimateMinutes: action.estimateMinutes, energy: action.energy, importance: action.importance, dueAt: action.dueAt, source: action.source, goalId: action.goalId || 0, steps: action.steps })),
      decisionCalibration: state.decisionCalibration,
      habitRhythm: state.habits.slice(0, 12).map((habit) => ({ title: habit.title, dueToday: habit.dueToday, todayStatus: habit.todayStatus, streak: habit.streak, totalDone: habit.totalDone, targetMinutes: habit.targetMinutes })),
      focusPattern: { weekMinutes: Math.round((state.focusSummary.weekSeconds || 0) / 60), completedSessions: state.focusSummary.completedSessions || 0, recent: (state.focusSummary.recent || []).slice(0, 6).map((session) => ({ title: session.title, elapsedMinutes: Math.round(session.elapsedSeconds / 60), outcome: session.outcome })) },
      confirmedWeeklyReview: state.reviews[0] && state.reviews[0].feedback !== "not_me" ? { headline: state.reviews[0].report.headline, nextFocus: state.reviews[0].report.nextFocus, feedback: state.reviews[0].feedback, patterns: state.reviews[0].report.patterns } : null,
      rules: [
        "日程拥挤或高消耗时缩短任务，不与已有安排冲突",
        "新闻只用于连接真实问题和项目灵感，不把成人焦虑交给孩子",
        "计划决定近期重点，但不能让单一技能连续垄断推荐",
        "成长方向解释为什么做；优先连接已有方向，但不能为了对齐方向而忽略截止事项、状态或孩子的新兴趣"
      ]
    },
    history: {
      recentReflections: getLogs().slice(0, 5),
      longTermMemories: aiEligibleMemories(state.cloudMemories).slice(0, state.strategyInsights.some((item) => item.aiContext) ? 8 : 20),
      recentJournal: aiEligibleJournals(state.journals).slice(0, 8).map((entry) => ({ source: entry.source, prompt: entry.prompt, content: entry.content.slice(0, 800), tags: entry.tags, createdAt: entry.createdAt })),
      activeHypotheses: aiEligibleHypotheses(state.hypotheses).slice(0, 8).map((item) => ({ title: item.title, summary: item.summary, confidence: item.confidence, evidenceCount: item.evidenceCount, counterCount: item.counterCount })),
      strategyInsights: state.strategyInsights.filter((item) => item.aiContext && item.status === "active").slice(0, 6).map((item) => ({ statement: item.statement, whenToUse: item.whenToUse, confidence: item.confidence, feedback: item.feedback, evidenceCount: item.evidence.length })),
      taskCalibration: state.feedbackCalibration,
      recentTaskFeedback: state.taskFeedback.slice(0, 10).map((entry) => ({ taskTitle: entry.taskTitle, skill: entry.skill, mode: entry.mode, difficulty: entry.difficulty, enjoyment: entry.enjoyment, support: entry.support, motivation: entry.motivation, feedbackDate: entry.feedbackDate })),
      artifactEvidence: state.artifacts.filter((artifact) => artifact.shareWithAi).slice(0, 12).map((artifact) => ({ title: artifact.title, type: artifact.type, skill: artifact.skill, taskKey: artifact.taskKey, caption: artifact.caption, textExcerpt: artifact.type === "text" ? artifact.content.slice(0, 500) : "", linkUrl: artifact.type === "link" ? artifact.linkUrl : "", createdAt: artifact.createdAt })),
      completedTaskIds: completedIds().slice(-20),
      preferences: getPrefs(),
      recentRecommendations,
      avoidedToday: session.avoidedRecommendations || []
    },
    diversityPolicy: diversityTargets(),
    learningDesignRules: trainingPrinciples,
    candidateQuests: recommendedQuests(4).map((quest) => ({
      id: quest.id,
      title: quest.title,
      type: quest.type,
      skill: quest.skill,
      minutes: quest.minutes,
      energy: quest.energy,
      tags: quest.tags,
      mode: quest.mode,
      setting: quest.setting,
      output: quest.output,
      interaction: quest.interaction,
      why: quest.why,
      steps: quest.steps,
      reflect: quest.reflect,
      reward: quest.reward
    }))
  };
}

function renderRecommendations() {
  const quests = recommendedQuests(3);
  const primary = aiQuestFromResult(getAiCoachResult()) || quests[0];
  const details = coachAnswerDetails();
  const contextAnswers = contextAnswerDetails();
  const ruleCards = trainingPrinciples.slice(0, 4);
  const ideaStatus = { spark: "灵感池", incubating: "孵化中", active: "行动中", done: "已长成", dismissed: "已放下" };
  const visibleIdeas = state.ideas.filter((idea) => idea.status !== "dismissed");
  const dismissedIdeas = state.ideas.filter((idea) => idea.status === "dismissed");
  const resurfacing = state.ideaResurfacing;
  return `
    <section class="panel idea-workshop">
      <div class="page-head"><h2 class="panel-title">${pixelIcon("flow-build", "")} 灵感工坊</h2><span class="tag">${visibleIdeas.filter((idea) => idea.status !== "done").length}颗火花</span></div>
      <p class="section-note">先抓住一个念头，不急着判断好不好。AI可以帮我把它变成一个10分钟微行动。</p>
      <div class="idea-capture"><input id="idea-title" maxlength="80" placeholder="我突然想到……" /><button type="button" data-action="capture-idea">收下灵感</button></div>
      <div class="idea-resurface-zone">
        ${resurfacing ? `<article class="idea-resurface-card"><header><span>AI唤醒了一颗旧灵感</span><small>一次只看一颗</small></header><h3>${escapeHtml(resurfacing.title)}</h3><p class="resurface-why">${escapeHtml(resurfacing.prompt.whyNow)}</p><strong>${escapeHtml(resurfacing.prompt.question)}</strong><p class="resurface-angle">新角度：${escapeHtml(resurfacing.prompt.freshAngle)}</p><div class="resurface-step"><span>10分钟试试看</span>${escapeHtml(resurfacing.prompt.tinyStep)}</div><div class="resurface-actions"><button type="button" data-action="decide-idea-resurfacing" data-outcome="try">试10分钟</button><button type="button" data-action="decide-idea-resurfacing" data-outcome="keep">继续收藏</button><button type="button" data-action="decide-idea-resurfacing" data-outcome="later">过阵子再看</button><button type="button" class="quiet" data-action="decide-idea-resurfacing" data-outcome="dismiss">放下它</button></div></article>` : `<button class="idea-wake-button" type="button" data-action="request-idea-resurfacing" ${state.ideaResurfacingLoading ? "disabled" : ""}>${state.ideaResurfacingLoading ? "AI正在翻找旧灵感..." : "唤醒一颗旧灵感"}</button><small class="idea-wake-note">成长方向、我的方法和最近消息会一起提供新角度</small>`}
      </div>
      <div class="idea-board">${visibleIdeas.slice(0, 12).map((idea) => `<article class="idea-card ${escapeHtml(idea.status)}"><header><span>${ideaStatus[idea.status] || "灵感"}</span><time>${escapeHtml(new Date(idea.updatedAt).toLocaleDateString("zh-CN", { month:"2-digit", day:"2-digit" }))}</time></header><h3>${escapeHtml(idea.title)}</h3>${idea.note ? `<p>${escapeHtml(idea.note)}</p>` : ""}${idea.ai ? `<div class="idea-ai"><small>AI想问：${escapeHtml(idea.ai.question || "")}</small><div>${(idea.ai.possibilities || []).map((option) => `<i>${escapeHtml(option)}</i>`).join("")}</div></div>` : ""}${idea.nextStep ? `<strong class="idea-next">下一步：${escapeHtml(idea.nextStep)}</strong>` : ""}<footer>${idea.status === "spark" ? `<button type="button" data-action="develop-idea" data-idea-id="${idea.id}">${state.ideaLoadingId === idea.id ? "AI孵化中..." : "让AI发展"}</button>` : ""}${idea.status === "incubating" ? `<button type="button" data-action="set-idea-status" data-status="active" data-idea-id="${idea.id}">开始行动</button>` : ""}${idea.status === "active" ? `<button type="button" data-action="set-idea-status" data-status="done" data-idea-id="${idea.id}">完成成果</button>` : ""}<button type="button" class="idea-delete" data-action="delete-idea" data-idea-id="${idea.id}" aria-label="删除灵感">×</button></footer></article>`).join("") || `<p class="empty-state">灵感可以是一句话、一个问题、一幅画，甚至是“我想试试看”。</p>`}</div>
      ${dismissedIdeas.length ? `<details class="dismissed-ideas"><summary>已放下的灵感 ${dismissedIdeas.length}</summary>${dismissedIdeas.slice(0, 12).map((idea) => `<p><span>${escapeHtml(idea.title)}</span><button type="button" data-action="set-idea-status" data-status="spark" data-idea-id="${idea.id}">重新收藏</button></p>`).join("")}</details>` : ""}
    </section>

    <section class="panel">
      <div class="page-head">
        <h2 class="panel-title">${pixelIcon("nav-discover", "")} AI为什么这样推荐</h2>
        <span class="tag">不是普通清单</span>
      </div>
      <p class="section-note">AI先看今天状态，再看我的说明书和复盘，只选一个最合适的小任务。</p>
      <div class="recommend-reason signal-board">
        ${details.length ? details.map(({ question, answer }) => `<span>${escapeHtml(question.title.replace("？", ""))}：${escapeHtml(answer.label)}</span>`).join("") : "<span>先去今日回答AI问题</span>"}
        ${contextAnswers.slice(0, 3).map(({ question, answer }) => `<span>${escapeHtml(question.title.replace("？", ""))}：${escapeHtml(answer)}</span>`).join("")}
        ${getPrefs().likedTags.slice(0, 2).map((tag) => `<span>最近喜欢：${escapeHtml(tag)}</span>`).join("")}
      </div>
    </section>

    <section class="panel">
      <h2 class="panel-title">${pixelIcon("book", "")} 当前最佳下一步</h2>
      ${renderQuestCard(primary, { expanded: true })}
    </section>

    <section class="panel">
      <h2 class="panel-title">${pixelIcon("flow-learn", "")} AI的训练规则</h2>
      <div class="coach-rules rule-grid">
        ${ruleCards.map((rule) => `
          <p>
            <strong>${escapeHtml(rule.name)}</strong>
            <span>${escapeHtml(rule.childTip)}</span>
            <small>${rule.evidence.map((id) => escapeHtml(evidenceSources[id])).join(" / ")}</small>
          </p>
        `).join("")}
      </div>
    </section>

    <section class="panel">
      <h2 class="panel-title">${pixelIcon("chest", "")} 候选池</h2>
      <p class="section-note">这些只是候选信号，AI不会一次把它们都压给你。</p>
      <div class="quest-list">
        ${quests.map((quest) => renderQuestCard(quest, { readOnly: true })).join("")}
      </div>
    </section>
  `;
}

async function shapeGrowthGoal() {
  const input = document.querySelector("#goal-text");
  state.goalText = input?.value.trim() || state.goalText;
  if (state.goalText.length < 2 || state.goalLoading) { showToast("先说一个你真心想探索的方向"); return; }
  state.goalLoading = true;
  render();
  try {
    const context = Object.fromEntries(contextAnswerDetails().map(({ question, answer }) => [question.id, { question: question.title, answer }]));
    const response = await fetch("/api/goals/shape", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ profileId: state.childId, text: state.goalText, context }) });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "AI暂时没整理清楚");
    state.goalDraft = result;
  } catch (error) { showToast(error.message || "暂时无法整理这个方向"); }
  finally { state.goalLoading = false; render(); }
}

async function confirmGrowthGoal() {
  const draft = state.goalDraft?.draft;
  if (!draft) return;
  try {
    const response = await fetch("/api/goals", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ profileId: state.childId, ...draft }) });
    const goal = await response.json();
    if (!response.ok) throw new Error(goal.error || "方向保存失败");
    state.goals = [goal, ...state.goals];
    state.goalDraft = null;
    state.goalText = "";
    showToast("成长方向已经点亮，先从一个小实验开始");
    render();
  } catch (error) { showToast(error.message || "方向保存失败"); }
}

async function updateGrowthGoal(id, status) {
  try {
    const response = await fetch(`/api/goals/${encodeURIComponent(id)}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ status }) });
    const goal = await response.json();
    if (!response.ok) throw new Error(goal.error || "更新失败");
    state.goals = state.goals.map((item) => item.id === goal.id ? goal : item);
    showToast(status === "done" ? "这个方向已经留下成果" : status === "paused" ? "方向先休息，不会失去进度" : "方向重新点亮了");
    render();
  } catch (error) { showToast(error.message || "方向暂时无法更新"); }
}

async function deleteGrowthGoal(id) {
  try {
    const response = await fetch(`/api/goals/${encodeURIComponent(id)}`, { method: "DELETE" });
    if (!response.ok) throw new Error("delete");
    state.goals = state.goals.filter((goal) => goal.id !== Number(id));
    showToast("方向已删除，原来的行动和作品仍然保留");
    render();
  } catch { showToast("方向暂时无法删除"); }
}

async function startGoalExperiment(id) {
  const goal = state.goals.find((item) => item.id === Number(id));
  if (!goal) return;
  try {
    const response = await fetch("/api/actions", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ profileId: state.childId, title: goal.firstExperiment, detail: `来自成长方向：${goal.title}`, estimateMinutes: 10, energy: "normal", importance: 2, goalId: goal.id }) });
    const action = await response.json();
    if (!response.ok) throw new Error(action.error || "行动创建失败");
    state.actions = [action, ...state.actions];
    await loadGoals();
    trackEvent("goal_experiment_started", { goalId: goal.id, actionId: action.id });
    showToast("第一个实验已加入行动台");
    render();
  } catch (error) { showToast(error.message || "暂时无法开始实验"); }
}

function renderGrowthGoals() {
  const activeCount = state.goals.filter((goal) => goal.status === "active").length;
  const draft = state.goalDraft;
  const statusLabels = { active: "探索中", paused: "休息中", done: "已留下成果" };
  return `<section class="panel growth-goals">
    <div class="page-head"><h2 class="panel-title">${pixelIcon("nav-map", "")} 我的成长方向</h2><span class="tag">${activeCount}/3 点亮</span></div>
    <p class="section-note">方向回答“我为什么想做这些”。一次只点亮少数几个，随时可以暂停或改变。</p>
    ${draft ? `<article class="goal-draft"><header><small>${draft.provider === "siliconflow" ? "GLM生成SMART目标" : "本地SMART目标"}</small><button type="button" data-action="edit-goal-draft">重新说</button></header><h3>${escapeHtml(draft.draft.objective || draft.draft.title)}</h3><p>${escapeHtml(draft.draft.why)}</p><div class="smart-grid">${Object.entries({具体: draft.draft.smart?.specific, 可衡量: draft.draft.smart?.measurable, 可做到: draft.draft.smart?.achievable, 有意义: draft.draft.smart?.relevant, 有时限: draft.draft.smart?.timeBound}).map(([label,value]) => value ? `<span><small>${label}</small><strong>${escapeHtml(value)}</strong></span>` : "").join("")}</div><div class="okr-preview"><small>OKR · 三个关键结果</small>${(draft.draft.keyResults || []).map((kr,index) => `<p><b>KR${index + 1}</b>${escapeHtml(kr.title)}</p>`).join("")}</div><div><small>今天自动安排的第一步</small><strong>${escapeHtml(draft.draft.firstExperiment)}</strong></div><footer><span>${escapeHtml(skillDisplayName(draft.draft.skill))} · 四周一轮</span><button type="button" data-action="confirm-goal">采用这个目标</button></footer></article>` : `<div class="goal-capture"><input id="goal-text" maxlength="600" value="${escapeHtml(state.goalText)}" placeholder="我想学会…… / 我想做出…… / 我想改善……" /><button type="button" data-action="shape-goal" ${state.goalLoading || activeCount >= 3 ? "disabled" : ""}>${state.goalLoading ? "AI正在整理..." : activeCount >= 3 ? "先暂停一个方向" : "生成SMART目标"}</button></div>`}
    <div class="goal-list">${state.goals.map((goal) => `<article class="goal-card ${escapeHtml(goal.status)}"><header><span>${escapeHtml(statusLabels[goal.status] || "方向")}</span><small>SMART · OKR · ${escapeHtml(skillDisplayName(goal.skill))}</small></header><h3>${escapeHtml(goal.objective || goal.title)}</h3><p>${escapeHtml(goal.why)}</p><div class="goal-progress"><span><i style="width:${goal.progress}%"></i></span><small>${goal.evidenceCount}个成果证据 · ${goal.activeSteps}步正在推进</small></div><div class="okr-preview">${(goal.keyResults || []).map((kr,index) => `<p><b>KR${index + 1}</b>${escapeHtml(kr.title)} <em>目标${kr.target}${escapeHtml(kr.unit)}</em></p>`).join("")}</div><div class="goal-signal"><small>SMART成功信号</small><strong>${escapeHtml(goal.successSignal)}</strong></div><footer>${goal.status === "active" ? `<button type="button" data-action="start-goal-experiment" data-goal-id="${goal.id}" ${goal.activeSteps ? "disabled" : ""}>${goal.activeSteps ? "今日行动已安排" : "安排第一个行动"}</button><button type="button" data-action="update-goal" data-status="paused" data-goal-id="${goal.id}">先休息</button><button type="button" data-action="update-goal" data-status="done" data-goal-id="${goal.id}">完成本轮</button>` : goal.status === "paused" ? `<button type="button" data-action="update-goal" data-status="active" data-goal-id="${goal.id}">重新点亮</button><button type="button" data-action="delete-goal" data-goal-id="${goal.id}">删除</button>` : `<button type="button" data-action="delete-goal" data-goal-id="${goal.id}">收起这段旅程</button>`}</footer></article>`).join("") || `<p class="empty-state">先让AI通过提问认识你，再建立第一条SMART目标。</p>`}</div>
  </section>`;
}

function renderSkills() {
  const c = child();
  return `
    ${renderGrowthGoals()}
    <section class="panel">
      <div class="page-head">
        <h2 class="panel-title">${pixelIcon("nav-map", "")} 我的能力树</h2>
        <span class="tag">${c.playerType}</span>
      </div>
      <p class="section-note">这棵树面向 AI 时代：会自我管理、会判断、会表达、会用数据和 AI，也会做作品。不是做越多越好，是找到最适合我的下一步。</p>
    </section>

    <section class="panel skill-board">
      ${c.skills.map((skill) => `
        <article class="skill-node kid-skill-node">
          <div class="skill-badge">${pixelIcon(pixelIconBySkill[skill.id] || "skill-book", "")}</div>
          <div>
            <strong>${skill.name} Lv.${skill.level}</strong>
            <p>${skillFramework[skill.id]?.childMeaning || skill.science}</p>
            <small>${skillFramework[skill.id]?.futureWhy || skill.next}</small>
            <div class="bar-track"><span style="width: ${skillProgress(skill)}%"></span></div>
            <div class="skill-methods">
              ${(skillFramework[skill.id]?.trainWith || [skill.next]).slice(0, 3).map((item) => `<span>${item}</span>`).join("")}
            </div>
            <div class="evidence-tags">
              ${(skillFramework[skill.id]?.evidence || []).slice(0, 3).map((id) => `<span>${evidenceSources[id]}</span>`).join("")}
            </div>
          </div>
        </article>
      `).join("")}
    </section>

    <section class="panel">
      <h2 class="panel-title">${pixelIcon("flow-build", "")} 升级方法</h2>
      <div class="method-steps">
        ${["看懂目标", "拆成小步", "动手试试", "检查结果", "说出发现"].map((step, index) => `
          <article>
            <span>${index + 1}</span>
            <strong>${step}</strong>
          </article>
        `).join("")}
      </div>
    </section>
  `;
}

function formatScheduleTime(value) {
  if (!value) return "时间未定";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function renderSelf() {
  const c = child();
  const contextQuestion = nextContextQuestion();
  const contextAnswers = contextAnswerDetails();
  const plan = getGrowthPlan();
  const scheduleItems = getScheduleItems();
  const newsItems = getNewsContext();
  return `
    <section class="panel context-hub-panel">
      <div class="page-head">
        <h2 class="panel-title">${pixelIcon("nav-project", "")} AI规划上下文</h2>
        <span class="tag">大模型实时读取</span>
      </div>
      <p class="section-note">技能树决定长期方向；计划和日程决定今天能做什么；新闻消息提供真实世界的项目灵感。</p>
      <div class="context-source-grid">
        <span><strong>8</strong>技能节点</span>
        <span><strong>${plan.weeklyGoal ? 1 : 0}</strong>成长计划</span>
        <span><strong>${scheduleItems.length}</strong>近期日程</span>
        <span><strong>${newsItems.length}</strong>新闻消息</span>
      </div>
    </section>

    <section class="panel context-editor-panel">
      <h2 class="panel-title">${pixelIcon("skill-check", "")} 本周成长计划</h2>
      <label class="context-field">本周最想推进什么
        <textarea id="plan-weekly-goal" maxlength="240" placeholder="例如：完成一个Minecraft村庄防御讲解">${escapeHtml(plan.weeklyGoal)}</textarea>
      </label>
      <label class="context-field">重点能力
        <select id="plan-focus-skill">
          <option value="">让AI判断</option>
          ${Object.entries(skillFramework).map(([id, skill]) => `<option value="${id}" ${plan.focusSkill === id ? "selected" : ""}>${skill.name}</option>`).join("")}
        </select>
      </label>
      <label class="context-field">本周限制或家庭安排
        <input id="plan-constraints" type="text" maxlength="160" value="${escapeHtml(plan.constraints)}" placeholder="例如：周三晚有课，周末可以户外" />
      </label>
      <button class="primary-action context-save-button" type="button" data-action="save-growth-plan">保存并交给AI</button>
      <button class="primary-action context-save-button ai-plan-button" type="button" data-action="generate-growth-plan" ${state.planLoading ? "disabled" : ""}>${state.planLoading ? "GLM正在编排..." : "让GLM生成本周计划"}</button>
      ${plan.rationale ? `<p class="plan-rationale">AI规划理由：${escapeHtml(plan.rationale)}</p>` : ""}
      ${Array.isArray(plan.milestones) && plan.milestones.length ? `
        <div class="milestone-list">
          ${plan.milestones.map((milestone, index) => `
            <article><span>${index + 1}</span><div><strong>${escapeHtml(milestone.title)}</strong><small>${escapeHtml(milestone.when || "本周")} · ${escapeHtml(skillFramework[normalizeSkillId(milestone.skill)]?.name || "综合能力")}</small></div></article>
          `).join("")}
        </div>
      ` : ""}
    </section>

    <section class="panel context-editor-panel">
      <div class="page-head">
        <h2 class="panel-title">${pixelIcon("flow-build", "")} 近期日程</h2>
        <span class="tag">避免撞车</span>
      </div>
      <div class="context-inline-form">
        <input id="schedule-title" type="text" maxlength="60" placeholder="日程名称" />
        <input id="schedule-start" type="datetime-local" />
        <select id="schedule-energy">
          <option value="low">结束后会累</option>
          <option value="normal" selected>普通消耗</option>
          <option value="high">结束后有精神</option>
        </select>
        <button type="button" data-action="add-schedule">加入日程</button>
      </div>
      <div class="context-item-list">
        ${scheduleItems.length ? scheduleItems.map((item) => `
          <article class="context-item">
            <div><strong>${escapeHtml(item.title)}</strong><small>${escapeHtml(formatScheduleTime(item.start))} · ${escapeHtml(energyLabels[item.energy] || "普通能量")}</small></div>
            <button type="button" data-action="delete-schedule" data-item-id="${escapeHtml(item.id)}" aria-label="删除日程">×</button>
          </article>
        `).join("") : `<p class="empty-state">还没有近期日程。AI会默认今天时间自由。</p>`}
      </div>
    </section>

    <section class="panel context-editor-panel">
      <div class="page-head">
        <h2 class="panel-title">${pixelIcon("nav-discover", "")} 新闻与消息</h2>
        <button class="panel-link" type="button" data-action="sync-news">同步新闻</button>
      </div>
      <p class="section-note">只作为项目灵感，不把灾难、暴力、政治冲突等成人新闻交给孩子。</p>
      <div class="context-inline-form news-form">
        <input id="news-title" type="text" maxlength="100" placeholder="消息标题" />
        <input id="news-summary" type="text" maxlength="220" placeholder="一句摘要或为什么值得关注" />
        <button type="button" data-action="add-news-context">加入上下文</button>
      </div>
      <div class="context-item-list">
        ${newsItems.length ? newsItems.slice(0, 8).map((item) => `
          <article class="context-item news-context-item">
            <div><strong>${escapeHtml(item.title)}</strong><small>${escapeHtml(item.source || item.domain || "手动消息")} ${item.date ? `· ${escapeHtml(item.date)}` : ""}</small></div>
            <button type="button" data-action="delete-news-context" data-item-id="${escapeHtml(item.id)}" aria-label="删除消息">×</button>
          </article>
        `).join("") : `<p class="empty-state">还没有消息。可以手动添加，也可以在设置里选择主题后同步。</p>`}
      </div>
    </section>

    <section class="panel kid-hero-panel">
      <span class="kicker">不是标签，是说明书</span>
      <h1>我越来越懂自己</h1>
      <p>我可以知道自己擅长什么、哪里容易卡住、下一次可以试什么办法。</p>
    </section>

    <section class="panel">
      <div class="page-head">
        <h2 class="panel-title">${pixelIcon("skill-ai", "")} AI还想了解我</h2>
        <span class="tag">${contextAnswers.length} / ${contextQuestions.length}</span>
      </div>
      ${contextQuestion ? `
        <article class="context-card">
          <strong>${contextQuestion.title}</strong>
          <p>${contextQuestion.why}</p>
          <div class="answer-grid">
            ${contextQuestion.options.map((option) => `
              <button type="button" data-action="answer-context" data-question="${contextQuestion.id}" data-value="${option}">
                ${option}
              </button>
            `).join("")}
          </div>
        </article>
      ` : `
        <article class="context-card complete">
          <strong>AI已经有第一版说明书</strong>
          <p>以后每次任务、复盘和作品都会继续修正它。</p>
        </article>
      `}
      <div class="context-summary">
        ${contextAnswers.length ? contextAnswers.map(({ question, answer }) => `<span>${question.title.replace("？", "")}：${escapeHtml(answer)}<button type="button" data-action="edit-context-answer" data-question="${escapeHtml(question.id)}">修改</button></span>`).join("") : "<span>先回答一个问题，AI才会更懂你</span>"}
      </div>
      <div class="context-map">
        ${contextQuestions.map((question) => {
          const answered = getContextProfile()[question.id]?.value;
          return `<span class="${answered ? "done" : ""}">${answered ? "✓" : "·"} ${question.title.replace("？", "")}</span>`;
        }).join("")}
      </div>
    </section>

    <section class="panel">
      <h2 class="panel-title">${pixelIcon("boy-avatar", "")} 我的特点</h2>
      <div class="trait-list">
        ${c.traits.map((trait) => `
          <article class="trait-card">
            <div>
              <strong>${trait.name}</strong>
              <span>${trait.score}</span>
            </div>
            <div class="bar-track"><span style="width: ${trait.score}%"></span></div>
            <p>${trait.I}</p>
            <small>可以试试：${trait.grow}</small>
          </article>
        `).join("")}
      </div>
    </section>

    <section class="panel">
      <h2 class="panel-title">${pixelIcon("skill-book", "")} 心理学小工具</h2>
      <div class="psych-grid">
        ${c.psychology.map((item) => `
          <article>
            <strong>${item.title}</strong>
            <p>${item.text}</p>
          </article>
        `).join("")}
      </div>
    </section>
  `;
}

function feedbackTaskOptions() {
  const quests = doneToday().map((quest) => ({ key: `quest:${quest.id}`, title: quest.title, skill: normalizeSkillId(quest.skill), mode: taskProfile(quest).mode }));
  const actions = state.actions.filter((action) => action.status === "done").slice(0, 8).map((action) => ({ key: `action:${action.id}`, title: action.title, skill: action.source === "idea" ? "creation" : "self-regulation", mode: action.source === "idea" ? "design" : "organize" }));
  return [...quests, ...actions].filter((task, index, all) => all.findIndex((item) => item.key === task.key) === index);
}

function calibrationCopy() {
  const calibration = state.feedbackCalibration;
  if (!calibration.sampleSize) return "还没有体验反馈，AI会先观察，不急着下结论。";
  if (calibration.pace === "shrink") return "最近有些任务偏难，AI会把下一步拆得更小。";
  if (calibration.pace === "stretch") return "最近有些任务偏简单，AI会加一点刚好的挑战。";
  if (calibration.pace === "steady") return "最近的挑战度大致合适，AI会继续换玩法探索。";
  return "反馈还不多，AI会继续观察，不把一次感受当成固定特点。";
}

const motivationLabels = { autonomy: "我能自己选", progress: "看见我变好", curiosity: "想知道结果", making: "做出了东西", connection: "能分享给别人", purpose: "觉得这件事有用", wellbeing: "先照顾状态", unknown: "还不知道" };

function motivationCopy() {
  const calibration = state.feedbackCalibration || {};
  const preferred = calibration.preferredMotivators || [];
  if (!Number(calibration.motivationEvidence || 0)) return "还不知道什么最能推动你，按这一次的真实感觉选。";
  if (!preferred.length) return `已经收到${calibration.motivationEvidence}次动力线索，还需要多观察几次。`;
  return `最近重复出现：${preferred.map((value) => motivationLabels[value] || value).join("、")}。这只是当前线索，随时可以变化。`;
}

function artifactModeLabel(type) {
  return { text: "文字", photo: "照片", audio: "录音", link: "链接" }[type] || "作品";
}
function skillDisplayName(skillId) {
  return skillFramework[normalizeSkillId(skillId)]?.name || "创造项目";
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("file"));
    reader.readAsDataURL(file);
  });
}

async function saveArtifact() {
  if (state.artifactSaving) return false;
  const title = document.querySelector("#artifact-title")?.value.trim() || "";
  const caption = document.querySelector("#artifact-caption")?.value.trim() || "";
  const taskKey = document.querySelector("#artifact-task")?.value || "self";
  const linkedTask = feedbackTaskOptions().find((task) => task.key === taskKey);
  const contentText = document.querySelector("#artifact-text")?.value.trim() || "";
  const linkUrl = document.querySelector("#artifact-link")?.value.trim() || "";
  const shareWithAi = document.querySelector("#artifact-ai-context")?.checked !== false;
  const file = document.querySelector("#artifact-file")?.files?.[0];
  if (title.length < 2) { showToast("先给作品取一个名字"); return false; }
  if (["photo", "audio"].includes(state.artifactMode) && !file) { showToast(state.artifactMode === "photo" ? "请选择一张作品照片" : "请选择一段作品录音"); return false; }
  if (file && file.size > 2 * 1024 * 1024) { showToast("文件不能超过2MB"); return false; }
  state.artifactSaving = true;
  const saveButton = document.querySelector("[data-action='save-artifact']");
  if (saveButton) { saveButton.disabled = true; saveButton.textContent = "正在放上作品架..."; }
  try {
    const mediaData = file ? await fileToDataUrl(file) : "";
    const response = await fetch("/api/artifacts", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ profileId: state.childId, taskKey, title, skill: linkedTask?.skill || "creation", type: state.artifactMode, caption, content: contentText, linkUrl, mediaData, shareWithAi }) });
    const artifact = await response.json();
    if (!response.ok) throw new Error(artifact.error || "artifact");
    const revision = Boolean(state.artifactRevision);
    await loadCloudProgress(state.childId);
    const rewarded = grantBonusReward(`artifact:${artifact.id}`, { xp: 15, gems: 3, label: revision ? "完成作品新版本" : "留下真实作品" });
    if (!rewarded) showToast(revision ? "新版本已加入作品轨迹" : "作品已放上成长作品架");
    state.artifactRevision = null;
    return true;
  } catch (error) { showToast(error.message === "artifact" ? "作品暂时保存失败" : error.message); return false; }
  finally { state.artifactSaving = false; }
}

function startArtifactRevision(id) {
  const artifact = state.artifacts.find((item) => item.id === Number(id));
  if (!artifact) return;
  state.artifactRevision = { taskKey: artifact.taskKey, title: artifact.title, nextVersion: artifact.versionCount + 1 };
  state.artifactMode = artifact.type;
  render();
  document.querySelector("#artifact-title")?.focus();
  showToast(`开始做第${artifact.versionCount + 1}版，旧版本会完整保留`);
}

async function toggleArtifactPrivacy(id, shareWithAi) {
  try {
    const response = await fetch(`/api/artifacts/${encodeURIComponent(id)}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ shareWithAi }) });
    if (!response.ok) throw new Error("privacy");
    await loadCloudProgress(state.childId);
    render();
    showToast(shareWithAi ? "AI以后可以参考作品说明" : "这件作品已退出AI记忆");
  } catch { showToast("暂时无法修改作品隐私"); }
}

async function deleteArtifact(id) {
  try {
    const response = await fetch(`/api/artifacts/${encodeURIComponent(id)}`, { method: "DELETE" });
    if (!response.ok) throw new Error("delete");
    revokeBonusReward(`artifact:${id}`);
    await loadCloudProgress(state.childId);
    render();
    showToast("作品及关联成长证据已删除");
  } catch { showToast("暂时无法删除作品"); }
}

function renderArtifactStudio() {
  const tasks = feedbackTaskOptions();
  const type = state.artifactMode;
  const revision = state.artifactRevision;
  return `<section class="panel artifact-panel">
    <div class="page-head"><h2 class="panel-title">${pixelIcon("skill-craft", "")} 我的作品架</h2><span class="tag">${state.artifacts.length}件证据</span></div>
    <p class="artifact-intro">留下一个看得见的版本。作品不需要完美，它会记录我怎么一步步变好。</p>
    <div class="artifact-modes" role="group" aria-label="作品类型">${[["text","写下来"],["photo","拍下来"],["audio","讲出来"],["link","作品链接"]].map(([value,label]) => `<button type="button" data-action="set-artifact-mode" data-mode="${value}" class="${type === value ? "active" : ""}">${label}</button>`).join("")}</div>
    <div class="artifact-form">
      ${revision ? `<div class="artifact-revision-banner"><strong>正在做第${revision.nextVersion}版</strong><span>旧版本不会被覆盖</span><button type="button" data-action="cancel-artifact-revision">取消</button></div>` : ""}
      <input id="artifact-title" maxlength="100" value="${escapeHtml(revision?.title || "")}" placeholder="给作品取个名字" />
      <select id="artifact-task" aria-label="关联任务"><option value="self" ${revision?.taskKey === "self" ? "selected" : ""}>这是我主动做的作品</option>${tasks.map((task) => `<option value="${escapeHtml(task.key)}" ${revision?.taskKey === task.key ? "selected" : ""}>来自：${escapeHtml(task.title)}</option>`).join("")}</select>
      ${type === "text" ? `<textarea id="artifact-text" rows="4" maxlength="4000" placeholder="写下作品内容、一个发现，或者这次做出的版本……"></textarea>` : ""}
      ${["photo","audio"].includes(type) ? `<label class="artifact-file"><input id="artifact-file" type="file" accept="${type === "photo" ? "image/jpeg,image/png,image/webp" : "audio/mpeg,audio/mp4,audio/wav,audio/ogg,audio/webm"}" /><span>${type === "photo" ? "选择作品照片" : "选择作品录音"}<small>单个文件不超过2MB</small></span></label>` : ""}
      ${type === "link" ? `<input id="artifact-link" type="url" maxlength="1000" placeholder="https://我的作品链接" />` : ""}
      <textarea id="artifact-caption" rows="2" maxlength="500" placeholder="我最想记住的是……（可选）"></textarea>
      <label class="artifact-consent"><input id="artifact-ai-context" type="checkbox" checked />允许AI参考作品名称和我的说明，不读取照片或录音原文件</label>
      <button class="primary-action" type="button" data-action="save-artifact">放上作品架</button>
    </div>
    <div class="artifact-shelf">${state.artifacts.slice(0, 12).map((artifact) => `<article class="artifact-card ${escapeHtml(artifact.type)}">
      <div class="artifact-media">${artifact.type === "photo" ? `<img src="${escapeHtml(artifact.mediaUrl)}" alt="${escapeHtml(artifact.title)}" />` : artifact.type === "audio" ? `<audio controls preload="none" src="${escapeHtml(artifact.mediaUrl)}"></audio>` : artifact.type === "text" ? `<p>${escapeHtml(artifact.content.slice(0, 240))}</p>` : `<a href="${escapeHtml(artifact.linkUrl)}" target="_blank" rel="noopener noreferrer">打开作品链接</a>`}</div>
      <header><span>${artifactModeLabel(artifact.type)} · 第${artifact.versionNumber}版${artifact.versionCount > 1 ? ` / 共${artifact.versionCount}版` : ""}</span><time>${escapeHtml(new Date(artifact.createdAt).toLocaleDateString("zh-CN", { month: "2-digit", day: "2-digit" }))}</time></header>
      <h3>${escapeHtml(artifact.title)}</h3>${artifact.caption ? `<p>${escapeHtml(artifact.caption)}</p>` : ""}<small>${escapeHtml(skillDisplayName(artifact.skill))} · ${artifact.shareWithAi ? "AI可参考说明" : "仅自己保存"}</small>
      <footer><button type="button" data-action="start-artifact-revision" data-artifact-id="${artifact.id}">做下一版</button><button type="button" data-action="toggle-artifact-privacy" data-artifact-id="${artifact.id}" data-share="${artifact.shareWithAi ? "false" : "true"}">${artifact.shareWithAi ? "停止给AI参考" : "允许AI参考"}</button><button type="button" data-action="delete-artifact" data-artifact-id="${artifact.id}">删除</button></footer>
    </article>`).join("") || `<p class="empty-state">第一件作品可以只是一句话、一张草图或一分钟讲解。</p>`}</div>
  </section>`;
}

function renderReflect() {
  const c = child();
  const done = doneToday();
  const logs = getLogs();
  const tagOptions = [...new Set(c.quests.flatMap((quest) => quest.tags))].slice(0, 10);
  const feedbackTasks = feedbackTaskOptions();
  return `
    <section class="panel journal-panel">
      <div class="page-head"><h2 class="panel-title">${pixelIcon("skill-book", "")} 我的成长日记</h2><span class="tag">${state.journals.length}篇</span></div>
      <p class="journal-intro">记下灵感、感悟、困惑，或者今天突然懂了什么。这里没有标准答案。</p>
      <div class="journal-modes" role="group" aria-label="日记方式">
        ${[["self","自由写"],["ai","AI提问"],["hybrid","边写边问"]].map(([value,label]) => `<button type="button" data-action="set-journal-mode" data-mode="${value}" class="${state.journalMode === value ? "active" : ""}">${label}</button>`).join("")}
      </div>
      ${state.journalMode !== "self" ? `<div class="journal-question-actions"><button class="journal-question-button" type="button" data-action="ask-journal-question" ${state.journalLoading ? "disabled" : ""}>${state.journalLoading ? "AI正在想问题..." : state.journalPrompt ? "换一个问题" : "生成一个问题"}</button><button class="journal-followup-button" type="button" data-action="ask-journal-followup" ${state.journalLoading || state.journalDraft.trim().length < 2 ? "disabled" : ""}>${state.journalDraft.trim().length < 2 ? "写一句后可继续问" : "沿着这句继续问"}</button></div>` : ""}
      ${state.journalPrompt ? `<article class="journal-prompt"><small>第1步 · ${state.journalPrompt.source === "ai" ? "AI根据我的最近经历提问" : "今日灵感问题"}</small><strong>${escapeHtml(state.journalPrompt.question)}</strong>${state.journalPrompt.starter ? `<button type="button" data-action="use-journal-starter" data-starter="${escapeHtml(state.journalPrompt.starter)}">用这个开头：${escapeHtml(state.journalPrompt.starter)}</button>` : ""}</article>` : ""}
      <label class="journal-answer-label" for="journal-content"><b>${state.journalPrompt ? "第2步" : "写下一句"}</b><span>${state.journalPrompt ? "在下面写下你的回答，没有标准答案" : "灵感、感受和困惑都可以"}</span></label>
      <textarea id="journal-content" rows="5" maxlength="4000" placeholder="${state.journalPrompt ? "在这里回答AI的问题……" : "我今天发现…… / 我有一个想法…… / 有件事让我不太明白……"}">${escapeHtml(state.journalDraft)}</textarea>
      <label class="journal-ai-consent"><input id="journal-ai-context" type="checkbox" ${state.journalShareWithAi ? "checked" : ""} />允许AI在以后推荐和提问时参考这篇日记</label>
      <div class="journal-save-row"><input id="journal-tags" maxlength="100" value="${escapeHtml(state.journalTags)}" placeholder="标签（可不填）" /><button type="button" data-action="save-journal">${state.journalPrompt ? "保存回答" : "记下来"}</button></div>
      <div class="journal-history">${state.journals.slice(0, 6).map((entry) => `<article><div><span>${entry.source === "self" ? "自主记录" : entry.source === "ai" ? "AI提问" : "共同记录"}</span><time>${escapeHtml(new Date(entry.createdAt).toLocaleDateString("zh-CN", { month:"2-digit", day:"2-digit" }))}</time></div>${entry.prompt ? `<small>${escapeHtml(entry.prompt)}</small>` : ""}<p>${escapeHtml(entry.content)}</p><footer>${entry.tags.map((tag) => `<i>${escapeHtml(tag)}</i>`).join("")}<em>${entry.shareWithAi ? "AI可参考" : "仅私人保存"}</em><button type="button" data-action="journal-to-idea" data-journal-id="${entry.id}">变成灵感</button><button type="button" data-action="delete-journal" data-journal-id="${entry.id}" aria-label="删除这篇日记">删除</button></footer></article>`).join("") || `<p class="empty-state">第一篇日记可以很短，只写一句也算。</p>`}</div>
    </section>

    ${renderArtifactStudio()}

    <section class="panel">
      <div class="page-head">
        <h2 class="panel-title">${pixelIcon("nav-execute", "")} 今日复盘</h2>
        <span class="tag">${done.length} 个任务完成</span>
      </div>
      <div class="done-strip">
        ${done.length ? done.map((quest) => `<span>${quest.title}</span>`).join("") : "<span>完成一个任务后，这里会亮起来</span>"}
      </div>
    </section>

    <section class="panel reflection-panel">
      <h2 class="panel-title">${pixelIcon("voice", "")} 告诉AI今天怎么样</h2>
      <p class="feedback-calibration">${escapeHtml(calibrationCopy())}<small>已参考 ${state.feedbackCalibration.sampleSize || 0} 次任务体验</small></p>
      <label class="feedback-task-picker">刚才说的是哪个任务？
        <select id="reflect-task" ${feedbackTasks.length ? "" : "disabled"}>
          ${feedbackTasks.length ? feedbackTasks.map((task) => `<option value="${escapeHtml(task.key)}">${escapeHtml(task.title)}</option>`).join("") : `<option value="">先完成一个任务</option>`}
        </select>
      </label>
      <div class="reflection-grid">
        <label>
          心情
          <select id="reflect-mood">
            <option>开心</option>
            <option>平静</option>
            <option>有点烦</option>
            <option>累了</option>
          </select>
        </label>
        <label>
          难度
          <select id="reflect-difficulty">
            <option value="just_right">刚刚好</option>
            <option value="too_easy">太简单</option>
            <option value="too_hard">太难</option>
            <option value="stuck">卡住了</option>
          </select>
        </label>
        <label>
          趣味
          <select id="reflect-fun">
            <option value="fun">有趣</option>
            <option value="neutral">一般</option>
            <option value="boring">无聊</option>
          </select>
        </label>
        <label>
          下次怎么帮
          <select id="reflect-support">
            <option value="none">让我自己试</option>
            <option value="hint">给一个提示</option>
            <option value="steps">帮我拆小步</option>
            <option value="together">找人一起做</option>
          </select>
        </label>
      </div>
      <fieldset class="motivation-picker">
        <legend>这次什么最让我愿意继续？</legend>
        <small>${escapeHtml(motivationCopy())}</small>
        <div>${Object.entries(motivationLabels).filter(([value]) => value !== "wellbeing").map(([value, label]) => `<label><input type="radio" name="reflect-motivation" value="${value}" ${value === "unknown" ? "checked" : ""} /><span>${label}</span></label>`).join("")}</div>
      </fieldset>
      <div class="tag-choice">
        ${tagOptions.map((tag) => `
          <label><input type="checkbox" value="${tag}" />${tag}</label>
        `).join("")}
      </div>
      <textarea id="reflect-note" rows="3" placeholder="我今天发现：什么最顺？哪里卡住？下次我想试什么？"></textarea>
      <button class="primary-action" type="button" data-action="save-reflection" ${feedbackTasks.length ? "" : "disabled"}>保存体验，让下一个任务更适合我</button>
    </section>

    <section class="panel">
      <h2 class="panel-title">${pixelIcon("skill-check", "")} 我的成长记录</h2>
      <div class="log-list">
        ${logs.length ? logs.map((log) => `
          <article class="log-entry">
            <strong>${escapeHtml(log.taskTitle ? `${log.taskTitle} · ` : "")}${escapeHtml(log.mood)} · ${escapeHtml(log.difficulty)} · ${escapeHtml(log.fun)}</strong>
            <p>${escapeHtml(log.note || "今天完成了复盘。")}</p>
            <small>${escapeHtml(log.time)} · ${escapeHtml(log.support || "未选择帮助方式")} · 动力：${escapeHtml(log.motivation || "未记录")} · ${escapeHtml(log.likedTags.join(" / ") || "未选标签")}</small>
          </article>
        `).join("") : `<p class="empty-state">还没有复盘。复盘不是写作文，只是告诉系统今天的真实感觉。</p>`}
      </div>
    </section>
  `;
}

function render() {
  const pageRenderers = {
    profile: renderToday,
    discover: renderRecommendations,
    skills: renderSkills,
    plan: renderSelf,
    execute: renderReflect
  };

  updateShell();
  content.innerHTML = needsProfileOnboarding() ? renderProfileOnboarding() : pageRenderers[state.page]();
  content.scrollTop = 0;
  const screen = document.querySelector(".screen");
  if (screen?.classList?.remove && screen?.classList?.add) {
    screen.classList.remove("page-refresh");
    void screen.offsetWidth;
    screen.classList.add("page-refresh");
  }
}

function updateShell() {
  const c = child();
  const economy = economyState();
  localStorage.setItem("talent-os-child", state.childId);
  localStorage.setItem("talent-os-page", state.page);
  const screen = document.querySelector(".screen");
  if (screen?.dataset) {
    screen.dataset.page = state.page;
    screen.dataset.theme = getGemWallet().equipped || "classic";
  }

  const onboardingLocked = needsProfileOnboarding();
  tabs.forEach((tab) => {
    tab.classList.toggle("active", !onboardingLocked && tab.dataset.page === state.page);
    tab.disabled = onboardingLocked;
  });
  const visibleProfiles = state.account ? state.profiles : [
    { id: "brother", name: children.brother.name, age: children.brother.shortAge, avatar: "boy" },
    { id: "sister", name: children.sister.name, age: children.sister.shortAge, avatar: "girl" }
  ];
  if (childSwitcher) childSwitcher.innerHTML = `${visibleProfiles.map((profile) => `
    <button class="child-card ${profile.id === state.childId ? "active" : ""}" type="button" data-child="${escapeHtml(profile.id)}">
      <span class="face ${escapeHtml(profile.avatar)}"></span><span class="child-copy"><b>${escapeHtml(profile.name)}</b><small>${escapeHtml(profile.age)}</small></span><i>${profile.id === state.childId ? "✓" : ""}</i>
    </button>`).join("")}
    <button class="child-card add-child-card" type="button" data-action="open-profile-creator" aria-label="新建成长角色"><strong>+</strong><span>新建角色</span></button>`;

  gemCount.textContent = economy.gems;
  levelFace.className = `face ${c.avatar} large`;
  levelValue.textContent = `Lv.${economy.level}`;
  levelHearts.textContent = `${"♥".repeat(economy.hearts)}${"♡".repeat(Math.max(0, 8 - economy.hearts))}`;
  xpBar.style.width = `${Math.min(100, Math.round((economy.xp / economy.xpMax) * 100))}%`;
  xpNumber.textContent = `${economy.xp}/${economy.xpMax}`;
}

async function saveReflection() {
  const likedTags = [...document.querySelectorAll(".tag-choice input:checked")].map((input) => input.value);
  const selectedTask = feedbackTaskOptions().find((task) => task.key === document.querySelector("#reflect-task")?.value);
  if (!selectedTask) { showToast("先完成一个任务，再告诉AI体验"); return false; }
  const difficulty = document.querySelector("#reflect-difficulty")?.value || "just_right";
  const enjoyment = document.querySelector("#reflect-fun")?.value || "neutral";
  const support = document.querySelector("#reflect-support")?.value || "none";
  const motivation = document.querySelector("input[name='reflect-motivation']:checked")?.value || "unknown";
  const difficultyLabels = { just_right: "刚刚好", too_easy: "太简单", too_hard: "太难", stuck: "卡住了" };
  const enjoymentLabels = { fun: "有趣", neutral: "一般", boring: "无聊" };
  const supportLabels = { none: "让我自己试", hint: "给一个提示", steps: "帮我拆小步", together: "找人一起做" };
  const log = {
    mood: document.querySelector("#reflect-mood")?.value || "平静",
    difficulty: difficultyLabels[difficulty],
    fun: enjoymentLabels[enjoyment],
    support: supportLabels[support],
    motivation: motivationLabels[motivation] || "还不知道",
    taskTitle: selectedTask.title,
    likedTags,
    note: document.querySelector("#reflect-note")?.value.trim() || "",
    time: new Date().toLocaleString("zh-CN", {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit"
    })
  };
  const prefs = getPrefs();
  const nextLiked = log.fun === "有趣" ? [...new Set([...likedTags, ...prefs.likedTags])].slice(0, 12) : prefs.likedTags;
  const nextHard = ["太难", "卡住了"].includes(log.difficulty) ? [...new Set([...likedTags, ...prefs.hardTags])].slice(0, 12) : prefs.hardTags;
  setPrefs({ likedTags: nextLiked, hardTags: nextHard });
  setLogs([log, ...getLogs()]);
  try {
    const response = await fetch("/api/task-feedback", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ profileId: state.childId, taskKey: selectedTask.key, taskTitle: selectedTask.title, skill: selectedTask.skill, mode: selectedTask.mode, difficulty, enjoyment, support, motivation, note: log.note, feedbackDate: todayKey() }) });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "feedback");
    state.taskFeedback = [result.entry, ...state.taskFeedback.filter((entry) => !(entry.taskKey === result.entry.taskKey && entry.feedbackDate === result.entry.feedbackDate))];
    state.feedbackCalibration = result.calibration || state.feedbackCalibration;
  } catch { showToast("体验已保存在本机，云端暂时离线"); }
  queueCloudSync({ kind: "reflection", summary: `${child().name}完成「${selectedTask.title}」后的复盘：${log.fun}，${log.difficulty}，希望${log.support}，这次的动力是${log.motivation}${log.note ? `。${log.note}` : ""}`, evidence: { ...log, taskKey: selectedTask.key, skill: selectedTask.skill, mode: selectedTask.mode, motivation, shareWithAi: true } });
  trackEvent("reflection_saved", { mood: log.mood, difficulty: log.difficulty, fun: log.fun, motivation, tagCount: log.likedTags.length });
  const rewarded = grantBonusReward(`reflection:${selectedTask.key}:${todayKey()}`, { xp: 8, gems: 2, label: "完成任务复盘" });
  if (!rewarded) showToast("收到，下一个任务会参考这次体验");
  return true;
}

function answerCoach(questionId, value) {
  const session = getCoachSession();
  const question = coachQuestions.find((item) => item.id === questionId);
  const normalizedValue = questionId === "time" ? Number(value) : value;
  session.answers[questionId] = normalizedValue;
  setCoachSession(session);
  if (questionId === "energy") {
    setPrefs({ energy: value });
  }
  const answer = question?.answers.find((item) => String(item.value) === String(normalizedValue));
  if (answer?.tags?.length) {
    const prefs = getPrefs();
    setPrefs({ likedTags: [...new Set([...answer.tags, ...prefs.likedTags])].slice(0, 12) });
  }
}

document.addEventListener("click", async (event) => {
  if (event.target.closest("[data-action='generate-family-brief']")) { await generateFamilyBrief(); return; }
  const familyBriefUpdate = event.target.closest("[data-action='update-family-brief']");
  if (familyBriefUpdate) { await updateFamilyBrief(familyBriefUpdate.dataset.status); return; }
  if (event.target.closest("[data-action='delete-family-brief']")) { await deleteFamilyBrief(); return; }
  const dailyFeedbackDelete = event.target.closest("[data-action='delete-daily-feedback']");
  if (dailyFeedbackDelete) { await deleteDailyPlanFeedback(dailyFeedbackDelete.dataset.feedbackId); return; }
  if (event.target.closest("[data-action='shape-goal']")) { await shapeGrowthGoal(); return; }
  if (event.target.closest("[data-action='edit-goal-draft']")) { state.goalDraft = null; render(); return; }
  if (event.target.closest("[data-action='confirm-goal']")) { await confirmGrowthGoal(); return; }
  const goalUpdate = event.target.closest("[data-action='update-goal']");
  if (goalUpdate) { await updateGrowthGoal(goalUpdate.dataset.goalId, goalUpdate.dataset.status); return; }
  const goalDelete = event.target.closest("[data-action='delete-goal']");
  if (goalDelete) { await deleteGrowthGoal(goalDelete.dataset.goalId); return; }
  const goalExperiment = event.target.closest("[data-action='start-goal-experiment']");
  if (goalExperiment) { await startGoalExperiment(goalExperiment.dataset.goalId); return; }
  if (event.target.closest("[data-action='generate-strategies']")) { await generateStrategyInsights(); return; }
  const strategyFeedback = event.target.closest("[data-action='strategy-feedback']");
  if (strategyFeedback) { await sendStrategyFeedback(strategyFeedback.dataset.strategyId, strategyFeedback.dataset.feedback); return; }
  if (event.target.closest("[data-action='parse-action-inbox']")) { await parseActionInbox(); return; }
  const inboxAnswer = event.target.closest("[data-action='answer-action-inbox']");
  if (inboxAnswer) { await parseActionInbox({ field: inboxAnswer.dataset.field, value: inboxAnswer.dataset.value }); return; }
  if (event.target.closest("[data-action='edit-action-inbox']")) { state.actionInboxResult = null; render(); return; }
  if (event.target.closest("[data-action='confirm-action-inbox']")) { await confirmActionInbox(); return; }
  const duplicateAction = event.target.closest("[data-action='open-duplicate-action']");
  if (duplicateAction) { await openDuplicateAction(duplicateAction.dataset.actionId); return; }
  const dailyCheckinButton = event.target.closest("[data-action='daily-checkin']");
  if (dailyCheckinButton) {
    const field = dailyCheckinButton.dataset.field;
    state.dailyCheckin[field] = field === "minutes" ? Number(dailyCheckinButton.dataset.value) : dailyCheckinButton.dataset.value;
    if (field === "intent") await generateDailyPlan(); else render();
    return;
  }
  const dailyCheckinBack = event.target.closest("[data-action='daily-checkin-back']");
  if (dailyCheckinBack) {
    if (dailyCheckinBack.dataset.stage === "intent") state.dailyCheckin.minutes = 0;
    else state.dailyCheckin.energy = "";
    state.dailyCheckin.intent = "";
    render();
    return;
  }
  if (event.target.closest("[data-action='reset-daily-checkin']")) { state.dailyCheckin = { energy: "", minutes: 0, intent: "" }; render(); return; }
  if (event.target.closest("[data-action='start-daily-plan']")) { await startDailyPlan(); return; }
  if (event.target.closest("[data-action='open-daily-swap']")) { state.dailySwapOpen = true; render(); return; }
  if (event.target.closest("[data-action='close-daily-swap']")) { state.dailySwapOpen = false; render(); return; }
  const dailySwapButton = event.target.closest("[data-action='swap-daily-plan']");
  if (dailySwapButton) { await generateDailyPlan({ swap: true, swapReason: dailySwapButton.dataset.reason || "not_now" }); return; }
  if (event.target.closest("[data-action='lighten-daily-plan']")) { await generateDailyPlan({ lighter: true }); return; }
  if (event.target.closest("[data-action='daily-plan-next']")) { await generateDailyPlan({ swap: true }); return; }
  if (event.target.closest("[data-action='reset-daily-plan']")) {
    if (state.dailyPlan?.id) { try { await fetch(`/api/daily-plan/${encodeURIComponent(state.dailyPlan.id)}`, { method: "DELETE" }); } catch {} }
    state.dailyPlan = null; state.dailySwapOpen = false; state.dailyCheckin = { energy: "", minutes: 0, intent: "" }; render(); return;
  }
  if (event.target.closest("[data-action='toggle-planning-details']")) { state.showPlanningDetails = !state.showPlanningDetails; render(); return; }
  if (event.target.closest("[data-action='toggle-quest-coach']")) { state.showQuestCoach = !state.showQuestCoach; render(); return; }
  const artifactModeButton = event.target.closest("[data-action='set-artifact-mode']");
  if (artifactModeButton) { state.artifactMode = artifactModeButton.dataset.mode; render(); return; }
  const artifactRevisionButton = event.target.closest("[data-action='start-artifact-revision']");
  if (artifactRevisionButton) { startArtifactRevision(artifactRevisionButton.dataset.artifactId); return; }
  if (event.target.closest("[data-action='cancel-artifact-revision']")) { state.artifactRevision = null; render(); return; }
  if (event.target.closest("[data-action='save-artifact']")) { const saved = await saveArtifact(); if (saved) render(); return; }
  const artifactPrivacy = event.target.closest("[data-action='toggle-artifact-privacy']");
  if (artifactPrivacy) { await toggleArtifactPrivacy(artifactPrivacy.dataset.artifactId, artifactPrivacy.dataset.share === "true"); return; }
  const artifactDelete = event.target.closest("[data-action='delete-artifact']");
  if (artifactDelete) { await deleteArtifact(artifactDelete.dataset.artifactId); return; }
  if (event.target.closest("[data-action='generate-review']")) { generateWeeklyReview(); return; }
  const reviewFeedback = event.target.closest("[data-action='review-feedback']");
  if (reviewFeedback) { sendReviewFeedback(reviewFeedback.dataset.reviewId, reviewFeedback.dataset.feedback); return; }
  const startFocusButton = event.target.closest("[data-action='start-focus']");
  if (startFocusButton) {
    const action = state.actions.find((item) => String(item.id) === String(startFocusButton.dataset.actionId));
    if (action) startFocus(action);
    return;
  }
  if (event.target.closest("[data-action='toggle-focus-pause']")) { changeFocus(state.focusSession?.status === "paused" ? "resume" : "pause"); return; }
  if (event.target.closest("[data-action='open-focus-rescue']")) { state.focusRescueOpen = true; state.focusRescue = null; renderFocusOverlay(); return; }
  const rescueReason = event.target.closest("[data-action='request-focus-rescue']");
  if (rescueReason) { await requestFocusRescue(rescueReason.dataset.reason); return; }
  const rescueOutcome = event.target.closest("[data-action='apply-focus-rescue']");
  if (rescueOutcome) { await applyFocusRescue(rescueOutcome.dataset.outcome); return; }
  if (event.target.closest("[data-action='close-focus-rescue']")) { await closeFocusRescue(); return; }
  if (event.target.closest("[data-action='finish-focus']")) { changeFocus("finish", false); return; }
  if (event.target.closest("[data-action='finish-focus-action']")) { changeFocus("finish", true); return; }
  if (event.target.closest("[data-action='cancel-focus']")) { changeFocus("cancel", false); return; }
  if (event.target.closest("[data-action='create-habit']")) { createHabitFromForm(); return; }
  const habitCheckin = event.target.closest("[data-action='checkin-habit']");
  if (habitCheckin) { checkinHabit(habitCheckin.dataset.habitId, habitCheckin.dataset.status); return; }
  const deleteHabit = event.target.closest("[data-action='delete-habit']");
  if (deleteHabit) {
    fetch(`/api/habits/${encodeURIComponent(deleteHabit.dataset.habitId)}`, { method: "DELETE" })
      .then(async (response) => { if (!response.ok) throw new Error("delete"); await loadHabits(); showToast("微习惯已删除"); render(); })
      .catch(() => showToast("暂时无法删除习惯"));
    return;
  }
  if (event.target.closest("[data-action='create-action']")) { createActionFromForm(); return; }
  const updateActionButton = event.target.closest("[data-action='update-action']");
  if (updateActionButton) { updateAction(updateActionButton.dataset.actionId, updateActionButton.dataset.status); return; }
  const breakdownActionButton = event.target.closest("[data-action='breakdown-action']");
  if (breakdownActionButton) { breakdownAction(breakdownActionButton.dataset.actionId); return; }
  const openNegotiation = event.target.closest("[data-action='open-action-negotiation']");
  if (openNegotiation) { openActionNegotiation(openNegotiation.dataset.actionId); return; }
  if (event.target.closest("[data-action='close-action-negotiation']")) { state.actionNegotiation = null; render(); return; }
  const negotiationReason = event.target.closest("[data-action='request-action-negotiation']");
  if (negotiationReason) { await requestActionNegotiation(negotiationReason.dataset.actionId, negotiationReason.dataset.reason); return; }
  const negotiationOutcome = event.target.closest("[data-action='apply-action-negotiation']");
  if (negotiationOutcome) { await applyActionNegotiation(negotiationOutcome.dataset.actionId, negotiationOutcome.dataset.outcome); return; }
  const deleteActionButton = event.target.closest("[data-action='delete-action']");
  if (deleteActionButton) {
    fetch(`/api/actions/${encodeURIComponent(deleteActionButton.dataset.actionId)}`, { method: "DELETE" })
      .then(async (response) => { if (!response.ok) throw new Error("delete"); await loadActions(); showToast("行动已删除"); render(); })
      .catch(() => showToast("暂时无法删除行动"));
    return;
  }
  if (event.target.closest("[data-action='capture-idea']")) {
    createIdea({ title: document.querySelector("#idea-title")?.value || "" });
    return;
  }
  if (event.target.closest("[data-action='request-idea-resurfacing']")) { await requestIdeaResurfacing(); return; }
  const ideaResurfacingDecision = event.target.closest("[data-action='decide-idea-resurfacing']");
  if (ideaResurfacingDecision) { await decideIdeaResurfacing(ideaResurfacingDecision.dataset.outcome); return; }
  const developIdeaButton = event.target.closest("[data-action='develop-idea']");
  if (developIdeaButton) { developIdea(developIdeaButton.dataset.ideaId); return; }
  const ideaStatusButton = event.target.closest("[data-action='set-idea-status']");
  if (ideaStatusButton) { updateIdeaStatus(ideaStatusButton.dataset.ideaId, ideaStatusButton.dataset.status); return; }
  const deleteIdeaButton = event.target.closest("[data-action='delete-idea']");
  if (deleteIdeaButton) {
    fetch(`/api/ideas/${encodeURIComponent(deleteIdeaButton.dataset.ideaId)}`, { method: "DELETE" })
      .then(async (response) => { if (!response.ok) throw new Error("delete"); await loadIdeas(); showToast("灵感已删除"); render(); })
      .catch(() => showToast("暂时无法删除灵感"));
    return;
  }
  const journalToIdea = event.target.closest("[data-action='journal-to-idea']");
  if (journalToIdea) {
    const entry = state.journals.find((item) => String(item.id) === String(journalToIdea.dataset.journalId));
    if (entry) createIdea({ title: entry.content.slice(0, 30), note: entry.content, source: "journal" });
    return;
  }
  const hypothesisFeedback = event.target.closest("[data-action='hypothesis-feedback']");
  if (hypothesisFeedback) {
    fetch(`/api/hypotheses/${encodeURIComponent(hypothesisFeedback.dataset.hypothesisId)}/feedback`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ value: hypothesisFeedback.dataset.value }) })
      .then(async (response) => { if (!response.ok) throw new Error("feedback"); await loadHypotheses(); insightsContent.innerHTML = renderInsightsPanel(); showToast(hypothesisFeedback.dataset.value === "reject" ? "已记录反证，AI会降低这条假设" : "谢谢，你在帮助系统更懂你"); })
      .catch(() => showToast("暂时无法保存反馈"));
    return;
  }
  const journalModeButton = event.target.closest("[data-action='set-journal-mode']");
  if (journalModeButton) {
    state.journalMode = journalModeButton.dataset.mode;
    state.journalPrompt = null;
    render();
    if (state.journalMode !== "self") await requestJournalPrompt(false);
    return;
  }
  if (event.target.closest("[data-action='ask-journal-question']")) { requestJournalPrompt(false); return; }
  if (event.target.closest("[data-action='ask-journal-followup']")) { requestJournalPrompt(true); return; }
  const starterButton = event.target.closest("[data-action='use-journal-starter']");
  if (starterButton) {
    state.journalDraft = starterButton.dataset.starter || "";
    render();
    document.querySelector("#journal-content")?.focus();
    return;
  }
  if (event.target.closest("[data-action='save-journal']")) { saveJournalEntry(); return; }
  const deleteJournal = event.target.closest("[data-action='delete-journal']");
  if (deleteJournal) {
    fetch(`/api/journal/${encodeURIComponent(deleteJournal.dataset.journalId)}`, { method: "DELETE" })
      .then(async (response) => { if (!response.ok) throw new Error("delete"); revokeBonusReward(`journal:${deleteJournal.dataset.journalId}`); await loadCloudProgress(state.childId); showToast("日记已删除，相关记忆和奖励也已撤回"); render(); })
      .catch(() => showToast("暂时无法删除日记"));
    return;
  }
  if (event.target.closest("[data-action='open-insights']")) { openInsights(); trackEvent("insights_opened"); return; }
  if (event.target.closest("[data-action='ask-self-coach']")) { await askSelfCoach(); return; }
  const selfCoachPreset = event.target.closest("[data-action='ask-self-coach-preset']");
  if (selfCoachPreset) { await askSelfCoach(selfCoachPreset.dataset.question || ""); return; }
  const selfCoachFeedback = event.target.closest("[data-action='self-coach-feedback']");
  if (selfCoachFeedback) { await feedbackSelfCoach(selfCoachFeedback.dataset.answerId, selfCoachFeedback.dataset.feedback); return; }
  const selfCoachDelete = event.target.closest("[data-action='delete-self-coach']");
  if (selfCoachDelete) { await deleteSelfCoachAnswer(selfCoachDelete.dataset.answerId); return; }
  if (event.target.closest("[data-action='close-insights']") || event.target === insightsOverlay) { insightsOverlay.hidden = true; return; }
  const forgetMemory = event.target.closest("[data-action='forget-memory']");
  if (forgetMemory) {
    fetch(`/api/memories/${encodeURIComponent(forgetMemory.dataset.memoryId)}`, { method: "DELETE" })
      .then(async (response) => { if (!response.ok) throw new Error("forget"); await loadCloudProgress(state.childId); insightsContent.innerHTML = renderInsightsPanel(); showToast("这条记忆已删除"); })
      .catch(() => showToast("暂时无法删除记忆"));
    return;
  }
  if (event.target.closest("[data-action='show-recovery']")) {
    document.querySelector("#auth-login-fields").hidden = true;
    document.querySelector("#auth-recovery-fields").hidden = false;
    document.querySelector("#recovery-email").value = document.querySelector("#auth-email")?.value || "";
    document.querySelector("#auth-error").textContent = "";
    return;
  }
  if (event.target.closest("[data-action='hide-recovery']")) {
    document.querySelector("#auth-login-fields").hidden = false;
    document.querySelector("#auth-recovery-fields").hidden = true;
    document.querySelector("#auth-error").textContent = "";
    return;
  }
  if (event.target.closest("[data-action='reset-password']")) {
    const error = document.querySelector("#auth-error");
    error.textContent = "正在验证恢复码...";
    const payload = { email: document.querySelector("#recovery-email")?.value.trim(), recoveryCode: document.querySelector("#recovery-code")?.value.trim(), newPassword: document.querySelector("#recovery-new-password")?.value || "" };
    fetch("/api/auth/recovery/reset", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) })
      .then(async (response) => { const result = await response.json(); if (!response.ok) throw new Error(result.error); state.account = result; installProfiles(result.profiles); authOverlay.hidden = true; document.querySelector("#auth-login-fields").hidden = false; document.querySelector("#auth-recovery-fields").hidden = true; if (state.profiles.length) await loadCloudProgress(state.childId); render(); showToast("密码已重设，旧设备会自动退出"); })
      .catch((failure) => { error.textContent = failure.message || "恢复失败"; });
    return;
  }
  if (event.target.closest("[data-action='copy-recovery-code']")) {
    const code = recoveryCodeValue?.textContent || "";
    if (navigator.clipboard?.writeText) navigator.clipboard.writeText(code).then(() => showToast("恢复码已复制")).catch(() => showToast("复制失败，请手动记录"));
    else showToast("请手动记录这枚恢复码");
    return;
  }
  if (event.target.closest("[data-action='close-recovery-code']")) { recoveryCodeOverlay.hidden = true; recoveryCodeValue.textContent = ""; return; }
  const authAction = event.target.closest("[data-action='login'],[data-action='register']");
  if (authAction) {
    const email = document.querySelector("#auth-email")?.value.trim() || "";
    const password = document.querySelector("#auth-password")?.value || "";
    const error = document.querySelector("#auth-error");
    error.textContent = "正在连接成长档案...";
    fetch(`/api/auth/${authAction.dataset.action}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email, password }) })
      .then(async (response) => { const result = await response.json(); if (!response.ok) throw new Error(result.error); const oneTimeCode = result.recoveryCode || ""; const { recoveryCode: _recoveryCode, ...account } = result; state.account = account; installProfiles(result.profiles); authOverlay.hidden = true; profileOverlay.hidden = state.profiles.length > 0; if (state.profiles.length) await loadCloudProgress(state.childId); render(); if (oneTimeCode) showRecoveryCode(oneTimeCode); })
      .catch((failure) => { error.textContent = failure.message || "连接失败"; });
    return;
  }

  if (event.target.closest("[data-action='open-profile-creator']")) { closeSettings(); profileOverlay.hidden = false; return; }
  if (event.target.closest("[data-action='close-profile-creator']")) { if (state.profiles.length) profileOverlay.hidden = true; return; }
  if (event.target.closest("[data-action='create-profile']")) {
    const payload = { name: document.querySelector("#profile-name")?.value.trim(), age: document.querySelector("#profile-age")?.value.trim(), avatar: document.querySelector("#profile-avatar")?.value, baseTemplate: document.querySelector("#profile-template")?.value, guardianConsent: Boolean(document.querySelector("#profile-consent")?.checked) };
    const error = document.querySelector("#profile-error");
    fetch("/api/profiles", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) })
      .then(async (response) => { const profile = await response.json(); if (!response.ok) throw new Error(profile.error); installProfiles([...state.profiles, profile]); state.childId = profile.id; profileOverlay.hidden = true; render(); showToast("新角色已创建"); })
      .catch((failure) => { error.textContent = failure.message || "创建失败"; });
    return;
  }
  if (event.target.closest("[data-action='export-progress']")) {
    fetch(`/api/export?profileId=${encodeURIComponent(state.childId)}`)
      .then(async (response) => { if (!response.ok) throw new Error("export"); const blob = await response.blob(); const href = URL.createObjectURL(blob); const link = document.createElement("a"); link.href = href; link.download = `${child().name}-成长进度.json`; link.click(); URL.revokeObjectURL(href); showToast("进度已导出"); })
      .catch(() => showToast("导出失败，请检查登录状态"));
    return;
  }
  if (event.target.closest("[data-action='rotate-recovery-code']")) {
    const currentPassword = document.querySelector("#recovery-current-password")?.value || "";
    fetch("/api/auth/recovery/rotate", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ currentPassword }) })
      .then(async (response) => { const result = await response.json(); if (!response.ok) throw new Error(result.error); state.account = { ...state.account, recoveryConfigured: true, recoveryUpdatedAt: result.updatedAt }; settingsContent.innerHTML = renderSettingsPanel(); showRecoveryCode(result.recoveryCode); })
      .catch((failure) => showToast(failure.message || "暂时无法生成恢复码"));
    return;
  }
  if (event.target.closest("[data-action='logout']")) { fetch("/api/auth/logout", { method: "POST" }).finally(() => { state.account = null; authOverlay.hidden = false; closeSettings(); }); return; }
  const openTutorialButton = event.target.closest("[data-action='open-tutorial']");
  if (openTutorialButton) {
    openTutorial();
    return;
  }

  const nextTutorialButton = event.target.closest("[data-action='next-tutorial']");
  if (nextTutorialButton) {
    if (tutorialStep < tutorialSteps.length - 1) {
      tutorialStep += 1;
      renderTutorial();
    } else {
      finishTutorial();
    }
    return;
  }

  const skipTutorialButton = event.target.closest("[data-action='skip-tutorial']");
  if (skipTutorialButton) {
    finishTutorial();
    return;
  }

  if (event.target.closest("[data-action='open-gem-shop']")) {
    openSettings("gem-store");
    return;
  }

  const openSettingsButton = event.target.closest("[data-action='open-settings']");
  if (openSettingsButton) {
    openSettings();
    return;
  }

  const closeSettingsButton = event.target.closest("[data-action='close-settings']");
  if (closeSettingsButton || event.target === settingsOverlay) {
    closeSettings();
    return;
  }

  const gemItemButton = event.target.closest("[data-action='buy-gem-item']");
  if (gemItemButton) {
    buyGemItem(gemItemButton.dataset.itemId);
    return;
  }

  const saveSettingsButton = event.target.closest("[data-action='save-settings']");
  if (saveSettingsButton) {
    setAppSettings({
      dailyTarget: Number(document.querySelector("#setting-daily-target")?.value || 1),
      useNews: Boolean(document.querySelector("#setting-use-news")?.checked),
      newsTopics: document.querySelector("#setting-news-topics")?.value.trim() || "AI教育, 科学发现, 儿童创造力, 未来技能"
    });
    clearAiCoachResult();
    showToast("设置已保存，下一次推荐会使用");
    settingsContent.innerHTML = renderSettingsPanel();
    return;
  }

  const syncNewsButton = event.target.closest("[data-action='sync-news']");
  if (syncNewsButton) {
    syncNewsContext();
    return;
  }

  const openContextManager = event.target.closest("[data-action='open-context-manager']");
  if (openContextManager) {
    closeSettings();
    state.page = "plan";
    render();
    return;
  }

  const saveGrowthPlanButton = event.target.closest("[data-action='save-growth-plan']");
  if (saveGrowthPlanButton) {
    setGrowthPlan({
      weeklyGoal: document.querySelector("#plan-weekly-goal")?.value.trim() || "",
      focusSkill: document.querySelector("#plan-focus-skill")?.value || "",
      constraints: document.querySelector("#plan-constraints")?.value.trim() || ""
    });
    clearAiCoachResult();
    showToast("成长计划已交给AI");
    render();
    return;
  }

  const generateGrowthPlanButton = event.target.closest("[data-action='generate-growth-plan']");
  if (generateGrowthPlanButton) {
    setGrowthPlan({
      weeklyGoal: document.querySelector("#plan-weekly-goal")?.value.trim() || "",
      focusSkill: document.querySelector("#plan-focus-skill")?.value || "",
      constraints: document.querySelector("#plan-constraints")?.value.trim() || ""
    });
    requestAiGrowthPlan();
    return;
  }

  const addScheduleButton = event.target.closest("[data-action='add-schedule']");
  if (addScheduleButton) {
    const title = document.querySelector("#schedule-title")?.value.trim() || "";
    const start = document.querySelector("#schedule-start")?.value || "";
    const energy = document.querySelector("#schedule-energy")?.value || "normal";
    if (!title || !start) {
      showToast("请填写日程名称和时间");
      return;
    }
    const item = { id: `schedule-${simpleHash(`${Date.now()}-${title}`)}`, title, start, energy };
    setScheduleItems([item, ...getScheduleItems()].sort((left, right) => String(left.start).localeCompare(String(right.start))));
    clearAiCoachResult();
    showToast("日程已加入AI上下文");
    render();
    return;
  }

  const deleteScheduleButton = event.target.closest("[data-action='delete-schedule']");
  if (deleteScheduleButton) {
    setScheduleItems(getScheduleItems().filter((item) => item.id !== deleteScheduleButton.dataset.itemId));
    clearAiCoachResult();
    render();
    return;
  }

  const addNewsButton = event.target.closest("[data-action='add-news-context']");
  if (addNewsButton) {
    const title = document.querySelector("#news-title")?.value.trim() || "";
    const summary = document.querySelector("#news-summary")?.value.trim() || "";
    if (!title) {
      showToast("请先填写消息标题");
      return;
    }
    const item = {
      id: `message-${simpleHash(`${Date.now()}-${title}`)}`,
      title,
      summary,
      source: "手动消息",
      date: todayKey(),
      url: ""
    };
    setNewsContext([item, ...getNewsContext()]);
    clearAiCoachResult();
    showToast("消息已加入AI上下文");
    render();
    return;
  }

  const deleteNewsButton = event.target.closest("[data-action='delete-news-context']");
  if (deleteNewsButton) {
    setNewsContext(getNewsContext().filter((item) => item.id !== deleteNewsButton.dataset.itemId));
    clearAiCoachResult();
    render();
    return;
  }

  const tab = event.target.closest(".tab");
  if (tab) {
    state.page = tab.dataset.page;
    trackEvent("page_viewed", { page: state.page });
    render();
    return;
  }

  const onboardingAnswer = event.target.closest("[data-action='answer-onboarding']");
  if (onboardingAnswer) {
    writeJson(storageKey("onboarding"), { ...getOnboardingState(), started: true });
    setContextAnswer(onboardingAnswer.dataset.question, onboardingAnswer.dataset.value);
    const nextId = onboardingQuestionIds.find((id) => !getContextProfile()[id]);
    if (["personal-friction", "success-picture"].includes(nextId) && !readJson(storageKey("onboarding-questions"), {})[nextId]) await requestOnboardingQuestion(nextId);
    else render();
    return;
  }
  const undoOnboardingAnswer = event.target.closest("[data-action='undo-onboarding-answer']");
  if (undoOnboardingAnswer) {
    clearContextAnswer(undoOnboardingAnswer.dataset.question);
    render();
    return;
  }
  if (event.target.closest("[data-action='finish-profile-onboarding']")) {
    await finishProfileOnboarding();
    return;
  }

  const childCard = event.target.closest(".child-card");
  if (childCard?.dataset.child) {
    state.childId = childCard.dataset.child;
    closeSettings();
    loadCloudProgress(state.childId).finally(render);
    return;
  }

  const energyButton = event.target.closest("[data-action='set-energy']");
  if (energyButton) {
    setPrefs({ energy: energyButton.dataset.energy });
    render();
    return;
  }

  const coachAnswer = event.target.closest("[data-action='answer-coach']");
  if (coachAnswer) {
    answerCoach(coachAnswer.dataset.question, coachAnswer.dataset.value);
    if (nextCoachQuestion()) {
      render();
    } else {
      requestAiCoachRecommendation();
    }
    return;
  }

  const resetCoach = event.target.closest("[data-action='reset-coach']");
  if (resetCoach) {
    resetCoachSession();
    render();
    return;
  }

  const contextAnswer = event.target.closest("[data-action='answer-context']");
  if (contextAnswer) {
    setContextAnswer(contextAnswer.dataset.question, contextAnswer.dataset.value);
    clearAiCoachResult();
    render();
    return;
  }
  const editContextAnswer = event.target.closest("[data-action='edit-context-answer']");
  if (editContextAnswer) {
    clearContextAnswer(editContextAnswer.dataset.question);
    clearAiCoachResult();
    render();
    return;
  }

  const skipQuest = event.target.closest("[data-action='skip-quest']");
  if (skipQuest) {
    trackEvent("quest_skipped", { taskId: skipQuest.dataset.taskId });
    const session = getCoachSession();
    const currentQuest = aiQuestFromResult(getAiCoachResult()) || questById(skipQuest.dataset.taskId);
    session.skipped = [...new Set([...(session.skipped || []), skipQuest.dataset.taskId])];
    if (currentQuest) {
      session.avoidedRecommendations = [
        {
          id: currentQuest.id,
          title: currentQuest.title,
          type: currentQuest.type,
          skill: currentQuest.skill,
          ...taskProfile(currentQuest),
          signature: taskSignature(currentQuest)
        },
        ...(session.avoidedRecommendations || [])
      ].slice(0, 8);
    }
    setCoachSession(session);
    requestAiCoachRecommendation();
    return;
  }

  const taskButton = event.target.closest("[data-action='toggle-task']");
  if (taskButton) {
    toggleDone(taskButton.dataset.taskId);
    render();
    return;
  }

  const saveButton = event.target.closest("[data-action='save-reflection']");
  if (saveButton) {
    const saved = await saveReflection();
    if (!saved) return;
    resetCoachSession();
    state.page = "profile";
    render();
  }
});

document.addEventListener("change", (event) => {
  if (event.target?.id === "capture-ai-context") {
    state.captureShareWithAi = event.target.checked;
    return;
  }
  if (event.target?.id === "journal-ai-context") {
    state.journalShareWithAi = event.target.checked;
    return;
  }
  if (event.target?.id !== "artifact-file") return;
  const label = event.target.closest(".artifact-file")?.querySelector("span");
  const file = event.target.files?.[0];
  if (label && file) label.innerHTML = `${escapeHtml(file.name)}<small>${Math.max(1, Math.round(file.size / 1024))}KB · 点击可重新选择</small>`;
});

document.addEventListener("input", (event) => {
  if (event.target?.id === "journal-content") {
    state.journalDraft = event.target.value;
    const followup = document.querySelector("[data-action='ask-journal-followup']");
    if (followup) {
      followup.disabled = state.journalLoading || state.journalDraft.trim().length < 2;
      followup.textContent = state.journalDraft.trim().length < 2 ? "写一句后可继续问" : "沿着这句继续问";
    }
  }
  if (event.target?.id === "journal-tags") state.journalTags = event.target.value;
});

document.addEventListener("keydown", async (event) => {
  if (event.target?.id === "action-inbox-text" && event.key === "Enter") { event.preventDefault(); await parseActionInbox(); }
  if (event.target?.id === "self-coach-question" && event.key === "Enter") { event.preventDefault(); await askSelfCoach(); }
});

render();
loadRuntimeStatus();
loadAccount();
setTimeout(() => trackEvent("app_opened", { page: state.page }), 800);
