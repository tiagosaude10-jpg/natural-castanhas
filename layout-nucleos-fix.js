(()=>{
  const styleId='layout-nucleos-fix-style';
  function applyStyle(){
    if(document.getElementById(styleId))return;
    const s=document.createElement('style');
    s.id=styleId;
    s.textContent=`
      html,body{height:auto!important;min-height:100%!important;overflow-x:hidden!important;overflow-y:auto!important}
      body{padding-bottom:calc(96px + env(safe-area-inset-bottom))!important}
      .app-shell{height:auto!important;min-height:calc(100vh - 104px)!important;overflow:visible!important;padding-bottom:38px!important}
      #homeView.view.active{display:block!important;height:auto!important;min-height:0!important;overflow:visible!important}
      #homeView .module-grid{height:auto!important;max-height:none!important;overflow:visible!important;align-content:start!important;padding-bottom:22px!important}
      #homeView .module-card{display:flex!important;visibility:visible!important;opacity:1}
      #homeView .fee-card{margin-bottom:26px!important}
      footer{padding-bottom:calc(96px + env(safe-area-inset-bottom))!important}
      @media(max-width:420px){#homeView .module-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important}}
    `;
    document.head.appendChild(s);
  }
  function sortAndCheck(){
    const grid=document.querySelector('#homeView .module-grid');
    if(!grid)return;
    const cards=[...grid.querySelectorAll('.module-card')];
    cards.sort((a,b)=>Number(a.querySelector('.module-number')?.textContent||99)-Number(b.querySelector('.module-number')?.textContent||99)).forEach(c=>grid.appendChild(c));
    const nums=new Set(cards.map(c=>Number(c.querySelector('.module-number')?.textContent||0)).filter(Boolean));
    document.documentElement.dataset.loadedNuclei=String(nums.size);
    const missing=[];for(let i=1;i<=12;i++)if(!nums.has(i))missing.push(i);
    if(missing.length){
      console.warn('Natural Castanhas: núcleos não carregados:',missing.join(', '));
      setTimeout(sortAndCheck,800);
    }
  }
  function init(){applyStyle();sortAndCheck();setTimeout(sortAndCheck,300);setTimeout(sortAndCheck,1200);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
  window.addEventListener('load',()=>setTimeout(sortAndCheck,250));
})();
