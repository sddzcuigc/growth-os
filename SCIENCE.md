# 天赋任务OS：科学依据与产品决策

本文件是产品逻辑的校准尺。任何新增技能、任务和界面交互，都要能回答三个问题：

1. 我们需要收集什么上下文？
2. 它服务于哪一类未来能力？
3. 训练方式是否符合学习科学，而不是只是在堆待办？

## 1. 上下文怎样收集

上下文分三层，不能一次性向孩子或家长索要完整问卷。

### A. 稳定画像

低频更新，来自家庭长期档案、父母观察和孩子自我回答。

- 年龄、年级、身体与睡眠约束
- 兴趣入口：阅读、游戏、搭建、画画、运动、工具
- 优势：表达、数感、阅读、执行、创造等
- 易卡点：不想开始、遇难停住、容易忘、怕做不好
- AI 使用边界：希望 AI 提问、提示、解释、检查，还是生成示例

产品做法：`认识我`页每次只问一个问题，逐步生成孩子自己的说明书。

### B. 当天状态

每次推荐前收集，决定任务大小和难度。

- 能量：低 / 普通 / 高
- 兴趣入口：今天想碰哪类事
- 当前卡点：开始、困难、忘记、完美压力
- 可用时间：8 / 12 / 15 / 20 分钟

产品做法：首页 AI 小教练先问，再只推荐一个任务。

### C. 结果反馈

每次任务后收集，用于更新推荐。

- 完成了吗
- 难度是否刚好
- 是否有趣
- 哪个标签更吸引孩子
- 孩子说出的发现或下次想法

产品做法：复盘页记录心情、难度、趣味和一句发现。

## 2. 技能树是否面向 AI 未来

当前技能树采用 8 个长期能力域。它不是“职业技能清单”，而是 6-10 岁儿童可训练的底层能力。

| 能力域 | 为什么重要 | 儿童训练入口 |
| --- | --- | --- |
| 自我调节 | AI 时代任务更开放，孩子要会计划、开始、检查、收尾 | 书包闭环、任务分步、完成检查 |
| 会学会想 | 面对不会的问题，要会监控理解、换策略、求助 | 卡住三招、复盘、解释自己怎么想 |
| 表达沟通 | AI 能生成内容，人更要会表达意图、解释判断、讲清成果 | 三句话故事、人物卡、作品讲解 |
| 数据推理 | AI 与未来工作高度依赖数据、模式、比较和验证 | 生活数学、资源预算、表格记录 |
| AI 协作 | 不只是会用 AI，而是会提问、验证、划分自己和 AI 的角色 | 先自己想、AI 查漏、解释 AI 帮了什么 |
| 创造项目 | 未来价值更多来自定义问题、做作品、迭代展示 | Minecraft 项目、观察册、小展览 |
| 判断协作 | AI 输出需要伦理判断、可靠性检查和人际协作 | 说明来源、轮换角色、检查是否公平 |
| 身心底座 | 睡眠、运动、情绪和身体状态直接影响注意和学习 | 核心、平衡、睡眠、呼吸、低压任务 |

## 3. 训练方式是否有效

当前训练方式采用以下规则：

- 一次只给一个主任务：降低儿童认知负荷。
- 先问再推荐：保护自主感，避免成人直接派任务。
- 小步任务：明确目标、步骤短、可完成。
- 脚手架到独立：先提示、再陪练、再逐步撤掉帮助。
- 主动回忆和解释：不是只看一遍，而是说出、讲清、检查。
- 延迟复盘：记录今天的感觉和发现，影响下一次推荐。
- 难度校准：优先推荐“有一点挑战但能完成”的任务。

## 4. 主要证据来源

- UNESCO, `AI competency framework for students`：学生 AI 能力应覆盖以人为本、AI 伦理、AI 技术应用和 AI 系统设计，并从理解、应用到创造递进。https://www.unesco.org/en/articles/ai-competency-framework-students
- UNESCO, `AI competency framework for teachers`：教师需要保护人的主体性，并在 AI 时代支持伦理、应用、教学和专业学习。https://www.unesco.org/en/articles/ai-competency-framework-teachers
- World Economic Forum, `The Future of Jobs Report 2025`：到 2030 的劳动力变化受到技术、AI、自动化等驱动；AI、大数据、网络安全、技术素养和人类中心能力都在上升。https://www.weforum.org/publications/the-future-of-jobs-report-2025/
- Education Endowment Foundation, `Metacognition and Self-Regulated Learning`：元认知和自我调节有较强研究基础，关键是让学生显性地计划、监控和评价学习。https://educationendowmentfoundation.org.uk/education-evidence/guidance-reports/metacognition
- National Academies, `How People Learn II`：学习受学习者、情境和文化影响；有效设计要考虑动机、情绪、社会互动、已有知识和发展阶段。https://nap.nationalacademies.org/catalog/24783/how-people-learn-ii-learners-contexts-and-cultures
- Harvard Center on the Developing Child, `A Guide to Executive Function`：执行功能帮助计划、注意、切换和管理任务，儿童需要支持性环境来发展这些能力。https://developingchild.harvard.edu/resource-guides/guide-executive-function/
- What Works Clearinghouse, `Organizing Instruction and Study to Improve Student Learning`：间隔学习、主动测验/回忆、抽象与具体连接、深层解释问题等有实证支持。https://ies.ed.gov/ncee/wwc/PracticeGuide/1

## 5. 仍需验证

目前产品仍是 MVP。以下内容不能假装已经完成：

- 技能权重是否适合两个孩子，需要 2-4 周真实使用数据。
- GLM 推荐是否稳定符合 JSON schema，需要继续加自动测试和失败兜底。
- 界面尚未完全复刻参考图，需要像素资产、截图对比和视觉 QA。
- 训练效果不能只看完成数量，应看独立性、迁移、复盘质量和孩子自我理解。
