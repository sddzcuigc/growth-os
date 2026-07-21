# CHANGELOG

## 0.1.2 - Typing core tests

### 新增

- 新增 `src/game/systems/TypingSystem.ts`，将目标选择、锁定保持、错误输入、完成解锁、Backspace 和目标移除规则整理为纯 TypeScript 核心。
- 新增 `TypingSystem.test.ts`，覆盖 6 类关键输入规则。
- 新增 Vitest，并增加 `npm test` 命令。
- CI 增加单元测试步骤。

### 验证

- 上一轮 `BlockType Adventure CI #10` 已完成且结论为 success，证明原有依赖安装、TypeScript 检查和 Vite 构建可以通过。
- 本轮新增测试后的 CI 尚待最终结果，因此暂不声称新测试已在 GitHub Actions 通过。
- `TypingSystem` 尚未接入 `GameScene`，本轮只完成可测试核心与测试基线。

## 0.1.1 - CI validation setup

### 新增

- 新增 `.github/workflows/blocktype-adventure-ci.yml`。
- 工作流在子项目目录执行依赖安装、TypeScript 类型检查和 Vite 构建。
- 工作流仅在 BlockType Adventure 文件或自身配置变化时触发，避免影响仓库其他应用。

### 修复

- 移除对尚不存在 `package-lock.json` 的 npm 缓存配置，避免 CI 在安装前因缓存路径缺失失败。

### 验证

- 工作流文件已提交到开发分支。
- 首次专用 CI 已实际成功。
- 浏览器完整流程和独立 Vercel 项目仍未验证。

## 0.1.0 - Bootstrap

### 新增

- 创建 `apps/blocktype-adventure` 独立子项目。
- 建立 Vite、TypeScript、Phaser 3 基础配置。
- 完成第一版可交互方块守卫战代码。
- 增加两种原创程序图形怪物占位。
- 增加首字母锁定、逐字攻击、错误反馈、撤销、暂停、胜负和结算统计。
- 增加项目状态、待办和技术决策文档。

### 验证

- 初版当时尚未在连接环境执行依赖安装、类型检查、构建或浏览器自动化。
