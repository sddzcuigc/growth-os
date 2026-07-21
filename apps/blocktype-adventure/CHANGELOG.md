# CHANGELOG

## 0.1.1 - CI validation setup

### 新增

- 新增 `.github/workflows/blocktype-adventure-ci.yml`。
- 工作流在子项目目录执行依赖安装、TypeScript 类型检查和 Vite 构建。
- 工作流仅在 BlockType Adventure 文件或自身配置变化时触发，避免影响仓库其他应用。

### 修复

- 移除对尚不存在 `package-lock.json` 的 npm 缓存配置，避免 CI 在安装前因缓存路径缺失失败。

### 验证

- 工作流文件已提交到开发分支。
- 截至本次记录，GitHub 尚未返回首次工作流运行结果，因此不能声称构建已通过。
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

- 尚未在当前连接环境执行依赖安装、类型检查、构建或浏览器自动化。
- 不能将当前状态标记为“已验证 MVP”。