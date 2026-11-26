const C="mandarin-v1";
const PAGES=["/", "/lesson1.html", "/lesson2.html", "/lesson3.html", "/lesson4.html", "/lesson5.html", "/lesson6.html", "/lesson7.html", "/lesson8.html"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(PAGES.concat(["/manifest.json","/icon-192.png","/icon-512.png"]))).then(()=>self.skipWaiting()))});
self.addEventListener("activate",e=>e.waitUntil(self.clients.claim()));
async function ranged(req,res){
 const r=req.headers.get("range");if(!r||!res)return res;
 const m=/bytes=(\d*)-(\d*)/.exec(r);const b=await res.blob();const n=b.size;
 let s=m[1]?+m[1]:0,e=m[2]?+m[2]:n-1;if(e>=n)e=n-1;
 return new Response(b.slice(s,e+1),{status:206,headers:{"Content-Type":"video/mp4","Content-Range":"bytes "+s+"-"+e+"/"+n,"Content-Length":String(e-s+1),"Accept-Ranges":"bytes"}});
}
self.addEventListener("fetch",e=>{
 const req=e.request;if(req.method!=="GET")return;
 const u=new URL(req.url);if(u.origin!==location.origin)return;
 e.respondWith((async()=>{
  const c=await caches.open(C);
  let p=u.pathname;
  let hit=await c.match(p);
  if(!hit&&!p.endsWith(".html")&&p!=="/"&&!/\.[a-z0-9]+$/.test(p))hit=await c.match(p+".html");
  if(hit)return ranged(req,hit);
  try{return await fetch(req)}catch(x){return new Response("Offline. Open this lesson once online, or press Download for offline on the menu.",{status:503})}
 })());
});
