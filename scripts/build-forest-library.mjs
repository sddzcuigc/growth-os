import {writeFile,mkdir} from 'node:fs/promises';
const root=new URL('../forest/',import.meta.url);
const sources={
  numeracy:{title:'OpenStax — Prealgebra 2e',url:'https://openstax.org/books/prealgebra-2e/pages/1-introduction',kind:'开放教材',scope:'数、运算与度量；练习卡采用自编生活情境'},
  finance:{title:'CFPB — Youth financial education activities',url:'https://www.consumerfinance.gov/consumer-tools/educator-tools/youth-financial-education/teach/activities/',kind:'教育活动目录',scope:'预算、比较与消费决定的练习方向；不是具体金融产品建议'},
  oecd:{title:'OECD Learning Compass 2030',url:'https://www.oecd.org/en/data/tools/oecd-learning-compass-2030.html',kind:'教育框架',scope:'自主行动、知识与技能、态度价值和身心发展；提供方向，不预测个人职业'},
  wef:{title:'WEF Future of Jobs 2025 — Skills outlook',url:'https://www.weforum.org/publications/the-future-of-jobs-report-2025/in-full/3-skills-outlook/',kind:'雇主调查与趋势',scope:'职业技能需求信号；不是未来必需技能的确定清单'},
  unesco:{title:'UNESCO AI competency framework for students',url:'https://www.unesco.org/en/articles/ai-competency-framework-students',kind:'教育框架',scope:'人本判断、AI 伦理、应用与创造'},
  ies:{title:'IES — Organizing Instruction and Study to Improve Student Learning',url:'https://ies.ed.gov/ncee/wwc/Docs/PracticeGuide/20072004.pdf',kind:'学习研究实践指南',scope:'间隔、提取练习和示例等方法；不能直接证明本产品效果'},
  feedback:{title:'EEF — Feedback',url:'https://educationendowmentfoundation.org.uk/education-evidence/teaching-learning-toolkit/feedback',kind:'证据综述',scope:'针对目标和具体错误给反馈，并让学习者实际使用'},
  sift:{title:'Mike Caulfield — SIFT (The Four Moves)',url:'https://hapgood.us/2019/06/19/sift-the-four-moves/',kind:'作者原始方法',scope:'停一下、调查来源、查找更好报道、追溯原始情境'},
  cook:{title:'HowToCook — 西红柿炒鸡蛋',url:'https://github.com/Anduin2017/HowToCook/blob/master/dishes/vegetable_dish/西红柿炒鸡蛋.md',kind:'开源社区操作参考',scope:'备料与烹饪顺序；不是儿童课程或食品安全权威'},
  food:{title:'FDA — Safe Food Handling',url:'https://www.fda.gov/food/buy-store-serve-safe-food/safe-food-handling',kind:'官方安全操作',scope:'清洁、分开处理与充分加热等基本要求'},
  egg:{title:'FDA — What You Need to Know About Egg Safety',url:'https://www.fda.gov/food/buy-store-serve-safe-food/what-you-need-know-about-egg-safety',kind:'官方安全操作',scope:'炒蛋不应呈流动状态；用餐和储存规则'},
  security:{title:'CISA — Secure Our World Passwords Tip Sheet (2024)',url:'https://www.cisa.gov/sites/default/files/2024-09/Secure-Our-World-Passwords-Tip-Sheet.pdf',kind:'官方指南',scope:'长、随机、不同账号不复用；不是对特定登录产品的认证'},
  mdn:{title:'MDN — Core learning modules',url:'https://developer.mozilla.org/en-US/docs/Learn_web_development/Core',kind:'技术课程目录',scope:'网页开发的基础组成，职业路线覆盖参考'},
  html:{title:'MDN — Structuring content with HTML',url:'https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content',kind:'官方技术教程',scope:'语义化结构、表单和标签'},
  css:{title:'MDN — Getting started with CSS',url:'https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics/Getting_started',kind:'官方技术教程',scope:'样式表、选择器与基础样式'},
  js:{title:'MDN — Dynamic scripting with JavaScript',url:'https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting',kind:'官方技术教程',scope:'变量、事件、条件与界面行为'},
  git:{title:'GitHub Docs — Hello World',url:'https://docs.github.com/en/get-started/using-github/hello-world',kind:'官方技术教程',scope:'分支、提交、变更说明和代码审阅'},
  tests:{title:'Playwright — Writing tests',url:'https://playwright.dev/docs/writing-tests',kind:'官方技术教程',scope:'通过真实操作和断言检查结果'},
  genai:{title:'Microsoft — Generative AI for Beginners',url:'https://github.com/microsoft/generative-ai-for-beginners',kind:'开源课程',scope:'生成式 AI 基础、负责任使用与应用实践；练习卡独立编写'},
  sqlite:{title:'SQLite — SELECT',url:'https://www.sqlite.org/lang_select.html',kind:'官方技术文档',scope:'查询、筛选、分组和汇总'},
  usability:{title:'Nielsen Norman Group — Usability Testing 101',url:'https://media.nngroup.com/media/articles/attachments/UsabilityTesting101_Letter_Size.pdf',kind:'作者方法指南',scope:'用真实任务观察用户，避免引导'},
  contrast:{title:'W3C — Understanding Contrast (Minimum)',url:'https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html',kind:'标准解释',scope:'文本对比度和可读性检查'},
  nasa:{title:'NASA JPL — Make a Paper Mars Helicopter',url:'https://www.jpl.nasa.gov/edu/resources/project/make-a-paper-mars-helicopter-2/',kind:'机构项目实践',scope:'制作、测试和改进纸直升机，本文练习是原创简化设计'},
  who:{title:'WHO — Physical activity',url:'https://www.who.int/news-room/fact-sheets/detail/physical-activity',kind:'公共健康指南',scope:'身体现实活动的重要性；这里不制定个体医疗或训练处方'},
  emotions:{title:'UNICEF — Supporting Children’s Emotional Well-being',url:'https://www.unicef.org/pacificislands/media/6281/file',kind:'家庭教育指南',scope:'帮助认识情绪、提供成人支持；不是诊断和治疗'},
  sba:{title:'SBA — Plan your business',url:'https://www.sba.gov/counseling/plan-your-business/',kind:'官方创业指南',scope:'研究需求、计划、成本和经营准备'},
  jobSoftware:{title:'O*NET — Software Developers',url:'https://www.onetonline.org/link/details/15-1252.00',kind:'职业任务资料',scope:'软件需求、设计、实现与测试的职业映射'},
  jobData:{title:'O*NET — Data Scientists',url:'https://www.onetonline.org/link/summary/15-2051.00',kind:'职业任务资料',scope:'问题定义、数据准备、分析与交流'},
  jobDesign:{title:'O*NET — Web and Digital Interface Designers',url:'https://www.onetonline.org/link/summary/15-1255.00',kind:'职业任务资料',scope:'用户需求、界面设计与测试'},
  jobEngineer:{title:'O*NET — Mechanical Engineers',url:'https://www.onetonline.org/link/summary/17-2141.00',kind:'职业任务资料',scope:'设计、试验与改进的职业映射，不覆盖专业执业资格'},
  jobTeacher:{title:'O*NET — Middle School Teachers',url:'https://www.onetonline.org/link/summary/25-2022.00',kind:'职业任务资料',scope:'学习目标、教学、反馈和评估'},
  jobBusiness:{title:'O*NET — General and Operations Managers',url:'https://www.onetonline.org/link/summary/11-1021.00',kind:'职业任务资料',scope:'资源、计划、成本、运营与协作'}
};
const categories=[['life','生活与自理','🌱','oak'],['learn','学习与求证','📚','sakura'],['digital','数字与 AI','💻','pine'],['collaborate','沟通与项目','🤝','willow'],['wellbeing','身心与安全','🌿','ginkgo'],['software','软件与 AI 应用','🛠️','pine'],['data','数据分析','📊','sakura'],['design','产品与体验设计','🎨','orange'],['engineering','科学与工程实践','⚙️','oak'],['teaching','教学与知识传播','🧑‍🏫','willow'],['business','经营与运营','🏪','orange']].map(([id,title,icon,theme])=>({id,title,icon,theme}));
const skills=[];
function s(id,categoryId,title,prerequisites,materials,steps,criteria,sourceIds,extra={}){
  skills.push({id,categoryId,title,level:['life','learn','digital','collaborate','wellbeing'].includes(categoryId)?'通用基础':'职业入门',prerequisites:prerequisites?prerequisites.split(' '):[],materials:materials.split('|'),steps:steps.split('|'),criteria:criteria.split('|'),sourceIds:sourceIds.split(' '),practice:{guided:'先看一次完整示范，再自己做，指出卡住的具体步骤。',independent:'收起步骤后独立复现，对照完成条件找出差异，再练最小的出错步骤。',transfer:'换一种材料、题目或真实项目再次使用，记录需要的帮助。'},review:{exampleDays:[1,3,7],note:'仅为可调整的起始排程；技能复习以实际复现、遗忘和项目需要决定，不能把固定间隔称为普遍最佳。'},...extra});
}
// Each card is an original, observable exercise. References support the method or domain.
s('learn-readsteps','learn','把一段操作说明变成行动清单','','一段五至八句的适龄说明|纸笔','先说出这份说明要完成什么|圈出需要的材料、数量和条件|给动作按先后编号|把不懂的词写出来并向可靠的人或资料确认|按清单实际做一次，核对遗漏','能按顺序做出对应结果|不懂之处经过确认而非猜测','oecd ies');
s('collab-writeclear','collaborate','写一段让别人能照做的说明','learn-readsteps','自己做过的小技能|纸笔|一位愿意试做的人','写出目的和准备材料|每句话只写一个能观察的动作|补上关键数量、方向或完成条件|请另一人只看说明试做，自己不抢着提示|把对方卡住的地方改写后再试','别人能够凭说明尝试完成|保留一处根据实际误解做出的修改','feedback oecd');
s('learn-estimate','learn','先估算再核算一次采购总价','','三种模拟商品价签|纸笔|计算器','记下每种商品的单价和数量|把价格取便于心算的近似数，先估总额|逐项计算准确金额并求和|比较估算和准确金额的差距|说明误差来自哪里，再换一组价格试一次','准确总额可以复算|能够解释估算适合快速检查而非最终结账','numeracy');
s('life-measure','life','按指定单位量取一份材料','','适合的量杯或秤|水或其他安全材料|目标数量','读清目标数量及单位，例如 200 毫升水|选择匹配的量杯或秤，辨认刻度|放稳容器并按工具说明归零或读初始值|缓慢加入材料，在正确位置读数并调整|再量一次比较差异，记录实际数值与工具精度','记录包含数值和单位|读数方法与工具匹配且能够重复','numeracy',{adultSupport:'只使用适龄安全材料与工具，不把毫升和克直接当成相同单位。'});
s('life-budget','life','在预算内选择一份采购方案','life-list learn-estimate','模拟购物清单|预算额度|价签','写清总预算和必须买的东西|估算并核算清单总价|把超过预算的部分标出来|比较减少数量、替换商品和放弃非必需项的结果|写出最终选择并保留一点余量，核查总额没有超出','方案总额不超过预算|能说明保留与放弃的理由','finance numeracy');
s('life-receipt','life','用小票核对金额和找零','learn-estimate','模拟小票|模拟付款金额|纸笔','把小票商品与实际清单逐项配对|检查数量、单价与单项金额|重新计算总金额|用付款金额减总金额，算出应找零金额|比较实际找零，发现差异时清楚提出核对请求','至少一次总金额和找零独立算对|能指出具体哪一项有差异','finance numeracy',{adultSupport:'先用模拟付款练习；真实支付由照看者安排，不公开收付款码。'});
s('digital-consent','digital','分享照片前取得同意并遮住私人信息','','本人制作的模拟图片|图片编辑工具','查看图片里是否含别人面孔、姓名或位置|确定要分享给谁以及分享的目的|取得相关人的明确同意，未同意则不用该图|裁去或遮住无关身份信息，再打开检查|选择适当范围发送，拒绝分享时采用文字或无人物图片替代','能说清谁同意了什么范围的分享|没有将私人信息默认公开','unesco');
s('life-resource','life','比较一次用量并减少一项浪费','','安全的日常任务|纸笔或量杯','选一次可观察任务，例如清洗用具或整理食材|记录原来用了多少水或材料及如何测量|找出一项不影响清洁或安全的可减少步骤|实际再做一次并用相同单位记录|比较结果，同时说明不能减少的安全环节','前后记录单位一致|节省没有以牺牲清洁、安全或他人需要为代价','oecd numeracy');
s('life-bag','life','把购物袋口系牢','','干净的空购物袋|少量不易碎的物品','将物品放稳，留出足够长的袋口|把两侧提手交叉，绕过并穿出一个结|轻拉两端，检查物品是否会掉出|松开再重新系一次|在实际采购后，用适合的袋子再试','提起时物品不滑出|能够说明怎样解开并重新使用','oecd',{aliases:['系塑料袋','系购物袋'],adultSupport:'先由成人判断袋子和物品是否适合，塑料袋不套在头上。'});
s('life-list','life','为一道菜列采购清单','','菜谱|纸笔或表格','确定做哪道菜和几人份|逐项写出需要的食材|检查家中已有食材|写出还需购买的数量与预算上限|请家人核对一次是否遗漏','清单写清品名、数量和已有库存|没有把家里已有食材重复算入采购','cook oecd');
s('life-price','life','比较两种商品的单位价格','life-list','两张价签|计算器','记录两件商品的售价和净含量|把重量或容量换成同一单位|分别计算每 100 克或每件价格|比较可用数量、保质情况与实际需要|写出选择及理由','计算单位相同且可复算|能解释便宜大包装是否真的用得完','sba');
s('life-shopping','life','按清单完成一次买菜','life-list life-price','采购清单|可用预算|购物袋','与照看者确认地点、预算和分工|按清单找商品并核对数量与价签|不确定品名或价格时向店员询问|结算后核对小票与实物|回家逐项勾选，记录遗漏或多买','实物与清单、收据可以核对|能说清一次购买选择','oecd sba',{adultSupport:'儿童由照看者陪同采购，支付与外出安排按家庭条件决定。'});
s('life-prep','life','按菜谱完成一次备料','life-list','番茄与鸡蛋|清洁台面|合适工具','阅读菜谱并摆好材料和工具|清洁双手、台面和待处理食材|按用量称取或数清食材|在成人指导下完成需要工具的处理|把处理好的材料按烹饪顺序摆好','品种和数量与菜谱一致|处理过程避免污染已准备好的食物','food cook',{adultSupport:'刀具、热水等步骤须由具备条件的成人指导或完成，并如实记录帮助。'});
s('life-cook','life','把番茄和鸡蛋炒熟并装盘','life-prep','已备好的食材|锅与锅铲|成人陪同','按菜谱准备并检查灶具周围|由成人示范合适的加热和用油方式|把打散的鸡蛋炒至凝固，再按菜谱处理番茄|合炒并检查鸡蛋已完全凝固、没有流动蛋液|关火、装盘，说明自己做过和需要帮助的步骤','菜品完成且关火确认|鸡蛋充分做熟|能复述关键步骤而非只按完成键','cook egg food',{adultSupport:'涉及明火、热锅和热油，儿童必须由成人指导；做熟条件优先于菜谱中的半熟中间状态。'});

