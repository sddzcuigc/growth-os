const { setCors, getBridgeHealth } = require("../_bridge-store");

module.exports = async function handler(req, res) {
  setCors(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "GET") {
    return res.status(405).json({ ok: false, error: "只支持GET" });
  }

  try {
    const health = await getBridgeHealth(req);
    return res.status(health.ready ? 200 : 503).json(health);
  } catch (error) {
    return res.status(500).json({
      ok: false,
      ready: false,
      error: error.message || "健康检查失败"
    });
  }
};
