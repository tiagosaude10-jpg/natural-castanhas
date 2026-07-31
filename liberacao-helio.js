(()=>{
  const USERS_KEY='naturalCastanhasAuthUsersV1';
  const now=()=>new Date().toISOString();

  function liberarHelio(){
    let users=[];
    try{users=JSON.parse(localStorage.getItem(USERS_KEY)||'[]')}catch(error){users=[]}

    let helio=users.find(user=>user&&(
      user.id==='helio' ||
      String(user.name||'').trim().toLowerCase()==='hélio' ||
      String(user.name||'').trim().toLowerCase()==='helio'
    ));

    if(!helio){
      helio={
        id:'helio',
        name:'Hélio',
        role:'Administrador',
        approved:true,
        activated:false,
        canApprove:true,
        status:'Aprovado — aguardando criação de senha',
        passwordHash:'',
        salt:'',
        permissions:['Todos os núcleos','Usuários e permissões','Auditoria','Configurações'],
        createdAt:now(),
        approvedAt:now(),
        approvedBy:'Tiago Pereira de Albuquerque'
      };
      users.push(helio);
    }else if(!helio.activated){
      Object.assign(helio,{
        id:'helio',
        name:'Hélio',
        role:'Administrador',
        approved:true,
        canApprove:true,
        status:'Aprovado — aguardando criação de senha',
        permissions:['Todos os núcleos','Usuários e permissões','Auditoria','Configurações'],
        approvedAt:helio.approvedAt||now(),
        approvedBy:'Tiago Pereira de Albuquerque'
      });
    }

    localStorage.setItem(USERS_KEY,JSON.stringify(users));
    document.dispatchEvent(new Event('nc-approved-users-updated'));
  }

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',liberarHelio,{once:true});
  }else{
    liberarHelio();
  }
})();