s('learn-breakdown','learn','把一个目标拆成可练习的小步骤','','一个自己想做的目标|纸笔','写下最后想做成的具体东西|列出完成它需要的动作|把仍然不知道如何开始的动作继续拆小|给每一步写出看得见的完成条件|选出最需要先练的一步并动手','每一步能开始且能检查|结果、技能与练习动作没有混为一谈','oecd');
s('learn-recall','learn','合上资料回答三个关键问题','','一页适龄材料|纸笔','读完一个短段落|自己写出三个关键问题|合上资料后回答|打开原文核对并标出遗漏|只针对遗漏重新学习后再答','回答来自独立回忆|错处有原文核对和修正','ies');
s('learn-space','learn','安排并完成一次延后复习','learn-recall','已学习的小技能|日历或提醒','记录今天学了什么以及能否独立做|选择一个稍后日期，例如次日|到时先不看步骤尝试复现|核对错误，重新练习困难处|根据实际表现决定下次日期','先尝试再看答案|实际复现结果和下次时间有记录','ies');
s('learn-example','learn','从看懂示例走到独立做一题','','一个完整示例|一道相近新题','逐步看示例，并解释每步目的|遮住示例的一步，自己补出来|做一道只改变少量条件的新题|对照结果定位第一次出错处|再独立完成一道变式题','至少一道新题由自己完成|能解释关键步骤，而非背出原答案','ies');
s('learn-source','learn','追溯一条说法的原始来源','','一条可核查的公开说法|浏览器','先写下具体要核查的说法|查看作者、机构和发布时间|离开当前页面查找独立来源|找到原始报告、原文或原始数据|记录支持、反对或信息不足及原因','能打开对应原始来源|没有把多个转载当作多个独立证据','sift');
s('learn-explain','learn','用自己的话讲清一个小技能','learn-recall','已练过的技能|愿意听的人','先列出目的、关键步骤和易错点|不用照读，演示或讲解一次|请对方复述或尝试|根据对方卡住之处改说法|再次讲解并记录仍不清楚的地方','听者能尝试或复述关键动作|发现误解后做出改进','feedback oecd');

