# 成长OS

一个以“孩子画像 → 技能树 → 真实项目外壳 → 工作流 → 证据反馈 → 迁移升级”为核心的因材施教移动端网页。

## 当前版本：V4 Plus与多模型

成长OS保留四种运行方式：

1. **ChatGPT Plus桥接**
   - 由前端生成完整规划请求。
   - 打开你自己的ChatGPT或自定义GPT。
   - 发送请求后，将返回的JSON粘贴回成长OS。
   - 不消耗API模型额度，但需要手动发送和粘贴一次。

2. **多供应商API**
   - OpenAI
   - DeepSeek
   - Kimi / Moonshot
   - 智谱GLM
   - GPUStack
   - 其他OpenAI兼容接口

3. **本地Ollama**
   - 直接调用本机或局域网中的Ollama。
   - 不上传孩子上下文到云端模型。

4. **模板回退**
   - API或Ollama失败时可自动使用本地动态模板编译器。

## Plus桥接使用方法

1. 打开成长OS的“任务”页面。
2. 在“AI内核设置”中选择“ChatGPT Plus桥接”。
3. 选择项目外壳、核心技能、真实使用者、家庭问题和时间。
4. 点击“生成因材施教任务与完整工作流”。
5. 点击“复制请求”和“打开ChatGPT”。
6. 将请求发送给ChatGPT。
7. 将ChatGPT返回的JSON粘贴回成长OS。
8. 点击“导入Plus生成的方案”。

## 多供应商后端

云端API密钥不能写入GitHub Pages前端，必须放在Vercel等服务端环境变量中。

公共环境变量：

- `GROWTH_OS_ACCESS_CODE`
- `ALLOWED_ORIGINS`

供应商变量：

### OpenAI
- `OPENAI_API_KEY`
- `OPENAI_MODEL`，默认 `gpt-5-mini`

### DeepSeek
- `DEEPSEEK_API_KEY`
- `DEEPSEEK_MODEL`，默认 `deepseek-chat`
- `DEEPSEEK_BASE_URL`，可选

### Kimi / Moonshot
- `MOONSHOT_API_KEY`
- `KIMI_MODEL`
- `KIMI_BASE_URL`，可选

### 智谱GLM
- `ZHIPU_API_KEY`
- `GLM_MODEL`
- `GLM_BASE_URL`，可选

### GPUStack
- `GPUSTACK_BASE_URL`
- `GPUSTACK_MODEL`
- `GPUSTACK_API_KEY`，按部署情况填写

### 其他OpenAI兼容接口
- `CUSTOM_OPENAI_BASE_URL`
- `CUSTOM_OPENAI_MODEL`
- `CUSTOM_OPENAI_API_KEY`

## 安全设计

- 云端模型密钥只放在服务端环境变量中。
- 个人访问码只保存在当前浏览器会话，不长期写入本地存储。
- Plus桥接不会读取或转发ChatGPT Cookie、登录令牌。
- AI失败时可以自动回退模板。
- 孩子画像、任务和进度默认保存在浏览器本地。

## 页面地址

GitHub Pages：`https://sddzcuigc.github.io/growth-os/`
