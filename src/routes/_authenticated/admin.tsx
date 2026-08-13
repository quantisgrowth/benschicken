import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import {
  Activity,
  BarChart3,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  Download,
  ExternalLink,
  Eye,
  EyeOff,
  FileDown,
  FileText,
  Film,
  HelpCircle,
  ImageIcon,
  Key,
  KeyRound,
  Link2,
  Loader2,
  Lock,
  LogOut,
  Plus,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Trash2,
  Type,
  UploadCloud,
  UserCheck,
  UserPlus,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { getSiteContent } from "@/lib/content.functions";
import {
  createAdminUser,
  deleteAdminUser,
  deleteLead,
  getAdminStatus,
  listAdminUsers,
  listLeads,
  resetSiteContentKey,
  saveSiteContent,
  updateAdminUserPassword,
  uploadAdminFile,
} from "@/lib/admin.functions";
import { IMAGE_FIELDS, TEXT_FIELDS, type ImageKey, type TextKey } from "@/lib/site-content";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Painel administrativo | Ben's Chicken" },
      { name: "description", content: "Gerencie imagens, textos, apresentação, rastreamento, usuários e leads da landing page." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

type Tab = "material" | "imagens" | "textos" | "leads" | "rastreamento" | "usuarios";

async function checkAdminStatus() {
  const { data: authData } = await supabase.auth.getUser();
  if (!authData?.user) return { isAdmin: false, userId: null };

  return { isAdmin: true, userId: authData.user.id };
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
            <p className="text-xs text-muted-foreground">Gestão completa da landing page</p>
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
                  ["material", "Apresentação & Material", FileText],
                  ["imagens", "Imagens & Vídeos", ImageIcon],
                  ["textos", "Textos", Type],
                  ["leads", "Leads", Users],
                  ["rastreamento", "Rastreamento & Pixels", BarChart3],
                  ["usuarios", "Usuários & Acesso", ShieldCheck],
                ] as const
              ).map(([value, label, Icon]) => (
                <button
                  key={value}
                  onClick={() => setTab(value)}
                  className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold transition-colors ${
                    tab === value
                      ? "bg-brand text-brand-foreground shadow-md shadow-brand/20"
                      : "border border-border bg-card text-muted-foreground hover:text-brand"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              ))}
            </nav>

            {tab === "material" && <MaterialTab />}
            {tab === "imagens" && <ImagesTab />}
            {tab === "textos" && <TextsTab />}
            {tab === "leads" && <LeadsTab />}
            {tab === "rastreamento" && <TrackingTab />}
            {tab === "usuarios" && <UsersTab />}
          </>
        )}
      </main>
    </div>
  );
}

function useContent() {
  return useQuery({ queryKey: ["site-content"], queryFn: () => getSiteContent() });
}

const TESTIMONIAL_VIDEOS: Record<string, { key: TextKey; name: string }> = {
  testimonial1Image: { key: "testimonial1Video", name: "Carlos (Curitiba)" },
  testimonial2Image: { key: "testimonial2Video", name: "Juliana (Campinas)" },
  testimonial3Image: { key: "testimonial3Video", name: "Rafael (Belo Horizonte)" },
};

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(",")[1];
      if (!base64) {
        reject(new Error("Falha ao converter arquivo"));
        return;
      }
      resolve(base64);
    };
    reader.onerror = () => reject(new Error("Falha na leitura do arquivo"));
    reader.readAsDataURL(file);
  });
}

