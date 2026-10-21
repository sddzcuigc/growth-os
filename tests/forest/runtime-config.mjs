import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {runInNewContext} from 'node:vm';
const source=await readFile(new URL('../../forest/runtime-config.js',import.meta.url),'utf8');
const web={window:{},location:{origin:'https://preview.example'}};
runInNewContext(source,web);
assert.equal(web.window.FOREST_RUNTIME.api,'https://preview.example/api/forest-sync');
const native={window:{__TAURI_INTERNALS__:{}},location:{origin:'http://tauri.localhost'}};
runInNewContext(source,native);
assert.equal(native.window.FOREST_RUNTIME.api,'https://growth-os-ten-pearl.vercel.app/api/forest-sync');
console.log('Runtime config PASS: web preview stays on its own backend; native build uses public service');

