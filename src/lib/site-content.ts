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
] as const;

export type TextKey = (typeof TEXT_FIELDS)[number]["key"];
export type SiteTexts = Record<TextKey, string>;

export const IMAGE_FIELDS = [
  { key: "heroImage", label: "Imagem do topo (hero)" },
  { key: "kitchenImage", label: "Imagem da cozinha (Como funciona)" },
  { key: "comboImage", label: "Imagem do combo (Como funciona)" },
] as const;

export type ImageKey = (typeof IMAGE_FIELDS)[number]["key"];
export type SiteImages = Record<ImageKey, string | null>;

export type SiteContent = { texts: SiteTexts; images: SiteImages };

export const DEFAULT_TEXTS = Object.fromEntries(
  TEXT_FIELDS.map((f) => [f.key, f.default]),
) as SiteTexts;

export const DEFAULT_IMAGES: SiteImages = {
  heroImage: null,
  kitchenImage: null,
  comboImage: null,
};

export const DEFAULT_CONTENT: SiteContent = { texts: DEFAULT_TEXTS, images: DEFAULT_IMAGES };

export const TEXT_KEYS = TEXT_FIELDS.map((f) => f.key) as TextKey[];
export const IMAGE_KEYS = IMAGE_FIELDS.map((f) => f.key) as ImageKey[];
export const MAX_TEXT_LENGTH = 600;
