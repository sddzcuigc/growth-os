const SKILL_META = {
  '责任闭环': ['自我管理', '自我管理与责任', '商业组织 / 公共服务', '独立完成职责，并主动检查、收尾和补救。'],
  '任务拆解': ['元能力', '项目管理', 'AI产品 / 工程系统', '把复杂目标拆成5—7个有先后关系的步骤。'],
  '深度阅读': ['语言表达', '阅读与信息提取', '科学研究 / 内容传播', '提取目标、条件、因果和证据。'],
  '反馈与提炼': ['元能力', '元认知与自主学习', '所有专业方向', '把一次经历提炼成可重复的方法。'],
  '中文书写': ['语言表达', '书写与写作', '内容传播 / 公共表达', '在真实成果中做到清楚、准确、有结构。'],
  '英文书写': ['语言表达', '基础英语表达', '国际协作 / 技术表达', '写清常用标签、单词和简单短句。'],
  '打字': ['数字表达', '数字工具', 'AI产品 / 内容传播', '准确输入、修改、排版并保存版本。'],
  '数学预算': ['数学数据', '数感与资源配置', '工程系统 / 商业组织', '估算数量、时间、价格和材料约束。'],
  '数据分析': ['数学数据', '记录与解释', '科学研究 / 商业分析', '持续记录并用数据解释变化。'],
  '文件管理': ['数字素养', '信息与版本管理', 'AI产品 / 工程系统', '建立文件结构、命名、查找和版本规则。'],
  '信息可信度': ['数字素养', '检索与判断', '科学研究 / 公共服务', '比较来源并说明为什么相信。'],
  '计算思维': ['数字素养', '流程与自动化', 'AI产品 / 工程系统', '把问题转成输入—步骤—条件—输出—测试。'],
  'AI协作': ['数字素养', '人机协作', '所有专业方向', '先定义目标和标准，再让AI检查和辅助。'],
  '用户意识': ['社会能力', '同理心与服务', '产品 / 商业 / 公共服务', '让真实使用者测试，并根据反馈修改。'],
  '合作分工': ['社会能力', '合作与责任', '组织管理 / 公共服务', '明确角色、交接、承诺和冲突处理。'],
  '挫折恢复': ['自我管理', '情绪与恢复', '所有专业方向', '卡住时说清困难、请求提示并返回任务。'],
  '迁移应用': ['元能力', '举一反三', '所有专业方向', '把方法用于新场景并说明边界。']
};

const PROFESSIONS = {
  'AI与软件产品': ['任务拆解', '计算思维', '文件管理', 'AI协作', '用户意识', '打字'],
  '科学与数据': ['深度阅读', '信息可信度', '数据分析', '数学预算', '反馈与提炼'],
  '工程与系统': ['任务拆解', '数学预算', '计算思维', '责任闭环', '挫折恢复'],
  '内容与传播': ['深度阅读', '中文书写', '英文书写', '打字', '用户意识'],
  '商业与组织': ['责任闭环', '数学预算', '合作分工', '用户意识', '任务拆解'],
  '公共服务与领导': ['用户意识', '合作分工', '信息可信度', '责任闭环', '反馈与提炼']
};

