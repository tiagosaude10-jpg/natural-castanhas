(()=>{
  const PREFIX='naturalCastanhas';
  const DB_NAME='naturalCastanhasSafety';
  const STORE='snapshots';
  const MAX_SNAPSHOTS=20;
  let snapshotTimer;

  const toast=message=>{
    if(typeof window.toast==='function')return window.toast(message);
    const element=document.getElementById('toast');
    if(!element)return alert(message);
    element.textContent=message;
    element.classList.add('show');
    setTimeout(()=>element.classList.remove('show'),2600);
  };

  function collectData(){
    const data={};
    for(let index=0;index<localStorage.length;index++){
      const key=localStorage.key(index);
      if(key&&key.startsWith(PREFIX))data[key]=localStorage.getItem(key);
    }
    return data;
  }

  function openDatabase(){
    return new Promise((resolve,reject)=>{
      const request=indexedDB.open(DB_NAME,1);
      request.onupgradeneeded=()=>{
        const database=request.result;
        if(!database.objectStoreNames.contains(STORE))database.createObjectStore(STORE,{keyPath:'createdAt'});
      };
      request.onsuccess=()=>resolve(request.result);
      request.onerror=()=>reject(request.error);
    });
  }

  async function createSnapshot(reason='automático'){
    if(!('indexedDB' in window))return false;
    const database=await openDatabase();
    const snapshot={
      createdAt:new Date().toISOString(),
      reason,
      app:'Natural Castanhas',
      schemaVersion:1,
      data:collectData()
    };
    await new Promise((resolve,reject)=>{
      const transaction=database.transaction(STORE,'readwrite');
      transaction.objectStore(STORE).put(snapshot);
      transaction.oncomplete=resolve;
      transaction.onerror=()=>reject(transaction.error);
    });
    const snapshots=await listSnapshots();
    if(snapshots.length>MAX_SNAPSHOTS){
      const excess=snapshots.slice(0,snapshots.length-MAX_SNAPSHOTS);
      await new Promise((resolve,reject)=>{
        const transaction=database.transaction(STORE,'readwrite');
        excess.forEach(item=>transaction.objectStore(STORE).delete(item.createdAt));
        transaction.oncomplete=resolve;
        transaction.onerror=()=>reject(transaction.error);
      });
    }
    database.close();
    updateStatus();
    return true;
  }

  async function listSnapshots(){
    if(!('indexedDB' in window))return[];
    const database=await openDatabase();
    const items=await new Promise((resolve,reject)=>{
      const transaction=database.transaction(STORE,'readonly');
      const request=transaction.objectStore(STORE).getAll();
      request.onsuccess=()=>resolve(request.result||[]);
      request.onerror=()=>reject(request.error);
    });
    database.close();
    return items.sort((a,b)=>a.createdAt.localeCompare(b.createdAt));
  }

  function scheduleSnapshot(reason='alteração de dados'){
    clearTimeout(snapshotTimer);
    snapshotTimer=setTimeout(()=>createSnapshot(reason).catch(error=>console.warn('Falha no backup automático.',error)),800);
  }

  function restoreData(data){
    if(!data||typeof data!=='object')throw new Error('Arquivo de dados inválido.');
    const entries=Object.entries(data).filter(([key])=>key.startsWith(PREFIX));
    if(!entries.length)throw new Error('Nenhum dado do Natural Castanhas foi encontrado.');
    entries.forEach(([key,value])=>localStorage.setItem(key,String(value)));
    scheduleSnapshot('restauração');
  }

  async function restoreLatestSnapshot(){
    const snapshots=await listSnapshots();
    const latest=snapshots.at(-1);
    if(!latest)throw new Error('Ainda não existe backup automático disponível.');
    restoreData(latest.data);
    return latest;
  }

  function exportBackup(){
    const backup={
      app:'Natural Castanhas',
      schemaVersion:1,
      exportedAt:new Date().toISOString(),
      data:collectData()
    };
    const blob=new Blob([JSON.stringify(backup,null,2)],{type:'application/json'});
    const url=URL.createObjectURL(blob);
    const link=document.createElement('a');
    link.href=url;
    link.download=`natural-castanhas-backup-${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    createSnapshot('exportação manual').catch(()=>{});
    toast('Backup exportado com sucesso.');
  }

  function importBackup(file){
    return new Promise((resolve,reject)=>{
      const reader=new FileReader();
      reader.onload=()=>{
        try{
          const backup=JSON.parse(reader.result);
          if(backup.app!=='Natural Castanhas'||!backup.data)throw new Error('Este arquivo não é um backup válido do aplicativo.');
          restoreData(backup.data);
          resolve(backup);
        }catch(error){reject(error)}
      };
      reader.onerror=()=>reject(reader.error);
      reader.readAsText(file);
    });
  }

  async function syncWithCloud(){
    const endpoint='/api/natural-castanhas/sync';
    const response=await fetch(endpoint,{
      method:'POST',
      credentials:'include',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({schemaVersion:1,updatedAt:new Date().toISOString(),data:collectData()})
    });
    if(!response.ok)throw new Error('O servidor de sincronização ainda não está configurado.');
    const result=await response.json();
    if(result&&result.data)restoreData(result.data);
    localStorage.setItem(`${PREFIX}LastCloudSync`,new Date().toISOString());
    updateStatus();
    return result;
  }

  async function updateStatus(){
    const localStatus=document.getElementById('dataLocalStatus');
    const backupStatus=document.getElementById('dataBackupStatus');
    const cloudStatus=document.getElementById('dataCloudStatus');
    if(localStatus)localStatus.textContent='Protegido neste aparelho';
    if(backupStatus){
      try{
        const snapshots=await listSnapshots();
        const latest=snapshots.at(-1);
        backupStatus.textContent=latest?`Último: ${new Date(latest.createdAt).toLocaleString('pt-BR')}`:'Aguardando primeiro registro';
      }catch{backupStatus.textContent='Indisponível neste navegador'}
    }
    if(cloudStatus){
      const last=localStorage.getItem(`${PREFIX}LastCloudSync`);
      cloudStatus.textContent=last?`Última: ${new Date(last).toLocaleString('pt-BR')}`:'Aguardando banco online';
    }
  }

  function installProfileControls(){
    const profile=document.getElementById('profileView');
    if(!profile||document.getElementById('dataSafetyCard'))return;
    const card=document.createElement('section');
    card.id='dataSafetyCard';
    card.className='summary-card';
    card.style.marginTop='18px';
    card.innerHTML=`<div class="card-heading"><div><p class="eyebrow light">Segurança dos dados</p><h2>Backup e sincronização</h2></div><span class="status-dot">Proteção ativa</span></div><div class="metrics-grid" style="margin-top:18px"><article><span>Armazenamento local</span><strong id="dataLocalStatus">Protegido</strong></article><article><span>Backup automático</span><strong id="dataBackupStatus">Ativo</strong></article><article><span>Banco online</span><strong id="dataCloudStatus">Aguardando configuração</strong></article><article><span>Formato do backup</span><strong>JSON seguro</strong></article></div><div class="dual-actions" style="margin-top:18px"><button class="primary-button" id="exportDataButton" type="button">Exportar backup</button><button class="secondary-button wide" id="importDataButton" type="button">Importar backup</button></div><div class="dual-actions" style="margin-top:10px"><button class="secondary-button wide" id="restoreDataButton" type="button">Recuperar último backup</button><button class="secondary-button wide" id="cloudSyncButton" type="button">Sincronizar nuvem</button></div><input id="importDataInput" type="file" accept="application/json,.json" hidden><p class="muted" style="margin-top:18px">O backup automático protege os dados contra alterações acidentais. A sincronização entre aparelhos será ativada quando o servidor e as credenciais do banco online forem conectados.</p>`;
    profile.appendChild(card);

    document.getElementById('exportDataButton').onclick=exportBackup;
    document.getElementById('importDataButton').onclick=()=>document.getElementById('importDataInput').click();
    document.getElementById('importDataInput').onchange=async event=>{
      const file=event.target.files?.[0];
      if(!file)return;
      try{
        await importBackup(file);
        toast('Backup importado. O aplicativo será atualizado.');
        setTimeout(()=>location.reload(),900);
      }catch(error){toast(error.message||'Não foi possível importar o backup.')}
      event.target.value='';
    };
    document.getElementById('restoreDataButton').onclick=async()=>{
      try{
        const snapshot=await restoreLatestSnapshot();
        toast(`Backup de ${new Date(snapshot.createdAt).toLocaleString('pt-BR')} recuperado.`);
        setTimeout(()=>location.reload(),900);
      }catch(error){toast(error.message)}
    };
    document.getElementById('cloudSyncButton').onclick=async()=>{
      try{
        await syncWithCloud();
        toast('Sincronização concluída.');
      }catch(error){toast(error.message)}
    };
    updateStatus();
  }

  const originalSetItem=Storage.prototype.setItem;
  const originalRemoveItem=Storage.prototype.removeItem;
  Storage.prototype.setItem=function(key,value){
    originalSetItem.call(this,key,value);
    if(this===localStorage&&String(key).startsWith(PREFIX))scheduleSnapshot();
  };
  Storage.prototype.removeItem=function(key){
    originalRemoveItem.call(this,key);
    if(this===localStorage&&String(key).startsWith(PREFIX))scheduleSnapshot('remoção de dados');
  };

  window.NaturalCastanhasData={collectData,createSnapshot,listSnapshots,exportBackup,importBackup,restoreLatestSnapshot,syncWithCloud};

  function initialize(){
    createSnapshot('inicialização').catch(()=>{});
    installProfileControls();
    const observer=new MutationObserver(()=>installProfileControls());
    observer.observe(document.body,{childList:true,subtree:true});
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initialize);
  else initialize();
})();