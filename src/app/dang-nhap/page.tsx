'use client';

import { FormEvent, Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

function LoginForm() {
  const router = useRouter(); const params = useSearchParams();
  const [email, setEmail] = useState(''); const [password, setPassword] = useState('');
  const [error, setError] = useState(''); const [loading, setLoading] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setLoading(true); setError('');
    const { error: signInError } = await createClient().auth.signInWithPassword({ email, password });
    setLoading(false);
    if (signInError) { setError('Không thể đăng nhập bằng thông tin đã cung cấp.'); return; }
    const destination = params.get('redirect'); router.replace(destination?.startsWith('/admin') ? destination : '/admin/cms'); router.refresh();
  }
  return <main className="auth-page"><form onSubmit={submit} className="auth-card"><p>AKACONS · QUẢN TRỊ</p><h1>Đăng nhập CMS</h1><label>Email<input value={email} type="email" onChange={(event) => setEmail(event.target.value)} autoComplete="email" required /></label><label>Mật khẩu<input value={password} type="password" onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required /></label>{error && <div role="alert">{error}</div>}<button disabled={loading}>{loading ? 'Đang đăng nhập…' : 'Đăng nhập'}</button></form></main>;
}

export default function LoginPage() {
  return <Suspense fallback={<main className="auth-page" />}> <LoginForm /> </Suspense>;
}
