# PROJECT_STATE

## 当前版本

`0.1.8 result-flow-browser-verified`

状态：`类型检查通过 / 单元测试通过 / Vite 构建通过 / Chromium 核心输入与胜负结算闭环通过 / 独立 Vercel 已上线但可能落后于当前分支`

## 项目入口

- GitHub：`sddzcuigc/growth-os`
- 分支：`feat/blocktype-adventure-bootstrap`
- 目录：`apps/blocktype-adventure/`
- Draft PR：`#10`
- Vercel：`https://blocktype-adventure.vercel.app`

## 已可用

- Vite + TypeScript + Phaser 3 项目骨架。
- 单场景“方块守卫战”。
- 两种原创占位怪物：错字软泥、断键甲虫。
- 英文单词生成、首字符选敌、逐字攻击。
- 同首字符目标优先锁定距离基地最近者。
- 锁定保持、错误反馈、Backspace 撤销、Escape 暂停与恢复。
- 基地生命、得分、连击、准确率、WPM、倒计时。
- 胜利、失败、结算与真实点击“再来一局”重开。
- `TypingSystem` 是运行时与测试共用的唯一输入规则实现。
- 6 组 Vitest 输入规则测试。
- 3 组 Playwright Chromium 浏览器测试。

## 当前架构

- `src/main.ts`：Phaser 启动配置，并暴露浏览器测试接缝 `__BLOCKTYPE_GAME__`。
- `src/game/GameScene.ts`：场景、敌人、统计、胜负和结算呈现。
- `src/game/systems/TypingSystem.ts`：确定性输入核心。
- `src/game/systems/TypingSystem.test.ts`：输入规则单元测试。
- `tests/e2e/game-smoke.spec.ts`：页面、输入、暂停、Backspace、最近目标锁定、胜负、结算、重开和刷新验证。
- `playwright.config.ts`：构建后启动 Vite Preview 并运行浏览器测试。
- `.github/workflows/blocktype-adventure-ci.yml`：安装、类型检查、单元测试、构建、Chromium 测试、失败诊断和 dist 上传。

## 本轮唯一目标

建立胜利、失败、结算内容和真实点击“再来一局”的浏览器闭环测试。

## 验收条件

1. 由生产倒计时回调触发胜利，而不是测试直接设置 `finished`。
2. 由真实敌人越过基地边界触发基地归零和失败。
3. 胜利与失败结算均显示关键统计字段和“再来一局”。
4. 通过 Canvas 真实鼠标点击重开按钮，两次重开后生命、时间、输入统计和锁定均清零。
5. 类型检查、Vitest、Vite 构建和全部 Playwright 测试通过，无阻断性浏览器错误。

## 本轮实际完成

- 扩展 Playwright 快照，读取基地生命、剩余时间和结算容器文字。
- 新增胜利路径：把剩余时间准备到边界并加速 Phaser 场景时钟，由原生产倒计时回调调用胜利逻辑。
- 新增失败路径：把基地生命准备为 1，并把真实敌人移动到基地边界，由生产更新循环调用伤害和失败逻辑。
- 通过 Canvas 坐标真实点击“再来一局”，验证胜利与失败后的两次重开。
- 修复测试观察误区：结算文字属于 `overlay` 容器，不在场景顶层 `children.list`。
- 修复既有输入测试的生成时序抖动：仅通过生产 `spawnEnemy()` 补足夹具敌人数，不直接设置锁定、进度或结果。

## 验证结果

- GitHub Actions Workflow：`BlockType Adventure CI`
- Run ID：`29870701302`
- 结果：`success`
- 成功步骤：依赖安装、TypeScript 检查、6 组 Vitest、Vite 构建、Chromium 安装、3 组 Playwright 测试和 dist 上传。
- 本轮未修改生产玩法代码，只增强浏览器测试和测试夹具稳定性。

## 已验证范围

- 页面加载、标题、Phaser Canvas 和刷新重建。
- Escape 暂停与恢复；暂停期间输入不统计。
- 同首字符最近目标锁定、锁定保持和 Backspace 回退。
- 场景重开后输入状态清理。
- 倒计时胜利和基地生命归零失败。
- 胜利与失败结算关键字段。
- 真实点击“再来一局”后的生命、时间、统计和锁定清理。
- 测试路径没有捕获到阻断性页面错误或 console error。

## 尚未验证

- 高速连续输入是否丢键，以及可接受的输入速率基线。
- 一局中完整输入多个单词直到自然胜利的长流程。
- Vercel 当前线上部署是否已经包含 `0.1.8` 分支头。

## 已知问题

- 当前直接进入单场景原型，没有开始菜单、关卡选择和独立暂停面板。
- 尚无音效、音量和减少动画设置。
- 尚无本地最高分与练习记录。
- 正式原创透明 SVG 素材仍不完整，场景主要使用程序图形。
- 尚未实现中文输入法 composition 事件处理。
- 浏览器测试仍通过场景对象准备最小前置条件；后续可用正式诊断/测试夹具接口替换。

## 下一轮唯一任务

建立高速连续输入基线：使用真实键盘事件连续输入可控目标，验证 10、20、30 字符/秒下的接收字符数、顺序、锁定保持和错误统计，不修改玩法难度或视觉。若 30 字符/秒不稳定，先确定可重复的可靠上限并记录，而不是直接增加功能。
