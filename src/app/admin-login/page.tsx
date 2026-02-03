import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default function AdminLoginPage({
  searchParams,
}: { searchParams: { next?: string; error?: string } }) {
  async function login(formData: FormData) {
    'use server';
    const u = String(formData.get('username') ?? '');
    const p = String(formData.get('password') ?? '');

    const USER = process.env.DASHBOARD_USER ?? 'admin';
    const PASS = process.env.DASHBOARD_PASS ?? 'admin';

    if (u === USER && p === PASS) {
      const jar = await cookies();
      jar.set('dc_admin', 'ok', {
        httpOnly: true,
        sameSite: 'lax',
        secure: true,
        path: '/',
        maxAge: 60 * 60 * 8, // 8h
      });
      redirect(searchParams?.next ? decodeURIComponent(searchParams.next) : '/dashboard');
    }

    redirect('/admin-login?error=1' + (searchParams?.next ? `&next=${encodeURIComponent(searchParams.next)}` : ''));
  }

  const showError = searchParams?.error === '1';

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-slate-900">Acceso a Administración</h1>
        <p className="mt-1 text-sm text-slate-500">Ingresa tus credenciales.</p>

        {showError && (
          <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            Usuario o contraseña incorrectos.
          </div>
        )}

        <form action={login} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Usuario</label>
            <input name="username" type="text" required className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" placeholder="admin" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Contraseña</label>
            <input name="password" type="password" required className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" placeholder="••••••••" />
          </div>
          <button type="submit" className="mt-2 w-full rounded-md bg-slate-900 px-3 py-2 text-white hover:opacity-90">
            Entrar
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-slate-500">Acceso restringido. Uso interno.</p>
      </div>
    </div>
  );
}