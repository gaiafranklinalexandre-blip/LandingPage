/* Capturas públicas para o hub. Não autentica, não altera os painéis de origem. */
'use strict';
const fs=require('node:fs/promises'),path=require('node:path'),crypto=require('node:crypto');
const sha=buffer=>crypto.createHash('sha256').update(buffer).digest('hex');
const idPattern=/^[a-z0-9]+(?:-[a-z0-9]+)*$/;
function validate(config){
  if(config.version!==1||!Array.isArray(config.targets))throw Error('CONFIG_INVALIDA');
  const ids=new Set();
  for(const t of config.targets){
    if(!idPattern.test(t.id)||ids.has(t.id))throw Error('ID_INVALIDO');ids.add(t.id);
    const u=new URL(t.url);
    if(u.protocol!=='https:'||u.username||u.password||/^(localhost|127\.|10\.|192\.168\.|169\.254\.)/.test(u.hostname))throw Error('URL_INVALIDA');
    if(t.enabled&&(/(?:totems?|modo-tatico|ubs-modelo)/i.test(u.pathname)||t.id==='totems'))throw Error('EXCECAO_PROTEGIDA');
  }
  return config;
}
async function atomic(file,buffer){const temp=file+'.tmp';await fs.mkdir(path.dirname(file),{recursive:true});await fs.writeFile(temp,buffer);await fs.rename(temp,file);}
async function readManifest(root){try{return JSON.parse(await fs.readFile(path.join(root,'miniaturas/manifesto.json'),'utf8'))}catch(e){if(e.code!=='ENOENT')throw e;return{version:1,thumbnails:{}}}}
async function capture(page,target,config){
  const response=await page.goto(target.url,{waitUntil:'domcontentloaded',timeout:config.timeoutMs||60000});
  if(!response||response.status()>=400)throw Error('HTTP_INDISPONIVEL');
  if(/login\.microsoftonline\.com|login\.live\.com|accounts\.google\.com/.test(new URL(page.url()).hostname))throw Error('AUTENTICACAO');
  if(target.ready)await page.locator(target.ready).first().waitFor({timeout:config.timeoutMs||60000});
  for(const selector of ['#cookie-necessarios','#lgpd-accept-necessary']){
    const button=page.locator(selector);if(await button.isVisible().catch(()=>false))await button.click();
  }
  await page.waitForTimeout(target.waitMs??config.waitMs??5000);
  const texts=[];let dominantVisual=false;
  for(const frame of page.frames()){
    try{
      if(frame!==page.mainFrame()&&!await(await frame.frameElement()).isVisible())continue;
      if(await frame.locator('input[type=password]:visible').count())throw Error('AUTENTICACAO');
      const main=frame.locator('main:visible,[role=main]:visible').first();
      texts.push((await(await main.count()?main:frame.locator('body')).innerText({timeout:5000})).slice(0,12000));
      dominantVisual||=await frame.locator('canvas:visible,svg:visible,img:visible,[role=img]:visible').evaluateAll(es=>es.some(e=>{const r=e.getBoundingClientRect();return r.width>=500&&r.height>=250}));
    }catch(e){if(e.message==='AUTENTICACAO')throw e;}
  }
  const content=texts.join(' ').replace(/\s+/g,' ').trim();
  if(/acesso (?:restrito|negado)|access denied|sign in to your account|entre para (?:acessar|exibir)|report (?:is )?unavailable|conte[uú]do (?:indispon[ií]vel|n[aã]o est[aá] dispon[ií]vel)|this content (?:is not|isn't) available|application error|site not found|n[aã]o foi poss[ií]vel (?:carregar|buscar|consultar)|erro ao (?:carregar|buscar)/i.test(content))throw Error('CONTEUDO_INDISPONIVEL');
  if((content.length<80&&(!dominantVisual||target.requireText))||(content.length<400&&/carregando|loading|aguarde|just a moment|verify you are human/i.test(content)))throw Error('PAGINA_INCOMPLETA');
  await page.evaluate(()=>document.fonts.ready);
  const buffer=await page.screenshot({type:'jpeg',quality:78,animations:'disabled',caret:'hide',timeout:20000});
  if(buffer.length<(config.minBytes||9000))throw Error('CAPTURA_VAZIA');
  return buffer;
}
async function run({root,config,browser,only,prepareContext}){
  validate(config);const manifest=await readManifest(root),report={checkedAt:new Date().toISOString(),results:[],changed:[]};
  if(only&&!config.targets.some(t=>t.id===only))throw Error('ID_DESCONHECIDO');
  if(manifest.version!==1||!manifest.thumbnails||typeof manifest.thumbnails!=='object')throw Error('MANIFESTO_INVALIDO');
  const context=await browser.newContext({viewport:config.viewport||{width:1440,height:900},locale:'pt-BR',timezoneId:'America/Sao_Paulo',reducedMotion:'reduce',colorScheme:'light'});
  await context.route(/googletagmanager\.com|google-analytics\.com|doubleclick\.net/,r=>r.abort());
  if(prepareContext)await prepareContext(context);
  try{
    for(const t of config.targets){
      if(only&&t.id!==only)continue;
      const item={id:t.id,status:'preservada'};
      if(!t.enabled){item.reason=t.reason||'Excluída da captura';report.results.push(item);continue;}
      const page=await context.newPage();
      try{
        const buffer=await capture(page,t,config),hash=sha(buffer),src='imagens/miniaturas/'+t.id+'.jpg';
        const existing=await fs.readFile(path.join(root,src)).catch(e=>{if(e.code!=='ENOENT')throw e;return null});
        if(manifest.thumbnails[t.id]?.sha256===hash&&existing&&sha(existing)===hash){item.status='sem_alteracao';}
        else{
          await atomic(path.join(root,src),buffer);
          manifest.thumbnails[t.id]={src,sha256:hash,updatedAt:report.checkedAt};
          report.changed.push(src);item.status='atualizada';
        }
      }catch(e){item.reason=/^(HTTP_INDISPONIVEL|AUTENTICACAO|CONTEUDO_INDISPONIVEL|PAGINA_INCOMPLETA|CAPTURA_VAZIA)$/.test(e.message)?e.message:'FALHA_OU_TIMEOUT';}
      finally{await page.close();}
      report.results.push(item);
      console.log(t.id+': '+item.status+(item.reason?' ('+item.reason+')':''));
    }
    if(report.changed.length){await atomic(path.join(root,'miniaturas/manifesto.json'),JSON.stringify(manifest,null,2)+'\n');report.changed.push('miniaturas/manifesto.json');}
    return report;
  }finally{await context.close();}
}
async function main(){
  const args=process.argv.slice(2),option=(name,fallback)=>{const i=args.indexOf(name);return i<0?fallback:args[i+1]};
  const root=path.resolve(option('--root',path.join(__dirname,'..'))),file=path.join(root,'miniaturas/catalogo.json');
  const config=validate(JSON.parse(await fs.readFile(file,'utf8')));
  const {chromium}=require(process.env.APS_PLAYWRIGHT||'playwright');
  const browser=await chromium.launch({headless:true,...(process.env.APS_BROWSER_CHANNEL?{channel:process.env.APS_BROWSER_CHANNEL}:{})});
  try{
    const report=await run({root,config,browser,only:option('--somente',null)});
    const dest=option('--report',path.join(root,'miniaturas/relatorio.local.json'));await atomic(dest,JSON.stringify(report,null,2)+'\n');
    if(process.env.GITHUB_STEP_SUMMARY)await fs.appendFile(process.env.GITHUB_STEP_SUMMARY,'## Miniaturas\n\n'+report.results.map(r=>'- '+r.id+': '+r.status+(r.reason?' ('+r.reason+')':'')).join('\n')+'\n');
    console.log('Imagens atualizadas: '+report.results.filter(r=>r.status==='atualizada').length+'; anteriores preservadas nas demais.');
  }finally{await browser.close();}
}
module.exports={validate,capture,run};
if(require.main===module)main().catch(e=>{console.error(/^[A-Z_]+$/.test(e.message)?e.message:'FALHA_NA_ROTINA');process.exitCode=1});
