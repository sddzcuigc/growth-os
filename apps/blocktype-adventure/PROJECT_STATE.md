# PROJECT_STATE

## 当前版本

`0.1.9 high-speed-input-verified`

状态：`类型检查通过 / 单元测试通过 / Vite 构建通过 / Chromium 核心输入、胜负结算与 30 字符每秒基线通过 / 独立 Vercel 已上线但可能落后于当前分支`

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
- 4 组 Playwright Chromium 浏览器测试。

## 当前架构

- `src/main.ts`：Phaser 启动配置，并暴露浏览器测试接缝 `__BLOCKTYPE_GAME__`。
- `src/game/GameScene.ts`：场景、敌人、统计、胜负和结算呈现。
- `src/game/systems/TypingSystem.ts`：确定性输入核心。
- `src/game/systems/TypingSystem.test.ts`：输入规则单元测试。
- `tests/e2e/game-smoke.spec.ts`：页面、输入、暂停、Backspace、最近目标锁定、胜负、结算、重开、刷新和高速输入验证。
- `playwright.config.ts`：构建后启动 Vite Preview 并运行浏览器测试。
- `.github/workflows/blocktype-adventure-ci.yml`：安装、类型检查、单元测试、构建、Chromium 测试、失败诊断和 dist 上传。

## 本轮唯一目标

建立桌面 Chromium 高速连续输入基线，验证 10、20、30 字符/秒时是否丢键、乱序、跳锁或错误统计异常。

## 验收条件

1. 输入使用 Playwright 真实键盘事件，不直接调用场景字符处理函数。
2. 浏览器捕获的字符数量和顺序与发送序列完全一致。
3. 游戏统计中的总数、正确数、错误数和错误按键与序列一致。
4. 中途错误字符不改变目标锁定，后续正确字符仍能完成同一单词。
5. 10、20、30 字符/秒全部通过类型检查、Vitest、Vite 构建和 Chromium CI。

## 本轮实际完成

- 扩展 Playwright 场景快照，读取完成单词数和错误按键统计。
- 增加 24 字符长目标夹具，冻结场景时钟并移除额外敌人，避免生成和移动干扰速率测量。
- 在单词中途插入一个错误字符，验证错误统计和锁定保持。
- 在浏览器捕获阶段记录真实 `keydown` 字符序列，并与游戏运行时统计进行双侧比对。
- 分别以约 100ms、50ms、33ms 字符间隔验证 10、20、30 字符/秒。
- 未修改生产玩法代码，仅增强浏览器验证和状态观察。

## 验证结果

- GitHub Actions Workflow：`BlockType Adventure CI`
- Run ID：`29873820235`
- 结果：`success`
- 成功步骤：依赖安装、TypeScript 检查、6 组 Vitest、Vite 构建、Chromium 安装、4 组 Playwright 测试和 dist 上传。
- 30 字符/秒下共发送 25 个字符：24 个正确字符、1 个错误字符；接收数量、顺序、错误键 `Z`、单词完成和锁定释放均与预期一致。

## 已验证范围

- 页面加载、标题、Phaser Canvas 和刷新重建。
- Escape 暂停与恢复；暂停期间输入不统计。
- 同首字符最近目标锁定、锁定保持和 Backspace 回退。
- 场景重开后输入状态清理。
- 倒计时胜利和基地生命归零失败。
- 胜利与失败结算关键字段。
- 真实点击“再来一局”后的生命、时间、统计和锁定清理。
- Chromium 桌面英文键盘 10、20、30 字符/秒连续输入无丢键、乱序和统计偏差。
- 测试路径没有捕获到阻断性页面错误或 console error。

## 尚未验证

- 一局中完整输入多个自然生成单词直到自然胜利的长流程。
- 中文输入法 `compositionstart`、`compositionupdate`、`compositionend`。
- 移动端软键盘、不同浏览器和低性能设备的输入基线。
- Vercel 当前线上部署是否已经包含 `0.1.9` 分支头。

## 已知问题

- 当前直接进入单场景原型，没有开始菜单、关卡选择和独立暂停面板。
- 尚无音效、音量和减少动画设置。
- 尚无本地最高分与练习记录。
- 正式原创透明 SVG 素材仍不完整，场景主要使用程序图形。
- 尚未实现中文输入法 composition 事件处理。
- 浏览器测试仍通过场景对象准备最小前置条件；后续可用正式诊断/测试夹具接口替换。

## 下一轮唯一任务

增加开始界面和明确的“开始游戏”状态切换，并用 Playwright 验证：初始不生成敌人、不统计键盘输入；点击开始后进入现有守卫战；Escape 暂停面板可见；结束后可返回开始界面。暂不增加关卡选择、音效或正式美术。
