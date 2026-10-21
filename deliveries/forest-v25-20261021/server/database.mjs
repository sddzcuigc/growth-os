import { DatabaseSync } from 'node:sqlite';
import { createRequire } from 'node:module';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
const require=createRequire(import.meta.url);
let Remote=null;
function clean(row){if(!row||typeof row!=='object')return row;const{_metadata,...rest}=row;return rest}
function wrap(raw){
  let depth=0;
  return {
    exec:s=>raw.exec(s),
    prepare:s=>{const st=raw.prepare(s);return{run:(...a)=>st.run(...a),get:(...a)=>clean(st.get(...a)),all:(...a)=>st.all(...a).map(clean)}},
    transaction(fn){
      if(depth)return fn();
      raw.exec('BEGIN IMMEDIATE');depth++;
      try{const value=fn();raw.exec('COMMIT');return value}
      catch(error){try{raw.exec('ROLLBACK')}catch{}throw error}
      finally{depth--}
    }
  };
}
export function openDatabase({file,remoteUrl='',authToken=''}){
  if(process.env.VERCEL&&!remoteUrl)throw new Error('Production requires a durable cloud database');
  if(remoteUrl){Remote ||= (require('libsql')?.default||require('libsql'));return wrap(new Remote(remoteUrl,{authToken}))}
  mkdirSync(dirname(file),{recursive:true});return wrap(new DatabaseSync(file));
}
