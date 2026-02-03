// src/app/dashboard/page.tsx
import { getSupabaseAdmin } from '@/app/lib/supabaseAdmin';
import { ArrowRight, FolderKanban, MessageSquareText, Users } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

function fmt(n: number | null | undefined) {
  return (n ?? 0).toLocaleString('es-CL');
}

export default async function DashboardHomePage() {
  const supabaseAdmin = getSupabaseAdmin();
  const [casesCountRes, leadsActivosRes, convActivasRes, lastLeadsRes, lastCasesRes] =
    await Promise.all([
      supabaseAdmin.from('cases').select('id', { count: 'exact', head: true }),
      supabaseAdmin.from('leads').select('id', { count: 'exact', head: true }).neq('status', 'descartado'),
      supabaseAdmin.from('conversations').select('id', { count: 'exact', head: true }).eq('status', 'active'),
      supabaseAdmin
        .from('leads')
        .select('id, short_code, name, status, created_at')
        .order('created_at', { ascending: false })
        .limit(6),
      supabaseAdmin
        .from('cases')
        .select('id, short_code, estado, created_at, lead:leads(name)')
        .order('created_at', { ascending: false })
        .limit(6),
    ]);

  const totalCasos = casesCountRes.count ?? 0;
  const leadsActivos = leadsActivosRes.count ?? 0;
  const convActivas = convActivasRes.count ?? 0;

  const lastLeads = lastLeadsRes.data ?? [];
  const lastCases = lastCasesRes.data ?? [];

  return (
    <main className="min-h-[calc(100vh-72px)] bg-white">
      {/* HERO — degradado sutil + borde luminoso */}
      <section
        className="relative overflow-hidden"
        style={{
          background:
            'radial-gradient(1200px 500px at 20% -10%, rgba(18,113,255,0.12), transparent 40%), radial-gradient(900px 400px at 85% -20%, rgba(17,205,239,0.10), transparent 45%)',
        }}
      >
        <div className="mx-auto w-full max-w-7xl px-6 pt-8 pb-6">
          <div className="relative rounded-2xl border border-slate-200 bg-white/70 shadow-[0_8px_30px_rgba(2,6,23,0.06)] backdrop-blur-md">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-sky-400 via-cyan-400 to-blue-500 opacity-80" />
            <div className="grid grid-cols-1 items-start gap-6 p-6 md:grid-cols-2">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-slate-500">
                  Panel de control
                </p>
                <h1 className="mt-1 text-[28px] font-semibold tracking-tight text-slate-900">
                  Resumen general
                </h1>
                <p className="mt-1 text-[13px] leading-5 text-slate-500">
                  Operación al día, actividad reciente y métricas clave.
                </p>
              </div>
              <div className="flex items-center justify-start gap-3 md:justify-end">
                <Link
                  href="/dashboard/leads"
                  className="group inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[13px] font-medium text-slate-700 shadow-sm transition-all hover:shadow-lg hover:-translate-y-0.5"
                >
                  Ver Leads
                  <ArrowRight
                    size={16}
                    className="transition-transform group-hover:translate-x-0.5"
                  />
                </Link>
                <Link
                  href="/dashboard/cases"
                  className="group inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-sky-500 to-blue-600 px-3 py-2 text-[13px] font-semibold text-white shadow-sm transition-all hover:shadow-sky-200/60 hover:-translate-y-0.5"
                >
                  Ver Casos
                  <ArrowRight
                    size={16}
                    className="transition-transform group-hover:translate-x-0.5"
                  />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* KPIs — tarjetas “glass” con micro-animación */}
      <section className="mx-auto w-full max-w-7xl px-6 pb-3">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <Kpi
            title="Total de casos"
            value={fmt(totalCasos)}
            description="Conteo actual en la base"
            icon={<FolderKanban size={22} className="text-blue-600" />}
          />
          <Kpi
            title="Leads activos"
            value={fmt(leadsActivos)}
            description="Excluye descartados"
            icon={<Users size={22} className="text-sky-600" />}
          />
          <Kpi
            title="Conversaciones activas"
            value={fmt(convActivas)}
            description="En curso con el bot"
            icon={<MessageSquareText size={22} className="text-cyan-600" />}
          />
        </div>
      </section>

      {/* Listas con depth elegante */}
      <section className="mx-auto w-full max-w-7xl px-6 pb-12">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card title="Últimos Leads" subtitle="Ingresos recientes">
            {lastLeads.length === 0 ? (
              <Empty text="Sin leads recientes" />
            ) : (
              <ul className="divide-y divide-slate-200">
                {lastLeads.map((l: any) => (
                  <li
                    key={l.id}
                    className="group flex items-center justify-between py-3 transition-all hover:bg-slate-50/60"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="truncate font-medium text-slate-900">
                          {l.short_code ?? '—'}
                        </span>
                        {l.name ? (
                          <span className="truncate text-slate-500">• {l.name}</span>
                        ) : null}
                      </div>
                      <div className="text-[12px] text-slate-500">
                        {new Date(l.created_at).toLocaleString('es-CL')}
                      </div>
                    </div>
                    <StatusLead status={l.status} />
                  </li>
                ))}
              </ul>
            )}
            <CardFooter href="/dashboard/leads" label="Ver todos los leads" />
          </Card>

          <Card title="Últimos Casos" subtitle="Aperturas recientes">
            {lastCases.length === 0 ? (
              <Empty text="Sin casos recientes" />
            ) : (
              <ul className="divide-y divide-slate-200">
                {lastCases.map((c: any) => (
                  <li
                    key={c.id}
                    className="group flex items-center justify-between py-3 transition-all hover:bg-slate-50/60"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="truncate font-medium text-slate-900">
                          {c.short_code ?? '—'}
                        </span>
                        {c.lead?.name ? (
                          <span className="truncate text-slate-500">• {c.lead.name}</span>
                        ) : null}
                      </div>
                      <div className="text-[12px] text-slate-500">
                        {new Date(c.created_at).toLocaleString('es-CL')}
                      </div>
                    </div>
                    <StatusCase estado={c.estado} />
                  </li>
                ))}
              </ul>
            )}
            <CardFooter href="/dashboard/cases" label="Ver todos los casos" />
          </Card>
        </div>
      </section>
    </main>
  );
}

