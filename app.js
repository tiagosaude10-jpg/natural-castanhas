const PURCHASES_KEY='naturalCastanhasPurchases';
const INVESTORS_KEY='naturalCastanhasInvestors';
const CAPITAL_KEY='naturalCastanhasCapital';
const $=s=>document.querySelector(s);
const $$=s=>[...document.querySelectorAll(s)];
const brl=new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'});
let purchases=JSON.parse(localStorage.getItem(PURCHASES_KEY)||'[]');
let investors=JSON.parse(localStorage.getItem(INVESTORS_KEY)||'[]');
let capitalEntries=JSON.parse(localStorage.getItem(CAPITAL_KEY)||'[]');

function saveAll(){
  localStorage.setItem(PURCHASES_KEY,JSON.stringify(purchases));
  localStorage.setItem(INVESTORS_KEY,JSON.stringify(investors));
  localStorage.setItem(CAPITAL_KEY,JSON.stringify(capitalEntries));
  render();
}
function toast(message){const el=$('#toast');el.textContent=message;el.classList.add('show');setTimeout(()=>el.classList.remove('show'),2200)}
function openView(id){$$('.view').forEach(v=>v.classList.toggle('active',v.id===id));$$('.bottom-nav button').forEach(b=>b.classList.toggle('active',b.dataset.open===id));window.scrollTo({top:0,behavior:'smooth'});}
$$('[data-open]').forEach(b=>b.addEventListener('click',()=>openView(b.dataset.open)));
$$('.locked').forEach(b=>b.addEventListener('click',()=>toast('Este módulo será liberado nas próximas etapas.')));

function capitalTotals(){
  const total=capitalEntries.reduce((a,e)=>a+Number(e.amount||0),0);
  const owner=capitalEntries.filter(e=>e.sourceType==='Proprietário').reduce((a,e)=>a+Number(e.amount||0),0);
  const investor=capitalEntries.filter(e=>e.sourceType==='Investidor').reduce((a,e)=>a+Number(e.amount||0),0);
  const cans=capitalEntries.reduce((a,e)=>a+Number(e.cans||0),0);
  return {total,owner,investor,cans};
}
function purchaseTotals(){
  const valid=purchases.filter(p=>p.status!=='Cancelada');
  const purchased=valid.reduce((a,p)=>a+Number(p.quantity||0),0);
  const total=valid.reduce((a,p)=>a+Number(p.total||0),0);
  const paid=valid.reduce((a,p)=>a+Number(p.paid||0),0);
  const open=valid.filter(p=>p.status!=='Finalizada').length;
  const capital=capitalTotals().total;
  return {purchased,total,paid,pending:Math.max(total-paid,0),open,available:Math.max(capital-total,0),capital};
}
function investorSummary(id){
  const entries=capitalEntries.filter(e=>e.investorId===id);
  return {amount:entries.reduce((a,e)=>a+Number(e.amount||0),0),cans:entries.reduce((a,e)=>a+Number(e.cans||0),0),entries:entries.length};
}
function badgeClass(status){if(status==='Preço em aberto')return'open';if(status==='Aguardando entrega'||status==='Aguardando pagamento')return'wait';if(status==='Recebida parcialmente')return'partial';return''}
function formatDate(value){return value?new Date(value+'T12:00:00').toLocaleDateString('pt-BR'):'—'}

function renderPurchases(){
  const t=purchaseTotals();
  $('#metricAvailable').textContent=brl.format(t.available);
  $('#metricPurchased').textContent=`${t.purchased.toLocaleString('pt-BR')} latas`;
  $('#metricStock').textContent=`${t.purchased.toLocaleString('pt-BR')} latas`;
  $('#metricOpen').textContent=t.open;
  $('#purchaseCapital').textContent=brl.format(t.capital);
  $('#reservedValue').textContent=brl.format(t.total);
  $('#usedValue').textContent=brl.format(t.paid);
  $('#availableValue').textContent=brl.format(t.available);
  const q=$('#searchInput').value.toLowerCase();
  const status=$('#statusFilter').value;
  const filtered=purchases.filter(p=>(status==='all'||p.status===status)&&(`${p.supplier} ${p.id}`.toLowerCase().includes(q)));
  $('#purchaseCount').textContent=`${filtered.length} ${filtered.length===1?'registro':'registros'}`;
  $('#emptyState').style.display=filtered.length?'none':'block';
  $('#purchaseList').innerHTML=filtered.map(p=>`<article class="purchase-item"><div class="purchase-item-top"><div><h3>Compra #${p.id}</h3><span class="badge ${badgeClass(p.status)}">${p.status}</span></div><strong>${brl.format(p.total)}</strong></div><p>Fornecedor: <strong>${p.supplier}</strong></p><p>Quantidade: <strong>${Number(p.quantity).toLocaleString('pt-BR')} latas</strong> • ${p.priceType}</p><p>Compra em ${formatDate(p.date)}${p.delivery?` • Entrega: ${formatDate(p.delivery)}`:''}</p><p>Pago: <strong>${brl.format(p.paid)}</strong> • Saldo: <strong>${brl.format(Math.max(p.total-p.paid,0))}</strong></p>${p.notes?`<p>${p.notes}</p>`:''}<div class="item-actions">${p.status!=='Finalizada'?`<button class="finish" onclick="finishPurchase('${p.id}')">Finalizar</button>`:''}<button class="delete" onclick="deletePurchase('${p.id}')">Excluir</button></div></article>`).join('');
}

