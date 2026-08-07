# Painel de Administração — Ben's Chicken

Área protegida por login (e-mail + senha) onde administradores trocam as imagens, editam os textos principais e consultam os leads do formulário. Nada disso existe hoje: as imagens e textos estão fixos no código e o formulário não salva em lugar nenhum.

## O que muda para o visitante

Nada visualmente. A landing page passa a ler imagens e textos de um conteúdo salvo na nuvem, com os valores atuais como padrão — se nada for editado, a página continua idêntica.

## Área do administrador (`/admin`)

Login em `/auth` com e-mail e senha. Só quem tiver a permissão de administrador entra; contas comuns são bloqueadas. O primeiro administrador é criado por mim durante a implementação (você me diz o e-mail, ou cria a conta e eu concedo o acesso).

Três abas:

1. **Imagens** — as 3 imagens da página (hero, dark kitchen, combo do formulário/como funciona). Cada uma mostra a versão atual, botão para enviar uma nova (JPG/PNG/WebP, até ~5 MB) e opção de voltar ao padrão.
2. **Textos** — título e subtítulo do hero, textos dos dois cards de modelo, os 4 números da seção de métricas e o título/subtítulo do formulário.
3. **Leads** — tabela com nome, e-mail, WhatsApp, cidade/estado, interesse e data. Botão para exportar CSV.

## Formulário da landing

O envio passa a gravar o lead de verdade (validação continua igual) e a mensagem de sucesso permanece. Nenhum visitante consegue ler os leads — só administradores autenticados.

## Detalhes técnicos

- Ativar Lovable Cloud (banco, autenticação, storage).
- Tabelas: `site_content` (chave/valor JSON para textos e URLs de imagem), `leads`, `user_roles` (+ enum `app_role` e função `has_role` security definer). RLS em todas, com GRANTs explícitos: leitura pública apenas de `site_content`; `leads` insert público e select/delete só para admin; escrita em `site_content` só para admin.
- Bucket de storage público `site-images` com políticas de upload restritas a admin.
- Rotas: `src/routes/auth.tsx` (público) e `src/routes/_authenticated/admin.tsx` com o layout gerenciado da integração; verificação de papel admin dentro das server functions, nunca só na UI.
- Server functions em `src/lib/*.functions.ts`: leitura pública de conteúdo via cliente publishable, escrita e listagem de leads via `requireSupabaseAuth` + checagem `has_role`.
- Landing page: loader público carrega o conteúdo; componentes recebem os valores por props com fallback para os textos/imagens atuais do código.
- Validação com zod no cliente e no servidor (limites de tamanho, e-mail, telefone).
