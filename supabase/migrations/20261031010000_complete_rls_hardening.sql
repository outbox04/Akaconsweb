-- Complete RLS coverage for application tables. This is additive and does not
-- delete business data. Apply after 20261031000000_security_hardening.sql.

CREATE OR REPLACE FUNCTION public.current_organization_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, auth
AS $$ SELECT organization_id FROM public.profiles WHERE id = auth.uid() $$;

REVOKE ALL ON FUNCTION public.current_organization_id() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.current_organization_id() TO authenticated;

CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, auth
AS $$ SELECT public.has_any_role(ARRAY['super_admin','admin','manager','technician','sale']) $$;

REVOKE ALL ON FUNCTION public.is_staff() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_staff() TO authenticated;

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.image_annotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.effect_systems ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.colors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_book_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.render_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.render_outputs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.estimates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_provider_configs ENABLE ROW LEVEL SECURITY;

-- Organization members may access only rows belonging to their organization.
DROP POLICY IF EXISTS "Members read organization" ON public.organizations;
CREATE POLICY "Members read organization" ON public.organizations FOR SELECT TO authenticated USING (id = public.current_organization_id());

DROP POLICY IF EXISTS "Members manage customers" ON public.customers;
CREATE POLICY "Members manage customers" ON public.customers FOR ALL TO authenticated
  USING (organization_id = public.current_organization_id() AND public.is_staff()) WITH CHECK (organization_id = public.current_organization_id() AND public.is_staff());
DROP POLICY IF EXISTS "Members manage projects" ON public.projects;
CREATE POLICY "Members manage projects" ON public.projects FOR ALL TO authenticated
  USING (organization_id = public.current_organization_id() AND public.is_staff()) WITH CHECK (organization_id = public.current_organization_id() AND public.is_staff());
DROP POLICY IF EXISTS "Members manage project images" ON public.project_images;
CREATE POLICY "Members manage project images" ON public.project_images FOR ALL TO authenticated
  USING (organization_id = public.current_organization_id() AND public.is_staff()) WITH CHECK (organization_id = public.current_organization_id() AND public.is_staff());
DROP POLICY IF EXISTS "Members manage render jobs" ON public.render_jobs;
CREATE POLICY "Members manage render jobs" ON public.render_jobs FOR ALL TO authenticated
  USING (organization_id = public.current_organization_id() AND public.is_staff()) WITH CHECK (organization_id = public.current_organization_id() AND public.is_staff());
DROP POLICY IF EXISTS "Members manage estimates" ON public.estimates;
CREATE POLICY "Members manage estimates" ON public.estimates FOR ALL TO authenticated
  USING (organization_id = public.current_organization_id() AND public.is_staff()) WITH CHECK (organization_id = public.current_organization_id() AND public.is_staff());
DROP POLICY IF EXISTS "Members manage quotes" ON public.quotes;
CREATE POLICY "Members manage quotes" ON public.quotes FOR ALL TO authenticated
  USING (organization_id = public.current_organization_id() AND public.is_staff()) WITH CHECK (organization_id = public.current_organization_id() AND public.is_staff());

-- Child records inherit tenant isolation through their parent records.
DROP POLICY IF EXISTS "Members manage image annotations" ON public.image_annotations;
CREATE POLICY "Members manage image annotations" ON public.image_annotations FOR ALL TO authenticated
  USING (public.is_staff() AND EXISTS (SELECT 1 FROM public.project_images i WHERE i.id = project_image_id AND i.organization_id = public.current_organization_id()))
  WITH CHECK (public.is_staff() AND EXISTS (SELECT 1 FROM public.project_images i WHERE i.id = project_image_id AND i.organization_id = public.current_organization_id()));
DROP POLICY IF EXISTS "Members manage render outputs" ON public.render_outputs;
CREATE POLICY "Members manage render outputs" ON public.render_outputs FOR ALL TO authenticated
  USING (public.is_staff() AND EXISTS (SELECT 1 FROM public.render_jobs j WHERE j.id = render_job_id AND j.organization_id = public.current_organization_id()))
  WITH CHECK (public.is_staff() AND EXISTS (SELECT 1 FROM public.render_jobs j WHERE j.id = render_job_id AND j.organization_id = public.current_organization_id()));
