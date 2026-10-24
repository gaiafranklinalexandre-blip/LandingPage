# Instruções do projeto LANDING_PAGE

## Publicação automática

Por instrução expressa do usuário em 20/10/2026, publique automaticamente no GitHub as atualizações concluídas deste projeto, sem pedir nova confirmação para push ou publicação.

- Conclua as alterações solicitadas e execute as verificações pertinentes antes de publicar.
- Envie o HTML atualizado e todos os recursos novos ou alterados necessários, incluindo imagens, instruções e documentação.
- Confira o conteúdo remoto após o envio e informe o resultado e o endereço do site. Não declare publicação concluída se houver falha; informe o bloqueio.
- Uma solicitação explícita de trabalho apenas local, de não publicar ou de aguardar prevalece sobre esta regra.
- Preserve alterações de terceiros e nunca publique credenciais, tokens ou o arquivo `.github_token`.

## Arquivos e destino

- Fonte da landing page: `Panorama_APS/landing_apoiadores_saps.html`.
- Esse HTML é publicado como `index.html` no repositório `gaiafranklinalexandre-blip/LandingPage`.
- Imagens: `Panorama_APS/imagens/`, publicadas em `imagens/` com os mesmos nomes e capitalização.
- `Panorama_APS/index.html` é outro painel; não o use como fonte da landing page.
- Site: https://saps-atentimentos.onrender.com/
- Use o endereço do Render para acesso e conferência da versão pública. Confira a implantação antes de afirmar que as mudanças estão no ar; o envio ao GitHub confirma a atualização do repositório.
- O script existente `Panorama_APS/publicar_landing.py` usa uma lista fixa de imagens. Confira os arquivos necessários a cada atualização; não presuma que executar esse script publica todos os recursos.

Consulte `README.md` para o fluxo de manutenção.

## Identidade visual compartilhada — 24/10/2026

- Manter o padrão aprovado do painel de notas técnicas: branco/azul, degradês e sombras discretos, menu lateral recolhível, campos e ações de filtros com altura efetiva de 48 px e sem encolhimento por flex.
- A fonte principal carrega `visual_saps.css/js` e `privacidade.css/js`; publicar as quatro dependências antes do HTML. O publicador descobre recursos e confere hashes; não usar a antiga lista fixa de imagens como referência.
- Preservar os IDs/links/descrições/imagens dos cartões e a chave existente de favoritos `aps_favoritos`.
- Google Analytics não deve carregar antes da escolha ou após recusa; não enviar pings de consentimento negado. Revogação bloqueia coleta futura e recarrega a página. Preferência separada por origem e chave `saps.landing.privacidade.v1`.
- Validação funcional e visual: `validacao/conferir_landing.cjs`. Repetir no Render após publicar; GitHub atualizado não comprova que o deploy está no ar.