function renderCapital(){
  const c=capitalTotals();
  $('#metricCapital').textContent=brl.format(c.total);
  $('#metricInvestors').textContent=investors.length;
  $('#capitalTotal').textContent=brl.format(c.total);
  $('#ownerCapital').textContent=brl.format(c.owner);
  $('#investorCapital').textContent=brl.format(c.investor);
  $('#convertedCans').textContent=c.cans.toLocaleString('pt-BR',{maximumFractionDigits:2});
  $('#investorCount').textContent=`${investors.length} ${investors.length===1?'cadastrado':'cadastrados'}`;
  $('#investorEmpty').style.display=investors.length?'none':'block';
  $('#investorList').innerHTML=investors.map(i=>{const s=investorSummary(i.id);return `<article class="investor-card"><div class="investor-head"><div><h3>${i.name}</h3><span class="badge">Ativo</span></div><button class="delete icon-only" onclick="deleteInvestor('${i.id}')">×</button></div><p>${i.document||'Documento não informado'}${i.phone?` • ${i.phone}`:''}</p><div class="investor-metrics"><div><span>Total investido</span><strong>${brl.format(s.amount)}</strong></div><div><span>Saldo em latas</span><strong>${s.cans.toLocaleString('pt-BR',{maximumFractionDigits:2})}</strong></div><div><span>Aportes</span><strong>${s.entries}</strong></div></div>${i.notes?`<p>${i.notes}</p>`:''}</article>`}).join('');
  $('#capitalCount').textContent=`${capitalEntries.length} ${capitalEntries.length===1?'registro':'registros'}`;
  $('#capitalEmpty').style.display=capitalEntries.length?'none':'block';
  $('#capitalList').innerHTML=capitalEntries.map(e=>{const investor=investors.find(i=>i.id===e.investorId);return `<article class="capital-item"><div class="purchase-item-top"><div><h3>${e.sourceType}</h3><span class="badge">${formatDate(e.date)}</span></div><strong>${brl.format(e.amount)}</strong></div><p>${e.sourceType==='Investidor'?`Investidor: <strong>${investor?investor.name:'Cadastro removido'}</strong>`:'Capital próprio do proprietário'}</p><p>Conversão: <strong>${Number(e.cans||0).toLocaleString('pt-BR',{maximumFractionDigits:2})} latas</strong>${e.canPrice?` • ${brl.format(e.canPrice)} por lata`:''}</p>${e.notes?`<p>${e.notes}</p>`:''}<div class="item-actions"><button class="delete" onclick="deleteCapital('${e.id}')">Excluir</button></div></article>`}).join('');
  updateInvestorSelect();
}
function render(){renderPurchases();renderCapital();}

window.finishPurchase=id=>{purchases=purchases.map(p=>p.id===id?{...p,status:'Finalizada',paid:p.total}:p);saveAll();toast('Compra finalizada.');}
window.deletePurchase=id=>{if(confirm('Deseja excluir esta compra?')){purchases=purchases.filter(p=>p.id!==id);saveAll();toast('Compra excluída.')}}
window.deleteInvestor=id=>{if(capitalEntries.some(e=>e.investorId===id)){toast('Não é possível excluir: existem aportes vinculados.');return}if(confirm('Deseja excluir este investidor?')){investors=investors.filter(i=>i.id!==id);saveAll();toast('Investidor excluído.')}}
window.deleteCapital=id=>{if(confirm('Deseja excluir esta movimentação de capital?')){capitalEntries=capitalEntries.filter(e=>e.id!==id);saveAll();toast('Movimentação excluída.')}}

