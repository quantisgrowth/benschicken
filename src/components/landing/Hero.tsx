import { ArrowRight, Lock, PlayCircle } from "lucide-react";
import heroChicken from "@/assets/hero-chicken.jpg";

export function Hero() {
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
            Fature até <span className="text-brand">R$ 1,2 Milhão</span> por ano com o ecossistema de
            marcas que mais cresce no delivery
          </h1>

          <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Abra sua Dark Kitchen do zero ou plugue as marcas Ben&apos;s Chicken e Ben&apos;s Burguer
            na sua cozinha atual sem aumentar o seu custo fixo. Duas opções de negócios rentáveis,
            simples e 100% focadas em delivery.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href="#modelos"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-brand px-7 py-4 text-sm font-bold uppercase tracking-wide text-brand-foreground shadow-xl shadow-brand/30 transition-all hover:bg-brand-dark hover:scale-[1.03] sm:text-base"
            >
              Conhecer Modelos de Negócio
              <ArrowRight className="h-5 w-5" />
            </a>
            <a
              href="#como-funciona"
              className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-ink/15 px-7 py-4 text-sm font-bold uppercase tracking-wide text-foreground transition-colors hover:border-brand hover:text-brand sm:text-base"
            >
              <PlayCircle className="h-5 w-5" />
              Ver Como Funciona
            </a>
          </div>

          <p className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
            <Lock className="h-4 w-4 shrink-0 text-brand" />
            Material gratuito • Receba a apresentação financeira em menos de 2 minutos
          </p>
        </div>

        <div className="relative">
          <div className="absolute inset-0 -rotate-3 rounded-[2.5rem] bg-gradient-to-br from-brand to-brand-dark opacity-90" />
          <img
            src={heroChicken}
            alt="Balde de frango frito crocante com embalagem vermelha e dourada da Ben's Chicken"
            width={1200}
            height={1200}
            className="relative rounded-[2.5rem] object-cover shadow-2xl"
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
