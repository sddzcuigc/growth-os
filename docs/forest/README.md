# 成长森林 V27：技能、练习和项目连起来

**选小技能 → 动手练习与复习 → 在真实项目中使用 → 留下结果与下一步。**

产品目标是孩子获得具体能力和做成事情的成就感。已有 72 项技能、11 条路线与 8 个项目继续复用原记录。

## 更少的往返

- 在技能窗口直接搜索动作、类别和步骤，例如“系塑料袋”。
- 新技能点“加入并开始练习”，已有技能点“开始练习”；取消不会自动增加练习或奖励。
- 从项目查看技能可直接“返回项目”，本页未提交的结果与复盘会保留；进入练习后再回项目也能接着写。
- 草稿按账号和孩子隔开；上下文变化时阻止旧表单提交。草稿仅在当前页面保留，刷新前仍需保存。
- 旧记录“系塑料袋”与操作卡“把购物袋口系牢”复用同一技能 ID，不重复种一项技能。

[连贯流程回归](../../deliveries/forest-v27-20261021/evidence/practice-flow.json) · [手机技能到练习](../../deliveries/forest-v27-20261021/evidence/v27-phone-skill-to-practice.png) · [离线查找](../../deliveries/forest-v27-20261021/evidence/v27-phone-offline-search.png)

## 页面现在怎么用

| 入口 | 做什么 |
| --- | --- |
| 今天 | 选一个小技能，练一项已有技能，或继续做项目 |
| 技能 | 看自己的分类技能树，找具体路线与操作步骤，添加自己的技能 |
| 项目 | 八个项目集中查看，复用技能，保存实际结果与复盘 |
| 成长 | 本周小结与练习足迹；展开查看徽章、奖励与统计 |

账号、备份、家庭确认和安装放在右上角“设置”，按用途展开。首页不再铺开所有树木和奖励面板；原有功能保留在明确位置。

右上角“主题”可以切换 **森林** 与 **方块世界**。后者是我的世界风格的原创方块场景和七种树木矢量图，包含配套卡片、按钮、果实和弹窗样式。主题记在当前设备，刷新、离线均可用，不改变孩子记录。

设计依据：[产品主线与简约设计](产品主线与简约设计.md)。

## 打开完整应用

[完整开发工程](../../deliveries/forest-v27-20261021/README.md) 中，Windows 双击 **启动成长森林.cmd**。需要 Node.js 22.13 以上，首次安装工程依赖后打开 http://127.0.0.1:8787/ 。可选择“暂时只在本机使用”，记录保存在浏览器中；关闭终端后服务停止，重新双击继续。

本机服务器与线上数据库独立。线上预览在原 GitHub 分支和草稿 PR，生产站尚未发布。docs/技能树总览.html 是只读课程资料，不代替完整应用。

## 真实页面与验证

[森林主题电脑页](../../deliveries/forest-v27-20261021/evidence/v26-forest-desktop-home.png) · [方块主题电脑页](../../deliveries/forest-v27-20261021/evidence/v26-blocks-desktop-home.png) · [方块主题手机页](../../deliveries/forest-v27-20261021/evidence/v26-blocks-phone-home.png) · [方块技能树](../../deliveries/forest-v27-20261021/evidence/v26-blocks-desktop-skills.png)

[主题与简约流程](../../deliveries/forest-v27-20261021/evidence/visual-design.json)：四个主入口、三个首页区域、全部项目、两套主题、刷新记忆、离线切换、切换前后记录不变。360 像素首屏可看到主要行动；1440／1024／820／390／360 像素没有页面横向溢出。

[旧功能与旧备份](../../deliveries/forest-v27-20261021/evidence/feature-parity.json)、[三端同步](../../deliveries/forest-v27-20261021/evidence/browser-multi-device.json)、[路线与项目](../../deliveries/forest-v27-20261021/evidence/browser-roadmap.json)、[离线课程资料](../../deliveries/forest-v27-20261021/evidence/overview.json)。测试实际执行导入旧形状备份、第五项技能练习、导出与刷新保留、离线补传、审批去重、冲突保留和账号隔离。

```powershell
npm ci
node scripts/validate.mjs
node tests/feature-parity.mjs
npm run test:multi-device
npm run build:web
```

跨端测试为 Edge 隔离上下文与本机 HTTP／SQLite，显式启用测试身份；旧功能回归另用无测试身份的本机模式。

## 当前边界

手机和平板为浏览器模拟，实机、原生安装包和生产账号同步尚未验收。旧版示例人物与经验保留；练习等级不是独立能力测评。

不含用户数据库、依赖目录或服务端密钥。方块素材的可复现源代码在 scripts/build-theme-art.mjs；森林插画原图、提示词与图标许可在 design/。
