const PLAN_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["title","purpose","shell","realUser","problem","availableTime","coreSkills","supportSkills","maintenanceSkills","outputs","materials","safety","rationale","steps"],
  properties: {
    title:{type:"string"}, purpose:{type:"string"}, shell:{type:"string"}, realUser:{type:"string"}, problem:{type:"string"}, availableTime:{type:"integer"},
    coreSkills:{type:"array",items:{type:"string"}}, supportSkills:{type:"array",items:{type:"string"}}, maintenanceSkills:{type:"array",items:{type:"string"}},
    outputs:{type:"array",items:{type:"string"}}, materials:{type:"array",items:{type:"string"}}, safety:{type:"string"}, rationale:{type:"string"},
    steps:{type:"array",items:{type:"object",additionalProperties:false,required:["phase","title","purpose","child","parent","elder","duration","evidence","standard","skills","skillTraining"],properties:{
      phase:{type:"string"}, title:{type:"string"}, purpose:{type:"string"}, child:{type:"string"}, parent:{type:"string"}, elder:{type:"string"}, duration:{type:"integer"}, evidence:{type:"string"}, standard:{type:"string"},
      skills:{type:"array",items:{type:"string"}}, skillTraining:{type:"array",items:{type:"object",additionalProperties:false,required:["skill","role","action"],properties:{skill:{type:"string"},role:{type:"string",enum:["核心训练","重要支撑","基础维护"]},action:{type:"string"}}}}
    }}}
  }
};

const SYSTEM_PROMPT = `你是“成长OS”的因材施教规划引擎。不要套模板。根据孩子画像、技能证据、家庭资源、真实问题、项目外壳和核心技能，生成一个可执行、可验证、可迁移的综合项目。
必须遵守：
1. 真实目的优先，服务明确使用者，成果可被实际使用或验证。
2. 所选项目外壳和核心技能原样保留；核心技能必须真正改变步骤、家长教学、证据和验收标准，不能只贴标签。
3. 1—3项核心技能、3—6项支撑技能、少量维护技能。
4. 6—8个连续步骤，覆盖目的、必要学习、设计、执行、测试、修改、交付、复盘迁移。
5. 每一步写清孩子行动、家长怎么教、老人只负责什么、时间、证据和标准。
6. 家长只示范最小样例，不替孩子完成；老人只守流程和安全。
7. AI只能检查、解释或提示，不能替孩子生成全部成果。
8. 结合年龄、兴趣、资源、时间与安全限制，不做医疗诊断。
9. 必须只返回JSON。`;

const PROVIDERS = {
  openai: { kind:"responses", keyEnv:"OPENAI_API_KEY", modelEnv:"OPENAI_MODEL", defaultModel:"gpt-5-mini", endpoint:"https://api.openai.com/v1/responses" },
  deepseek: { kind:"chat", keyEnv:"DEEPSEEK_API_KEY", modelEnv:"DEEPSEEK_MODEL", defaultModel:"deepseek-chat", baseEnv:"DEEPSEEK_BASE_URL", defaultBase:"https://api.deepseek.com" },
  kimi: { kind:"chat", keyEnv:"MOONSHOT_API_KEY", modelEnv:"KIMI_MODEL", baseEnv:"KIMI_BASE_URL", defaultBase:"https://api.moonshot.cn/v1" },
  glm: { kind:"chat", keyEnv:"ZHIPU_API_KEY", modelEnv:"GLM_MODEL", baseEnv:"GLM_BASE_URL", defaultBase:"https://open.bigmodel.cn/api/paas/v4" },
  gpustack: { kind:"chat", keyEnv:"GPUSTACK_API_KEY", modelEnv:"GPUSTACK_MODEL", baseEnv:"GPUSTACK_BASE_URL" },
  custom: { kind:"chat", keyEnv:"CUSTOM_OPENAI_API_KEY", modelEnv:"CUSTOM_OPENAI_MODEL", baseEnv:"CUSTOM_OPENAI_BASE_URL" }
};

function setCors(req,res){
  const defaults=["https://sddzcuigc.github.io"];
  const configured=(process.env.ALLOWED_ORIGINS||"").split(",").map(x=>x.trim()).filter(Boolean);
  const origin=req.headers.origin||"";
  if(origin && ([...defaults,...configured].includes(origin)||origin.endsWith(".vercel.app"))){res.setHeader("Access-Control-Allow-Origin",origin);res.setHeader("Vary","Origin");}
  res.setHeader("Access-Control-Allow-Methods","GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers","Content-Type,X-Growth-OS-Code");
  res.setHeader("Cache-Control","no-store");
}

function validateAccess(req){
  const expected=process.env.GROWTH_OS_ACCESS_CODE;
  if(!expected)return {ok:false,status:503,message:"后端尚未配置 GROWTH_OS_ACCESS_CODE"};
  if(req.headers["x-growth-os-code"]!==expected)return {ok:false,status:401,message:"访问码不正确"};
  return {ok:true};
}

