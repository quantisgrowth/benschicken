import { MessageCircle, Send } from "lucide-react";
import type { SiteContent } from "@/lib/site-content";
import { trackWhatsAppClick } from "@/lib/tracking";

export function MobileCtaBar({ content }: { content: SiteContent }) {
  const whatsapp = content.texts.footerPhoneLink || "https://wa.me/5511999999999";

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-card/95 p-3 shadow-[0_-8px_24px_-12px_rgba(0,0,0,0.25)] backdrop-blur md:hidden">
      <div className="flex gap-2">
        <a
          href={whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackWhatsAppClick("Barra Fixa Mobile")}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border-2 border-brand px-4 py-3 text-xs font-black uppercase tracking-wide text-brand transition-colors hover:bg-secondary"
        >
          <MessageCircle className="h-4 w-4 shrink-0" />
          Falar via WhatsApp
        </a>
        <a
          href="#form"
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-brand px-4 py-3 text-xs font-black uppercase tracking-wide text-brand-foreground shadow-lg shadow-brand/30 transition-transform hover:scale-[1.02]"
        >
          <Send className="h-4 w-4 shrink-0" />
          Receber Apresentação
        </a>
      </div>
    </div>
  );
}
