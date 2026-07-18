# Align legacy validation rules with the durable adapter and production privacy policy.
server = server_path.read_text(encoding='utf-8')
server = server.replace('"崔护"', '"测试冒险家"').replace('"9岁3个月"', '"9岁"')
server_path.write_text(server, encoding='utf-8')

validator = validator_path.read_text(encoding='utf-8')
validator = validator.replace(
    'const serverSource = readFileSync("api/server.js", "utf8");\n',
    'const serverSource = readFileSync("api/server.js", "utf8");\nconst databaseSource = readFileSync("api/database.js", "utf8");\n',
    1,
)
validator = validator.replace(
    'for (const term of ["node:sqlite", "/api/auth/register",',
    'for (const term of ["/api/auth/register",',
    1,
)
validator = validator.replace(
    'if (!serverSource.includes("schemaVersion: 11")) failures.push("export schema missing child-controlled family brief version");',
    'if (!serverSource.includes("schemaVersion: 13")) failures.push("export schema missing Journey evidence lineage version");',
    1,
)
validator = validator.replace(
    'for (const term of ["ensureBuiltInDemoAccount", "builtin-admin@growth-os.local", \'loginName === "admin"\', \'"崔护"\', \'"9岁3个月"\']) if (!serverSource.includes(term)) failures.push(`built-in demo account missing ${term}`);\nfor (const term of ["内置测试：账号 admin", "邮箱或测试账号"]) if (!htmlSource.includes(term)) failures.push(`built-in demo login UI missing ${term}`);',
    'if (!serverSource.includes(\'if (devAdminEnabled && loginName === "admin")\')) failures.push("development demo login is not locally gated");\nif (htmlSource.includes("内置测试：账号 admin")) failures.push("production login UI exposes shared demo credentials");\nif (serverSource.includes(\'"崔护"\') || serverSource.includes(\'"9岁3个月"\')) failures.push("production server contains real child demo data");',
    1,
)
validator = validator.replace(
    'const journeyServer = readFileSync(resolve(root, "api/server.js"), "utf8");\nconst journeyApp = readFileSync(resolve(root, "app.js"), "utf8");',
    'const journeyServer = readFileSync("api/server.js", "utf8");\nconst journeyApp = readFileSync("app.js", "utf8");',
    1,
)
validator += '\nif (!databaseSource.includes("node:sqlite") || !serverSource.includes("openGrowthDatabase")) failures.push("database adapter is not wired to local SQLite");\n'
validator_path.write_text(validator, encoding='utf-8')
