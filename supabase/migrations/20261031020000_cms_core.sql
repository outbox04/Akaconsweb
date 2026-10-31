-- CMS core: categories, posts and immutable content versions.
-- This migration is additive and does not modify existing website content.

ALTER TABLE public.user_roles DROP CONSTRAINT IF EXISTS user_roles_role_name_check;
ALTER TABLE public.user_roles ADD CONSTRAINT user_roles_role_name_check CHECK (
  role_name IN ('super_admin','admin','manager','technician','sale','customer','marketing_manager','content_editor','lead_manager','viewer')
);

CREATE TABLE IF NOT EXISTS public.cms_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.cms_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT NOT NULL DEFAULT '',
  content JSONB NOT NULL DEFAULT '{"blocks":[]}'::jsonb,
  featured_image_url TEXT,
  featured_image_alt TEXT,
  category_id UUID REFERENCES public.cms_categories(id) ON DELETE SET NULL,
  tags TEXT[] NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','in_review','approved','scheduled','published','archived')),
  scheduled_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  editor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  seo_title TEXT,
  meta_description TEXT,
  canonical_url TEXT,
  og_title TEXT,
  og_description TEXT,
  og_image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT cms_posts_scheduled_at_required CHECK (status <> 'scheduled' OR scheduled_at IS NOT NULL)
);

CREATE TABLE IF NOT EXISTS public.cms_post_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.cms_posts(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  snapshot JSONB NOT NULL,
  change_note TEXT,
  actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(post_id, version_number)
);

CREATE INDEX IF NOT EXISTS cms_posts_status_idx ON public.cms_posts(status, published_at DESC);
CREATE INDEX IF NOT EXISTS cms_posts_category_idx ON public.cms_posts(category_id, status);
CREATE INDEX IF NOT EXISTS cms_posts_scheduled_idx ON public.cms_posts(scheduled_at) WHERE status = 'scheduled';
CREATE INDEX IF NOT EXISTS cms_post_versions_post_idx ON public.cms_post_versions(post_id, version_number DESC);

CREATE OR REPLACE FUNCTION public.cms_touch_post_version()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE next_version INTEGER;
BEGIN
  SELECT COALESCE(MAX(version_number), 0) + 1 INTO next_version FROM public.cms_post_versions WHERE post_id = NEW.id;
  INSERT INTO public.cms_post_versions (post_id, version_number, snapshot, actor_id)
  VALUES (NEW.id, next_version, to_jsonb(NEW), auth.uid());
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS cms_posts_version_trigger ON public.cms_posts;
CREATE TRIGGER cms_posts_version_trigger AFTER INSERT OR UPDATE ON public.cms_posts
FOR EACH ROW EXECUTE FUNCTION public.cms_touch_post_version();

ALTER TABLE public.cms_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_post_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public reads published CMS posts" ON public.cms_posts FOR SELECT
USING (status = 'published' AND published_at IS NOT NULL AND published_at <= NOW());
CREATE POLICY "Public reads CMS categories" ON public.cms_categories FOR SELECT USING (TRUE);

CREATE POLICY "CMS staff manages categories" ON public.cms_categories FOR ALL TO authenticated
USING (public.has_any_role(ARRAY['super_admin','admin','manager','marketing_manager','content_editor']))
WITH CHECK (public.has_any_role(ARRAY['super_admin','admin','manager','marketing_manager','content_editor']));
CREATE POLICY "CMS staff reads all posts" ON public.cms_posts FOR SELECT TO authenticated
USING (public.has_any_role(ARRAY['super_admin','admin','manager','marketing_manager','content_editor','viewer']));
CREATE POLICY "CMS editors create posts" ON public.cms_posts FOR INSERT TO authenticated
WITH CHECK (public.has_any_role(ARRAY['super_admin','admin','manager','marketing_manager','content_editor']) AND author_id = auth.uid());
CREATE POLICY "CMS editors update posts" ON public.cms_posts FOR UPDATE TO authenticated
USING (public.has_any_role(ARRAY['super_admin','admin','manager','marketing_manager','content_editor']))
WITH CHECK (public.has_any_role(ARRAY['super_admin','admin','manager','marketing_manager','content_editor']));
CREATE POLICY "CMS admins archive posts" ON public.cms_posts FOR DELETE TO authenticated
USING (public.has_any_role(ARRAY['super_admin','admin','manager']));
CREATE POLICY "CMS staff reads post versions" ON public.cms_post_versions FOR SELECT TO authenticated
USING (public.has_any_role(ARRAY['super_admin','admin','manager','marketing_manager','content_editor','viewer']));
