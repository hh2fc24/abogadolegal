import { getSupabaseAdmin } from '@/app/lib/supabaseAdmin';
import Link from 'next/link';
import { Filter, FolderKanban } from 'lucide-react';

export const dynamic = 'force-dynamic';

function EstadoBadge({ estado }: { estado: string }) {
  const map: Record<string, string> = {
    nuevo:        'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
    en_proceso:   'bg-sky-50 text-sky-700 ring-1 ring-sky-200',
    cerrado:      'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-[12px] font-medium capitalize ${map[estado] ?? 'bg-slate-100 text-slate-700 ring-1 ring-slate-200'}`}>
      {estado?.replace('_',' ') || '—'}
    </span>
  );
}

export default async function CasesPage() {
  const supabaseAdmin = getSupabaseAdmin();
  const { data, error } = await supabaseAdmin
    .from('cases')
    .select(`
      id,
      short_code,
      estado,
      descripcion,
      nota_interna,
      created_at,
      lead:leads ( short_code, name ),
      abogado:users!abogado_id ( name )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-700">
        Error al cargar los casos: {error.message}
      </div>
    );
  }

  const cases = data ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_8px_30px_rgba(2,6,23,0.06)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-sky-100 to-blue-50 ring-1 ring-blue-200">
              <FolderKanban className="h-5 w-5 text-blue-700" />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wider text-slate-500">Casuística</p>
              <h1 className="mt-0.5 text-xl font-semibold tracking-tight text-slate-900">Gestión de Casos</h1>
              <p className="mt-0.5 text-sm text-slate-500">Listado maestro de casos creados desde leads.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="https://oficinajudicialvirtual.pjud.cl"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-sky-200 bg-white px-3 py-2 text-[12px] font-medium text-sky-700 shadow-sm transition-colors hover:border-sky-300 hover:text-sky-800"
            >
              Ir a PJUD (OJV)
            </Link>
          </div>
        </div>
      </header>

      {/* Controles (placeholder para filtros rápidos) */}
      <div className="flex items-center justify-between">
        <div className="text-[12px] text-slate-500">
          {cases.length} caso{cases.length === 1 ? '' : 's'}
        </div>
        <button
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[12px] font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
          title="Filtros (próximamente)"
        >
          <Filter className="h-4 w-4" />
          Filtros
        </button>
      </div>

      {/* Tabla */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_8px_30px_rgba(2,6,23,0.05)]">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-3 text-left">Caso</th>
              <th className="px-5 py-3 text-left">Lead</th>
              <th className="px-5 py-3 text-left">Abogado</th>
              <th className="px-5 py-3 text-left">Estado</th>
              <th className="px-5 py-3 text-left">Creado</th>
              <th className="px-5 py-3 text-left">Notas</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody>
            {cases.map((c) => (
              <tr key={c.id} className="border-t border-slate-200 hover:bg-slate-50/60">
                <td className="px-5 py-3 font-medium text-slate-900">{c.short_code}</td>
                <td className="px-5 py-3 text-slate-700">
                  <div className="font-medium">{c.lead?.name ?? '—'}</div>
                  <div className="text-[11px] text-slate-500">{c.lead?.short_code ?? '—'}</div>
                </td>
                <td className="px-5 py-3 text-slate-700">{c.abogado?.name ?? '—'}</td>
                <td className="px-5 py-3">
                  <EstadoBadge estado={c.estado ?? 'nuevo'} />
                </td>
                <td className="px-5 py-3 text-slate-600">
                  {c.created_at ? new Date(c.created_at).toLocaleString('es-CL') : '—'}
                </td>
                <td className="px-5 py-3 text-slate-700 line-clamp-1">
                  {(c.nota_interna?.trim() || c.descripcion?.trim() || '—')}
                </td>
                <td className="px-5 py-3">
                  <Link
                    href={`/dashboard/cases/${c.id}`}
                    className="inline-flex items-center rounded-md bg-gradient-to-r from-sky-600 to-blue-600 px-3 py-1.5 text-[12px] font-semibold text-white shadow-sm transition hover:brightness-110"
                  >
                    Abrir
                  </Link>
                </td>
              </tr>
            ))}
            {cases.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-10 text-center text-slate-500">
                  No hay casos registrados aún.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
