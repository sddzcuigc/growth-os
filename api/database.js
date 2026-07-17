import Database from "libsql";

function cleanRow(row) {
  if (!row || typeof row !== "object" || !("_metadata" in row)) return row;
  const { _metadata, ...clean } = row;
  return clean;
}

function wrapStatement(statement) {
  return new Proxy(statement, {
    get(target, property) {
      if (property === "get") return (...args) => cleanRow(target.get(...args));
      if (property === "all") return (...args) => target.all(...args).map(cleanRow);
      const value = target[property];
      return typeof value === "function" ? value.bind(target) : value;
    }
  });
}

function wrapDatabase(database) {
  return new Proxy(database, {
    get(target, property) {
      if (property === "prepare") return (sql) => wrapStatement(target.prepare(sql));
      const value = target[property];
      return typeof value === "function" ? value.bind(target) : value;
    }
  });
}

export function openGrowthDatabase({ localPath, remoteUrl = "", authToken = "", isVercel = false }) {
  const normalizedUrl = String(remoteUrl || "").trim();
  const remote = /^(?:libsql|https?|wss?):\/\//i.test(normalizedUrl);
  if (normalizedUrl && !remote) throw new Error("TURSO_DATABASE_URL 必须使用 libsql、https、http、wss 或 ws 协议");
  if (remote && /^libsql:\/\//i.test(normalizedUrl) && !authToken) throw new Error("远程 libSQL 数据库缺少 TURSO_AUTH_TOKEN");

  const raw = remote ? new Database(normalizedUrl, { authToken }) : new Database(localPath);
  return {
    db: wrapDatabase(raw),
    remote,
    mode: remote ? "remote-libsql" : isVercel ? "ephemeral" : "local",
    label: remote ? "云端持久数据库" : isVercel ? "云端临时数据库" : "本机持久数据库"
  };
}
