// src/app/api/uploads/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/app/lib/database.types';
import { ATTACHMENTS_BUCKET } from '@/app/lib/uploads';

let supabaseClient: ReturnType<typeof createClient> | null = null;

function getSupabaseClient() {
  if (supabaseClient) return supabaseClient;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    throw new Error('Supabase env vars are missing.');
  }
  supabaseClient = createClient<Database>(supabaseUrl, serviceKey);
  return supabaseClient;
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> } // 👈 async params
) {
  try {
    const supabase = getSupabaseClient();
    const { id } = await params;                 // 👈 await
    if (!id) return NextResponse.json({ error: 'id requerido' }, { status: 400 });

    // 1) obtener storage_path para borrar del bucket
    const { data, error } = await supabase
      .from('file_attachments')
      .select('storage_path')
      .eq('id', id)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'No existe el adjunto' }, { status: 404 });
    }

    // 2) borrar del bucket (best-effort)
    await supabase.storage.from(ATTACHMENTS_BUCKET).remove([data.storage_path]);

    // 3) borrar fila
    const { error: delErr } = await supabase
      .from('file_attachments')
      .delete()
      .eq('id', id);

    if (delErr) {
      return NextResponse.json({ error: delErr.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e: any) {
    console.error('[uploads DELETE] fatal', e);
    return NextResponse.json({ error: e?.message ?? 'Error interno' }, { status: 500 });
  }
}
