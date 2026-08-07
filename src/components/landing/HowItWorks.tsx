import darkKitchen from "@/assets/dark-kitchen.jpg";
import burgerCombo from "@/assets/burger-combo.jpg";

const steps = [
  {
    title: "1. Você se cadastra",
    text: "Preencha o formulário e receba na hora a apresentação comercial e o comparativo DRE.",
  },
  {
    title: "2. Conversa com o time",
    text: "Um consultor entende seu momento e indica o modelo mais rentável para a sua região.",
  },
  {
    title: "3. Análise e aprovação",
    text: "Validamos praça, estrutura e investimento. Tudo transparente, sem surpresas.",
  },
  {
    title: "4. Ativação das marcas",
    text: "Treinamento, cardápio, embalagens e apps configurados. Sua cozinha vendendo rápido.",
  },
];

export function HowItWorks() {
  return (
    <section id="como-funciona" className="bg-background py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="text-center text-3xl font-black tracking-tight sm:text-4xl">
          Como funciona na <span className="text-brand">prática</span>
        </h2>

        <div className="mt-12 grid items-center gap-10 lg:grid-cols-2">
          <ol className="space-y-5">
            {steps.map((s) => (
              <li
                key={s.title}
                className="rounded-3xl border border-border bg-card p-6 shadow-sm transition-colors hover:border-brand/50"
              >
                <h3 className="text-lg font-extrabold text-brand">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
                  {s.text}
                </p>
              </li>
            ))}
          </ol>

          <div className="grid gap-5">
            <img
              src={darkKitchen}
              alt="Cozinha dark kitchen montando pedidos em embalagens vermelhas para delivery"
              width={1200}
              height={800}
              loading="lazy"
              className="rounded-[2rem] object-cover shadow-xl"
            />
            <img
              src={burgerCombo}
              alt="Hambúrguer artesanal e sanduíche de frango crocante com embalagens da marca"
              width={1200}
              height={800}
              loading="lazy"
              className="rounded-[2rem] object-cover shadow-xl"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
