import { Drumstick, Instagram, Mail, Phone } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="bg-ink py-14 text-ink-foreground">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 md:grid-cols-3">
        <div>
          <div className="flex min-w-0 items-center gap-2">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-brand text-brand-foreground">
              <Drumstick className="h-5 w-5" />
            </span>
            <span className="truncate text-lg font-extrabold">
              Ben&apos;s <span className="text-gold">Chicken</span>
            </span>
          </div>
          <p className="mt-4 max-w-xs text-sm opacity-75">
            Ecossistema de marcas de delivery: Ben&apos;s Chicken e Ben&apos;s Burguer, operando
            juntas na mesma cozinha.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-bold uppercase tracking-wide text-gold">Contato</h3>
          <ul className="mt-4 space-y-3 text-sm opacity-85">
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4 shrink-0 text-gold" /> WhatsApp comercial
            </li>
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4 shrink-0 text-gold" /> expansao@benschicken.com.br
            </li>
            <li className="flex items-center gap-2">
              <Instagram className="h-4 w-4 shrink-0 text-gold" /> @benschicken
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-bold uppercase tracking-wide text-gold">Expansão</h3>
          <ul className="mt-4 space-y-3 text-sm opacity-85">
            <li>
              <a href="#modelos" className="hover:text-gold">
                Modelos de negócio
              </a>
            </li>
            <li>
              <a href="#numeros" className="hover:text-gold">
                Números da operação
              </a>
            </li>
            <li>
              <a href="#form" className="hover:text-gold">
                Receber apresentação
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="mx-auto mt-10 max-w-6xl border-t border-ink-foreground/15 px-4 pt-6 text-xs opacity-60">
        © {new Date().getFullYear()} Ben&apos;s Chicken. Todos os direitos reservados. As
        projeções apresentadas são estimativas baseadas em operações existentes e não constituem
        garantia de resultado.
      </div>
    </footer>
  );
}
