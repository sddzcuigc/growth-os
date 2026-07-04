# 成长OS

一个以“孩子画像 → 技能树 → 真实项目外壳 → 工作流 → 证据反馈 → 迁移升级”为核心的因材施教移动端网页。

## 当前版本：V3 AI双引擎

- AI引擎：把孩子画像、技能树、项目外壳、核心技能、真实使用者、家庭问题和可用时间发送给安全后端，由 OpenAI Responses API 生成严格结构化的项目方案。
- 模板回退引擎：AI未配置、超时或调用失败时，自动使用本地动态模板编译器。
- 数据默认保存在浏览器本地。
- 公开仓库中的默认孩子姓名为“孩子A”。

## 为什么不能直接把API密钥放在GitHub Pages

GitHub Pages是公开的纯静态网站。把 `OPENAI_API_KEY` 写进前端会泄漏密钥，因此AI请求必须经过后端。

## 推荐部署：Vercel

1. 在 Vercel 中选择 **Add New → Project**。
2. 导入 GitHub 仓库 `sddzcuigc/growth-os`。
3. Framework Preset 选择 **Other**，直接 Deploy。
4. 在 Vercel 项目 **Settings → Environment Variables** 添加：

   - `OPENAI_API_KEY`：通过OpenAI Platform安全创建的API密钥
   - `GROWTH_OS_ACCESS_CODE`：自己设置一个较长的个人访问码
   - `OPENAI_MODEL`：可选，默认 `gpt-5-mini`
   - `ALLOWED_ORIGINS`：可选，例如 `https://sddzcuigc.github.io,https://你的项目.vercel.app`

5. 重新部署。
6. 在成长OS的“任务”页面打开 **AI内核设置**：

   - 运行模式：AI优先，失败自动回退
   - AI后端地址：`https://你的项目.vercel.app/api/compile`
   - 个人访问码：与 `GROWTH_OS_ACCESS_CODE` 一致

7. 点击“测试连接”。

## GitHub Pages

静态回退版地址：

`https://sddzcuigc.github.io/growth-os/`

GitHub Pages本身不能运行 `/api/compile` 后端，但可以调用部署在Vercel上的后端。

## 安全设计

- OpenAI API密钥只保存在Vercel环境变量中。
- 浏览器只保存个人访问码和后端地址。
- 后端校验来源和访问码。
- API返回使用严格JSON Schema。
- AI失败时可以自动回退本地模板，不影响基本使用。

## 计费说明

ChatGPT订阅和OpenAI API分别计费。外部网页不能直接使用ChatGPT Plus额度；AI自动生成需要OpenAI API账户余额。
