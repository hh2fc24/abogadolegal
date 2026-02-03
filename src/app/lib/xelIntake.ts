export type XelLeadPayload = {
  full_name: string;
  email: string;
  phone?: string | null;
  rut?: string | null;
  message?: string | null;
  lead_type: string;
  source?: string | null;
  origin?: 'bot' | 'form' | string | null;
  conversation_id?: string | null;
  form_id?: string | null;
};

export type XelLeadResult =
  | { ok: true; lead_id: string | null; status: number }
  | { ok: false; error: string; status: number };

export async function sendLeadToXel(payload: XelLeadPayload): Promise<XelLeadResult> {
  const url = process.env.XEL_INTAKE_URL ?? 'https://www.xel.cl/api/intake/deudacero-lead';
  const token = process.env.XEL_INTAKE_TOKEN;

  if (!token) {
    return { ok: false, error: 'XEL_INTAKE_TOKEN is missing.', status: 500 };
  }

  const source = payload.source || 'website_deudascero';
  const body = {
    source,
    origin: payload.origin ?? null,
    full_name: payload.full_name,
    nombre_completo: payload.full_name,
    email: payload.email,
    phone: payload.phone ?? null,
    telefono: payload.phone ?? null,
    rut: payload.rut ?? null,
    message: payload.message ?? null,
    mensaje: payload.message ?? null,
    lead_type: payload.lead_type,
    tipo_lead: payload.lead_type,
    conversation_id: payload.conversation_id ?? null,
    form_id: payload.form_id ?? null,
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  const raw = await res.text();
  let data: any = null;
  try {
    data = raw ? JSON.parse(raw) : null;
  } catch {
    data = null;
  }

  if (!res.ok) {
    const error =
      (typeof data?.error === 'string' && data.error) ||
      (typeof data?.message === 'string' && data.message) ||
      raw ||
      'XEL request failed.';
    return { ok: false, error, status: res.status };
  }

  const lead_id = data?.lead_id ?? data?.id ?? null;
  return { ok: true, lead_id, status: res.status };
}
