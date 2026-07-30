const STORAGE_KEY='naturalCastanhasPurchases';
const CAPITAL=250000;
const $=s=>document.querySelector(s);
const $$=s=>[...document.querySelectorAll(s)];
const brl=new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'});
let purchases=JSON.parse(localStorage.getItem(STORAGE_KEY)||'[]');

function save(){localStorage.setItem(STORAGE_KEY,JSON.stringify(purchases));render();}
function toast(message){const el=$('#toast');el.textContent=message;el.classList.add('show');setTimeout(()=>el.classList.remove('show'),2200)}
function openView(id){$$('.view').forEach(v=>v.classList.toggle('active',v.id===id));$$('.bottom-nav button').forEach(b=>b.classList.toggle('active',b.dataset.open===id));window.scrollTo({top:0,behavior:'smooth'});}
$$('[data-open]').forEach(b=>b.addEventListener('click',()=>openView(b.dataset.open)));
$$('.locked').forEach(b=>b.addEventListener('click',()=>toast('Este módulo será liberado nas próximas etapas.')));

function totals(){
  const valid=purchases.filter(p=>p.status!=='Cancelada');
  const purchased=valid.reduce((a,p)=>a+Number(p.quantity||0),0);
  const total=valid.reduce((a,p)=>a+Number(p.total||0),0);
  const paid=valid.reduce((a,p)=>a+Number(p.paid||0),0);
  const open=valid.filter(p=>p.status!=='Finalizada').length;
  return {purchased,total,paid,pending:Math.max(total-paid,0),open,available:Math.max(CAPITAL-total,0)};
}
function badgeClass(status){if(status==='Preço em aberto')return'open';if(status==='Aguardando entrega'||status==='Aguardando pagamento')return'wait';if(status==='Recebida parcialmente')return'partial';return''}
function render(){
  const t=totals();
  $('#metricAvailable').textContent=brl.format(t.available);$('#metricPurchased').textContent=`${t.purchased.toLocaleString('pt-BR')} latas`;$('#metricStock').textContent=`${t.purchased.toLocaleString('pt-BR')} latas`;$('#metricOpen').textContent=t.open;$('#metricPending').textContent=brl.format(t.pending);
  $('#reservedValue').textContent=brl.format(t.total);$('#usedValue').textContent=brl.format(t.paid);$('#availableValue').textContent=brl.format(t.available);
  const q=$('#searchInput').value.toLowerCase(); const status=$('#statusFilter').value;
  const filtered=purchases.filter(p=>(status==='all'||p.status===status)&&(`${p.supplier} ${p.id}`.toLowerCase().includes(q)));
  $('#purchaseCount').textContent=`${filtered.length} ${filtered.length===1?'registro':'registros'}`;
  $('#emptyState').style.display=filtered.length?'none':'block';
  $('#purchaseList').innerHTML=filtered.map(p=>`<article class="purchase-item"><div class="purchase-item-top"><div><h3>Compra #${p.id}</h3><span class="badge ${badgeClass(p.status)}">${p.status}</span></div><strong>${brl.format(p.total)}</strong></div><p>Fornecedor: <strong>${p.supplier}</strong></p><p>Quantidade: <strong>${Number(p.quantity).toLocaleString('pt-BR')} latas</strong> • ${p.priceType}</p><p>Compra em ${new Date(p.date+'T12:00:00').toLocaleDateString('pt-BR')}${p.delivery?` • Entrega: ${new Date(p.delivery+'T12:00:00').toLocaleDateString('pt-BR')}`:''}</p><p>Pago: <strong>${brl.format(p.paid)}</strong> • Saldo: <strong>${brl.format(Math.max(p.total-p.paid,0))}</strong></p>${p.notes?`<p>${p.notes}</p>`:''}<div class="item-actions">${p.status!=='Finalizada'?`<button class="finish" onclick="finishPurchase('${p.id}')">Finalizar</button>`:''}<button class="delete" onclick="deletePurchase('${p.id}')">Excluir</button></div></article>`).join('');
}
window.finishPurchase=id=>{purchases=purchases.map(p=>p.id===id?{...p,status:'Finalizada',paid:p.total}:p);save();toast('Compra finalizada.');}
window.deletePurchase=id=>{if(confirm('Deseja excluir esta compra?')){purchases=purchases.filter(p=>p.id!==id);save();toast('Compra excluída.')}}

const dialog=$('#purchaseDialog');
function openDialog(){const f=$('#purchaseForm');f.reset();f.elements.date.value=new Date().toISOString().slice(0,10);dialog.showModal()}
$('#newPurchaseButton').addEventListener('click',openDialog);$('#quickAdd').addEventListener('click',()=>{openView('purchasesView');openDialog()});$('#closeDialog').addEventListener('click',()=>dialog.close());$('#cancelDialog').addEventListener('click',()=>dialog.close());
$('#purchaseForm').addEventListener('submit',e=>{e.preventDefault();const fd=new FormData(e.currentTarget);const quantity=Number(fd.get('quantity'));const unitPrice=Number(fd.get('unitPrice')||0);const total=quantity*unitPrice;const id=String(Date.now()).slice(-6);purchases.unshift({id,supplier:fd.get('supplier').trim(),date:fd.get('date'),quantity,priceType:fd.get('priceType'),unitPrice,total,paid:Number(fd.get('paid')||0),status:fd.get('status'),delivery:fd.get('delivery'),notes:fd.get('notes').trim()});save();dialog.close();toast('Compra cadastrada com sucesso.');});
$('#searchInput').addEventListener('input',render);$('#statusFilter').addEventListener('change',render);

if('serviceWorker' in navigator){window.addEventListener('load',()=>navigator.serviceWorker.register('./service-worker.js').catch(console.error));}
render();