s('digital-files','digital','整理文件并验证一份备份','','练习文件三份|可用的备份位置','建立一个项目文件夹|按日期、主题和版本给文件命名|把原始资料与修改稿分开放|把重要文件复制到另一备份位置|从备份打开一份文件核对内容','能找到指定文件及其原始版本|备份文件实际可打开','mdn');
s('digital-account','digital','检查账号密码与恢复方式','','自己有权管理的测试账号|成人帮助','从官方网站进入账号安全设置|检查密码是否与别的账号重复，必要时用密码管理器生成独立密码|按服务支持启用第二验证因素|按服务说明妥善保存恢复方式|退出后验证本人能正常登录，不公开任何密码或验证码','可以说明防止账号丢失的两项措施|恢复资料没有发给他人','security',{adultSupport:'只操作本人或家庭明确授权的账号，儿童由成人协助。'});
s('digital-table','digital','做一张能核对合计的表格','digital-files','十条模拟采购记录|电子表格或纸笔','设置日期、品名、数量、单价四列|逐行录入并注明单位|新增金额列，逐行用数量乘单价|把金额列相加，另用计算器复核|故意改一条数量，检查结果是否随之变化','十条记录可追溯且合计正确|改动输入后结果能正确更新','jobData sba');
s('digital-ai-request','digital','给 AI 一项清楚且可检查的任务','learn-breakdown','允许使用的 AI 工具|虚构或公开材料','写出你希望得到的具体结果|提供完成任务必要的背景和材料|说明限制、格式和验收条件|检查第一次结果哪里不符合要求|只针对差异修改要求，再比较结果','结果有明确的检查条件|未把私人资料不加判断地发给工具','unesco genai');
s('digital-ai-check','digital','核对 AI 回答中的三个事实','learn-source digital-ai-request','一段 AI 回答|浏览器','把回答拆成三条可核查的事实|要求或寻找各事实的原始来源|打开来源并核对是否真的支持|把错误、过时和无法核实分别标明|改写为只保留有依据的结论','逐条有核对结果|不会把语言流畅当作准确','unesco sift');
s('digital-workflow','digital','把重复操作变成可复用清单','learn-breakdown digital-files','一个做过两次的简单任务','回看两次操作并列出相同步骤|写清每一步输入和输出|补上检查、异常和停止条件|请另一人照清单完成一次|按实际卡点删改，保存版本','另一人能按清单产出相同类型结果|异常时知道停止或求助','oecd jobSoftware');

