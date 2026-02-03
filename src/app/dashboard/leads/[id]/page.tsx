// src/app/dashboard/leads/[id]/page.tsx
import { getSupabaseAdmin } from '@/app/lib/supabaseAdmin';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import {
  User, Mail, Phone, CheckSquare, FolderKanban, Save, StickyNote, MessageSquare, ChevronLeft,
} from 'lucide-react';
import type { Database } from '@/app/lib/database.types';
import AttachmentsCard from '@/app/components/AttachmentsCard';

export const dynamic = 'force-dynamic';

type LeadRow = Database['public']['Tables']['leads']['Row'];
type ConversationRow = Database['public']['Tables']['conversations']['Row'];
type Params = { id: string };

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-md bg-zinc-50 text-zinc-700 ring-1 ring-zinc-200 px-2 py-0.5 text-xs">
      {children}
    </span>
  );
}

export default async function LeadDetailPage(props: { params: Promise<Params> }) {
  const { id: leadId } = await props.params;
  const supabaseAdmin = getSupabaseAdmin();

  // === Lead ===
  const { data: leadData, error: leadError } = await supabaseAdmin
    .from('leads')
    .select('*')
    .eq('id', leadId)
    .single();

  const lead = leadData as LeadRow | null;
  if (leadError || !lead) {
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-800">
        Lead no encontrado o error al cargar.
      </div>
    );
  }

  // === Conversación (preview) ===
  let convo: ConversationRow | null = null;
  if (lead.conversation_id) {
    const { data: c } = await supabaseAdmin
      .from('conversations')
      .select('*')
      .eq('id', lead.conversation_id)
      .single();
    convo = (c as ConversationRow) ?? null;
  }

  /* ----------------------- Server Actions ----------------------- */

  async function updateLeadStatus(formData: FormData) {
    'use server';
    const supabaseAdmin = getSupabaseAdmin();
    const raw = (formData.get('status') as string) || 'nuevo';
    const allowed = new Set(['nuevo', 'contactado', 'descartado', 'valido']);
    const status = allowed.has(raw) ? raw : 'nuevo';

    await supabaseAdmin.from('leads').update({ status }).eq('id', leadId);
    revalidatePath(`/dashboard/leads/${leadId}`);
    revalidatePath('/dashboard/leads');
  }

  async function saveNotes(formData: FormData) {
    'use server';
    const supabaseAdmin = getSupabaseAdmin();
    const notes = (formData.get('notes') as string) ?? null;
    await supabaseAdmin.from('leads').update({ notes }).eq('id', leadId);
    revalidatePath(`/dashboard/leads/${leadId}`);
  }

  async function convertToCase() {
    'use server';
    const supabaseAdmin = getSupabaseAdmin();
    // Evitar duplicados
    const { data: existing } = await supabaseAdmin
      .from('cases')
      .select('id')
      .eq('lead_id', leadId)
      .limit(1)
      .maybeSingle();

    if (existing?.id) {
      redirect(`/dashboard/cases/${existing.id}`);
      return;
    }

    // Tomar motivo como descripción, si existe
    const { data: lr } = await supabaseAdmin
      .from('leads')
      .select('motivo')
      .eq('id', leadId)
      .single();

    const desc = (lr as Pick<LeadRow, 'motivo'> | null)?.motivo?.trim();
    const payload: Record<string, any> = {
      lead_id: leadId,
      estado: 'nuevo',
      ...(desc ? { descripcion: desc } : {}),
    };

    const { data: created, error } = await supabaseAdmin
      .from('cases')
      .insert(payload)
      .select('id')
      .single();

    if (error || !created) return;

    await supabaseAdmin.from('leads').update({ status: 'valido' }).eq('id', leadId);

    revalidatePath('/dashboard/leads');
    revalidatePath('/dashboard/cases');
    redirect(`/dashboard/cases/${created.id}`);
  }

  const statuses: Array<LeadRow['status']> = ['nuevo', 'contactado', 'descartado', 'valido'];

  /* ------------------------------ UI ------------------------------ */

  return (
    <div className="space-y-6">
      {/* Breadcrumb / Header compacto */}
      <div className="flex items-start justify-between">
        <div>
          <div className="mb-1 text-xs text-zinc-500">
            <Link href="/dashboard/leads" className="inline-flex items-center gap-1 hover:text-zinc-700">
              <ChevronLeft size={14} /> Volver a Leads
            </Link>
          </div>
          <h1 className="text-[22px] font-semibold text-zinc-900 tracking-tight">
            {lead.short_code ?? '—'} <span className="text-zinc-500 font-normal">• Detalle del lead</span>
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Gestiona el estado, notas y adjuntos. Origen:{' '}
            <Chip>{lead.channel ?? '—'}</Chip>
            <span className="mx-1">/</span>
            <Chip>{lead.source}</Chip>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Columna principal */}
        <div className="space-y-6 lg:col-span-2">
          {/* Datos del cliente */}
          <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-zinc-900">
              <User size={16} className="text-zinc-700" /> Datos del Cliente
            </h3>

            <div className="grid gap-4 sm:grid-cols-2">
              <InfoRow label="Nombre" value={lead.name} />
              <InfoRow label="Email" value={lead.email} icon={<Mail size={14} />} />
              <InfoRow label="Teléfono" value={lead.phone} icon={<Phone size={14} />} />
              <InfoRow
                label="Creado"
                value={lead.created_at ? new Date(lead.created_at).toLocaleString('es-CL', { timeZone: 'America/Santiago' }) : '—'}
              />
            </div>
          </section>

          {/* Motivo declarado */}
          <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-zinc-900">
              <MessageSquare size={16} className="text-zinc-700" /> Motivo declarado por el cliente
            </h3>
            <p className="whitespace-pre-wrap text-[15px] leading-6 text-zinc-800">
              {lead.motivo?.trim() || '— Sin detalle —'}
            </p>
          </section>

          {/* Conversación (preview) */}
          <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-zinc-900">
              <MessageSquare size={16} className="text-zinc-700" /> Conversación (preview)
            </h3>

            {!convo?.messages || (Array.isArray(convo.messages) && convo.messages.length === 0) ? (
              <div className="rounded-lg border border-dashed border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-500">
                No hay mensajes vinculados a este lead.
              </div>
            ) : (
              <div className="max-h-72 space-y-3 overflow-auto">
                {(convo!.messages as any[]).slice(0, 20).map((m: any, i: number) => {
                  const isBot = m.role === 'assistant';
                  return (
                    <div key={i} className={`flex ${isBot ? 'justify-start' : 'justify-end'}`}>
                      <div
                        className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm leading-5 shadow-sm ${
                          isBot
                            ? 'bg-zinc-100 text-zinc-900 ring-1 ring-zinc-200'
                            : 'bg-sky-50 text-sky-900 ring-1 ring-sky-200'
                        }`}
                      >
                        <span className="block text-[10px] uppercase tracking-wide opacity-60">
                          {m.role}
                        </span>
                        <span className="whitespace-pre-wrap">{m.content}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Notas internas */}
          <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-zinc-900">
              <StickyNote size={16} className="text-zinc-700" /> Observaciones internas
            </h3>
            <form action={saveNotes} className="space-y-3">
              <textarea
                name="notes"
                defaultValue={lead.notes ?? ''}
                placeholder="Notas del ejecutivo (llamar después, buzón, documentos solicitados, etc.)"
                className="w-full min-h-28 rounded-lg border border-zinc-200 bg-white p-3 text-sm text-zinc-800 placeholder:text-zinc-400 outline-none focus:ring-4 focus:ring-sky-100"
              />
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
              >
                <Save size={16} /> Guardar notas
              </button>
            </form>
          </section>

          {/* Adjuntos del lead */}
          <AttachmentsCard ownerType="lead" ownerId={lead.id} />
        </div>

        {/* Sidebar acciones */}
        <aside className="h-fit space-y-6 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          {/* Estado */}
          <form action={updateLeadStatus} className="space-y-3">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-zinc-900">
              <CheckSquare size={16} className="text-zinc-700" /> Estado del Lead
            </h3>
            <select
              name="status"
              defaultValue={lead.status ?? 'nuevo'}
              className="w-full rounded-lg border border-zinc-200 bg-white p-2 text-sm font-semibold text-zinc-800 outline-none focus:ring-4 focus:ring-sky-100 capitalize"
            >
              {statuses.map((s) => (
                <option key={s ?? 'nuevo'} value={s ?? 'nuevo'} className="capitalize">
                  {s}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
            >
              <Save size={16} /> Actualizar Estado
            </button>
          </form>

          {/* Convertir a caso */}
          <div className="space-y-3">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-zinc-900">
              <FolderKanban size={16} className="text-zinc-700" /> Acciones
            </h3>
            <form action={convertToCase}>
              <button
                type="submit"
                className="w-full rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-sky-700"
              >
                Convertir a Caso
              </button>
            </form>
          </div>
        </aside>
      </div>
    </div>
  );
}

/* ------------------------------ Aux ------------------------------ */

function InfoRow({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | number | null | undefined;
  icon?: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <p className="text-[12px] text-zinc-500">{label}</p>
      <p className="flex items-center gap-2 break-words text-[15px] font-medium text-zinc-900">
        {icon} {value ?? '—'}
      </p>
    </div>
  );
}
