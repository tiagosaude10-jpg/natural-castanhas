(()=>{
const USERS_KEY='naturalCastanhasAuthUsersV1';
const MIGRATION_KEY='naturalCastanhasAdminResetEtapa2Aplicado';

function liberarNovaSenhaDoAdministrador(){
  if(localStorage.getItem(MIGRATION_KEY)==='true')return;
  let users=[];
  try{users=JSON.parse(localStorage.getItem(USERS_KEY)||'[]')}catch{users=[]}
  let user=users.find(item=>item.id==='tiago'||String(item.name||'').trim().toLowerCase()==='tiago pereira de albuquerque');
  if(!user){
    user={id:'tiago',name:'Tiago Pereira de Albuquerque'};
    users.push(user);
  }
  Object.assign(user,{
    name:'Tiago Pereira de Albuquerque',
    role:'Administrador Geral',
    approved:true,
    activated:false,
    status:'Redefinição autorizada — aguardando nova senha',
    canApprove:true,
    passwordHash:'',
    salt:'',
    permissions:['Todos os núcleos','Usuários e permissões','Auditoria','Configurações'],
    passwordResetAuthorizedAt:new Date().toISOString()
  });
  localStorage.setItem(USERS_KEY,JSON.stringify(users));
  sessionStorage.removeItem('naturalCastanhasAuthSessionV1');
  localStorage.setItem(MIGRATION_KEY,'true');
}

function ajustarCamposDeSenha(){
  document.querySelectorAll('input[type="password"]').forEach(input=>{
    input.minLength=4;
  });
}

function adicionarSenhaAoCadastro(){
  const form=document.getElementById('registerForm');
  if(!form||form.dataset.senhaAdicionada==='true')return;
  form.dataset.senhaAdicionada='true';
  const submit=form.querySelector('button.auth-submit');
  if(!submit)return;
  const senha=document.createElement('label');
  senha.innerHTML='Senha desejada<input name="password" type="password" minlength="4" required autocomplete="new-password">';
  const confirmar=document.createElement('label');
  confirmar.innerHTML='Confirmar senha<input name="confirmPassword" type="password" minlength="4" required autocomplete="new-password">';
  submit.before(senha,confirmar);
  form.addEventListener('submit',event=>{
    const dados=new FormData(form);
    if(String(dados.get('password')||'')!==String(dados.get('confirmPassword')||'')){
      event.preventDefault();
      event.stopImmediatePropagation();
      const erro=document.getElementById('registerError');
      if(erro)erro.textContent='As senhas não coincidem.';
    }
  },true);
}

liberarNovaSenhaDoAdministrador();
const observer=new MutationObserver(()=>{
  ajustarCamposDeSenha();
  adicionarSenhaAoCadastro();
});
observer.observe(document.documentElement,{childList:true,subtree:true});
ajustarCamposDeSenha();
adicionarSenhaAoCadastro();
})();