// src/app/api/leads/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/app/lib/supabaseAdmin';

/* -------------------------------------------------------
   Helpers
------------------------------------------------------- */
function strOrNull(v: unknown) {
  const s = typeof v === 'string' ? v.trim() : '';
  return s.length ? s : null;
}

/** Normaliza payload de BOT y LANDING
 *  - source (constraint): 'bot' | 'form'
 *  - channel (constraint): 'bot' | 'form' | 'landing' | 'manual'
 */
function normalizePayload(raw: any) {
  const name  = strOrNull(raw?.name);
  const email = strOrNull(raw?.email);
  const phone = strOrNull(raw?.phone);
  const motivo = strOrNull(raw?.motivo);
  const conversation_id =
    strOrNull(raw?.conversationId) || strOrNull(raw?.conversation_id);

  // --- SOURCE (solo 'bot' | 'form') ---
  const rawSource = (strOrNull(raw?.source) || '').toLowerCase();
  // Todo lo que no sea 'bot' lo consideramos 'form'
  const source: 'bot' | 'form' = rawSource === 'bot' ? 'bot' : 'form';

  // --- CHANNEL (bot | form | landing | manual) ---
  const rawChannel = (strOrNull(raw?.channel) || '').toLowerCase();
  const isValidChannel = (c: string): c is 'bot' | 'form' | 'landing' | 'manual' =>
    ['bot', 'form', 'landing', 'manual'].includes(c);

  // Si viene un channel válido, se usa; si no, inferimos:
  // - Para bot => 'bot'
  // - Para landing/form => 'landing'
  const channel: 'bot' | 'form' | 'landing' | 'manual' =
    isValidChannel(rawChannel) ? rawChannel : (source === 'bot' ? 'bot' : 'landing');

  // --- STATUS (nuevo | contactado | descartado | valido) ---
  const rawStatus = (strOrNull(raw?.status) || '').toLowerCase();
  const isValidStatus = (s: string): s is 'nuevo' | 'contactado' | 'descartado' | 'valido' =>
    ['nuevo', 'contactado', 'descartado', 'valido'].includes(s);
  const status: 'nuevo' | 'contactado' | 'descartado' | 'valido' =
    isValidStatus(rawStatus) ? rawStatus : 'nuevo';

  return { name, email, phone, motivo, conversation_id, source, channel, status };
}

/* ================= POST: Crear Lead ================= */
export async function POST(req: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    // Si te llega x-www-form-urlencoded desde el navegador manual:
    let body: any;
    const contentType = req.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      body = await req.json();
    } else if (contentType.includes('application/x-www-form-urlencoded')) {
      const form = await req.formData();
      body = Object.fromEntries(form.entries());
    } else {
      // Intentar JSON por defecto
      body = await req.json().catch(() => ({}));
    }

    const payload = normalizePayload(body);

    // Validación mínima: nombre + (email o phone)
    if (!payload.name || (!payload.email && !payload.phone)) {
      return NextResponse.json(
        { error: 'name y (email o phone) son obligatorios' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('leads')
      .insert([
        {
          name: payload.name,
          email: payload.email,
          phone: payload.phone,
          motivo: payload.motivo,                   // nullable en DB
          conversation_id: payload.conversation_id, // nullable
          source: payload.source,                   // 'bot' | 'form'
          channel: payload.channel,                 // 'bot' | 'form' | 'landing' | 'manual'
          status: payload.status,                   // default 'nuevo'
        },
      ])
      .select('id, short_code')
      .single();

    if (error) throw error;

    return NextResponse.json(
      {
        ok: true,
        item: { id: data.id, short_code: data.short_code },
        message: 'Lead creado exitosamente',
      },
      { status: 201 }
    );
  } catch (e: any) {
    console.error('[leads POST] error', e);
    return NextResponse.json(
      { error: e?.message ?? 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

/* ================= GET: Listar Leads ================= */
export async function GET(req: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const url = new URL(req.url);
    const status = url.searchParams.get('status');
    const limit  = parseInt(url.searchParams.get('limit') || '50', 10);

    let query = supabaseAdmin
      .from('leads')
      .select(`
        id, short_code, name, email, phone,
        source, channel, status, created_at,
        conversation_id, motivo, notes
      `)
      .order('created_at', { ascending: false })
      .limit(Number.isFinite(limit) ? limit : 50);

    if (status) query = query.eq('status', status);

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json(
      { items: data ?? [], count: data?.length ?? 0 },
      { status: 200 }
    );
  } catch (e: any) {
    console.error('[leads GET] error', e);
    return NextResponse.json(
      { error: e?.message ?? 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

/* ================= PATCH: Actualizar Lead ================= */
export async function PATCH(req: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const body = await req.json();
    const id = strOrNull(body?.id);
    if (!id) {
      return NextResponse.json(
        { error: 'El ID del lead es requerido' },
        { status: 400 }
      );
    }

    // Campos permitidos para actualizar
    const allowed = new Set([
      'name', 'email', 'phone', 'motivo', 'notes',
      'status', 'source', 'channel', 'conversation_id',
    ]);

    const updateData = Object.fromEntries(
      Object.entries(body)
        .filter(([k]) => k !== 'id' && allowed.has(k))
        .map(([k, v]) => [k, typeof v === 'string' ? v.trim() : v])
    );

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No hay campos válidos para actualizar' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('leads')
      .update(updateData)
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;

    return NextResponse.json(
      { item: data, message: 'Lead actualizado exitosamente' },
      { status: 200 }
    );
  } catch (e: any) {
    console.error('[leads PATCH] error', e);
    return NextResponse.json(
      { error: e?.message ?? 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
