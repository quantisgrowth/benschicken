import { CheckCircle2, Download, ShieldCheck } from "lucide-react";
import { useState, type FormEvent } from "react";
import type { Interest } from "./types";

const UFS = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO",
];

const OPTIONS: { id: Interest; label: string }[] = [
  { id: "licenciamento", label: "Já tenho uma cozinha/restaurante e quero Licenciar a Marca" },
  { id: "franquia", label: "Quero abrir uma Franquia do Zero (A partir de R$ 200k)" },
  { id: "ambos", label: "Quero entender ambos os modelos para decidir" },
];

function maskPhone(value: string) {
  const d = value.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d.replace(/^(\d{0,2})/, "($1");
  if (d.length <= 6) return d.replace(/^(\d{2})(\d{0,4})/, "($1) $2");
  if (d.length <= 10) return d.replace(/^(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3");
  return d.replace(/^(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3");
}

const inputClass =
  "w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-brand/25 sm:text-base";

export function LeadForm({
  interest,
  onInterestChange,
}: {
  interest: Interest | null;
  onInterestChange: (i: Interest) => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [uf, setUf] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);

  function validate() {
    const e: Record<string, string> = {};
    if (name.trim().length < 3) e['name'] = "Informe seu nome completo.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) e['email'] = "Informe um e-mail válido.";
    if (phone.replace(/\D/g, "").length < 10) e['phone'] = "Informe um WhatsApp válido com DDD.";
    if (city.trim().length < 2) e['city'] = "Informe sua cidade.";
    if (!uf) e['uf'] = "Selecione o estado.";
    if (!interest) e['interest'] = "Selecione o seu interesse.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(ev: FormEvent) {
    ev.preventDefault();
    if (validate()) setSent(true);
  }

  return (
    <section id="form" className="bg-secondary/60 py-20 sm:py-24">
      <div className="mx-auto max-w-3xl px-4">
        <h2 className="text-center text-3xl font-black tracking-tight sm:text-4xl">
          Dê o Primeiro Passo para Operar a <span className="text-brand">Ben&apos;s</span> na Sua
          Região
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-sm text-muted-foreground sm:text-base">
          Preencha os dados abaixo para receber a apresentação comercial completa e o comparativo DRE
          dos modelos.
        </p>

        <div className="mt-10 rounded-[2rem] border-2 border-brand/25 bg-card p-6 shadow-xl sm:p-10">
          {sent ? (
            <div className="py-10 text-center">
              <CheckCircle2 className="mx-auto h-14 w-14 text-brand" />
              <h3 className="mt-4 text-2xl font-black">Recebemos seus dados!</h3>
              <p className="mt-3 text-sm text-muted-foreground sm:text-base">
                Em instantes você receberá a apresentação comercial e o comparativo DRE no e-mail
                informado. Nosso time de expansão entrará em contato pelo WhatsApp.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              <div>
                <label htmlFor="nome" className="mb-2 block text-sm font-bold">
                  Nome completo
                </label>
                <input
                  id="nome"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu nome completo"
                  className={inputClass}
                />
                {errors['name'] && <p className="mt-1 text-xs text-destructive">{errors['name']}</p>}
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="email" className="mb-2 block text-sm font-bold">
                    E-mail corporativo ou pessoal
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="voce@email.com"
                    className={inputClass}
                  />
                  {errors['email'] && <p className="mt-1 text-xs text-destructive">{errors['email']}</p>}
                </div>
                <div>
                  <label htmlFor="tel" className="mb-2 block text-sm font-bold">
                    WhatsApp / Telefone
                  </label>
                  <input
                    id="tel"
                    inputMode="tel"
                    value={phone}
                    onChange={(e) => setPhone(maskPhone(e.target.value))}
                    placeholder="(11) 99999-9999"
                    className={inputClass}
                  />
                  {errors['phone'] && <p className="mt-1 text-xs text-destructive">{errors['phone']}</p>}
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-[minmax(0,1fr)_140px]">
                <div>
                  <label htmlFor="cidade" className="mb-2 block text-sm font-bold">
                    Cidade
                  </label>
                  <input
                    id="cidade"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Sua cidade"
                    className={inputClass}
                  />
                  {errors['city'] && <p className="mt-1 text-xs text-destructive">{errors['city']}</p>}
                </div>
                <div>
                  <label htmlFor="uf" className="mb-2 block text-sm font-bold">
                    Estado
                  </label>
                  <select
                    id="uf"
                    value={uf}
                    onChange={(e) => setUf(e.target.value)}
                    className={inputClass}
                  >
                    <option value="">UF</option>
                    {UFS.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                  {errors['uf'] && <p className="mt-1 text-xs text-destructive">{errors['uf']}</p>}
                </div>
              </div>

              <fieldset>
                <legend className="mb-3 text-sm font-bold">Qual o seu interesse?</legend>
                <div className="space-y-3">
                  {OPTIONS.map((o) => (
                    <label
                      key={o.id}
                      className={`flex cursor-pointer items-start gap-3 rounded-2xl border-2 p-4 text-sm transition-colors ${
                        interest === o.id
                          ? "border-brand bg-brand/5 font-semibold"
                          : "border-border hover:border-brand/40"
                      }`}
                    >
                      <input
                        type="radio"
                        name="interesse"
                        checked={interest === o.id}
                        onChange={() => onInterestChange(o.id)}
                        className="mt-1 h-4 w-4 shrink-0 accent-[var(--brand)]"
                      />
                      <span>{o.label}</span>
                    </label>
                  ))}
                </div>
                {errors['interest'] && (
                  <p className="mt-1 text-xs text-destructive">{errors['interest']}</p>
                )}
              </fieldset>

              <button
                type="submit"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand px-6 py-4 text-sm font-black uppercase tracking-wide text-brand-foreground shadow-xl shadow-brand/30 transition-all hover:scale-[1.02] hover:bg-brand-dark sm:text-base"
              >
                <Download className="h-5 w-5 shrink-0" />
                Baixar apresentação e comparativo de modelos
              </button>

              <p className="flex items-center justify-center gap-2 text-center text-xs text-muted-foreground">
                <ShieldCheck className="h-4 w-4 shrink-0 text-brand" />
                Respeitamos sua privacidade. Seus dados estão 100% seguros.
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