const TEMPLATES = {
  '刘慈欣科幻': {
    title: '建立家庭刘慈欣科幻档案馆',
    purpose: '让家人快速找到、理解并推荐家中的科幻书。',
    steps: ['明确家人怎样找书', '学习分类、固定位置和标签', '设计实体与数字分类规则', '整理书架并写清标签', '建立数字书目和文件结构', '让家人实际查找并收集反馈', '修改系统、交付并约定维护'],
    support: ['深度阅读', '中文书写', '打字', '文件管理', '用户意识'],
    maintain: ['责任闭环', '反馈与提炼'],
    outputs: ['实体分类', '数字书目', '查找说明', '维护规则'],
    materials: ['科幻书', '标签纸', '电脑'],
    safety: '控制屏幕时间。'
  },
  '《基督山伯爵》': {
    title: '破解《基督山伯爵》人物关系',
    purpose: '把复杂故事讲给家人真正听懂。',
    steps: ['确定听众最需要理解什么', '学习人物目标—阻碍—选择—结果五问法', '选择关键人物和事件', '手绘人物关系和时间线', '打字补充人物说明', '给真实听众讲解并记录疑问', '修改、展示并迁移到语文阅读'],
    support: ['深度阅读', '中文书写', '打字', '用户意识', '反馈与提炼'],
    maintain: ['责任闭环'],
    outputs: ['人物图', '因果线', '讲解', '修改记录'],
    materials: ['原书', '纸笔', '电脑'],
    safety: '聚焦5—8个关键人物。'
  },
  'Minecraft': {
    title: '建造极端环境科幻生存基地',
    purpose: '为一家人在极端环境下设计真正能生活的基地。',
    steps: ['定义环境、居民与生存需求', '查资料并列必要系统', '手绘平面图与材料预算', '拆成多个施工模块', '在Minecraft中建造并记录卡点', '邀请家人进入基地测试', '修改、答辩并进行防守战'],
    support: ['任务拆解', '数学预算', '计算思维', '文件管理', 'AI协作', '用户意识'],
    maintain: ['责任闭环', '挫折恢复', '中文书写'],
    outputs: ['需求清单', '平面图', '预算', '可用基地', '测试记录'],
    materials: ['Minecraft', '纸尺', '电脑'],
    safety: '先画图后游戏，不让AI代做全部。'
  },
  '羽毛球': {
    title: '兄妹羽毛球连续十拍挑战',
    purpose: '兄妹合作完成十拍，并用数据证明训练有效。',
    steps: ['记录当前基线', '学习握拍、击球点和回位', '拆分颠球、发球和定点练习', '设计一周训练表', '记录每天次数和身体状态', '分析失败原因并调整', '完成挑战、画进步图并教妹妹一招'],
    support: ['数据分析', '任务拆解', '合作分工', '挫折恢复', '反馈与提炼'],
    maintain: ['责任闭环'],
    outputs: ['基线', '训练表', '进步图', '挑战结果'],
    materials: ['球拍', '羽毛球', '计数表'],
    safety: '胸闷或明显不适立即停止。'
  },
  '家庭做饭': {
    title: '为家人完成一道拿手菜',
    purpose: '在预算和时间内完成一道由孩子主导的菜。',
    steps: ['询问家人需求并选择菜品', '看菜谱、列清单、估算预算', '成人陪同主导采购', '练习低风险准备工作', '按流程烹饪', '家人试吃并反馈', '清理归位、总结并修改菜谱'],
    support: ['数学预算', '责任闭环', '用户意识', '任务拆解', '合作分工'],
    maintain: ['中文书写', '反馈与提炼'],
    outputs: ['清单', '预算', '流程卡', '成品菜', '清理记录'],
    materials: ['菜谱', '食材', '厨房工具'],
    safety: '刀具、热油和明火由成人近距离控制。'
  },
  '故事会': {
    title: '制作自己的《少年故事会》',
    purpose: '把真实生活小事写成家人愿意读完的故事。',
    steps: ['寻找有变化的生活小事', '读短故事并分析冲突和结尾', '口述故事并列三段提纲', '手写关键段落', '打字完成并修改', '让家人阅读并反馈', '修改、配图并发布'],
    support: ['深度阅读', '中文书写', '打字', '用户意识', '反馈与提炼'],
    maintain: ['责任闭环', '挫折恢复'],
    outputs: ['提纲', '手写样本', '电子故事', '读者反馈'],
    materials: ['故事会', '纸笔', '电脑'],
    safety: '保留孩子自己的语气。'
  },
  '地理探索': {
    title: '设计一次家庭低成本探索路线',
    purpose: '设计一条真正可走、预算合理的路线。',
    steps: ['确定对象、时间和限制', '查地图与地点信息', '比较路线、交通和预算', '制作行程与物品清单', '实地执行并记录', '家人评价哪里不方便', '修改为可复用攻略'],
    support: ['信息可信度', '数学预算', '任务拆解', '用户意识', '数据分析'],
    maintain: ['责任闭环', '中文书写'],
    outputs: ['路线图', '预算表', '清单', '实地记录'],
    materials: ['地图', '手机', '纸笔'],
    safety: '路线和交通由成人最终确认。'
  },
  '塞尔达探索': {
    title: '制作《王国之泪》探索者攻略',
    purpose: '把游戏经验整理成家人能使用的攻略。',
    steps: ['确定攻略对象和主题', '记录真实探索问题', '学习地图、图标和步骤表达', '制作第一版路线图', '实际按攻略验证', '让别人试用并反馈', '修改并迁移到现实路线规划'],
    support: ['任务拆解', '用户意识', '中文书写', '文件管理', '反馈与提炼'],
    maintain: ['责任闭环', '迁移应用'],
    outputs: ['问题清单', '路线图', '图标说明', '实测攻略'],
    materials: ['游戏', '纸笔', '截图'],
    safety: '先确定成果后游戏。'
  }
};

