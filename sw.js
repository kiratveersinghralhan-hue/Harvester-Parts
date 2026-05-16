const CACHE='hp-supabase-v81-route-fix';
const ASSETS=['./','./index.html','./styles.css?v=81','./app.js?v=81','./language-ux-patch.js?v=81','./supabase-config.js?v=81','./logo-192.png'];
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).catch(()=>null));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.map(k=>k===CACHE?null:caches.delete(k)))));self.clients.claim();});
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;const url=new URL(e.request.url);if(url.origin!==location.origin)return;e.respondWith(fetch(e.request,{cache:'no-store'}).then(r=>{const copy=r.clone();if(r.ok)caches.open(CACHE).then(c=>c.put(e.request,copy)).catch(()=>null);return r;}).catch(()=>caches.match(e.request).then(r=>r||caches.match('./index.html'))));});
