// RecOniz service worker: sayfa önce ağdan, yoksa önbellekten; model ve simgeler önbellekten
const C='reconiz-v6';
const CORE=['/','/manifest.webmanifest','/icon-192.png','/icon-512.png','/apple-touch-icon.png','/favicon.svg','/ml/ort-wasm-simd.wasm','/ml/ort-wasm.wasm','/ml/u2netp.onnx.b64.txt'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==C).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{const r=e.request; if(r.method!=='GET') return; const u=new URL(r.url);
  if(r.mode==='navigate'){ e.respondWith(fetch(r).then(res=>{const cp=res.clone(); caches.open(C).then(c=>c.put('/',cp)); return res;}).catch(()=>caches.match('/'))); return; }
  if(u.origin===location.origin&&/\/ml\/|icon|favicon/.test(u.pathname)){ e.respondWith(caches.match(r).then(m=>m||fetch(r).then(res=>{const cp=res.clone(); caches.open(C).then(c=>c.put(r,cp)); return res;}))); return; }
  if(/cdn\.jsdelivr\.net|cdnjs\.cloudflare\.com|fonts\.(googleapis|gstatic)\.com/.test(u.host)){ e.respondWith(caches.open(C).then(c=>c.match(r).then(m=>{const f=fetch(r).then(res=>{ if(res.ok||res.type==='opaque') c.put(r,res.clone()); return res;}); return m||f;}))); }
});
