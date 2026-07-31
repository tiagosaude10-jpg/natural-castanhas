(()=>{
  const AUTH_USERS_KEY='naturalCastanhasAuthUsersV1';
  const USERS_KEY='naturalCastanhasUsersV1';

  function read(key){
    try{return JSON.parse(localStorage.getItem(key)||'[]')}catch(error){return []}
  }

  function write(key,value){
    localStorage.setItem(key,JSON.stringify(value));
  }

  function migrateAuthUsers(){
    let users=read(AUTH_USERS_KEY);

    // Remove apenas o antigo Hélio criado automaticamente pelo código anterior.
    // Um Hélio cadastrado futuramente pelo formulário terá outro identificador e será preservado.
    users=users.filter(user=>{
      const isLegacyHelio=user&&user.id==='helio';
      const alreadyActivated=Boolean(user&&user.activated);
      return !isLegacyHelio||alreadyActivated;
    });

    let tiago=users.find(user=>user&&user.id==='tiago');
    if(!tiago){
      tiago={
        id:'tiago',
        name:'Tiago Pereira de Albuquerque',
        role:'Administrador Geral',
        approved:true,
        canApprove:true,
        status:'Pré-cadastrado',
        activated:false,
        passwordHash:'',
        salt:''
      };
      users.unshift(tiago);
    }else{
      Object.assign(tiago,{
        name:'Tiago Pereira de Albuquerque',
        role:'Administrador Geral',
        approved:true,
        canApprove:true
      });
      if(!tiago.activated)tiago.status='Pré-cadastrado';
    }

    write(AUTH_USERS_KEY,users);
  }

  function migrateNucleusUsers(){
    let users=read(USERS_KEY);
    users=users.filter(user=>{
      const legacyHelio=user&&(user.id==='admin-helio'||user.id==='helio');
      const active=String(user&&user.status||'').toLowerCase()==='ativo';
      return !legacyHelio||active;
    });

    const index=users.findIndex(user=>user&&user.id==='admin-tiago');
    const tiago={
      id:'admin-tiago',
      name:'Tiago Pereira de Albuquerque',
      email:'',
      phone:'',
      role:'Administrador Geral',
      status:'Ativo',
      protected:true,
      permissions:['Todos os núcleos','Usuários e permissões','Aprovar cadastros','Auditoria','Dispositivos','Configurações'],
      lastAccess:'Aguardando ativação da conta'
    };
    if(index>=0)users[index]={...users[index],...tiago};
    else users.unshift({...tiago,createdAt:new Date().toLocaleString('pt-BR')});
    write(USERS_KEY,users);
  }

  function refreshLabels(){
    document.querySelectorAll('#profileView h2').forEach(element=>{
      if(['Hélio','Tiago e Hélio'].includes(element.textContent.trim()))element.textContent='Tiago Pereira de Albuquerque';
    });
    document.querySelectorAll('#settingsView strong,#profileView strong').forEach(element=>{
      if(['Administrador','Administradores proprietários','Administrador proprietário'].includes(element.textContent.trim()))element.textContent='Administrador Geral';
    });
    const note=document.querySelector('#usersView .n11-note');
    if(note)note.textContent='Tiago Pereira de Albuquerque é o Administrador Geral inicial. Novos administradores devem solicitar o perfil Administrador no primeiro cadastro e somente recebem acesso após aprovação.';
  }

  function run(){
    migrateAuthUsers();
    migrateNucleusUsers();
    refreshLabels();
  }

  run();
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(run,250));
  document.addEventListener('click',()=>setTimeout(refreshLabels,60));
})();
