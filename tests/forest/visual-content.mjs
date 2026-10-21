import assert from 'node:assert/strict';
import {renderVisualState} from '../../forest/visual-design.mjs';
const target={innerHTML:''};globalThis.document={getElementById:id=>id==='projectShowcase'?target:null};
const child={projects:[{templateId:'family-lunch',attempts:[{result:'<img src=x onerror=alert(1)>'}]}]};const original=JSON.stringify(child);
renderVisualState(child);assert.ok(!target.innerHTML.includes('<img'));assert.ok(target.innerHTML.includes('&lt;img'));assert.equal(JSON.stringify(child),original);
renderVisualState({projects:{legacy:'kept'}});assert.ok(target.innerHTML.includes('data-open-project="family-lunch"'));
renderVisualState({projects:[{templateId:'family-lunch',attempts:[{result:null}]}]});assert.ok(target.innerHTML.includes('已记录 1 次尝试'));
delete globalThis.document;console.log('Visual content PASS: untrusted project text is escaped, legacy shapes do not break rendering, state is unchanged');
