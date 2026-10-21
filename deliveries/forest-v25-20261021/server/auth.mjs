import { createPublicKey, verify as verifySignature } from 'node:crypto';
const PROJECT=process.env.FIREBASE_PROJECT_ID||'mail-f14f3',ISS=`https://securetoken.google.com/${PROJECT}`,CERTS='https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com';
let cache={v:null,until:0};
const b64=v=>Buffer.from(String(v).replace(/-/g,'+').replace(/_/g,'/')+'='.repeat((4-String(v).length%4)%4),'base64');
const parse=v=>JSON.parse(b64(v).toString('utf8'));
export async function authenticate(req){
  if(!process.env.VERCEL&&process.env.ALLOW_DEV_AUTH==='1'&&req.headers['x-dev-user']){const raw=String(req.headers['x-dev-user']),[uid,email]=raw.split('|');return{uid:uid||'dev-parent',email:email||`${uid||'dev'}@example.com`,emailVerified:true,provider:'dev'}}
  const token=String(req.headers.authorization||'').match(/^Bearer\s+(.+)$/i)?.[1];if(!token)throw http(401,'请先登录','AUTH_REQUIRED');
  const p=token.split('.');if(p.length!==3)throw http(401,'登录凭证无效','INVALID_TOKEN');let h,x;try{h=parse(p[0]);x=parse(p[1])}catch{throw http(401,'登录凭证无效','INVALID_TOKEN')}const now=Math.floor(Date.now()/1000);
  if(h.alg!=='RS256'||!h.kid||x.aud!==PROJECT||x.iss!==ISS||typeof x.sub!=='string'||!x.sub||!Number.isFinite(x.exp)||!Number.isFinite(x.iat)||x.exp<now-300||x.iat>now+300)throw http(401,'登录凭证无效','INVALID_TOKEN');
  if(!x.email)throw http(403,'账号没有邮箱','EMAIL_REQUIRED');
  const certs=await getCerts(),cert=certs[h.kid];if(!cert)throw http(401,'登录密钥已更新，请重试','TOKEN_KEY_MISMATCH');
  if(!verifySignature('RSA-SHA256',Buffer.from(`${p[0]}.${p[1]}`),createPublicKey(cert),b64(p[2])))throw http(401,'登录签名无效','INVALID_TOKEN');
  return{uid:x.sub,email:String(x.email),emailVerified:x.email_verified===true,provider:String(x.firebase?.sign_in_provider||'unknown')}
}
async function getCerts(){if(cache.v&&Date.now()<cache.until)return cache.v;const r=await fetch(CERTS,{cache:'no-store'});if(!r.ok)throw http(503,'暂时无法验证登录身份','CERT_FETCH_FAILED');const v=await r.json(),m=Number((r.headers.get('cache-control')||'').match(/max-age=(\d+)/)?.[1]||3600);cache={v,until:Date.now()+Math.max(300,m-60)*1000};return v}
export function http(statusCode,message,code){return Object.assign(new Error(message),{statusCode,code})}
