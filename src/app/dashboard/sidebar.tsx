'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, Users, FolderKanban, Shield } from 'lucide-react';

const NAV = [
  { name: 'Resumen', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Leads',   href: '/dashboard/leads', icon: Users },
  { name: 'Casos',   href: '/dashboard/cases', icon: FolderKanban },
  { name: 'Admin',   href: '/dashboard/admin', icon: Shield },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div
      className="sticky top-0 h-screen select-none border-r border-slate-200 bg-white"
      style={{
        background:
          'radial-gradient(700px 300px at 20% -10%, rgba(17,205,239,0.06),transparent 40%), radial-gradient(500px 220px at 100% 0%, rgba(18,113,255,0.05),transparent 45%)',
      }}
    >
      {/* Marca */}
      <div className="flex items-center gap-2 px-5 pb-3 pt-6">
        <div className="h-7 w-7 rounded-md bg-gradient-to-tr from-sky-500 to-blue-600 shadow-sm" />
        <div className="leading-tight">
          <div className="text-[13px] font-semibold tracking-tight text-slate-900">DeudaCero</div>
          <div className="text-[11px] text-slate-500">Control Center</div>
        </div>
      </div>

      <div className="mx-5 mb-3 h-px bg-gradient-to-r from-slate-200/80 to-transparent" />

      {/* Nav */}
      <nav className="px-3">
        <ul className="space-y-1.5">
          {NAV.map(({ name, href, icon: Icon }) => {
            const active =
              pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={[
                    'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-all',
                    active
                      ? 'bg-white shadow-[0_8px_24px_rgba(2,6,23,0.06)] ring-1 ring-sky-200 text-slate-900'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
                  ].join(' ')}
                >
                  <span
                    className={[
                      'flex h-8 w-8 items-center justify-center rounded-md border',
                      active
                        ? 'border-sky-200 bg-gradient-to-br from-sky-50 to-white text-sky-600'
                        : 'border-slate-200 bg-white text-slate-500 group-hover:text-slate-700',
                    ].join(' ')}
                  >
                    <Icon size={18} />
                  </span>
                  <span className="truncate">{name}</span>
                  {active && <span className="ml-auto h-2 w-2 rounded-full bg-gradient-to-r from-sky-400 to-blue-500" />}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}