/* ---------- UI helpers (sin dependencias) ---------- */

function Kpi({
  title,
  value,
  description,
  icon,
}: {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="relative rounded-2xl border border-slate-200 bg-white shadow-[0_10px_30px_rgba(2,6,23,0.06)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(2,6,23,0.08)]">
      <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-sky-400 via-cyan-400 to-blue-500 opacity-80" />
      <div className="flex items-start justify-between gap-3 p-5">
        <div>
          <p className="text-[12px] font-medium tracking-wide text-slate-500">
            {title}
          </p>
          <div className="mt-1 text-[28px] font-semibold leading-none tracking-tight text-slate-900">
            {value}
          </div>
          {description ? (
            <p className="mt-1 text-[12px] text-slate-500">{description}</p>
          ) : null}
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
          {icon}
        </div>
      </div>
    </div>
  );
}

function Card({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(2,6,23,0.06)]">
      <div className="mb-3">
        <h3 className="text-[15px] font-semibold tracking-tight text-slate-900">
          {title}
        </h3>
        {subtitle ? (
          <p className="text-[12px] text-slate-500">{subtitle}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

function CardFooter({ href, label }: { href: string; label: string }) {
  return (
    <div className="mt-4 flex justify-end">
      <Link
        href={href}
        className="group inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[13px] font-medium text-slate-700 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg"
      >
        {label}
        <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
      </Link>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div className="flex h-24 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 text-[13px] text-slate-500">
      {text}
    </div>
  );
}

function StatusLead({ status }: { status?: string | null }) {
  const s = status ?? '';
  const base =
    'inline-flex items-center rounded-full px-2.5 py-1 text-[12px] font-medium';
  if (s === 'valido') return <span className={`${base} bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200`}>Válido</span>;
  if (s === 'descartado') return <span className={`${base} bg-rose-50 text-rose-700 ring-1 ring-rose-200`}>Descartado</span>;
  if (s === 'contactado') return <span className={`${base} bg-sky-50 text-sky-700 ring-1 ring-sky-200`}>Contactado</span>;
  return <span className={`${base} bg-slate-50 text-slate-700 ring-1 ring-slate-200`}>{s || 'Nuevo'}</span>;
}

function StatusCase({ estado }: { estado?: string | null }) {
  const e = estado ?? '';
  const base =
    'inline-flex items-center rounded-full px-2.5 py-1 text-[12px] font-medium';
  if (e === 'en_proceso') return <span className={`${base} bg-sky-50 text-sky-700 ring-1 ring-sky-200`}>En proceso</span>;
  if (e === 'cerrado') return <span className={`${base} bg-slate-100 text-slate-700 ring-1 ring-slate-200`}>Cerrado</span>;
  return <span className={`${base} bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200`}>Nuevo</span>;
}
