# Battlesnake Arena × DevCommunity — reskin

Overhaul visual da [BattlesnakeOfficial/arena](https://github.com/BattlesnakeOfficial/arena)
pra rodar como a arena do Battlesnake da DevCommunity. Mantém a estrutura e a
"personalidade editorial" que o site já tinha (papel claro, hairlines, dados
em mono) — só troca a paleta pink por azul marinho + vermelho, cabeia o logo,
e adiciona uma camada pequena de interatividade.

Isso **não é o site rodando** — é o patch pra aplicar no seu fork do
`arena/` (submódulo), mais um preview estático (`preview.html`) pra você ver
o resultado sem precisar compilar nada.

---

## 1. O que mudou, em uma imagem

Abre o `preview.html` no navegador. Ele usa o `arena.css` e o
`interactions.js` reais deste patch — o que você vê ali é exatamente o que
vai renderizar depois de aplicado, com fonte do Google Fonts carregando
normalmente (só não carrega aqui no meu sandbox, que não tem acesso à
internet). Tem um botão "Alternar tema" no topo pra ver claro/escuro.

## 2. Sistema de cores

Antes era **uma cor só** (`--pink`) fazendo tudo — nav, botões, foco, "ao
vivo", erro. Isso não dava pra manter com "foco em azul marinho e um pouco
de vermelho", então virou duas famílias de token com papéis bem definidos:

| Token | Papel | Usa em |
|---|---|---|
| `--accent` (azul) | **cor dominante** — é a marca | nav ativo, botões, links, foco, borda de card, kicker, rank/1º lugar, vitória em bracket |
| `--red` | **reservado** — só pra "acontecendo agora" ou "deu errado" | live-dot, badge "Live", pílula de rodada, partida ao vivo no bracket, erro de formulário, "ganhou" no ticker |

Vermelho nunca virou decoração solta — cada uso dele responde "isso é
urgente, ao vivo, ou está errado" olhando pro componente. Isso também
resolve uma ambiguidade que a paleta antiga tinha: agora dá pra saber, só
pela cor, se algo é "seu melhor resultado" (azul) ou "está rolando agora"
(vermelho).

### Valores exatos

Toda a paleta foi gerada com uma rampa HSL consistente (mesmo matiz de navy
em `--paper`/`--card`/`--hairline`, variando só a luminância) e cada par
texto/fundo foi conferido contra WCAG AA — nenhum ficou abaixo de 4.5:1.

```css
/* claro */
--paper: #F5F7FB;   --ink: #111A2F;      --muted: #586584;
--hairline: #DBE1ED; --hairline-dark: #C5CDE0;
--accent: #185AC3;  --accent-deep: #0F4295; --accent-wash: #EBF2FC;
--red: #C81E29;     --red-deep: #9A131C;    --red-wash: #FDEDEE;

/* escuro — data-app-theme="dark" */
--paper: #0A0F1C;   --ink: #E9EEF9;      --muted: #8D9DC4;
--hairline: #202E4E; --hairline-dark: #2D3E64;
--accent: #4D91FF;  --accent-deep: #85B4FF;
--red: #FF4D58;      --red-deep: #FF858D;
```

`--up`/`--down` (delta de rating, verde/vermelho-tijolo) ficaram como
estavam — são semânticos, não têm relação com a marca.

De onde veio o azul e o vermelho: **não inventei**. Puxei do
`logo_dev.png`/`logo_dev_white.png` (blue `#1182D0` → red `#EE0A10` no
gradiente do chevron), do `novo_repositorio_portal_interno_front` (accent
`#4562B3`/`#B34444` no tema escuro) e do `clean_front_next_template`
(botão primário `#1145AA`/`#0D3A8B`). A paleta final é uma versão refinada
(contraste + consistência de matiz) desses valores reais, não um
azul-e-vermelho genérico.

### O único gradiente do site

O board decorativo da hero agora tem **duas cobras**: uma azul, uma
vermelha — literalmente as duas cores da marca disputando o tabuleiro, o
que faz sentido tanto pro "arena" quanto pro chevron do logo. A comida virou
dourada, pra não competir com nenhum dos dois times.

O único outro lugar com gradiente é o card de **campeão coroado** no
bracket (borda azul→vermelho, 135deg) — reservado pro momento mais alto do
torneio, não reaproveitado em mais nada.

## 3. Arquivos deste patch

```
patch/server/static/arena.css              retema completo + animações novas
patch/server/static/interactions.js         NOVO — scroll-reveal + contador
patch/server/static/mauadev-logo.svg        NOVO — placeholder do logo (troque pelo real)
patch/server/src/components/page.rs         logo no wordmark, favicon, footer, <script> novo
patch/server/src/routes.rs                  board decorativo azul×vermelho, data-reveal na home
patch/server/src/routes/leaderboard.rs      accent em vez de pink, contador na stat band
patch/server/src/routes/tournament.rs       cor do ícone play do theater-strip
```

### Aplicar no seu fork

```bash
# dentro do devcommunity_battlesnake_arena, com o submodule já apontando
# pro seu fork de BattlesnakeOfficial/arena
cp -r patch/server/static/* arena/server/static/
cp patch/server/src/components/page.rs   arena/server/src/components/page.rs
cp patch/server/src/routes.rs             arena/server/src/routes.rs
cp patch/server/src/routes/leaderboard.rs arena/server/src/routes/leaderboard.rs
cp patch/server/src/routes/tournament.rs  arena/server/src/routes/tournament.rs

cd arena
cargo fmt
cargo check    # não toquei em nenhuma query SQL — o cache .sqlx existente continua válido
cargo clippy
cargo test
```

Não rodei `cargo build` aqui (sem toolchain Rust no meu ambiente, e o
projeto puxa bastante dependência — sentry, opentelemetry, sqlx). Toda
edição em Rust foi só markup/atributo/cor (nada de lógica nova), e chequei
manualmente chaves balanceadas em cada arquivo, mas vale rodar
`cargo check` antes de dar merge.

### Ver rodando de verdade

Pelo fluxo que vocês já usam (`README.md` da raiz):

```bash
git submodule update --init --recursive
cd deploy
cp .env.example .env
# BASE_URL=http://localhost, DOMAIN_NAME=localhost, credenciais do GitHub App
docker compose up -d --build
```

Abre `http://localhost`. Primeiro build da imagem Rust demora alguns
minutos.

## 4. Trocar o logo placeholder

O `mauadev-logo.svg` que mandei é só uma marca provisória (chevron com o
mesmo gradiente azul→vermelho, mas abstrata — não tentei recriar o logo
real a partir da amostra que vi em outro repo). Pra trocar:

1. Substitua **o arquivo `patch/server/static/mauadev-logo.svg` pelo logo
   real, mantendo esse exato nome** (`mauadev-logo.svg`). SVG é o ideal
   (escala nítido em qualquer tela); PNG também funciona, mas aí troca a
   extensão e o único `<img src=...>` em `components/page.rs::wordmark()`.
2. Os assets em `server/static/` são embutidos no binário em tempo de
   compilação (`include_dir!`) e servidos com hash de conteúdo
   (`/static/arquivo?v=<hash>`) e cache de 1 ano — então trocar o arquivo
   **exige rebuild** (não basta substituir o arquivo num servidor já
   rodando). Isso também quer dizer que você não precisa se preocupar com
   cache-busting manual: o hash muda sozinho quando o conteúdo muda.
3. O elemento renderiza a 28px de altura (`width: auto`), então prefira um
   arquivo com boa margem/respiro — não cole o logo colado nas bordas do
   canvas.

## 5. O que eu não toquei, e por quê

- **Páginas "legacy" pré-redesign** (ex.: a página de detalhe/stats de uma
  snake individual, que usa estilo inline tipo Bootstrap) — o próprio
  `arena.css` já marca essas páginas como fora do redesign atual
  (comentário "legacy classes (pre-redesign pages)"), então segui a mesma
  fronteira que o time original desenhou.
- **`routes/admin.rs`** — dashboard interno com estilo 100% inline, sem
  nenhuma relação com `arena.css`. Não é algo que competidor/espectador vê,
  então ficou fora do escopo.
- **Lógica de negócio** — tudo que mudei foi cor, atributo, e um componente
  decorativo (as duas cobras do board). Nenhuma query, rota, ou regra de
  matchmaking/rating mudou.

## 6. Pra manter consistência daqui pra frente

Ao adicionar UI nova: azul (`--accent`) é o padrão pra qualquer coisa
interativa ou de marca. Só usa `--red` se o componente responde "sim" pra
"isso está ao vivo, acabou de acontecer, ou deu errado" — senão, é azul (ou
nem tem cor nenhuma, só hairline/hover normais).

Quer contador animado em algum número novo? Só adiciona
`data-count="1234"` no elemento — o `interactions.js` já cobre. Quer que
algo apareça com fade ao rolar a página? `data-reveal` no elemento. Os dois
respeitam `prefers-reduced-motion` automaticamente.
