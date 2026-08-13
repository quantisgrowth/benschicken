import { Check, ChefHat, Store } from "lucide-react";
import type { SiteContent } from "@/lib/site-content";
import type { Interest } from "./types";
import { trackModelSelect } from "@/lib/tracking";


const models = [
  {
    id: "licenciamento" as Interest,
    icon: Store,
    tag: "Para quem JÁ TEM cozinha",
    badge: "Para quem já tem cozinha | Baixo investimento de adequação",
    title: "Licenciamento de Marca",
    description:
      "Perfeito para restaurantes, lanchonetes e dark kitchens ativas que buscam receita incremental sem aumentar custos fixos.",
    points: [
      "Ativação ultra-rápida na sua estrutura atual",
      "Sem custos de obras ou reformas",
      "Cardápio duplo (Ben's Chicken + Ben's Burguer)",
      "Baixíssimo investimento inicial",
    ],
    cta: "Quero Licenciar Minha Cozinha",
    accent: "gold" as const,
  },
  {
    id: "franquia" as Interest,
    icon: ChefHat,
    tag: "Para quem quer COMEÇAR DO ZERO",
    badge: "Investimento a partir de R$ 200 mil",
    title: "Franquia Dark Kitchen",
    description:
      "Modelo completo 'turnkey' para montar sua unidade do zero com suporte total de implantação, marketing e processos.",
    points: [
      "Modelo testado com alta lucratividade (15% a 20%)",
      "Payback estimado de 9 a 16 meses",
      "Unidades compactas a partir de 60m²",
      "Suporte ponta a ponta e gestão simplificada",
    ],
    cta: "Quero Abrir uma Franquia",
    accent: "brand" as const,
  },
];


export function ModelCards({
  content,
  onSelect,
}: {
  content: SiteContent;
  onSelect: (interest: Interest) => void;
}) {
  const overrides: Record<string, { title: string; description: string }> = {
    licenciamento: {
      title: content.texts.licenseTitle,
      description: content.texts.licenseDescription,
    },
    franquia: {
      title: content.texts.franchiseTitle,
      description: content.texts.franchiseDescription,
    },
  };

  return (
    <section id="modelos" className="bg-secondary/50 py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="text-center text-3xl font-black tracking-tight sm:text-4xl">
          Escolha o Modelo Ideal para o seu <span className="text-brand">Momento</span>
        </h2>

        <div className="mt-12 grid gap-8 lg:grid-cols-2">

          {models.map((m) => {
            const isGold = m.accent === "gold";
            const Icon = m.icon;
            return (
              <div
                key={m.id}
                className={`group flex flex-col rounded-[2rem] border-2 bg-card p-8 shadow-lg transition-all hover:-translate-y-1 hover:shadow-2xl ${
                  isGold ? "border-border" : "border-brand/60"
                }`}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${
                      isGold ? "bg-secondary text-brand" : "bg-brand text-brand-foreground"
                    }`}
                  >
                    <Icon className="h-6 w-6" />
                  </span>
                  <span
                    className={`truncate rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${
                      isGold ? "bg-secondary text-brand" : "bg-secondary text-brand"
                    }`}
                  >
                    {m.tag}
                  </span>
                </div>

                <h3 className="mt-6 text-2xl font-black tracking-tight sm:text-3xl">
                  {overrides[m.id]?.title ?? m.title}
                </h3>
                <p className="mt-3 inline-block rounded-full bg-brand/10 px-4 py-2 text-xs font-black uppercase tracking-wide text-brand sm:text-sm">
                  {m.badge}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
                  {overrides[m.id]?.description ?? m.description}
                </p>


                <ul className="mt-6 flex-1 space-y-3">
                  {m.points.map((p) => (
                    <li key={p} className="flex items-start gap-3 text-sm font-medium sm:text-base">
                      <Check
                        className={`mt-0.5 h-5 w-5 shrink-0 text-brand`}
                      />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>

                <a
                  href="#form"
                  onClick={() => {
                    trackModelSelect(m.id);
                    onSelect(m.id);
                  }}
                  className={`mt-8 inline-flex items-center justify-center rounded-2xl px-6 py-3.5 text-sm font-bold transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 sm:text-base ${
                    isGold
                      ? "border border-brand/50 bg-background text-brand hover:border-brand hover:bg-secondary"
                      : "bg-gradient-to-r from-brand to-brand-dark text-brand-foreground shadow-md shadow-brand/20 hover:shadow-lg hover:shadow-brand/30"
                  }`}
                >
                  {m.cta}
                </a>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
