create table if not exists public.website_live_content (
  site_key text primary key,
  content jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.website_live_content enable row level security;

create policy "Published website content is public"
  on public.website_live_content for select using (true);

create policy "Website admins can publish content"
  on public.website_live_content for all to authenticated
  using (exists (select 1 from public.user_roles where profile_id = auth.uid() and role_name in ('super_admin', 'admin', 'manager')))
  with check (exists (select 1 from public.user_roles where profile_id = auth.uid() and role_name in ('super_admin', 'admin', 'manager')));
