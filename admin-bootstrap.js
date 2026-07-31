(()=>{
  const USERS_KEY='naturalCastanhasUsersV1';
  const AUDIT_KEY='naturalCastanhasAuditV1';
  const ADMINS=[
    {
      id:'admin-tiago',
      name:'Tiago Pereira de Albuquerque',
      email:'',
      phone:'',
      role:'Administrador proprietário',
      status:'Ativo',
      protected:true,
      permissions:['Todos os núcleos','Usuários e permissões','Auditoria','Dispositivos','Configurações'],
      createdAt:new Date().toLocaleString('pt-BR'),
      lastAccess:'Aguardando autenticação real'
    },
    {
      id:'admin-helio',
      name:'Hélio',
      email:'',
      phone:'',
      role:'Administrador proprietário',
      status:'Ativo',
      protected:true,
      permissions:['Todos os núcleos','Usuários e permissões','Auditoria','Dispositivos','Configurações'],
      createdAt:new Date().toLocaleString('pt-BR'),
      lastAccess:'Aguardando autenticação real'
    }
  ];

  function migrateAdmins(){
    let users=[];
    try{users=JSON.parse(localStorage.getItem(USERS_KEY)||'[]')}catch(error){users=[]}
    users=users.filter(user=>user&&user.id!=='owner');
    ADMINS.forEach(admin=>{
      const index=users.findIndex(user=>user.id===admin.id||user.name?.toLowerCase()===admin.name.toLowerCase());
      if(index>=0)users[index]={...users[index],...admin,createdAt:users[index].createdAt||admin.createdAt};
      else users.unshift(admin);
    });
    localStorage.setItem(USERS_KEY,JSON.stringify(users));

    let audit=[];
    try{audit=JSON.parse(localStorage.getItem(AUDIT_KEY)||'[]')}catch(error){audit=[]}
    if(!audit.some(item=>item.action==='Administradores proprietários configurados')){
      audit.unshift({
        id:String(Date.now()),
        date:new Date().toLocaleString('pt-BR'),
        user:'Sistema',
        action:'Administradores proprietários configurados',
        detail:'Tiago Pereira de Albuquerque e Hélio definidos com o mesmo nível máximo de acesso.'
      });
      localStorage.setItem(AUDIT_KEY,JSON.stringify(audit.slice(0,100)));
    }
  }

  function updateVisibleIdentity(){
    document.querySelectorAll('#profileView h2').forEach(element=>{
      if(element.textContent.trim()==='Hélio')element.textContent='Tiago e Hélio';
    });
    document.querySelectorAll('#settingsView strong').forEach(element=>{
      if(element.textContent.trim()==='Hélio')element.textContent='Tiago e Hélio';
      if(element.textContent.trim()==='Administrador')element.textContent='Administradores proprietários';
    });
    const note=document.querySelector('#usersView .n11-note');
    if(note)note.textContent='Tiago Pereira de Albuquerque e Hélio são os dois administradores proprietários protegidos. Os demais usuários dependem da aprovação de um deles e recebem permissões conforme a função.';
  }

  function protectAdminActions(){
    document.querySelectorAll('#n11UserList .n11-card').forEach(card=>{
      const name=card.querySelector('h3')?.textContent.trim();
      if(!ADMINS.some(admin=>admin.name===name))return;
      const actions=card.querySelector('.n11-actions');
      if(actions)actions.innerHTML='<button disabled>Administrador proprietário protegido</button>';
    });
  }

  migrateAdmins();
  const refresh=()=>{updateVisibleIdentity();protectAdminActions()};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(refresh,350));
  else setTimeout(refresh,350);
  document.addEventListener('click',()=>setTimeout(refresh,80));
})();
