# PROJECT_STATE

## 当前版本

`0.2.1 combat-feedback-verified / production-deployed`

状态：`CI 通过 / Chromium 核心流程通过 / Vercel Production 已更新到当前验证版本`

## 项目入口

- GitHub：`sddzcuigc/growth-os`
- 分支：`feat/blocktype-adventure-bootstrap`
- 目录：`apps/blocktype-adventure/`
- Draft PR：`#10`
- 正式地址：`https://blocktype-adventure.vercel.app`

## 已可用

- Vite + TypeScript + Phaser 3。
- 开始、战斗、暂停、胜负结算、重玩和返回首页状态闭环。
- 首字符选敌、最近目标优先、锁定保持、逐字攻击、错误统计与 Backspace。
- 基地生命、得分、连击、准确率、WPM、倒计时和错误按键报告。
- 6 组 Vitest、4 组 Playwright Chromium 测试。
- 程序化锁定、命中、错误和击破反馈。

## 本轮唯一目标

修复正式域名仍停留在旧部署的问题，把 GitHub 已验证的 `0.2.1` 提交发布到 Vercel Production。

## 根因

Vercel 项目使用 Vite Framework Preset，并会执行 `vite build`。此前直接部署只上传了 `dist` 或单个 HTML，没有 `package.json`、Vite 和完整源码，因此构建报：

`Command "vite build" exited with 127`

也就是构建环境里找不到 Vite。已有项目级 Vite 设置还会覆盖单次静态部署设置，所以继续上传裸 `dist` 无法解决。

## 本轮实际完成

- GitHub Commit：`2b170208b2b1bd0cd19949fe11a3c361a0dd9070`
- GitHub CI：Run `29891348752`，结果 `success`
- CI Artifact：`8518366471`
- Preview Deployment：`dpl_3xVPrDT4zBJ1juDh1xS7KyLUnsTv`，`READY`
- Production Deployment：`dpl_E61fZQ9Gex6eaNj7S16QZeGuuijK`，`READY`
- 正式域名根页面：HTTP `200`
- 页面标题：`方块打字冒险 · BlockType Adventure`
- Vercel 输出文件：`index-BbPr42c4.js`、`index-DorHkehT.css`
- 输出文件名与 CI Artifact 一致。

修复方式：向现有 Vercel 项目提交同一 Commit 的完整 Vite 源码和 `package.json`，先在 Preview 验证安装与构建，再用相同源码创建 Production。

## 尚未验证

- 尚未针对正式域名重新跑完整 Playwright。
- Firefox、Safari、移动端软键盘和中文输入法 composition。
- 低性能设备动画表现。

## 已知问题

- 当前版本已上线，但发布仍是手动的“Preview 验证后升 Production”；GitHub push 后自动发布尚未建立。
- 尚未实现“减少动画”开关。
- 正式原创透明 SVG 角色和建筑素材仍不完整。
- 尚无关卡选择、难度、音效与本地记录。

## 下一轮唯一任务

增加“减少动画”设置并使用本地存储持久化；自动发布继续作为 P0，后续建立 Git Integration、Deploy Hook 或安全的 GitHub Actions 发布路径。