s('collab-ask','collaborate','用提问确认别人真正要什么','','一个同意交流的人|记录纸','先问最近一次遇到问题的具体经过|追问当时怎样处理|请对方指出最麻烦的一步|复述需求和你理解的完成条件|请对方纠正，不推销预设答案','记录的是实际经历|对方确认需求描述大致正确','usability');
s('collab-request','collaborate','提出一个清楚的合作请求','','一件需要协作的小事','描述已经发生的具体情况|说明自己希望完成什么|提出对方可以执行的一项请求|听取对方的时间与条件|确认双方各做什么、何时再碰面','请求具体且对方理解|双方分工有明确约定','oecd emotions');
s('collab-plan','collaborate','为一个小项目分工并安排下一步','learn-breakdown collab-request','项目目标|纸卡或看板','写下项目成果与完成日期|把工作列成可以检查的小项|每项约定一名负责人|把事项放进未开始、进行中、已完成三列|结束时检查阻碍并确定下一步','每项工作能找到负责人和结果|没有只用忙了多久代替完成','oecd jobBusiness');
s('collab-check','collaborate','按事先条件检查一份作品','','一份作品|完成条件清单','先写下作品应满足的三项条件|逐项实际使用或检查|分别记录通过、未通过和不确定|找到最影响结果的一项问题|修正后按原条件重新检查','有实际检查结果和改进前后对照|不确定处没有被写成通过','tests feedback');
s('collab-review','collaborate','做一次有依据的项目复盘','collab-check','做过的项目|过程记录','展示最后的作品或结果|指出自己实际用了哪些技能|找出一个做得好的具体动作|找出一个困难及其原因|给下一次项目定一个可试的改动','复盘连接实际记录|能说出下次改变哪一个动作','feedback oecd');
s('collab-present','collaborate','展示作品并回答一个追问','learn-explain collab-review','一个实际作品|三分钟时间','用一句话说明想解决什么|展示实际作品怎样使用|说明关键选择及依据|指出一个目前的限制|邀请一个问题并据实回答或承认不知道','观众能理解用途与结果|没有把没做过的事说成已完成','oecd');

s('wellbeing-observe','wellbeing','记录自己的活动与精力变化','','纸笔|一周观察时间','选一个自己愿意观察的日常活动|每天记下活动与大致时长|用自己的词记录前后的感受和精力|一周后找出重复出现的情况|与照看者讨论一个温和可行的调整','记录事实与感受分别写|不凭短期记录自行诊断健康问题','who oecd');
s('wellbeing-emotion','wellbeing','说清情绪并提出需要的支持','','一个可信成人|安静的交流机会','先说刚才发生的具体事情|用自己的词命名现在的感受|选择暂停、喝水或到安静处等适合自己的短暂缓冲|告诉可信成人希望得到哪一种帮助|事后回看什么帮助有效','能够表达感受和一个具体请求|没有把情绪名称当作人的好坏标签','emotions');
s('wellbeing-help','wellbeing','遇到不会处理的情况清楚求助','','家庭确认的可信联系人|一段模拟情境','与照看者确定哪些人可以求助|演练说明自己在哪里、发生了什么|说清已经做过什么和需要什么帮助|听完对方要求后复述确认|一起核对家庭求助方式是否可用','能在模拟中讲清地点、情况和需要|不把不知道的事编成确定事实','emotions oecd',{adultSupport:'紧急或实际危险情况应立即联系身边可信成人及当地紧急服务；本卡不是急救培训。'});
s('wellbeing-pause','wellbeing','辨认诱导点击并选择先停一下','learn-source','两条虚构消息截图','找出消息要求你立即做什么|标记催促、索要密码或异常链接|不点消息内链接，自己进入已知官方网站|向可信成人或官方渠道核对|保留脱敏截图，说明为什么选择继续或停止','核对渠道独立于原消息|不泄露验证码和账号资料','security sift');

