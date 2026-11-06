"""Copia somente os dois HTMLs de entrega e prepara os downloads offline."""
import hashlib
import json
from pathlib import Path

PASTA = Path(__file__).resolve().parent
JOGOS = [('COMBO', 'combo', 'Jogo do Combo de Equipamentos para UBS'),
         ('EQUIDADE', 'equidade', 'Totem Caminhos da Equidade')]


def preparar(origem):
    origem = Path(origem).resolve()
    destino = PASTA / 'eventos' / 'totems'
    destino.mkdir(parents=True, exist_ok=True)
    manifesto = []
    for pasta, slug, titulo in JOGOS:
        fonte = origem / pasta / 'index.html'
        dados = fonte.read_bytes()
        if b'</html>' not in dados.lower():
            raise ValueError('HTML incompleto: ' + pasta)
        (destino / f'{slug}.html').write_bytes(dados)
        manifesto.append(dict(jogo=titulo, arquivo=f'{slug}.html', bytes=len(dados),
                              sha256=hashlib.sha256(dados).hexdigest()))
    (destino / 'manifesto.json').write_text(json.dumps(manifesto, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    return destino
