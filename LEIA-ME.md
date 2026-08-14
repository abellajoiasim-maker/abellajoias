# Abella Joias — Home Melhorada (abellajoias.com.br)

Este pacote contém a versão melhorada da página principal **abellajoias.com.br**, com o mesmo padrão visual premium do catálogo (design system AURORA) e novas seções que aumentam a conversão no atacado.

## O que mudou

| Item | Descrição |
|---|---|
| Visual premium | Tipografia Cormorant Garamond + Jost, paleta marfim/dourado, header sticky com logo centralizada e blur |
| Ícones originais | WhatsApp oficial (SVG verde) em todos os botões; ícones originais de Facebook, Instagram e TikTok no contato e footer |
| Bandeira BR | Bandeira do Brasil redesenhada com proporção oficial na faixa "100% Nacional" |
| Hero 16:9 | Banner em proporção correta, com card "5% de desconto no PIX" posicionado abaixo da imagem (sem sobreposição) |
| Dados vivos do painel | Parcelamento e PIX vêm de `abella/settings` (nada fixado no código) |
| Nossos Números | Contadores animados: +1.500 produtos (real do Firebase), +500 revendedoras, +150 cidades, 100% nacional |
| Promoções vigentes | Grid de cards com imagem, selo, preço riscado + preço dourado — **editável pelo painel** |
| Destaques | 4 produtos reais do Firebase com foto, categoria, nome e preço — agora com **desconto dinâmico** (selo -X% OFF + preço riscado) aplicado automaticamente |
| Depoimentos | Seção de prova social com estrelas e aspas serifadas |
| FAQ animado | Acordeão com transição suave (+/–) |
| Correções | FAQ com respostas dinâmicas do painel, race condition do hero, imagens de categoria com fallback, parcelas corretas (3x) |
| SEO | JSON-LD (Organization, Website, FAQPage), Open Graph, Twitter Cards e sitemap |
| Rastreamento | GA4 + Clarity já existentes; novos eventos `clique_conversao` em promoções e CTAs |

## Como publicar

Basta substituir os arquivos no repositório/FTP que serve `abellajoias.com.br`:

```
index.html          (raiz)
styles.css          (raiz)
js/                 (raiz, substituir toda a pasta)
robots.txt          (raiz)
sitemap.xml         (raiz)
CNAME               (raiz)
```

## Como cadastrar promoções na home

No painel do catálogo (`catalogo.abellajoias.com.br/modulo/config.html`), há agora a seção **🏷️ Promoções da Home (abellajoias.com.br)**:

1. Preencha **imagem** (link `https://...` ou `gs://...`), **título**, descrição, **selo** (ex.: Oferta), **preço de** (riscado) e **preço por** (destaque)
2. Opcionalmente, adicione um **link** específico (ex.: `https://catalogo.abellajoias.com.br/subcategorias.html?categoria=cruzes`)
3. Clique em **Salvar** — os cards aparecem automaticamente na home (máximo 6)

Cards vazios são ignorados. Os dados são gravados em `abella/promocoes` no Firebase, a mesma base que o site lê.

## Como exibir produtos específicos em "Destaques"

Por padrão a seção mostra os 4 produtos mais recentes. Para fixar peças específicas, edite o produto no painel e marque o campo de destaque (campos `destaque`/`highlight` do registro em `abella/products`). Produtos marcados têm prioridade; em seguida, produtos com preço promocional; por último, os mais recentes.

## Descontos nos produtos em destaque

A home agora usa o mesmo motor de desconto do catálogo (`js/services/descontoService.js`), lido de `abella/settings`:

- **Desconto global** (Configurações → Descontos → "ativo" + percentual): aplica automaticamente em todas as peças da seção, mostrando o preço riscado ("de"), o novo preço ("por") e o selo vermelho **-X% OFF** sobre a foto — sem nenhum ajuste na home.
- **Desconto por categoria/subcategoria** (regras no mesmo painel): tem prioridade sobre o global para as peças daquela categoria.
- **Preço promocional individual** do produto (campo `promocao`): também é respeitado.

Você controla tudo pelo painel, exatamente como já faz no catálogo; a home reage sozinha.

## Nota sobre o painel

O arquivo `modulo/config.html` neste pacote é a **versão atualizada** do painel do catálogo (com a nova seção de promoções). Se quiser, substitua o `config.html` do seu painel por este para ativar o recurso de promoções.

## Configurações do Firebase

Nada precisa ser configurado: todos os dados vêm de `abella/settings` (parcelas, PIX, WhatsApp, slogan, redes sociais, banners), `abella/promocoes` e `abella/products`, já lidos por regras públicas de leitura.

## Atualização de modernização — 2026

A versão aprovada da página institucional usa os seguintes padrões comerciais iniciais, editáveis no `config.html`: **5% de desconto no PIX**, **3x sem juros** e frete grátis para galvânicas de Limeira-SP em compras acima de **R$ 100,00**.

Os campos `instagram`, `facebook`, `tiktok`, `pix`, `pixDesc`, `parcelas`, `parcelasMax`, `freteGratisAlvo` e `enderecoTexto` são tratados com aliases compatíveis para evitar divergência entre painel, home e catálogo.

As rotas antigas `/galvanicas-parceiras/` e `/categoria-produto/brincos/` receberam páginas de contingência com redirecionamento instantâneo e `noindex`. Para SEO, configure redirects permanentes 301 ou 308 no provedor/CDN quando essa camada estiver disponível. A rota de brincos deve ser atualizada para o slug exato do catálogo assim que ele for confirmado.

Antes de publicar, confirme os links de Instagram, Facebook e TikTok no painel e valide a home, o catálogo, o WhatsApp, as imagens sociais e as rotas antigas em desktop e mobile.
