"""
publicar_landing.py
Publica landing_apoiadores_saps.html (como index.html) e as imagens
novas da pasta imagens/ no repositorio GitHub LandingPage.
Uso: python publicar_landing.py
"""

import base64
import hashlib
import json
import re
import sys
import urllib.request
import urllib.error
from pathlib import Path
from html import unescape
from urllib.parse import urlsplit

USUARIO      = "gaiafranklinalexandre-blip"
REPO         = "LandingPage"
ARQUIVO_LOCAL = "landing_apoiadores_saps.html"
ARQUIVO_REMOTO = "index.html"
PASTA        = Path(__file__).parent
IMAGENS_DIR  = PASTA / "imagens"
TOKEN_FILE   = Path(__file__).parent.parent / ".github_token"


def carregar_token():
    if TOKEN_FILE.exists():
        token = TOKEN_FILE.read_text(encoding="utf-8").strip()
        if token:
            return token
    print("=" * 60)
    print("PRIMEIRA VEZ: precisamos do seu token do GitHub.")
    print("  1. Acesse: https://github.com/settings/tokens/new")
    print("  2. Marque a permissao: repo")
    print("  3. Copie o token gerado")
    print("=" * 60)
    token = input("Cole o token aqui: ").strip()
    if not token:
        print("Token nao informado. Abortando.")
        sys.exit(1)
    TOKEN_FILE.write_text(token, encoding="utf-8")
    return token


def enviar_arquivo(token, caminho_local, caminho_remoto, mensagem):
    if not caminho_local.exists():
        raise FileNotFoundError(f'Recurso obrigatório ausente: {caminho_local.name}')

    conteudo = caminho_local.read_bytes()
    conteudo_b64 = base64.b64encode(conteudo).decode("utf-8")
    api_url = f"https://api.github.com/repos/{USUARIO}/{REPO}/contents/{caminho_remoto}"
    headers = {
        "Authorization": f"token {token}",
        "Accept": "application/vnd.github.v3+json",
        "Content-Type": "application/json",
    }

    req_get = urllib.request.Request(api_url, headers=headers)
    try:
        with urllib.request.urlopen(req_get, timeout=60) as resp:
            sha = json.loads(resp.read()).get("sha")
    except urllib.error.HTTPError as e:
        if e.code == 404:
            sha = None
        else:
            raise RuntimeError(f'Erro ao consultar {caminho_remoto}: HTTP {e.code}') from None

    sha_local = hashlib.sha1(f'blob {len(conteudo)}\0'.encode() + conteudo).hexdigest()
    if sha == sha_local:
        print(f'Sem alteração: {caminho_remoto}', flush=True)
        return

    payload = {"message": mensagem, "content": conteudo_b64}
    if sha:
        payload["sha"] = sha

    req_put = urllib.request.Request(
        api_url, data=json.dumps(payload).encode(), headers=headers, method="PUT"
    )
    try:
        with urllib.request.urlopen(req_put, timeout=60) as resp:
            json.loads(resp.read())
            print(f"OK: {caminho_remoto}", flush=True)
        with urllib.request.urlopen(req_get, timeout=60) as resp:
            if json.loads(resp.read()).get('sha') != sha_local:
                raise RuntimeError(f'Conferência remota divergente: {caminho_remoto}')
    except urllib.error.HTTPError as e:
        raise RuntimeError(f'Erro ao publicar {caminho_remoto}: HTTP {e.code}') from None


def publicar(token):
    print(f"Conectando ao GitHub ({REPO})...")

    html = (PASTA / ARQUIVO_LOCAL).read_text(encoding='utf-8')
    recursos = set()
    for valor in re.findall(r'(?:src|href)="([^"]+)"', html):
        url = urlsplit(unescape(valor))
        if url.scheme or url.netloc or not url.path:
            continue
        relativo = url.path
        recurso = (PASTA / relativo).resolve()
        if not recurso.is_relative_to(PASTA.resolve()) or recurso.suffix.lower() not in ('.png','.jpg','.jpeg','.webp','.svg','.css','.js'):
            raise RuntimeError('Referência local não permitida: ' + relativo)
        if not recurso.is_file():
            raise FileNotFoundError('Recurso obrigatório ausente: ' + relativo)
        recursos.add(relativo)
    # Recursos antes do HTML; comparação de hashes evita reenvios desnecessários.
    for relativo in sorted(recursos):
        enviar_arquivo(token, PASTA / relativo, relativo, 'Atualiza recurso visual SAPS: ' + relativo)
    for documento in ('AGENTS.md', 'README.md'):
        enviar_arquivo(token, PASTA.parent / documento, documento, 'Documenta identidade visual e publicação SAPS')
    enviar_arquivo(token, Path(__file__), 'publicar_landing.py', 'Valida recursos e publicação no Render')
    enviar_arquivo(token, PASTA / ARQUIVO_LOCAL, ARQUIVO_REMOTO, 'Aplica identidade visual APS: navegação, cartões e privacidade')

    print()
    print("Publicado com sucesso!")
    print('  GitHub atualizado e conferido por hash. Aguardar deploy do Render.')
    print('  Site: https://saps-atentimentos.onrender.com/')


if __name__ == "__main__":
    publicar(carregar_token())