const SKILL_PLUGINS = {
  '责任闭环': {phase:6, action:'建立“完成—检查—收尾—补救”清单，并由孩子主动报告结果。', parent:'不替孩子收尾，只在遗漏后追问“你准备怎样补救？”', evidence:'收尾清单、提醒次数和一次主动补救记录', standard:'无需连续催促，能主动检查、归位并处理遗漏。', output:'责任闭环记录'},
  '任务拆解': {phase:2, action:'把大任务拆成5—7个有先后关系的小步骤，标出今天只做哪一步。', parent:'只检查步骤是否可执行，不替孩子决定全部顺序。', evidence:'任务分解图或步骤清单', standard:'每一步都有动作、结果和先后关系，孩子能说出下一步。', output:'任务分解清单'},
  '深度阅读': {phase:1, action:'从资料中提取目标、条件、因果和证据，并用自己的话复述。', parent:'用“谁/什么—为什么—证据在哪里—结果怎样”四问法检查理解。', evidence:'带出处的阅读要点卡', standard:'能从资料中找出至少3条与项目直接相关的信息。', output:'阅读证据卡'},
  '反馈与提炼': {phase:6, action:'把反馈压缩成“事实—原因—有效方法—下次规则”。', parent:'不要只评价好坏，要求孩子说清真正起作用的方法。', evidence:'一张方法卡', standard:'能提炼一条可重复规则，并说明下次怎样使用。', output:'方法卡'},
  '中文书写': {phase:3, action:'把项目中最重要的标签、说明或段落手写清楚，重点控制字形、间距和速度。', parent:'只选一个书写改进点，不要求整份成果全部重写。', evidence:'一份项目手写样本和前后对比', standard:'别人能顺利看懂，字形和间距比初稿更清楚。', output:'手写成果样本'},
  '英文书写': {phase:3, action:'为项目制作5—10个真实需要的英文标签或简短双语说明。', parent:'只纠正影响识别的字母形态、占格和拼写。', evidence:'双语标签或说明', standard:'常用单词拼写正确、字母清楚、能对应真实物品或功能。', output:'双语标签'},
  '打字': {phase:4, action:'把项目资料输入电脑，完成修改、排版、保存和版本命名。', parent:'不代打，只帮助解决一个具体输入或排版障碍。', evidence:'带版本号的电子文件', standard:'能独立输入、修改并在正确文件夹找到最新版本。', output:'电子文档'},
  '数学预算': {phase:2, action:'估算数量、时间、价格或材料，设置资源上限并进行一次核对。', parent:'先让孩子估算，再用实际数据核对，不直接报答案。', evidence:'预算/测量表和估算误差', standard:'数量、单位和总计基本正确，能解释一次取舍。', output:'预算或测量表'},
  '数据分析': {phase:4, action:'建立固定字段持续记录数据，并用前后对比解释变化。', parent:'追问“数据支持什么、不支持什么”，避免只凭感觉下结论。', evidence:'连续数据表和简单趋势图', standard:'至少有3次记录，并能说出一条有数据支持的结论。', output:'数据记录与趋势图'},
  '文件管理': {phase:4, action:'建立项目文件夹结构、统一命名、保存版本，并测试能否快速找到。', parent:'只示范一个文件夹和一个命名规则，不代替整理全部文件。', evidence:'文件夹结构截图和查找测试', standard:'别人按规则能找到最新文件，名称能看出内容和版本。', output:'项目数字档案'},
  '信息可信度': {phase:1, action:'比较至少两个信息来源，标记一致、冲突和仍不确定的内容。', parent:'追问来源是谁、证据是什么、为什么可信。', evidence:'来源比较卡', standard:'至少核对两个来源，并能说明采用哪个及理由。', output:'来源核验表'},
  '计算思维': {phase:2, action:'把项目写成“输入—步骤—条件—循环—输出—测试”的流程。', parent:'只帮助发现遗漏的条件，不直接给出完整流程。', evidence:'流程图或伪代码', standard:'流程包含输入、关键步骤、判断条件和测试方法。', output:'流程图'},
  'AI协作': {phase:4, action:'先写清目标、已有方案和验收标准，再让AI只检查遗漏或解释一个卡点。', parent:'检查孩子是否先思考、是否验证AI结果、是否保留最终责任。', evidence:'孩子原方案、AI建议和验证记录', standard:'能指出AI建议中采用、拒绝和修改的部分及理由。', output:'AI协作记录'},
  '用户意识': {phase:5, action:'邀请真实使用者完成一次实际任务，观察而不是提示，并记录具体障碍。', parent:'只记录事实，不用自己的审美替代用户体验。', evidence:'用户测试记录和至少2条具体反馈', standard:'真实使用者完成测试，孩子根据反馈修改至少一处。', output:'用户测试报告'},
  '合作分工': {phase:2, action:'明确每个人的角色、交付物、交接时间和发生分歧时的处理规则。', parent:'确保妹妹或家人有真实贡献，不让哥哥包办或指挥一切。', evidence:'角色分工卡和交接记录', standard:'每个人知道自己负责什么，并完成一次清楚交接。', output:'分工与交接卡'},
  '挫折恢复': {phase:4, action:'遇到卡点时执行“停一下—说清卡点—自己试一种—请求一个提示—继续”。', parent:'只给一个提示，不因情绪或失败接管项目。', evidence:'卡点、尝试、提示和恢复记录', standard:'遇到一次失败后能返回任务，并说明用了什么恢复办法。', output:'卡点恢复记录'},
  '迁移应用': {phase:6, action:'寻找两个新场景复用本项目方法，并说明需要调整的地方和不适用边界。', parent:'不要接受只说“很多地方都能用”，要求具体场景和差异。', evidence:'两个迁移场景和一个边界说明', standard:'能把方法用于至少一个新场景，并说清相同点和不同点。', output:'迁移应用卡'}
};

