(()=>{
  const USERS_KEY='naturalCastanhasAuthUsersV1';
  const SESSION_KEY='naturalCastanhasAuthSessionV1';
  const encoder=new TextEncoder();

  const users=()=>{
    try{return JSON.parse(localStorage.getItem(USERS_KEY)||'[]')}catch(error){return []}
  };
  const digest=async text=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',encoder.encode(text)))).map(byte=>byte.toString(16).padStart(2,'0')).join('');
  const message=(form,text)=>{
    let area=form.querySelector('#loginError,.auth-error');
    if(!area){area=document.createElement('div');area.className='auth-error';form.querySelector('button[type="submit"],button:not([type])')?.insertAdjacentElement('beforebegin',area)}
    area.textContent=text;
  };

  async function authenticate(form){
    if(form.dataset.authProcessing==='1')return;
    form.dataset.authProcessing='1';
    try{
      const data=new FormData(form);
      const id=String(data.get('userId')||'');
      const password=String(data.get('password')||'');
      const user=users().find(item=>item.id===id);
      if(!user)return message(form,'Selecione o usuário para entrar.');
      if(!user.activated)return message(form,'Este acesso ainda precisa ser ativado. Toque em “Ativar acesso aprovado”.');
      if(user.status==='Bloqueado')return message(form,'Este acesso está bloqueado.');
      if(!password)return message(form,'Digite sua senha.');
      if(!user.salt||!user.passwordHash)return message(form,'A senha desta conta precisa ser criada novamente em “Ativar acesso aprovado”.');
      const calculated=await digest(user.salt+password);
      if(calculated!==user.passwordHash)return message(form,'Senha incorreta. Confira letras maiúsculas e minúsculas.');
      sessionStorage.setItem(SESSION_KEY,JSON.stringify({userId:user.id,createdAt:new Date().toISOString()}));
      const gate=document.getElementById('authGate');
      if(gate)gate.remove();
      if(window.NaturalCastanhasAuth?.currentUser){location.reload();return}
      document.documentElement.dataset.authenticated='true';
      document.dispatchEvent(new CustomEvent('nc-auth-ready',{detail:user}));
      location.reload();
    }catch(error){
      console.error('Falha crítica no login',error);
      message(form,'Não foi possível entrar. Feche o aplicativo, abra novamente e tente outra vez.');
    }finally{
      form.dataset.authProcessing='0';
    }
  }

  document.addEventListener('submit',event=>{
    const form=event.target.closest?.('#loginForm');
    if(!form)return;
    event.preventDefault();
    event.stopImmediatePropagation();
    authenticate(form);
  },true);

  document.addEventListener('click',event=>{
    const button=event.target.closest?.('#loginForm button[type="submit"],#loginForm .auth-submit');
    if(!button)return;
    event.preventDefault();
    const form=button.closest('#loginForm');
    if(form)authenticate(form);
  },true);
})();
