const CACHE='natural-castanhas-v3';
const FILES=['./','./index.html','./styles.css','./app.js','./module3.html','./module3.css','./module3.js','./manifest.webmanifest','./assets/logo.svg','./assets/icon-192.png','./assets/icon-512.png'];
self.addEventListener('install',event=>{self.skipWaiting();event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(FILES)))});
self.addEventListener('activate',event=>{event.waitUntil(Promise.all([self.clients.claim(),caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key))))]))});
self.addEventListener('fetch',event=>{
  const url=new URL(event.request.url);
  const isHome=event.request.mode==='navigate'&&(url.pathname.endsWith('/')||url.pathname.endsWith('/index.html'));
  if(isHome){
    event.respondWith((async()=>{
      let response;
      try{response=await fetch(event.request,{cache:'no-store'})}catch(error){response=await caches.match('./index.html')}
      let html=await response.text();
      const unlockScript=`<script>(function(){var cards=[].slice.call(document.querySelectorAll('.module-card'));var card=cards.find(function(el){var n=el.querySelector('.module-number');return n&&n.textContent.trim()==='3'});if(!card)return;card.classList.remove('locked');card.classList.add('featured');card.setAttribute('aria-label','Abrir Fornecedores e Inteligência de Compra');card.addEventListener('click',function(e){e.preventDefault();e.stopImmediatePropagation();location.href='./module3.html'},true);var title=card.querySelector('strong');var desc=card.querySelector('small');if(title)title.textContent='Fornecedores e inteligência de compra';if(desc)desc.textContent='Cadastro, comparação e oportunidades';})();<\/script>`;
      html=html.replace('</body>',unlockScript+'</body>');
      return new Response(html,{status:200,headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'}})
    })());
    return;
  }
  event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request)));
});