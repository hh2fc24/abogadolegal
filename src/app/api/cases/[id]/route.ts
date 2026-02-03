// src/app/api/cases/[id]/route.ts
import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/app/lib/supabaseAdmin';

/* ================= GET: Obtener Caso ================= */
export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { id } = await ctx.params; // Next 15: params async
    if (!id) {
      return NextResponse.json({ error: 'El ID del caso es requerido' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('cases')
      .select(`
        id,
        short_code,
        estado,
        descripcion,
        nota_interna,
        created_at,
        lead:leads (
          id,
          short_code,
          name,
          email,
          phone,
          source,
          channel,
          status,
          created_at
        ),
        abogado:users!abogado_id (
          id,
          name,
          email,
          role
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      if ((error as any).code === 'PGRST116') {
        return NextResponse.json(
          { error: `No se encontró un caso con el ID: ${id}` },
          { status: 404 }
        );
      }
      throw error;
    }

    return NextResponse.json({ item: data }, { status: 200 });
  } catch (e: any) {
    console.error('[cases/[id] GET] error', e);
    return NextResponse.json({ error: e?.message ?? 'Error interno del servidor' }, { status: 500 });
  }
}

/* ================= PATCH: Actualizar Caso ================= */
export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { id } = await ctx.params; // Next 15: params async
    if (!id) {
      return NextResponse.json({ error: 'El ID del caso es requerido' }, { status: 400 });
    }

    const body = await req.json();
    // ahora permitimos nota_interna
    const allowedFields = new Set(['estado', 'descripcion', 'nota_interna', 'abogado_id']);

    const updateData = Object.fromEntries(
      Object.entries(body).filter(([k]) => allowedFields.has(k))
    );

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No hay campos válidos para actualizar' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('cases')
      .update(updateData)
      .eq('id', id)
      .select(`
        id,
        short_code,
        estado,
        descripcion,
        nota_interna,
        created_at,
        lead:leads (
          id,
          short_code,
          name,
          email,
          phone
        ),
        abogado:users!abogado_id (
          id,
          name,
          email
        )
      `)
      .single();

    if (error) throw error;

    return NextResponse.json({ item: data, message: 'Caso actualizado exitosamente' }, { status: 200 });
  } catch (e: any) {
    console.error('[cases/[id] PATCH] error', e);
    return NextResponse.json({ error: e?.message ?? 'Error interno del servidor' }, { status: 500 });
  }
}
