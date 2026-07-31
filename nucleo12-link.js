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
      if(feeIcon)feeIcon.textContent='0,5%';
      if(feeTitle)feeTitle.textContent='Taxa da plataforma — inativa';
      if(feeText)feeText.textContent='0,5% somente sobre operações efetivadas, quando a cobrança for ativada futuramente.';
    }

    let button=document.querySelector('[data-open="platformAdminView"]');
    if(!button){
      button=document.createElement('button');
      button.className='module-card featured';
      button.dataset.open='platformAdminView';
      button.innerHTML='<span class="module-number">12</span><span class="module-icon">⚙️</span><strong>Administração</strong><small>Plataforma e taxas</small>';
      grid.appendChild(button);
    }

    [...grid.querySelectorAll('.module-card')].forEach(card=>{
      const numero=Number(card.querySelector('.module-number')?.textContent);
      if(!numero)return;
      const ativo=numero!==12;
      card.classList.remove('locked');
      card.dataset.status=ativo?'ativo':'inativo';
      let status=card.querySelector('.module-status');
      if(!status){
        status=document.createElement('span');
        status.className='module-status';
        card.appendChild(status);
      }
      status.textContent=ativo?'Ativo':'Inativo';
      status.style.cssText=`display:inline-flex;align-items:center;margin-top:9px;padding:4px 8px;border-radius:999px;font-size:11px;font-weight:700;letter-spacing:.02em;background:${ativo?'#e6f4ea':'#f2f2f2'};color:${ativo?'#1f6b37':'#666'};align-self:flex-start`;
      card.style.opacity=ativo?'1':'.78';
      card.setAttribute('aria-label',`${card.querySelector('strong')?.textContent||'Núcleo'} — ${ativo?'ativo':'inativo por decisão administrativa'}`);
    });

    [...grid.querySelectorAll('.module-card')].sort((a,b)=>{
      const na=Number(a.querySelector('.module-number')?.textContent)||999;
      const nb=Number(b.querySelector('.module-number')?.textContent)||999;
      return na-nb;
    }).forEach(item=>grid.appendChild(item));

    let view=document.getElementById('platformAdminView');
    if(!view){
      view=document.createElement('section');
      view.id='platformAdminView';
      view.className='view';
      view.innerHTML='<div class="module-header"><button class="back-button" id="nucleo12Voltar">←</button><div><p class="eyebrow">Núcleo 12</p><h1>Administração da Plataforma e Taxas</h1></div></div><section class="summary-card"><div class="card-heading"><div><p class="eyebrow light">Status do módulo</p><h2>Inativo por decisão administrativa</h2></div><span class="status-dot">Sem cobrança</span></div><p style="margin:18px 0 0;line-height:1.6">Este núcleo permanece no sistema, preparado para ativação futura.</p><div class="metrics-grid" style="margin-top:18px"><article><span>Taxa futura</span><strong>0,5%</strong></article><article><span>Cobrança atual</span><strong>Desativada</strong></article><article><span>Operações consideradas</span><strong>Somente efetivadas</strong></article><article><span>Impacto atual</span><strong>Nenhum</strong></article></div><p class="muted" style="margin-top:18px">Nenhuma compra, venda ou resultado atual gera cobrança da plataforma.</p></section>';
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