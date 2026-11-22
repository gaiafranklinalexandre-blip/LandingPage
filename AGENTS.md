# Instruções do projeto LANDING_PAGE

## Publicação

A regra do projeto APS 360 (`AGENTS.md` da raiz) vale aqui: **publicar no GitHub/Render exige autorização do usuário a cada vez**. A instrução de 20/10/2026 de publicar automaticamente, sem confirmação, está suspensa desde 12/11/2026, quando a landing foi integrada ao APS 360. [Pendente de confirmação do usuário: restabelecer a publicação automática só para esta pasta?]

- Conclua as alterações e execute as verificações pertinentes; depois peça autorização para publicar.
- Ao publicar, envie o HTML e todos os recursos novos ou alterados (imagens, instruções, documentação), confira o conteúdo remoto e informe o resultado e o endereço do site. Não declare publicação concluída se houver falha.
- Preserve alterações de terceiros e nunca publique credenciais, tokens ou o arquivo `.github_token`.

## Arquivos e destino

- Fonte da landing page: `Panorama_APS/landing_apoiadores_saps.html`.
- Esse HTML é publicado como `index.html` no repositório `gaiafranklinalexandre-blip/LandingPage`.
- Imagens: `Panorama_APS/imagens/`, publicadas em `imagens/` com os mesmos nomes e capitalização.
- `Panorama_APS/index.html` é outro painel; não o use como fonte da landing page.
- Site: https://atendimentos-saps.onrender.com/. O endereço antigo https://saps-atentimentos.onrender.com/ redireciona pelo JavaScript do índice desde 18/11/2026; preservar a condição de domínio para evitar ciclos.
- Use o endereço do Render para acesso e conferência da versão pública. Confira a implantação antes de afirmar que as mudanças estão no ar; o envio ao GitHub confirma a atualização do repositório.
- O publicador `Panorama_APS/publicar_landing.py` descobre recursos e confere hashes. Confira os arquivos necessários a cada atualização conforme a seção de identidade visual abaixo.

Consulte `README.md` para o fluxo de manutenção.

## Identidade visual compartilhada — 24/10/2026

- O padrão web vigente está em [docs/design.md](../docs/design.md), seção de 19/11/2026: gov.br DS com marca SUS. Fonte comum e regeneração no [README do tema](../02_PAGINAS_ONLINE/design_referencia/govbr/README.md).
- A fonte principal carrega `govbr_base.css`, `visual_saps.css/js` e `privacidade.css/js`; publicar as cinco dependências antes do HTML. O publicador descobre recursos e confere hashes; não usar a antiga lista fixa de imagens como referência.
- Preservar os IDs/links/descrições/imagens dos cartões e a chave existente de favoritos `aps_favoritos`.
- Google Analytics não deve carregar antes da escolha ou após recusa; não enviar pings de consentimento negado. Revogação bloqueia coleta futura e recarrega a página. Preferência separada por origem e chave `saps.landing.privacidade.v1`.
- Validação funcional e visual: `validacao/conferir_landing.cjs`. Repetir no Render após publicar; GitHub atualizado não comprova que o deploy está no ar.


## Totems para Eventos — 06/11/2026

- Card Totems classificado como Interno, mantido na categoria Eventos e no filtro de painéis internos. Categoria Eventos e card Totems apontam para `eventos/totems/index.html`.
- Página especial com visualização online e download direto dos HTMLs, sem ZIP. Ambos funcionam offline; destinos dos QR codes exigem internet.
- Fontes de entrega: `05_TOTEM/COMBO/index.html` e `05_TOTEM/EQUIDADE/index.html`. Não editar as cópias publicáveis nem enviar fontes, bases ou referências avulsas.
- Em toda atualização solicitada dos totens, gerar os HTMLs no projeto de origem e preparar as cópias para a landing page. Publicar somente com autorização do usuário para esse envio. O publicador sincroniza as duas entregas antes do envio, com hashes em `eventos/totems/manifesto.json`.
- Comando a partir da raiz do APS 360, após autorização: `python 03_LANDING_PAGE/Panorama_APS/publicar_landing.py --totem-source "05_TOTEM"`. Conferir o deploy no Render, visualização e download dos dois arquivos.


## Textos da interface — 09/11/2026

Não converter prompts, orientações internas ou justificativas de implementação em mensagens para o participante. Evitar frases genéricas de condução e textos que apenas repetem os botões, como “Explore no seu ritmo. Depois, siga para a próxima etapa.”. Conteúdo educativo, informação de estado necessária e rótulos de ação devem ser objetivos. As orientações de manutenção ficam na documentação. Regra detalhada também registrada em 05_TOTEM/AGENTS.md, Codex.md e no README do Equidade. A correção remove essas mensagens da entrega online e do download.

## Publicação sem Totems — 22/11/2026

Para alteração somente do portal, usar `Panorama_APS/publicar_landing.py --sem-totems`. Esse modo não prepara nem envia as entregas de Eventos. `--totem-source` somente quando Totems fizerem parte de um pedido explícito. Na padronização de 22/11/2026 a publicação já foi autorizada pelo usuário; concluir sem pedir nova confirmação.

## Miniaturas automáticas — 22/11/2026

Pedido do usuário: atualizar miniaturas **a cada nova publicação do hub**, mantendo os destinos Render + Hostinger. Seguir `Panorama_APS/miniaturas/README.md`. Fonte: catálogo, capturador, cliente e publicador nessa pasta; workflow `.github/workflows/atualizar-miniaturas.yml` no repositório LandingPage. Atualizar o catálogo junto dos IDs/URLs de cards novos. Capturar somente destinos públicos sem autenticação; Totems e Power BI autenticado conservam suas imagens existentes. O cliente mantém fallback e versão de cache por hash.

A atualização automática autoriza o fluxo de imagens geradas `imagens/miniaturas/` e o manifesto desse hub. Publicar mudanças de automação com manifesto explícito; nunca incluir relatórios locais ou credenciais. Commits dos próprios arquivos gerados ficam fora do gatilho. Conferir execução GitHub e entrega Render; alteração no Git não é prova de imagem atualizada no navegador. A skill Sites fornece somente boas práticas; a hospedagem continua nos serviços existentes.

## Estrutura comum e catálogo de Eventos — 22/11/2026

Cabeçalho, menu lateral e rodapé do hub e de Notas usam a fonte única `02_PAGINAS_ONLINE/design_referencia/govbr/estrutura-portal.css`, aplicada somente a `body[data-aps-layout="portal"]`. Não reintroduzir medidas independentes nos dois produtos. `sincronizar.py` também versiona as referências CSS/JS por hash para evitar cache antigo.

O usuário pediu explicitamente o padrão gov.br na página `eventos/totems/index.html`. Alterar somente esse catálogo e `totems.css`, preservando os HTMLs de jogos e downloads. Não executar `preparar_totems.py` nem enviar entregas dos jogos em uma revisão só do catálogo. Verificar os nomes `totem-combo-ubs.html` e `totem-caminhos-equidade.html`, teclado e sete larguras com `validacao/conferir_catalogo_totems_govbr.cjs`.
