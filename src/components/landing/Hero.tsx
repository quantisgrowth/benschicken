import { ArrowRight, Lock, PlayCircle } from "lucide-react";
import heroChicken from "@/assets/hero-chicken.jpg";
import type { SiteContent } from "@/lib/site-content";

export function Hero({ content }: { content: SiteContent }) {
  const t = content.texts;

  function focusForm() {
    const form = document.getElementById("form");
    form?.scrollIntoView({ behavior: "smooth", block: "start" });
    window.setTimeout(() => {
      const input = document.getElementById("nome") as HTMLInputElement | null;
      input?.focus({ preventScroll: true });
    }, 600);
  }

  return (
    <section id="topo" className="relative overflow-hidden bg-background pt-28 pb-16 sm:pt-32 sm:pb-24">
      <div className="pointer-events-none absolute -right-32 -top-24 h-96 w-96 rounded-full bg-brand/10 blur-3xl" />
      <div className="pointer-events-none absolute -left-40 top-40 h-96 w-96 rounded-full bg-brand/10 blur-3xl" />

      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 lg:grid-cols-2">
        <div>
          <span className="inline-flex items-center rounded-full border border-brand/20 bg-secondary px-4 py-2 text-xs font-bold text-brand sm:text-sm">
            🚀 Franquia Completa ou Licenciamento de Cozinha Existente
          </span>

          <h1 className="mt-6 text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
            {t.heroTitleBefore} <span className="text-brand">{t.heroTitleHighlight}</span>{" "}
            {t.heroTitleAfter}
          </h1>

          <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            {t.heroSubtitle}
          </p>

          <div className="mt-8 flex flex-col items-stretch gap-3.5 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={focusForm}
              className="group inline-flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-brand to-brand-dark px-6 py-3.5 text-sm font-bold text-brand-foreground shadow-md shadow-brand/20 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-brand/30 active:translate-y-0 sm:text-base"
            >
              <span>Receber Apresentação Financeira</span>
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
            </button>
            <a
              href="#como-funciona"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border bg-card/80 px-6 py-3.5 text-sm font-semibold text-foreground backdrop-blur transition-all duration-200 hover:-translate-y-0.5 hover:border-brand/40 hover:bg-secondary hover:text-brand active:translate-y-0 sm:text-base"
            >
              <PlayCircle className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-brand" />
              <span>Ver como funciona</span>
            </a>
          </div>

          <p className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
            <Lock className="h-4 w-4 shrink-0 text-brand" />
            Receba a apresentação financeira em menos de 2 minutos
          </p>

        </div>

        <div className="relative">
          <div className="absolute inset-0 -rotate-3 rounded-[2.5rem] bg-gradient-to-br from-brand to-brand-dark opacity-90" />
          <img
            src={content.images.heroImage ?? heroChicken}
            alt="Balde de frango frito crocante com embalagem vermelha e dourada da Ben's Chicken"
            width={1200}
            height={1200}
            className="relative aspect-square w-full rounded-[2.5rem] object-cover shadow-2xl"
          />
          <div className="absolute -bottom-6 left-4 rounded-2xl bg-ink px-5 py-4 text-ink-foreground shadow-xl sm:left-8">
            <p className="text-2xl font-black text-brand">2 marcas</p>
            <p className="text-xs font-medium opacity-80">em uma única operação</p>
          </div>
        </div>
      </div>
    </section>
  );
}
