import { useState } from "react";
import { Play, Star, Store, Truck } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import galleryTeam from "@/assets/gallery-team.jpg";
import galleryDelivery from "@/assets/gallery-delivery.jpg";
import darkKitchen from "@/assets/dark-kitchen.jpg";
import productPackaging from "@/assets/product-packaging.jpg";
import productPackaging from "@/assets/product-packaging.jpg";

type Testimonial = {
  id: string;
  name: string;
  city: string;
  highlight: string;
  duration: string;
  thumb: string;
  videoUrl: string;
};

const TESTIMONIALS: Testimonial[] = [
  {
    id: "carlos",
    name: "Carlos",
    city: "Curitiba",
    highlight: "Cresceu 150% em 3 meses",
    duration: "1:30",
    thumb: galleryTeam,
    videoUrl: "",
  },
  {
    id: "juliana",
    name: "Juliana",
    city: "Campinas",
    highlight: "Licenciou a cozinha em 15 dias",
    duration: "2:05",
    thumb: darkKitchen,
    videoUrl: "",
  },
  {
    id: "rafael",
    name: "Rafael",
    city: "Belo Horizonte",
    highlight: "Payback em 11 meses",
    duration: "1:12",
    thumb: galleryDelivery,
    videoUrl: "",
  },
];

const GALLERY = [
  { src: galleryTeam, alt: "Equipe operacional preparando pedidos na cozinha parceira", quote: "Operação enxuta, com 4 pessoas por turno." },
  { src: galleryDelivery, alt: "Entregador retirando sacolas de pedidos da Ben's Chicken", quote: "Pico de 220 pedidos em um único fim de semana." },
  { src: productPackaging, alt: "Embalagens de delivery da Ben's Chicken prontas para envio", quote: "Embalagem à prova de delivery, chega crocante." },
];

const TRUST = [
  { icon: Store, value: "+100", label: "Unidades ativas" },
  { icon: Truck, value: "5 Mi+", label: "Pedidos entregues" },
  { icon: Star, value: "4.8+", label: "Nota nos aplicativos de delivery" },
];

export function SocialProof() {
  const [active, setActive] = useState<Testimonial | null>(null);

  return (
    <section id="prova-social" className="bg-background py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="text-center text-3xl font-black tracking-tight sm:text-4xl">
          Quem Opera a Ben&apos;s, Aprova:{" "}
          <span className="text-brand">Histórias Reais de Sucesso</span>
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-sm text-muted-foreground sm:text-base">
          Operadores que já faturam com as marcas Ben&apos;s Chicken e Ben&apos;s Burguer dentro da
          própria cozinha.
        </p>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setActive(t)}
              className="group overflow-hidden rounded-[1.75rem] border border-border bg-card text-left shadow-sm transition-all hover:-translate-y-1 hover:border-brand/50 hover:shadow-xl"
            >
              <div className="relative">
                <img
                  src={t.thumb}
                  alt={`Depoimento de ${t.name}, operador em ${t.city}`}
                  loading="lazy"
                  width={900}
                  height={700}
                  className="aspect-[4/3] w-full object-cover"
                />
                <span className="absolute inset-0 bg-ink/35 transition-colors group-hover:bg-ink/25" />
                <span className="absolute inset-0 grid place-items-center">
                  <span className="grid h-16 w-16 place-items-center rounded-full bg-brand text-brand-foreground shadow-xl transition-transform group-hover:scale-110">
                    <Play className="h-7 w-7 translate-x-0.5 fill-current" />
                  </span>
                </span>
                <span className="absolute bottom-3 right-3 rounded-full bg-ink/85 px-2.5 py-1 text-xs font-bold text-ink-foreground">
                  {t.duration}
                </span>
              </div>
              <div className="p-5">
                <p className="text-base font-bold">
                  {t.name} — {t.city}
                </p>
                <span className="mt-2 inline-block rounded-full bg-secondary px-3 py-1 text-xs font-bold text-brand">
                  {t.highlight}
                </span>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {GALLERY.map((g) => (
            <figure
              key={g.alt}
              className="group overflow-hidden rounded-[1.75rem] border border-border bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl"
            >
              <img
                src={g.src}
                alt={g.alt}
                loading="lazy"
                width={900}
                height={700}
                className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <figcaption className="p-5 text-sm font-medium text-muted-foreground">
                “{g.quote}”
              </figcaption>
            </figure>
          ))}
        </div>

        <div className="mt-10 grid gap-4 rounded-[1.75rem] border border-border bg-secondary/60 p-6 sm:grid-cols-3 sm:p-8">
          {TRUST.map((t) => {
            const Icon = t.icon;
            return (
              <div key={t.label} className="flex items-center justify-center gap-3 text-center">
                <Icon className="h-7 w-7 shrink-0 text-brand" />
                <div className="text-left">
                  <p className="text-xl font-black text-brand sm:text-2xl">{t.value}</p>
                  <p className="text-xs font-medium text-muted-foreground sm:text-sm">{t.label}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Dialog open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {active ? `${active.name} — ${active.city}` : "Depoimento"}
            </DialogTitle>
          </DialogHeader>
          <div className="overflow-hidden rounded-2xl bg-ink">
            {active?.videoUrl ? (
              <video src={active.videoUrl} controls autoPlay className="aspect-video w-full" />
            ) : (
              <div className="grid aspect-video w-full place-items-center px-6 text-center">
                <div>
                  <Play className="mx-auto h-10 w-10 text-brand" />
                  <p className="mt-3 text-sm font-medium text-ink-foreground">
                    Vídeo do depoimento em breve.
                  </p>
                  <p className="mt-1 text-xs text-ink-foreground/70">
                    {active?.highlight}
                  </p>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    
    </section>
  );
}
