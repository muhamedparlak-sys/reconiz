// RecOniz service worker: çevrimdışı çalışma için uygulama, model ve kütüphaneler önbellekte tutulur
const C='reconiz-v15';
const CORE=['/','/rejoiner/','/manifest.webmanifest','/icon-192.png','/icon-512.png','/icon-maskable-512.png','/apple-touch-icon.png','/favicon.svg','/favicon-32.png','/ml/ort.wasm.min.js','/ml/three.min.js','/ml/ort-wasm-simd.wasm','/ml/ort-wasm.wasm','/ml/u2netp.onnx.b64.txt'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==C).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
// sayfa: ağ 3 saniyede yanıt vermezse (zayıf bağlantı) önbellekteki sürüm açılır; ağ gelince önbellek yenilenir
function pageFetch(r){ const p=new URL(r.url).pathname, old=p.startsWith('/parca'), key=(old||p.startsWith('/rejoiner'))?'/rejoiner/':'/';
  const net=fetch(r).then(res=>{ if(res.ok&&!old){ const cp=res.clone(); caches.open(C).then(c=>c.put(key,cp)); } return res; });
  const cached=caches.match(key);
  const timeout=new Promise(ok=>setTimeout(ok,3000));
  return Promise.race([net.catch(()=>null), timeout.then(()=>null)]).then(res=>res||cached.then(m=>m||net)); }
self.addEventListener('fetch',e=>{const r=e.request; if(r.method!=='GET') return; const u=new URL(r.url);
  if(r.mode==='navigate'){ e.respondWith(pageFetch(r)); return; }
  if(u.origin===location.origin){ e.respondWith(caches.match(r,{ignoreSearch:true}).then(m=>m||fetch(r).then(res=>{ if(res.ok){ const cp=res.clone(); caches.open(C).then(c=>c.put(r,cp)); } return res; }))); return; }
  if(/fonts\.(googleapis|gstatic)\.com/.test(u.host)){ e.respondWith(caches.open(C).then(c=>c.match(r).then(m=>{ const f=fetch(r).then(res=>{ if(res.ok||res.type==='opaque') c.put(r,res.clone()); return res; }).catch(()=>m); return m||f; }))); }
});
