import { Drumstick, Menu, X } from "lucide-react";
import { useState } from "react";

const links = [
  { href: "#modelos", label: "Modelos" },
  { href: "#numeros", label: "Números" },
  { href: "#como-funciona", label: "Como Funciona" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border/60 bg-background/90 backdrop-blur">
      <div className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 py-3 sm:flex sm:justify-between">
        <a href="#topo" className="flex min-w-0 items-center gap-2">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-brand text-brand-foreground">
            <Drumstick className="h-5 w-5" />
          </span>
          <span className="truncate text-lg font-extrabold tracking-tight">
            Ben&apos;s <span className="text-brand">Chicken</span>
          </span>
        </a>

        <nav className="hidden items-center gap-7 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm font-semibold text-muted-foreground transition-colors hover:text-brand"
            >
              {l.label}
            </a>
          ))}
          <a
            href="#form"
            className="rounded-full bg-brand px-5 py-2.5 text-sm font-bold text-brand-foreground shadow-lg shadow-brand/25 transition-all hover:bg-brand-dark hover:scale-105"
          >
            Quero Saber Mais
          </a>
        </nav>

        <button
          type="button"
          aria-label="Abrir menu"
          onClick={() => setOpen((v) => !v)}
          className="shrink-0 rounded-xl border border-border p-2 md:hidden"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <nav className="border-t border-border bg-background px-4 py-4 md:hidden">
          <div className="flex flex-col gap-3">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="text-sm font-semibold text-muted-foreground"
              >
                {l.label}
              </a>
            ))}
            <a
              href="#form"
              onClick={() => setOpen(false)}
              className="rounded-full bg-brand px-5 py-3 text-center text-sm font-bold text-brand-foreground hover:bg-brand-dark"
            >
              Quero Saber Mais
            </a>
          </div>
        </nav>
      )}
    </header>
  );
}
