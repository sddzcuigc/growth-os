const {
  setCors,
  requireBridgeAuth,
  getRequest,
  saveRequest,
  validatePlan
} = require("../_bridge-store");

module.exports = async function handler(req, res) {
  setCors(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (!requireBridgeAuth(req, res)) return;
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "只支持POST" });

  try {
    const id = String(req.body?.id || "").trim();
    const plan = req.body?.plan;
    const summary = String(req.body?.summary || "").slice(0, 1000);
    if (!id) return res.status(400).json({ ok: false, error: "缺少任务编号id" });

    const record = await getRequest(id);
    if (!record) return res.status(404).json({ ok: false, error: "找不到该规划任务，可能已过期" });

    validatePlan(plan);
    record.status = "complete";
    record.result = plan;
    record.summary = summary;
    record.updatedAt = new Date().toISOString();
    await saveRequest(record);

    return res.status(200).json({ ok: true, id, status: record.status, updatedAt: record.updatedAt });
  } catch (error) {
    return res.status(400).json({ ok: false, error: error.message || "保存结果失败" });
  }
};
