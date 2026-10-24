var filtroCategoria='todos';
function combinaCategoria(card){
 const c=filtroCategoria;
 if(c==='todos')return true;
 if(c==='publico')return card.classList.contains('cat-publico');
 if(c==='sistemas')return card.classList.contains('cat-sistemas');
 if(c==='interno')return !card.classList.contains('cat-publico')&&!card.classList.contains('cat-sistemas');
 return card.classList.contains('cat-'+c);
}
(()=>{
 const $=id=>document.getElementById(id),menu=$('sideMenu');
 function state(){const mobile=matchMedia('(max-width:800px)').matches,open=mobile?document.body.classList.contains('menu-open'):!document.body.classList.contains('collapsed');$('menuToggle').setAttribute('aria-expanded',String(open));$('menuToggle').setAttribute('aria-label',open?'Recolher menu':'Abrir menu');menu.inert=mobile&&!open;$('menuBackdrop').hidden=!(mobile&&open);}
 function close(){document.body.classList.remove('menu-open');state();}
 $('menuToggle').onclick=()=>{document.body.classList.toggle(matchMedia('(max-width:800px)').matches?'menu-open':'collapsed');state();};$('menuBackdrop').onclick=close;window.addEventListener('resize',state);state();
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&document.body.classList.contains('menu-open')){close();$('menuToggle').focus();}});
 document.querySelectorAll('[data-filter]').forEach(btn=>btn.addEventListener('click',()=>{filtroCategoria=btn.dataset.filter;document.querySelectorAll('[data-filter]').forEach(b=>{b.classList.toggle('active',b===btn);if(b===btn)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');});$('breadcrumbCurrent').textContent=btn.textContent.trim();$('filterCurrent').textContent=btn.textContent.trim();aplicarFiltros();close();}));
 $('clearSearch').onclick=()=>{$('busca').value='';const fav=$('favoritosToggle');fav.classList.remove('ativo');fav.textContent='☆ Somente favoritos';fav.setAttribute('aria-pressed','false');document.querySelector('[data-filter="todos"]').click();};
 window.atualizarContagem=()=>{const cards=[...document.querySelectorAll('.card')];$('resultCount').textContent=cards.filter(c=>c.style.display!=='none').length+' de '+cards.length+' painéis e sistemas';};
 aplicarFiltros();
})();
