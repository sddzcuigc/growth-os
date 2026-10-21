import assert from 'node:assert/strict';
import {contentOf, mergeSnapshots, removeAcknowledged} from '../sync-core.mjs';

const base = {version:23,current:'anan',categories:[{id:'life',name:'生活类'},{id:'learning',name:'学习类'}],children:{anan:{coins:0,trees:[{id:'life',skills:[{id:'bag',name:'系塑料袋',story:'把袋口系牢'}]}],projects:[{id:'lunch',name:'为家人准备午餐',skillIds:['bag'],note:''}]},hu:{trees:[]}}};
const local = structuredClone(base), remote = structuredClone(base);
local.children.anan.trees[0].skills.push({id:'shopping',name:'买菜',story:'按清单采购'});
remote.children.anan.projects[0].note='第一次实际采购，留下作品与复盘';
let out = mergeSnapshots(base,local,remote);
assert.deepEqual(out.conflicts,[]);
assert.equal(out.state.children.anan.trees[0].skills.length,2);
assert.equal(out.state.children.anan.projects[0].note,remote.children.anan.projects[0].note);

const left=structuredClone(base),right=structuredClone(base);
left.children.anan.trees[0].skills[0].story='先拧袋口';
right.children.anan.trees[0].skills[0].story='先整理袋口';
out=mergeSnapshots(base,left,right);
assert.equal(out.conflicts.length,1);
assert.equal(out.state.children.anan.trees[0].skills[0].story,'先拧袋口');
assert.equal(base.children.anan.trees[0].skills[0].story,'把袋口系牢');

left.children.anan.coins=10;right.children.anan.coins=10;
assert.ok(mergeSnapshots(base,left,right).conflicts.some(x=>x.endsWith('.coins')));
const selected=structuredClone(base);selected.current='hu';
assert.deepEqual(contentOf(base),contentOf(selected));

const deleted=structuredClone(base),edited=structuredClone(base);
deleted.children.anan.trees[0].skills=[];
edited.children.anan.trees[0].skills[0].story='另一台设备编辑';
assert.equal(mergeSnapshots(base,deleted,edited).conflicts.length,1);

const queued=[{action:'submit-practice',body:{clientEventId:'one'}},{action:'submit-practice',body:{clientEventId:'new-while-uploading'}}];
assert.deepEqual(removeAcknowledged(queued,['one']),[queued[1]]);
console.log('V23_SYNC_CORE_PASS: disjoint edits, skill/project references, same-field conflict, counter conflict, deletion conflict, local child selection, queue acknowledgement');