s('software-html','software','做一个有标题和表单的网页','digital-files','代码编辑器|浏览器','建立 index.html|写出标题、段落和清单|给输入框加可见标签|保存并在浏览器打开|用键盘检查能否到达输入和按钮','页面结构能被解释|输入框有对应标签','html');
s('software-css','software','让同一页面适配手机和电脑','software-html','已有网页|浏览器开发工具','建立并关联样式表|设置可读文字、间距与容器宽度|把固定大宽度改为可伸缩布局|切换 360 和 1280 像素查看|修正横向溢出和遮挡','两种宽度均可操作|文字和按钮没有被裁掉','css');
s('software-js','software','给清单页面添加校验和操作','software-html','任务清单网页','监听表单提交|读取并去掉输入两端空白|空输入显示可理解提示|有效输入新增一项，并允许删除|逐次测试空白、正常与长文本','实际输入会改变清单|错误输入不会产生假记录','js');
s('software-storage','software','保存清单并验证刷新后仍在','software-js digital-files','清单页面|浏览器存储','把清单转换成 JSON 保存|打开页面时读取并检查格式|有记录时恢复，没有记录时显示空态|提供导出和导入一个文件|刷新并导入备份核对项目数','刷新和恢复后的内容一致|无效备份不会覆盖有效记录','js');
s('software-tests','software','为一个用户流程写三条测试','software-js collab-check','可以运行的清单页面|Playwright','把真实任务写成测试步骤|测试新增正常条目|测试空输入被拒绝|测试删除后条目消失|故意改坏行为，确认测试能失败，再修复','测试断言最终结果|能证明测试不是永远通过','tests');
s('software-release','software','提交并说明一次可回退的修改','software-tests digital-workflow','Git 仓库|脱敏练习代码','为一个明确修改建立分支|只修改实现该需求的文件|运行相关测试|提交并写清问题、行为与验证|对比修改并演练恢复上一版本','有可以检查的提交差异|知道怎样恢复而不丢其他工作','git jobSoftware');

s('data-question','data','把一个问题写成可计算的数据定义','digital-table collab-ask','一个采购或活动问题','写明要帮助谁做哪项决定|定义统计对象和时间范围|列出需要的字段、单位和来源|画出两行样例|请需求方确认这些数据能回答原问题','对象、单位和范围明确|没有用方便取得的数据偷换问题','jobData');
s('data-clean','data','清理重复和缺失并保留原始数据','data-question digital-files','含错误的十行练习数据','保留一份不可改的原始副本|定义什么算重复|标记缺失、异常日期和单位不一致|按事先规则处理并保留处理原因|核对处理前后行数与汇总变化','原始数据可找回|删除和修改都有原因与数量核对','jobData');
s('data-query','data','用查询按类别汇总一张表','data-clean','SQLite 练习库|分类采购表','查看表结构与两行样例|先查询指定日期范围|用 GROUP BY 按类别分组|用 SUM 汇总金额|用一小组手算结果核对查询','筛选范围和单位正确|一组手算能复核结果','sqlite');
s('data-chart','data','选择一张不误导读者的图','data-clean digital-table','清理后的数据|绘图工具','先写图要回答的问题|类别比较选条形图，时间变化可选折线图|给轴写明单位和范围|检查缺失值、起点和异常点|请另一人仅看图复述发现','标题、单位与数据来源完整|读者复述与原数据一致','jobData');
s('data-check','data','检查一个数据结论能否成立','data-query learn-source','一条分析结论|原始记录','把结论拆成可核对的数量关系|追溯到原始行或原始来源|改变一个合理筛选条件比较结果|列出缺失和样本选择限制|将不支持的判断改成不确定','能追溯输入与计算|不把相关变化直接当成因果','jobData sift');
s('data-report','data','交付一份可以复算的短分析','data-chart data-check','分析表格|图表|原始资料','先写一句直接回答问题的结论|附关键数字与图|说明采用的数据和计算步骤|列出限制和可能改变结论的条件|请另一人按说明复算一个数字','结论、依据和限制相连|至少一个关键数字被别人复核','jobData');

s('design-interview','design','观察一次真实操作并记录卡点','collab-ask','同意参与的人|一个真实任务','请对方回忆最近一次实际经历|给出任务，暂不教他怎样操作|记录停顿、误点和求助|用开放问题追问原因|把事实和自己的猜测分开','至少一个卡点来自实际行为|记录没有替受访者编造动机','usability jobDesign');
s('design-flow','design','画出从开始到结果的操作流程','design-interview learn-breakdown','纸笔|访谈记录','写出用户起点和最终结果|列出每一步选择和操作|标注可能失败的位置|删掉不影响完成任务的步骤|请另一人沿流程走一遍','流程有成功和失败出口|每一步对用户有明确用途','jobDesign');
s('design-prototype','design','做一份可以演示的纸面或点击原型','design-flow','纸张或原型工具','只画完成一项任务所需页面|把按钮文字写成具体动作|给每次操作准备下一画面|补上空白和失败提示|请同伴实际走完而非只看截图','可以从开始走到结果|关键按钮有真实后续画面','usability');
s('design-test','design','用三次观察修正同一个原型','design-prototype','原型|同意参与的目标用户','准备同一个真实任务|不提前提示按钮位置|记录每次完成、卡住和误解|选择最影响完成的一处修改|用新一次操作复验修改','保留前后行为差异|不把三个人的结果当成普遍统计结论','usability');
s('design-readable','design','检查文字、对比度与键盘操作','design-prototype','页面或原型|对比度检查工具','列出所有正文与背景组合|用工具检查普通文字至少 4.5:1 的对比度目标|把仅靠颜色的状态补成文字或图形|放大文字检查是否裁切|用键盘走完主要操作','低对比文字已处理|状态不只靠颜色|主要操作可通过键盘到达','contrast');
s('design-handoff','design','把设计交给另一人正确实现','design-test design-readable','原型|操作与状态说明','给出目标和关键用户任务|标注页面顺序、组件和文字|说明加载、失败及空白状态|与实现者核对有歧义之处|拿实际实现按同一任务验收','别人知道怎样处理异常状态|最后验收实际实现而非只看设计稿','jobDesign');

