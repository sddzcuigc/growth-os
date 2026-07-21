# PROJECT_STATE

## 当前版本

0.1.0 bootstrap

## 已可用

- Vite + TypeScript + Phaser 3 项目骨架。
- 单场景方块守卫战。
- 两种原创占位怪物：错字软泥、断键甲虫。
- 英文单词生成、首字母锁定、逐字攻击。
- 错误反馈、Backspace 撤销、Escape 暂停。
- 基地生命、得分、连击、准确率、WPM、倒计时。
- 胜利、失败和本局结算报告。
- 响应式 16:9 游戏容器。
- 已新增专用 GitHub Actions 工作流，对子项目执行依赖安装、TypeScript 检查和 Vite 构建。

## 当前架构

- `src/main.ts`：Phaser 启动配置。
- `src/game/GameScene.ts`：当前 MVP 游戏循环。
- `src/style.css`：页面和画布容器样式。
- `.github/workflows/blocktype-adventure-ci.yml`：只针对本子项目的构建验证入口。

## 已知问题

- GitHub Actions 工作流刚建立，当前尚未取得成功或失败的实际运行结果。
- 尚未完成浏览器级完整流程测试。
- 当前视觉使用程序图形占位，尚未接入正式透明 SVG 素材。
- 游戏逻辑暂集中于 GameScene，后续应拆分输入、统计和敌人系统。
- 尚无开始菜单、关卡选择和音效系统。
- Vercel 现有 `growth-os` 项目仍以仓库根目录部署，尚未形成独立的 BlockType Adventure 项目地址。

## 下一轮最高优先级

读取 GitHub Actions 首次运行结果；若失败则只修复构建问题，若成功则补充可重复的输入系统测试和浏览器流程验证。