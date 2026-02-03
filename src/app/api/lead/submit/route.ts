import { NextRequest, NextResponse } from 'next/server';
import { sendLeadToXel } from '@/app/lib/xelIntake';

function strOrNull(v: unknown) {
  const s = typeof v === 'string' ? v.trim() : '';
  return s.length ? s : null;
}

async function createLocalLead(req: NextRequest, input: {
  full_name: string;
  email: string;
  phone: string | null;
  message: string | null;
  source: string | null;
}) {
  const localPayload = {
    name: input.full_name,
    email: input.email,
    phone: input.phone,
    motivo: input.message,
    source: input.source === 'bot' ? 'bot' : 'form',
    channel: input.source === 'bot' ? 'bot' : 'landing',
    status: 'nuevo',
  };

  const url = new URL('/api/leads', req.url);
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(localPayload),
    cache: 'no-store',
  });

  const json = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, json };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));

    const full_name = strOrNull(body?.full_name);
    const email = strOrNull(body?.email);
    const phone = strOrNull(body?.phone);
    const rut = strOrNull(body?.rut);
    const message = strOrNull(body?.message);
    const lead_type = strOrNull(body?.lead_type);
    const source = strOrNull(body?.source);
    const origin = strOrNull(body?.origin) ?? source ?? 'form';
    const form_id = strOrNull(body?.form_id) ?? 'evaluacion';

    if (!full_name || !email) {
      return NextResponse.json(
        { ok: false, error: 'full_name and email are required.', status: 400 },
        { status: 400 }
      );
    }

    if (!lead_type) {
      return NextResponse.json(
        { ok: false, error: 'lead_type is required.', status: 400 },
        { status: 400 }
      );
    }

    const localRes = await createLocalLead(req, {
      full_name,
      email,
      phone,
      message,
      source,
    });

    if (!localRes.ok) {
      return NextResponse.json(
        {
          ok: false,
          error: localRes.json?.error || 'Local lead insert failed.',
          status: localRes.status,
        },
        { status: localRes.status }
      );
    }

    const xelResult = await sendLeadToXel({
      full_name,
      email,
      phone,
      rut,
      message,
      lead_type,
      origin,
      form_id,
    });

    if (!xelResult.ok) {
      console.warn('[xel] lead sync failed', {
        status: xelResult.status,
      });
      return NextResponse.json(
        { ok: false, error: xelResult.error, status: xelResult.status },
        { status: xelResult.status || 502 }
      );
    }

    console.log('[xel] lead synced', {
      status: xelResult.status,
      lead_id: xelResult.lead_id,
    });

    return NextResponse.json(
      { ok: true, lead_id: xelResult.lead_id },
      { status: 200 }
    );
  } catch (e: any) {
    console.error('[api/lead/submit] error', e);
    return NextResponse.json(
      { ok: false, error: e?.message || 'Internal server error', status: 500 },
      { status: 500 }
    );
  }
}
