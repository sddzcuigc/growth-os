# 成长OS

一个以“孩子画像 → 技能树 → 真实项目外壳 → 工作流 → 证据反馈 → 迁移升级”为核心的因材施教移动端网页。

## 当前版本：V4.2 Plus Action自动桥接

成长OS保留五种运行方式：

1. ChatGPT Plus手工桥接
2. ChatGPT Plus自定义GPT Action自动桥接
3. 多供应商API
4. 本地Ollama
5. 动态模板回退

## 已部署地址

- GitHub Pages：`https://sddzcuigc.github.io/growth-os/`
- Vercel后端：`https://growth-os-ten-pearl.vercel.app`

## Plus Action自动桥接流程

1. 成长OS创建规划请求并复制任务编号。
2. 自动打开用户自己的自定义GPT。
3. 用户发送一句“处理成长规划任务 <编号>”。
4. 自定义GPT通过Action读取完整孩子上下文。
5. GPT完成规划后通过Action写回结构化方案。
6. 成长OS持续轮询；收到结果后可以自动采用方案并进入工作流。
7. 页面刷新后会自动恢复尚未完成的等待任务。

成长OS不能代替用户在ChatGPT界面自动发送消息，因此仍需用户在自定义GPT中发送一次任务命令。

## Vercel桥接后端环境变量

必须配置：

- `GROWTH_OS_BRIDGE_KEY`：自定义的长随机访问码，同时用于成长OS前端和自定义GPT Action认证
- Redis REST地址与Token，支持以下任一组名称：
  - `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN`
  - `KV_REST_API_URL` + `KV_REST_API_TOKEN`
  - `REDIS_REST_URL` + `REDIS_REST_TOKEN`
- `ALLOWED_ORIGINS`：建议填写 `https://sddzcuigc.github.io,https://growth-os-ten-pearl.vercel.app`

可在Vercel项目的Marketplace中安装Upstash Redis，安装后重新部署。

## 自定义GPT Action配置

仓库包含：

- `custom-gpt-instructions.md`：粘贴到自定义GPT的Instructions
- `gpt-action-openapi.yaml`：粘贴到Actions的Schema

`gpt-action-openapi.yaml` 已经使用正式后端地址：

```text
https://growth-os-ten-pearl.vercel.app
```

配置步骤：

1. 创建一个自定义GPT，名称建议“成长OS因材施教规划师”。
2. 将 `custom-gpt-instructions.md` 的全部内容复制到Instructions。
3. 在Configure中添加Action。
4. 把 `gpt-action-openapi.yaml` 全部粘贴到Action Schema。
5. Authentication选择API Key。
6. Auth Type选择Bearer。
7. API Key填写与Vercel环境变量 `GROWTH_OS_BRIDGE_KEY` 完全相同的值。
8. 测试：
   - `getLatestGrowthPlanRequest`
   - `getGrowthPlanRequest`
   - `saveGrowthPlanResult`
9. 保存自定义GPT，可设置为仅自己使用。

## 成长OS前端配置

1. 刷新成长OS，确认顶部显示 `V4.2 · Plus Action`。
2. 打开“任务”。
3. AI内核选择 `ChatGPT Plus桥接`。
4. 打开“Plus Action自动桥接”设置。
5. 点击“生成并复制安全访问码”。
6. 把该访问码配置到：
   - Vercel的 `GROWTH_OS_BRIDGE_KEY`
   - 自定义GPT Action的Bearer API Key
   - 成长OS桥接设置中的访问码
7. 安装并连接Upstash Redis。
8. 点击“测试连接”，直到显示“连接成功”。
9. 填入自定义GPT地址并启用自动桥接。

## 桥接API

- `GET /api/bridge/health`：检查访问码和Redis配置状态
- `POST /api/bridge/create`：成长OS创建规划请求
- `GET /api/bridge/get?id=...`：自定义GPT按编号读取请求
- `GET /api/bridge/latest`：自定义GPT读取最新请求
- `POST /api/bridge/result`：自定义GPT写回方案
- `GET /api/bridge/status?id=...`：成长OS轮询结果

请求默认保存7天。

## 多供应商后端

云端API密钥不能写入GitHub Pages前端，必须放在Vercel等服务端环境变量中。

支持：OpenAI、DeepSeek、Kimi / Moonshot、智谱GLM、GPUStack和其他OpenAI兼容接口。

## 安全设计

- Plus桥接不会读取或转发ChatGPT Cookie、登录令牌。
- Action通过Bearer API Key访问桥接后端。
- 云端模型密钥只放在服务端环境变量中。
- 桥接访问码只保存在当前浏览器会话。
- 孩子画像、任务和进度默认保存在浏览器本地。
- 桥接请求7天自动过期。