function chatEndpoint(base){return `${String(base||"").replace(/\/$/,"")}/chat/completions`;}
function stripJson(text){
  const raw=String(text||"").trim().replace(/^```(?:json)?\s*/i,"").replace(/\s*```$/i,"");
  const start=raw.indexOf("{"); const end=raw.lastIndexOf("}");
  return start>=0&&end>start?raw.slice(start,end+1):raw;
}
function validateTask(task){
  const required=["title","purpose","shell","realUser","problem","coreSkills","supportSkills","maintenanceSkills","outputs","materials","safety","steps"];
  for(const key of required)if(task?.[key]===undefined)throw new Error(`模型结果缺少字段：${key}`);
  if(!Array.isArray(task.steps)||task.steps.length<6)throw new Error("模型返回的工作流不足6步");
  return task;
}
function extractResponsesText(data){
  if(typeof data.output_text==="string")return data.output_text;
  for(const item of data.output||[])for(const content of item.content||[])if(content.type==="output_text"&&typeof content.text==="string")return content.text;
  return "";
}

async function callOpenAIResponses(config,userPrompt){
  const response=await fetch(config.endpoint,{method:"POST",headers:{"Content-Type":"application/json","Authorization":`Bearer ${config.apiKey}`},body:JSON.stringify({
    model:config.model,instructions:SYSTEM_PROMPT,input:userPrompt,reasoning:{effort:"medium"},text:{format:{type:"json_schema",name:"growth_os_task",strict:true,schema:PLAN_SCHEMA}},store:false
  })});
  const data=await response.json();
  if(!response.ok)throw new Error(data?.error?.message||`OpenAI API 请求失败：${response.status}`);
  return {task:validateTask(JSON.parse(stripJson(extractResponsesText(data)))),responseId:data.id||null};
}

async function callCompatibleChat(config,userPrompt){
  const schemaText=JSON.stringify(PLAN_SCHEMA);
  const response=await fetch(chatEndpoint(config.baseUrl),{method:"POST",headers:{"Content-Type":"application/json",...(config.apiKey?{"Authorization":`Bearer ${config.apiKey}`}:{})},body:JSON.stringify({
    model:config.model,messages:[{role:"system",content:`${SYSTEM_PROMPT}\n严格按照以下JSON Schema返回，不得包含Markdown代码块：${schemaText}`},{role:"user",content:userPrompt}],temperature:0.2,response_format:{type:"json_object"}
  })});
  const data=await response.json();
  if(!response.ok)throw new Error(data?.error?.message||`兼容API请求失败：${response.status}`);
  const text=data?.choices?.[0]?.message?.content;
  if(!text)throw new Error("模型没有返回文本内容");
  return {task:validateTask(JSON.parse(stripJson(text))),responseId:data.id||null};
}

function resolveProvider(ai={}){
  const provider=String(ai.provider||"openai").toLowerCase();
  const preset=PROVIDERS[provider];
  if(!preset)throw new Error(`不支持的供应商：${provider}`);
  const model=ai.model||process.env[preset.modelEnv]||preset.defaultModel;
  if(!model)throw new Error(`${provider} 尚未配置模型名称`);
  const apiKey=process.env[preset.keyEnv]||"";
  if(!apiKey && provider!=="gpustack"&&provider!=="custom")throw new Error(`${provider} 尚未配置 ${preset.keyEnv}`);
  const baseUrl=ai.baseUrl||process.env[preset.baseEnv]||preset.defaultBase;
  if(preset.kind==="chat"&&!baseUrl)throw new Error(`${provider} 尚未配置API基础地址`);
  return {...preset,provider,model,apiKey,baseUrl};
}

module.exports=async function handler(req,res){
  setCors(req,res);
  if(req.method==="OPTIONS")return res.status(204).end();
  const access=validateAccess(req); if(!access.ok)return res.status(access.status).json({ok:false,error:access.message});
  if(req.method==="GET")return res.status(200).json({ok:true,service:"growth-os-ai",providers:Object.keys(PROVIDERS)});
  if(req.method!=="POST")return res.status(405).json({ok:false,error:"只支持GET、POST和OPTIONS"});
  const bodyText=JSON.stringify(req.body||{}); if(bodyText.length>70000)return res.status(413).json({ok:false,error:"上下文过大，请精简后重试"});
  const context=req.body||{};
  const userPrompt=`请依据以下成长OS上下文生成全新的因材施教方案。所选外壳和核心技能必须原样保留，支撑技能、步骤和证据要根据画像重新设计。\n\n${JSON.stringify(context,null,2)}`;
  try{
    const config=resolveProvider(context.ai||{});
    const result=config.kind==="responses"?await callOpenAIResponses(config,userPrompt):await callCompatibleChat(config,userPrompt);
    return res.status(200).json({ok:true,task:result.task,meta:{provider:config.provider,model:config.model,responseId:result.responseId,generatedAt:new Date().toISOString()}});
  }catch(error){return res.status(500).json({ok:false,error:error.message||"AI生成失败"});}
};
