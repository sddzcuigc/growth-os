const SEGMENTS = [
  "这是崔家成长森林 V 二十二的新版功能演示。孩子每天的成长任务由后端计算，练习结果不会因为点一下按钮就直接获得奖励。",
  "现在切换到安安。系统会根据年龄、技能难度、熟练度和最近复习时间，挑出今天最值得练的三项任务。",
  "孩子完成现实练习以后点击提交。此时只进入待确认状态，经验、阳光币和熟练度都不会提前增加。",
  "进入家长后台，刚才的练习会出现在待确认列表。家长可以确认并发奖励，也可以退回重练并写清原因。",
  "确认以后，服务器才真正更新技能熟练度和练习时间，同时写入独立复习记录，并把经验和阳光币记入奖励流水。",
  "周成长报告也只统计已经确认的练习。因此孩子不能靠反复点击按钮刷高数据，周报看到的是经过确认的现实成长。",
  "进入森林，可以继续看到安安已经掌握的技能果实，例如自己操作打印和系塑料袋。每颗果实都有累计练习时间、复习次数和熟练度。",
  "爸爸妈妈可以使用各自账号共同管理同一个家庭。云端保存历史版本，误操作可以恢复；离线练习也会在恢复网络后继续同步。",
  "这一版真正完成的是可信成长闭环：游戏化负责让孩子愿意开始，家长确认、复习记录和奖励流水负责让长期数据值得相信。"
];

const EDGE_URL = "https://tts.kina.ink/tts";
const VOICE = "zh-CN-YunyangNeural";

export default async function handler(req, res) {
  res.setHeader("cache-control", "no-store");
  res.setHeader("x-content-type-options", "nosniff");
  if (req.method !== "GET") {
    res.setHeader("allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }
  const index = Number(req.query?.i);
  if (!Number.isInteger(index) || index < 0 || index >= SEGMENTS.length) {
    return res.status(400).json({ error: "Invalid segment index" });
  }
  try {
    const response = await fetch(EDGE_URL, {
      method: "POST",
      headers: { "content-type": "application/json", "user-agent": "Mozilla/5.0" },
      body: JSON.stringify({
        text: SEGMENTS[index],
        voice: VOICE,
        rate: "+8%",
        volume: "+0%",
        pitch: "+0Hz",
        format: "mp3"
      })
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      return res.status(502).json({ error: "Edge TTS upstream failed", status: response.status, detail: detail.slice(0, 300) });
    }
    const bytes = Buffer.from(await response.arrayBuffer());
    if (bytes.length < 1000) return res.status(502).json({ error: "Edge TTS audio payload too small", bytes: bytes.length });
    if (String(req.query?.raw || "") === "1") {
      res.setHeader("content-type", "audio/mpeg");
      res.setHeader("content-length", String(bytes.length));
      res.setHeader("content-disposition", `inline; filename=yunyang-v22-${index}.mp3`);
      return res.status(200).send(bytes);
    }
    return res.status(200).json({
      index,
      voice: VOICE,
      text: SEGMENTS[index],
      contentType: response.headers.get("content-type") || "audio/mpeg",
      bytes: bytes.length,
      audioBase64: bytes.toString("base64")
    });
  } catch (error) {
    return res.status(502).json({ error: "Edge TTS request failed", detail: String(error?.message || error) });
  }
}
