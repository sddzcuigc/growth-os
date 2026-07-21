# PROJECT_STATE

## 当前版本

`0.1.7 input-browser-verified`

状态：`类型检查通过 / 单元测试通过 / Vite 构建通过 / Chromium 输入行为测试通过 / 独立 Vercel 已上线但可能落后于当前分支`

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
- Playwright Chromium 页面与输入行为测试。

## 当前架构

- `src/main.ts`：Phaser 启动配置，并暴露浏览器测试接缝 `__BLOCKTYPE_GAME__`。
- `src/game/GameScene.ts`：场景、敌人、统计和输入结果呈现。
- `src/game/systems/TypingSystem.ts`：确定性输入核心。
- `src/game/systems/TypingSystem.test.ts`：输入规则单元测试。
- `tests/e2e/game-smoke.spec.ts`：真实 Chromium 页面、暂停、输入、Backspace、最近目标锁定、重开和刷新验证。
- `playwright.config.ts`：构建后启动 Vite Preview 并运行浏览器测试。
- `vitest.config.ts`：隔离单元测试与 Playwright 测试目录。
- `.github/workflows/blocktype-adventure-ci.yml`：安装、类型检查、单元测试、构建、Chromium 测试、失败诊断和 dist 上传。

## 本轮唯一目标

在真实 Chromium 中验证 Backspace 回退、同首字符最近目标锁定和重开状态清理。

## 验收条件

1. 两个同首字符敌人存在时，按首字符锁定距离基地最近者。
2. 锁定后输入下一字符，进度继续落在同一目标。
3. Backspace 将进度回退一位，不增加输入总数，也不触发浏览器导航。
4. Phaser 场景重开后，输入统计、锁定和敌人输入进度全部清零。
5. 页面错误和 console error 为空，类型检查、单元测试、构建和 Chromium 测试全部成功。

## 本轮实际完成

- 扩展 Playwright 场景快照，读取敌人 ID、单词、进度、位置、锁定目标和输入统计。
- 增加真实键盘路径测试：首字符锁定最近目标、继续输入、Backspace 回退、URL 保持、场景重开清理。
- 测试等待两个真实移动敌人后，仅将这两个临时测试目标的单词规范化为 `stone` 和 `star`；距离、移动、键盘事件、`TypingSystem` 判定和重开均使用生产代码。
- 最初尝试通过覆盖 `Math.random` 控制 Phaser 选词，但实测不能稳定控制 `Phaser.Utils.Array.GetRandom`，因此放弃该错误假设。
- CI 在浏览器测试失败时上传 Playwright report、trace、截图和视频诊断，成功时不上传诊断包。

## 验证结果

- GitHub Actions Workflow：`BlockType Adventure CI`
- Run ID：`29866501947`
- 结果：`success`
- 成功步骤：依赖安装、TypeScript 检查、6 组 Vitest、Vite 构建、Chromium 安装、2 组 Playwright 测试和 dist 上传。
- 未修改生产游戏逻辑；本轮只增加测试和 CI 诊断能力。

## 已验证范围

- 页面加载、标题和 Phaser Canvas。
- 初始敌人生成和页面刷新重建。
- Escape 暂停与恢复。
- 暂停期间字符输入不计数，恢复后正常计数。
- 同首字符敌人优先锁定距离基地最近者。
- 锁定后继续输入不会跳换目标。
- Backspace 回退一个字符，不计入输入总数，不改变 URL。
- Phaser 场景重开后统计、锁定和输入进度清零。
- 测试路径没有捕获到阻断性页面错误或 console error。

## 尚未验证

- 高速连续输入是否丢键。
- 60 秒倒计时结束后的胜利结算。
- 基地生命归零后的失败结算。
- 结算面板“再来一局”按钮的真实鼠标点击与状态清理。
- Vercel 当前线上部署是否已经包含 `0.1.7` 分支头。

## 已知问题

- 当前直接进入单场景原型，没有开始菜单、关卡选择和独立暂停面板。
- 尚无音效、音量和减少动画设置。
- 尚无本地最高分与练习记录。
- 正式原创透明 SVG 素材仍不完整，场景主要使用程序图形。
- 尚未实现中文输入法 composition 事件处理。
- 浏览器测试目前通过受控临时目标数据建立同首字符场景；后续可用正式只读诊断/测试夹具接口替换对场景对象的直接访问。

## 下一轮唯一任务

增加胜负与结算浏览器测试，只验证：倒计时胜利、基地生命归零失败、结算内容出现，以及真实点击“再来一局”后状态清理。在该闭环通过前，不增加菜单、美术、音效或新模式。