const SHELLS = Object.keys(TEMPLATES);
const SKILLS = Object.keys(SKILL_META);
const KEY = 'growthOS';
let memory = null;
let persistent = true;
let chosenShell = '刘慈欣科幻';
let chosenSkills = ['责任闭环', '任务拆解'];
let compiledPreview = null;

const el = id => document.getElementById(id);
const uniq = items => [...new Set(items.filter(Boolean))];
const makeId = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
const escapeHtml = value => String(value).replace(/[&<>'"]/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));

function storageGet() { try { return localStorage.getItem(KEY); } catch (error) { persistent = false; return memory; } }
function storageSet(value) { memory = value; try { localStorage.setItem(KEY, value); persistent = true; } catch (error) { persistent = false; } }
function freshState() {
  return {version:2.2,child:{name:'孩子A',age:'9岁 · 即将四年级',interests:['刘慈欣科幻','故事','地理','漫画经济学','Minecraft','羽毛球'],focus:[{name:'责任闭环',desc:'从提醒走向主动补救'},{name:'反馈与提炼',desc:'把阅读转化为总结和迁移'},{name:'中文书写',desc:'进入真实输出场景'}],resources:['《基督山伯爵》','刘慈欣科幻与漫画版《三体》','地理与漫画经济学','Minecraft教育版','电脑','羽毛球器材']},skills:Object.fromEntries(SKILLS.map(name=>[name,{level:['深度阅读','打字'].includes(name)?2:1,evidence:[]}])) ,task:null,reviews:[]};
}
function loadState() {
  const base=freshState(); let raw=null; try{raw=JSON.parse(storageGet()||'null')}catch(error){}
  if(!raw)return base; if(raw.child)base.child={...base.child,...raw.child};
  if(raw.skills)for(const name of SKILLS)if(raw.skills[name])base.skills[name]={level:Number(raw.skills[name].level||0),evidence:raw.skills[name].evidence||[]};
  if(raw.skillLevels)for(const [name,level] of Object.entries(raw.skillLevels))if(base.skills[name])base.skills[name].level=level;
  base.reviews=raw.reviews||[]; if(raw.task?.coreSkills&&raw.task?.steps)base.task=raw.task; return base;
}
let state=loadState();
function focusSkills(){const text=state.child.focus.map(item=>`${item.name}${item.desc}`).join('');return uniq([text.includes('责任')?'责任闭环':'',text.includes('总结')||text.includes('提炼')?'反馈与提炼':'',text.includes('书写')?'中文书写':'',text.includes('整理')?'文件管理':'',text.includes('迁移')?'迁移应用':'']);}

const PHASES=['明确真实目的','学习必要方法','设计方案','完成第一部分','完成第二部分','真实用户测试','交付与迁移'];
const BASE_STANDARDS=['能说清给谁用、解决什么、怎样算成功。','能复述必要方法并完成一个小样例。','形成别人看得懂的清单、草图或流程。','出现可见的第一版成果并记录至少一个问题。','核心成果基本完成，并能说明仍缺什么。','真实使用者实际试用并留下具体反馈。','根据反馈修改、完成收尾归档，并说明方法迁移。'];
const BASE_PARENTS=['只问清目的、使用者和成功标准，不急着教工具。','从已有资源中筛选一个最小方法，只示范一个样例。','检查步骤是否可执行，但不替孩子做全部决定。','遇到卡点只给一个提示，让孩子说出下一步。','提醒记录问题和完成收尾，不增加无关技能。','作为真实用户说事实反馈，不直接替孩子重做。','帮助提炼方法和迁移，不把复盘变成批评会。'];
const BASE_ELDERS=['提醒一次，让孩子先说今天推进哪一步。','只提供资料和材料，不讲复杂方法。','看是否先计划再动手。','守时间和安全，不替孩子完成。','记录提醒次数和具体卡点。','作为真实使用者，说事实反馈。','确认清理、归位和交付。'];

function compileTask({shell,coreSkills,realUser,problem,availableTime}) {
  const template=TEMPLATES[shell]||TEMPLATES['刘慈欣科幻']; const core=uniq(coreSkills).slice(0,3);
  const support=uniq([...template.support,...focusSkills()]).filter(skill=>!core.includes(skill)).slice(0,6);
  const maintenance=uniq(template.maintain).filter(skill=>!core.includes(skill)&&!support.includes(skill));
  const steps=template.steps.map((title,index)=>({id:makeId(),phase:PHASES[index],title,purpose:BASE_STANDARDS[index],child:title,parent:BASE_PARENTS[index],elder:BASE_ELDERS[index],duration:Math.max(15,Math.round(Number(availableTime)*(index===3||index===4?1:0.65))),evidence:index===0?'一句真实目的说明':index===1?'方法要点或小样例':index===2?'清单、草图或流程':index===5?'真实用户反馈':index===6?'最终成果和方法卡':'阶段照片、文件或数据',standard:BASE_STANDARDS[index],skills:[],skillTraining:[],done:false,note:''}));
  for(const skill of core){const plugin=SKILL_PLUGINS[skill];if(!plugin)continue;const step=steps[plugin.phase];step.child+=`；并且：${plugin.action}`;step.parent+=` ${plugin.parent}`;step.evidence=`${step.evidence}；${plugin.evidence}`;step.standard+=` 核心能力验收：${plugin.standard}`;step.skills.push(skill);step.skillTraining.push({skill,role:'核心训练',action:plugin.action});}
  for(const skill of support){const plugin=SKILL_PLUGINS[skill];if(!plugin)continue;const step=steps[plugin.phase];if(!step.skills.includes(skill))step.skills.push(skill);step.skillTraining.push({skill,role:'重要支撑',action:plugin.action});if(!step.child.includes(plugin.action))step.child+=`；支撑练习：${plugin.action}`;}
  for(const skill of maintenance){const plugin=SKILL_PLUGINS[skill];if(!plugin)continue;const step=steps[plugin.phase];if(!step.skills.includes(skill))step.skills.push(skill);step.skillTraining.push({skill,role:'基础维护',action:plugin.action});}
  steps.forEach((step,index)=>{if(step.skills.length===0){const fallback=support[index%Math.max(support.length,1)]||core[index%Math.max(core.length,1)];if(fallback)step.skills.push(fallback);}});
  const skillOutputs=core.map(skill=>SKILL_PLUGINS[skill]?.output).filter(Boolean);const userText=realUser||'家人';const problemText=problem||template.purpose;
  return{id:makeId(),compilerVersion:'fallback-compiler-2.2',fingerprint:`${shell}|${core.join('+')}|${userText}|${availableTime}|${problemText}`,compiledAt:new Date().toISOString(),title:template.title,purpose:`${template.purpose} 真实使用者：${userText}。本次重点解决：${problemText}`,shell,realUser:userText,problem:problemText,availableTime:Number(availableTime),coreSkills:core,supportSkills:support,maintenanceSkills:maintenance,outputs:uniq([...template.outputs,...skillOutputs]),materials:template.materials,safety:template.safety,steps};
}
if(!state.task)state.task=compileTask({shell:'刘慈欣科幻',coreSkills:['责任闭环','任务拆解'],realUser:'妹妹和爷爷奶奶',problem:'家里的科幻书需要更好整理。',availableTime:35});
function save(){storageSet(JSON.stringify(state));}
function metric(name,level,color){return`<div class="metric"><label><b>${escapeHtml(name)}</b><span>${level}/5</span></label><div class="progress"><div class="bar" style="width:${level*20}%;background:${color}"></div></div></div>`;}
function matrix(task){const group=(title,items,cssClass)=>`<div class="matrix-group ${cssClass}"><div class="matrix-title">${title}</div><div class="matrix-tags">${items.map(item=>`<span class="pill ${cssClass==='support'?'green':cssClass==='maintain'?'orange':''}">${escapeHtml(item)}</span>`).join('')}</div></div>`;return`<div class="matrix">${group('核心训练',task.coreSkills,'core')}${group('重要支撑',task.supportSkills,'support')}${group('基础维护',task.maintenanceSkills,'maintain')}</div>`;}

function go(page){document.querySelectorAll('.page').forEach(node=>node.classList.remove('active'));el(page).classList.add('active');document.querySelectorAll('nav button').forEach(node=>node.classList.toggle('active',node.dataset.page===page));const titles={home:['成长OS','让每个真实任务都长出能力'],profile:['孩子画像','画像真正参与任务编译'],skills:['技能树','从基础能力追溯到未来能力'],generator:['项目编译器','当前为可解释的模板回退引擎'],workflow:['完整工作流','选择不同，步骤和能力训练随之改变'],review:['证据与迁移','反馈成为升级依据']}[page];el('pageTitle').textContent=titles[0];el('pageSub').textContent=titles[1];({home:renderHome,profile:renderProfile,skills:renderSkills,generator:renderGenerator,workflow:renderWorkflow,review:renderReview}[page])();scrollTo(0,0);}
function renderHome(){const task=state.task;const done=task.steps.filter(step=>step.done).length;const next=task.steps.find(step=>!step.done)||task.steps.at(-1);el('childBadge').textContent=`哥哥 · ${state.child.age.split(' · ')[0]}`;el('currentTaskTitle').textContent=task.title;el('taskProgressText').textContent=`已推进 ${done} / ${task.steps.length} 步 · ${task.shell} · ${task.coreSkills.join('＋')}`;el('taskProgressBar').style.width=`${done/task.steps.length*100}%`;el('todayStep').textContent=next.child;el('todayStandard').textContent=`完成标准：${next.standard}`;el('homeMatrix').innerHTML=matrix(task);el('homeSkills').innerHTML=state.child.focus.slice(0,3).map((item,index)=>metric(item.name,state.skills[item.name]?.level||0,['var(--green)','var(--purple)','var(--blue)'][index])).join('');}
function renderProfile(){el('profileName').textContent=state.child.name;el('profileAge').textContent=state.child.age;el('profileInterests').innerHTML=state.child.interests.map(item=>`<span class="pill">${escapeHtml(item)}</span>`).join('');el('profileFocus').innerHTML=state.child.focus.map(item=>`<div class="card evidence"><b>${escapeHtml(item.name)}</b><div class="small">${escapeHtml(item.desc)}</div></div>`).join('');el('profileResources').innerHTML=state.child.resources.map(item=>`• ${escapeHtml(item)}`).join('<br>');}
function professionLevel(skills){return Math.round(skills.reduce((sum,skill)=>sum+(state.skills[skill]?.level||0),0)/skills.length);}
function canUpgrade(skill){const data=state.skills[skill];const strong=data.evidence.filter(item=>item.strong);if(data.level===0)return data.evidence.length>0;if(data.level===1)return strong.length>=1;if(data.level===2)return strong.length>=3;return new Set(strong.map(item=>item.shell)).size>=2;}
function renderSkills(){const colors=['var(--primary)','var(--blue)','var(--orange)','var(--purple)','var(--green)','var(--red)'];el('professionSkills').innerHTML=Object.entries(PROFESSIONS).map(([name,skills],index)=>metric(name,professionLevel(skills),colors[index])).join('');el('skillList').innerHTML=SKILLS.map(skill=>{const meta=SKILL_META[skill],data=state.skills[skill],ready=canUpgrade(skill);return`<div class="skill-card"><div class="skill-head"><div><div class="skill-name">${escapeHtml(skill)}</div><div class="skill-path">${meta.map(escapeHtml).slice(0,3).join(' → ')}</div></div><span class="level-badge">${data.level}/5</span></div><div class="small">下一等级证据：${escapeHtml(meta[3])}</div><div class="skill-evidence"><span class="${ready?'eligible':'not-eligible'}">${ready?'已满足升级建议':`已有 ${data.evidence.length} 条证据`}</span>${ready?`<button class="btn small-btn green" data-upgrade-skill="${escapeHtml(skill)}">家长确认升级</button>`:''}</div></div>`;}).join('');document.querySelectorAll('[data-upgrade-skill]').forEach(button=>button.addEventListener('click',()=>confirmUpgrade(button.dataset.upgradeSkill)));}
function confirmUpgrade(skill){if(!canUpgrade(skill))return;state.skills[skill].level=Math.min(5,state.skills[skill].level+1);save();renderSkills();renderHome();}
function renderGenerator(){el('profileSignal').innerHTML=`<b>本次编译输入</b><div class="small">当前外壳：<b>${escapeHtml(chosenShell)}</b><br>核心技能：<b>${chosenSkills.map(escapeHtml).join('、')||'尚未选择'}</b><br>画像重点：${state.child.focus.map(item=>escapeHtml(item.name)).join('、')}<br>说明：当前暂不调用AI，使用可解释的模板回退编译器。</div>`;el('shellTags').innerHTML=SHELLS.map(shell=>`<button type="button" class="tag ${shell===chosenShell?'selected':''}" data-shell="${escapeHtml(shell)}">${escapeHtml(shell)}</button>`).join('');el('skillTags').innerHTML=SKILLS.map(skill=>`<button type="button" class="tag skill ${chosenSkills.includes(skill)?'selected':''}" data-skill="${escapeHtml(skill)}">${escapeHtml(skill)}</button>`).join('');document.querySelectorAll('[data-shell]').forEach(button=>button.addEventListener('click',()=>{chosenShell=button.dataset.shell;compiledPreview=null;el('generatedTask').innerHTML='';renderGenerator();}));document.querySelectorAll('[data-skill]').forEach(button=>button.addEventListener('click',()=>{const skill=button.dataset.skill;if(chosenSkills.includes(skill))chosenSkills=chosenSkills.filter(item=>item!==skill);else if(chosenSkills.length<3)chosenSkills=[...chosenSkills,skill];else alert('核心技能最多选择3项。先取消一项再选择。');compiledPreview=null;el('generatedTask').innerHTML='';renderGenerator();}));}
function generateTask(){const inputs={shell:chosenShell,coreSkills:[...chosenSkills],realUser:el('realUser').value.trim()||'家人',problem:el('realProblem').value.trim()||'解决一个真实家庭问题',availableTime:Number(el('availableTime').value||35)};if(inputs.coreSkills.length===0)return alert('至少选择1项核心培养技能。');compiledPreview=compileTask(inputs);const firstCoreStep=compiledPreview.steps.find(step=>step.skillTraining.some(item=>item.role==='核心训练'));el('generatedTask').innerHTML=`<div class="card"><span class="pill green">已按当前选择重新编译</span><h2>${escapeHtml(compiledPreview.title)}</h2><p class="small">${escapeHtml(compiledPreview.purpose)}</p>${matrix(compiledPreview)}<div class="notice"><b>编译确认证据</b><br>外壳：${escapeHtml(compiledPreview.shell)}<br>核心技能：${compiledPreview.coreSkills.map(escapeHtml).join('、')}<br>每日时间：${compiledPreview.availableTime}分钟<br>一个被技能改写的步骤：${escapeHtml(firstCoreStep?.child||'')}</div><p class="small"><b>交付：</b>${compiledPreview.outputs.map(escapeHtml).join('、')}<br><b>安全：</b>${escapeHtml(compiledPreview.safety)}<br><b>编译标识：</b>${escapeHtml(compiledPreview.fingerprint)}</p><button id="useTaskBtn" class="btn full" type="button">使用这个新任务</button></div>`;el('useTaskBtn').addEventListener('click',()=>{state.task=typeof structuredClone==='function'?structuredClone(compiledPreview):JSON.parse(JSON.stringify(compiledPreview));save();renderHome();go('workflow');});}
function renderWorkflow(){const task=state.task;el('wfTitle').textContent=task.title;el('wfPurpose').textContent=`${task.purpose}｜核心训练：${task.coreSkills.join('、')}`;el('wfMatrix').innerHTML=matrix(task);el('steps').innerHTML=task.steps.map((step,index)=>{const training=step.skillTraining?.length?`<div class="detail-block"><p><b>本步能力怎样训练：</b></p>${step.skillTraining.map(item=>`<p>• <b>${escapeHtml(item.skill)}（${escapeHtml(item.role)}）</b>：${escapeHtml(item.action)}</p>`).join('')}</div>`:'';return`<div class="task-step ${step.done?'done':''}"><div class="step-dot">${step.done?'✓':index+1}</div><div class="step-body"><span class="pill gray">${escapeHtml(step.phase)}</span><h3>${escapeHtml(step.title)}</h3><p><b>孩子：</b>${escapeHtml(step.child)}</p><div class="step-meta"><div class="meta-box"><b>预计时间</b><br>${step.duration}分钟</div><div class="meta-box"><b>留下证据</b><br>${escapeHtml(step.evidence)}</div></div><div class="detail-block"><p><b>家长：</b>${escapeHtml(step.parent)}</p><p><b>老人：</b>${escapeHtml(step.elder)}</p><p><b>完成标准：</b>${escapeHtml(step.standard)}</p><p><b>本步能力：</b>${step.skills.map(escapeHtml).join('、')}</p></div>${training}<textarea class="step-note" placeholder="记录卡点或证据" data-step-note="${index}">${escapeHtml(step.note||'')}</textarea><label class="checkline"><input type="checkbox" data-step-check="${index}" ${step.done?'checked':''}> 已完成、检查并收尾</label></div></div>`;}).join('');document.querySelectorAll('[data-step-note]').forEach(field=>field.addEventListener('change',()=>{state.task.steps[Number(field.dataset.stepNote)].note=field.value;save();}));document.querySelectorAll('[data-step-check]').forEach(box=>box.addEventListener('change',()=>{state.task.steps[Number(box.dataset.stepCheck)].done=box.checked;save();renderWorkflow();renderHome();}));}
function saveWorkflow(){save();alert('进度已保存。');}
function renderReview(){const done=state.task.steps.filter(step=>step.done).length;el('reviewGate').innerHTML=`当前任务完成 <b>${done}/${state.task.steps.length}</b> 步。只有全部完成、真实测试、修改且主要独立完成，才算强证据。`;renderReviews();el('reviewResult').innerHTML='';}
function saveReview(){const review={id:makeId(),date:new Date().toISOString(),task:state.task.title,shell:state.task.shell,evidenceType:el('evidenceType').value,independence:Number(el('independence').value),userTest:el('userTest').checked,revised:el('revised').checked,taught:el('taught').checked,feedback:el('fb').value.trim(),summary:el('sum').value.trim(),abstract:el('abs').value.trim(),apply:el('apply').value.trim(),transfer:el('transfer').value.trim()};review.score=[state.task.steps.every(step=>step.done)?2:0,review.evidenceType?1:0,review.independence>=2?1:0,review.userTest?1:0,review.revised?1:0,review.feedback.length>=8?1:0,review.summary.length>=8?1:0,review.abstract.length>=6?1:0,review.apply.length>=6?1:0,review.transfer.length>=8?1:0,review.taught?1:0].reduce((a,b)=>a+b,0);review.strong=state.task.steps.every(step=>step.done)&&review.independence>=2&&review.userTest&&review.revised&&review.score>=9;state.reviews.unshift(review);[...state.task.coreSkills,...state.task.supportSkills].forEach(skill=>state.skills[skill]?.evidence.push({date:review.date.slice(0,10),shell:review.shell,strong:review.strong,transfer:review.transfer}));save();renderReviews();el('reviewResult').innerHTML=`<div class="card"><div class="row between"><div><b>本次证据质量</b><div class="small">${review.strong?'强证据，可用于升级判断':'普通证据，暂不支持升级'}</div></div><div class="review-score">${review.score}/12</div></div></div>`;alert('已保存证据，技能不会自动升级。');}
function renderReviews(){el('reviewHistory').innerHTML=state.reviews.length?'<div class="section-title">历史证据</div>'+state.reviews.map(review=>`<div class="card"><div class="row between"><span class="pill purple">${new Date(review.date).toLocaleDateString()}</span><span class="pill ${review.strong?'green':'gray'}">${review.strong?'强证据':'普通证据'} ${review.score}/12</span></div><h3>${escapeHtml(review.task)}</h3><div class="small"><b>反馈：</b>${escapeHtml(review.feedback||'未填写')}<br><b>提炼：</b>${escapeHtml(review.abstract||'未填写')}<br><b>迁移：</b>${escapeHtml(review.transfer||'未填写')}</div></div>`).join(''):'<div class="empty">还没有证据记录。</div>';}
function openGuide(){const step=state.task.steps.find(item=>!item.done)||state.task.steps.at(-1);el('sheet').innerHTML=`<div class="row between"><h2>今晚10分钟教学脚本</h2><button class="btn ghost" type="button" id="closeGuideBtn">关闭</button></div><hr><p><b>当前步骤：${escapeHtml(step.title)}</b></p><p class="small">${escapeHtml(step.standard)}</p><p><b>1. 复述目的</b></p><p class="small">给谁用？做完看到什么？</p><p><b>2. 最小示范</b></p><p class="small">${escapeHtml(step.parent)}</p><p><b>3. 孩子接手</b></p><p class="small">只问：下一步准备做什么？</p><p><b>4. 留下证据</b></p><p class="small">${escapeHtml(step.evidence)}</p>`;el('modal').classList.add('open');el('closeGuideBtn').addEventListener('click',closeModal);}
function editProfile(){el('sheet').innerHTML=`<div class="row between"><h2>编辑孩子画像</h2><button class="btn ghost" type="button" id="closeProfileBtn">关闭</button></div><div class="field"><label>姓名</label><input id="edName" value="${escapeHtml(state.child.name)}"></div><div class="field"><label>年龄阶段</label><input id="edAge" value="${escapeHtml(state.child.age)}"></div><div class="field"><label>兴趣（逗号分隔）</label><textarea id="edInterests">${escapeHtml(state.child.interests.join('，'))}</textarea></div><div class="field"><label>成长重点：每行“能力|描述”</label><textarea id="edFocus">${escapeHtml(state.child.focus.map(item=>`${item.name}|${item.desc}`).join('\n'))}</textarea></div><div class="field"><label>家庭资源（每行一项）</label><textarea id="edResources">${escapeHtml(state.child.resources.join('\n'))}</textarea></div><button class="btn full" type="button" id="saveProfileBtn">保存并用于任务编译</button><hr><div class="grid2"><button class="btn secondary" type="button" id="exportBtn">导出数据</button><button class="btn ghost" type="button" id="importBtn">导入数据</button></div>`;el('modal').classList.add('open');el('closeProfileBtn').addEventListener('click',closeModal);el('saveProfileBtn').addEventListener('click',saveProfile);el('exportBtn').addEventListener('click',exportData);el('importBtn').addEventListener('click',importData);}
function saveProfile(){state.child.name=el('edName').value.trim()||'孩子A';state.child.age=el('edAge').value.trim();state.child.interests=el('edInterests').value.split(/[，,]/).map(item=>item.trim()).filter(Boolean);state.child.focus=el('edFocus').value.split('\n').map(item=>item.trim()).filter(Boolean).map(line=>{const [name,...description]=line.split('|');return{name:name.trim(),desc:description.join('|').trim()||'继续观察'};});state.child.resources=el('edResources').value.split('\n').map(item=>item.trim()).filter(Boolean);save();renderProfile();closeModal();}
function exportData(){const anchor=document.createElement('a');anchor.href=URL.createObjectURL(new Blob([JSON.stringify(state,null,2)],{type:'application/json'}));anchor.download='成长OS数据.json';anchor.click();}
function importData(){const input=document.createElement('input');input.type='file';input.accept='.json';input.onchange=()=>{const reader=new FileReader();reader.onload=()=>{try{storageSet(JSON.stringify(JSON.parse(reader.result)));location.reload();}catch(error){alert('文件格式不正确');}};reader.readAsText(input.files[0]);};input.click();}
function closeModal(){el('modal').classList.remove('open');}
window.addEventListener('DOMContentLoaded',()=>{el('editProfileBtn')?.addEventListener('click',editProfile);renderHome();renderProfile();renderSkills();renderGenerator();renderWorkflow();renderReview();});
