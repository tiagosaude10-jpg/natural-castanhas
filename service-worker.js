const CACHE='natural-castanhas-etapa1-20260806';
const CORE_FILES=[
  './index.html','./styles.css','./ios-form-fix.css','./app.js','./sales.js','./financeiro.js',
  './resultados.js','./relatorios.js','./ios-form-fix.js','./nucleo3-integrado.js',
  './nucleo3-melhorias.js','./nucleo4-estoque.js','./nucleo8-link.js','./nucleo10-link.js',
  './nucleo11-usuarios.js','./barra-inferior.js','./data-safety.js','./flow-health.js',
  './nucleo0.js','./admin-bootstrap.js','./auth-gate.js','./admin-center.js',
  './admin-inicial-tiago.js','./password-recovery.js','./cadastro-pessoa.js',
  './auth-login-hotfix.js','./dashboard-consolidado.js','./dashboard-etapa1.js','./nucleo-8-transporte.html',
  './nucleo-10-documentos.html','./manifest.webmanifest'
];

const PAGE_SCRIPTS=[
  'nucleo3-integrado.js','nucleo3-melhorias.js','nucleo4-estoque.js','ios-form-fix.js',
  'nucleo8-link.js','nucleo10-link.js','nucleo11-usuarios.js','barra-inferior.js',
  'data-safety.js','flow-health.js','nucleo0.js','admin-bootstrap.js','auth-gate.js',
  'admin-center.js','admin-inicial-tiago.js','password-recovery.js','cadastro-pessoa.js',
  'auth-login-hotfix.js','dashboard-consolidado.js','dashboard-etapa1.js'
];

self.addEventListener('install',event=>{
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(CORE_FILES)));
});

self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)));
    await self.clients.claim();
  })());
});

async function homeResponse(request){
  let response;
  try{
    response=await fetch(request,{cache:'no-store'});
    const cache=await caches.open(CACHE);
    cache.put('./index.html',response.clone());
  }catch(error){
    response=await caches.match('./index.html');
  }
  if(!response)return new Response('Aplicativo indisponível.',{status:503});

  let html=await response.text();
  if(!html.includes('ios-form-fix.css')){
    html=html.replace('</head>','<link rel="stylesheet" href="./ios-form-fix.css?v=38"></head>');
  }
  PAGE_SCRIPTS.forEach(name=>{
    if(!html.includes(name))html=html.replace('</body>',`<script src="./${name}?v=38"></script></body>`);
  });
  return new Response(html,{
    status:response.status,
    statusText:response.statusText,
    headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'}
  });
}

self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  const url=new URL(event.request.url);
  const isHome=event.request.mode==='navigate'&&(url.pathname.endsWith('/')||url.pathname.endsWith('/index.html'));

  if(isHome){event.respondWith(homeResponse(event.request));return;}

  if(url.origin===self.location.origin&&['script','style'].includes(event.request.destination)){
    event.respondWith((async()=>{
      try{
        const response=await fetch(event.request,{cache:'no-store'});
        const cache=await caches.open(CACHE);
        cache.put(event.request,response.clone());
        return response;
      }catch(error){
        return (await caches.match(event.request))||Response.error();
      }
    })());
    return;
  }

  event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request)));
});