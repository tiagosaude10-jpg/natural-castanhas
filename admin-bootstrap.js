(()=>{
  const USERS_KEY='naturalCastanhasUsersV1';
  const AUDIT_KEY='naturalCastanhasAuditV1';
  const ADMINS=[
    {id:'admin-tiago',name:'Tiago Pereira de Albuquerque'},
    {id:'admin-helio',name:'Hélio da Silva Pereira'}
  ].map(admin=>({
    ...admin,
    email:'',phone:'',role:'Administrador',status:'Ativo',protected:true,
    permissions:['Todos os núcleos','Usuários e permissões','Aprovar cadastros','Auditoria','Dispositivos','Configurações'],
    lastAccess:'Aguardando autenticação'
  }));

  const read=key=>{try{return JSON.parse(localStorage.getItem(key)||'[]')}catch(error){return []}};
  const write=(key,value)=>localStorage.setItem(key,JSON.stringify(value));

  function migrateAdmins(){
    const users=read(USERS_KEY).filter(user=>user&&user.id!=='owner');
    ADMINS.forEach(admin=>{
      const index=users.findIndex(user=>user.id===admin.id||String(user.name||'').toLowerCase()===admin.name.toLowerCase());
      if(index>=0)users[index]={...users[index],...admin,createdAt:users[index].createdAt||new Date().toLocaleString('pt-BR')};
      else users.unshift({...admin,createdAt:new Date().toLocaleString('pt-BR')});
    });
    write(USERS_KEY,users.filter((user,index,array)=>array.findIndex(item=>item.id===user.id)===index));

    const audit=read(AUDIT_KEY);
    if(!audit.some(item=>item.action==='Dois administradores fixos configurados')){
      audit.unshift({id:String(Date.now()),date:new Date().toLocaleString('pt-BR'),user:'Sistema',action:'Dois administradores fixos configurados',detail:'Tiago Pereira de Albuquerque e Hélio da Silva Pereira possuem contas independentes, protegidas e com acesso administrativo completo.'});
      write(AUDIT_KEY,audit.slice(0,100));
    }
  }

  function refresh(){
    const note=document.querySelector('#usersView .n11-note');
    if(note)note.textContent='Tiago Pereira de Albuquerque e Hélio da Silva Pereira são administradores fixos, independentes e protegidos. Nenhum deles depende de aprovação do outro. Novos usuários dependem da aprovação de um dos dois.';
    document.querySelectorAll('#n11UserList .n11-card').forEach(card=>{
      const name=card.querySelector('h3')?.textContent.trim();
      if(!ADMINS.some(admin=>admin.name===name))return;
      const actions=card.querySelector('.n11-actions');
      if(actions)actions.innerHTML='<button disabled>Administrador fixo protegido</button>';
    });
  }

  migrateAdmins();
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(refresh,350));
  else setTimeout(refresh,350);
  document.addEventListener('nc-auth-ready',()=>setTimeout(refresh,80));
})();