function MaterialTab() {
  const content = useContent();
  const queryClient = useQueryClient();
  const save = useServerFn(saveSiteContent);
  const reset = useServerFn(resetSiteContentKey);
  const uploadFile = useServerFn(uploadAdminFile);
  const [busy, setBusy] = useState<string | null>(null);
  const [delaySeconds, setDelaySeconds] = useState<string>("5");
  const [savingDelay, setSavingDelay] = useState(false);

  useEffect(() => {
    if (content.data?.texts?.presentationAutoDownloadSeconds !== undefined) {
      setDelaySeconds(content.data.texts.presentationAutoDownloadSeconds);
    }
  }, [content.data]);

  async function persistData(rows: { key: string; value: string }[]) {
    try {
      await save({ data: rows });
    } catch (err) {
      console.warn("Server save fallback to client-side supabase:", err);
      const { data: user } = await supabase.auth.getUser();
      const payload = rows.map((r) => ({
        key: r.key,
        value: r.value,
        updated_at: new Date().toISOString(),
        updated_by: user?.user?.id ?? null,
      }));
      const { error } = await supabase.from("site_content").upsert(payload);
      if (error) throw error;
    }
  }

  async function uploadPdf(file: File) {
    if (!file.name.toLowerCase().endsWith(".pdf") && file.type !== "application/pdf") {
      toast.error("Por favor, selecione um arquivo em formato PDF (.pdf).");
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      toast.error("O arquivo PDF deve ter no máximo 25 MB.");
      return;
    }
    setBusy("upload");
    try {
      let { data: sessionData } = await supabase.auth.getSession();
      let accessToken = sessionData?.session?.access_token;
      if (!accessToken || (sessionData?.session?.expires_at && sessionData.session.expires_at * 1000 < Date.now() + 60000)) {
        const { data: refreshed } = await supabase.auth.refreshSession();
        accessToken = refreshed?.session?.access_token;
      }

      if (!accessToken) {
        toast.error("Sua sessão expirou. Por favor, faça login novamente no painel.");
        return;
      }

      const fileBase64 = await fileToBase64(file);
      await uploadFile({
        data: {
          accessToken,
          key: "presentationFile",
          fileName: file.name,
          fileBase64,
          contentType: "application/pdf",
        },
      });
      await queryClient.invalidateQueries({ queryKey: ["site-content"] });
      toast.success("Apresentação comercial em PDF atualizada com sucesso!");
    } catch (err) {
      console.error("Upload error:", err);
      toast.error(err instanceof Error ? err.message : "Falha ao enviar o arquivo PDF.");
    } finally {
      setBusy(null);
    }
  }

  async function removePdf() {
    setBusy("remove");
    try {
      try {
        await reset({ data: { key: "presentationFile" } });
      } catch (err) {
        console.warn("Server reset fallback to client-side supabase:", err);
        const { error } = await supabase.from("site_content").delete().eq("key", "presentationFile");
        if (error) throw error;
      }
      await queryClient.invalidateQueries({ queryKey: ["site-content"] });
      toast.success("Apresentação comercial removida.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha ao remover o arquivo.");
    } finally {
      setBusy(null);
    }
  }

  async function handleSaveDelay() {
    const num = parseInt(delaySeconds, 10);
    if (isNaN(num) || num < 0 || num > 120) {
      toast.error("Informe um tempo válido em segundos (entre 0 e 120).");
      return;
    }
    setSavingDelay(true);
    try {
      await persistData([{ key: "presentationAutoDownloadSeconds", value: String(num) }]);
      await queryClient.invalidateQueries({ queryKey: ["site-content"] });
      toast.success("Tempo de download automático salvo com sucesso!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha ao salvar configuração de tempo.");
    } finally {
      setSavingDelay(false);
    }
  }

  const currentPdfUrl = content.data?.texts?.presentationFile;
  const isUploaded = Boolean(currentPdfUrl && currentPdfUrl.length > 0);

  return (
    <div className="space-y-6">
      {/* Card 1: Upload da Apresentação */}
      <div className="rounded-3xl border border-border bg-card p-6 sm:p-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10 text-brand">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-black tracking-tight text-foreground">
              Apresentação Comercial (PDF)
            </h2>
            <p className="text-xs text-muted-foreground">
              Arquivo disponibilizado para download pelo Lead após o preenchimento do formulário na Landing Page.
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-border bg-secondary/30 p-5">
          {isUploaded ? (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand/15 text-brand">
                  <FileDown className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-foreground">Apresentação Ativa</p>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="h-3 w-3" /> Disponível para Download
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    O lead receberá e poderá baixar este arquivo PDF assim que enviar o formulário.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <a
                  href={currentPdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-bold text-foreground transition-colors hover:border-brand hover:text-brand"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span>Testar / Visualizar</span>
                </a>

                <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-brand px-3.5 py-2 text-xs font-bold uppercase tracking-wide text-brand-foreground transition-colors hover:bg-brand-dark">
                  {busy === "upload" ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <UploadCloud className="h-3.5 w-3.5" />
                  )}
                  <span>Trocar PDF</span>
                  <input
                    type="file"
                    accept="application/pdf,.pdf"
                    className="hidden"
                    disabled={busy !== null}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      e.target.value = "";
                      if (file) void uploadPdf(file);
                    }}
                  />
                </label>

                <button
                  type="button"
                  onClick={() => void removePdf()}
                  disabled={busy !== null}
                  className="inline-flex items-center gap-1 rounded-xl px-2.5 py-2 text-xs font-semibold text-destructive/80 hover:bg-destructive/10 hover:text-destructive transition-colors"
                >
                  {busy === "remove" ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="h-3.5 w-3.5" />
                  )}
                  <span>Remover</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary text-muted-foreground">
                <FileText className="h-7 w-7" />
              </div>
              <h3 className="mt-3 text-sm font-bold text-foreground">
                Nenhum arquivo PDF cadastrado
              </h3>
              <p className="mt-1 text-xs text-muted-foreground max-w-sm mx-auto">
                Suba o arquivo PDF da apresentação comercial para habilitar o botão e o download automático na Landing Page.
              </p>

              <label className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-2xl bg-brand px-5 py-2.5 text-xs font-bold uppercase tracking-wide text-brand-foreground transition-colors hover:bg-brand-dark shadow-sm">
                {busy === "upload" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <UploadCloud className="h-4 w-4" />
                )}
                <span>Selecionar arquivo PDF (até 50MB)</span>
                <input
                  type="file"
                  accept="application/pdf,.pdf"
                  className="hidden"
                  disabled={busy !== null}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    e.target.value = "";
                    if (file) void uploadPdf(file);
                  }}
                />
              </label>
            </div>
          )}
        </div>
      </div>

      {/* Card 2: Tempo de Download Automático */}
      <div className="rounded-3xl border border-border bg-card p-6 sm:p-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10 text-brand">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-black tracking-tight text-foreground">
              Início Automático do Download
            </h2>
            <p className="text-xs text-muted-foreground">
              Configure o tempo de espera antes do download iniciar automaticamente após o cadastro.
            </p>
          </div>
        </div>

        <div className="mt-6 max-w-md space-y-4">
          <div>
            <label htmlFor="delaySeconds" className="mb-2 block text-sm font-bold text-foreground">
              Tempo de contagem regressiva (em segundos)
            </label>
            <div className="flex items-center gap-3">
              <input
                id="delaySeconds"
                type="number"
                min="0"
                max="120"
                value={delaySeconds}
                onChange={(e) => setDelaySeconds(e.target.value)}
                className="w-32 rounded-2xl border border-border bg-background px-4 py-3 text-sm font-semibold outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-brand/25"
              />
              <span className="text-sm font-medium text-muted-foreground">segundos</span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
              <strong>Recomendação:</strong> 5 segundos permite que o lead veja a confirmação antes do download disparar. Defina <strong>0</strong> caso queira que o download ocorra apenas quando o lead clicar no botão.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void handleSaveDelay()}
            disabled={savingDelay}
            className="inline-flex items-center gap-2 rounded-full bg-brand px-6 py-2.5 text-xs font-bold uppercase tracking-wide text-brand-foreground transition-colors hover:bg-brand-dark disabled:opacity-60"
          >
            {savingDelay && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Salvar tempo de espera
          </button>
        </div>
      </div>
    </div>
  );
}

