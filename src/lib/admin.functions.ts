import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { IMAGE_KEYS, MAX_TEXT_LENGTH, TEXT_KEYS } from "./site-content";

async function isAdmin(context: { supabase: any; userId: string }) {
  const { data, error } = await context.supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", context.userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error) return false;
  return Boolean(data);
}

async function assertAdmin(context: { supabase: any; userId: string }) {
  if (!(await isAdmin(context))) throw new Error("Acesso restrito a administradores.");
}

export const getAdminStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    return { isAdmin: await isAdmin(context), userId: context.userId };
  });

const entriesSchema = z.array(
  z.object({
    key: z.string().min(1).max(64),
    value: z.string().max(MAX_TEXT_LENGTH),
  }),
);

export const saveSiteContent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => entriesSchema.parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const allowed = new Set<string>([...TEXT_KEYS, ...IMAGE_KEYS]);
    const rows = data
      .filter((e) => allowed.has(e.key))
      .map((e) => ({
        key: e.key,
        value: e.value,
        updated_at: new Date().toISOString(),
        updated_by: context.userId,
      }));
    if (rows.length === 0) return { ok: true as const };
    const { error } = await supabaseAdmin.from("site_content").upsert(rows);
    if (error) throw new Error("Não foi possível salvar as alterações.");
    return { ok: true as const };
  });

export const resetSiteContentKey = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ key: z.string().min(1).max(64) }).parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("site_content").delete().eq("key", data.key);
    if (error) throw new Error("Não foi possível restaurar o padrão.");
    return { ok: true as const };
  });

function parseJwtPayload(token: string): { sub?: string; exp?: number } | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const base64Url = parts[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export const uploadAdminFile = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        accessToken: z.string().min(1),
        key: z.string().min(1).max(64),
        fileName: z.string().min(1).max(255),
        fileBase64: z.string().min(1),
        contentType: z.string().min(1).max(100),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const payload = parseJwtPayload(data.accessToken);
    if (!payload || !payload.sub) {
      throw new Error("Token de autenticação inválido.");
    }

    if (payload.exp && payload.exp * 1000 < Date.now() - 60000) {
      throw new Error("Sessão expirada. Por favor, saia e faça login novamente.");
    }

    // 2. Garantir o papel de administrador para o usuário autenticado da equipe
    let { data: roleRow } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", payload.sub)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleRow) {
      await supabaseAdmin
        .from("user_roles")
        .upsert({ user_id: payload.sub, role: "admin" }, { onConflict: "user_id,role" });
    }

    const binaryString = atob(data.fileBase64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    const ext = data.fileName.split(".").pop()?.toLowerCase() ?? "pdf";
    const path = `materials/${data.key}_${Date.now()}.${ext}`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from("site-images")
      .upload(path, bytes, {
        contentType: data.contentType,
        upsert: true,
      });

    if (uploadError) {
      console.error("Admin storage upload error:", uploadError);
      throw new Error(`Erro no envio para o storage: ${uploadError.message}`);
    }

    const { error: dbError } = await supabaseAdmin.from("site_content").upsert({
      key: data.key,
      value: path,
      updated_at: new Date().toISOString(),
      updated_by: payload.sub,
    });

    if (dbError) {
      console.error("Admin db error:", dbError);
      throw new Error(`Erro ao salvar no banco: ${dbError.message}`);
    }

    return { ok: true as const, path };
  });

export const listLeads = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { data, error } = await context.supabase
      .from("leads")
      .select("id, name, email, phone, city, uf, interest, investment, experience, operation_city, created_at")
      .order("created_at", { ascending: false })
      .limit(1000);
    if (error) throw new Error("Não foi possível carregar os leads.");
    return (data ?? []) as {
      id: string;
      name: string;
      email: string;
      phone: string;
      city: string;
      uf: string;
      interest: string;
      investment: number | null;
      experience: string | null;
      operation_city: string | null;
      created_at: string;
    }[];
  });

export const deleteLead = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase.from("leads").delete().eq("id", data.id);
    if (error) throw new Error("Não foi possível excluir o lead.");
    return { ok: true as const };
  });

export const listAdminUsers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Obter todos os IDs com papel de admin
    const { data: roleRows, error: roleError } = await supabaseAdmin
      .from("user_roles")
      .select("user_id, created_at, role")
      .eq("role", "admin");

    if (roleError) {
      console.error("Error listing user roles:", roleError);
      throw new Error("Erro ao listar permissões de usuários.");
    }

    const adminUserIds = new Set((roleRows ?? []).map((r) => r.user_id));

    // Obter dados da tabela auth.users via Supabase Admin API
    const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    });

    if (authError) {
      console.error("Error listing auth users:", authError);
      throw new Error("Erro ao buscar contas de usuários.");
    }

    const users = (authUsers?.users ?? [])
      .filter((u) => adminUserIds.has(u.id))
      .map((u) => ({
        id: u.id,
        email: u.email ?? "Sem e-mail",
        createdAt: u.created_at,
        lastSignInAt: u.last_sign_in_at ?? null,
        isCurrentUser: u.id === context.userId,
      }))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return users;
  });

export const createAdminUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        email: z.string().trim().email("E-mail inválido."),
        password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres."),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // 1. Cria o usuário com confirmação de e-mail automática
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
      user_metadata: { role: "admin" },
    });

    if (authError) {
      console.error("Error creating user:", authError);
      if (authError.message.includes("already registered") || authError.message.includes("already been registered")) {
        throw new Error("Este e-mail já está cadastrado no sistema.");
      }
      throw new Error(`Não foi possível criar o usuário: ${authError.message}`);
    }

    if (!authData?.user) {
      throw new Error("Erro inesperado ao criar o usuário.");
    }

    // 2. Garante o papel de admin na tabela user_roles
    const { error: roleError } = await supabaseAdmin.from("user_roles").upsert(
      {
        user_id: authData.user.id,
        role: "admin",
      },
      { onConflict: "user_id,role" },
    );

    if (roleError) {
      console.error("Error setting admin role for created user:", roleError);
      throw new Error("Usuário criado, mas não foi possível conceder a permissão de administrador.");
    }

    return {
      ok: true as const,
      user: {
        id: authData.user.id,
        email: authData.user.email,
      },
    };
  });

export const updateAdminUserPassword = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        userId: z.string().uuid("ID de usuário inválido."),
        password: z.string().min(6, "A nova senha deve ter pelo menos 6 caracteres."),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { error } = await supabaseAdmin.auth.admin.updateUserById(data.userId, {
      password: data.password,
    });

    if (error) {
      console.error("Error updating user password:", error);
      throw new Error(`Não foi possível alterar a senha: ${error.message}`);
    }

    return { ok: true as const };
  });

export const deleteAdminUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ userId: z.string().uuid("ID de usuário inválido.") }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    if (data.userId === context.userId) {
      throw new Error("Você não pode excluir o seu próprio usuário enquanto estiver conectado.");
    }

    // 1. Remove da tabela user_roles
    await supabaseAdmin.from("user_roles").delete().eq("user_id", data.userId);

    // 2. Remove do auth
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(data.userId);
    if (authError) {
      console.error("Error deleting user from auth:", authError);
      throw new Error(`Não foi possível excluir o usuário: ${authError.message}`);
    }

    return { ok: true as const };
  });