DROP POLICY IF EXISTS "Members manage price book items" ON public.price_book_items;
CREATE POLICY "Members manage price book items" ON public.price_book_items FOR ALL TO authenticated
  USING (public.has_any_role(ARRAY['super_admin','admin','manager']) AND EXISTS (SELECT 1 FROM public.price_books p WHERE p.id = price_book_id AND p.organization_id = public.current_organization_id()))
  WITH CHECK (public.has_any_role(ARRAY['super_admin','admin','manager']) AND EXISTS (SELECT 1 FROM public.price_books p WHERE p.id = price_book_id AND p.organization_id = public.current_organization_id()));
DROP POLICY IF EXISTS "Members manage quote versions" ON public.quote_versions;
CREATE POLICY "Members manage quote versions" ON public.quote_versions FOR ALL TO authenticated
  USING (public.is_staff() AND EXISTS (SELECT 1 FROM public.quotes q WHERE q.id = quote_id AND q.organization_id = public.current_organization_id()))
  WITH CHECK (public.is_staff() AND EXISTS (SELECT 1 FROM public.quotes q WHERE q.id = quote_id AND q.organization_id = public.current_organization_id()));

-- Catalogue lookup remains public; mutation and sensitive operational data are admin-only.
DROP POLICY IF EXISTS "Public reads effect systems" ON public.effect_systems;
CREATE POLICY "Public reads effect systems" ON public.effect_systems FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public reads colors" ON public.colors;
CREATE POLICY "Public reads colors" ON public.colors FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public reads products" ON public.products;
CREATE POLICY "Public reads products" ON public.products FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admins manage effect systems" ON public.effect_systems;
CREATE POLICY "Admins manage effect systems" ON public.effect_systems FOR ALL TO authenticated USING (public.has_any_role(ARRAY['super_admin','admin','manager'])) WITH CHECK (public.has_any_role(ARRAY['super_admin','admin','manager']));
DROP POLICY IF EXISTS "Admins manage colors" ON public.colors;
CREATE POLICY "Admins manage colors" ON public.colors FOR ALL TO authenticated USING (public.has_any_role(ARRAY['super_admin','admin','manager'])) WITH CHECK (public.has_any_role(ARRAY['super_admin','admin','manager']));
DROP POLICY IF EXISTS "Admins manage products" ON public.products;
CREATE POLICY "Admins manage products" ON public.products FOR ALL TO authenticated USING (public.has_any_role(ARRAY['super_admin','admin','manager'])) WITH CHECK (public.has_any_role(ARRAY['super_admin','admin','manager']));
DROP POLICY IF EXISTS "Members manage price books" ON public.price_books;
CREATE POLICY "Members manage price books" ON public.price_books FOR ALL TO authenticated USING (organization_id = public.current_organization_id() AND public.has_any_role(ARRAY['super_admin','admin','manager'])) WITH CHECK (organization_id = public.current_organization_id() AND public.has_any_role(ARRAY['super_admin','admin','manager']));
DROP POLICY IF EXISTS "Admins read audit logs" ON public.audit_logs;
CREATE POLICY "Admins read audit logs" ON public.audit_logs FOR SELECT TO authenticated USING (organization_id = public.current_organization_id() AND public.has_any_role(ARRAY['super_admin','admin','manager']));
DROP POLICY IF EXISTS "Admins manage AI configuration" ON public.ai_provider_configs;
CREATE POLICY "Admins manage AI configuration" ON public.ai_provider_configs FOR ALL TO authenticated USING (organization_id = public.current_organization_id() AND public.has_any_role(ARRAY['super_admin','admin'])) WITH CHECK (organization_id = public.current_organization_id() AND public.has_any_role(ARRAY['super_admin','admin']));
