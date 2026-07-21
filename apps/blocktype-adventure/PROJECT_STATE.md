# PROJECT_STATE

## 当前版本

`0.1.6 browser-smoke-verified`

状态：`类型检查通过 / 单元测试通过 / Vite 构建通过 / Chromium 冒烟测试通过 / 独立 Vercel 已上线`

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
- 胜利、失败、结算与重新开始代码路径。
- `TypingSystem` 是运行时与测试共用的唯一输入规则实现。
- 6 组 Vitest 输入规则测试。
- Playwright Chromium 冒烟测试。

## 当前架构

- `src/main.ts`：Phaser 启动配置，并暴露只读浏览器测试接缝 `__BLOCKTYPE_GAME__`。
- `src/game/GameScene.ts`：场景、敌人、统计和输入结果呈现。
- `src/game/systems/TypingSystem.ts`：确定性输入核心。
- `src/game/systems/TypingSystem.test.ts`：输入规则单元测试。
- `tests/e2e/game-smoke.spec.ts`：真实 Chromium 页面、Canvas、暂停、输入和刷新验证。
- `playwright.config.ts`：构建后启动 Vite Preview 并运行浏览器测试。
- `vitest.config.ts`：隔离单元测试与 Playwright 测试目录。
- `.github/workflows/blocktype-adventure-ci.yml`：安装、类型检查、单元测试、构建、Chromium 冒烟测试和 dist 上传。

## 本轮唯一目标

建立最小浏览器自动化验证，确认 Phaser 页面不只是“能构建”，而是能在真实 Chromium 中创建 Canvas 并响应键盘。

## 本轮实际完成

- 新增 Playwright 和 `npm run test:e2e`。
- 新增 Chromium 冒烟测试，验证页面标题、Canvas 创建、敌人生成、Escape 暂停/恢复、暂停时字符不计数、恢复后字符计数、刷新后重新创建 Canvas、无阻断性页面或控制台错误。
- 在 `main.ts` 暴露只读 Phaser 实例作为测试接缝，避免在 DOM 测试中复制游戏规则。
- 新增 `vitest.config.ts`，修复 Vitest 误收集 Playwright `.spec.ts` 的 CI 故障。
- 修复 `index.html` 缺少完整 HTML 文档结构和页面标题的问题。
- CI Run `29861614000` 最终成功，类型检查、6 组单元测试、Vite 构建、Chromium 安装、浏览器冒烟测试和 dist 上传全部通过。

## 已验证范围

- `npm install`
- `npm run check`
- `npm test`
- `npm run build`
- `npm run test:e2e`
- 页面加载并显示 Phaser Canvas。
- 初始敌人生成。
- Escape 可暂停并恢复。
- 暂停期间字母输入不计入统计。
- 恢复后字母输入进入统计。
- 页面刷新后 Canvas 与敌人重新初始化。
- 测试路径没有捕获到阻断性页面错误或 console error。
- 独立 Vercel 项目为 `READY`，根页面 HTTP 200。

## 尚未验证

- 高速连续输入是否丢键。
- Backspace 在真实浏览器中的进度回退与默认导航抑制。
- 同首字符多个敌人在浏览器场景中的最近目标锁定。
- 60 秒胜利流程。
- 基地生命归零失败流程。
- 结算页点击“再来一局”后的状态清理。

## 已知问题

- 当前直接进入单场景原型，没有开始菜单、关卡选择和独立暂停面板。
- 尚无音效、音量和减少动画设置。
- 尚无本地最高分与练习记录。
- 正式原创透明 SVG 素材仍不完整，场景主要使用程序图形。
- 尚未实现中文输入法 composition 事件处理。
- Vercel 当前部署早于本轮浏览器测试提交，需后续建立稳定的 Git 分支自动部署或重新部署最新构建。

## 下一轮唯一任务

扩展 Playwright 为“输入行为集成测试”，只验证 Backspace 回退、同首字符最近目标锁定和重开后的状态清理；在这些核心输入路径通过前，不增加新玩法或装饰功能。
