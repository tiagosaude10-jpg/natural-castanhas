(()=>{
  const USERS_KEY='naturalCastanhasAuthUsersV1';
  const SESSION_KEY='naturalCastanhasAuthSessionV1';
  const PENDING_KEY='naturalCastanhasPendingUsersV1';
  const FIXED_ADMINS=[
    {id:'tiago',name:'Tiago Pereira de Albuquerque',role:'Administrador',approved:true,canApprove:true,fixed:true,protected:true},
    {id:'helio',name:'Hélio da Silva Pereira',role:'Administrador',approved:true,canApprove:true,fixed:true,protected:true}
  ];
  const encoder=new TextEncoder();
  const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const read=(key,fallback=[])=>{try{return JSON.parse(localStorage.getItem(key)||JSON.stringify(fallback))}catch(error){return fallback}};
  const write=(key,value)=>localStorage.setItem(key,JSON.stringify(value));
  const getUsers=()=>read(USERS_KEY,[]);
  const setUsers=users=>write(USERS_KEY,users);
  const getSession=()=>{try{return JSON.parse(sessionStorage.getItem(SESSION_KEY)||'null')}catch(error){return null}};
  const setSession=userId=>sessionStorage.setItem(SESSION_KEY,JSON.stringify({userId,createdAt:new Date().toISOString()}));
  const hash=async text=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',encoder.encode(text)))).map(byte=>byte.toString(16).padStart(2,'0')).join('');
  const createSalt=()=>Array.from(crypto.getRandomValues(new Uint32Array(4))).join('-');

  function seedFixedAdmins(){
    const users=getUsers();
    FIXED_ADMINS.forEach(admin=>{
      let current=users.find(user=>user.id===admin.id);
      if(!current){
        current={...admin,status:'Pré-cadastrado',activated:false,passwordHash:'',salt:'',createdAt:new Date().toISOString()};
        users.unshift(current);
      }else{
        const credentials={activated:Boolean(current.activated),passwordHash:current.passwordHash||'',salt:current.salt||''};
        Object.assign(current,admin,credentials,{status:credentials.activated?'Ativo':'Pré-cadastrado'});
      }
    });
    setUsers(users.filter((user,index,array)=>array.findIndex(item=>item.id===user.id)===index));
  }

  function currentUser(){
    const session=getSession();
    return session?getUsers().find(user=>user.id===session.userId&&user.activated&&user.status!=='Bloqueado')||null:null;
  }

  function applyIdentity(user){
    document.documentElement.dataset.authenticated='true';
    window.NaturalCastanhasAuth={currentUser:()=>user,logout,getUsers,setUsers};
    document.querySelectorAll('[data-current-user]').forEach(element=>element.textContent=user.name);
    document.querySelectorAll('[data-current-role]').forEach(element=>element.textContent=user.role);
    const welcome=document.querySelector('#homeView .welcome-row h1');
    if(welcome)welcome.textContent=`Olá, ${user.name}!`;
    const avatar=document.querySelector('#homeView .avatar');
    if(avatar)avatar.textContent=user.name.split(/\s+/).slice(0,2).map(part=>part[0]).join('').toUpperCase();
    const profile=document.getElementById('profileView');
    if(profile){
      const title=profile.querySelector('h2');
      if(title)title.textContent=user.name;
      profile.querySelectorAll('strong').forEach(element=>{
        if(['Administrador Geral','Administrador proprietário','Administradores proprietários'].includes(element.textContent.trim()))element.textContent='Administrador';
      });
    }
    document.dispatchEvent(new CustomEvent('nc-auth-ready',{detail:user}));
  }

  function logout(){sessionStorage.removeItem(SESSION_KEY);location.reload()}

  function installStyle(){
    if(document.getElementById('auth-style'))return;
    const style=document.createElement('style');
    style.id='auth-style';
    style.textContent=`#authGate{position:fixed;inset:0;z-index:100000;background:linear-gradient(160deg,#163d20,#2e6a35);display:grid;place-items:center;padding:20px;overflow:auto}.auth-card{width:min(100%,430px);background:#fff;border-radius:24px;padding:24px;box-shadow:0 24px 60px rgba(0,0,0,.28)}.auth-logo{width:82px;height:82px;border-radius:20px;object-fit:cover;display:block;margin:0 auto 14px}.auth-card h1,.auth-card h2{text-align:center;margin:8px 0}.auth-card p{color:#68736a;line-height:1.5}.auth-tabs{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:18px 0}.auth-tabs button,.auth-submit,.auth-link{border:0;border-radius:12px;padding:12px;font-weight:800}.auth-tabs button{background:#eef3ef;color:#24552a}.auth-tabs button.active,.auth-submit{background:#24552a;color:#fff}.auth-form{display:grid;gap:12px}.auth-form label{display:grid;gap:6px;font-weight:700}.auth-form input,.auth-form select{border:1px solid #ccd7ce;border-radius:12px;padding:12px;font:inherit;width:100%}.auth-note{background:#fff8df;border:1px solid #eedb9c;border-radius:12px;padding:11px;color:#6b5720;font-size:.9rem}.auth-error{color:#9b2f28;font-weight:700;min-height:20px}.auth-link{background:transparent;color:#24552a}.auth-actions{display:flex;gap:8px;flex-wrap:wrap}.auth-actions>*{flex:1}`;
    document.head.appendChild(style);
  }

  function showGate(){
    installStyle();
    const root=document.createElement('div');
    root.id='authGate';
    root.innerHTML=`<div class="auth-card"><img class="auth-logo" src="141FEC0C-C074-45A3-84B5-4538207A5C5E.png" alt="Natural Castanhas"><h1>Natural Castanhas</h1><p style="text-align:center">Acesso administrativo seguro</p><div class="auth-tabs"><button class="active" data-tab="login">Entrar</button><button data-tab="register">Primeiro cadastro</button></div><div id="authContent"></div></div>`;
    document.body.appendChild(root);
    root.querySelectorAll('[data-tab]').forEach(button=>button.onclick=()=>{
      root.querySelectorAll('[data-tab]').forEach(item=>item.classList.toggle('active',item===button));
      render(button.dataset.tab);
    });
    render('login');
  }

  function render(tab){
    const content=document.getElementById('authContent');
    if(tab==='register')return renderRegister(content);
    const users=getUsers();
    content.innerHTML=`<form id="loginForm" class="auth-form"><label>Usuário<select name="userId" required><option value="">Selecione</option>${users.filter(user=>user.activated&&user.status!=='Bloqueado').map(user=>`<option value="${esc(user.id)}">${esc(user.name)}</option>`).join('')}</select></label><label>Senha<input name="password" type="password" minlength="6" required autocomplete="current-password"></label><div class="auth-error" id="loginError"></div><button class="auth-submit">Entrar</button><button type="button" class="auth-link" id="activateAccess">Ativar primeiro acesso</button></form>`;
    document.getElementById('loginForm').onsubmit=login;
    document.getElementById('activateAccess').onclick=()=>renderActivate(content);
  }

  function renderActivate(content){
    const users=getUsers().filter(user=>user.approved&&!user.activated&&user.status!=='Recusado');
    content.innerHTML=`<form id="activateForm" class="auth-form"><h2>Ativar primeiro acesso</h2><div class="auth-note">Tiago e Hélio possuem contas administrativas independentes e não precisam aprovar um ao outro. Cada um cria sua própria senha neste aparelho.</div><label>Conta<select name="userId" required><option value="">Selecione</option>${users.map(user=>`<option value="${esc(user.id)}">${esc(user.name)} — ${esc(user.role)}</option>`).join('')}</select></label><label>Criar senha<input name="password" type="password" minlength="6" required></label><label>Confirmar senha<input name="confirm" type="password" minlength="6" required></label><div class="auth-error" id="activateError"></div><div class="auth-actions"><button class="auth-submit">Ativar conta</button><button type="button" class="auth-link" id="backLogin">Voltar</button></div></form>`;
    document.getElementById('backLogin').onclick=()=>render('login');
    document.getElementById('activateForm').onsubmit=activate;
  }

  async function activate(event){
    event.preventDefault();
    const data=new FormData(event.currentTarget);
    const password=String(data.get('password')||'');
    const confirm=String(data.get('confirm')||'');
    const error=document.getElementById('activateError');
    if(password!==confirm)return error.textContent='As senhas não coincidem.';
    const users=getUsers();
    const user=users.find(item=>item.id===data.get('userId'));
    if(!user||!user.approved||user.activated)return error.textContent='Conta indisponível para ativação.';
    user.salt=createSalt();
    user.passwordHash=await hash(user.salt+password);
    user.activated=true;
    user.status='Ativo';
    user.updatedAt=new Date().toISOString();
    setUsers(users);
    setSession(user.id);
    document.getElementById('authGate')?.remove();
    applyIdentity(user);
  }

  async function login(event){
    event.preventDefault();
    const data=new FormData(event.currentTarget);
    const user=getUsers().find(item=>item.id===data.get('userId'));
    const error=document.getElementById('loginError');
    if(!user)return error.textContent='Selecione um usuário.';
    if(!user.activated)return error.textContent='Ative o primeiro acesso desta conta.';
    if(user.status==='Bloqueado')return error.textContent='Este acesso está bloqueado.';
    const calculated=await hash(user.salt+String(data.get('password')||''));
    if(calculated!==user.passwordHash)return error.textContent='Senha incorreta.';
    setSession(user.id);
    document.getElementById('authGate')?.remove();
    applyIdentity(user);
  }

  function renderRegister(content){
    const roles=['Administrador','Compras','Capital e Investidores','Fornecedores','Estoque','Vendas','Financeiro','Resultados','Logística','Relatórios','Documentos e Conformidade','Consulta'];
    content.innerHTML=`<form id="registerForm" class="auth-form"><h2>Solicitar acesso</h2><label>Nome completo<input name="name" required></label><label>Telefone<input name="phone" required></label><label>E-mail<input name="email" type="email"></label><label>Perfil solicitado<select name="role">${roles.map(role=>`<option>${role}</option>`).join('')}</select></label><div class="auth-note">Novos usuários continuam dependendo da aprovação de Tiago ou Hélio. Essa regra não se aplica às duas contas administrativas fixas.</div><div class="auth-error" id="registerError"></div><button class="auth-submit">Enviar cadastro</button></form>`;
    document.getElementById('registerForm').onsubmit=event=>{
      event.preventDefault();
      const data=new FormData(event.currentTarget);
      const pending=read(PENDING_KEY,[]);
      pending.push({id:String(Date.now()),name:String(data.get('name')).trim(),phone:String(data.get('phone')).trim(),email:String(data.get('email')).trim(),requestedRole:data.get('role'),status:'Aguardando aprovação',createdAt:new Date().toISOString()});
      write(PENDING_KEY,pending);
      document.dispatchEvent(new Event('nc-pending-updated'));
      const message=document.getElementById('registerError');
      message.style.color='#24552a';
      message.textContent='Cadastro enviado. Aguarde a aprovação de um administrador.';
      event.currentTarget.reset();
    };
  }

  function addAccountControls(){
    const profile=document.getElementById('profileView');
    if(!profile||document.getElementById('authAccountControls'))return;
    const box=document.createElement('section');
    box.id='authAccountControls';
    box.className='summary-card';
    box.style.marginTop='18px';
    box.innerHTML=`<div class="card-heading"><div><p class="eyebrow light">Segurança da conta</p><h2>Senha e sessão</h2></div></div><div class="dual-actions" style="margin-top:16px"><button class="primary-button" id="changePasswordButton">Trocar senha</button><button class="secondary-button wide" id="logoutButton">Sair da conta</button></div>`;
    profile.appendChild(box);
    document.getElementById('logoutButton').onclick=logout;
    document.getElementById('changePasswordButton').onclick=changePassword;
  }

  async function changePassword(){
    const user=currentUser();
    if(!user)return;
    const current=prompt('Digite a senha atual:');
    if(current===null)return;
    if(await hash(user.salt+current)!==user.passwordHash)return alert('Senha atual incorreta.');
    const next=prompt('Digite a nova senha com pelo menos 6 caracteres:');
    if(!next||next.length<6)return alert('A nova senha precisa ter pelo menos 6 caracteres.');
    const confirmation=prompt('Confirme a nova senha:');
    if(next!==confirmation)return alert('As senhas não coincidem.');
    const users=getUsers();
    const target=users.find(item=>item.id===user.id);
    target.salt=createSalt();
    target.passwordHash=await hash(target.salt+next);
    target.updatedAt=new Date().toISOString();
    setUsers(users);
    alert('Senha alterada com sucesso.');
  }

  function init(){
    seedFixedAdmins();
    const user=currentUser();
    if(user)applyIdentity(user);else showGate();
    setTimeout(addAccountControls,500);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
