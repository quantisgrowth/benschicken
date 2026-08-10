import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
  DEFAULT_IMAGES,
  DEFAULT_TEXTS,
  IMAGE_KEYS,
  TEXT_KEYS,
  type ImageKey,
  type SiteContent,
  type SiteImages,
  type SiteTexts,
  type TextKey,
} from "./site-content";

const SIGNED_URL_TTL = 60 * 60 * 24 * 7;

function serverPublicClient() {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  const url = process.env["SUPABASE_URL"]!;
  // Imported lazily so this never enters the client bundle.
  return import("@supabase/supabase-js").then(({ createClient }) =>
    createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: {
        fetch: (input: RequestInfo | URL, init?: RequestInit) => {
          const h = new Headers(init?.headers);
          if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) {
            h.delete("Authorization");
          }
          h.set("apikey", key);
          return fetch(input, { ...init, headers: h });
        },
      },
    }),
  );
}

export const getSiteContent = createServerFn({ method: "GET" }).handler(
  async (): Promise<SiteContent> => {
    const texts = { ...DEFAULT_TEXTS };
    const images: SiteImages = { ...DEFAULT_IMAGES };

    const supabase = await serverPublicClient();
    const { data, error } = await supabase.from("site_content").select("key, value");
    if (error || !data) return { texts, images };

    const paths: Partial<Record<ImageKey, string>> = {};
    for (const row of data as { key: string; value: string }[]) {
      if ((TEXT_KEYS as string[]).includes(row.key) && row.value) {
        texts[row.key as TextKey] = row.value;
      } else if ((IMAGE_KEYS as string[]).includes(row.key) && row.value) {
        paths[row.key as ImageKey] = row.value;
      }
    }

    const entries = Object.entries(paths) as [ImageKey, string][];
    if (entries.length > 0) {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { data: signed } = await supabaseAdmin.storage
        .from("site-images")
        .createSignedUrls(
          entries.map(([, p]) => p),
          SIGNED_URL_TTL,
        );
      signed?.forEach((s, i) => {
        const entry = entries[i];
        if (entry && s.signedUrl) images[entry[0]] = s.signedUrl;
      });
    }

    return { texts, images };
  },
);

const leadSchema = z.object({
  name: z.string().trim().min(3).max(120),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().min(10).max(20),
  city: z.string().trim().min(2).max(120),
  uf: z.string().trim().length(2),
  interest: z.enum(["licenciamento", "franquia", "ambos"]),
  investment: z.number().int().min(10000).max(500000),
  experience: z.enum(["sim", "nao"]),
  operationCity: z.string().trim().min(2).max(160).optional(),
});

export const submitLead = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => leadSchema.parse(input))
  .handler(async ({ data }) => {
    const supabase = await serverPublicClient();
    const { operationCity, ...rest } = data;
    const { error } = await supabase
      .from("leads")
      .insert({ ...rest, operation_city: operationCity ?? null });
    if (error) throw new Error("Não foi possível enviar seus dados. Tente novamente.");
    return { ok: true as const };
  });

