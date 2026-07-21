# PROJECT_STATE

## 当前版本

0.1.2 typing-core-tests

## 已可用

- Vite + TypeScript + Phaser 3 项目骨架。
- 单场景方块守卫战。
- 两种原创占位怪物：错字软泥、断键甲虫。
- 英文单词生成、首字母锁定、逐字攻击。
- 错误反馈、Backspace 撤销、Escape 暂停。
- 基地生命、得分、连击、准确率、WPM、倒计时。
- 胜利、失败和本局结算报告。
- 响应式 16:9 游戏容器。
- 专用 GitHub Actions 已真实运行成功，完成依赖安装、TypeScript 检查和 Vite 构建。
- 新增纯 TypeScript `TypingSystem`，封装目标选择、锁定保持、错误输入、完成解锁、Backspace 和目标移除规则。
- 新增 6 组 Vitest 单元测试，CI 已加入 `npm test` 步骤。

## 当前架构

- `src/main.ts`：Phaser 启动配置。
- `src/game/GameScene.ts`：当前 MVP 游戏循环；仍保留原输入逻辑，下一轮接入 `TypingSystem`。
- `src/game/systems/TypingSystem.ts`：可独立测试的确定性输入核心。
- `src/game/systems/TypingSystem.test.ts`：输入锁定规则测试。
- `src/style.css`：页面和画布容器样式。
- `.github/workflows/blocktype-adventure-ci.yml`：子项目类型检查、单元测试和构建验证入口。

## 已知问题

- `TypingSystem` 已建立并测试，但尚未接入 `GameScene`，当前存在两套输入规则产生差异的风险。
- 新增 Vitest 后的新一轮 CI 正在等待最终结果，不能提前声称单元测试已在 CI 通过。
- 尚未完成浏览器级完整流程测试。
- 当前视觉使用程序图形占位，尚未接入正式透明 SVG 素材。
- 尚无开始菜单、关卡选择和音效系统。
- Vercel 现有 `growth-os` 项目仍以仓库根目录部署，尚未形成独立的 BlockType Adventure 项目地址。

## 下一轮最高优先级

读取包含 Vitest 的 CI 结果；通过后将 `GameScene` 接入 `TypingSystem`，统一目标选择与 Backspace 规则，并确保现有行为不回退。