function ImagesTab() {
  const content = useContent();
  const queryClient = useQueryClient();
  const save = useServerFn(saveSiteContent);
  const reset = useServerFn(resetSiteContentKey);
  const [busy, setBusy] = useState<string | null>(null);
  const [linkModal, setLinkModal] = useState<{
    key: TextKey;
    name: string;
    url: string;
  } | null>(null);
  const [urlInput, setUrlInput] = useState("");

  async function persistData(rows: { key: string; value: string }[]) {
    try {
      await save({ data: rows });
    } catch (err) {
      console.warn("Server save fallback to client-side supabase:", err);
      const { data: user } = await supabase.auth.getUser();
      const payload = rows.map((r) => ({
        key: r.key,
        value: r.value,
        updated_at: new Date().toISOString(),
        updated_by: user?.user?.id ?? null,
      }));
      const { error } = await supabase.from("site_content").upsert(payload);
      if (error) throw error;
    }
  }

  async function removeKey(key: string) {
    try {
      await reset({ data: { key } });
    } catch (err) {
      console.warn("Server reset fallback to client-side supabase:", err);
      const { error } = await supabase.from("site_content").delete().eq("key", key);
      if (error) throw error;
    }
  }

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
      await persistData([{ key, value: path }]);
      await queryClient.invalidateQueries({ queryKey: ["site-content"] });
      toast.success("Imagem de capa atualizada.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha ao enviar a imagem.");
    } finally {
      setBusy(null);
    }
  }

  async function uploadVideo(key: TextKey, file: File) {
    if (file.size > 50 * 1024 * 1024) {
      toast.error("O vídeo deve ter no máximo 50 MB.");
      return;
    }
    setBusy(key);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "mp4";
      const path = `videos/${key}/${Date.now()}.${ext}`;
      const { error } = await supabase.storage
        .from("site-images")
        .upload(path, file, { contentType: file.type, upsert: false });
      if (error) throw error;
      await persistData([{ key, value: path }]);
      await queryClient.invalidateQueries({ queryKey: ["site-content"] });
      toast.success("Arquivo de vídeo enviado com sucesso.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha ao enviar o vídeo.");
    } finally {
      setBusy(null);
    }
  }

  async function saveVideoUrl() {
    if (!linkModal) return;
    setBusy(linkModal.key);
    try {
      await persistData([{ key: linkModal.key, value: urlInput.trim() }]);
      await queryClient.invalidateQueries({ queryKey: ["site-content"] });
      toast.success("Link do vídeo atualizado.");
      setLinkModal(null);
      setUrlInput("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha ao salvar link do vídeo.");
    } finally {
      setBusy(null);
    }
  }

  async function removeVideo(key: TextKey) {
    setBusy(key);
    try {
      await removeKey(key);
      await queryClient.invalidateQueries({ queryKey: ["site-content"] });
      toast.success("Vídeo removido.");
    } catch {
      toast.error("Falha ao remover vídeo.");
    } finally {
      setBusy(null);
    }
  }

  async function restore(key: ImageKey) {
    setBusy(key);
    try {
      await removeKey(key);
      await queryClient.invalidateQueries({ queryKey: ["site-content"] });
      toast.success("Imagem padrão restaurada.");
    } catch {
      toast.error("Não foi possível restaurar.");
    } finally {
      setBusy(null);
    }
  }

  const categories = Array.from(
    new Set(IMAGE_FIELDS.map((f) => ("category" in f ? f.category : "Geral"))),
  );

  return (
    <div className="space-y-10">
      {categories.map((cat) => {
        const fields = IMAGE_FIELDS.filter(
          (f) => ("category" in f ? f.category : "Geral") === cat,
        );
        return (
          <section key={cat}>
            <h2 className="mb-4 text-lg font-black tracking-tight text-foreground border-b border-border/60 pb-2">
              {cat}
            </h2>
            <div className="grid gap-5 sm:grid-cols-2">
              {fields.map((field) => {
                const url = content.data?.images[field.key] ?? null;
                const videoConfig = TESTIMONIAL_VIDEOS[field.key];
                const videoValue = videoConfig
                  ? content.data?.texts[videoConfig.key] || ""
                  : "";

                const isYouTube =
                  videoValue.includes("youtube.com") || videoValue.includes("youtu.be");
                const isVimeo = videoValue.includes("vimeo.com");
                const isUploadedVideo =
                  videoValue.length > 0 && !isYouTube && !isVimeo;

                return (
                  <div
                    key={field.key}
                    className="flex flex-col justify-between rounded-3xl border border-border bg-card p-5"
                  >
                    <div>
                      <p className="text-sm font-bold">{field.label}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Tamanho recomendado: {field.size} · máx. 10 MB
                      </p>

                      {/* Thumbnail Preview */}
                      <div className="mt-3 aspect-video overflow-hidden rounded-2xl bg-secondary">
                        {url ? (
                          <img
                            src={url}
                            alt={field.label}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="grid h-full place-items-center text-xs text-muted-foreground">
                            Usando a imagem padrão do site
                          </div>
                        )}
                      </div>

                      {/* Image action buttons */}
                      <div className="mt-4 flex flex-wrap items-center gap-3">
                        <label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-brand px-4 py-2 text-xs font-bold uppercase tracking-wide text-brand-foreground transition-colors hover:bg-brand-dark">
                          {busy === field.key ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <ImageIcon className="h-4 w-4" />
                          )}
                          Trocar capa
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
                            Restaurar capa
                          </button>
                        )}
                      </div>

                      {/* Testimonial Video Controls */}
                      {videoConfig && (
                        <div className="mt-5 rounded-2xl border border-border/80 bg-secondary/50 p-4">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                              Vídeo do Depoimento
                            </span>
                            {videoValue ? (
                              <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                                {isYouTube
                                  ? "YouTube ativo"
                                  : isVimeo
                                  ? "Vimeo ativo"
                                  : "Arquivo de vídeo ativo"}
                              </span>
                            ) : (
                              <span className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-semibold text-muted-foreground">
                                Sem vídeo configurado
                              </span>
                            )}
                          </div>

                          {videoValue && (
                            <p className="mt-2 truncate text-xs text-muted-foreground" title={videoValue}>
                              {isUploadedVideo ? "Arquivo enviado no storage" : videoValue}
                            </p>
                          )}

                          {/* 2 Dedicated Video Buttons */}
                          <div className="mt-3 flex flex-wrap items-center gap-2">
                            {/* Option 1: Upload Video File */}
                            <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-2 text-xs font-bold text-foreground transition-colors hover:border-brand/40 hover:bg-secondary hover:text-brand">
                              {busy === videoConfig.key ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <UploadCloud className="h-3.5 w-3.5" />
                              )}
                              <span>Subir arquivo de vídeo</span>
                              <input
                                type="file"
                                accept="video/mp4,video/webm,video/quicktime,video/*"
                                className="hidden"
                                disabled={busy !== null}
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  e.target.value = "";
                                  if (file) void uploadVideo(videoConfig.key, file);
                                }}
                              />
                            </label>

                            {/* Option 2: Insert YouTube/Vimeo Link */}
                            <button
                              type="button"
                              onClick={() => {
                                setLinkModal({
                                  key: videoConfig.key,
                                  name: videoConfig.name,
                                  url: isUploadedVideo ? "" : videoValue,
                                });
                                setUrlInput(isUploadedVideo ? "" : videoValue);
                              }}
                              disabled={busy !== null}
                              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-2 text-xs font-bold text-foreground transition-colors hover:border-brand/40 hover:bg-secondary hover:text-brand"
                            >
                              <Link2 className="h-3.5 w-3.5" />
                              <span>Inserir link (YouTube/Vimeo)</span>
                            </button>

                            {/* Remove Video */}
                            {videoValue && (
                              <button
                                type="button"
                                onClick={() => void removeVideo(videoConfig.key)}
                                disabled={busy !== null}
                                className="inline-flex items-center gap-1 rounded-xl px-2.5 py-2 text-xs font-semibold text-destructive/80 hover:text-destructive hover:bg-destructive/10 transition-colors"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                <span>Remover</span>
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}

      {/* Modal for YouTube/Vimeo Link */}
      {linkModal && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl">
            <h3 className="text-lg font-black tracking-tight text-foreground">
              Link do Vídeo — {linkModal.name}
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Cole o link do vídeo do YouTube (inclusive Shorts) ou Vimeo.
            </p>

            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=... ou https://vimeo.com/..."
              className="mt-4 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground focus:border-brand focus:outline-none"
              autoFocus
            />

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setLinkModal(null);
                  setUrlInput("");
                }}
                disabled={busy !== null}
                className="rounded-xl border border-border px-4 py-2.5 text-xs font-bold text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => void saveVideoUrl()}
                disabled={busy !== null}
                className="inline-flex items-center gap-2 rounded-xl bg-brand px-5 py-2.5 text-xs font-bold uppercase tracking-wide text-brand-foreground hover:bg-brand-dark"
              >
                {busy === linkModal.key && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Salvar link
              </button>
            </div>
          </div>
        </div>
      )}
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
      const rows = Object.entries(values).map(([key, value]) => ({ key, value }));
      try {
        await save({ data: rows });
      } catch (serverErr) {
        console.warn("Server save fallback to client-side supabase:", serverErr);
        const { data: user } = await supabase.auth.getUser();
        const payload = rows.map((r) => ({
          key: r.key,
          value: r.value,
          updated_at: new Date().toISOString(),
          updated_by: user?.user?.id ?? null,
        }));
        const { error } = await supabase.from("site_content").upsert(payload);
        if (error) throw error;
      }
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

  const EXCLUDED_FROM_TEXTS = new Set([
    "presentationFile",
    "presentationAutoDownloadSeconds",
    "metaPixelId",
    "googleAnalyticsId",
    "googleTagManagerId",
    "googleAdsId",
    "googleAdsConversionLabel",
    "customHeadScripts",
  ]);

  return (
    <div className="rounded-3xl border border-border bg-card p-6">
      <div className="grid gap-5 sm:grid-cols-2">
        {TEXT_FIELDS.filter((field) => !EXCLUDED_FROM_TEXTS.has(field.key)).map((field) => (
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

function TrackingTab() {
  const content = useContent();
  const queryClient = useQueryClient();
  const save = useServerFn(saveSiteContent);

  const [metaPixelId, setMetaPixelId] = useState("");
  const [googleAnalyticsId, setGoogleAnalyticsId] = useState("");
  const [googleTagManagerId, setGoogleTagManagerId] = useState("");
  const [googleAdsId, setGoogleAdsId] = useState("");
  const [googleAdsConversionLabel, setGoogleAdsConversionLabel] = useState("");
  const [customHeadScripts, setCustomHeadScripts] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (content.data?.texts) {
      setMetaPixelId(content.data.texts.metaPixelId ?? "");
      setGoogleAnalyticsId(content.data.texts.googleAnalyticsId ?? "");
      setGoogleTagManagerId(content.data.texts.googleTagManagerId ?? "");
      setGoogleAdsId(content.data.texts.googleAdsId ?? "");
      setGoogleAdsConversionLabel(content.data.texts.googleAdsConversionLabel ?? "");
      setCustomHeadScripts(content.data.texts.customHeadScripts ?? "");
    }
  }, [content.data]);

  async function handleSave() {
    setSaving(true);
    try {
      const rows = [
        { key: "metaPixelId", value: metaPixelId.trim() },
        { key: "googleAnalyticsId", value: googleAnalyticsId.trim() },
        { key: "googleTagManagerId", value: googleTagManagerId.trim() },
        { key: "googleAdsId", value: googleAdsId.trim() },
        { key: "googleAdsConversionLabel", value: googleAdsConversionLabel.trim() },
        { key: "customHeadScripts", value: customHeadScripts.trim() },
      ];

      try {
        await save({ data: rows });
      } catch (serverErr) {
        console.warn("Server save fallback to client supabase:", serverErr);
        const { data: user } = await supabase.auth.getUser();
        const payload = rows.map((r) => ({
          key: r.key,
          value: r.value,
          updated_at: new Date().toISOString(),
          updated_by: user?.user?.id ?? null,
        }));
        const { error } = await supabase.from("site_content").upsert(payload);
        if (error) throw error;
      }

      await queryClient.invalidateQueries({ queryKey: ["site-content"] });
      toast.success("Configurações de rastreamento salvas com sucesso!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha ao salvar tags de rastreamento.");
    } finally {
      setSaving(false);
    }
  }

  const inputClass =
    "w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-brand/25";

  return (
    <div className="space-y-6">
      {/* Banner de Rastreamento Automático */}
      <div className="rounded-3xl border border-brand/30 bg-brand/5 p-6 dark:bg-brand/10 sm:p-8">
        <div className="flex items-center gap-3 text-brand">
          <Sparkles className="h-6 w-6 shrink-0" />
          <h2 className="text-lg font-black tracking-tight text-foreground sm:text-xl">
            Rastreamento Inteligente de Conversões
          </h2>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          Basta preencher os identificadores abaixo. Todos os pontos de contato da Landing Page já
          possuem disparos automáticos configurados para Meta, Google Analytics 4, GTM e Google Ads:
        </p>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 text-xs">
          <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-sm">
            <span className="font-bold text-foreground block mb-1">🎯 Formulário de Lead</span>
            <p className="text-muted-foreground">
              Dispara evento <strong className="text-brand">Lead</strong> (Meta),{" "}
              <strong className="text-brand">generate_lead</strong> (GA4) e conversão do Google Ads com dados de interesse e investimento.
            </p>
          </div>
          <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-sm">
            <span className="font-bold text-foreground block mb-1">💬 Cliques no WhatsApp</span>
            <p className="text-muted-foreground">
              Dispara evento <strong className="text-brand">Contact</strong> identificando de qual botão ou área da página partiu o clique (Hero, Barra Mobile, Rodapé).
            </p>
          </div>
          <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-sm">
            <span className="font-bold text-foreground block mb-1">📄 Download da Apresentação</span>
            <p className="text-muted-foreground">
              Dispara eventos <strong className="text-brand">DownloadPresentation</strong> e <strong className="text-brand">ViewContent</strong> (Meta) e <strong className="text-brand">file_download</strong> (GA4).
            </p>
          </div>
          <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-sm">
            <span className="font-bold text-foreground block mb-1">🏬 Modelos de Negócio</span>
            <p className="text-muted-foreground">
              Dispara evento <strong className="text-brand">SelectBusinessModel</strong> marcando o interesse em Franquia ou Licenciamento.
            </p>
          </div>
          <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-sm">
            <span className="font-bold text-foreground block mb-1">🎥 Depoimentos em Vídeo</span>
            <p className="text-muted-foreground">
              Dispara evento <strong className="text-brand">WatchTestimonial</strong> e <strong className="text-brand">video_start</strong> ao assistir histórias reais.
            </p>
          </div>
          <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-sm">
            <span className="font-bold text-foreground block mb-1">⚡ Início de Cadastro</span>
            <p className="text-muted-foreground">
              Dispara <strong className="text-brand">InitiateCheckout</strong> no primeiro toque no formulário para mensurar taxa de abandono.
            </p>
          </div>
        </div>
      </div>

      {/* Formulário de IDs */}
      <div className="rounded-3xl border border-border bg-card p-6 sm:p-8">
        <h3 className="text-base font-bold uppercase tracking-wider text-muted-foreground mb-6">
          Identificadores de Rastreamento
        </h3>

        <div className="grid gap-6 sm:grid-cols-2">
          {/* Meta Pixel */}
          <div className="rounded-2xl border border-border/70 p-5 bg-secondary/20">
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="metaPixelId" className="block text-sm font-bold">
                Meta Pixel ID (Facebook / Instagram)
              </label>
              <span className="text-[10px] font-black uppercase tracking-wider bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full">
                Meta Ads
              </span>
            </div>
            <input
              id="metaPixelId"
              value={metaPixelId}
              onChange={(e) => setMetaPixelId(e.target.value)}
              placeholder="Ex: 123456789012345"
              className={inputClass}
            />
            <p className="mt-2 text-xs text-muted-foreground">
              Encontre no Gerenciador de Eventos da Meta &gt; Configurações do Pixel &gt; ID do Conjunto de Dados.
            </p>
          </div>

          {/* Google Analytics 4 */}
          <div className="rounded-2xl border border-border/70 p-5 bg-secondary/20">
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="googleAnalyticsId" className="block text-sm font-bold">
                Google Analytics 4 (ID da Métrica)
              </label>
              <span className="text-[10px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full">
                GA4
              </span>
            </div>
            <input
              id="googleAnalyticsId"
              value={googleAnalyticsId}
              onChange={(e) => setGoogleAnalyticsId(e.target.value)}
              placeholder="Ex: G-XXXXXXXXXX"
              className={inputClass}
            />
            <p className="mt-2 text-xs text-muted-foreground">
              Encontre em Admin do Google Analytics &gt; Fluxos de Dados &gt; ID da Métrica (inicia com &apos;G-&apos;).
            </p>
          </div>

          {/* Google Tag Manager */}
          <div className="rounded-2xl border border-border/70 p-5 bg-secondary/20">
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="googleTagManagerId" className="block text-sm font-bold">
                Google Tag Manager (ID do Contêiner)
              </label>
              <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full">
                GTM
              </span>
            </div>
            <input
              id="googleTagManagerId"
              value={googleTagManagerId}
              onChange={(e) => setGoogleTagManagerId(e.target.value)}
              placeholder="Ex: GTM-XXXXXXX"
              className={inputClass}
            />
            <p className="mt-2 text-xs text-muted-foreground">
              Opcional. Se preenchido, injeta o contêiner GTM e alimenta a camada de dados (<code className="text-foreground font-mono">dataLayer</code>).
            </p>
          </div>

          {/* Google Ads */}
          <div className="rounded-2xl border border-border/70 p-5 bg-secondary/20">
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="googleAdsId" className="block text-sm font-bold">
                Google Ads (ID de Conversão)
              </label>
              <span className="text-[10px] font-black uppercase tracking-wider bg-purple-500/10 text-purple-600 dark:text-purple-400 px-2 py-0.5 rounded-full">
                Google Ads
              </span>
            </div>
            <input
              id="googleAdsId"
              value={googleAdsId}
              onChange={(e) => setGoogleAdsId(e.target.value)}
              placeholder="Ex: AW-XXXXXXXXXX"
              className={inputClass}
            />
            <div className="mt-3">
              <label htmlFor="googleAdsConversionLabel" className="block text-xs font-bold text-muted-foreground mb-1">
                Rótulo de Conversão do Lead (Conversion Label)
              </label>
              <input
                id="googleAdsConversionLabel"
                value={googleAdsConversionLabel}
                onChange={(e) => setGoogleAdsConversionLabel(e.target.value)}
                placeholder="Ex: AbCdEfGhIjKlMnOpQrS"
                className={inputClass}
              />
            </div>
          </div>

          {/* Custom Head Scripts */}
          <div className="sm:col-span-2 rounded-2xl border border-border/70 p-5 bg-secondary/20">
            <label htmlFor="customHeadScripts" className="block text-sm font-bold mb-1">
              Scripts Personalizados adicionais no &lt;head&gt;
            </label>
            <p className="mb-3 text-xs text-muted-foreground">
              Insira tags completas (ex: <code className="font-mono text-foreground">&lt;script&gt;...&lt;/script&gt;</code>) de outras ferramentas como TikTok Pixel, Hotjar, Microsoft Clarity, etc.
            </p>
            <textarea
              id="customHeadScripts"
              rows={4}
              value={customHeadScripts}
              onChange={(e) => setCustomHeadScripts(e.target.value)}
              placeholder="<!-- Exemplo de script adicional -->&#10;<script>...</script>"
              className={`${inputClass} font-mono text-xs`}
            />
          </div>
        </div>

        <button
          type="button"
          onClick={() => void handleSave()}
          disabled={saving}
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand px-7 py-3.5 text-sm font-bold uppercase tracking-wider text-brand-foreground transition-all hover:bg-brand-dark hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60"
        >
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          Salvar Tags de Rastreamento
        </button>
      </div>
    </div>
  );
}

function UsersTab() {
  const queryClient = useQueryClient();
  const usersQuery = useQuery({ queryKey: ["admin-users"], queryFn: () => listAdminUsers() });
  const createUser = useServerFn(createAdminUser);
  const deleteUser = useServerFn(deleteAdminUser);
  const updatePassword = useServerFn(updateAdminUserPassword);

  // Estados de Criação
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [creating, setCreating] = useState(false);

  // Estados de Redefinição de Senha
  const [resetTarget, setResetTarget] = useState<{ id: string; email: string } | null>(null);
  const [resetPasswordValue, setResetPasswordValue] = useState("");
  const [resetting, setResetting] = useState(false);

  // Estado de Exclusão
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function generateRandomPassword() {
    const chars = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%&*";
    let pwd = "";
    for (let i = 0; i < 10; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPassword(pwd);
    setConfirmPassword(pwd);
    setShowPassword(true);
    toast.info("Senha segura gerada!");
  }

  async function handleCreateUser(e: React.FormEvent) {
    e.preventDefault();
    if (!newEmail.trim() || !newPassword) {
      toast.error("Preencha todos os campos obrigatórios.");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("A senha deve ter no mínimo 6 caracteres.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("As senhas informadas não coincidem.");
      return;
    }

    setCreating(true);
    try {
      await createUser({
        data: {
          email: newEmail.trim(),
          password: newPassword,
        },
      });
      await queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success(`Administrador ${newEmail} cadastrado com sucesso!`);
      setShowCreateModal(false);
      setNewEmail("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao cadastrar administrador.");
    } finally {
      setCreating(false);
    }
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    if (!resetTarget) return;
    if (resetPasswordValue.length < 6) {
      toast.error("A nova senha deve ter no mínimo 6 caracteres.");
      return;
    }

    setResetting(true);
    try {
      await updatePassword({
        data: {
          userId: resetTarget.id,
          password: resetPasswordValue,
        },
      });
      toast.success(`Senha do usuário ${resetTarget.email} atualizada com sucesso!`);
      setResetTarget(null);
      setResetPasswordValue("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao alterar a senha.");
    } finally {
      setResetting(false);
    }
  }

  async function handleDeleteUser(userId: string, email: string) {
    if (!window.confirm(`Tem certeza que deseja remover o acesso do administrador ${email}?`)) {
      return;
    }

    setDeletingId(userId);
    try {
      await deleteUser({ data: { userId } });
      await queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success(`Acesso de ${email} removido com sucesso.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao excluir administrador.");
    } finally {
      setDeletingId(null);
    }
  }

  const inputClass =
    "w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-brand/25";

  return (
    <div className="space-y-6">
      {/* Banner explicativo de Venda e Gestão da LP */}
      <div className="rounded-3xl border border-brand/30 bg-brand/5 p-6 dark:bg-brand/10 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 text-brand">
              <ShieldCheck className="h-6 w-6 shrink-0" />
              <h2 className="text-lg font-black tracking-tight text-foreground sm:text-xl">
                Controle de Acessos & Equipe da Empresa
              </h2>
            </div>
            <p className="mt-2 text-sm text-muted-foreground max-w-2xl">
              Cadastre aqui os e-mails da equipe da empresa para repassar o controle total da Landing Page.
              Todos os administradores listados terão acesso para editar imagens, textos, links, baixar leads e gerenciar pixels.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-brand px-6 py-3.5 text-sm font-bold uppercase tracking-wide text-brand-foreground shadow-md shadow-brand/25 transition-all hover:bg-brand-dark hover:scale-[1.02] active:scale-[0.98]"
          >
            <UserPlus className="h-4 w-4" />
            Novo Administrador
          </button>
        </div>
      </div>

      {/* Tabela de Administradores */}
      <div className="rounded-3xl border border-border bg-card overflow-hidden">
        <div className="p-6 border-b border-border/80 flex items-center justify-between">
          <div>
            <h3 className="text-base font-black">Administradores Ativos</h3>
            <p className="text-xs text-muted-foreground">Usuários com permissão para gerenciar a Landing Page</p>
          </div>
          <span className="rounded-full bg-secondary px-3 py-1 text-xs font-bold text-brand">
            {usersQuery.data?.length ?? 0} {usersQuery.data?.length === 1 ? "usuário" : "usuários"}
          </span>
        </div>

        {usersQuery.isPending ? (
          <p className="flex items-center gap-2 p-8 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Carregando administradores…
          </p>
        ) : usersQuery.isError ? (
          <div className="p-8 text-center text-sm text-destructive">
            Não foi possível carregar a lista de administradores.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b border-border bg-secondary/30 text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-6 py-3.5">E-mail do Administrador</th>
                  <th className="px-6 py-3.5">Cadastrado em</th>
                  <th className="px-6 py-3.5">Último Login</th>
                  <th className="px-6 py-3.5 text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {usersQuery.data.map((user) => (
                  <tr key={user.id} className="border-b border-border/70 last:border-0 hover:bg-secondary/15 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand/10 text-brand font-bold text-xs uppercase">
                          {user.email.slice(0, 2)}
                        </div>
                        <div>
                          <p className="font-bold text-foreground">{user.email}</p>
                          {user.isCurrentUser && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                              <UserCheck className="h-3 w-3" /> Sua Sessão Atual
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-muted-foreground">
                      {new Date(user.createdAt).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-6 py-4 text-xs text-muted-foreground">
                      {user.lastSignInAt
                        ? new Date(user.lastSignInAt).toLocaleDateString("pt-BR", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "Nunca acessou"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setResetTarget({ id: user.id, email: user.email });
                            setResetPasswordValue("");
                          }}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-bold text-muted-foreground transition-colors hover:border-brand hover:text-brand"
                        >
                          <Key className="h-3.5 w-3.5" />
                          Alterar Senha
                        </button>

                        {!user.isCurrentUser && (
                          <button
                            type="button"
                            disabled={deletingId === user.id}
                            onClick={() => void handleDeleteUser(user.id, user.email)}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-bold text-muted-foreground transition-colors hover:border-destructive hover:text-destructive disabled:opacity-50"
                          >
                            {deletingId === user.id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="h-3.5 w-3.5" />
                            )}
                            Excluir
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Cadastrar Novo Administrador */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl sm:p-8">
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <div className="flex items-center gap-2.5">
                <div className="grid h-10 w-10 place-items-center rounded-2xl bg-brand/10 text-brand">
                  <UserPlus className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-black text-lg">Novo Administrador</h3>
                  <p className="text-xs text-muted-foreground">Liberar acesso ao painel da LP</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-xs font-bold text-muted-foreground hover:text-foreground p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                  E-mail do Administrador
                </label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="exemplo@empresa.com.br"
                  className={inputClass}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Senha de Acesso
                  </label>
                  <button
                    type="button"
                    onClick={generateRandomPassword}
                    className="text-[11px] font-bold text-brand hover:underline"
                  >
                    Gerar Senha Segura
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className={`${inputClass} pr-10`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Confirmar Senha
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repita a senha"
                  className={inputClass}
                />
              </div>

              <div className="rounded-2xl border border-border/80 bg-secondary/30 p-3.5 text-xs text-muted-foreground">
                <p>
                  💡 <strong>Dica:</strong> Após criar o usuário, você pode enviar o e-mail e senha diretamente para a empresa. Eles poderão acessar o painel pela página <code className="font-mono text-foreground">/auth</code>.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-full border border-border px-5 py-2.5 text-xs font-bold uppercase tracking-wide hover:bg-secondary"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="inline-flex items-center gap-2 rounded-full bg-brand px-6 py-2.5 text-xs font-bold uppercase tracking-wide text-brand-foreground hover:bg-brand-dark disabled:opacity-60"
                >
                  {creating && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Criar Administrador
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Redefinir Senha */}
      {resetTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl sm:p-8">
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <div className="flex items-center gap-2.5">
                <div className="grid h-10 w-10 place-items-center rounded-2xl bg-brand/10 text-brand">
                  <KeyRound className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-black text-lg">Alterar Senha</h3>
                  <p className="text-xs text-muted-foreground truncate max-w-[200px]">{resetTarget.email}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setResetTarget(null)}
                className="text-xs font-bold text-muted-foreground hover:text-foreground p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleResetPassword} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Nova Senha
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={resetPasswordValue}
                  onChange={(e) => setResetPasswordValue(e.target.value)}
                  placeholder="Digite a nova senha (mín. 6 dígitos)"
                  className={inputClass}
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setResetTarget(null)}
                  className="rounded-full border border-border px-5 py-2.5 text-xs font-bold uppercase tracking-wide hover:bg-secondary"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={resetting}
                  className="inline-flex items-center gap-2 rounded-full bg-brand px-6 py-2.5 text-xs font-bold uppercase tracking-wide text-brand-foreground hover:bg-brand-dark disabled:opacity-60"
                >
                  {resetting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Atualizar Senha
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