const purchaseDialog=$('#purchaseDialog');
function openPurchaseDialog(){const f=$('#purchaseForm');f.reset();f.elements.date.value=new Date().toISOString().slice(0,10);purchaseDialog.showModal()}
$('#newPurchaseButton').addEventListener('click',openPurchaseDialog);
$('#quickAdd').addEventListener('click',()=>{openView('purchasesView');openPurchaseDialog()});
$('#closeDialog').addEventListener('click',()=>purchaseDialog.close());
$('#cancelDialog').addEventListener('click',()=>purchaseDialog.close());
$('#purchaseForm').addEventListener('submit',e=>{e.preventDefault();const fd=new FormData(e.currentTarget);const quantity=Number(fd.get('quantity'));const unitPrice=Number(fd.get('unitPrice')||0);const total=quantity*unitPrice;const available=purchaseTotals().available;if(total>available&&fd.get('priceType')==='Preço fechado'){toast('Capital disponível insuficiente para esta compra.');return}const id=String(Date.now()).slice(-6);purchases.unshift({id,supplier:fd.get('supplier').trim(),date:fd.get('date'),quantity,priceType:fd.get('priceType'),unitPrice,total,paid:Number(fd.get('paid')||0),status:fd.get('status'),delivery:fd.get('delivery'),notes:fd.get('notes').trim()});saveAll();purchaseDialog.close();toast('Compra cadastrada com sucesso.');});
$('#searchInput').addEventListener('input',renderPurchases);
$('#statusFilter').addEventListener('change',renderPurchases);

const investorDialog=$('#investorDialog');
$('#newInvestorButton').addEventListener('click',()=>{const f=$('#investorForm');f.reset();investorDialog.showModal()});
$('#closeInvestorDialog').addEventListener('click',()=>investorDialog.close());
$('#cancelInvestorDialog').addEventListener('click',()=>investorDialog.close());
$('#investorForm').addEventListener('submit',e=>{e.preventDefault();const fd=new FormData(e.currentTarget);investors.unshift({id:String(Date.now()),name:fd.get('name').trim(),document:fd.get('document').trim(),phone:fd.get('phone').trim(),email:fd.get('email').trim(),notes:fd.get('notes').trim()});saveAll();investorDialog.close();toast('Investidor cadastrado com sucesso.');});

const capitalDialog=$('#capitalDialog');
function updateInvestorSelect(){const select=$('#investorSelect');const current=select.value;select.innerHTML='<option value="">Selecione</option>'+investors.map(i=>`<option value="${i.id}">${i.name}</option>`).join('');if(investors.some(i=>i.id===current))select.value=current;}
function toggleInvestorField(){const isInvestor=$('#sourceType').value==='Investidor';$('#investorField').style.display=isInvestor?'block':'none';$('#investorSelect').required=isInvestor;}
function updateCanPreview(){const amount=Number($('#capitalForm').elements.amount.value||0);const price=Number($('#capitalForm').elements.canPrice.value||0);$('#canPreview').value=price>0?(amount/price).toLocaleString('pt-BR',{maximumFractionDigits:2}):'0';}
$('#newSourceButton').addEventListener('click',()=>{const f=$('#capitalForm');f.reset();f.elements.date.value=new Date().toISOString().slice(0,10);toggleInvestorField();updateInvestorSelect();updateCanPreview();capitalDialog.showModal()});
$('#closeCapitalDialog').addEventListener('click',()=>capitalDialog.close());
$('#cancelCapitalDialog').addEventListener('click',()=>capitalDialog.close());
$('#sourceType').addEventListener('change',toggleInvestorField);
$('#capitalForm').elements.amount.addEventListener('input',updateCanPreview);
$('#capitalForm').elements.canPrice.addEventListener('input',updateCanPreview);
$('#capitalForm').addEventListener('submit',e=>{e.preventDefault();const fd=new FormData(e.currentTarget);const sourceType=fd.get('sourceType');const investorId=fd.get('investorId');if(sourceType==='Investidor'&&!investorId){toast('Selecione o investidor.');return}const amount=Number(fd.get('amount'));const canPrice=Number(fd.get('canPrice')||0);const cans=canPrice>0?amount/canPrice:0;capitalEntries.unshift({id:String(Date.now()),sourceType,investorId:sourceType==='Investidor'?investorId:'',date:fd.get('date'),amount,canPrice,cans,notes:fd.get('notes').trim()});saveAll();capitalDialog.close();toast('Capital registrado com sucesso.');});

if('serviceWorker' in navigator){window.addEventListener('load',()=>navigator.serviceWorker.register('./service-worker.js').catch(console.error));}
toggleInvestorField();
render();