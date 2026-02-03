// src/app/api/chat/route.ts
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { getSupabaseAdmin } from '@/app/lib/supabaseAdmin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const SYSTEM_PROMPT = `
Eres un asistente virtual para captar y calificar leads legales.
Objetivo: entender brevemente el caso y captar datos mínimos (nombre, email, teléfono, comuna, objetivo).
Reglas:
- Tono empático y profesional; no prometas tiempos ni resultados.
- Cada caso se evalúa de forma particular.
- Pregunta de a una cosa; si ya hay datos suficientes, genera el lead.
- Nunca entregues asesoría legal definitiva, solo orienta y deriva.
`;

/* ─────────────── Tipos ─────────────── */
type ChatMsg = OpenAI.Chat.Completions.ChatCompletionMessageParam;
type IncomingMsg = { role: unknown; content: unknown };

/* ─────────────── Utils ─────────────── */
function toOpenAIMessage(raw: unknown): ChatMsg | null {
  const m = raw as IncomingMsg;
  if (!m || typeof m !== 'object') return null;

  const role = String((m as { role?: unknown }).role ?? '');
  const content = String((m as { content?: unknown }).content ?? '');

  // ⛔️ Solo dejamos roles system/user/assistant — nada de function/tool (evita exigir name)
  if (role === 'system') return { role: 'system', content };
  if (role === 'user') return { role: 'user', content };
  if (role === 'assistant') return { role: 'assistant', content };

  return null;
}

function normEmail(v?: string | null): string | null {
  const s = (v ?? '').trim().toLowerCase();
  if (!s) return null;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s) ? s : null;
}
function normPhone(v?: string | null): string | null {
  const s = (v ?? '').replace(/[^\d+]/g, '');
  if (!s) return null;
  const digits = s.replace(/\D/g, '');
  if (digits.length < 8 || digits.length > 15) return null;
  return s;
}
function normText(v?: string | null): string {
  return (v ?? '').trim();
}

/* ─────────────── Handler ─────────────── */
export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'OPENAI_API_KEY is missing.' }, { status: 500 });
    }

    const client = new OpenAI({ apiKey });
    const MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';
    const SAVE_LEADS = (process.env.SAVE_LEADS ?? 'true').toLowerCase() === 'true';

    const body: unknown = await req.json();
    const incomingRaw = (body as { messages?: unknown })?.messages;

    const incomingArray: unknown[] = Array.isArray(incomingRaw) ? incomingRaw : [];

    const userMessages: ChatMsg[] = incomingArray
      .map((r: unknown) => toOpenAIMessage(r))
      .filter((m: ChatMsg | null): m is ChatMsg => m !== null);

    const messages: ChatMsg[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...userMessages,
    ];

    // Tipado sin any: usa el tipo del SDK y castea el literal
    const tools = [
      {
        type: 'function' as const,
        function: {
          name: 'capture_lead',
          description:
            'Captura datos del lead (intent, nombre, email, telefono, comuna, objetivo).',
          parameters: {
            type: 'object',
            properties: {
              intent: { type: 'string', enum: ['info', 'cita', 'desinteres'] },
              nombre: { type: 'string' },
              email: { type: 'string' },
              telefono: { type: 'string' },
              comuna: { type: 'string' },
              objetivo: { type: 'string' },
            },
            required: ['intent'],
            additionalProperties: false,
          },
        },
      },
    ] as OpenAI.Chat.Completions.ChatCompletionTool[];

    const completion = await client.chat.completions.create({
      model: MODEL,
      temperature: 0.5,
      messages,
      tools,
      tool_choice: 'auto',
    });

    const assistantMsg = completion.choices[0]?.message;
    const reply: string =
      (assistantMsg?.content as string) ??
      '¿Podrías compartirme tu nombre, correo, teléfono y comuna para avanzar?';

    let lead: {
      intent?: 'info' | 'cita' | 'desinteres';
      nombre?: string;
      email?: string | null;
      telefono?: string | null;
      comuna?: string;
      objetivo?: string;
      id?: string;
    } | null = null;

    if (assistantMsg?.tool_calls && assistantMsg.tool_calls.length > 0) {
      const call = assistantMsg.tool_calls.find((c) => c.type === 'function');
      const rawArgs: string | undefined = call?.function?.arguments;

      if (rawArgs) {
        try {
          const parsed = JSON.parse(rawArgs) as {
            intent?: 'info' | 'cita' | 'desinteres';
            nombre?: string | null;
            email?: string | null;
            telefono?: string | null;
            comuna?: string | null;
            objetivo?: string | null;
          };

          const intent = parsed.intent ?? undefined;
          const nombre = normText(parsed.nombre ?? '');
          const email = normEmail(parsed.email ?? null);
          const telefono = normPhone(parsed.telefono ?? null);
          const comuna = normText(parsed.comuna ?? '');
          const objetivo = normText(parsed.objetivo ?? '');

          lead = { intent, nombre, email, telefono, comuna, objetivo };

          // Persistir si hay datos mínimos (nombre + email o teléfono)
          if (SAVE_LEADS && nombre && (email || telefono)) {
            const supabaseAdmin = getSupabaseAdmin();
            const { data, error } = await supabaseAdmin
              .from('leads')
              .insert({
                intent,
                name: nombre,
                email,
                phone: telefono,
                comuna,
                objetivo,
                source: 'web_chat',
              })
              .select('id')
              .single();

            if (!error && data?.id) {
              lead.id = data.id;
            }
          }
        } catch {
          // Si falla el parse, no rompemos el flujo
        }
      }
    }

    return NextResponse.json({ reply, lead });
  } catch (err) {
    console.error('[api/chat] error', err);
    const msg = err instanceof Error ? err.message : 'internal_error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
