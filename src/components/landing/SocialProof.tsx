import { useRef, useState } from "react";
import { Play, Star, Store, Truck, Volume2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import galleryTeam from "@/assets/gallery-team.jpg";
import galleryDelivery from "@/assets/gallery-delivery.jpg";
import darkKitchen from "@/assets/dark-kitchen.jpg";
import productPackaging from "@/assets/product-packaging.jpg";
import type { SiteContent } from "@/lib/site-content";
import { parseVideoSource } from "@/lib/video-helpers";

type Testimonial = {
  id: string;
  name: string;
  city: string;
  highlight: string;
  duration: string;
  thumb: string;
  videoUrl: string;
};

const TRUST = [
  { icon: Store, value: "+100", label: "Unidades ativas" },
  { icon: Truck, value: "5 Mi+", label: "Pedidos entregues" },
  { icon: Star, value: "4.8+", label: "Nota nos aplicativos de delivery" },
];

function TestimonialCard({
  item,
  onClick,
}: {
  item: Testimonial;
  onClick: () => void;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const source = parseVideoSource(item.videoUrl);
  const hasDirectVideo = source.type === "direct";

  function handleMouseEnter() {
    setIsHovered(true);
    if (hasDirectVideo && videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
  }

  function handleMouseLeave() {
    setIsHovered(false);
    if (hasDirectVideo && videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="group relative flex flex-col overflow-hidden rounded-[1.75rem] border border-border bg-card text-left shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-brand/60 hover:shadow-2xl"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-ink">
        {/* Poster image */}
        <img
          src={item.thumb}
          alt={`Depoimento de ${item.name}, operador em ${item.city}`}
          loading="lazy"
          width={900}
          height={700}
          className={`h-full w-full object-cover transition-all duration-700 ${
            isHovered ? "scale-105" : "scale-100"
          } ${hasDirectVideo && isHovered ? "opacity-0" : "opacity-100"}`}
        />

        {/* Hover preview video (for direct video files) */}
        {hasDirectVideo && (
          <video
            ref={videoRef}
            src={source.videoUrl}
            muted
            playsInline
            loop
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${
              isHovered ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          />
        )}

        {/* Dark overlay */}
        <span
          className={`absolute inset-0 bg-ink/35 transition-colors duration-300 ${
            isHovered ? "bg-ink/20" : "bg-ink/35"
          }`}
        />

        {/* Play button with Pulse wave */}
        <div className="absolute inset-0 grid place-items-center">
          <div className="relative">
            {/* Animated Pulse Wave on hover */}
            <span
              className={`absolute -inset-2.5 rounded-full bg-brand/40 transition-all duration-700 ${
                isHovered ? "animate-ping opacity-75" : "opacity-0"
              }`}
            />
            <span
              className={`relative grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-brand to-brand-dark text-brand-foreground shadow-xl shadow-brand/30 transition-all duration-300 ${
                isHovered ? "scale-115 shadow-2xl shadow-brand/50" : "scale-100"
              }`}
            >
              <Play className="h-7 w-7 translate-x-0.5 fill-current" />
            </span>
          </div>
        </div>

        {/* Duration badge */}
        <span className="absolute bottom-3 right-3 rounded-full bg-ink/85 px-2.5 py-1 text-xs font-bold text-ink-foreground backdrop-blur">
          {item.duration}
        </span>

        {/* Hover "Clique para ouvir" indicator */}
        <div
          className={`absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-ink/80 px-2.5 py-1 text-[11px] font-semibold text-ink-foreground backdrop-blur transition-all duration-300 ${
            isHovered ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 pointer-events-none"
          }`}
        >
          <Volume2 className="h-3 w-3 text-brand" />
          <span>Clique para assistir</span>
        </div>

        {/* Micro progress bar on hover */}
        {isHovered && (
          <div className="absolute bottom-0 inset-x-0 h-1 bg-brand/30 overflow-hidden">
            <div className="h-full bg-brand animate-[pulse_2s_ease-in-out_infinite]" />
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col justify-between p-5">
        <div>
          <p className="text-base font-bold sm:text-lg">
            {item.name} — <span className="font-normal text-muted-foreground">{item.city}</span>
          </p>
          <span className="mt-2.5 inline-block rounded-full bg-secondary px-3 py-1 text-xs font-bold text-brand">
            {item.highlight}
          </span>
        </div>
      </div>
    </button>
  );
}

export function SocialProof({ content }: { content?: SiteContent }) {
  const [active, setActive] = useState<Testimonial | null>(null);
  const images = content?.images;
  const texts = content?.texts;

  const testimonials: Testimonial[] = [
    {
      id: "carlos",
      name: "Carlos",
      city: "Curitiba",
      highlight: "Cresceu 150% em 3 meses",
      duration: "1:30",
      thumb: images?.testimonial1Image ?? galleryTeam,
      videoUrl: texts?.testimonial1Video ?? "",
    },
    {
      id: "juliana",
      name: "Juliana",
      city: "Campinas",
      highlight: "Licenciou a cozinha em 15 dias",
      duration: "2:05",
      thumb: images?.testimonial2Image ?? darkKitchen,
      videoUrl: texts?.testimonial2Video ?? "",
    },
    {
      id: "rafael",
      name: "Rafael",
      city: "Belo Horizonte",
      highlight: "Payback em 11 meses",
      duration: "1:12",
      thumb: images?.testimonial3Image ?? galleryDelivery,
      videoUrl: texts?.testimonial3Video ?? "",
    },
  ];

  const gallery = [
    {
      src: images?.gallery1Image ?? galleryTeam,
      alt: "Equipe operacional preparando pedidos na cozinha parceira",
      quote: "Operação enxuta, com 4 pessoas por turno.",
    },
    {
      src: images?.gallery2Image ?? galleryDelivery,
      alt: "Entregador retirando sacolas de pedidos da Ben's Chicken",
      quote: "Pico de 220 pedidos em um único fim de semana.",
    },
    {
      src: images?.gallery3Image ?? productPackaging,
      alt: "Embalagens de delivery da Ben's Chicken prontas para envio",
      quote: "Embalagem à prova de delivery, chega crocante.",
    },
  ];

  const activeSource = active ? parseVideoSource(active.videoUrl) : null;

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
          {testimonials.map((t) => (
            <TestimonialCard key={t.id} item={t} onClick={() => setActive(t)} />
          ))}
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {gallery.map((g) => (
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
        <DialogContent className="max-w-3xl overflow-hidden p-0 border-0 bg-ink rounded-3xl">
          <DialogHeader className="p-4 bg-ink/90 border-b border-white/10 text-white">
            <DialogTitle className="text-base sm:text-lg font-bold text-white">
              {active ? `${active.name} — ${active.city}` : "Depoimento"}
            </DialogTitle>
          </DialogHeader>
          <div className="relative aspect-video w-full bg-black">
            {activeSource?.type === "youtube" ? (
              <iframe
                src={activeSource.embedUrl}
                title={active?.name}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="h-full w-full border-0"
              />
            ) : activeSource?.type === "vimeo" ? (
              <iframe
                src={activeSource.embedUrl}
                title={active?.name}
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
                className="h-full w-full border-0"
              />
            ) : activeSource?.type === "direct" ? (
              <video
                src={activeSource.videoUrl}
                controls
                autoPlay
                className="h-full w-full object-contain"
              />
            ) : (
              <div className="grid h-full place-items-center px-6 text-center text-white">
                <div>
                  <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-brand text-brand-foreground shadow-lg">
                    <Play className="h-6 w-6 translate-x-0.5 fill-current" />
                  </div>
                  <p className="mt-4 text-base font-bold">
                    Vídeo do depoimento em breve
                  </p>
                  <p className="mt-1 text-sm text-white/70">
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
