# TODO

## P0

- [x] 建立专用 GitHub Actions 工作流，自动执行 `npm install`、`npm run check`、`npm test`、`npm run build`。
- [x] 取得首次 CI 实际运行结果：TypeScript 检查与 Vite 构建成功。
- [x] 确认加入 Vitest 后的 CI 全部通过，并修复 ES2022 兼容性问题。
- [ ] 增加完整游戏流程自动化测试。
- [ ] 建立独立 Vercel 项目，将 Root Directory 设置为 `apps/blocktype-adventure`。

## P1

- [x] 建立可独立测试的 `TypingSystem` 并覆盖目标锁定、错误输入、完成解锁和 Backspace。
- [ ] 将 `GameScene` 接入 `TypingSystem`，统一运行时与测试规则。
- [ ] 增加开始界面、暂停面板和关卡结算状态切换。
- [ ] 为目标锁定、正确、错误和完成单词增加更清晰的动画反馈。
- [ ] 接入原创透明 SVG：字核守卫、错字软泥、断键甲虫、字核塔。

## P2

- [ ] 增加三个固定难度。
- [ ] 增加音效开关和 Web Audio 程序音效。
- [ ] 增加本地最高分和设置存储。
- [ ] 增加字母入门模式。

## P3

- [ ] 拼音模式和中文输入法组合事件支持。
- [ ] 关卡地图、资源奖励和 Boss 关卡。
- [ ] 自定义练习文本和家长报告。
