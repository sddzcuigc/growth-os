# PROJECT_STATE

## 当前版本

`0.1.5 preview-deployed`

状态：`构建已验证 / 单元测试已通过 / 独立 Preview 已上线 / 浏览器完整流程未验证`

## 项目入口

- GitHub：`sddzcuigc/growth-os`
- 分支：`feat/blocktype-adventure-bootstrap`
- 目录：`apps/blocktype-adventure/`
- Draft PR：`#10`

## 已可用

- Vite + TypeScript + Phaser 3 项目骨架。
- 单场景“方块守卫战”。
- 两种原创占位怪物：错字软泥、断键甲虫。
- 英文单词生成、首字符选敌、逐字攻击。
- 同一待输入字符的多个目标优先选择距离基地最近者。
- 锁定目标保持、错误反馈、Backspace 撤销、Escape 暂停。
- 基地生命、得分、连击、准确率、WPM、倒计时。
- 胜利、失败、本局结算和重新开始。
- 响应式 16:9 游戏容器。
- `TypingSystem` 已成为运行时与测试共用的唯一输入规则实现。
- 6 组 Vitest 输入规则测试已通过。

## 当前架构

- `src/main.ts`：Phaser 启动与缩放配置。
- `src/game/GameScene.ts`：场景、敌人、统计和输入结果呈现。
- `src/game/systems/TypingSystem.ts`：确定性目标选择、锁定、输入、撤销和目标移除规则。
- `src/game/systems/TypingSystem.test.ts`：输入规则单元测试。
- `src/style.css`：页面与 Canvas 容器样式。
- `.github/workflows/blocktype-adventure-ci.yml`：安装、类型检查、单元测试、构建和已验证 `dist` 产物上传。

## 本轮唯一目标

把已经存在但没有部署记录的独立 Vercel 项目真正部署出来，并留下可复核的构建与上线证据。

## 本轮实际完成

### GitHub CI

更新 `.github/workflows/blocktype-adventure-ci.yml`，在以下步骤成功后上传 Vite `dist`：

```bash
npm install
npm run check
npm test
npm run build
```

验证证据：

- Workflow：`BlockType Adventure CI`
- Run ID：`29860740045`
- 结果：`success`
- 产物：`blocktype-adventure-dist`
- Artifact ID：`8507173833`
- 产物包含：`index.html`、CSS bundle、JavaScript bundle

### 独立 Vercel Preview

- Project：`blocktype-adventure`
- Project ID：`prj_sagowGlhR6eSQH7RZ87cGzMI2wVN`
- Deployment ID：`dpl_5LK3aseeuBQ957VdyALNMjEBPBWP`
- 地址：`https://blocktype-adventure.vercel.app`
- 状态：`READY`
- 根页面：HTTP `200`
- 页面标题：`方块打字冒险 · BlockType Adventure`
- HTML 已引用构建后的 CSS 与 JavaScript bundle，静态资源可访问。

该地址是已验证可访问的 Preview，不等同于“完整游戏验收通过”或正式生产发布。

## 已验证范围

- 依赖安装成功。
- TypeScript 类型检查成功。
- Vitest 输入规则测试成功。
- Vite 生产构建成功。
- CI 成功生成并上传构建产物。
- 独立 Vercel 项目部署状态为 `READY`。
- 根页面、页面标题与静态 bundle 可从公网访问。

## 尚未验证

- 真实浏览器是否成功创建并显示 Phaser Canvas。
- 页面焦点与快速连续按键是否丢键。
- Escape 在浏览器中暂停和恢复。
- Backspace 是否完全避免浏览器默认行为。
- 胜利、失败、结算和重开完整流程。
- 浏览器控制台是否存在阻断游戏的错误。

## 已知问题

- 尚无 Playwright 浏览器冒烟测试。
- 当前是直接进入单场景原型，没有开始菜单、关卡选择和独立暂停面板。
- 尚无音效、音量和减少动画设置。
- 尚无本地最高分与练习记录。
- 正式原创透明 SVG 素材仍不完整，场景主要使用程序图形。
- 尚未实现中文输入法 composition 事件处理。
- 在可访问的 Notion 搜索中未找到明确对应的 BlockType Adventure 项目页，因此本轮状态写回仓库文件和 PR #10。

## 下一轮唯一任务

增加一个最小 Playwright 冒烟测试，只验证：

1. 页面加载；
2. Phaser Canvas 创建；
3. 键盘输入不会产生阻断错误；
4. Escape 可暂停并恢复；
5. 刷新后仍能创建 Canvas。

在该浏览器路径通过前，不增加新玩法或装饰功能。
