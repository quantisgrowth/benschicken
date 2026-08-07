import { CalendarClock, Layers, Percent, TrendingUp } from "lucide-react";
import type { SiteContent } from "@/lib/site-content";

const icons = [TrendingUp, Percent, CalendarClock, Layers];

export function Metrics({ content }: { content: SiteContent }) {
  const t = content.texts;
  const stats = [
    { icon: icons[0]!, value: t.metric1Value, label: t.metric1Label },
    { icon: icons[1]!, value: t.metric2Value, label: t.metric2Label },
    { icon: icons[2]!, value: t.metric3Value, label: t.metric3Label },
    { icon: icons[3]!, value: t.metric4Value, label: t.metric4Label },
  ];

  return (
    <section id="numeros" className="bg-ink py-20 text-ink-foreground sm:py-24">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="text-center text-3xl font-black tracking-tight sm:text-4xl">
          Números que fazem o <span className="text-brand">negócio girar</span>
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-sm opacity-75 sm:text-base">
          Indicadores médios das operações Ben&apos;s no delivery.
        </p>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className="rounded-[1.75rem] border border-brand/25 bg-ink-foreground/5 p-6 text-center transition-transform hover:-translate-y-1"
            >
              <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-brand text-brand-foreground">
                <s.icon className="h-6 w-6" />
              </span>
              <p className="mt-4 text-2xl font-black text-brand sm:text-3xl">{s.value}</p>
              <p className="mt-2 text-sm opacity-80">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
