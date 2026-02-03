import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/app/lib/supabaseAdmin';

// GET: listar logs por lead_id o case_id
export async function GET(req: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const url = new URL(req.url);
    const lead_id = url.searchParams.get('lead_id');
    const case_id = url.searchParams.get('case_id');
    const limit = parseInt(url.searchParams.get('limit') || '200');

    let query = supabaseAdmin
      .from('contact_logs')
      .select(`
        id,
        lead_id,
        case_id,
        by_user,
        channel,
        outcome,
        notes,
        contacted_at,
        user:users!by_user (
          id,
          name,
          email
        )
      `)
      .order('contacted_at', { ascending: false })
      .limit(limit);

    if (lead_id) query = query.eq('lead_id', lead_id);
    if (case_id) query = query.eq('case_id', case_id);

    const { data, error } = await query;
    if (error) {
      console.error('[contact-logs GET] Supabase error:', error);
      throw error;
    }

    return NextResponse.json({ 
      ok: true, 
      items: data ?? [],
      count: data?.length ?? 0
    });
  } catch (e: any) {
    console.error('[contact-logs GET] error', e);
    return NextResponse.json({ 
      ok: false, 
      error: e.message ?? 'Error interno del servidor' 
    }, { status: 500 });
  }
}

// POST: crear un nuevo log de contacto
export async function POST(req: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const body = await req.json();
    const {
      lead_id,
      case_id,
      by_user,
      channel,
      outcome,
      notes,
      contacted_at
    } = body;

    // Validaciones básicas
    if (!by_user || !channel) {
      return NextResponse.json({ 
        ok: false, 
        error: 'Los campos by_user y channel son requeridos' 
      }, { status: 400 });
    }

    if (!lead_id && !case_id) {
      return NextResponse.json({ 
        ok: false, 
        error: 'Debe especificar lead_id o case_id' 
      }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('contact_logs')
      .insert([{
        lead_id: lead_id || null,
        case_id: case_id || null,
        by_user,
        channel,
        outcome: outcome || null,
        notes: notes || null,
        contacted_at: contacted_at || new Date().toISOString()
      }])
      .select(`
        id,
        lead_id,
        case_id,
        by_user,
        channel,
        outcome,
        notes,
        contacted_at,
        user:users!by_user (
          id,
          name,
          email
        )
      `)
      .single();

    if (error) {
      console.error('[contact-logs POST] Supabase error:', error);
      throw error;
    }

    return NextResponse.json({ 
      ok: true, 
      item: data,
      message: 'Log de contacto creado exitosamente'
    }, { status: 201 });

  } catch (e: any) {
    console.error('[contact-logs POST] error', e);
    return NextResponse.json({ 
      ok: false, 
      error: e.message ?? 'Error interno del servidor' 
    }, { status: 500 });
  }
}
