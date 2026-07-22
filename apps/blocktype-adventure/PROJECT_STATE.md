# PROJECT_STATE

## 当前版本

`0.2.0 state-flow-verified`

状态：`类型检查通过 / 单元测试通过 / Vite 构建通过 / Chromium 状态闭环通过 / 正式域名已恢复可用但仍指向旧游戏部署 / 最新分支尚未上线`

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

确认并修复正式 Vercel 入口的部署风险，避免错误探测部署覆盖可玩页面，同时明确最新 CI 产物无法通过当前连接器直接完整上传的阻塞。

## 验收条件与结果

1. 读取最新 PR、分支头和专用 CI：通过。
2. 确认最新分支头的 BlockType Adventure CI 成功：通过，Run `29877707451`。
3. 确认 CI 产物可下载且包含 `index.html`、CSS、JavaScript 和 SVG：通过，Artifact `8513627055`。
4. 正式域名不得停留在探测页或构建失败状态：通过，已恢复为可访问入口。
5. 未完整部署最新产物时不得声称线上已更新：通过，状态明确记录为旧版转发。

## 本轮实际完成

- 读取 Draft PR #10，确认仍为 Draft、可合并，分支头为 `70db4cb4fe742e84289ba5215ae77cbacfb0e05b`。
- 确认 `BlockType Adventure CI` Run `29877707451` 成功。
- 下载并检查 CI 产物 `blocktype-adventure-dist`：包含构建后的 HTML、CSS、JavaScript 和原创 SVG。
- 直接 API 探测部署暴露 Vercel 项目仍会执行 `vite build`，仅上传静态 HTML 会因缺少 Vite 失败；失败 Deployment 为 `dpl_13gTNJjDCdQNSc2SsHhhfqzVfyPb`。
- 随即创建恢复部署 `dpl_CqxqHuScPqHrYM4X4niWWqvPArz6`，状态 `READY`，正式域名 HTTP 200。
- 恢复部署仅负责将正式域名转发到已确认可玩的旧部署 `dpl_5LK3aseeuBQ957VdyALNMjEBPBWP`，没有冒充最新 `0.2.0`。

## 验证结果

- GitHub Actions：`BlockType Adventure CI` Run `29877707451`，结果 `success`。
- Artifact：`8513627055`，未过期，构建产物完整。
- Vercel 恢复 Deployment：`dpl_CqxqHuScPqHrYM4X4niWWqvPArz6`，结果 `READY`。
- 正式域名：HTTP `200`，页面标题为“方块打字冒险 · BlockType Adventure”。
- 正式域名当前通过浏览器跳转进入旧可玩部署；最新分支仍未上线。

## Vercel 最新状态

- Project：`blocktype-adventure`
- 当前 Production Deployment：`dpl_CqxqHuScPqHrYM4X4niWWqvPArz6`
- 状态：`READY`
- 作用：保护正式入口并转发到旧可玩部署。
- 最新 GitHub 分支与 CI 产物尚未发布到 Production。

## 尚未验证

- 一局中完整输入多个自然生成单词直到自然胜利的长流程。
- 中文输入法 composition 事件。
- 移动端软键盘、Firefox、Safari 和低性能设备。
- 从 GitHub 分支或 CI Artifact 到 Vercel 的稳定自动发布流程。

## 已知问题

- Vercel 直接部署连接器要求逐文件传入文本，不能直接引用本地 ZIP；主 JavaScript bundle 约 1.2 MB，不适合人工拼装到工具调用中。
- 当前正式域名存在一次跳转，且落到旧版游戏部署。
- 当前尚无关卡选择和难度设置。
- 尚无音效、音量和减少动画设置。
- 正式原创透明 SVG 素材仍不完整，场景主要使用程序图形。

## 下一轮唯一任务

建立稳定的 GitHub → Vercel 自动部署路径：优先修复 Vercel Git Integration 或在 GitHub Actions 中使用 Vercel CLI/Deploy Hook，使专用 CI 全绿后自动发布 `apps/blocktype-adventure`，并验证正式域名直接加载当前分支而非跳转。完成前暂停视觉反馈功能开发。