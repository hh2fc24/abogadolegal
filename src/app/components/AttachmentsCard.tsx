'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Paperclip, Trash2, Upload } from 'lucide-react';

type OwnerType = 'lead' | 'case';

type UploadRow = {
  id: string;
  owner_type: OwnerType;
  owner_id: string;
  file_name: string;
  file_type: string | null;
  file_size: number | null;
  storage_path: string;
  public_url: string | null;
  created_at: string | null;
  // Campo virtual para UI:
  __source?: 'case' | 'lead';
};

export default function AttachmentsCard({
  ownerType,
  ownerId,
  alsoFromLeadId,       // <-- si se pasa, se fusionan adjuntos del lead
  title = 'Adjuntos',
  description = 'Carga y gestiona documentación PDF, Word, Excel, imágenes, etc.',
  readOnly = false,
}: {
  ownerType: OwnerType;
  ownerId: string;
  alsoFromLeadId?: string;
  title?: string;
  description?: string;
  readOnly?: boolean;
}) {
  const [items, setItems] = useState<UploadRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // límites
  const MAX_FILES_PER_BATCH = 10;
  const MAX_FILE_MB = 20;

  async function fetchListSingle(_ownerType: OwnerType, _ownerId: string): Promise<UploadRow[]> {
    const url = `/api/uploads/list?owner_type=${encodeURIComponent(_ownerType)}&owner_id=${encodeURIComponent(_ownerId)}`;
    const r = await fetch(url, { cache: 'no-store' });
    if (!r.ok) return [];
    const { items } = await r.json();
    return (items ?? []) as UploadRow[];
  }

  async function fetchAll() {
    setLoading(true);
    try {
      // principal (del owner actual)
      const primary = await fetchListSingle(ownerType, ownerId);
      primary.forEach(x => (x.__source = ownerType));

      // si es un caso y tenemos el lead, agregamos también adjuntos del lead
      let extras: UploadRow[] = [];
      if (alsoFromLeadId) {
        extras = await fetchListSingle('lead', alsoFromLeadId);
        extras.forEach(x => (x.__source = 'lead'));
      }

      const merged = [...primary, ...extras].sort((a, b) => {
        const ta = a.created_at ? new Date(a.created_at).getTime() : 0;
        const tb = b.created_at ? new Date(b.created_at).getTime() : 0;
        return tb - ta;
      });

      setItems(merged);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ownerType, ownerId, alsoFromLeadId]);

  async function onPickFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    // validaciones
    if (files.length > MAX_FILES_PER_BATCH) {
      alert(`Máximo ${MAX_FILES_PER_BATCH} archivos por carga.`);
      e.target.value = '';
      return;
    }
    for (const f of files) {
      const sizeMB = f.size / (1024 * 1024);
      if (sizeMB > MAX_FILE_MB) {
        alert(`"${f.name}" excede ${MAX_FILE_MB}MB.`);
        e.target.value = '';
        return;
      }
    }

    setUploading(true);
    try {
      // subimos en serie para evitar saturar
      for (const f of files) {
        const fd = new FormData();
        fd.set('owner_type', ownerType);
        fd.set('owner_id', ownerId);
        fd.set('file', f);

        const r = await fetch('/api/uploads', {
          method: 'POST',
          body: fd,
        });
        if (!r.ok) {
          const { error } = await r.json().catch(() => ({ error: 'Error al subir' }));
          throw new Error(error || 'Error al subir');
        }
      }
      await fetchAll();
    } catch (err: any) {
      alert(err?.message ?? 'Error subiendo archivo(s)');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  async function onDelete(id: string) {
    if (!confirm('¿Eliminar archivo? Esta acción no se puede deshacer.')) return;
    const r = await fetch(`/api/uploads/${encodeURIComponent(id)}`, { method: 'DELETE' });
    if (!r.ok) {
      const { error } = await r.json().catch(() => ({ error: 'Error al eliminar' }));
      alert(error || 'Error al eliminar');
      return;
    }
    setItems(prev => prev.filter(x => x.id !== id));
  }

  const headerHint = useMemo(() => {
    if (!alsoFromLeadId) return null;
    return (
      <p className="mt-1 text-xs text-slate-500">
        Mostrando adjuntos del <span className="font-medium">caso</span> y del <span className="font-medium">lead de origen</span>.
      </p>
    );
  }, [alsoFromLeadId]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_8px_30px_rgba(2,6,23,0.05)]">
      {/* header */}
      <div className="mb-4">
        <h3 className="flex items-center gap-2 text-slate-900 font-semibold">
          <Paperclip className="h-4 w-4 text-slate-600" />
          {title}
        </h3>
        <p className="text-sm text-slate-600">{description}</p>
        {headerHint}
      </div>

      {/* uploader */}
      {!readOnly && (
        <div className="mb-4 flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3">
          <div className="text-xs text-slate-600">
            Arrastra y suelta o selecciona hasta {MAX_FILES_PER_BATCH} archivos. Máx {MAX_FILE_MB}MB c/u.
          </div>
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={onPickFiles}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="inline-flex items-center gap-2 rounded-md bg-gradient-to-r from-sky-600 to-blue-600 px-3 py-2 text-xs font-semibold text-white shadow-sm ring-1 ring-blue-500/30 transition hover:brightness-110 disabled:opacity-60"
            >
              <Upload className="h-4 w-4" />
              {uploading ? 'Cargando…' : 'Subir archivos'}
            </button>
          </div>
        </div>
      )}

      {/* list */}
      <div className="rounded-xl border border-slate-200">
        {loading ? (
          <div className="p-4 text-sm text-slate-500">Cargando…</div>
        ) : items.length === 0 ? (
          <div className="p-6 text-sm text-slate-500">Sin adjuntos aún.</div>
        ) : (
          <ul className="divide-y divide-slate-200">
            {items.map((it) => (
              <li key={it.id} className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-slate-50">
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium text-slate-900">{it.file_name}</div>
                  <div className="text-[11px] text-slate-500">
                    {(it.file_type || '—')}{' '}
                    • {fmtSize(it.file_size)}{' '}
                    • {it.created_at ? new Date(it.created_at).toLocaleString('es-CL') : '—'}
                    {it.__source ? (
                      <>
                        {' '}•{' '}
                        <span className={it.__source === 'lead' ? 'text-amber-600' : 'text-sky-600'}>
                          {it.__source === 'lead' ? 'Origen: Lead' : 'Origen: Caso'}
                        </span>
                      </>
                    ) : null}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {it.public_url ? (
                    <a
                      href={it.public_url}
                      target="_blank"
                      className="rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-[12px] font-medium text-slate-700 shadow-sm hover:bg-slate-50"
                    >
                      Ver
                    </a>
                  ) : (
                    <a
                      href={`/api/uploads/file/${encodeURIComponent(it.id)}`} // si tienes un proxy de descarga privada
                      className="rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-[12px] font-medium text-slate-700 shadow-sm hover:bg-slate-50"
                    >
                      Descargar
                    </a>
                  )}
                  {!readOnly && (
                    <button
                      onClick={() => onDelete(it.id)}
                      className="inline-flex items-center gap-1 rounded-md border border-rose-200 bg-white px-2.5 py-1.5 text-[12px] font-medium text-rose-700 shadow-sm hover:bg-rose-50"
                      title="Eliminar"
                    >
                      <Trash2 className="h-4 w-4" />
                      Eliminar
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function fmtSize(n?: number | null) {
  if (!n || n <= 0) return '—';
  const kb = n / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(1)} MB`;
}