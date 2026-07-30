(()=>{
  function instalarNucleo12(){
    const grid=document.querySelector('.module-grid');
    const main=document.querySelector('main.app-shell');
    if(!grid||!main)return;

    const feeCard=document.querySelector('.fee-card');
    if(feeCard){
      const feeIcon=feeCard.querySelector('.fee-icon');
      const feeTitle=feeCard.querySelector('strong');
      const feeText=feeCard.querySelector('p');
      if(feeIcon)feeIcon.textContent='👥';
      if(feeTitle)feeTitle.textContent='A importância do uso do aplicativo';
      if(feeText)feeText.textContent='Utilizar o aplicativo garante mais controle, agilidade e segurança em todas as operações, permitindo decisões mais assertivas e melhores resultados para o seu negócio.';
    }

    let button=document.querySelector('[data-open="platformAdminView"]');
    if(!button){
      button=document.createElement('button');
      button.className='module-card featured';
      button.dataset.open='platformAdminView';
      button.innerHTML='<span class="module-number">12</span><span class="module-icon">⚙️</span><strong>Administração</strong><small>Plataforma e taxas</small>';
      grid.appendChild(button);
    }

    let view=document.getElementById('platformAdminView');
    if(!view){
      view=document.createElement('section');
      view.id='platformAdminView';
      view.className='view';
      view.innerHTML='<div class="module-header"><button class="back-button" id="nucleo12Voltar">←</button><div><p class="eyebrow">Núcleo 12</p><h1>Administração da Plataforma e Taxas</h1></div></div><section class="summary-card"><div class="card-heading"><div><p class="eyebrow light">Status do módulo</p><h2>Inativo por enquanto</h2></div><span class="status-dot">Em breve</span></div><p style="margin:18px 0 0;line-height:1.6">Este núcleo já está preparado para a futura administração comercial da plataforma Natural Castanhas.</p><div class="metrics-grid" style="margin-top:18px"><article><span>Taxa futura</span><strong>0,5%</strong></article><article><span>Cobrança atual</span><strong>Desativada</strong></article><article><span>Operações consideradas</span><strong>Somente efetivadas</strong></article><article><span>Impacto atual</span><strong>Nenhum</strong></article></div><p class="muted" style="margin-top:18px">Nenhuma compra, venda ou resultado atual está gerando cobrança da plataforma.</p></section>';
      main.appendChild(view);
    }

    const abrir=()=>{
      document.querySelectorAll('.view').forEach(v=>v.classList.toggle('active',v.id==='platformAdminView'));
      window.scrollTo({top:0,behavior:'smooth'});
    };
    const voltar=()=>{
      document.querySelectorAll('.view').forEach(v=>v.classList.toggle('active',v.id==='homeView'));
      window.scrollTo({top:0,behavior:'smooth'});
    };

    button.onclick=abrir;
    const back=document.getElementById('nucleo12Voltar');
    if(back)back.onclick=voltar;
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',instalarNucleo12);
  else instalarNucleo12();
})();