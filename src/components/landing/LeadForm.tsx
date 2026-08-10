import { ArrowLeft, ArrowRight, CheckCircle2, Download, Loader2, ShieldCheck } from "lucide-react";
import { useState, type FormEvent } from "react";
import { useServerFn } from "@tanstack/react-start";
import { submitLead } from "@/lib/content.functions";
import type { SiteContent } from "@/lib/site-content";
import type { Interest } from "./types";


const UFS = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO",
];

const OPTIONS: { id: Interest; label: string }[] = [
  { id: "licenciamento", label: "Já tenho uma cozinha/restaurante e quero Licenciar a Marca" },
  { id: "franquia", label: "Quero abrir uma Franquia do Zero (A partir de R$ 200k)" },
  { id: "ambos", label: "Quero entender ambos os modelos para decidir" },
];

type Experience = "sim" | "nao";

const EXPERIENCE_OPTIONS: { id: Experience; label: string }[] = [
  { id: "sim", label: "Sim, já atuo no ramo de alimentação" },
  { id: "nao", label: "Não, seria a minha primeira vez no setor" },
];

const INVESTMENT_RANGES: Record<
  "licenciamento" | "franquia" | "default",
  { min: number; max: number; step: number; def: number }
> = {
  licenciamento: { min: 10000, max: 100000, step: 10000, def: 20000 },
  franquia: { min: 150000, max: 500000, step: 50000, def: 200000 },
  default: { min: 50000, max: 500000, step: 50000, def: 200000 },
};

function rangeFor(interest: Interest | null) {
  if (interest === "licenciamento") return INVESTMENT_RANGES.licenciamento;
  if (interest === "franquia") return INVESTMENT_RANGES.franquia;
  return INVESTMENT_RANGES.default;
}

const CITY_SUGGESTIONS = [
  "São Paulo - SP","Campinas - SP","Santos - SP","Rio de Janeiro - RJ","Niterói - RJ",
  "Belo Horizonte - MG","Uberlândia - MG","Curitiba - PR","Londrina - PR","Porto Alegre - RS",
  "Florianópolis - SC","Joinville - SC","Salvador - BA","Recife - PE","Fortaleza - CE",
  "Brasília - DF","Goiânia - GO","Cuiabá - MT","Campo Grande - MS","Belém - PA","Manaus - AM",
];

