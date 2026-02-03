import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  const jar = await cookies();
  jar.set('dc_admin', '', { path: '/', maxAge: 0 });
  return NextResponse.redirect(
    new URL('/admin-login', process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000')
  );
}