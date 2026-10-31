import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireApiAdmin } from '@/lib/auth/authorization';
import { liveContentSchema } from '@/lib/validation/admin';
import { hasAcceptableJsonBody, isSameOrigin, noStoreJson } from '@/lib/security/request';

const SITE_KEY = 'akacons-public-site';

export async function GET() {
  try {
    const supabase = createClient();
    const { data, error } = await supabase.from('website_live_content').select('content,updated_at').eq('site_key', SITE_KEY).maybeSingle();
    if (error) throw error;
    return NextResponse.json({ content: data?.content || {}, updatedAt: data?.updated_at || null });
  } catch {
    return NextResponse.json({ content: {}, updatedAt: null });
  }
}

export async function PUT(request: Request) {
  try {
    if (!isSameOrigin(request)) return noStoreJson({ error: 'Invalid request origin.' }, { status: 403 });
    if (!hasAcceptableJsonBody(request, 1_000_000)) return noStoreJson({ error: 'Request body is too large.' }, { status: 413 });
    const authorization = await requireApiAdmin();
    if (!authorization.ok) return noStoreJson({ error: authorization.message }, { status: authorization.status });
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Bạn cần đăng nhập để xuất bản.' }, { status: 401 });
    const { data: roles, error: roleError } = await supabase.from('user_roles').select('role_name').eq('profile_id', user.id);
    if (roleError) throw roleError;
    if (!roles?.some((role) => ['super_admin', 'admin', 'manager'].includes(role.role_name))) return NextResponse.json({ error: 'Bạn không có quyền xuất bản website.' }, { status: 403 });
    const parsed = liveContentSchema.safeParse(await request.json());
    if (!parsed.success) return noStoreJson({ error: 'Invalid published content.' }, { status: 400 });
    const body = parsed.data;
    if (body.content && (Object.keys(body.content).length > 500 || Object.values(body.content).some((value) => typeof value !== 'string' || value.length > 50_000))) return NextResponse.json({ error: 'Nội dung xuất bản vượt giới hạn cho phép.' }, { status: 413 });
    if (!body.content || typeof body.content !== 'object') return NextResponse.json({ error: 'Nội dung xuất bản không hợp lệ.' }, { status: 400 });
    const { error } = await supabase.from('website_live_content').upsert({ site_key: SITE_KEY, content: body.content, updated_at: new Date().toISOString() }, { onConflict: 'site_key' });
    if (error) throw error;
    return noStoreJson({ ok: true, publishedAt: new Date().toISOString() });
  } catch (error) {
    console.error('Site content publish failed', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Không thể xuất bản website.' }, { status: 500 });
  }
}
