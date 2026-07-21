# PROJECT_STATE

## 当前版本

0.1.4 runtime-typing-integration

## 已可用

- Vite + TypeScript + Phaser 3 项目骨架。
- 单场景方块守卫战。
- 两种原创占位怪物：错字软泥、断键甲虫。
- 英文单词生成、首字母锁定、逐字攻击。
- 错误反馈、Backspace 撤销、Escape 暂停。
- 基地生命、得分、连击、准确率、WPM、倒计时。
- 胜利、失败和本局结算报告。
- 响应式 16:9 游戏容器。
- 专用 GitHub Actions 已真实运行成功，完成依赖安装、TypeScript 检查、Vitest 单元测试和 Vite 构建。
- 纯 TypeScript `TypingSystem` 已封装目标选择、锁定保持、错误输入、完成解锁、Backspace 和目标移除规则。
- 6 组 Vitest 单元测试已在 CI 中通过。
- `GameScene` 已接入 `TypingSystem`，运行时和单元测试使用同一套输入规则。

## 当前架构

- `src/main.ts`：Phaser 启动配置。
- `src/game/GameScene.ts`：游戏循环、敌人实体呈现、统计与输入结果反馈；不再自行决定目标锁定规则。
- `src/game/systems/TypingSystem.ts`：运行时与测试共用的确定性输入核心。
- `src/game/systems/TypingSystem.test.ts`：输入锁定规则测试。
- `src/style.css`：页面和画布容器样式。
- `.github/workflows/blocktype-adventure-ci.yml`：子项目类型检查、单元测试和构建验证入口。

## 本轮修改

- 将 `GameScene` 的首字母选敌、锁定保持、正确/错误字符、完成解锁、Backspace 和目标移除接入 `TypingSystem`。
- 每次键盘输入时将敌人状态映射为 `TypingTarget`，使用敌人到基地的实际距离排序。
- 删除场景内独立的 `lockedEnemy` 状态，防止两套锁定状态不同步。
- Backspace 显式调用 `preventDefault()`，降低浏览器后退等默认行为干扰。
- CI 已由提交触发；最终结果需在工作流结束后确认。

## 已知问题

- 尚未完成浏览器级完整流程测试，仍需验证焦点、连续快速输入、暂停、胜利、失败和重开。
- 当前视觉使用程序图形占位，尚未接入正式透明 SVG 素材。
- 尚无开始菜单、关卡选择和独立暂停面板。
- 尚无音效系统与本地存储。
- Vercel 现有 `growth-os` 项目仍以仓库根目录部署，尚未形成独立的 BlockType Adventure 项目地址。

## 下一轮最高优先级

增加最小浏览器自动化冒烟测试，验证页面加载、Canvas 创建、键盘输入、Escape 暂停和刷新无阻断错误；若浏览器环境仍不可用，则先补充场景与输入核心之间的集成测试接缝。
