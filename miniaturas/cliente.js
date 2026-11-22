/* Atualiza somente imagens geradas e validadas. Falhas mantêm a imagem original. */
(()=>{
  'use strict';
  if(location.protocol==='file:')return;
  const originals=new WeakMap(),applied=new WeakMap();
  let checked=0,busy=false;
  async function refresh(){
    if(busy||document.hidden||Date.now()-checked<300000)return;
    busy=true;checked=Date.now();
    try{
      const response=await fetch('miniaturas/manifesto.json',{cache:'no-cache'});
      if(!response.ok)return;const data=await response.json();
      if(data.version!==1||!data.thumbnails)return;
      document.querySelectorAll('.card[data-id]').forEach(card=>{
        if(card.dataset.id==='totems')return;
        const entry=data.thumbnails[card.dataset.id],img=card.querySelector('img.thumb');
        if(!img||!entry||!/^imagens\/miniaturas\/[a-z0-9]+(?:-[a-z0-9]+)*\.jpg$/.test(entry.src)||!/^[a-f0-9]{64}$/.test(entry.sha256))return;
        const url=entry.src+'?v='+entry.sha256.slice(0,16);
        if(applied.get(img)===url)return;
        if(!originals.has(img))originals.set(img,{src:img.getAttribute('src'),handler:img.onerror});
        const fallback=originals.get(img);
        img.onerror=()=>{img.onerror=fallback.handler;img.hidden=false;img.src=fallback.src;applied.delete(img);};
        img.hidden=false;img.src=url;applied.set(img,url);
      });
    }catch(_){/* A consulta e os cards continuam funcionando com as imagens existentes. */}
    finally{busy=false;}
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',refresh,{once:true});else refresh();
  document.addEventListener('visibilitychange',refresh);
  setInterval(refresh,300000);
})();
