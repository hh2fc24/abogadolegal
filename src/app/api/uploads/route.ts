// src/app/api/uploads/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/app/lib/database.types';
import { ATTACHMENTS_BUCKET, MAX_FILE_SIZE, ALLOWED_MIME } from '@/app/lib/uploads';

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

export async function POST(req: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const form = await req.formData();
    const owner_type = String(form.get('owner_type') || '').trim();
    const owner_id = String(form.get('owner_id') || '').trim();
    const files = form.getAll('files') as File[];

    if (!owner_type || !owner_id) {
      return NextResponse.json({ error: 'owner_type y owner_id son requeridos' }, { status: 400 });
    }
    if (!files.length) {
      return NextResponse.json({ error: 'No se adjuntaron archivos' }, { status: 400 });
    }

    for (const f of files) {
      if (f.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: `El archivo ${f.name} supera ${Math.round(MAX_FILE_SIZE / (1024*1024))}MB` },
          { status: 400 }
        );
      }
      if (f.type && !ALLOWED_MIME.includes(f.type)) {
        return NextResponse.json({ error: `Tipo no permitido: ${f.type} (${f.name})` }, { status: 400 });
      }
    }

    const inserted: Database['public']['Tables']['file_attachments']['Row'][] = [];

    for (const file of files) {
      const safeName = file.name.replace(/\s+/g, '-');
      const objectPath = `${owner_type}/${owner_id}/${Date.now()}-${safeName}`;

      // 👇 convertir a Uint8Array (fiable en Node/Edge)
      const ab = await file.arrayBuffer();
      const bytes = new Uint8Array(ab);

      const { error: upErr } = await supabase.storage
        .from(ATTACHMENTS_BUCKET)
        .upload(objectPath, bytes, {
          contentType: file.type || undefined,
          upsert: false,
        });

      if (upErr) {
        console.error('[uploads POST][storage.upload]', upErr);
        return NextResponse.json({ error: `Storage: ${upErr.message}` }, { status: 500 });
      }

      const { data: row, error: insErr } = await supabase
        .from('file_attachments')
        .insert({
          owner_type,
          owner_id,
          file_name: file.name,
          file_type: file.type || null,
          file_size: file.size,
          storage_path: objectPath,
        })
        .select('*')
        .single();

      if (insErr) {
        console.error('[uploads POST][insert file_attachments]', insErr);
        // limpieza best-effort
        await supabase.storage.from(ATTACHMENTS_BUCKET).remove([objectPath]);
        return NextResponse.json({ error: `DB: ${insErr.message}` }, { status: 500 });
      }

      inserted.push(row);
    }

    return NextResponse.json({ items: inserted }, { status: 201 });
  } catch (e: any) {
    console.error('[uploads POST] fatal', e);
    return NextResponse.json({ error: e?.message || 'Error interno' }, { status: 500 });
  }
}
