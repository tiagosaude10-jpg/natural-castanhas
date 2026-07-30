(()=>{
  const CARD_SELECTOR='[data-nucleo="10"]';

  function addNucleo10(){
    const grid=document.querySelector('.module-grid');
    if(!grid)return false;

    let card=grid.querySelector(CARD_SELECTOR);
    if(!card){
      card=document.createElement('button');
      card.type='button';
      card.className='module-card featured';
      card.dataset.nucleo='10';
      card.innerHTML='<span class="module-number">10</span><span class="module-icon">📄</span><strong>Documentos</strong><small>Contratos e conformidade</small>';
      grid.appendChild(card);
    }

    card.classList.remove('locked');
    card.onclick=event=>{
      event.preventDefault();
      event.stopPropagation();
      window.location.assign('./nucleo-10-documentos.html?v=17');
    };
    return true;
  }

  function keepCardVisible(){
    addNucleo10();
    const observer=new MutationObserver(()=>addNucleo10());
    observer.observe(document.documentElement,{childList:true,subtree:true});
    setTimeout(addNucleo10,250);
    setTimeout(addNucleo10,1000);
    setTimeout(addNucleo10,2500);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',keepCardVisible,{once:true});
  else keepCardVisible();
  window.addEventListener('pageshow',addNucleo10);
})();