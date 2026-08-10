import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { ImageIcon, Loader2, LogOut, Type, Users } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { getSiteContent } from "@/lib/content.functions";
import {
  deleteLead,
  getAdminStatus,
  listLeads,
  resetSiteContentKey,
  saveSiteContent,
} from "@/lib/admin.functions";
import { IMAGE_FIELDS, TEXT_FIELDS, type ImageKey } from "@/lib/site-content";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Painel administrativo | Ben's Chicken" },
      { name: "description", content: "Gerencie imagens, textos e leads da landing page." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

type Tab = "imagens" | "textos" | "leads";

async function checkAdminStatus() {
  try {
    const res = await getAdminStatus();
    if (res?.isAdmin) return res;
  } catch (err) {
    console.warn("Server admin check fallback to client-side check:", err);
  }

  const { data: authData } = await supabase.auth.getUser();
  if (!authData?.user) return { isAdmin: false, userId: null };

  const { data: roleRow } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", authData.user.id)
    .eq("role", "admin")
    .maybeSingle();

  return { isAdmin: Boolean(roleRow), userId: authData.user.id };
}

function AdminPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<Tab>("imagens");

  const status = useQuery({ queryKey: ["admin-status"], queryFn: () => checkAdminStatus() });

  useEffect(() => {
    if (status.data && !status.data.isAdmin) {
      toast.error("Sua conta ainda não tem permissão de administrador.");
    }
  }, [status.data]);

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    void navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="min-h-screen bg-secondary/50">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <div>
            <p className="text-lg font-black tracking-tight">
              Painel <span className="text-brand">Ben&apos;s Chicken</span>
            </p>
            <p className="text-xs text-muted-foreground">Conteúdo da landing page</p>
          </div>
          <button
            onClick={signOut}
            className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-bold transition-colors hover:border-brand hover:text-brand"
          >
            <LogOut className="h-4 w-4" />
            Sair
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">
        {status.isPending ? (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Carregando…
          </p>
        ) : !status.data?.isAdmin ? (
          <div className="rounded-3xl border border-border bg-card p-8 text-center">
            <h1 className="text-xl font-black">Acesso pendente</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Sua conta está criada, mas ainda não possui o papel de administrador. Solicite a
              liberação do acesso para gerenciar o conteúdo.
            </p>
          </div>
        ) : (
          <>
            <nav className="mb-6 flex flex-wrap gap-2">
              {(
                [
                  ["imagens", "Imagens", ImageIcon],
                  ["textos", "Textos", Type],
                  ["leads", "Leads", Users],
                ] as const
              ).map(([value, label, Icon]) => (
                <button
                  key={value}
                  onClick={() => setTab(value)}
                  className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold transition-colors ${
                    tab === value
                      ? "bg-brand text-brand-foreground"
                      : "border border-border bg-card text-muted-foreground hover:text-brand"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              ))}
            </nav>

            {tab === "imagens" && <ImagesTab />}
            {tab === "textos" && <TextsTab />}
            {tab === "leads" && <LeadsTab />}
          </>
        )}
      </main>
    </div>
  );
}

function useContent() {
  return useQuery({ queryKey: ["site-content"], queryFn: () => getSiteContent() });
}

