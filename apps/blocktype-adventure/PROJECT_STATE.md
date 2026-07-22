# PROJECT_STATE

## 当前版本

`0.2.1 combat-feedback-verified`

状态：`类型检查通过 / 单元测试通过 / Vite 构建通过 / Chromium 核心流程通过 / 程序化战斗反馈已接入 / 正式域名仍指向旧部署`

## 项目入口

- GitHub：`sddzcuigc/growth-os`
- 分支：`feat/blocktype-adventure-bootstrap`
- 目录：`apps/blocktype-adventure/`
- Draft PR：`#10`
- Vercel：`https://blocktype-adventure.vercel.app`

## 已可用

- Vite + TypeScript + Phaser 3 项目骨架。
- 开始、战斗、暂停、胜负结算、重玩和返回首页状态闭环。
- “方块守卫战”核心玩法与原创占位怪物“错字软泥”“断键甲虫”。
- 首字符选敌、同首字符最近目标优先、锁定保持、逐字攻击、错误统计与 Backspace 撤销。
- 基地生命、得分、连击、准确率、WPM、倒计时和错误按键报告。
- `TypingSystem` 是运行时与测试共用的唯一输入规则实现。
- 6 组 Vitest 与 4 组 Playwright Chromium 测试。
- 新增程序化视觉反馈：锁定轮廓、正确命中脉冲、错误叉号、单词击破碎片。

## 本轮唯一目标

在不引入新依赖、不改变输入规则的前提下，让锁定、正确、错误和完成四种关键状态获得清晰的局部视觉反馈。

## 验收条件与结果

1. 锁定目标必须持续显示独立轮廓：通过，敌人容器内新增 `target-lock` 圆环并由 `TypingSystem.lockedTargetId` 驱动显隐。
2. 正确输入必须在目标位置显示短促反馈：通过，新增 `hit-effect` 脉冲。
3. 错误输入必须有局部提示且不改变锁定：通过，新增 `error-effect` 叉号，输入规则仍由 `TypingSystem` 决定。
4. 完成单词必须显示击破反馈：通过，新增 6 个 `break-effect` 程序碎片。
5. 临时对象必须自动销毁：通过，全部效果在 170–260ms tween 完成后销毁。
6. 现有安装、类型检查、测试和构建必须继续通过：通过，BlockType Adventure CI Run `29891134963` 成功。

## 本轮实际完成

- `Enemy` 增加独立 `lockRing`，不复用身体颜色表达锁定。
- `renderEnemyLabel()` 同步更新文字颜色和锁定轮廓。
- 正确输入调用 `showHitEffect()`；错误输入调用 `showErrorEffect()`；完成单词调用 `showBreakEffect()`。
- 所有反馈均为 Phaser 程序图形或文字，没有使用概念图切片或外部版权素材。
- 反馈对象只读取业务结果，不参与选敌、判定、得分、胜负或重开。

## 验证结果

- Commit：`99f1392bd283dc0edda1e6d84976258e75d16279`
- GitHub Actions：`BlockType Adventure CI` Run `29891134963`
- 依赖安装：成功。
- TypeScript：成功。
- 6 组 Vitest：成功。
- Vite build：成功。
- Chromium 安装：成功。
- 4 组 Playwright：成功。
- 验证后的 `dist` 上传：成功。

## Vercel 最新状态

- Project：`blocktype-adventure`
- 当前 Production Deployment：`dpl_CqxqHuScPqHrYM4X4niWWqvPArz6`
- 状态：`READY`
- 正式域名仍通过临时恢复页进入旧可玩部署，本轮 `0.2.1` 尚未上线。
- 当前连接器没有提供修改 Git Integration 或向 GitHub 写入 Vercel Token 的安全能力，因此本轮未触碰 Production。

## 尚未验证

- 视觉反馈对象在低性能设备和减少动画模式下的表现。
- Firefox、Safari、移动端软键盘和中文输入法 composition 事件。
- 一局内持续输入多个自然生成单词直到自然结束的长流程。
- GitHub 分支到 Vercel Production 的稳定自动发布。

## 已知问题

- 尚未实现“减少动画”开关，当前短动画不能由用户关闭。
- 正式域名不是当前分支版本。
- 正式原创透明 SVG 角色和建筑素材仍不完整。
- 尚无关卡选择、难度设置、音效与本地记录。

## 下一轮唯一任务

为程序化视觉反馈增加“减少动画”设置并持久化：默认开启动画；用户关闭后仍保留静态锁定轮廓和必要文字反馈，但跳过脉冲、叉号移动和碎片动画。使用本地存储保存设置，并在 Playwright 中验证刷新后保持。部署自动发布仍作为 P0 阻塞保留，只有获得 Git Integration 或 Vercel 凭据写入能力后再处理。