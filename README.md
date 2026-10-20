# Landing page de painéis SAPS

Este projeto mantém a página de acesso aos painéis e sistemas da SAPS.

## Fonte e publicação

A fonte da landing page é `Panorama_APS/landing_apoiadores_saps.html`. No repositório GitHub `gaiafranklinalexandre-blip/LandingPage`, esse arquivo corresponde a `index.html`. As imagens ficam em `Panorama_APS/imagens/` e são publicadas em `imagens/`.

O arquivo local `Panorama_APS/index.html` contém outro painel e não é a fonte da landing page.

Site público: https://saps-atentimentos.onrender.com/

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
