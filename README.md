# 成长OS

一个以“孩子画像 → 技能树 → 真实项目外壳 → 工作流 → 证据反馈 → 迁移升级”为核心的因材施教移动端网页。

## 当前版本：V4.1 Plus Action自动桥接

成长OS保留五种运行方式：

1. ChatGPT Plus手工桥接
2. ChatGPT Plus自定义GPT Action自动桥接
3. 多供应商API
4. 本地Ollama
5. 动态模板回退

## Plus Action自动桥接的真实流程

成长OS不能代替用户在ChatGPT界面自动发送消息。当前最自动化的官方方式是：

1. 成长OS创建规划请求并复制任务编号。
2. 自动打开用户自己的自定义GPT。
3. 用户发送一句“处理成长规划任务 <编号>”。
4. 自定义GPT通过Action读取完整孩子上下文。
5. GPT完成规划后通过Action把JSON写回桥接后端。
6. 成长OS持续轮询，收到结果后自动展示并导入。

## Vercel桥接后端环境变量

必须配置：

- `GROWTH_OS_BRIDGE_KEY`：自定义的长随机访问码；同时用于成长OS前端和自定义GPT Action认证
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`
- `ALLOWED_ORIGINS`：例如 `https://sddzcuigc.github.io,https://你的项目.vercel.app`

可在Vercel Marketplace给项目安装Upstash Redis，或在Upstash控制台创建数据库后复制REST URL和Token。

## 自定义GPT Action配置

仓库包含两个配置文件：

- `custom-gpt-instructions.md`：粘贴到自定义GPT的Instructions
- `gpt-action-openapi.yaml`：粘贴到Actions的Schema

配置步骤：

1. 创建一个自定义GPT，名称建议“成长OS因材施教规划师”。
2. 将 `custom-gpt-instructions.md` 的全部内容复制到Instructions。
3. 在Configure中添加Action。
4. 将 `gpt-action-openapi.yaml` 里的 `https://YOUR_VERCEL_DOMAIN` 替换成实际Vercel域名。
5. 把替换后的YAML粘贴到Action Schema。
6. Authentication选择API Key。
7. Auth Type选择Bearer。
8. API Key填写与Vercel环境变量 `GROWTH_OS_BRIDGE_KEY` 完全相同的值。
9. 用Action测试按钮测试：
   - `getLatestGrowthPlanRequest`
   - `getGrowthPlanRequest`
   - `saveGrowthPlanResult`
10. 保存自定义GPT，仅限自己使用即可。

## 成长OS前端配置

1. 刷新成长OS，确认顶部显示 `V4.1 · Plus Action`。
2. 打开“任务”。
3. AI内核选择 `ChatGPT Plus桥接`。
4. 打开“Plus Action自动桥接”设置。
5. 填写：
   - Vercel后端根地址，例如 `https://growth-os.vercel.app`
   - 桥接访问码，与 `GROWTH_OS_BRIDGE_KEY` 相同
   - 自定义GPT地址
6. 勾选“在Plus模式下启用自动桥接”。
7. 选择任务参数并点击生成。

## 桥接API

- `POST /api/bridge/create`：成长OS创建规划请求
- `GET /api/bridge/get?id=...`：自定义GPT按编号读取请求
- `GET /api/bridge/latest`：自定义GPT读取最新请求
- `POST /api/bridge/result`：自定义GPT写回方案
- `GET /api/bridge/status?id=...`：成长OS轮询结果

请求默认保存7天。

## 多供应商后端

云端API密钥不能写入GitHub Pages前端，必须放在Vercel等服务端环境变量中。

供应商支持：

- OpenAI
- DeepSeek
- Kimi / Moonshot
- 智谱GLM
- GPUStack
- 其他OpenAI兼容接口

## 安全设计

- Plus桥接不会读取或转发ChatGPT Cookie、登录令牌。
- Action通过Bearer API Key访问桥接后端。
- 云端模型密钥只放在服务端环境变量中。
- 桥接访问码只保存在当前浏览器会话。
- 孩子画像、任务和进度默认保存在浏览器本地。
- 桥接请求7天自动过期。

## 页面地址

GitHub Pages：`https://sddzcuigc.github.io/growth-os/`
