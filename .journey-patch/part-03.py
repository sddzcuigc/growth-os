# Repair the existing validation script so it only checks files present in this repository.
import json
package_path = ROOT / 'package.json'
package = json.loads(package_path.read_text(encoding='utf-8'))
package['scripts']['check'] = 'node --check app.js && node --check api/server.js && node --check api/database.js && node scripts/build-boss-catalog.mjs && node scripts/validate-ai-modules.mjs && node scripts/validate-product-logic.mjs'
if not (ROOT / 'scripts/migrate-sqlite-to-libsql.mjs').exists():
    package['scripts'].pop('migrate:turso', None)
package_path.write_text(json.dumps(package, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
