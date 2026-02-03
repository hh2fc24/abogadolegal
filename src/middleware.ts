import { NextResponse, type NextRequest } from 'next/server';

export const config = {
  matcher: ['/dashboard/:path*'],
};

export default function middleware(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl;
  // Si ya está autenticado, dejar pasar
  const cookie = req.cookies.get('dc_admin');
  const isAuthed = cookie?.value === 'ok';
  if (isAuthed) return NextResponse.next();

  // Redirigir a /admin-login (fuera del layout del dashboard)
  const url = req.nextUrl.clone();
  url.pathname = '/admin-login';
  url.searchParams.set('next', pathname + (searchParams.toString() ? `?${searchParams.toString()}` : ''));
  return NextResponse.redirect(url);
}