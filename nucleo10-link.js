(()=>{
  function addNucleo10(){
    const grid=document.querySelector('.module-grid');
    if(!grid||grid.querySelector('[data-nucleo="10"]'))return;

    const card=document.createElement('button');
    card.type='button';
    card.className='module-card featured';
    card.dataset.nucleo='10';
    card.innerHTML='<span class="module-number">10</span><span class="module-icon">📄</span><strong>Documentos</strong><small>Contratos e conformidade</small>';
    card.addEventListener('click',()=>{window.location.href='./nucleo-10-documentos.html'});
    grid.appendChild(card);
  }

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',addNucleo10);
  }else{
    addNucleo10();
  }
})();
