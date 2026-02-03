// src/app/dashboard/leads/page.tsx
import { getSupabaseAdmin } from '@/app/lib/supabaseAdmin';
import { Users, Search, Filter, Plus, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

type LeadRow = {
  id: string;
  short_code: string | null;
  name: string | null;
  email: string | null;
  phone: string | null;
  status: string | null;
  channel: string | null;
  source: string;
  created_at: string | null;
};

function fmtDate(d: string | null) {
  return d ? new Date(d).toLocaleString('es-CL') : '—';
}

function StatusBadge({ status }: { status: string | null }) {
  const s = (status ?? 'nuevo').toLowerCase();
  const map: Record<string, string> = {
    nuevo: 'bg-sky-50 text-sky-700 ring-1 ring-sky-200',
    contactado: 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200',
    valido: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
    descartado: 'bg-rose-50 text-rose-700 ring-1 ring-rose-200',
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${map[s] ?? map['nuevo']}`}>
      {s}
    </span>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-md bg-zinc-50 text-zinc-700 ring-1 ring-zinc-200 px-2 py-0.5 text-xs">
      {children}
    </span>
  );
}

// ✅ Next.js 15: searchParams es asincrónico
export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const supabaseAdmin = getSupabaseAdmin();
  const sp = await searchParams;
  const status = String(sp?.status ?? '').toLowerCase();
  const source = String(sp?.source ?? '').toLowerCase();
  const q = String(sp?.q ?? '').trim();

  // ---- query base con filtros reales ----
  let query = supabaseAdmin
    .from('leads')
    .select('id, short_code, name, email, phone, status, channel, source, created_at')
    .order('created_at', { ascending: false })
    .limit(50);

  if (status) {
    query = query.eq('status', status);
  }
  if (source) {
    query = query.eq('source', source);
  }
  if (q) {
    // búsqueda simple: name/email/phone/short_code (OR)
    query = query.or(
      [
        `name.ilike.%${q}%`,
        `email.ilike.%${q}%`,
        `phone.ilike.%${q}%`,
        `short_code.ilike.%${q}%`,
      ].join(',')
    );
  }

  const [listRes, totalRes, activosRes] = await Promise.all([
    query,
    supabaseAdmin.from('leads').select('id', { count: 'exact', head: true }),
    supabaseAdmin.from('leads').select('id', { count: 'exact', head: true }).neq('status', 'descartado'),
  ]);

  if (listRes.error) {
    return <p className="text-rose-600">Error al cargar los leads: {listRes.error.message}</p>;
  }

  const leads = (listRes.data ?? []) as LeadRow[];
  const total = totalRes.count ?? 0;
  const activos = activosRes.count ?? 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="rounded-2xl border border-zinc-200 bg-white p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-[22px] font-semibold text-zinc-900 flex items-center gap-3">
              <Users size={22} className="text-zinc-700" />
              Registro de Leads
            </h1>
            <p className="mt-1 text-sm text-zinc-500">
              Últimos ingresos del bot, landing o carga manual. Gestiona y convierte en caso.
            </p>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <div className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-600">
              Total: <span className="font-semibold text-zinc-900">{total.toLocaleString('es-CL')}</span>
            </div>
            <div className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-600">
              Activos: <span className="font-semibold text-zinc-900">{activos.toLocaleString('es-CL')}</span>
            </div>
          </div>
        </div>

        {/* Controles: búsqueda + filtros rápidos (UI estática, filtros por URL) */}
        <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex w-full items-center gap-2 md:w-auto">
            <div className="relative w-full md:w-96">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                defaultValue={q}
                placeholder="Buscar por nombre, email o código…"
                className="w-full rounded-lg border border-zinc-200 bg-white pl-9 pr-3 py-2 text-sm text-zinc-800 placeholder:text-zinc-400 outline-none focus:ring-4 focus:ring-sky-100"
                readOnly
              />
            </div>
            <button
              className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
              title="Filtros"
            >
              <Filter size={16} /> Filtros
            </button>
          </div>

          <div className="flex items-center gap-2">
            <QuickFilter label="Todos" href="/dashboard/leads" active={!status} />
            <QuickFilter label="Nuevo" href="/dashboard/leads?status=nuevo" tone="sky" active={status === 'nuevo'} />
            <QuickFilter label="Contactado" href="/dashboard/leads?status=contactado" tone="indigo" active={status === 'contactado'} />
            <QuickFilter label="Válido" href="/dashboard/leads?status=valido" tone="emerald" active={status === 'valido'} />
            <QuickFilter label="Descartado" href="/dashboard/leads?status=descartado" tone="rose" active={status === 'descartado'} />
          </div>
        </div>
      </header>

      {/* Tabla */}
      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
        <table className="w-full text-left">
          <thead>
            <tr className="text-[11px] uppercase tracking-wide text-zinc-500 border-b border-zinc-200 bg-zinc-50">
              <th className="px-4 py-3">Código</th>
              <th className="px-4 py-3">Cliente</th>
              <th className="px-4 py-3">Contacto</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Origen</th>
              <th className="px-4 py-3">Creado</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr key={lead.id} className="border-b border-zinc-100 last:border-0 hover:bg-zinc-50/80">
                <td className="px-4 py-3">
                  <div className="font-medium text-zinc-900">{lead.short_code ?? '—'}</div>
                  <div className="text-[11px] text-zinc-500">{lead.id.slice(0, 8)}</div>
                </td>
                <td className="px-4 py-3">
                  <div className="font-medium text-zinc-900">{lead.name ?? '—'}</div>
                  <div className="text-[11px] text-zinc-500">{lead.phone ?? '—'}</div>
                </td>
                <td className="px-4 py-3">
                  <div className="text-sm text-zinc-800">{lead.email ?? '—'}</div>
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={lead.status} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <Chip>{lead.channel ?? '—'}</Chip>
                    <Chip>{lead.source}</Chip>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-zinc-700">{fmtDate(lead.created_at)}</td>
                <td className="px-4 py-3">
                  <Link
                    href={`/dashboard/leads/${lead.id}`}
                    className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-zinc-800"
                  >
                    Gestionar <ChevronRight size={14} />
                  </Link>
                </td>
              </tr>
            ))}
            {leads.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center">
                  <div className="mx-auto max-w-md">
                    <div className="mx-auto mb-2 h-10 w-10 rounded-full bg-zinc-100" />
                    <div className="text-sm font-medium text-zinc-900">Sin leads para mostrar</div>
                    <p className="text-sm text-zinc-500">
                      Cuando se registren nuevos leads desde el bot o formularios, aparecerán aquí.
                    </p>
                    <button className="mt-4 inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50">
                      <Plus size={16} /> Crear lead
                    </button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer meta */}
      <div className="text-xs text-zinc-500">
        Mostrando {Math.min(leads.length, 50)} de {total.toLocaleString('es-CL')} registros.
      </div>
    </div>
  );
}

function QuickFilter({
  label,
  href,
  active = false,
  tone,
}: {
  label: string;
  href: string;
  active?: boolean;
  tone?: 'sky' | 'indigo' | 'emerald' | 'rose';
}) {
  const toneMap: Record<string, string> = {
    sky: 'bg-sky-50 text-sky-700 ring-sky-200 hover:bg-sky-100',
    indigo: 'bg-indigo-50 text-indigo-700 ring-indigo-200 hover:bg-indigo-100',
    emerald: 'bg-emerald-50 text-emerald-700 ring-emerald-200 hover:bg-emerald-100',
    rose: 'bg-rose-50 text-rose-700 ring-rose-200 hover:bg-rose-100',
  };
  const base =
    'inline-flex items-center rounded-lg px-3 py-1.5 text-xs font-medium ring-1 transition';
  const normal =
    'bg-white text-zinc-700 ring-zinc-200 hover:bg-zinc-50';
  const activeCls =
    tone ? toneMap[tone] : 'bg-zinc-900 text-white ring-zinc-900 hover:bg-zinc-800';

  return (
    <Link href={href} className={`${base} ${active ? activeCls : normal}`}>
      {label}
    </Link>
  );
}