s('engineering-question','engineering','把好奇变成可以试验的问题','learn-breakdown','一种纸制小物|纸笔','观察并记录一个现象|写成可比较的问题|选出一次只改变的一个条件|列出需要保持相同的条件|写下怎样判断结果','变量与比较标准清楚|试验可以在现有条件下实际完成','nasa');
s('engineering-measure','engineering','用同一方法重复测量三次','engineering-question digital-table','尺或计时器|记录表','明确测量对象、单位和起止位置|先练习使用工具|按同一方法测三次|保留每次原始值，不只写最好一次|解释差异和工具限制','三次数据和单位齐全|他人能按相同方法测量','nasa');
s('engineering-build','engineering','照图制作一架纸直升机','engineering-question','纸|模板|安全剪刀|成人协助','打开原始模板并核对折线和剪切线|在纸上描出或打印轮廓|由适合的人完成剪切|按模板折出旋翼和机身|从安全的较低位置测试并观察旋转','实物与模板主要结构一致|能指出旋翼和机身各部分','nasa',{adultSupport:'剪刀和测试地点由成人确认，不攀高、不向人投掷。'});
s('engineering-compare','engineering','只改一个条件比较两种设计','engineering-build engineering-measure','两架纸直升机|记录表','给原设计留一份基准记录|只改变旋翼长度等一个条件|保持纸张、释放方式和高度一致|各做三次并保存所有结果|比较数据，再说明是否值得保留修改','变化条件只有一个|原始数据可以复核','nasa');
s('engineering-reproduce','engineering','写出别人能复现的制作说明','engineering-build digital-workflow','成品|材料与步骤记录','列材料、尺寸和工具|按顺序描述折叠与装配|补上关键位置示意|请另一人按说明制作|根据不一致处修改说明','另一人能做出同类可用作品|尺寸和关键动作没有只靠猜','jobEngineer');
s('engineering-iterate','engineering','用测试结果选择下一次改进','engineering-compare engineering-reproduce collab-review','两轮设计记录','回看原目标和全部数据|找出一个仍存在的限制|提出两种可验证的改动|选一项并说明成本和预期|制作、再测并保留失败结果','改动与问题对应|结果不好时没有删除不利数据','jobEngineer');

s('teaching-goal','teaching','把教学目标写成能看见的表现','learn-breakdown','一个自己会的小技能','确定要教谁及其已有基础|把会什么写成一个具体动作|给出一个真实应用情境|写出完成标准|设计一个能让对方实际做的检查','目标能通过实际行为检查|不是只写理解、掌握等空词','jobTeacher');
s('teaching-demo','teaching','边示范边解释关键判断','teaching-goal learn-explain','熟悉的小技能|演示材料','先展示完成后的样子|按小步骤慢做一次|只解释影响结果的关键判断|请对方尝试下一步|观察卡点后再示范对应部分','对方有实际动手机会|反馈针对卡住的一步','jobTeacher feedback');
s('teaching-retrieval','teaching','设计三道从记住到应用的检查','teaching-goal learn-recall','一个小技能内容','写一道直接回忆的问题|写一道需要解释原因的问题|写一个新情境操作任务|先让对方独立尝试|根据错误判断要回到哪一步练习','题目检查不同层次表现|检查结果能改变后续练习','ies jobTeacher');
s('teaching-feedback','teaching','给一条能立即使用的改进建议','teaching-demo collab-check','一份实际尝试结果','先核对既定完成标准|指出已做到的一项具体动作|选出最影响结果的一处错误|给一个可执行的修正动作|请对方修改后再检查','建议能被当场执行|评价针对表现而非人格','feedback');
s('teaching-transfer','teaching','换个情境检查是否真的会用','teaching-retrieval teaching-feedback','同一技能的第二个情境','选一个不同材料或场景|不先重复原示范，让对方尝试|记录哪些地方能独立完成|遇到困难只给最少必要提示|比较两个情境的表现','有新情境的实际尝试|区分独立完成和依赖提示','jobTeacher');
s('teaching-mini','teaching','完成一次五分钟小教学并复盘','teaching-transfer collab-review','愿意参与的人|技能材料','说明本次要做成什么|用简短示范让对方开始|留出主要时间让对方实际操作|用事先标准检查|询问哪处最难并修改下一次教学','对方产生可检查的结果|改进建议来自实际学习过程','jobTeacher');

s('business-need','business','为一个经营想法找三次真实问题','collab-ask','一个可讨论的小想法|同意访谈的人','先说清想服务谁|问三位对象最近一次遇到的问题|记录现在怎样解决以及代价|把愿意夸奖与实际需要分开|选一个重复出现的问题继续验证','至少三段真实经历|没有把可能喜欢当成会付钱','sba');
s('business-cost','business','算清一件作品的直接成本','digital-table','模拟材料清单|计算器','列材料、数量和单价|计算每件消耗|列包装、损耗和直接服务时间|写清哪些固定费用尚未分摊|比较一个假设售价与成本，并标假设','计算可复核|没有把销售额当利润','sba');
s('business-offer','business','写一页可理解的产品说明','business-need collab-present','一个已经做出的样品','先说清给谁解决什么问题|展示实际样品或使用过程|列出明确包含和不包含的内容|写清假设价格、交付方式及处理问题的方法|请目标对象复述是否理解','说明与样品能力一致|没有虚构客户、效果和销量','sba jobBusiness');
s('business-stock','business','做一次可核对的库存记录','business-cost digital-table','五件模拟商品|记录表','给不同物品分配编号|记录期初数量|每次领用或归还记一笔|计算当前应有数量|实际清点并解释差异','账面与实物可以核对|差异有记录而非悄悄改数','jobBusiness');
s('business-trial','business','组织一次使用代币的模拟交易','business-offer business-stock','模拟代币|成人协助|样品','明确这是模拟练习及参与规则|让参与者按说明选择|记录交付、代币收入和问题|按事先约定处理退回或差错|结算并收集下一次应改什么','交易和问题都有记录|模拟结果没有冒充真实市场付费','jobBusiness',{adultSupport:'首轮使用模拟代币，由成人安排参与和场地；真实经营须另核实适用要求。'});
s('business-review','business','用记录判断经营试验下一步','business-trial data-check','模拟交易与成本记录','分别统计体验、选择和退回人数|核对代币收入与实际成本|列出最常见的一个问题|区分需求不足、说明不清和交付问题|决定一次具体改动并写出验证方法','结论能追溯记录|没有把小样本模拟当成商业成功','jobBusiness');