const brl = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });



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
  content,
  interest,
  onInterestChange,
}: {
  content: SiteContent;
  interest: Interest | null;
  onInterestChange: (i: Interest) => void;
}) {
  const send = useServerFn(submitLead);
  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [uf, setUf] = useState("");
  const [investment, setInvestment] = useState(50000);
  const [experience, setExperience] = useState<Experience | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  function validateStep1() {
    const e: Record<string, string> = {};
    if (name.trim().length < 3) e['name'] = "Informe seu nome completo.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) e['email'] = "Informe um e-mail válido.";
    if (phone.replace(/\D/g, "").length < 10) e['phone'] = "Informe um WhatsApp válido com DDD.";
    if (city.trim().length < 2) e['city'] = "Informe sua cidade.";
    if (!uf) e['uf'] = "Selecione o estado.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function validateStep2() {
    const e: Record<string, string> = {};
    if (!interest) e['interest'] = "Selecione o seu interesse.";
    if (!experience) e['experience'] = "Selecione uma opção.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleNext() {
    if (!validateStep1()) return;
    setErrors({});
    setStep(2);
  }

  async function handleSubmit(ev: FormEvent) {
    ev.preventDefault();
    if (step === 1) {
      handleNext();
      return;
    }
    if (!validateStep2() || !interest || !experience) return;
    setSending(true);
    try {
      await send({
        data: {
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          city: city.trim(),
          uf,
          interest,
          investment,
          experience,
        },
      });
      setSent(true);
    } catch (err) {
      setErrors({
        form: err instanceof Error ? err.message : "Não foi possível enviar. Tente novamente.",
      });
    } finally {
      setSending(false);
    }
  }


  return (
    <section id="form" className="bg-secondary/60 py-20 sm:py-24">
      <div className="mx-auto max-w-3xl px-4">
        <h2 className="text-center text-3xl font-black tracking-tight sm:text-4xl">
          {content.texts.formTitle}
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-sm text-muted-foreground sm:text-base">
          {content.texts.formSubtitle}
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
              <div className="flex items-center gap-3">
                {[1, 2].map((s) => (
                  <div key={s} className="flex flex-1 items-center gap-2">
                    <span
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-black ${
                        step >= s ? "bg-brand text-brand-foreground" : "bg-secondary text-muted-foreground"
                      }`}
                    >
                      {s}
                    </span>
                    <span className="h-1 flex-1 rounded-full bg-secondary">
                      <span
                        className={`block h-1 rounded-full bg-brand transition-all ${
                          step > s ? "w-full" : step === s ? "w-1/2" : "w-0"
                        }`}
                      />
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                {step === 1 ? "Etapa 1 de 2 — Seus dados" : "Etapa 2 de 2 — Seu perfil de investimento"}
              </p>

              {step === 1 ? (
                <>
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

                  <button
                    type="button"
                    onClick={handleNext}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand px-6 py-4 text-sm font-black uppercase tracking-wide text-brand-foreground shadow-xl shadow-brand/30 transition-all hover:scale-[1.02] hover:bg-brand-dark sm:text-base"
                  >
                    Continuar
                    <ArrowRight className="h-5 w-5 shrink-0" />
                  </button>
                </>
              ) : (
                <>
                  <fieldset>
                    <legend className="mb-3 text-sm font-bold">Qual modelo mais te interessa?</legend>
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

                  <div className="rounded-2xl border-2 border-border p-4 sm:p-5">
                    <label htmlFor="investimento" className="block text-sm font-bold">
                      Qual sua pretensão de investimento?
                    </label>
                    <p className="mt-3 text-2xl font-black text-brand sm:text-3xl">
                      {brl(investment)}
                      {investment === 500000 && "+"}
                    </p>
                    <input
                      id="investimento"
                      type="range"
                      min={50000}
                      max={500000}
                      step={50000}
                      value={investment}
                      onChange={(e) => setInvestment(Number(e.target.value))}
                      className="mt-4 w-full accent-[var(--brand)]"
                    />
                    <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                      <span>R$ 50 mil</span>
                      <span>R$ 500 mil</span>
                    </div>
                  </div>

                  <fieldset>
                    <legend className="mb-3 text-sm font-bold">
                      Você já atua na área de alimentação?
                    </legend>
                    <div className="space-y-3">
                      {EXPERIENCE_OPTIONS.map((o) => (
                        <label
                          key={o.id}
                          className={`flex cursor-pointer items-start gap-3 rounded-2xl border-2 p-4 text-sm transition-colors ${
                            experience === o.id
                              ? "border-brand bg-brand/5 font-semibold"
                              : "border-border hover:border-brand/40"
                          }`}
                        >
                          <input
                            type="radio"
                            name="experiencia"
                            checked={experience === o.id}
                            onChange={() => setExperience(o.id)}
                            className="mt-1 h-4 w-4 shrink-0 accent-[var(--brand)]"
                          />
                          <span>{o.label}</span>
                        </label>
                      ))}
                    </div>
                    {errors['experience'] && (
                      <p className="mt-1 text-xs text-destructive">{errors['experience']}</p>
                    )}
                  </fieldset>

                  {errors['form'] && (
                    <p className="text-center text-sm text-destructive">{errors['form']}</p>
                  )}

                  <div className="flex flex-col gap-3 sm:flex-row-reverse">
                    <button
                      type="submit"
                      disabled={sending}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand px-6 py-4 text-sm font-black uppercase tracking-wide text-brand-foreground shadow-xl shadow-brand/30 transition-all hover:scale-[1.02] hover:bg-brand-dark disabled:opacity-60 sm:text-base"
                    >
                      {sending ? (
                        <Loader2 className="h-5 w-5 shrink-0 animate-spin" />
                      ) : (
                        <Download className="h-5 w-5 shrink-0" />
                      )}
                      Enviar informações e Baixar Material
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setErrors({});
                        setStep(1);
                      }}
                      className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-border px-6 py-4 text-sm font-bold text-muted-foreground transition-colors hover:border-brand/40 hover:text-foreground sm:w-auto"
                    >
                      <ArrowLeft className="h-4 w-4 shrink-0" />
                      Voltar
                    </button>
                  </div>
                </>
              )}

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

