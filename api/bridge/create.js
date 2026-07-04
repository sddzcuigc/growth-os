const {
  setCors,
  requireBridgeAuth,
  makeRequestId,
  saveRequest,
  setLatest
} = require("../_bridge-store");

module.exports = async function handler(req, res) {
  setCors(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (!requireBridgeAuth(req, res)) return;
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "只支持POST" });

  try {
    const context = req.body?.context || req.body;
    const bodyText = JSON.stringify(context || {});
    if (!context || bodyText.length < 20) {
      return res.status(400).json({ ok: false, error: "规划上下文为空" });
    }
    if (bodyText.length > 100000) {
      return res.status(413).json({ ok: false, error: "规划上下文过大" });
    }

    const now = new Date().toISOString();
    const record = {
      id: makeRequestId(),
      status: "pending",
      createdAt: now,
      updatedAt: now,
      context,
      result: null,
      summary: ""
    };

    await saveRequest(record);
    await setLatest(record.id);

    return res.status(200).json({
      ok: true,
      id: record.id,
      status: record.status,
      command: `处理成长规划任务 ${record.id}`
    });
  } catch (error) {
    return res.status(500).json({ ok: false, error: error.message || "创建请求失败" });
  }
};
