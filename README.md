# Landing page de painéis SAPS

## Identidade visual — 24/10/2026

Aplicado o padrão aprovado do painel de notas técnicas: cabeçalho branco, azuis #1351b4/#071d41, sombras suaves e degradês, navegação lateral recolhível por categorias/temas, controles de busca de 48 px, cartões com textos legíveis e ações alinhadas. Os 13 cartões, links, descrições e imagens existentes foram preservados, assim como favoritos e a abertura já existente em modal. Busca sem resultados e Limpar seleções integrados às categorias.

Fonte principal permanece `Panorama_APS/landing_apoiadores_saps.html`. Novas dependências publicadas junto dela: `visual_saps.css`, `visual_saps.js`, `privacidade.css`, `privacidade.js`. `cabecalho_saps.html` conserva a estrutura editável incorporada ao HTML. Privacidade: Google Analytics somente após aceite opcional, recusa sem tag/pings Google, preferência em `saps.landing.privacidade.v1`, reabertura pelo rodapé e revogação com recarga. Favoritos continuam em `aps_favoritos`.

`publicar_landing.py` agora descobre os recursos locais referenciados no HTML, valida caminhos/existência, publica dependências antes do índice e compara hashes. Arquivos sem alteração não são reenviados. Documentação e script acompanham a publicação; credenciais nunca são incluídas. O endereço de saída foi corrigido para o Render.

Validação: `node validacao/conferir_landing.cjs` com servidor local na porta 8943 ou variável LANDING_TEST_URL para o site público. Confere igualdade dos 13 cartões com o inventário anterior, imagens reais, categorias, busca/limpar, favoritos persistidos, modal e sete larguras de 320 a 1920 px, alturas de 48 px e ausência de erros JS/transbordamento. Confere recusa/aceite/revogação de Analytics com tag interceptada para não coletar QA. Capturas em validacao/landing-*.png.

Este projeto mantém a página de acesso aos painéis e sistemas da SAPS.

## Fonte e publicação

A fonte da landing page é `Panorama_APS/landing_apoiadores_saps.html`. No repositório GitHub `gaiafranklinalexandre-blip/LandingPage`, esse arquivo corresponde a `index.html`. As imagens ficam em `Panorama_APS/imagens/` e são publicadas em `imagens/`.

O arquivo local `Panorama_APS/index.html` contém outro painel e não é a fonte da landing page.

Site público: https://saps-atentimentos.onrender.com/

O endereço de referência para acesso e conferência é o do Render acima. O repositório GitHub é o destino dos arquivos e do histórico de alterações.

## Regra de atualização automática

Em 20/10/2026, o usuário autorizou que as atualizações concluídas deste projeto sejam enviadas automaticamente ao GitHub, sem nova confirmação para push ou publicação. A regra também consta em `AGENTS.md` e se aplica às próximas tarefas de manutenção.

1. Alterar a fonte e os recursos solicitados, preservando o padrão existente.
2. Verificar links, nomes e existência das imagens, textos, categorias e identificadores dos cartões conforme a alteração.
3. Publicar todos os arquivos necessários, incluindo recursos novos ou alterados e alterações nas instruções e documentação. Publicar imagens antes do HTML que as utiliza.
4. Conferir o conteúdo no GitHub após o envio e informar o resultado e o link do site. O endereço público é hospedado no Render. Conferir a atualização nesse endereço antes de afirmar que a versão está no ar; o envio ao GitHub, isoladamente, confirma apenas a atualização do repositório.

Se o usuário pedir trabalho apenas local, solicitar que não seja publicado ou mandar aguardar, seguir essa orientação. Em caso de erro, informar a falha sem declarar sucesso.

## Ferramenta existente

`Panorama_APS/publicar_landing.py` contém a integração existente com a API de conteúdos do GitHub. A lista de imagens desse script é fixa: é necessário ajustá-la ou enviar explicitamente todos os arquivos da atualização. A publicação pode usar commits via API ou push de um checkout disponível, sempre verificando o conteúdo remoto.

As credenciais locais não fazem parte do conteúdo publicável. Nunca enviar `.github_token`, tokens ou outros segredos ao repositório, à documentação ou aos logs.

## Alterações registradas em 20/10/2026

- Incluído o cartão SIOPS na seção Financiamento, com destino `https://portal-dados-municipais.lovable.app/` e imagem `imagens/SIOPS.png`.
- Descrição do cartão: “Painel interativo com nova experiência de consulta dos indicadores municipais do SIOPS.”
- Removido o cartão “Distribuição dos Combos de Equipamentos para UBS”. Mantido o “Painel de Monitoramento de Entregas dos Combos AgSUS”.
- HTML e imagem enviados ao GitHub e conferidos no repositório.
- Registrada a autorização de publicação automática das próximas atualizações e corrigido o endereço público para o Render.

O script antigo ainda imprime um endereço do GitHub Pages ao terminar. Para acesso ao projeto, usar o endereço do Render documentado acima. A conferência do conteúdo no repositório não comprova, por si só, a implantação no Render.