function ImagesTab() {
  const content = useContent();
  const queryClient = useQueryClient();
  const save = useServerFn(saveSiteContent);
  const reset = useServerFn(resetSiteContentKey);
  const [busy, setBusy] = useState<ImageKey | null>(null);

  async function upload(key: ImageKey, file: File) {
    if (file.size > 10 * 1024 * 1024) {
      toast.error("A imagem deve ter no máximo 10 MB.");
      return;
    }
    setBusy(key);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
      const path = `${key}/${Date.now()}.${ext}`;
      const { error } = await supabase.storage
        .from("site-images")
        .upload(path, file, { contentType: file.type, upsert: false });
      if (error) throw error;
      await save({ data: [{ key, value: path }] });
      await queryClient.invalidateQueries({ queryKey: ["site-content"] });
      toast.success("Imagem atualizada.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha ao enviar a imagem.");
    } finally {
      setBusy(null);
    }
  }

  async function restore(key: ImageKey) {
    setBusy(key);
    try {
      await reset({ data: { key } });
      await queryClient.invalidateQueries({ queryKey: ["site-content"] });
      toast.success("Imagem padrão restaurada.");
    } catch {
      toast.error("Não foi possível restaurar.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2">
      {IMAGE_FIELDS.map((field) => {
        const url = content.data?.images[field.key] ?? null;
        return (
          <div key={field.key} className="rounded-3xl border border-border bg-card p-5">
            <p className="text-sm font-bold">{field.label}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Tamanho recomendado: {field.size} · máx. 10 MB
            </p>
            <div className="mt-3 aspect-video overflow-hidden rounded-2xl bg-secondary">
              {url ? (
                <img src={url} alt={field.label} className="h-full w-full object-cover" />
              ) : (
                <div className="grid h-full place-items-center text-xs text-muted-foreground">
                  Usando a imagem padrão do site
                </div>
              )}
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-brand px-4 py-2 text-xs font-bold uppercase tracking-wide text-brand-foreground transition-colors hover:bg-brand-dark">
                {busy === field.key ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ImageIcon className="h-4 w-4" />
                )}
                Trocar imagem
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={busy !== null}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    e.target.value = "";
                    if (file) void upload(field.key, file);
                  }}
                />
              </label>
              {url && (
                <button
                  onClick={() => void restore(field.key)}
                  disabled={busy !== null}
                  className="text-xs font-bold text-muted-foreground underline-offset-4 hover:text-brand hover:underline"
                >
                  Restaurar padrão
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function TextsTab() {
  const content = useContent();
  const queryClient = useQueryClient();
  const save = useServerFn(saveSiteContent);
  const [values, setValues] = useState<Record<string, string> | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (content.data && !values) setValues({ ...content.data.texts });
  }, [content.data, values]);

  if (!values) {
    return (
      <p className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Carregando textos…
      </p>
    );
  }

  async function handleSave() {
    if (!values) return;
    setSaving(true);
    try {
      await save({ data: Object.entries(values).map(([key, value]) => ({ key, value })) });
      await queryClient.invalidateQueries({ queryKey: ["site-content"] });
      toast.success("Textos salvos com sucesso.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha ao salvar.");
    } finally {
      setSaving(false);
    }
  }

  const inputClass =
    "w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-brand/25";

  return (
    <div className="rounded-3xl border border-border bg-card p-6">
      <div className="grid gap-5 sm:grid-cols-2">
        {TEXT_FIELDS.map((field) => (
          <div key={field.key} className={field.multiline ? "sm:col-span-2" : ""}>
            <label htmlFor={field.key} className="mb-2 block text-sm font-bold">
              {field.label}
            </label>
            {field.multiline ? (
              <textarea
                id={field.key}
                rows={3}
                maxLength={600}
                value={values[field.key] ?? ""}
                onChange={(e) => setValues({ ...values, [field.key]: e.target.value })}
                className={inputClass}
              />
            ) : (
              <input
                id={field.key}
                maxLength={600}
                value={values[field.key] ?? ""}
                onChange={(e) => setValues({ ...values, [field.key]: e.target.value })}
                className={inputClass}
              />
            )}
          </div>
        ))}
      </div>
      <button
        onClick={() => void handleSave()}
        disabled={saving}
        className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-bold uppercase tracking-wide text-brand-foreground transition-colors hover:bg-brand-dark disabled:opacity-60"
      >
        {saving && <Loader2 className="h-4 w-4 animate-spin" />}
        Salvar alterações
      </button>
    </div>
  );
}

const interestLabels: Record<string, string> = {
  licenciamento: "Licenciamento",
  franquia: "Franquia",
  ambos: "Ambos",
};

async function fetchLeads() {
  try {
    return await listLeads();
  } catch (e) {
    console.warn("Server listLeads failed, fetching directly via Supabase client:", e);
    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  }
}

function LeadsTab() {
  const queryClient = useQueryClient();
  const leads = useQuery({ queryKey: ["leads"], queryFn: () => fetchLeads() });
  const remove = useServerFn(deleteLead);

  async function handleDelete(id: string) {
    try {
      try {
        await remove({ data: { id } });
      } catch {
        const { error } = await supabase.from("leads").delete().eq("id", id);
        if (error) throw error;
      }
      await queryClient.invalidateQueries({ queryKey: ["leads"] });
      toast.success("Lead excluído.");
    } catch {
      toast.error("Não foi possível excluir.");
    }
  }

  if (leads.isPending) {
    return (
      <p className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Carregando leads…
      </p>
    );
  }

  if (!leads.data || leads.data.length === 0) {
    return (
      <div className="rounded-3xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
        Nenhum lead recebido ainda.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-3xl border border-border bg-card">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            <th className="px-4 py-3">Data</th>
            <th className="px-4 py-3">Nome</th>
            <th className="px-4 py-3">Contato</th>
            <th className="px-4 py-3">Local</th>
            <th className="px-4 py-3">Interesse</th>
            <th className="px-4 py-3">Investimento</th>
            <th className="px-4 py-3">Experiência</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          {leads.data.map((lead) => (
            <tr key={lead.id} className="border-b border-border/70 last:border-0">
              <td className="px-4 py-3 text-muted-foreground">
                {new Date(lead.created_at).toLocaleDateString("pt-BR")}
              </td>
              <td className="px-4 py-3 font-semibold">{lead.name}</td>
              <td className="px-4 py-3">
                <span className="block">{lead.email}</span>
                <span className="block text-muted-foreground">{lead.phone}</span>
              </td>
              <td className="px-4 py-3">
                {lead.city}/{lead.uf}
                {lead.operation_city && (
                  <span className="block text-xs text-muted-foreground">
                    Operar em: {lead.operation_city}
                  </span>
                )}
              </td>
              <td className="px-4 py-3">
                <span className="rounded-full bg-secondary px-3 py-1 text-xs font-bold text-brand">
                  {interestLabels[lead.interest] ?? lead.interest}
                </span>
              </td>
              <td className="px-4 py-3">
                {lead.investment
                  ? lead.investment.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                      maximumFractionDigits: 0,
                    })
                  : "—"}
              </td>
              <td className="px-4 py-3">
                {lead.experience === "sim"
                  ? "Já atua"
                  : lead.experience === "nao"
                    ? "Primeira vez"
                    : "—"}
              </td>
              <td className="px-4 py-3 text-right">
                <button
                  onClick={() => void handleDelete(lead.id)}
                  className="text-xs font-bold text-muted-foreground hover:text-destructive"
                >
                  Excluir
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
