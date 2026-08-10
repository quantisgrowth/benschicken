import { ShieldCheck } from "lucide-react";
import productBucket from "@/assets/product-bucket.jpg";
import productBurger from "@/assets/product-burger.jpg";
import productCombo from "@/assets/product-combo.jpg";
import productPackaging from "@/assets/product-packaging.jpg";

const PRODUCTS = [
  {
    src: productBucket,
    title: "Balde Crocante Ben's Chicken",
    tag: "Campeão de vendas",
    text: "Receita e tempero homologados para manter a crocância até a entrega.",
  },
  {
    src: productBurger,
    title: "Smash Ben's Burguer",
    tag: "Alta margem",
    text: "Ficha técnica simples, montagem rápida e ticket médio elevado.",
  },
  {
    src: productCombo,
    title: "Combo Tenders + Fritas",
    tag: "Aumenta o ticket",
    text: "Combos desenhados para elevar o valor médio de cada pedido.",
  },
  {
    src: productPackaging,
    title: "Embalagem à prova de delivery",
    tag: "Menos reclamações",
    text: "Packaging que preserva temperatura, crocância e apresentação.",
  },
];

export function ProductShowcase() {
  return (
    <section id="cardapio" className="bg-secondary/40 py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="text-center text-3xl font-black tracking-tight sm:text-4xl">
          Marcas Desenhadas para{" "}
          <span className="text-brand">Alta Rentabilidade no Delivery</span>
        </h2>
        <p className="mt-4 text-center text-sm font-medium text-muted-foreground sm:text-base">
          Ben&apos;s Chicken &amp; Ben&apos;s Burguer na mesma operação
        </p>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {PRODUCTS.map((p) => (
            <article
              key={p.title}
              className="group overflow-hidden rounded-[1.75rem] border border-border bg-card shadow-sm transition-all hover:-translate-y-1 hover:border-brand/50 hover:shadow-xl"
            >
              <img
                src={p.src}
                alt={p.title}
                loading="lazy"
                width={800}
                height={800}
                className="aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="p-5">
                <span className="inline-block rounded-full bg-secondary px-3 py-1 text-xs font-bold text-brand">
                  {p.tag}
                </span>
                <h3 className="mt-3 text-base font-bold sm:text-lg">{p.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{p.text}</p>
              </div>
            </article>
          ))}
        </div>

        <p className="mx-auto mt-8 flex max-w-2xl items-center justify-center gap-2 text-center text-sm font-medium text-muted-foreground">
          <ShieldCheck className="h-5 w-5 shrink-0 text-brand" />
          Embalagens homologadas: o pedido chega crocante, quente e com a marca impecável.
        </p>
      </div>
    </section>
  );
}
