'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import AttachmentsCard from '@/app/components/AttachmentsCard';
import {
  FileText,
  BadgeCheck,
  User2,
  Building2,
  ClipboardList,
  ExternalLink
} from 'lucide-react';

const ESTADOS = ['nuevo', 'en_proceso', 'cerrado'] as const;
const EVENT_TYPES = [
  'ingreso',
  'gestion_preparatoria',
  'demanda',
  'notificacion',
  'requerimiento',
  'embargo',
  'remate',
  'audiencia',
  'acuerdo',
  'cierre',
] as const;

function EstadoPill({ estado }: { estado: string }) {
  const map: Record<string, string> = {
    nuevo: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
    en_proceso: 'bg-sky-50 text-sky-700 ring-1 ring-sky-200',
    cerrado: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  };
  return (
    <span
      className={`px-2.5 py-1 rounded-full text-[12px] font-medium capitalize ${
        map[estado] ?? 'bg-slate-100 text-slate-700 ring-1 ring-slate-200'
      }`}
    >
      {estado?.replace('_', ' ') || '—'}
    </span>
  );
}

export default function CaseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [item, setItem] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // form state (editable)
  const [estado, setEstado] = useState('nuevo');
  const [descripcion, setDescripcion] = useState('');
  const [notaInterna, setNotaInterna] = useState(''); // requiere columna `nota_interna` en `cases`
  const [abogadoId, setAbogadoId] = useState('');

  // nuevo evento
  const [evType, setEvType] = useState('ingreso');
  const [evDetail, setEvDetail] = useState('');

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [cr, ur, er] = await Promise.all([
          fetch(`/api/cases/${id}`, { cache: 'no-store' }),
          fetch('/api/users', { cache: 'no-store' }),
          fetch(`/api/case-events?case_id=${id}`, { cache: 'no-store' }),
        ]);

        const cjson = await cr.json();
        const ujson = await ur.json();
        const ejson = await er.json();

        setItem(cjson.item ?? null);
        setUsers(ujson.items ?? []);
        setEvents(ejson.items ?? []);

        if (cjson.item) {
          setEstado(cjson.item.estado ?? 'nuevo');
          setDescripcion(cjson.item.descripcion ?? '');
          setNotaInterna(cjson.item.nota_interna ?? ''); // comenta esta línea si aún no tienes la columna
          setAbogadoId(cjson.item.abogado?.id ?? '');
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const abogadoName = useMemo(
    () => users.find((u) => u.id === abogadoId)?.name ?? '',
    [users, abogadoId]
  );

  async function saveCase() {
    setSaving(true);
    try {
      const body: Record<string, any> = {
        estado,
        descripcion: descripcion || null,
        abogado_id: abogadoId || null,
        // si tu API/DB ya tiene columna `nota_interna`, mantenla;
        // si NO la tienes aún, borra esta línea:
        nota_interna: notaInterna || null,
      };

      const r = await fetch(`/api/cases/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!r.ok) throw new Error('Error guardando el caso');
      router.refresh();
    } catch (e: any) {
      alert(e?.message ?? 'Error guardando el caso');
    } finally {
      setSaving(false);
    }
  }

  async function addEvent() {
    if (!evDetail.trim()) {
      alert('Escribe un detalle para el evento.');
      return;
    }
    const body = { case_id: id, type: evType, detail: evDetail.trim() };
    const r = await fetch('/api/case-events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (r.ok) {
      setEvents((prev) => [
        { ...body, id: crypto.randomUUID(), event_date: new Date().toISOString() },
        ...prev,
      ]);
      setEvDetail('');
    } else {
      alert('Error creando evento');
    }
  }

  if (loading) return <div className="p-6 text-slate-500">Cargando…</div>;
  if (!item) return <div className="p-6 text-rose-600">No se encontró el caso.</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_8px_30px_rgba(2,6,23,0.06)]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-500">Caso</span>
              <EstadoPill estado={estado} />
            </div>
            <h1 className="mt-0.5 text-xl font-semibold tracking-tight text-slate-900">
              {item.short_code}{' '}
              <span className="font-normal text-slate-500">— {item.lead?.name ?? '—'}</span>
            </h1>
            <p className="mt-0.5 text-sm text-slate-500">
              Creado: {item.created_at ? new Date(item.created_at).toLocaleString('es-CL') : '—'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="https://oficinajudicialvirtual.pjud.cl"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-sky-200 bg-white px-3 py-2 text-[12px] font-medium text-sky-700 shadow-sm transition-colors hover:border-sky-300 hover:text-sky-800"
              title="Oficina Judicial Virtual"
            >
              Ir a OJV
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
            <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700 ring-1 ring-slate-200">
              Lead: {item.lead?.short_code ?? '—'}
            </span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Columna izquierda */}
        <div className="space-y-6 lg:col-span-2">
          {/* Datos & edición */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_8px_30px_rgba(2,6,23,0.05)]">
            <div className="mb-4 flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-slate-600" />
              <h3 className="font-semibold text-slate-900">Datos del caso</h3>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm text-slate-700">
                Estado
                <select
                  value={estado}
                  onChange={(e) => setEstado(e.target.value)}
                  className="mt-1 w-full rounded-md border border-slate-200 bg-white p-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-200"
                >
                  {ESTADOS.map((s) => (
                    <option key={s} value={s} className="capitalize">
                      {s.replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </label>

              <label className="text-sm text-slate-700">
                Abogado asignado
                <select
                  value={abogadoId}
                  onChange={(e) => setAbogadoId(e.target.value)}
                  className="mt-1 w-full rounded-md border border-slate-200 bg-white p-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-200"
                >
                  <option value="">—</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label className="mt-3 block text-sm text-slate-700">
              Descripción (visible al equipo)
              <textarea
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                rows={4}
                className="mt-1 w-full rounded-md border border-slate-200 bg-white p-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-200"
                placeholder="Descripción general / síntesis del caso…"
              />
            </label>

            {/* Nota interna del abogado (privada) */}
            <label className="mt-3 block text-sm text-slate-700">
              Nota interna del abogado (privada)
              <textarea
                value={notaInterna}
                onChange={(e) => setNotaInterna(e.target.value)}
                rows={3}
                className="mt-1 w-full rounded-md border border-slate-200 bg-white p-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-200"
                placeholder="Observaciones privadas, hipótesis, riesgos, tareas, etc."
              />
            </label>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button
                onClick={saveCase}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-md bg-gradient-to-r from-emerald-600 to-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm ring-1 ring-emerald-500/30 transition hover:brightness-110 disabled:opacity-60"
              >
                <BadgeCheck className="h-4 w-4" />
                {saving ? 'Guardando…' : 'Guardar cambios'}
              </button>

              {abogadoName && (
                <span className="text-xs text-slate-500">
                  Asignado a <span className="font-medium text-slate-700">{abogadoName}</span>
                </span>
              )}
            </div>
          </section>

          {/* Timeline */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_8px_30px_rgba(2,6,23,0.05)]">
            <div className="mb-4 flex items-center gap-2">
              <FileText className="h-4 w-4 text-slate-600" />
              <h3 className="font-semibold text-slate-900">Línea de tiempo</h3>
            </div>

            <div className="space-y-3">
              {events.map((ev: any) => (
                <div key={ev.id} className="rounded-lg border border-slate-200 p-3">
                  <div className="text-xs text-slate-500">
                    {ev.type}{' '}
                    <span className="opacity-70">
                      • {new Date(ev.event_date || ev.created_at).toLocaleString('es-CL')}
                    </span>
                  </div>
                  <div className="text-slate-800">{ev.detail}</div>
                </div>
              ))}
              {events.length === 0 && (
                <div className="text-sm text-slate-500">Aún no hay eventos.</div>
              )}
            </div>
          </section>
        </div>

        {/* Columna derecha */}
        <div className="space-y-6">
          {/* Registrar evento */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_8px_30px_rgba(2,6,23,0.05)]">
            <div className="mb-3 flex items-center gap-2">
              <Building2 className="h-4 w-4 text-slate-600" />
              <h3 className="font-semibold text-slate-900">Registrar evento</h3>
            </div>

            <label className="text-sm text-slate-700">
              Tipo
              <select
                value={evType}
                onChange={(e) => setEvType(e.target.value)}
                className="mt-1 w-full rounded-md border border-slate-200 bg-white p-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-200"
              >
                {EVENT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t.replace('_', ' ')}
                  </option>
                ))}
              </select>
            </label>

            <label className="mt-3 text-sm text-slate-700">
              Detalle
              <textarea
                value={evDetail}
                onChange={(e) => setEvDetail(e.target.value)}
                rows={3}
                className="mt-1 w-full rounded-md border border-slate-200 bg-white p-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-200"
                placeholder="Describe brevemente la gestión realizada…"
              />
            </label>

            <button
              onClick={addEvent}
              className="mt-3 inline-flex items-center rounded-md bg-gradient-to-r from-sky-600 to-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm ring-1 ring-blue-500/30 transition hover:brightness-110"
            >
              Guardar evento
            </button>
          </section>

          {/* Ficha del lead */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_8px_30px_rgba(2,6,23,0.05)]">
            <div className="mb-3 flex items-center gap-2">
              <User2 className="h-4 w-4 text-slate-600" />
              <h3 className="font-semibold text-slate-900">Ficha del Lead</h3>
            </div>
            <InfoRow label="Código" value={item.lead?.short_code ?? '—'} />
            <InfoRow label="Nombre" value={item.lead?.name ?? '—'} />
            <InfoRow label="Email" value={item.lead?.email ?? '—'} />
            <InfoRow label="Teléfono" value={item.lead?.phone ?? '—'} />
            <InfoRow
              label="Canal / Fuente"
              value={`${item.lead?.channel ?? '—'} / ${item.lead?.source ?? '—'}`}
            />
          </section>

          {/* Adjuntos del caso + heredados del lead */}
          <section className="rounded-2xl border border-slate-200 bg-white p-0 shadow-[0_8px_30px_rgba(2,6,23,0.05)]">
            <AttachmentsCard
              ownerType="case"
              ownerId={item.id}
              alsoFromLeadId={item.lead?.id} // <- unifica adjuntos caso + lead (con etiqueta de origen)
              title="Documentación del Caso"
              description="Incluye archivos del caso y los heredados desde el lead de origen."
            />
          </section>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-sm">
      <div className="text-slate-500">{label}</div>
      <div className="text-slate-800">{value}</div>
    </div>
  );
}