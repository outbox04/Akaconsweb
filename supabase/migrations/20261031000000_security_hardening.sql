-- Security hardening for the existing CRM/CMS schema. Apply through Supabase
-- migrations; this file does not delete or rewrite existing business data.

CREATE OR REPLACE FUNCTION public.has_any_role(allowed_roles text[])
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, auth
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE profile_id = auth.uid() AND role_name = ANY(allowed_roles)
  );
$$;

REVOKE ALL ON FUNCTION public.has_any_role(text[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_any_role(text[]) TO authenticated;

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read their own profile" ON public.profiles;
CREATE POLICY "Users can read their own profile" ON public.profiles
  FOR SELECT TO authenticated USING (id = auth.uid());

DROP POLICY IF EXISTS "Users can read their own roles" ON public.user_roles;
CREATE POLICY "Users can read their own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (profile_id = auth.uid());

DROP POLICY IF EXISTS "Admins manage material categories" ON public.material_catalog_nodes;
CREATE POLICY "Admins manage material categories" ON public.material_catalog_nodes
  FOR ALL TO authenticated USING (public.has_any_role(ARRAY['super_admin','admin','manager']))
  WITH CHECK (public.has_any_role(ARRAY['super_admin','admin','manager']));

DROP POLICY IF EXISTS "Admins manage materials" ON public.material_products;
CREATE POLICY "Admins manage materials" ON public.material_products
  FOR ALL TO authenticated USING (public.has_any_role(ARRAY['super_admin','admin','manager']))
  WITH CHECK (public.has_any_role(ARRAY['super_admin','admin','manager']));

DROP POLICY IF EXISTS "Admins manage material colors" ON public.material_product_colors;
CREATE POLICY "Admins manage material colors" ON public.material_product_colors
  FOR ALL TO authenticated USING (public.has_any_role(ARRAY['super_admin','admin','manager']))
  WITH CHECK (public.has_any_role(ARRAY['super_admin','admin','manager']));

DROP POLICY IF EXISTS "Authenticated manages material categories" ON public.material_catalog_nodes;
DROP POLICY IF EXISTS "Authenticated manages materials" ON public.material_products;
DROP POLICY IF EXISTS "Authenticated manages material colors" ON public.material_product_colors;

DROP POLICY IF EXISTS "Authenticated uploads material assets" ON storage.objects;
CREATE POLICY "Admins upload material assets" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (
    bucket_id = 'material-assets' AND public.has_any_role(ARRAY['super_admin','admin','manager'])
  );
DROP POLICY IF EXISTS "Authenticated updates material assets" ON storage.objects;
CREATE POLICY "Admins update material assets" ON storage.objects
  FOR UPDATE TO authenticated USING (
    bucket_id = 'material-assets' AND public.has_any_role(ARRAY['super_admin','admin','manager'])
  ) WITH CHECK (
    bucket_id = 'material-assets' AND public.has_any_role(ARRAY['super_admin','admin','manager'])
  );
DROP POLICY IF EXISTS "Authenticated deletes material assets" ON storage.objects;
CREATE POLICY "Admins delete material assets" ON storage.objects
  FOR DELETE TO authenticated USING (
    bucket_id = 'material-assets' AND public.has_any_role(ARRAY['super_admin','admin','manager'])
  );
