# 成长OS 100 Boss 系统接入说明 V3

本分支先接入**文本数据、规则引擎、演示页面和素材导入脚本**，不直接把约25MB二进制图片提交进Git历史。

## 产品结构

- 10个未来能力世界；
- 每个世界10个能力Boss；
- 每周选择一个Boss；
- 周一至周六完成核心任务后解锁每日小Boss；
- 周日综合Boss战；
- 伤害来自自主开始、坚持、方法、成果、复盘、迁移六类真实证据；
- 胜利后从家长启用的奖励池随机三选一；
- 需要家长确认的奖励进入待审批状态。

## 文件

- `assets/growth-os/assets_manifest_final.json`：导入后作为100 Boss、100奖励、世界和战斗规则的唯一数据源；
- `features/boss-system/boss-system.js`：无框架规则和渲染模块；
- `features/boss-system/boss-system.css`：独立样式；
- `features/boss-system/demo.html`：不影响现有首页的演示入口；
- `scripts/import-boss-assets.mjs`：从本地素材包导入图片；
- `scripts/validate-boss-assets.mjs`：校验数据数量和素材路径。

## 本地接入

1. 下载并解压 `GrowthOS_Codex_Integration_Kit_V3.0.zip`。
2. 执行：

```bash
npm run boss:import -- /绝对路径/GrowthOS_Codex_Integration_Kit_V3.0
npm run boss:validate
npm start
```

3. 打开 `/features/boss-system/demo.html`。

## 与现有成长蓝图的连接规则

周Boss不能由AI自由创造。程序先根据以下信号筛选候选Boss：

1. 当前年度或月度重点能力；
2. 最近两周反复出现的卡点；
3. 孩子确认感兴趣的项目载体；
4. 当前家庭时间和材料限制；
5. 尚未获得足够跨场景证据的能力。

AI只负责给候选Boss生成当周剧情和儿童化表达，不能修改Boss编号、血量、证据结算或奖励审批。

## 下一步合并位置

在现有 `app.js` 中增加一个新的主页面或成长档案入口，调用：

```js
import { loadBossManifest, renderBossSystem } from "./features/boss-system/boss-system.js";
```

第一阶段建议先放在“能力”页的高级区域，不立即替换现有每日任务流程。
