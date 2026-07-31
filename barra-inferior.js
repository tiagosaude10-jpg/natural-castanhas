(()=>{
  const USER_NAME='Tiago Pereira de Albuquerque';

  function instalarBarraInferior(){
    const main=document.querySelector('main.app-shell');
    const nav=document.querySelector('.bottom-nav');
    if(!main||!nav)return;

    const abrirTela=id=>{
      const target=document.getElementById(id);
      if(!target)return;
      document.querySelectorAll('.view').forEach(view=>view.classList.toggle('active',view===target));
      nav.querySelectorAll('button').forEach(button=>button.classList.toggle('active',button.dataset.open===id));
      window.scrollTo({top:0,behavior:'smooth'});
    };

    const criarTela=(id,html)=>{
      let tela=document.getElementById(id);
      if(!tela){
        tela=document.createElement('section');
        tela.id=id;
        tela.className='view';
        tela.innerHTML=html;
        main.appendChild(tela);
      }
      return tela;
    };

    criarTela('noticesView',`<div class="module-header"><button class="back-button" data-bottom-back>←</button><div><p class="eyebrow">Central de avisos</p><h1>Avisos</h1></div></div><section class="summary-card"><div class="card-heading"><div><p class="eyebrow light">Acompanhamento</p><h2>Pendências da operação</h2></div><span class="status-dot">Ativo</span></div><div class="metrics-grid" style="margin-top:18px"><article><span>Compras em aberto</span><strong id="noticeOpenPurchases">0</strong></article><article><span>Pagamentos pendentes</span><strong id="noticePendingPayments">0</strong></article><article><span>Entregas em andamento</span><strong id="noticeDeliveries">0</strong></article><article><span>Alertas críticos</span><strong>0</strong></article></div><p class="muted" style="margin-top:18px">Os avisos serão atualizados automaticamente conforme as operações forem registradas nos núcleos.</p></section>`);

    criarTela('shortcutsView',`<div class="module-header"><button class="back-button" data-bottom-back>←</button><div><p class="eyebrow">Acesso rápido</p><h1>Atalhos</h1></div></div><section class="module-grid" id="shortcutGrid"><button class="module-card featured" data-shortcut="purchasesView"><span class="module-icon">🛒</span><strong>Nova compra</strong><small>Abrir Núcleo 1</small></button><button class="module-card featured" data-shortcut="capitalView"><span class="module-icon">💵</span><strong>Movimentar capital</strong><small>Abrir Núcleo 2</small></button><button class="module-card featured" data-shortcut="salesView"><span class="module-icon">💰</span><strong>Nova venda</strong><small>Abrir Núcleo 5</small></button><button class="module-card featured" data-shortcut="homeView"><span class="module-icon">▦</span><strong>Todos os núcleos</strong><small>Voltar ao painel</small></button></section>`);

    criarTela('profileView',`<div class="module-header"><button class="back-button" data-bottom-back>←</button><div><p class="eyebrow">Conta do usuário</p><h1>Perfil</h1></div></div><section class="summary-card"><div class="card-heading"><div><p class="eyebrow light">Usuário atual</p><h2>${USER_NAME}</h2></div><span class="status-dot">Administrador</span></div><div class="metrics-grid" style="margin-top:18px"><article><span>Empresa</span><strong>Natural Castanhas</strong></article><article><span>Perfil de acesso</span><strong>Administrador</strong></article><article><span>Status</span><strong>Ativo</strong></article><article><span>Sincronização</span><strong>Local</strong></article></div><p class="muted" style="margin-top:18px">O nome será vinculado dinamicamente ao usuário autenticado quando a etapa exclusiva de login for consolidada.</p></section>`);

    const configurarBotao=(indice,id)=>{
      const antigo=nav.children[indice];
      if(!antigo)return;
      const novo=antigo.cloneNode(true);
      novo.classList.remove('locked');
      novo.dataset.open=id;
      novo.onclick=()=>abrirTela(id);
      antigo.replaceWith(novo);
    };

    configurarBotao(1,'noticesView');
    configurarBotao(3,'shortcutsView');
    configurarBotao(4,'profileView');

    document.querySelectorAll('[data-bottom-back]').forEach(button=>button.onclick=()=>abrirTela('homeView'));
    document.querySelectorAll('[data-shortcut]').forEach(button=>button.onclick=()=>abrirTela(button.dataset.shortcut));

    const atualizarAvisos=()=>{
      try{
        const compras=JSON.parse(localStorage.getItem('naturalCastanhasPurchases')||'[]');
        const validas=compras.filter(compra=>compra.status!=='Cancelada');
        const abertas=validas.filter(compra=>compra.status!=='Finalizada').length;
        const pendentes=validas.filter(compra=>{
          const total=Number(compra.total||Number(compra.quantity||0)*Number(compra.unitPrice||0));
          const pago=(compra.payments||[]).reduce((soma,pagamento)=>soma+Number(pagamento.amount||0),0);
          return pago<total;
        }).length;
        const entregas=validas.filter(compra=>{
          const recebido=(compra.receipts||[]).reduce((soma,entrada)=>soma+Number(entrada.received||0),0);
          return recebido<Number(compra.quantity||0);
        }).length;
        const open=document.getElementById('noticeOpenPurchases');
        const pending=document.getElementById('noticePendingPayments');
        const delivery=document.getElementById('noticeDeliveries');
        if(open)open.textContent=abertas;
        if(pending)pending.textContent=pendentes;
        if(delivery)delivery.textContent=entregas;
      }catch(error){console.warn('Não foi possível atualizar os avisos.',error)}
    };

    atualizarAvisos();
    window.addEventListener('storage',atualizarAvisos);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',instalarBarraInferior,{once:true});
  else instalarBarraInferior();
})();