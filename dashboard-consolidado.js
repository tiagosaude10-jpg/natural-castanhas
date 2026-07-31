(()=>{
  'use strict';

  const USER_NAME='Tiago Pereira de Albuquerque';
  const USER_INITIALS='TP';
  const MODULES=[
    {number:1,title:'Compras',subtitle:'Negociação e recebimento',icon:'🛒',target:'purchasesView'},
    {number:2,title:'Capital',subtitle:'Investidores e extrato',icon:'👥',target:'capitalView'},
    {number:3,title:'Fornecedores',subtitle:'Mercado e inteligência',icon:'📈',target:'suppliersView'},
    {number:4,title:'Estoque',subtitle:'Lotes e rastreabilidade',icon:'📦',target:'stockView'},
    {number:5,title:'Vendas e clientes',subtitle:'Pedidos, reservas e margem',icon:'💰',target:'salesView'},
    {number:6,title:'Financeiro',subtitle:'Fluxo de caixa e conciliação',icon:'👛',target:'financeView'},
    {number:7,title:'Resultados',subtitle:'Participações e distribuições',icon:'📊',target:'resultsView'},
    {number:8,title:'Transporte e logística',subtitle:'Coletas, rotas e entregas',icon:'🚚',target:'logisticsView'},
    {number:9,title:'Inteligência gerencial',subtitle:'Relatórios e indicadores',icon:'📉',target:'reportsView'},
    {number:10,title:'Documentos',subtitle:'Contratos e conformidade',icon:'📄',target:'documentsView'},
    {number:11,title:'Usuários e segurança',subtitle:'Perfis, permissões e auditoria',icon:'🔐',target:'usersView'},
    {number:12,title:'Administração',subtitle:'Plataforma e taxas',icon:'⚙️',target:'platformAdminView',inactive:true}
  ];

  const $=(selector,root=document)=>root.querySelector(selector);
  const $$=(selector,root=document)=>[...root.querySelectorAll(selector)];

  function openView(id){
    const target=document.getElementById(id);
    if(!target){showToast('Este núcleo está preservado, mas sua tela ainda não foi localizada.');return;}
    $$('.view').forEach(view=>view.classList.toggle('active',view===target));
    $$('.bottom-nav button').forEach(button=>button.classList.toggle('active',button.dataset.open===id));
    window.scrollTo({top:0,behavior:'smooth'});
  }

  function showToast(message){
    const toast=$('#toast');
    if(!toast)return;
    toast.textContent=message;
    toast.classList.add('show');
    window.clearTimeout(showToast.timer);
    showToast.timer=window.setTimeout(()=>toast.classList.remove('show'),2400);
  }

  function setUser(){
    const title=$('#homeView .welcome-row h1');
    const avatar=$('#homeView .welcome-row .avatar');
    if(title)title.textContent=`Olá, ${USER_NAME}!`;
    if(avatar)avatar.textContent=USER_INITIALS;
    $$('#profileView h2').forEach(node=>node.textContent=USER_NAME);
  }

  function findExistingCard(number){
    return $$('.module-card').find(card=>Number($('.module-number',card)?.textContent)===number);
  }

  function createPlaceholderView(module){
    if(document.getElementById(module.target))return;
    const main=$('main.app-shell');
    if(!main)return;
    const section=document.createElement('section');
    section.id=module.target;
    section.className='view';
    section.innerHTML=`<div class="module-header"><button class="back-button" type="button">←</button><div><p class="eyebrow">Núcleo ${module.number}</p><h1>${module.title}</h1></div></div><section class="summary-card"><div class="card-heading"><div><p class="eyebrow light">Estrutura preservada</p><h2>${module.inactive?'Inativo por decisão administrativa':'Núcleo disponível no sistema'}</h2></div><span class="status-dot">${module.inactive?'Inativo':'Ativo'}</span></div><p style="margin-top:18px;line-height:1.6">${module.inactive?'A taxa permanece desativada. Quando ativada futuramente, será de 0,5% somente sobre operações efetivadas.':'Os dados, formulários e cálculos já existentes permanecem preservados. Esta tela será conectada ao controlador específico do núcleo sem alterar a página principal.'}</p></section>`;
    $('.back-button',section).addEventListener('click',()=>openView('homeView'));
    main.appendChild(section);
  }

  function normalizeModules(){
    const grid=$('#homeView .module-grid');
    if(!grid)return;

    MODULES.forEach(module=>{
      let card=findExistingCard(module.number);
      if(!card){
        card=document.createElement('button');
        card.type='button';
        card.className='module-card';
        card.innerHTML=`<span class="module-number">${module.number}</span><span class="module-icon">${module.icon}</span><strong>${module.title}</strong><small>${module.subtitle}</small>`;
        grid.appendChild(card);
      }
      card.classList.remove('locked');
      card.dataset.open=module.target;
      card.dataset.status=module.inactive?'inativo':'ativo';
      card.disabled=false;
      card.onclick=module.inactive?()=>openView(module.target):()=>openView(module.target);
      let status=$('.module-status',card);
      if(!status){status=document.createElement('span');status.className='module-status';card.appendChild(status);}
      status.textContent=module.inactive?'Inativo':'Ativo';
      card.setAttribute('aria-label',`${module.title} — ${module.inactive?'inativo por decisão administrativa':'ativo'}`);
      createPlaceholderView(module);
    });

    MODULES.map(module=>findExistingCard(module.number)).filter(Boolean).forEach(card=>grid.appendChild(card));
  }

  function setFee(){
    const card=$('.fee-card');
    if(!card)return;
    const icon=$('.fee-icon',card),title=$('strong',card),text=$('p',card);
    if(icon)icon.textContent='0,5%';
    if(title)title.textContent='Taxa da plataforma — inativa';
    if(text)text.textContent='0,5% somente sobre operações efetivadas, quando a cobrança for ativada futuramente.';
  }

  function configureBottomNav(){
    const nav=$('.bottom-nav');
    if(!nav)return;
    const buttons=$$('button',nav);
    const targets=['homeView','noticesView',null,'shortcutsView','profileView'];
    buttons.forEach((button,index)=>{
      const target=targets[index];
      if(!target)return;
      button.classList.remove('locked');
      button.dataset.open=target;
      button.onclick=()=>openView(target);
    });
  }

  function applyLayout(){
    if(document.getElementById('dashboard-consolidado-style'))return;
    const style=document.createElement('style');
    style.id='dashboard-consolidado-style';
    style.textContent=`html,body{min-height:100%;height:auto;overflow-x:hidden;overflow-y:auto}body{padding-bottom:calc(92px + env(safe-area-inset-bottom))}.app-shell{height:auto!important;min-height:calc(100vh - 100px);overflow:visible!important;padding-bottom:36px}.view.active{height:auto;min-height:0;overflow:visible}.module-grid{height:auto!important;max-height:none!important;overflow:visible!important;align-content:start;padding-bottom:24px}.module-card{visibility:visible;opacity:1}.module-card[data-status="inativo"]{opacity:.72}.module-status{display:inline-flex;align-items:center;margin-top:9px;padding:4px 8px;border-radius:999px;font-size:11px;font-weight:700;background:#e6f4ea;color:#1f6b37;align-self:flex-start}.module-card[data-status="inativo"] .module-status{background:#f2f2f2;color:#666}.fee-card{margin-bottom:30px}footer{padding-bottom:calc(92px + env(safe-area-inset-bottom))}@media(max-width:420px){#homeView .module-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}`;
    document.head.appendChild(style);
  }

  function init(){
    applyLayout();
    setUser();
    normalizeModules();
    setFee();
    configureBottomNav();
    document.documentElement.dataset.loadedNuclei='12';
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
  window.addEventListener('load',()=>window.setTimeout(init,100),{once:true});
})();
