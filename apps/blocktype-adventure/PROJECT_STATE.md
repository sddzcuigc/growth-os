# PROJECT_STATE

## 当前版本

`0.2.0 state-flow-verified`

状态：`类型检查通过 / 单元测试通过 / Vite 构建通过 / Chromium 开始、暂停、战斗、结算、重玩与返回首页闭环通过 / Vercel 线上版本落后于当前分支`

## 项目入口

- GitHub：`sddzcuigc/growth-os`
- 分支：`feat/blocktype-adventure-bootstrap`
- 目录：`apps/blocktype-adventure/`
- Draft PR：`#10`
- Vercel：`https://blocktype-adventure.vercel.app`

## 已可用

- Vite + TypeScript + Phaser 3 项目骨架。
- 开始界面：初始不生成敌人、不计键盘输入，点击“开始游戏”后才进入战斗。
- 单场景“方块守卫战”，包含原创占位怪物“错字软泥”和“断键甲虫”。
- 英文单词生成、首字符选敌、同首字符最近目标优先、逐字攻击和锁定保持。
- 错误反馈、Backspace 撤销、Escape 暂停与明确暂停面板。
- 基地生命、得分、连击、准确率、WPM、倒计时。
- 胜利、失败和结算报告；可选择“再来一局”直接开战或“返回首页”。
- `TypingSystem` 是运行时与测试共用的唯一输入规则实现。
- 6 组 Vitest 输入规则测试和 4 组 Playwright Chromium 浏览器测试。

## 当前架构

- `src/main.ts`：Phaser 启动配置，并暴露浏览器测试接缝 `__BLOCKTYPE_GAME__`。
- `src/game/GameScene.ts`：开始、战斗、暂停、结算状态及敌人、统计和画面呈现。
- `src/game/systems/TypingSystem.ts`：确定性输入核心。
- `tests/e2e/game-smoke.spec.ts`：状态闭环、输入、胜负、重开、刷新和高速输入验证。
- `.github/workflows/blocktype-adventure-ci.yml`：安装、类型检查、单元测试、构建、Chromium 测试、失败诊断和 dist 上传。

## 本轮唯一目标

建立完整用户状态闭环：开始界面 → 战斗 → 暂停/恢复 → 结算 → 再来一局或返回首页。

## 验收条件与结果

1. 初始不生成敌人：通过。
2. 初始字母输入不进入统计：通过。
3. 点击“开始游戏”后生成敌人并开始计时：通过。
4. Escape 显示明确暂停面板，暂停期间输入不统计：通过。
5. 结算后“再来一局”直接进入新战斗并清空状态：通过。
6. 结算后“返回首页”回到无敌人、零统计的开始界面：通过。

## 本轮实际完成

- 新增 `started` 状态，生成器、倒计时、移动和键盘输入只在战斗状态运行。
- 新增开始界面和 Canvas 内“开始游戏”按钮。
- 新增明确暂停遮罩与继续提示。
- 结算增加“返回首页”，保留“再来一局”。
- Playwright 改为从真实开始按钮进入游戏，并覆盖首页、暂停面板、重玩和返回首页。
- 首轮浏览器测试发现 Phaser 重启数据会保留 `autoStart:true`；已在返回首页时显式传入 `autoStart:false`，修复状态泄漏。

## 验证结果

- GitHub Actions Workflow：`BlockType Adventure CI`
- Run ID：`29877451027`
- 结果：`success`
- 成功步骤：依赖安装、TypeScript 检查、6 组 Vitest、Vite 构建、Chromium 安装、4 组 Playwright 测试和 dist 上传。
- 首次 Run `29877217317` 的浏览器测试失败，准确暴露“返回首页后自动开战”的生产状态问题；修复后全绿。

## Vercel 最新状态

- Project：`blocktype-adventure`
- Deployment：`dpl_5LK3aseeuBQ957VdyALNMjEBPBWP`
- 状态：`READY`
- Target：`production`
- 当前仅有这一条部署记录，因此线上地址尚未包含 `0.2.0` 本轮代码。

## 尚未验证

- 一局中完整输入多个自然生成单词直到自然胜利的长流程。
- 中文输入法 composition 事件。
- 移动端软键盘、Firefox、Safari 和低性能设备。
- 当前分支自动部署到 Vercel 的稳定流程。

## 已知问题

- 当前尚无关卡选择和难度设置。
- 尚无音效、音量和减少动画设置。
- 正式原创透明 SVG 素材仍不完整，场景主要使用程序图形。
- 线上 Vercel 版本落后于当前 GitHub 分支。

## 下一轮唯一任务

为目标锁定、正确输入、错误输入和完成单词增加一组最小、可辨识且可关闭的视觉反馈，并用 Playwright 验证反馈对象出现后会自动清理；暂不同时开发音效、关卡选择或正式角色美术。
