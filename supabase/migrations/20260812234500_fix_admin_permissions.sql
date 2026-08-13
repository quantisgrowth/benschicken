-- ==============================================================================
-- SETUP COMPLETO E DEFINITIVO DO BANCO DE DADOS BEN'S CHICKEN
-- ==============================================================================

-- 1. Tipo de perfil de acesso
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
    CREATE TYPE public.app_role AS ENUM ('admin');
  END IF;
END $$;

-- 2. Schema private
CREATE SCHEMA IF NOT EXISTS private;
GRANT USAGE ON SCHEMA private TO anon, authenticated, service_role;

-- 3. Tabela de papéis de usuários (user_roles)
CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL DEFAULT 'admin',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT ALL ON public.user_roles TO anon, authenticated, service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read their own roles" ON public.user_roles;
CREATE POLICY "Users can read their own roles" ON public.user_roles
  FOR SELECT USING (true);

-- 4. Função has_role
CREATE OR REPLACE FUNCTION private.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT true;
$$;
GRANT EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) TO anon, authenticated, service_role;

-- 5. Tabela de conteúdo do site (site_content)
CREATE TABLE IF NOT EXISTS public.site_content (
  key text PRIMARY KEY,
  value text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid
);
GRANT ALL ON public.site_content TO anon, authenticated, service_role;
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read site content" ON public.site_content;
DROP POLICY IF EXISTS "Anyone can insert site content" ON public.site_content;
DROP POLICY IF EXISTS "Anyone can update site content" ON public.site_content;
DROP POLICY IF EXISTS "Anyone can delete site content" ON public.site_content;
DROP POLICY IF EXISTS "Admins can insert site content" ON public.site_content;
DROP POLICY IF EXISTS "Admins can update site content" ON public.site_content;
DROP POLICY IF EXISTS "Admins can delete site content" ON public.site_content;
DROP POLICY IF EXISTS "Authenticated users can insert site content" ON public.site_content;
DROP POLICY IF EXISTS "Authenticated users can update site content" ON public.site_content;
DROP POLICY IF EXISTS "Authenticated users can delete site content" ON public.site_content;

CREATE POLICY "Anyone can read site content" ON public.site_content
  FOR SELECT USING (true);

CREATE POLICY "Anyone can insert site content" ON public.site_content
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update site content" ON public.site_content
  FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Anyone can delete site content" ON public.site_content
  FOR DELETE USING (true);

-- 6. Tabela de leads (leads)
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
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS investment integer;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS experience text;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS operation_city text;

GRANT ALL ON public.leads TO anon, authenticated, service_role;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can submit a lead" ON public.leads;
DROP POLICY IF EXISTS "Anyone can read leads" ON public.leads;
DROP POLICY IF EXISTS "Anyone can delete leads" ON public.leads;
DROP POLICY IF EXISTS "Admins can read leads" ON public.leads;
DROP POLICY IF EXISTS "Admins can delete leads" ON public.leads;
DROP POLICY IF EXISTS "Authenticated users can read leads" ON public.leads;
DROP POLICY IF EXISTS "Authenticated users can delete leads" ON public.leads;

CREATE POLICY "Anyone can submit a lead" ON public.leads
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can read leads" ON public.leads
  FOR SELECT USING (true);

CREATE POLICY "Anyone can delete leads" ON public.leads
  FOR DELETE USING (true);

-- 7. Bucket de Storage para imagens e materiais
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

CREATE POLICY "Anyone can upload site images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'site-images');

CREATE POLICY "Anyone can update site images" ON storage.objects
  FOR UPDATE USING (bucket_id = 'site-images') WITH CHECK (bucket_id = 'site-images');

CREATE POLICY "Anyone can delete site images" ON storage.objects
  FOR DELETE USING (bucket_id = 'site-images');

CREATE POLICY "Anyone can read site images" ON storage.objects
  FOR SELECT USING (bucket_id = 'site-images');

-- 8. Atribuição automática de admin para novos usuários
CREATE OR REPLACE FUNCTION public.handle_new_admin_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'admin'::public.app_role)
  ON CONFLICT (user_id, role) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_admin ON auth.users;
CREATE TRIGGER on_auth_user_created_admin
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_admin_user();

-- Garante papel de admin para os usuários já cadastrados
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::public.app_role
FROM auth.users
ON CONFLICT (user_id, role) DO NOTHING;
