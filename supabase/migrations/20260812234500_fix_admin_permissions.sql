-- Migration to ensure all authenticated admin users have full permissions on site_content, leads, and storage
CREATE SCHEMA IF NOT EXISTS private;
GRANT USAGE ON SCHEMA private TO authenticated, service_role;

-- 1. Auto-assign admin role on user signup/creation in auth.users
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

-- Insert admin role for all existing users in auth.users
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::public.app_role
FROM auth.users
ON CONFLICT (user_id, role) DO NOTHING;

-- 2. Update policies on site_content to allow all authenticated users to read, insert, update and delete
DROP POLICY IF EXISTS "Admins can insert site content" ON public.site_content;
DROP POLICY IF EXISTS "Admins can update site content" ON public.site_content;
DROP POLICY IF EXISTS "Admins can delete site content" ON public.site_content;
DROP POLICY IF EXISTS "Authenticated users can insert site content" ON public.site_content;
DROP POLICY IF EXISTS "Authenticated users can update site content" ON public.site_content;
DROP POLICY IF EXISTS "Authenticated users can delete site content" ON public.site_content;

CREATE POLICY "Authenticated users can insert site content" ON public.site_content
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update site content" ON public.site_content
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can delete site content" ON public.site_content
  FOR DELETE TO authenticated USING (true);

-- 3. Update policies on leads
DROP POLICY IF EXISTS "Admins can delete leads" ON public.leads;
DROP POLICY IF EXISTS "Admins can read leads" ON public.leads;
DROP POLICY IF EXISTS "Authenticated users can read leads" ON public.leads;
DROP POLICY IF EXISTS "Authenticated users can delete leads" ON public.leads;

CREATE POLICY "Authenticated users can read leads" ON public.leads
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete leads" ON public.leads
  FOR DELETE TO authenticated USING (true);

-- 4. Update policies on storage.objects for site-images bucket
DO $$
DECLARE p record;
BEGIN
  FOR p IN SELECT policyname FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname LIKE '%site images%'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', p.policyname);
  END LOOP;
END $$;

CREATE POLICY "Authenticated users can upload site images" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'site-images');

CREATE POLICY "Authenticated users can update site images" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'site-images') WITH CHECK (bucket_id = 'site-images');

CREATE POLICY "Authenticated users can delete site images" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'site-images');

CREATE POLICY "Anyone can read site images" ON storage.objects
  FOR SELECT USING (bucket_id = 'site-images');
