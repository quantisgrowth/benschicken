-- ==============================================================================
-- DESATIVAÇÃO DE RLS E LIBERAÇÃO TOTAL DAS TABELAS DO SITE
-- ==============================================================================

-- 1. Garante a existência das tabelas
CREATE TABLE IF NOT EXISTS public.site_content (
  key text PRIMARY KEY,
  value text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid
);

CREATE TABLE IF NOT EXISTS public.leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  city text NOT NULL,
  uf text NOT NULL,
  interest text NOT NULL,
  investment integer,
  experience text,
  operation_city text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 2. Desativação do Row Level Security para evitar qualquer bloqueio
ALTER TABLE public.site_content DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads DISABLE ROW LEVEL SECURITY;

-- 3. Concessão de permissões completas
GRANT ALL ON public.site_content TO anon, authenticated, service_role;
GRANT ALL ON public.leads TO anon, authenticated, service_role;

-- 4. Storage para imagens e materiais
INSERT INTO storage.buckets (id, name, public)
VALUES ('site-images', 'site-images', true)
ON CONFLICT (id) DO NOTHING;

DO $$
DECLARE p record;
BEGIN
  FOR p IN SELECT policyname FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname LIKE '%site images%'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', p.policyname);
  END LOOP;
END $$;

CREATE POLICY "Allow all on site images" ON storage.objects
  FOR ALL
  TO public
  USING (bucket_id = 'site-images')
  WITH CHECK (bucket_id = 'site-images');
