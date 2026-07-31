(()=>{
  const APP_VERSION='1.0.0';
  const main=document.querySelector('main.app-shell');
  const home=document.getElementById('homeView');
  if(!main||!home)return;

  const openView=id=>{
    document.querySelectorAll('.view').forEach(view=>view.classList.toggle('active',view.id===id));
    document.querySelectorAll('.bottom-nav button').forEach(button=>button.classList.toggle('active',button.dataset.open===id));
    window.scrollTo({top:0,behavior:'smooth'});
  };

  function installSplash(){
    if(sessionStorage.getItem('naturalCastanhasSplashSeen'))return;
    sessionStorage.setItem('naturalCastanhasSplashSeen','1');
    const splash=document.createElement('div');
    splash.id='ncSplash';
    splash.innerHTML=`<div style="text-align:center"><img src="141FEC0C-C074-45A3-84B5-4538207A5C5E.png" alt="Natural Castanhas" style="width:112px;height:112px;border-radius:26px;object-fit:cover;box-shadow:0 14px 35px rgba(0,0,0,.25)"><h1 style="margin:18px 0 6px;color:#fff;font-size:28px">Natural Castanhas</h1><p style="margin:0;color:rgba(255,255,255,.82)">Gestão integrada da operação</p></div>`;
    Object.assign(splash.style,{position:'fixed',inset:'0',zIndex:'99999',display:'grid',placeItems:'center',background:'linear-gradient(160deg,#163d20,#2e6a35)',transition:'opacity .35s ease'});
    document.body.appendChild(splash);
    setTimeout(()=>{splash.style.opacity='0';setTimeout(()=>splash.remove(),380)},850);
  }

  function enhanceHome(){
    const eyebrow=home.querySelector('.welcome-row .eyebrow');
    if(eyebrow)eyebrow.textContent='Núcleo 0 — Central do aplicativo';

    let status=document.getElementById('nucleo0Status');
    if(!status){
      status=document.createElement('section');
      status.id='nucleo0Status';
      status.className='capital-summary';
      status.style.marginBottom='18px';
      status.innerHTML=`<article><span>Conexão</span><strong id="ncConnection">Verificando</strong></article><article><span>Sincronização</span><strong id="ncSync">Local protegida</strong></article><article><span>Versão</span><strong>v${APP_VERSION}</strong></article><article><span>Núcleos</span><strong>11 ativos · 1 inativo</strong></article>`;
      const summary=home.querySelector('.summary-card');
      summary?.insertAdjacentElement('afterend',status);
    }

    const title=home.querySelector('.section-title-row h2');
    if(title)title.textContent='Núcleos 1 a 12';
  }

  function createSettings(){
    if(document.getElementById('settingsView'))return;
    const view=document.createElement('section');
    view.id='settingsView';
    view.className='view';
    view.innerHTML=`<div class="module-header"><button class="back-button" id="settingsBack">←</button><div><p class="eyebrow">Núcleo 0</p><h1>Configurações do aplicativo</h1></div></div><section class="summary-card"><div class="card-heading"><div><p class="eyebrow light">Natural Castanhas</p><h2>Informações do sistema</h2></div><span class="status-dot">v${APP_VERSION}</span></div><div class="metrics-grid" style="margin-top:18px"><article><span>Empresa</span><strong>Natural Castanhas</strong></article><article><span>Usuário atual</span><strong>Hélio</strong></article><article><span>Perfil</span><strong>Administrador</strong></article><article><span>Armazenamento</span><strong>Local com backup</strong></article></div></section><section class="summary-card" style="margin-top:18px"><div class="card-heading"><div><p class="eyebrow light">Instalação</p><h2>Aplicativo no celular</h2></div><span class="status-dot" id="installStatus">Verificando</span></div><p style="margin:18px 0;line-height:1.55">O Natural Castanhas pode ser instalado no Android e no iPhone como aplicativo, mantendo o mesmo ícone e abrindo em tela cheia.</p><button class="primary-button" id="installAppButton">Instalar aplicativo</button><p class="muted" id="installHelp" style="margin-top:12px"></p></section><section class="summary-card" style="margin-top:18px"><div class="card-heading"><div><p class="eyebrow light">Situação dos módulos</p><h2>Controle dos núcleos</h2></div></div><div class="metrics-grid" style="margin-top:18px"><article><span>Núcleos 1 a 11</span><strong>Ativos</strong></article><article><span>Núcleo 12</span><strong>Inativo</strong></article><article><span>Taxa atual</span><strong>Sem cobrança</strong></article><article><span>Taxa futura</span><strong>0,5%</strong></article></div></section>`;
    main.appendChild(view);
    document.getElementById('settingsBack').onclick=()=>openView('homeView');
  }

  function addSettingsAccess(){
    const profile=document.getElementById('profileView');
    if(!profile||document.getElementById('openSettingsButton'))return;
    const button=document.createElement('button');
    button.id='openSettingsButton';
    button.className='primary-button';
    button.style.marginTop='18px';
    button.textContent='⚙ Abrir configurações';
    button.onclick=()=>openView('settingsView');
    profile.appendChild(button);
  }

  function setupConnection(){
    const update=()=>{
      const connected=navigator.onLine;
      const element=document.getElementById('ncConnection');
      if(element)element.textContent=connected?'Online':'Offline';
      const sync=document.getElementById('ncSync');
      if(sync)sync.textContent=connected?'Local · nuvem preparada':'Local · sem internet';
    };
    window.addEventListener('online',update);
    window.addEventListener('offline',update);
    update();
  }

  function setupInstall(){
    let deferredPrompt=null;
    const button=document.getElementById('installAppButton');
    const status=document.getElementById('installStatus');
    const help=document.getElementById('installHelp');
    const standalone=window.matchMedia('(display-mode: standalone)').matches||window.navigator.standalone===true;
    if(standalone){status.textContent='Instalado';button.disabled=true;button.textContent='Aplicativo já instalado';help.textContent='O aplicativo está sendo executado no modo instalado.';return}
    const isiOS=/iphone|ipad|ipod/i.test(navigator.userAgent);
    if(isiOS){status.textContent='Disponível';help.textContent='No iPhone: toque em Compartilhar e depois em “Adicionar à Tela de Início”.';button.onclick=()=>alert('No iPhone, toque no botão Compartilhar do Safari e escolha “Adicionar à Tela de Início”.');return}
    help.textContent='No Android, o botão de instalação será liberado quando o navegador disponibilizar a instalação.';
    window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();deferredPrompt=event;status.textContent='Disponível';button.disabled=false});
    button.onclick=async()=>{if(!deferredPrompt)return alert('Abra o menu do navegador e escolha “Instalar aplicativo” ou “Adicionar à tela inicial”.');deferredPrompt.prompt();await deferredPrompt.userChoice;deferredPrompt=null};
  }

  function tagModuleStates(){
    document.querySelectorAll('.module-grid .module-card').forEach(card=>{
      const number=Number(card.querySelector('.module-number')?.textContent||0);
      if(!number)return;
      card.dataset.status=number===12?'inativo':'ativo';
      card.setAttribute('aria-label',`${card.textContent.trim()} — ${number===12?'inativo':'ativo'}`);
    });
  }

  installSplash();
  enhanceHome();
  createSettings();
  setupConnection();
  tagModuleStates();
  setTimeout(()=>{addSettingsAccess();setupInstall()},250);
})();