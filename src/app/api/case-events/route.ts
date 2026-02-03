import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/app/lib/supabaseAdmin';

// GET ?case_id=...
export async function GET(req: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const url = new URL(req.url);
    const case_id = url.searchParams.get('case_id');
    if (!case_id) return NextResponse.json({ ok: true, items: [] });

    const { data, error } = await supabaseAdmin
      .from('case_events')
      .select('id, case_id, type, detail, event_date, created_at')
      .eq('case_id', case_id)
      .order('event_date', { ascending: false })
      .limit(200);
    if (error) throw error;

    return NextResponse.json({ ok: true, items: data ?? [] });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}

// POST { case_id, type, detail, event_date? }
export async function POST(req: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { case_id, type, detail, event_date, event_data } = await req.json();
    if (!case_id || !type) throw new Error('case_id y type son requeridos');

    const { data, error } = await supabaseAdmin
      .from('case_events')
      .insert([{ case_id, type, detail, event_date, event_data: event_data ?? {} }])
      .select('id')
      .single();
    if (error) throw error;

    return NextResponse.json({ ok: true, id: data.id });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
