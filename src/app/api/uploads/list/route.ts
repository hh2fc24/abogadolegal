import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/app/lib/database.types';

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

/**
 * GET /api/uploads/list?owner_type=lead|case&owner_id=uuid
 */
export async function GET(req: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const url = new URL(req.url);
    const owner_type = url.searchParams.get('owner_type') || '';
    const owner_id = url.searchParams.get('owner_id') || '';

    if (!owner_type || !owner_id) {
      return NextResponse.json({ error: 'owner_type y owner_id son requeridos' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('file_attachments')
      .select('*')
      .eq('owner_type', owner_type)
      .eq('owner_id', owner_id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ items: data ?? [] }, { status: 200 });
  } catch (e: any) {
    console.error('[uploads/list GET]', e);
    return NextResponse.json({ error: e?.message || 'Error interno' }, { status: 500 });
  }
}
