const C="mandarin-v1",P="pages-v2";
self.addEventListener("install",e=>{e.waitUntil((async()=>{const c=await caches.open(P);for(const u of ["/","/manifest.json","/lessons.json","/icon-192.png","/icon-512.png"]){try{const r=await fetch(u,{cache:"no-cache"});if(r.ok)await c.put(u,r)}catch(x){}}self.skipWaiting()})())});
self.addEventListener("activate",e=>e.waitUntil((async()=>{for(const k of await caches.keys())if(k!==C&&k!==P)await caches.delete(k);
 try{const c=await caches.open(C);for(const r of await c.keys()){if(/\.(html)$/.test(r.url)||new URL(r.url).pathname==="/"||/lessons\.json|manifest\.json/.test(r.url))await c.delete(r)}}catch(x){}
 await self.clients.claim()})()));
async function ranged(req,res,ct){
 const r=req.headers.get("range");if(!r||!res)return res;
 const m=/bytes=(\d*)-(\d*)/.exec(r);const b=await res.blob();const n=b.size;
 let s=m[1]?+m[1]:0,e=m[2]?+m[2]:n-1;if(e>=n)e=n-1;
 return new Response(b.slice(s,e+1),{status:206,headers:{"Content-Type":ct,"Content-Range":"bytes "+s+"-"+e+"/"+n,"Content-Length":String(e-s+1),"Accept-Ranges":"bytes"}});
}
function key(u){let p=u.pathname;if(p!=="/"&&!p.endsWith(".html")&&!/\.[a-z0-9]+$/.test(p))p+=".html";return p}
self.addEventListener("fetch",e=>{
 const req=e.request;if(req.method!=="GET")return;
 const u=new URL(req.url);if(u.origin!==location.origin)return;
 e.respondWith((async()=>{
  const p=u.pathname;
  if(/\.(mp4|mp3|webp)$/.test(p)){
   const c=await caches.open(C);const hit=await c.match(p);
   const ct=p.endsWith("mp4")?"video/mp4":(p.endsWith("mp3")?"audio/mpeg":"image/webp");
   if(hit)return req.headers.get("range")?ranged(req,hit,ct):hit;
   try{return await fetch(req)}catch(x){return new Response("Offline. Tap Update on the menu while online to save this.",{status:503})}
  }
  const c=await caches.open(P);const k=key(u);const hit=await c.match(k);
  const net=Promise.race([fetch(u.href,{cache:"no-cache"}),new Promise((_,j)=>setTimeout(()=>j(0),hit?5000:9000))]).then(r=>{if(r&&r.ok&&r.status===200)c.put(k,r.clone());return r}).catch(()=>null);
  const r=await net;if(r&&r.ok)return r;
  if(hit)return hit;
  const f=await c.match("/");return f||new Response("Offline. Open the app once online first.",{status:503,headers:{"Content-Type":"text/plain"}});
 })());
});
