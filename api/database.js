import { createRequire } from "node:module";
import { DatabaseSync } from "node:sqlite";

const require = createRequire(import.meta.url);
let RemoteDatabase = null;

function cleanRow(row) {
  if (!row || typeof row !== "object") return row;
  const { _metadata, ...clean } = row;
  return { ...clean };
}

function wrapStatement(statement) {
  return {
    run: (...args) => statement.run(...args),
    get: (...args) => cleanRow(statement.get(...args)),
    all: (...args) => statement.all(...args).map(cleanRow)
  };
}

function wrapDatabase(raw) {
  return {
    exec: (sql) => raw.exec(sql),
    prepare: (sql) => wrapStatement(raw.prepare(sql)),
    close: () => raw.close?.()
  };
}

function remoteConstructor() {
  if (RemoteDatabase) return RemoteDatabase;
  const loaded = require("libsql");
  RemoteDatabase = loaded?.default || loaded;
  return RemoteDatabase;
}

export function openGrowthDatabase({ localPath, remoteUrl = "", authToken = "", isVercel = false }) {
  const normalizedUrl = String(remoteUrl || "").trim();
  const remote = /^(?:libsql|https?|wss?):\/\//i.test(normalizedUrl);
  if (normalizedUrl && !remote) throw new Error("TURSO_DATABASE_URL 必须使用 libsql、https、http、wss 或 ws 协议");
  if (remote && /^libsql:\/\//i.test(normalizedUrl) && !authToken) throw new Error("远程 libSQL 数据库缺少 TURSO_AUTH_TOKEN");
  const RawDatabase = remote ? remoteConstructor() : DatabaseSync;
  const raw = remote ? new RawDatabase(normalizedUrl, { authToken }) : new RawDatabase(localPath);
  return { db: wrapDatabase(raw), remote, mode: remote ? "remote-libsql" : isVercel ? "ephemeral" : "local-sqlite", label: remote ? normalizedUrl.replace(/:\/\/.*@/, "://***@") : localPath };
}