const projects=[
  {id:'family-lunch',title:'为家人准备一顿午餐',skillIds:['life-list','life-price','life-shopping','life-bag','life-prep','life-cook','collab-review'],steps:['与家人确定一道菜、人数与可承担步骤','列清单、比较价格，和照看者完成采购','先练不会的具体动作，再完成备料与烹饪','展示实际做成的菜，区分自己与成人完成部分','保存清单和结果，复盘下次想独立完成哪一步'],deliverable:'菜品结果、采购清单、自己使用过的技能和一次复盘',adultSupport:'成人全程负责刀具、灶火、热油等不适合孩子独立完成的环节。'},
  {id:'learning-exhibit',title:'做一份身边植物观察小册',skillIds:['learn-breakdown','learn-source','learn-recall','digital-files','collab-present'],steps:['选两三种常见植物和一个想回答的问题','记录现场观察，不采食不认识的植物','查找并核对名称来源，标明不确定','整理成含图、文字和来源的小册','向家人展示并回答一个追问'],deliverable:'可阅读的小册、来源和仍不确定的问题'},
  {id:'software-list',title:'做一个家里能使用的采购清单网页',skillIds:['software-html','software-css','software-js','software-storage','software-tests','software-release','digital-ai-check'],steps:['问清家人如何记清单和最麻烦的一步','实现新增、删除、保存和导出','在手机与电脑检查实际操作','测试空输入、刷新与错误备份','请家人实际使用，记录一个改进并交付'],deliverable:'可用网页、测试和一份改动说明'},
  {id:'data-shopping',title:'用真实或明确标注的样例记录分析采购',skillIds:['data-question','data-clean','data-query','data-chart','data-check','data-report'],steps:['先确定一个范围明确的问题','取得许可后使用去标识记录，或标明样例','保留原始表并清理异常','计算、制图并复核一个关键数字','交付一页结论和数据不足之处'],deliverable:'原始与清理数据、查询、图表和可复算结论'},
  {id:'design-reading',title:'设计并测试一份阅读记录工具',skillIds:['design-interview','design-flow','design-prototype','design-test','design-readable','design-handoff'],steps:['观察一位愿意参与的人实际记录阅读','只选一个明确问题','制作纸面或点击原型','用同一任务观察使用并修正','写清实现要求，检查实际结果'],deliverable:'原型、观察记录、修订与实现说明'},
  {id:'engineering-helicopter',title:'改进一架纸直升机并解释证据',skillIds:['engineering-question','engineering-measure','engineering-build','engineering-compare','engineering-reproduce','engineering-iterate'],steps:['按来源模板制作基准模型','确定只改变的一个条件','对两种方案按同样方法各测三次','比较全部数据并保留失败结果','让另一人复现并展示下一轮改进'],deliverable:'两个模型、六次原始测量和复现说明',adultSupport:'剪刀、释放高度和场地由成人确认。'},
  {id:'teaching-bag',title:'教另一人学会一项生活小技能',skillIds:['teaching-goal','teaching-demo','teaching-retrieval','teaching-feedback','teaching-transfer','teaching-mini','life-bag'],steps:['与对方确认愿意学哪项技能','写清完成标准并做简短示范','让对方自己做，观察困难','给一条可使用的改进建议','换个情境再试，并复盘教学'],deliverable:'学习者的实际表现、帮助情况与教学反思'},
  {id:'business-market',title:'办一次使用代币的模拟小集市',skillIds:['business-need','business-cost','business-offer','business-stock','business-trial','business-review'],steps:['先了解参与者真实需要，再决定样品','列成本与库存，写清模拟规则','展示样品，让参与者自主选择','记录每笔代币交易和差错处理','核对数量与成本，决定下一轮改进'],deliverable:'模拟交易记录、库存核对、成本和改进方案',adultSupport:'由成人组织；模拟练习不作为真实付费需求或经营资格证明。'}
];
const routes=[
  {id:'life-route',kind:'foundation',title:'生活自主：从系袋口到做一道菜',sourceIds:['oecd','food'],stages:[{title:'先准备',skillIds:['life-list','life-price']},{title:'在现实采购中练',skillIds:['life-shopping','life-bag']},{title:'组合成一道菜',skillIds:['life-prep','life-cook']},{title:'真实项目与复盘',projectId:'family-lunch'}]},
  {id:'learning-route',kind:'foundation',title:'会学习：拆解、复习与核查',sourceIds:['ies','sift'],stages:[{title:'把想做的事拆小',skillIds:['learn-breakdown','learn-example']},{title:'从记住走到会用',skillIds:['learn-recall','learn-space','learn-explain']},{title:'核查与表达',skillIds:['learn-source','collab-present']},{title:'组合成观察作品',projectId:'learning-exhibit'}]},
  {id:'digital-route',kind:'foundation',title:'数字与 AI：会用、会查、会保护',sourceIds:['unesco','genai','security'],stages:[{title:'整理与保护',skillIds:['digital-files','digital-account','wellbeing-pause','digital-consent']},{title:'处理资料与使用 AI',skillIds:['digital-table','digital-ai-request']},{title:'核查与复用过程',skillIds:['digital-ai-check','digital-workflow']}]},
  {id:'daily-judgment-route',kind:'foundation',title:'读懂、算清与作出日常选择',sourceIds:['oecd','numeracy','finance'],stages:[{title:'读懂并表达',skillIds:['learn-readsteps','collab-writeclear']},{title:'量准与算清',skillIds:['life-measure','learn-estimate']},{title:'在条件内作决定',skillIds:['life-budget','life-receipt','life-resource']},{title:'用采购与午餐检验',projectId:'family-lunch'}]},
  {id:'human-route',kind:'foundation',title:'与人协作并照顾自己',sourceIds:['oecd','emotions','who'],stages:[{title:'认识自己并求助',skillIds:['wellbeing-observe','wellbeing-emotion','wellbeing-help']},{title:'清楚协作',skillIds:['collab-ask','collab-request','collab-plan']},{title:'检查与复盘',skillIds:['collab-check','collab-review','collab-present']}]},
  ...[
    ['software-route','软件与 AI 应用开发','jobSoftware',['software-html','software-css','software-js','software-storage','software-tests','software-release'],'software-list'],
    ['data-route','数据分析','jobData',['data-question','data-clean','data-query','data-chart','data-check','data-report'],'data-shopping'],
    ['design-route','产品与体验设计','jobDesign',['design-interview','design-flow','design-prototype','design-test','design-readable','design-handoff'],'design-reading'],
    ['engineering-route','科学与工程实践','jobEngineer',['engineering-question','engineering-measure','engineering-build','engineering-compare','engineering-reproduce','engineering-iterate'],'engineering-helicopter'],
    ['teaching-route','教学与知识传播','jobTeacher',['teaching-goal','teaching-demo','teaching-retrieval','teaching-feedback','teaching-transfer','teaching-mini'],'teaching-bag'],
    ['business-route','经营与运营','jobBusiness',['business-need','business-cost','business-offer','business-stock','business-trial','business-review'],'business-market']
  ].map(([id,title,job,ids,projectId])=>({id,title,kind:'career',sourceIds:[job,'wef'],note:'职业兴趣与基础实践路线，不等于完整培养方案、执业资格或就业保证。',stages:[{title:'基础与问题',skillIds:ids.slice(0,2)},{title:'动手与检验',skillIds:ids.slice(2,4)},{title:'复现与交付',skillIds:ids.slice(4)},{title:'完整项目',projectId}]}))
];
const data={schemaVersion:1,version:'2026-10-21.v2',title:'成长森林：具体技能与项目路线',checkedAt:'2026-10-20',editorialStatus:'来源核对后的原创练习设计，尚未通过真实儿童教学效果验证',futureNote:'根据教育框架、职业任务与当前趋势构建的可修订路线；不是对未来职业的确定预测，也不要求每个孩子学完所有路线。',methodNote:'参考来源不等于本卡获机构认证。不存在对所有年龄、任务和情境都普遍最好的单一学习法。先示范、自己尝试、具体反馈、延后复习、换情境应用作为可调整起点。',audienceNote:'从已有能力与兴趣选择；低龄由成人示范和帮助，进阶技能按前置能力自选。涉及热、刀具或外出均标注成人支持。',categories,sources,skills,projects,routes};
const allIds=new Set(skills.map(x=>x.id));if(allIds.size!==skills.length)throw new Error('Duplicate skill id');
for(const sk of skills){if(sk.steps.length<5||sk.criteria.length<1)throw new Error('Incomplete card '+sk.id);for(const id of sk.prerequisites)if(!allIds.has(id))throw new Error('Unknown prerequisite '+id);for(const id of sk.sourceIds)if(!sources[id])throw new Error('Unknown source '+id)}
const visiting=new Set(),done=new Set();function visit(id){if(visiting.has(id))throw new Error('Prerequisite cycle '+id);if(done.has(id))return;visiting.add(id);for(const p of skills.find(x=>x.id===id).prerequisites)visit(p);visiting.delete(id);done.add(id)}for(const sk of skills)visit(sk.id);
for(const p of projects)for(const id of p.skillIds)if(!allIds.has(id))throw new Error('Unknown project skill '+id);
for(const r of routes)for(const st of r.stages){for(const id of st.skillIds||[])if(!allIds.has(id))throw new Error('Unknown route skill '+id);if(st.projectId&&!projects.some(x=>x.id===st.projectId))throw new Error('Unknown route project')}
await writeFile(new URL('skill-library.json',root),JSON.stringify(data,null,2)+'\n');
await mkdir(new URL('../docs/forest/',root),{recursive:true});
let md='# 成长森林：通用技能与职业路线\n\n核对日期：2026-10-20。'+data.futureNote+'\n\n'+data.editorialStatus+'。'+data.methodNote+'\n\n';
md+='## 路线总览\n\n| 路线 | 顺序 |\n|---|---|\n'+routes.map(r=>'|'+r.title+'|'+r.stages.map(st=>(st.skillIds||[]).map(id=>skills.find(sk=>sk.id===id).title).join('、')+(st.projectId?projects.find(p=>p.id===st.projectId).title:'')).join(' → ')+'|').join('\n')+'\n\n';
for(const cat of categories){md+='## '+cat.title+'\n\n';for(const sk of skills.filter(x=>x.categoryId===cat.id)){md+='### '+sk.title+'\n\n编号：'+sk.id+'；前置：'+(sk.prerequisites.map(id=>skills.find(x=>x.id===id).title).join('、')||'无')+'。\n\n准备：'+sk.materials.join('、')+'。\n\n'+sk.steps.map((x,i)=>(i+1)+'. '+x+'。').join('\n')+'\n\n检验：'+sk.criteria.join('；')+'。\n\n练习：'+sk.practice.guided+sk.practice.independent+sk.practice.transfer+'\n\n'+(sk.adultSupport?'成人支持：'+sk.adultSupport+'\n\n':'')+'参考：'+sk.sourceIds.map(id=>'['+sources[id].title+']('+sources[id].url+')').join('、')+'。操作卡为原创练习设计，来源用于方法或领域参考。\n\n'}}
md+='## 真实项目\n\n';for(const p of projects){md+='### '+p.title+'\n\n调用技能：'+p.skillIds.map(id=>skills.find(x=>x.id===id).title).join('、')+'。\n\n'+p.steps.map((x,i)=>(i+1)+'. '+x+'。').join('\n')+'\n\n成果：'+p.deliverable+'。\n\n'+(p.adultSupport?p.adultSupport+'\n\n':'')}
md+='## 来源使用边界\n\nO*NET 的职业任务用于选择实践范围；WEF 是趋势信号；OECD 与 UNESCO 用于能力方向；官方操作文档用于相应工具步骤；研究与方法指南用于设计练习。未复制整套第三方课程、图谱或配图。全部练习仍需按年龄与真实使用反馈修订。\n\n';
await writeFile(new URL('../docs/forest/通用技能与职业路线_具体操作版.md',root),md);
console.log(JSON.stringify({skills:skills.length,categories:categories.length,routes:routes.length,careerRoutes:routes.filter(r=>r.kind==='career').length,projects:projects.length,sources:Object.keys(sources).length,referenceIntegrity:'PASS',prerequisiteCycles:'NONE'}));
