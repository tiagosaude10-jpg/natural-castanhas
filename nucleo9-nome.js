(()=>{
function aplicarNomeNucleo9(){
 const card=document.querySelector('[data-open="reportsView"]');
 if(card){
  const titulo=card.querySelector('strong');
  const subtitulo=card.querySelector('small');
  if(titulo)titulo.textContent='Relatórios e Inteligência Gerencial';
  if(subtitulo)subtitulo.textContent='Indicadores, análises e decisões';
 }
 const cabecalho=document.querySelector('#reportsView h1');
 if(cabecalho)cabecalho.textContent='Relatórios e Inteligência Gerencial';
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(aplicarNomeNucleo9,0));else setTimeout(aplicarNomeNucleo9,0);
window.addEventListener('load',aplicarNomeNucleo9);
})();