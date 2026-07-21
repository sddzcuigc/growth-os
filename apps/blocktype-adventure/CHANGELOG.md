# CHANGELOG

## 0.1.9 - High-speed keyboard baseline

### 新增

- 增加 Playwright 高速连续输入测试，覆盖 10、20、30 字符/秒。
- 使用真实 Chromium `keydown` 事件记录接收顺序，并同时校验游戏统计、目标锁定、错误按键和单词完成结果。
- 测试目标为 24 字符可控单词，中途插入 1 个错误字符，验证错误不改变锁定或后续顺序。

### 验证

- GitHub Actions Run `29873820235` 成功。
- 依赖安装、TypeScript 检查、6 组 Vitest、Vite 构建、Chromium 安装、4 组 Playwright 测试和 dist 上传全部通过。
- 30 字符/秒下接收字符数、顺序、正确数、错误数和完成状态均与预期一致。

## 0.1.8 - Result flow browser verification

### 新增

- 增加倒计时胜利、基地生命归零失败、结算字段和真实点击“再来一局”的 Playwright 浏览器闭环测试。
- 场景快照增加基地生命、剩余时间和 `overlay` 结算容器文字。
- 胜利路径通过加速 Phaser 场景时钟触发原生产倒计时回调；失败路径通过真实敌人越过基地边界触发原生产伤害逻辑。

### 稳定性

- 修复把结算文字错误地只从场景顶层 `children.list` 读取的问题。
- 修复第二个敌人随机生成时序导致的测试抖动；夹具仅调用生产 `spawnEnemy()` 补足敌人数，不直接设置锁定或结果。

### 验证

- GitHub Actions Run `29870701302` 成功。
- 依赖安装、TypeScript 检查、6 组 Vitest、Vite 构建、Chromium 安装、3 组 Playwright 测试和 dist 上传全部通过。

## 0.1.7 - Input browser verification

### 新增

- 扩展 Playwright 场景快照，覆盖敌人 ID、单词、进度、位置、锁定目标和输入统计。
- 增加同首字符最近目标锁定、锁定保持、Backspace 回退、浏览器导航抑制和场景重开状态清理测试。
- GitHub Actions 在浏览器测试失败时上传 Playwright report、trace、截图和视频诊断；成功时跳过诊断上传。

### 测试策略

- 等待两个真实移动敌人后，仅将临时测试目标的单词规范化为 `stone` 和 `star`。
- 敌人距离、移动、键盘事件、`TypingSystem` 判定、Backspace 和场景重开仍走生产代码。
- 放弃通过覆盖全局 `Math.random` 控制 Phaser 选词的方案，因为实测无法稳定控制 `Phaser.Utils.Array.GetRandom`。

### 验证

- GitHub Actions Run `29866501947` 成功。
- 依赖安装、TypeScript 检查、6 组 Vitest、Vite 构建、Chromium 安装、2 组 Playwright 测试和 dist 上传全部通过。

## 0.1.6 - Browser smoke verification

### 新增

- 增加 Playwright Chromium 冒烟测试和 `npm run test:e2e`。
- 增加页面、Canvas、敌人生成、Escape 暂停/恢复、暂停输入隔离、恢复输入统计和刷新验证。
- `main.ts` 暴露只读 Phaser 实例作为浏览器测试接缝。
- 增加 `vitest.config.ts`，隔离 Vitest 与 Playwright 测试目录。

### 修复

- 修复 Vitest 误收集 Playwright `.spec.ts` 导致单元测试失败。
- 补齐 `index.html` 的 HTML 文档结构、语言、viewport、description 和页面标题。

### 验证

- GitHub Actions Run `29861614000` 成功。
- TypeScript 检查、6 组 Vitest、Vite 构建、Chromium 安装、Playwright 冒烟测试和 dist 上传全部通过。

## 0.1.5 - Independent preview deployment

### 新增

- CI 上传经过检查和测试的 `dist` 产物。
- 建立独立 Vercel 项目 `blocktype-adventure`。

### 验证

- 独立部署状态为 `READY`，根页面 HTTP 200。

## 0.1.4 - Runtime typing integration

### 修改

- `GameScene` 已接入 `TypingSystem`，移除场景内独立维护的目标锁定规则。
- 首字符选敌、锁定保持、错误输入、完成解锁、Backspace 和目标移除统一由可测试核心处理。
- 敌人位置在每次输入时转换为 `distanceToBase`。
- Backspace 显式阻止浏览器默认行为。

## 0.1.3 - Typing core CI compatibility fix

### 修复

- 将 ES2023 `toSorted()` 改为 ES2022 可用的 `sort()`，排序发生在新数组上。

### 验证

- 依赖安装、TypeScript、6 组 Vitest 和 Vite 构建通过。

## 0.1.2 - Typing core tests

### 新增

- 新增 `TypingSystem` 和 6 组输入规则测试。
- 新增 Vitest 与 `npm test`。

## 0.1.1 - CI validation setup

### 新增

- 新增子项目专用 GitHub Actions，执行安装、类型检查、测试和构建。

## 0.1.0 - Bootstrap

### 新增

- 创建 `apps/blocktype-adventure` 独立子项目。
- 建立 Vite、TypeScript、Phaser 3 基础配置。
- 完成第一版方块守卫战：怪物、输入、攻击、撤销、暂停、胜负和结算统计。
- 增加项目状态、待办和技术决策文档。
