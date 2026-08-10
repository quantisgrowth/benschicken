import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { ArrowLeft, CheckCircle2, Drumstick, Eye, EyeOff, KeyRound, Loader2, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const title = "Área do Administrador | Ben's Chicken";
const description = "Acesso restrito à equipe Ben's Chicken para gerenciar o conteúdo do site.";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

type AuthMode = "login" | "signup" | "forgot" | "reset";

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Escuta eventos de autenticação, especialmente recuperação de senha
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY") {
        setMode("reset");
        setError(null);
        setMessage("Digite sua nova senha abaixo para redefinir.");
      } else if (event === "SIGNED_IN" && mode !== "reset") {
        if (session) void navigate({ to: "/admin", replace: true });
      }
    });

    // Verifica parâmetro de URL ou hash
    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);
      const urlMode = searchParams.get("mode");
      if (urlMode === "reset" || window.location.hash.includes("type=recovery")) {
        setMode("reset");
      } else {
        void supabase.auth.getSession().then(({ data }) => {
          if (data.session && mode !== "reset") {
            void navigate({ to: "/admin", replace: true });
          }
        });
      }
    }

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, mode]);

  async function handleSubmit(ev: FormEvent) {
    ev.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      if (mode === "login") {
        const { error: err } = await supabase.auth.signInWithPassword({ email, password });
        if (err) throw err;
        await navigate({ to: "/admin", replace: true });
      } else if (mode === "signup") {
        const { data, error: err } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/admin` },
        });
        if (err) throw err;
        if (data.session) {
          await navigate({ to: "/admin", replace: true });
        } else {
          setMessage("Conta criada com sucesso! Verifique seu e-mail para confirmar seu cadastro.");
        }
      } else if (mode === "forgot") {
        const redirectUrl = `${window.location.origin}/auth?mode=reset`;
        const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: redirectUrl,
        });
        if (err) throw err;
        setMessage(
          "Enviamos um link de recuperação para o seu e-mail. Acesse sua caixa de entrada e clique no link para definir a nova senha.",
        );
      } else if (mode === "reset") {
        if (password !== confirmPassword) {
          throw new Error("As senhas não coincidem. Digite a mesma senha em ambos os campos.");
        }
        if (password.length < 6) {
          throw new Error("A senha precisa ter pelo menos 6 caracteres.");
        }

        const { error: err } = await supabase.auth.updateUser({ password });
        if (err) throw err;

        setMessage("Senha redefinida com sucesso! Redirecionando para o painel...");
        setTimeout(() => {
          void navigate({ to: "/admin", replace: true });
        }, 1500);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ocorreu um erro. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-brand/25";

  return (
    <main className="flex min-h-screen items-center justify-center bg-secondary/60 px-4 py-16">
      <div className="w-full max-w-md rounded-[2rem] border border-border bg-card p-8 shadow-xl">
        <div className="flex items-center gap-2">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-brand text-brand-foreground">
            <Drumstick className="h-5 w-5" />
          </span>
          <span className="text-lg font-extrabold tracking-tight">
            Ben&apos;s <span className="text-brand">Chicken</span>
          </span>
        </div>

        <h1 className="mt-6 text-2xl font-black tracking-tight">
          {mode === "login" && "Entrar no painel"}
          {mode === "signup" && "Criar conta"}
          {mode === "forgot" && "Recuperar senha"}
          {mode === "reset" && "Definir nova senha"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {mode === "forgot"
            ? "Informe seu e-mail para enviarmos um link seguro de redefinição de senha."
            : mode === "reset"
              ? "Crie uma nova senha de acesso para sua conta de administrador."
              : "Área restrita para gerenciar imagens, textos e leads do site."}
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {mode !== "reset" && (
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-bold">
                E-mail
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seuemail@exemplo.com"
                className={inputClass}
              />
            </div>
          )}

          {mode !== "forgot" && (
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label htmlFor="password" className="text-sm font-bold">
                  {mode === "reset" ? "Nova Senha" : "Senha"}
                </label>
                {mode === "login" && (
                  <button
                    type="button"
                    onClick={() => {
                      setMode("forgot");
                      setError(null);
                      setMessage(null);
                    }}
                    className="text-xs font-semibold text-brand transition-colors hover:underline"
                  >
                    Esqueceu a senha?
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className={`${inputClass} pr-12`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  aria-pressed={showPassword}
                  className="absolute inset-y-0 right-0 grid w-12 place-items-center rounded-r-2xl text-muted-foreground transition-colors hover:text-brand"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          )}

          {mode === "reset" && (
            <div>
              <label htmlFor="confirmPassword" className="mb-2 block text-sm font-bold">
                Confirme a Nova Senha
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  minLength={6}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repita a nova senha"
                  className={`${inputClass} pr-12`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  aria-label={showConfirmPassword ? "Ocultar senha" : "Mostrar senha"}
                  aria-pressed={showConfirmPassword}
                  className="absolute inset-y-0 right-0 grid w-12 place-items-center rounded-r-2xl text-muted-foreground transition-colors hover:text-brand"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {message && (
            <div className="flex items-start gap-2 rounded-xl border border-brand/20 bg-brand/10 p-3 text-sm text-brand">
              <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />
              <span>{message}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand px-6 py-3.5 text-sm font-bold uppercase tracking-wide text-brand-foreground transition-colors hover:bg-brand-dark disabled:opacity-60"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {mode === "login" && "Entrar"}
            {mode === "signup" && "Criar conta"}
            {mode === "forgot" && "Enviar link de recuperação"}
            {mode === "reset" && "Salvar nova senha"}
          </button>
        </form>

        {mode === "forgot" || mode === "reset" ? (
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setError(null);
              setMessage(null);
            }}
            className="mt-5 flex w-full items-center justify-center gap-1.5 text-center text-sm font-semibold text-muted-foreground transition-colors hover:text-brand"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para o login
          </button>
        ) : (
          <button
            type="button"
            onClick={() => {
              setMode(mode === "login" ? "signup" : "login");
              setError(null);
              setMessage(null);
            }}
            className="mt-5 w-full text-center text-sm font-semibold text-muted-foreground transition-colors hover:text-brand"
          >
            {mode === "login" ? "Não tenho conta ainda" : "Já tenho uma conta"}
          </button>
        )}
      </div>
    </main>
  );
}
