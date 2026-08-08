// Client-safe content model shared by the landing page and the admin panel.

export const TEXT_FIELDS = [
  {
    key: "heroTitleBefore",
    label: "Hero — título (antes do destaque)",
    default: "Fature até",
    multiline: false,
  },
  {
    key: "heroTitleHighlight",
    label: "Hero — palavra em destaque",
    default: "R$ 1,2 Milhão",
    multiline: false,
  },
  {
    key: "heroTitleAfter",
    label: "Hero — título (depois do destaque)",
    default: "por ano com o ecossistema de marcas que mais cresce no delivery",
    multiline: true,
  },
  {
    key: "heroSubtitle",
    label: "Hero — subtítulo",
    default:
      "Abra sua Dark Kitchen do zero ou plugue as marcas Ben's Chicken e Ben's Burguer na sua cozinha atual sem aumentar o seu custo fixo. Duas opções de negócios rentáveis, simples e 100% focadas em delivery.",
    multiline: true,
  },
  {
    key: "licenseTitle",
    label: "Card 1 — título (licenciamento)",
    default: "Licenciamento de Marca",
    multiline: false,
  },
  {
    key: "licenseDescription",
    label: "Card 1 — descrição",
    default:
      "Perfeito para restaurantes, lanchonetes e dark kitchens ativas que buscam receita incremental sem aumentar custos fixos.",
    multiline: true,
  },
  {
    key: "franchiseTitle",
    label: "Card 2 — título (franquia)",
    default: "Franquia Dark Kitchen",
    multiline: false,
  },
  {
    key: "franchiseDescription",
    label: "Card 2 — descrição",
    default:
      "Modelo completo 'turnkey' para montar sua unidade do zero com suporte total de implantação, marketing e processos.",
    multiline: true,
  },
  { key: "metric1Value", label: "Número 1 — valor", default: "R$ 1,2M", multiline: false },
  {
    key: "metric1Label",
    label: "Número 1 — descrição",
    default: "Faturamento anual estimado",
    multiline: false,
  },
  { key: "metric2Value", label: "Número 2 — valor", default: "15% a 20%", multiline: false },
  {
    key: "metric2Label",
    label: "Número 2 — descrição",
    default: "Margem de lucro média",
    multiline: false,
  },
  { key: "metric3Value", label: "Número 3 — valor", default: "9 a 16 meses", multiline: false },
  {
    key: "metric3Label",
    label: "Número 3 — descrição",
    default: "Payback do investimento",
    multiline: false,
  },
  { key: "metric4Value", label: "Número 4 — valor", default: "2 Marcas em 1", multiline: false },
  {
    key: "metric4Label",
    label: "Número 4 — descrição",
    default: "Ben's Chicken + Ben's Burguer na mesma operação",
    multiline: false,
  },
  {
    key: "formTitle",
    label: "Formulário — título",
    default: "Dê o Primeiro Passo para Operar a Ben's na Sua Região",
    multiline: true,
  },
  {
    key: "formSubtitle",
    label: "Formulário — subtítulo",
    default:
      "Preencha os dados abaixo para receber a apresentação comercial completa e o comparativo DRE dos modelos.",
    multiline: true,
  },
  {
    key: "footerAbout",
    label: "Rodapé — texto sobre a marca",
    default:
      "Ecossistema de marcas de delivery: Ben's Chicken e Ben's Burguer, operando juntas na mesma cozinha.",
    multiline: true,
  },
  {
    key: "footerContactTitle",
    label: "Rodapé — título da coluna de contato",
    default: "Contato",
    multiline: false,
  },
  {
    key: "footerPhone",
    label: "Rodapé — WhatsApp / telefone",
    default: "WhatsApp comercial",
    multiline: false,
  },
  {
    key: "footerPhoneLink",
    label: "Rodapé — link do WhatsApp (ex.: https://wa.me/5511999999999)",
    default: "",
    multiline: false,
  },
  {
    key: "footerEmail",
    label: "Rodapé — e-mail",
    default: "expansao@benschicken.com.br",
    multiline: false,
  },
  {
    key: "footerInstagram",
    label: "Rodapé — Instagram (@usuário)",
    default: "@benschicken",
    multiline: false,
  },
  {
    key: "footerInstagramLink",
    label: "Rodapé — link do Instagram",
    default: "",
    multiline: false,
  },
  {
    key: "footerLinksTitle",
    label: "Rodapé — título da coluna de links",
    default: "Expansão",
    multiline: false,
  },
  {
    key: "footerLink1",
    label: "Rodapé — link 1 (texto)",
    default: "Modelos de negócio",
    multiline: false,
  },
  {
    key: "footerLink2",
    label: "Rodapé — link 2 (texto)",
    default: "Números da operação",
    multiline: false,
  },
  {
    key: "footerLink3",
    label: "Rodapé — link 3 (texto)",
    default: "Receber apresentação",
    multiline: false,
  },
  {
    key: "footerLegal",
    label: "Rodapé — aviso legal / direitos",
    default:
      "Todos os direitos reservados. As projeções apresentadas são estimativas baseadas em operações existentes e não constituem garantia de resultado.",
    multiline: true,
  },
] as const;

export type TextKey = (typeof TEXT_FIELDS)[number]["key"];
export type SiteTexts = Record<TextKey, string>;

export const IMAGE_FIELDS = [
  {
    key: "headerLogo",
    label: "Logo do cabeçalho (topo do site)",
    size: "400 × 120 px (horizontal, fundo transparente PNG)",
  },
  {
    key: "footerLogo",
    label: "Logo do rodapé",
    size: "400 × 120 px (horizontal, fundo transparente PNG)",
  },
  {
    key: "heroImage",
    label: "Imagem do topo (hero)",
    size: "1200 × 1200 px (quadrada, 1:1)",
  },
  {
    key: "kitchenImage",
    label: "Imagem da cozinha (Como funciona)",
    size: "1200 × 800 px (horizontal, 3:2)",
  },
  {
    key: "comboImage",
    label: "Imagem do combo (Como funciona)",
    size: "1200 × 800 px (horizontal, 3:2)",
  },
] as const;

export type ImageKey = (typeof IMAGE_FIELDS)[number]["key"];
export type SiteImages = Record<ImageKey, string | null>;

export type SiteContent = { texts: SiteTexts; images: SiteImages };

export const DEFAULT_TEXTS = Object.fromEntries(
  TEXT_FIELDS.map((f) => [f.key, f.default]),
) as SiteTexts;

export const DEFAULT_IMAGES: SiteImages = Object.fromEntries(
  IMAGE_FIELDS.map((f) => [f.key, null]),
) as SiteImages;

export const DEFAULT_CONTENT: SiteContent = { texts: DEFAULT_TEXTS, images: DEFAULT_IMAGES };

export const TEXT_KEYS = TEXT_FIELDS.map((f) => f.key) as TextKey[];
export const IMAGE_KEYS = IMAGE_FIELDS.map((f) => f.key) as ImageKey[];
export const MAX_TEXT_LENGTH = 600;
