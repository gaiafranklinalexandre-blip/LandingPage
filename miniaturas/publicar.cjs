/* Publica somente capturas geradas e o manifesto; usa GITHUB_TOKEN em memória. */
'use strict';
const fs=require('node:fs/promises'),path=require('node:path'),crypto=require('node:crypto');
const gitSha=data=>crypto.createHash('sha1').update('blob '+data.length+'\0').update(data).digest('hex');
const safeSha=v=>{if(!/^[a-f0-9]{40}$/.test(v||''))throw Error('SHA_INVALIDO');return v};
async function publish({root,report,repo,source,api}){
  if(repo!=='gaiafranklinalexandre-blip/LandingPage'||!source)throw Error('AMBIENTE_INVALIDO');
  if(!report.changed.length)return null;
  const files=[];
  for(const name of report.changed){
    if(name!=='miniaturas/manifesto.json'&&!/^imagens\/miniaturas\/[a-z0-9]+(?:-[a-z0-9]+)*\.jpg$/.test(name))throw Error('CAMINHO_NAO_PERMITIDO');
    const data=await fs.readFile(path.join(root,name));files.push({path:name,data,sha:gitSha(data)});
  }
  const head=safeSha((await api('GET','ref/heads/main')).object.sha);
  if(head!==source)throw Error('CONCORRENCIA_REEXECUTAR');
  const tree=safeSha((await api('GET','commits/'+head)).tree.sha);
  for(const file of files){const blob=await api('POST','blobs',{content:file.data.toString('base64'),encoding:'base64'});if(safeSha(blob.sha)!==file.sha)throw Error('BLOB_DIVERGENTE');}
  const nextTree=safeSha((await api('POST','trees',{base_tree:tree,tree:files.map(f=>({path:f.path,mode:'100644',type:'blob',sha:f.sha}))})).sha);
  const commit=safeSha((await api('POST','commits',{message:'Atualiza miniaturas públicas dos painéis',tree:nextTree,parents:[head]})).sha);
  if((await api('GET','ref/heads/main')).object.sha!==head)throw Error('CONCORRENCIA_REEXECUTAR');
  if(safeSha((await api('PATCH','refs/heads/main',{sha:commit,force:false})).object.sha)!==commit)throw Error('REF_DIVERGENTE');
  return commit;
}
async function main(){
  const token=process.env.GITHUB_TOKEN,repo=process.env.GITHUB_REPOSITORY,source=process.env.GITHUB_SHA;
  if(!token)throw Error('AMBIENTE_INVALIDO');
  const report=JSON.parse(await fs.readFile(process.env.MINIATURAS_REPORT,'utf8'));
  async function api(method,endpoint,body){
    const response=await fetch('https://api.github.com/repos/'+repo+'/git/'+endpoint,{method,redirect:'error',headers:{Authorization:'Bearer '+token,Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2026-03-10','Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{})});
    if(!response.ok)throw Error('GITHUB_HTTP_'+response.status);return response.json();
  }
  const commit=await publish({root:path.resolve(__dirname,'..'),report,repo,source,api});
  console.log(commit?'Commit de miniaturas: '+commit:'Nenhuma mudança para publicar.');
  if(commit&&process.env.GITHUB_STEP_SUMMARY)await fs.appendFile(process.env.GITHUB_STEP_SUMMARY,'\nCommit publicado: `'+commit+'`. O Render recebe a atualização pelo fluxo existente.\n');
}
module.exports={publish};
if(require.main===module)main().catch(e=>{console.error(/^[A-Z_0-9]+$/.test(e.message)?e.message:'FALHA_PUBLICACAO');process.exitCode=1});
