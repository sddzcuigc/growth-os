# TODO

## P0

- [x] 建立专用 GitHub Actions 工作流，自动执行 `npm install`、`npm run check`、`npm test`、`npm run build`。
- [x] 取得首次 CI 实际运行结果：TypeScript 检查与 Vite 构建成功。
- [x] 确认加入 Vitest 后的 CI 全部通过，并修复 ES2022 兼容性问题。
- [x] 让 CI 上传经过类型检查、单元测试和构建验证的 `dist` 产物。
- [x] 建立并实际部署独立 Vercel Preview 项目 `blocktype-adventure`，确认根页面 HTTP 200。
- [ ] 增加最小 Playwright 浏览器冒烟测试：页面加载、Canvas、键盘输入、Escape、刷新。
- [ ] 在浏览器中验证胜利、失败、结算与重新开始完整流程。

## P1

- [x] 建立可独立测试的 `TypingSystem` 并覆盖目标锁定、错误输入、完成解锁和 Backspace。
- [x] 将 `GameScene` 接入 `TypingSystem`，统一运行时与测试规则。
- [ ] 增加开始界面、暂停面板和关卡结算状态切换。
- [ ] 为目标锁定、正确、错误和完成单词增加更清晰的动画反馈。
- [ ] 接入原创透明 SVG：字核守卫、错字软泥、断键甲虫、字核塔。

## P2

- [ ] 增加三个固定难度。
- [ ] 增加音效开关和 Web Audio 程序音效。
- [ ] 增加本地最高分和设置存储。
- [ ] 增加字母入门模式。
- [ ] 将当前直接 API Preview 部署替换为稳定的 Git 分支自动部署流程。

## P3

- [ ] 拼音模式和中文输入法组合事件支持。
- [ ] 关卡地图、资源奖励和 Boss 关卡。
- [ ] 自定义练习文本和家长报告。
