// Archivo CORREGIDO: src/app/api/conversations/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/app/lib/supabaseAdmin';

// Esta función manejará las peticiones para actualizar una conversación
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    // ✅ CORREGIDO: await params antes de usar sus propiedades (Next.js 15)
    const { id } = await params;
    const { status } = await request.json();

    if (!id || !status) {
      return NextResponse.json({ error: 'ID de conversación y estado son requeridos' }, { status: 400 });
    }

    // ✅ CORREGIDO: Valores permitidos según el constraint real de tu base de datos
    const validStatuses = ['active', 'success', 'failed'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ 
        error: `Estado inválido. Debe ser uno de: ${validStatuses.join(', ')}` 
      }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('conversations')
      .update({ status: status })
      .eq('id', id);

    if (error) {
      throw error;
    }

    return NextResponse.json({ ok: true, message: 'Estado de la conversación actualizado.' });

  } catch (e: any) {
    console.error(`Error en PATCH /api/conversations/[id]:`, e);
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
