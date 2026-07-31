(()=>{
  if(window.__naturalCastanhasFlowHealthLoaded)return;
  window.__naturalCastanhasFlowHealthLoaded=true;

  const REQUIRED_VIEWS=['homeView','purchasesView','capitalView','salesView'];
  const REQUIRED_FORMS=['purchaseForm','capitalForm','clientForm','saleForm'];
  const STORAGE_KEYS=['naturalCastanhasPurchases','naturalCastanhasInvestors','naturalCastanhasCapital','naturalCastanhasClients','naturalCastanhasSales'];

  function safeArray(key){
    try{
      const value=JSON.parse(localStorage.getItem(key)||'[]');
      return Array.isArray(value);
    }catch(error){
      return false;
    }
  }

  function runChecks(){
    const checks=[];
    REQUIRED_VIEWS.forEach(id=>checks.push({name:`Tela ${id}`,ok:!!document.getElementById(id)}));
    REQUIRED_FORMS.forEach(id=>checks.push({name:`Formulário ${id}`,ok:!!document.getElementById(id)}));
    STORAGE_KEYS.forEach(key=>checks.push({name:`Dados ${key}`,ok:safeArray(key)}));
    checks.push({name:'Navegação inferior',ok:!!document.querySelector('.bottom-nav')});
    checks.push({name:'Ação rápida',ok:!!document.getElementById('quickAdd')});
    checks.push({name:'Backup local',ok:typeof window.naturalCastanhasDataSafety==='object'});

    const failed=checks.filter(check=>!check.ok);
    const result={ok:failed.length===0,total:checks.length,failed,checkedAt:new Date().toISOString()};
    localStorage.setItem('naturalCastanhasLastHealthCheck',JSON.stringify(result));
    renderStatus(result);
    return result;
  }

  function renderStatus(result){
    const profile=document.getElementById('profileView');
    if(!profile)return;
    let card=document.getElementById('systemHealthCard');
    if(!card){
      card=document.createElement('section');
      card.id='systemHealthCard';
      card.className='summary-card';
      card.style.marginTop='18px';
      profile.appendChild(card);
    }
    card.innerHTML=`<div class="card-heading"><div><p class="eyebrow light">Verificação do sistema</p><h2>${result.ok?'Fluxos principais operacionais':'Atenção necessária'}</h2></div><span class="status-dot">${result.ok?'Verificado':'Falha detectada'}</span></div><div class="metrics-grid" style="margin-top:18px"><article><span>Itens verificados</span><strong>${result.total}</strong></article><article><span>Falhas encontradas</span><strong>${result.failed.length}</strong></article></div>${result.failed.length?`<p class="muted" style="margin-top:18px">${result.failed.map(item=>item.name).join(' • ')}</p>`:'<p class="muted" style="margin-top:18px">Compras, capital, vendas, navegação, armazenamento e backup foram localizados corretamente.</p>'}<button class="secondary-button wide" id="runHealthCheck" style="margin-top:16px">Verificar novamente</button>`;
    const button=document.getElementById('runHealthCheck');
    if(button)button.onclick=runChecks;
  }

  const originalSetItem=localStorage.setItem.bind(localStorage);
  localStorage.setItem=function(key,value){
    originalSetItem(key,value);
    if(String(key).startsWith('naturalCastanhas')&&key!=='naturalCastanhasLastHealthCheck'){
      clearTimeout(window.__naturalCastanhasHealthTimer);
      window.__naturalCastanhasHealthTimer=setTimeout(runChecks,250);
    }
  };

  window.addEventListener('error',event=>{
    const errors=JSON.parse(localStorage.getItem('naturalCastanhasRuntimeErrors')||'[]');
    errors.unshift({message:event.message||'Erro não identificado',source:event.filename||'',line:event.lineno||0,createdAt:new Date().toISOString()});
    originalSetItem('naturalCastanhasRuntimeErrors',JSON.stringify(errors.slice(0,20)));
  });

  window.naturalCastanhasRunHealthCheck=runChecks;
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(runChecks,1200));
  else setTimeout(runChecks,1200);
})();