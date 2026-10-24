// Sem carregamento do Google Analytics antes de consentimento explícito.
(() => {
  const KEY='saps.landing.privacidade.v1', ID='G-D8TE54RKD3';
  let choice, loaded=false;
  try { choice=JSON.parse(localStorage.getItem(KEY)); } catch (_) {}
  const valid=c=>c?.version===1 && typeof c.analytics==='boolean';
  window['ga-disable-'+ID]=true;
  window.gtag=function(){if(loaded&&choice?.analytics===true)window.dataLayer.push(arguments);};
  function enable(){
    if(loaded||choice?.analytics!==true)return;
    loaded=true;window['ga-disable-'+ID]=false;
    window.dataLayer=window.dataLayer||[];
    window.gtag('consent','default',{analytics_storage:'granted',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});
    window.gtag('js',new Date());window.gtag('config',ID,{allow_google_signals:false,allow_ad_personalization_signals:false});
    const script=document.createElement('script');script.id='aps-ga';script.async=true;script.src='https://www.googletagmanager.com/gtag/js?id='+ID;document.head.append(script);
  }
  function clearAnalytics(){
    window['ga-disable-'+ID]=true;
    for(const cookie of document.cookie.split(';')){
      const name=cookie.split('=')[0].trim();if(!/^_ga(?:_|$)/.test(name))continue;
      for(const domain of ['',location.hostname,'.'+location.hostname])document.cookie=`${name}=; Max-Age=0; path=/; SameSite=Lax${domain?'; domain='+domain:''}`;
    }
  }
  const banner=document.createElement('section');banner.className='painel-cookie';banner.setAttribute('aria-label','Cookies e privacidade');
  banner.innerHTML='<div><strong>Cookies e privacidade</strong><p>Usamos recursos essenciais ao funcionamento do painel. O Google Analytics só é ativado com sua autorização para analisar o uso e melhorar o serviço.</p></div><div class="painel-cookie-acoes"><button type="button" class="btn-abrir" id="cookie-preferencias">Preferências</button><button type="button" class="btn-abrir" id="cookie-necessarios">Apenas necessários</button><button type="button" class="painel-primary" id="cookie-aceitar">Aceitar todos</button></div>';
  banner.hidden=valid(choice);document.body.append(banner);
  const dialog=document.createElement('dialog');dialog.className='painel-dialog';dialog.setAttribute('aria-labelledby','cookie-titulo');
  dialog.innerHTML='<div class="painel-dialog-titulo"><h2 id="cookie-titulo">Preferências de cookies</h2><button type="button" id="cookie-fechar" aria-label="Fechar preferências">×</button></div><p><strong>Recursos essenciais</strong><br>Mantêm a navegação, o cache de disponibilidade e sua preferência de privacidade. Permanecem ativos.</p><label class="painel-cookie-opcao"><input type="checkbox" id="cookie-analise"> Permitir cookies de análise</label><p>O Google Analytics registra dados de uso, como páginas e recursos acessados. Recusar não limita as consultas. Você pode alterar sua escolha a qualquer momento no rodapé.</p><div class="painel-dialog-acoes"><button type="button" id="cookie-salvar" class="painel-primary">Salvar preferências</button><button type="button" id="cookie-recusar" class="btn-abrir">Apenas necessários</button></div>';
  document.body.append(dialog);const $=id=>document.getElementById(id);let last;
  const link=document.createElement('button');link.type='button';link.className='painel-privacidade-link';link.textContent='Preferências de cookies';document.querySelector('footer').append(link);
  function open(){last=document.activeElement;$('cookie-analise').checked=valid(choice)&&choice.analytics===true;dialog.showModal();}
  function close(){dialog.close();last?.focus();}
  function persist(analytics){
    const revoke=loaded&&!analytics;
    choice={version:1,analytics,essential:true,updatedAt:new Date().toISOString()};
    let saved=true;try{localStorage.setItem(KEY,JSON.stringify(choice));}catch(_){saved=false;}
    banner.hidden=true;if(dialog.open)close();
    if(!analytics)clearAnalytics();else enable();
    if(!saved)link.textContent='Preferências de cookies (válidas nesta sessão)';
    // Remove a biblioteca da memória; a próxima carga não a solicita novamente.
    if(revoke)location.reload();
  }
  link.onclick=open;$('cookie-preferencias').onclick=open;$('cookie-fechar').onclick=close;$('cookie-necessarios').onclick=()=>persist(false);$('cookie-recusar').onclick=()=>persist(false);$('cookie-aceitar').onclick=()=>persist(true);$('cookie-salvar').onclick=()=>persist($('cookie-analise').checked);
  dialog.addEventListener('cancel',()=>requestAnimationFrame(()=>last?.focus()));
  window.addEventListener('storage',e=>{if(e.key===KEY)location.reload();});
  if(valid(choice)&&choice.analytics)enable();else clearAnalytics();
})();
