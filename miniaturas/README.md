# Atualização automática de miniaturas

O hub mantém as imagens originais como fallback e consulta `miniaturas/manifesto.json`. Uma captura nova troca somente a imagem do respectivo card; o endereço recebe a versão SHA-256 para evitar cache antigo. Abas já abertas consultam novamente a cada cinco minutos quando visíveis. Falha de rede ou de imagem mantém/restaura a imagem anterior. A demonstração `file://` continua offline, com as imagens incorporadas.

## Execução após publicação

Workflow `Atualizar miniaturas dos painéis`, em `.github/workflows/atualizar-miniaturas.yml` do repositório `LandingPage`. Frequência escolhida pelo usuário: **a cada nova publicação do hub**, por push em `main`; também há acionamento manual em **Actions → Atualizar miniaturas dos painéis → Run workflow**. Commits que alteram apenas `imagens/miniaturas/` e o manifesto ficam fora do gatilho, para evitar ciclos. A atualização dos arquivos gerados usa o fluxo atual de deploy do Render. Não foi configurada execução diária.

Uma publicação nova substitui a captura anterior ainda em andamento. As imagens existentes permanecem disponíveis até a captura da versão atual terminar; o publicador também recusa uma gravação baseada em HEAD antigo.

A automação usa Node 24, Playwright **1.64.1** e Chromium no Ubuntu 24.04. As duas Actions estão fixadas por commit. A captura não recebe credenciais; o publicador usa o token efêmero do próprio GitHub apenas em memória. Nenhum serviço de hospedagem foi criado: o Render recebe as imagens pelo fluxo existente, e notas/APIs permanecem na Hostinger.

## Escopo e preservação

`catalogo.json` contém os 16 cards e seus destinos. São 14 tentativas públicas habilitadas. O Power BI AgSUS que exige login mantém a miniatura existente; Totems ficam excluídos conforme a decisão do usuário. A rotina não autentica, não acessa dados privados, não altera o conteúdo dos painéis nem modifica Totems/Modo Tático.

HTTP de erro, redirecionamento de login, campo de senha, mensagem de indisponibilidade, página incompleta, captura vazia e timeout preservam a imagem anterior. As verificações são técnicas; não substituem uma revisão humana do conteúdo de sites terceiros. Falhas individuais ficam no resumo da execução. Caso todos os destinos falhem, o hub continua com os fallbacks.

Arquivos gerados: `imagens/miniaturas/<id>.jpg` e `miniaturas/manifesto.json`. O publicador aceita somente esses caminhos, reúne as alterações num commit e recusa concorrência em `main`; não faz force push. Em caso de concorrência, executar novamente sobre a versão atual. Imagens idênticas não geram novo commit. Relatórios completos ficam na pasta temporária do runner e no resumo do job.

## Manutenção

Ao adicionar ou alterar um card, alinhar seu ID e URL em `catalogo.json`. Um destino protegido deve continuar desabilitado; um site público novo pode exigir ajuste da espera ou do seletor `ready`. Não usar nomes de arquivos fora do namespace de imagens geradas. Não incluir tokens, cookies, senhas ou sessões autenticadas.

Na raiz APS 360, usando a instalação já existente de Playwright:

```powershell
$env:APS_PLAYWRIGHT = (Resolve-Path '01_NOTAS_TECNICAS/bases_complementares/DIGISUS/node_modules/playwright').Path
$env:APS_BROWSER_CHANNEL = 'msedge'
node --test 03_LANDING_PAGE/Panorama_APS/miniaturas/testes.cjs
node 03_LANDING_PAGE/Panorama_APS/miniaturas/atualizar.cjs --somente notas-tecnicas --report "$env:TEMP/aps-miniaturas.json"
```

O relatório local não deve ser publicado. Atualizar a fonte e os arquivos remotos em um commit revisado; conferir a execução automática no GitHub e a miniatura no Render. O pedido de atualização automática autoriza as próximas publicações de miniaturas deste hub; a regra não se estende a outros arquivos ou projetos. A rotina verifica os destinos do catálogo quando o hub é publicado; alterações em sites terceiros, sem uma publicação do hub, dependem do acionamento manual.

O manifesto de manutenção `02_PAGINAS_ONLINE/validacao/manifesto_miniaturas_20261122.json`, na raiz APS 360, preserva os arquivos gerados no GitHub. O manifesto `manifesto_miniaturas_bootstrap_20261122.json` foi usado somente na implantação inicial; não reutilizar uma cópia antiga de imagens/manifesto para sobrescrever o estado automático atual. O conteúdo gerado remoto é a referência para sincronizar uma prévia local.

A revisão inicial de capturas identificou retorno de indisponibilidade do Mais Médicos e um carregamento sem conteúdo no Panorama legado. Essas capturas foram retiradas do manifesto e a verificação foi reforçada com casos de teste correspondentes; os cards conservam as imagens originais até uma captura válida. A miniatura não modifica nem substitui o destino do card.

Verificações locais: captura real das Notas, casos simulados de HTTP/login/página vazia, fallback no navegador, exclusão de Totems e URLs externas, bloqueio de outros caminhos, árvore preservada e concorrência sem force. Execução remota e hashes são registrados em `03_LANDING_PAGE/validacao/publicacao_miniaturas_20261122.json`, na fonte APS 360.

Referências oficiais: [capturas com Playwright](https://playwright.dev/docs/screenshots), [agendamento GitHub Actions](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#schedule) e [API de árvores Git](https://docs.github.com/en/rest/git/trees#create-a-tree).
