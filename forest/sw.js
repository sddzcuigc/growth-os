const CACHE='cui-growth-v27-practice-flow-1';
const APP=['./','./index.html','./themes.css?v=27','./themes.mjs?v=27','./assets/voxel-world.svg','./assets/voxel-tree-oak.svg','./assets/voxel-tree-sakura.svg','./assets/voxel-tree-orange.svg','./assets/voxel-tree-bean.svg','./assets/voxel-tree-willow.svg','./assets/voxel-tree-ginkgo.svg','./assets/voxel-tree-pine.svg','./forest-design.css?v=27','./visual-design.mjs?v=27','./visual-icons.mjs','./assets/forest-hero-v24.webp','./manifest.webmanifest','./sync-core.mjs','./roadmap.mjs?v=27','./skill-library.json?v=27','./runtime-config.js','./vendor/firebase-app-compat.js','./vendor/firebase-auth-compat.js','./icons/icon-192.png','./icons/icon-512.png','./assets/oak.webp','./assets/sakura.webp','./assets/orange.webp','./assets/beanstalk.webp','./assets/willow.webp','./assets/ginkgo.webp','./assets/pine.webp'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(APP)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('cui-growth-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
  const req=e.request;if(req.method!=='GET')return;
  const url=new URL(req.url);
  // API/auth/cloud data must never be served from the app shell cache.
  if(url.origin!==self.location.origin||url.pathname.startsWith('/api/'))return;
  if(req.mode==='navigate'){
    e.respondWith(fetch(req).then(r=>{if(r.ok)caches.open(CACHE).then(c=>c.put('./index.html',r.clone()));return r}).catch(()=>caches.match('./index.html')));return;
  }
  e.respondWith(caches.match(req).then(cached=>cached||fetch(req).then(r=>{if(r.ok){const copy=r.clone();caches.open(CACHE).then(c=>c.put(req,copy))}return r})));
});
