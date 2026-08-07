# Ben's Chicken — Landing Page de Franquia e Licenciamento

Landing page única em português, mobile-first, com a identidade visual da marca Ben's Chicken (vermelho vibrante, dourado/âmbar, branco e cinza-escuro/preto).

## Estrutura da página (rota `/`)

1. **Header fixo** — logo Ben's Chicken, links âncora (Modelos, Números, Contato) e botão vermelho "Quero Saber Mais" que rola até o formulário.
2. **Hero** — badge pill "🚀 Franquia Completa ou Licenciamento de Cozinha Existente", headline "Fature até R$ 1,2 Milhão por ano...", subheadline, CTA primário "Conhecer Modelos de Negócio" (âncora #form), CTA secundário "Ver Como Funciona", microcopy de confiança. Imagem de frango crocante/embalagem da marca ao lado (desktop) e abaixo (mobile).
3. **Seletor de Modelos** — dois cards lado a lado com cantos arredondados: "Licenciamento de Marca" (destaque dourado, para quem já tem cozinha) e "Franquia Dark Kitchen" (destaque vermelho, começar do zero), cada um com descrição, 4 bullets com ✓ e CTA próprio. Clicar no CTA rola até o formulário e já pré-seleciona a opção correspondente no radio group.
4. **Números** — grid de 4 stat cards: R$ 1,2M, 15% a 20%, 9 a 16 meses, 2 Marcas em 1.
5. **Como Funciona** — passos curtos (contato → apresentação → análise → ativação), alvo do CTA secundário do hero.
6. **Formulário (#form)** — headline, subheadline e campos: nome, e-mail, WhatsApp com máscara (00) 00000-0000, cidade, estado (select com as 27 UFs), radio group de interesse (3 opções), botão "BAIXAR APRESENTAÇÃO E COMPARATIVO DE MODELOS" com animação no hover, microcopy de privacidade. Validação em tempo real e mensagem de sucesso após envio.
7. **Rodapé** — fundo escuro, logo, contato/WhatsApp, redes sociais, aviso legal.

## Imagens

Geração de imagens no estilo apetitoso da marca: frango frito crocante, burger, embalagem branded e cena de entrega/app. Salvas em `src/assets` e importadas diretamente.

## Detalhes técnicos

- TanStack Start: reescrita de `src/routes/index.tsx` (substitui o placeholder), com `head()` próprio (title/description/og/twitter em português).
- Tokens de cor da marca definidos em `src/styles.css` (`@theme inline` + `:root`, oklch): vermelho primário, dourado/âmbar como accent, superfícies branca e grafite. Nenhuma cor hardcoded nos componentes.
- Tipografia sans-serif limpa (Poppins/Montserrat) carregada via `<link>` no `__root.tsx` e registrada como token `--font-*`.
- Componentes em `src/components/landing/` (Hero, ModelCards, Metrics, HowItWorks, LeadForm, SiteFooter) para manter arquivos pequenos.
- Ícones do lucide-react; scroll suave via `scroll-behavior: smooth`.
- **Formulário:** nesta versão o envio é apenas front-end (validação + estado de sucesso), sem armazenamento. Para gravar os leads e/ou disparar e-mail, ativo o Lovable Cloud em uma etapa seguinte — é só pedir.
