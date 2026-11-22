'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs/promises'),path=require('node:path'),os=require('node:os');
const {validate,run}=require('./atualizar.cjs');
const {publish}=require('./publicar.cjs');
const {chromium}=require(process.env.APS_PLAYWRIGHT||'playwright');
const launch=()=>chromium.launch({headless:true,...(process.env.APS_BROWSER_CHANNEL?{channel:process.env.APS_BROWSER_CHANNEL}:{})});
test('bloqueia destinos locais, IDs repetidos e captura de Totems',()=>{
  assert.throws(()=>validate({version:1,targets:[{id:'a',url:'http://localhost/',enabled:true}]}));
  assert.throws(()=>validate({version:1,targets:[{id:'a',url:'https://a.invalid'},{id:'a',url:'https://a.invalid'}]}));
  assert.throws(()=>validate({version:1,targets:[{id:'totems',url:'https://a.invalid/eventos/totems/',enabled:true}]}));
});
test('captura real; falhas HTTP/login/página vazia preservam a imagem e o manifesto',async()=>{
  const base=path.resolve(os.tmpdir(),'aps-miniaturas-tests');await fs.mkdir(base,{recursive:true});const root=await fs.mkdtemp(path.join(base,'caso-'));const browser=await launch();
  try{
    const config={version:1,waitMs:0,timeoutMs:1000,minBytes:1000,targets:[{id:'painel',url:'https://qa.invalid/ok',enabled:true}]};
    const fixture=async context=>context.route('https://qa.invalid/**',async route=>{
      const suffix=new URL(route.request().url()).pathname;
      if(suffix==='/fail')return route.fulfill({status:503,body:'Falha temporária'});
      if(suffix==='/auth')return route.fulfill({status:200,contentType:'text/html; charset=utf-8',body:'<input type="password"><p>Acesso restrito</p>'});
      if(suffix==='/empty')return route.fulfill({status:200,contentType:'text/html; charset=utf-8',body:'<body></body>'});
      if(suffix==='/unavailable')return route.fulfill({status:200,contentType:'text/html; charset=utf-8',body:'<main><p>Esse conteúdo não está disponível.</p><p>Saiba mais sobre o Power BI. Microsoft Power BI. Serviços e painéis públicos.</p></main>'});
      if(suffix==='/spinner')return route.fulfill({status:200,contentType:'text/html; charset=utf-8',body:'<header>Portal de informações públicas do Ministério da Saúde com navegação e serviços para municípios e estados</header><main><svg width="40" height="40"><circle cx="20" cy="20" r="15"/></svg></main>'});
      const body='<h1>Painel público de teste</h1>'+Array.from({length:24},(_,i)=>`<div style="display:inline-block;width:260px;height:100px;margin:8px;background:hsl(${i*27} 65% 65%);font:24px sans-serif">Indicador de teste ${i}</div>`).join('');
      return route.fulfill({status:200,contentType:'text/html; charset=utf-8',body});
    });
    const first=await run({root,config,browser,prepareContext:fixture});assert.equal(first.results[0].status,'atualizada');
    const image=await fs.readFile(path.join(root,'imagens/miniaturas/painel.jpg')),manifest=await fs.readFile(path.join(root,'miniaturas/manifesto.json'));
    for(const suffix of ['fail','auth','empty','unavailable','spinner']){
      config.targets[0].url='https://qa.invalid/'+suffix;const result=await run({root,config,browser,prepareContext:fixture});
      assert.equal(result.results[0].status,'preservada');assert.equal(result.changed.length,0);
      assert.deepEqual(await fs.readFile(path.join(root,'imagens/miniaturas/painel.jpg')),image);
      assert.deepEqual(await fs.readFile(path.join(root,'miniaturas/manifesto.json')),manifest);
    }
  }finally{await browser.close();const resolved=await fs.realpath(root);if(path.dirname(resolved)!==await fs.realpath(base))throw Error('LIMPEZA_FORA_DO_DIRETORIO_DE_TESTE');await fs.rm(resolved,{recursive:true,force:true});}
});
test('cliente mantém fallback e Totems; rejeita URLs de imagens fora do próprio site',async()=>{
  const browser=await launch();try{
    const page=await browser.newPage();let external=0;page.on('request',r=>{if(r.url().includes('fora.invalid'))external++});
    const svg='<svg xmlns="http://www.w3.org/2000/svg" width="100" height="60"><rect width="100" height="60" fill="blue"/></svg>';
    await page.route('https://qa.invalid/**',route=>{
      const p=new URL(route.request().url()).pathname;
      if(p==='/')return route.fulfill({contentType:'text/html; charset=utf-8',body:'<div class="card" data-id="nota"><div class="thumb"><img src="original.svg"></div></div><div class="card" data-id="totems"><div class="thumb"><img src="original.svg"></div></div><div class="card" data-id="outro"><div class="thumb"><img src="original.svg"></div></div>'});
      if(p==='/original.svg')return route.fulfill({contentType:'image/svg+xml',body:svg});
      if(p.endsWith('manifesto.json'))return route.fulfill({contentType:'application/json',body:JSON.stringify({version:1,thumbnails:{nota:{src:'imagens/miniaturas/nota.jpg',sha256:'a'.repeat(64)},totems:{src:'imagens/miniaturas/totems.jpg',sha256:'a'.repeat(64)},outro:{src:'https://fora.invalid/segredo.jpg',sha256:'a'.repeat(64)}}})});
      return route.fulfill({status:404,body:'Indisponível'});
    });
    await page.goto('https://qa.invalid/');await page.addScriptTag({content:await fs.readFile(path.join(__dirname,'cliente.js'),'utf8')});
    await page.waitForTimeout(400);assert.equal(await page.locator('[data-id=nota] img').getAttribute('src'),'original.svg');assert.equal(await page.locator('[data-id=nota] img').evaluate(e=>e.hidden),false);
    assert.equal(await page.locator('[data-id=totems] img').getAttribute('src'),'original.svg');assert.equal(external,0);
  }finally{await browser.close();}
});
test('publicador bloqueia outros arquivos e concorrência; um commit preserva a árvore existente',async()=>{
  const base=path.resolve(os.tmpdir(),'aps-miniaturas-tests');await fs.mkdir(base,{recursive:true});const root=await fs.mkdtemp(path.join(base,'publicar-'));
  try{
    await fs.mkdir(path.join(root,'miniaturas'));await fs.writeFile(path.join(root,'miniaturas/manifesto.json'),'{}');
    const a='a'.repeat(40),b='b'.repeat(40),c='c'.repeat(40),d='d'.repeat(40),calls=[];
    const api=async(method,endpoint,body)=>{
      calls.push({method,endpoint,body});
      if(endpoint==='ref/heads/main')return{object:{sha:a}};
      if(endpoint==='commits/'+a)return{tree:{sha:b}};
      if(endpoint==='blobs'){const bytes=Buffer.from(body.content,'base64');return{sha:require('crypto').createHash('sha1').update('blob '+bytes.length+'\0').update(bytes).digest('hex')}}
      if(endpoint==='trees')return{sha:c};if(endpoint==='commits')return{sha:d};if(endpoint==='refs/heads/main')return{object:{sha:d}};
      throw Error('CHAMADA_INESPERADA');
    };
    const input={root,report:{changed:['miniaturas/manifesto.json']},repo:'gaiafranklinalexandre-blip/LandingPage',source:a,api};
    await assert.rejects(()=>publish({...input,report:{changed:['index.html']}}),/CAMINHO_NAO_PERMITIDO/);assert.equal(calls.length,0);
    await assert.rejects(()=>publish({...input,api:async()=>({object:{sha:b}})}),/CONCORRENCIA/);
    await publish(input);assert.equal(calls.filter(c=>c.method==='POST'&&c.endpoint==='commits').length,1);
    assert.equal(calls.find(c=>c.endpoint==='trees').body.base_tree,b);assert.deepEqual(calls.find(c=>c.method==='POST'&&c.endpoint==='commits').body.parents,[a]);
    assert.equal(calls.find(c=>c.method==='PATCH').body.force,false);assert.deepEqual(calls.find(c=>c.endpoint==='trees').body.tree.map(e=>e.path),['miniaturas/manifesto.json']);
  }finally{const resolved=await fs.realpath(root);if(path.dirname(resolved)!==await fs.realpath(base))throw Error('LIMPEZA_FORA_DO_DIRETORIO_DE_TESTE');await fs.rm(resolved,{recursive:true,force:true});}
});
test('cliente aplica miniatura válida ao HTML real dos cards e restaura o fallback ao retirar o registro',async()=>{
  const browser=await launch();try{
    const page=await browser.newPage();let include=true;
    const image='<svg xmlns="http://www.w3.org/2000/svg" width="120" height="80"><rect width="120" height="80" fill="green"/></svg>';
    await page.route('https://qa.invalid/**',route=>{
      const name=new URL(route.request().url()).pathname;
      if(name==='/')return route.fulfill({contentType:'text/html; charset=utf-8',body:'<div class="card" data-id="nota"><div class="card-header"><div class="thumb"><img alt="Prévia da nota" src="original.svg"></div></div></div>'});
      if(name.endsWith('manifesto.json'))return route.fulfill({contentType:'application/json',body:JSON.stringify({version:1,thumbnails:include?{nota:{src:'imagens/miniaturas/nota.jpg',sha256:'b'.repeat(64)}}:{}})});
      return route.fulfill({contentType:'image/svg+xml',body:image});
    });
    await page.goto('https://qa.invalid/');await page.addScriptTag({content:await fs.readFile(path.join(__dirname,'cliente.js'),'utf8')});
    await page.waitForFunction(()=>document.querySelector('.thumb img').getAttribute('src').startsWith('imagens/miniaturas/'));
    await page.waitForFunction(()=>document.querySelector('.thumb img').complete&&document.querySelector('.thumb img').naturalWidth===120);
    include=false;await page.evaluate(()=>{const now=Date.now();Date.now=()=>now+300001;document.dispatchEvent(new Event('visibilitychange'));});
    await page.waitForFunction(()=>document.querySelector('.thumb img').getAttribute('src')==='original.svg');assert.equal(await page.locator('.thumb img').getAttribute('alt'),'Prévia da nota');
  }finally{await browser.close();}
});
