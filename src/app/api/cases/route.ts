// src/app/api/cases/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/app/lib/supabaseAdmin';

/* ================= GET: Listar Casos (con filtros y paginación) ================= */
export async function GET(req: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const url = new URL(req.url);
    const abogado_id = url.searchParams.get('abogado_id');
    const estado = url.searchParams.get('estado');
    const lead_id = url.searchParams.get('lead_id');
    const limit = parseInt(url.searchParams.get('limit') || '50', 10);
    const page = Math.max(parseInt(url.searchParams.get('page') || '1', 10), 1);
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let base = supabaseAdmin
      .from('cases')
      .select(
        `
        id,
        short_code,
        estado,
        descripcion,
        created_at,
        lead:leads (
          id,
          short_code,
          name,
          email,
          phone,
          source,
          channel,
          status
        ),
        abogado:users!abogado_id (
          id,
          name,
          email
        )
      `,
        { count: 'exact' } // 👈 para total
      )
      .order('created_at', { ascending: false })
      .range(from, to);

    if (abogado_id) base = base.eq('abogado_id', abogado_id);
    if (estado) base = base.eq('estado', estado);
    if (lead_id) base = base.eq('lead_id', lead_id);

    const { data, error, count } = await base;
    if (error) throw error;

    return NextResponse.json(
      { items: data ?? [], count: count ?? 0, page, pageSize: limit },
      { status: 200 }
    );
  } catch (e: any) {
    console.error('[cases GET] error', e);
    return NextResponse.json(
      { error: e?.message ?? 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

/* ================= POST: Crear Caso (idempotente + evento inicial) ================= */
export async function POST(req: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const body = await req.json();
    const {
      lead_id,
      abogado_id,
      estado = 'nuevo', // válido según CHECK: 'nuevo'|'en_proceso'|'cerrado'
      descripcion,
    } = body;

    if (!lead_id) {
      return NextResponse.json({ error: 'El lead_id es requerido' }, { status: 400 });
    }

    // 1) Verificar que el lead exista (y traemos short_code/estado para logs)
    const { data: lead, error: leadErr } = await supabaseAdmin
      .from('leads')
      .select('id, short_code, status')
      .eq('id', lead_id)
      .single();

    if (leadErr || !lead) {
      return NextResponse.json({ error: 'El lead especificado no existe' }, { status: 400 });
    }

    // 2) Idempotencia: ¿Ya existe un caso para este lead?
    const { data: existing, error: existErr } = await supabaseAdmin
      .from('cases')
      .select(
        `
        id,
        short_code,
        estado,
        descripcion,
        created_at,
        lead:leads ( id, short_code, name, email, phone, source, channel, status ),
        abogado:users!abogado_id ( id, name, email )
      `
      )
      .eq('lead_id', lead_id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existErr) throw existErr;

    if (existing) {
      // Ya hay un caso para este lead: devolvemos el existente (200)
      return NextResponse.json(
        { item: existing, message: 'Ya existía un caso para este lead' },
        { status: 200 }
      );
    }

    // 3) Crear caso
    const { data: created, error: createErr } = await supabaseAdmin
      .from('cases')
      .insert([
        {
          lead_id,
          abogado_id: abogado_id || null,
          estado, // 'nuevo' por defecto
          descripcion: descripcion || null,
        },
      ])
      .select(
        `
        id,
        short_code,
        estado,
        descripcion,
        created_at,
        lead:leads ( id, short_code, name, email, phone, source, channel, status ),
        abogado:users!abogado_id ( id, name, email )
      `
      )
      .single();

    if (createErr) throw createErr;

    // 4) Evento inicial en case_events (ingreso)
    await supabaseAdmin.from('case_events').insert([
      {
        case_id: created.id,
        type: 'ingreso', // válido por CHECK en case_events
        detail: `Caso creado desde lead ${lead.short_code ?? ''}`.trim(),
        event_data: {}, // jsonb
        // event_date y created_at tienen default
      },
    ]);

    // 5) Marcar lead como válido (si no lo estaba)
    if (lead.status !== 'valido') {
      await supabaseAdmin.from('leads').update({ status: 'valido' }).eq('id', lead_id);
    }

    return NextResponse.json(
      { item: created, message: 'Caso creado exitosamente' },
      { status: 201 }
    );
  } catch (e: any) {
    console.error('[cases POST] error', e);
    return NextResponse.json(
      { error: e?.message ?? 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
