const { setCors, requireBridgeAuth, getRequest } = require("../_bridge-store");

module.exports = async function handler(req, res) {
  setCors(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (!requireBridgeAuth(req, res)) return;
  if (req.method !== "GET") return res.status(405).json({ ok: false, error: "只支持GET" });

  try {
    const id = String(req.query.id || "").trim();
    if (!id) return res.status(400).json({ ok: false, error: "缺少任务编号id" });
    const record = await getRequest(id);
    if (!record) return res.status(404).json({ ok: false, error: "找不到该规划任务，可能已过期" });

    return res.status(200).json({
      ok: true,
      request: {
        id: record.id,
        status: record.status,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
        context: record.context
      }
    });
  } catch (error) {
    return res.status(500).json({ ok: false, error: error.message || "读取请求失败" });
  }
};
