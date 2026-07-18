# Repair the existing validation script so it only checks files present in this repository.
import json
package_path = ROOT / 'package.json'
package = json.loads(package_path.read_text(encoding='utf-8'))
check_steps = [
    'node --check app.js',
    'node --check api/server.js',
    'node --check api/database.js',
]
for relative in [
    'scripts/build-boss-catalog.mjs',
    'scripts/validate-ai-modules.mjs',
    'scripts/validate-product-logic.mjs',
]:
    if (ROOT / relative).exists():
        check_steps.append(f'node {relative}')
package['scripts']['check'] = ' && '.join(check_steps)
if not (ROOT / 'scripts/migrate-sqlite-to-libsql.mjs').exists():
    package['scripts'].pop('migrate:turso', None)
package_path.write_text(json.dumps(package, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
