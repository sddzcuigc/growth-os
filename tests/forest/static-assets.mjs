import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import handler from '../../api/forest-app.js';
async function request(asset){const value={};await handler({method:'GET',url:'/api/forest-app.js?asset='+encodeURIComponent(asset)},{writeHead(status,headers){value.status=status;value.headers=headers||{};return this},end(body){value.body=body;return this}});return value}
const sw=await readFile(new URL('../../forest/sw.js',import.meta.url),'utf8');
const files=new Set([...sw.matchAll(/'\.\/([^']*)'/g)].map(m=>m[1]||'index.html'));
for(const file of files){const response=await request(file);assert.equal(response.status,200,file+' unavailable through production static handler')}
assert.match((await request('forest-design.css')).headers['content-type'],/text\/css/);
assert.match((await request('visual-icons.mjs')).headers['content-type'],/javascript/);
assert.match((await request('assets/lucide-license.txt')).headers['content-type'],/text\/plain/);
assert.equal((await request('../api/database.js')).status,404);
console.log('Static assets PASS: offline shell resources available, CSS/module/license MIME correct, private paths rejected');
