import assert from 'node:assert/strict';
import {authenticate} from '../../forest-server/auth.mjs';
delete process.env.ALLOW_DEV_AUTH;
await assert.rejects(authenticate({headers:{'x-dev-user':'example|example@example.com'}}),e=>e.statusCode===401);
process.env.ALLOW_DEV_AUTH='1';process.env.VERCEL='1';
await assert.rejects(authenticate({headers:{'x-dev-user':'example|example@example.com'}}),e=>e.statusCode===401);
await assert.rejects(authenticate({headers:{authorization:'Bearer not-json.bad.signature'}}),e=>e.statusCode===401);
delete process.env.VERCEL;
const user=await authenticate({headers:{'x-dev-user':'example|example@example.com'}});assert.equal(user.provider,'dev');
delete process.env.ALLOW_DEV_AUTH;
console.log('Auth boundary PASS: default rejects development header, Vercel cannot enable it, malformed token returns 401');

