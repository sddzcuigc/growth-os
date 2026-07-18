import fs from "node:fs";

const file = "api/server.js";
const source = fs.readFileSync(file, "utf8");
const before = `function ensureColumn(table, column, definition) {
  const columns = db.prepare(\`PRAGMA table_info(\${table})\`).all().map((item) => item.name);
  if (!columns.includes(column)) db.exec(\`ALTER TABLE \${table} ADD COLUMN \${column} \${definition}\`);
}`;
const after = `function ensureColumn(table, column, definition) {
  const normalizedColumn = String(column).toLowerCase();
  const rows = db.prepare(\`PRAGMA table_info("\${table}")\`).all();
  const columns = rows.map((item) => String(item?.name ?? item?.NAME ?? item?.[1] ?? "").toLowerCase());
  if (columns.includes(normalizedColumn)) return;
  try {
    db.exec(\`ALTER TABLE "\${table}" ADD COLUMN "\${column}" \${definition}\`);
  } catch (error) {
    if (/duplicate column name/i.test(String(error?.message || error))) return;
    throw error;
  }
}`;

if (!source.includes(before)) {
  if (source.includes("const normalizedColumn = String(column).toLowerCase();")) {
    console.log("Turso migration hotfix is already present.");
    process.exit(0);
  }
  throw new Error("Could not find ensureColumn migration anchor.");
}

fs.writeFileSync(file, source.replace(before, after));
console.log("Patched ensureColumn for libSQL/Turso compatibility.");
