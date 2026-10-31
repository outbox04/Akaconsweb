import 'server-only';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export const ADMIN_ROLES = ['super_admin', 'admin', 'manager', 'marketing_manager', 'content_editor', 'lead_manager', 'viewer'] as const;
export const CMS_EDITOR_ROLES = ['super_admin', 'admin', 'manager', 'marketing_manager', 'content_editor'] as const;

export async function getCurrentRoles() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { user: null, roles: [] as string[] };
  const { data, error } = await supabase.from('user_roles').select('role_name').eq('profile_id', user.id);
  if (error) throw error;
  return { user, roles: (data || []).map((role) => role.role_name) };
}

export async function requireAdmin() {
  const session = await getCurrentRoles();
  if (!session.user) redirect('/dang-nhap?redirect=/admin/cms');
  if (!session.roles.some((role) => (ADMIN_ROLES as readonly string[]).includes(role))) redirect('/');
  return session;
}

export async function requireApiAdmin() {
  const session = await getCurrentRoles();
  if (!session.user) return { ok: false as const, status: 401, message: 'Bạn cần đăng nhập.' };
  if (!session.roles.some((role) => (ADMIN_ROLES as readonly string[]).includes(role))) return { ok: false as const, status: 403, message: 'Bạn không có quyền thực hiện thao tác này.' };
  return { ok: true as const, user: session.user, roles: session.roles };
}

export async function requireApiRole(allowedRoles: readonly string[]) {
  const session = await getCurrentRoles();
  if (!session.user) return { ok: false as const, status: 401, message: 'Bạn cần đăng nhập.' };
  if (!session.roles.some((role) => allowedRoles.includes(role))) return { ok: false as const, status: 403, message: 'Bạn không có quyền thực hiện thao tác này.' };
  return { ok: true as const, user: session.user, roles: session.roles };
}
