// src/app/api/files/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/app/lib/supabaseAdmin';

/** Normaliza parámetros (acepta owner_* o entity_*) */
function getOwnerParams(urlStr: string) {
  const url = new URL(urlStr);
  const owner_type =
    url.searchParams.get('owner_type') ?? url.searchParams.get('entity_type');
  const owner_id =
    url.searchParams.get('owner_id') ?? url.searchParams.get('entity_id');
  const id = url.searchParams.get('id');
  return { owner_type, owner_id, id };
}

/**
 * GET /api/files?owner_type=lead|case&owner_id=<uuid>
 * (También acepta entity_type/entity_id)
 * Lista archivos + URL firmada (1h)
 */
export async function GET(req: NextRequest) {
  try {
    const supabaseAdmin: any = getSupabaseAdmin();
    const db: any = supabaseAdmin;
    const { owner_type, owner_id } = getOwnerParams(req.url);

    if (!owner_type || !owner_id) {
      return NextResponse.json({ error: 'Faltan parámetros' }, { status: 400 });
    }

    const { data, error } = await db
      .from('file_attachments')
      .select('*')
      .eq('owner_type', owner_type)
      .eq('owner_id', owner_id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Firmar URLs (1 hora)
    const withUrls = await Promise.all(
      (data ?? []).map(async (f: any) => {
        const { data: s, error: e2 } = await supabaseAdmin.storage
          .from('attachments')
          .createSignedUrl(f.storage_path, 60 * 60);
        return {
          ...f,
          signed_url: s?.signedUrl ?? null,
          _err: e2?.message ?? null,
        };
      })
    );

    return NextResponse.json({ items: withUrls }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'Error' }, { status: 500 });
  }
}

/**
 * POST /api/files
 * Body:
 * { owner_type:'case'|'lead', owner_id: string, filename: string, mime_type?: string, size_bytes?: number, uploaded_by?: string }
 * (También acepta entity_type/entity_id)
 * Devuelve URL firmada para subir + crea registro provisional.
 */
export async function POST(req: NextRequest) {
  try {
    const supabaseAdmin: any = getSupabaseAdmin();
    const db: any = supabaseAdmin;
    const storageAny: any = supabaseAdmin.storage;
    const raw = await req.json();

    const owner_type: 'case' | 'lead' =
      raw.owner_type ?? raw.entity_type ?? null;
    const owner_id: string = raw.owner_id ?? raw.entity_id ?? null;

    const filename: string = raw.filename;
    const mime_type: string | null = raw.mime_type ?? null;
    const size_bytes: number | null = raw.size_bytes ?? null;
    const uploaded_by: string | null = raw.uploaded_by ?? null;

    if (!owner_type || !owner_id || !filename) {
      return NextResponse.json({ error: 'Faltan datos' }, { status: 400 });
    }

    const folder = owner_type === 'case' ? 'cases' : 'leads';
    const storage_path = `${folder}/${owner_id}/${Date.now()}-${filename}`;

    // URL firmada para SUBIR (PUT) — 1h
    const { data: signed, error: sErr } = await storageAny
      .from('attachments')
      .createSignedUploadUrl(storage_path, { upsert: false });
    if (sErr) throw sErr;

    // Registro provisional
    const { data: rec, error: recErr } = await db
      .from('file_attachments')
      .insert({
        owner_type,
        owner_id,
        storage_path,
        file_name: filename,
        file_type: mime_type,
        file_size: size_bytes,
        uploaded_by,
      })
      .select('*')
      .single();
    if (recErr) throw recErr;

    return NextResponse.json({ upload: signed, item: rec }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'Error' }, { status: 500 });
  }
}

/**
 * DELETE /api/files?id=<uuid>
 * Borra de storage y de la tabla
 */
export async function DELETE(req: NextRequest) {
  try {
    const supabaseAdmin: any = getSupabaseAdmin();
    const db: any = supabaseAdmin;
    const { id } = getOwnerParams(req.url);
    if (!id) return NextResponse.json({ error: 'Falta id' }, { status: 400 });

    const { data: file, error: fErr } = await db
      .from('file_attachments')
      .select('*')
      .eq('id', id)
      .single();
    if (fErr || !file) {
      return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
    }

    const { error: sErr } = await supabaseAdmin.storage
      .from('attachments')
      .remove([file.storage_path]);
    if (sErr) throw sErr;

    await db.from('file_attachments').delete().eq('id', id);

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'Error' }, { status: 500 });
  }
}
