(()=>{
  const MODULES=[
    {n:1,title:'Compras',desc:'Negociação e recebimento',icon:'🛒',view:'purchasesView'},
    {n:2,title:'Capital',desc:'Investidores e extrato',icon:'👥',view:'capitalView'},
    {n:3,title:'Fornecedores',desc:'Mercado e inteligência',icon:'📈'},
    {n:4,title:'Estoque',desc:'Lotes e rastreabilidade',icon:'📦'},
    {n:5,title:'Vendas e clientes',desc:'Pedidos, reservas e margem',icon:'💰',view:'salesView'},
    {n:6,title:'Financeiro',desc:'Contas e fluxo de caixa',icon:'👛'},
    {n:7,title:'Resultados',desc:'Participações e distribuições',icon:'📊'},
    {n:8,title:'Transporte e logística',desc:'Coletas, fretes e entregas',icon:'🚚'},
    {n:9,title:'Relatórios',desc:'Indicadores e inteligência',icon:'📈'},
    {n:10,title:'Documentos',desc:'Contratos e conformidade',icon:'📄'},
    {n:11,title:'Usuários e acessos',desc:'Perfis, permissões e segurança',icon:'🔐'},
    {n:12,title:'Administração',desc:'Plataforma e taxas',icon:'⚙️'}
  ];

  const toast=message=>{
    const el=document.getElementById('toast');
    if(!el)return alert(message);
    el.textContent=message;
    el.classList.add('show');
    setTimeout(()=>el.classList.remove('show'),2400);
  };

  function currentUser(){
    try{
      if(window.NaturalCastanhasAuth?.currentUser)return window.NaturalCastanhasAuth.currentUser();
      const session=JSON.parse(sessionStorage.getItem('naturalCastanhasAuthSessionV1')||'null');
      const users=JSON.parse(localStorage.getItem('naturalCastanhasAuthUsersV1')||'[]');
      return session?users.find(user=>user.id===session.userId)||null:null;
    }catch{return null;}
  }

  function applyIdentity(){
    const user=currentUser();
    if(!user)return;
    const welcome=document.querySelector('#homeView .welcome-row');
    if(!welcome)return;
    const title=welcome.querySelector('h1');
    const avatar=welcome.querySelector('.avatar');
    const firstName=(user.name||'Usuário').trim().split(/\s+/)[0];
    if(title)title.textContent=`Olá, ${firstName}!`;
    if(avatar){
      const initials=(user.name||'U').trim().split(/\s+/).slice(0,2).map(part=>part[0]).join('').toUpperCase();
      avatar.textContent=initials||'U';
    }
  }

  function openView(id){
    document.querySelectorAll('.view').forEach(view=>view.classList.toggle('active',view.id===id));
    document.querySelectorAll('.bottom-nav button').forEach(button=>button.classList.toggle('active',button.dataset.open===id));
    window.scrollTo({top:0,behavior:'smooth'});
  }

  function buildCard(module){
    const button=document.createElement('button');
    button.type='button';
    button.className='module-card';
    if([1,2,5].includes(module.n))button.classList.add('featured');
    button.dataset.module=String(module.n);
    if(module.view)button.dataset.open=module.view;
    button.innerHTML=`<span class="module-number">${module.n}</span><span class="module-icon">${module.icon}</span><strong>${module.title}</strong><small>${module.desc}</small>`;
    button.addEventListener('click',()=>{
      if(module.view&&document.getElementById(module.view))openView(module.view);
      else toast(`Núcleo ${module.n} — ${module.title}: será ativado na etapa correspondente.`);
    });
    return button;
  }

  function rebuildGrid(){
    const grid=document.querySelector('#homeView .module-grid');
    if(!grid)return;
    grid.replaceChildren(...MODULES.map(buildCard));
    grid.dataset.consolidated='true';
  }

  function init(){
    rebuildGrid();
    applyIdentity();
    document.addEventListener('nc-auth-ready',()=>setTimeout(applyIdentity,0));
    setTimeout(()=>{rebuildGrid();applyIdentity();},700);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();