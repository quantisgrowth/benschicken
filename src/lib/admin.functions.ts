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

export const uploadAdminFile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        key: z.string().min(1).max(64),
        fileName: z.string().min(1).max(255),
        fileBase64: z.string().min(1),
        contentType: z.string().min(1).max(100),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

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
      updated_by: context.userId,
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
