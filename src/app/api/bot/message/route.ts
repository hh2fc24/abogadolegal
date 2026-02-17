// src/app/api/bot/message/route.ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import dns from 'node:dns';
import { randomUUID } from 'node:crypto';
import { sendLeadToXel } from '@/app/lib/xelIntake';

/* ===================== Config ===================== */
const MAX_HISTORY_MESSAGES = Number(process.env.MAX_HISTORY_MESSAGES || 30);
const MAX_INPUT_CHARS = 2000;
const GEMINI_MODEL = (process.env.GEMINI_MODEL || 'gemini-1.5-flash-latest').replace(/^['"]|['"]$/g, '');
const GEMINI_TEMPERATURE = Number(String(process.env.GEMINI_TEMPERATURE ?? 0.2).replace(/^['"]|['"]$/g, ''));
const GEMINI_MAX_TOKENS = Number(String(process.env.GEMINI_MAX_TOKENS ?? 500).replace(/^['"]|['"]$/g, ''));
const GEMINI_TOP_P = Number(String(process.env.GEMINI_TOP_P ?? 1).replace(/^['"]|['"]$/g, ''));
const GEMINI_API_VERSION = (process.env.GEMINI_API_VERSION || 'v1beta').replace(/^['"]|['"]$/g, '');
const SAVE_LEADS = (process.env.SAVE_LEADS ?? 'true').toLowerCase() === 'true';
const DEDUPE_WINDOW_HOURS = Number(process.env.LEADS_DEDUPE_H || 48);

let supabaseClient: ReturnType<typeof createClient> | null = null;
let cachedGemini: { model: string; apiVersion: string } | null = null;
let openaiClient: OpenAI | null = null;

// Helps avoid IPv6-first DNS issues that often surface as "TypeError: fetch failed".
dns.setDefaultResultOrder('ipv4first');

function getSupabaseClient() {
  if (supabaseClient) return supabaseClient;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Supabase env vars are missing.');
  }
  supabaseClient = createClient(supabaseUrl, supabaseServiceKey);
  return supabaseClient;
}

function getOpenAIClient() {
  if (openaiClient) return openaiClient;
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY is missing.');
  openaiClient = new OpenAI({ apiKey });
  return openaiClient;
}

/* =============== Prompt Comercial LEX =============== */
/** Perfil: Asistente Legal Virtual, empático y experto. */
const SYSTEM_PROMPT = `
Eres "Asistente Legal", la IA oficial de Abogado Legal (Chile).
Tu misión: captar datos y derivar a nuestros abogados expertos. Tono profesional, empático y breve (máx. 2 líneas).

SLOTS OBLIGATORIOS (en orden):
1) name
2) contact (email O phone válido)
3) motivo (Familia, Penal, Civil, Laboral, Deudas, etc.)
4) acreedor (Opcional, si aplica a deudas)
5) monto (Opcional, si aplica)
6) region
7) comuna

REGLAS:
- Una sola pregunta por turno.
- Validar contacto: email con formato y/o phone 8–15 dígitos.
- No prometer plazos ni resultados ("ganaremos el juicio"), solo evaluación.
- Cierre positivo y comercial cuando tengas los datos esenciales (nombre, contacto, motivo).

FORMATO LEAD OBLIGATORIO (UNA sola línea al final del cierre):
<LEAD>{"name":"...","email":"...","phone":"...","motivo":"...","acreedor":"...","monto":"...","region":"...","comuna":"..."}</LEAD>
`;

/* =================== Utilidades ==================== */
function trimTo(s: string, n: number): string {
  return s.length > n ? s.substring(0, n) : s;
}

function normEmail(email?: string | null): string | null {
  const v = (email ?? '').trim().toLowerCase();
  if (!v) return null;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? v : null;
}

function normPhone(phone?: string | null): string | null {
  const raw = (phone ?? '').replace(/[^\d]/g, ''); // sólo dígitos
  if (!raw) return null;
  if (raw.length < 8 || raw.length > 15) return null;
  return raw;
}

function normText(text?: string | null): string | null {
  const t = (text ?? '').trim();
  return t ? t.replace(/\s+/g, ' ') : null;
}

/** Parseo robusto de monto en CLP (ej: "10 millones", "300.000.000", "15m", "1,2 M"). */
function parseMontoToCLP(input?: string | null): number | null {
  if (!input) return null;
  let s = input.toString().toLowerCase().trim();

  // normalizar separadores
  s = s.replace(/\./g, '').replace(/,/g, '.'); // 300.000.000 → 300000000 ; 1,2 → 1.2
  const hasMillon = /(millones|millon|m\b)/i.test(s);

  const numMatch = s.match(/(\d+(\.\d+)?)/);
  if (!numMatch) return null;
  const base = parseFloat(numMatch[1]);
  if (isNaN(base) || base <= 0) return null;

  const value = hasMillon ? base * 1_000_000 : base;

  // límites sanos
  if (value < 1_000 || value > 100_000_000_000) return null;

  return Math.round(value);
}

function formatCLP(n?: number | null): string | null {
  if (!n || !Number.isFinite(n)) return null;
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(n);
}

function extractLeadBlock(text: string): any | null {
  const m = text.match(/<LEAD>\s*([\s\S]*?)\s*<\/LEAD>/i);
  if (!m) return null;
  try {
    return JSON.parse(m[1]);
  } catch {
    return null;
  }
}

type Msg = { role: 'system' | 'user' | 'assistant'; content: string };

type GeminiContent = { role: 'user' | 'model'; parts: Array<{ text: string }> };

const GEMINI_MODEL_ALIASES: Record<string, string> = {
  'gemini-1.5-flash': 'gemini-1.5-flash-latest',
};

const GEMINI_MODEL_PREFERENCES = [
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-1.5-flash-latest',
  'gemini-1.5-flash',
  'gemini-1.5-pro-latest',
  'gemini-1.5-pro',
  'gemini-pro',
  'gemini-1.0-pro',
];

function toGeminiContents(history: Msg[]): GeminiContent[] {
  return history
    .filter(m => m.role === 'user' || m.role === 'assistant')
    .map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));
}

function normalizeApiVersion(version: string) {
  return version.startsWith('v') ? version : `v${version}`;
}

function normalizeModelName(name: string) {
  return name.startsWith('models/') ? name.slice('models/'.length) : name;
}

async function listGeminiModels(apiKey: string, apiVersion: string) {
  const url = `https://generativelanguage.googleapis.com/${apiVersion}/models?key=${apiKey}`;
  let res: Response;
  try {
    res = await fetch(url, { method: 'GET' });
  } catch (err: any) {
    const cause = err?.cause;
    const detail = cause?.code ? `${cause.code}: ${cause.message ?? ''}` : (cause?.message ?? err?.message ?? 'fetch failed');
    throw new Error(`Gemini network error (list models): ${detail}`.trim());
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const error =
      data?.error?.message ||
      data?.error ||
      'Gemini list models failed.';
    throw new Error(error);
  }

  const models = Array.isArray(data?.models) ? data.models : [];
  return models
    .filter((m: any) => Array.isArray(m?.supportedGenerationMethods) && m.supportedGenerationMethods.includes('generateContent'))
    .map((m: any) => normalizeModelName(String(m?.name ?? '')))
    .filter((name: string) => name);
}

function pickPreferredModel(models: string[]) {
  for (const pref of GEMINI_MODEL_PREFERENCES) {
    const hit = models.find((m) => m === pref);
    if (hit) return hit;
  }
  return models[0] ?? null;
}

async function callGemini(
  apiKey: string,
  model: string,
  apiVersion: string,
  systemInstruction: string,
  contents: GeminiContent[]
) {
  const url = `https://generativelanguage.googleapis.com/${apiVersion}/models/${model}:generateContent?key=${apiKey}`;

  let res: Response;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { role: 'system', parts: [{ text: systemInstruction }] },
        contents,
        generationConfig: {
          temperature: Number.isFinite(GEMINI_TEMPERATURE) ? GEMINI_TEMPERATURE : 0.2,
          maxOutputTokens: Number.isFinite(GEMINI_MAX_TOKENS) ? GEMINI_MAX_TOKENS : 500,
          topP: Number.isFinite(GEMINI_TOP_P) ? GEMINI_TOP_P : 1,
        },
      }),
    });
  } catch (err: any) {
    const cause = err?.cause;
    const detail = cause?.code ? `${cause.code}: ${cause.message ?? ''}` : (cause?.message ?? err?.message ?? 'fetch failed');
    throw new Error(`Gemini network error (generateContent): ${detail}`.trim());
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const error =
      data?.error?.message ||
      data?.error ||
      'Gemini request failed.';
    throw new Error(error);
  }

  const parts = data?.candidates?.[0]?.content?.parts ?? [];
  const text = parts
    .map((p: any) => (typeof p?.text === 'string' ? p.text : ''))
    .join('');

  return text || 'Lo siento, no pude procesar tu solicitud.';
}

async function generateGeminiReply(systemInstruction: string, contents: GeminiContent[]) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY is missing.');

  if (cachedGemini) {
    try {
      return await callGemini(
        apiKey,
        cachedGemini.model,
        cachedGemini.apiVersion,
        systemInstruction,
        contents
      );
    } catch (err: any) {
      const msg = String(err?.message || '');
      if (!/not found|not supported/i.test(msg)) {
        throw err;
      }
      cachedGemini = null;
    }
  }

  const resolvedModel = GEMINI_MODEL_ALIASES[GEMINI_MODEL] ?? GEMINI_MODEL;
  const fallbackModels = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro', 'gemini-1.0-pro'].filter(
    (m) => m !== resolvedModel
  );

  const apiVersions = [normalizeApiVersion(GEMINI_API_VERSION), 'v1beta', 'v1'].filter(
    (v, i, arr) => arr.indexOf(v) === i
  );

  let lastError: Error | null = null;
  for (const apiVersion of apiVersions) {
    for (const model of [resolvedModel, ...fallbackModels]) {
      try {
        const reply = await callGemini(apiKey, model, apiVersion, systemInstruction, contents);
        cachedGemini = { model, apiVersion };
        return reply;
      } catch (err: any) {
        lastError = err instanceof Error ? err : new Error('Gemini request failed.');
        const msg = String(lastError.message || '');
        if (!/not found|not supported/i.test(msg)) break;
      }
    }

    try {
      const models = await listGeminiModels(apiKey, apiVersion);
      const picked = pickPreferredModel(models);
      if (picked) {
        cachedGemini = { model: picked, apiVersion };
        return await callGemini(apiKey, picked, apiVersion, systemInstruction, contents);
      }
    } catch (err) {
      // swallow and fall through to next version
    }
  }

  throw lastError ?? new Error('Gemini request failed.');
}

async function generateOpenAIReply(systemInstruction: string, history: Msg[]) {
  const client = getOpenAIClient();
  const model = (process.env.OPENAI_MODEL || 'gpt-4o-mini').replace(/^['"]|['"]$/g, '');

  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    { role: 'system', content: systemInstruction },
    ...history
      .filter((m) => m.role === 'user' || m.role === 'assistant')
      .map((m) => ({
        role: m.role,
        content: m.content,
      })),
  ];

  const completion = await client.chat.completions.create({
    model,
    temperature: Number.isFinite(GEMINI_TEMPERATURE) ? GEMINI_TEMPERATURE : 0.2,
    max_tokens: Number.isFinite(GEMINI_MAX_TOKENS) ? GEMINI_MAX_TOKENS : 500,
    messages,
  });

  return (
    completion.choices?.[0]?.message?.content ||
    'Lo siento, no pude procesar tu solicitud.'
  );
}

async function generateLLMReply(systemInstruction: string, history: Msg[]) {
  const provider = String(process.env.BOT_LLM_PROVIDER || 'auto')
    .trim()
    .toLowerCase();

  if (provider === 'gemini') {
    // Forzar Gemini (si falta key, respondemos con error claro)
    return generateGeminiReply(systemInstruction, toGeminiContents(history));
  }

  if (provider === 'openai') {
    // Forzar OpenAI
    return generateOpenAIReply(systemInstruction, history);
  }

  // auto: prioriza Gemini si existe, si no, usa OpenAI si existe
  if (process.env.GEMINI_API_KEY) {
    return generateGeminiReply(systemInstruction, toGeminiContents(history));
  }
  if (process.env.OPENAI_API_KEY) {
    return generateOpenAIReply(systemInstruction, history);
  }

  throw new Error('Missing LLM credentials: set GEMINI_API_KEY or OPENAI_API_KEY.');
}

function sniffSlots(history: Msg[]) {
  const all = history.map(m => m.content).join(' ').toLowerCase();

  const email = normEmail(all.match(/([^\s@]+@[^\s@]+\.[^\s@]+)/)?.[1] ?? null);
  const phone = normPhone(all.match(/(\+?[\d\-\s\(\)]{8,20})/)?.[1] ?? null);
  const name =
    normText(all.match(/(?:mi nombre es|me llamo|soy)\s+([a-záéíóúñ\s]{2,60})/i)?.[1] ?? null);

  // Acreedor sólo si se menciona explícitamente contextos de deuda
  const acreedor =
    normText(all.match(/\b(santander|ripley|scotiabank|bci|falabella|lider|bbva|itau|cmr|la\s*polar|banco)\b/i)?.[1] ?? null);

  // Motivos ampliados para Asistente Legal General
  const motivo =
    normText(
      all.match(/\b(dicom|cobranza|repactaci[oó]n|prescripci[oó]n|deuda|demanda|juicio|divorcio|herencia|testamento|sucesi[oó]n|despido|finiquito|tutel|custodia|pensi[oó]n|alimento|visitas|delito|estafa|robo|homicidio|lesiones|tr[áa]nsito|choque|contrato|arriendo|inmobiliario|penal|laboral|civil|familia)\b/i)?.[0] ??
      null
    );

  const montoText = all.match(/(\d[\d\.\,]*\s*(millones|millon|m\b)?)/i)?.[0] ?? null;
  const monto = parseMontoToCLP(montoText);

  // región/comuna: que el modelo las pida; sin heurística dura
  return { name, email, phone, motivo, acreedor, monto: monto ?? null, region: null as string | null, comuna: null as string | null };
}

function resolveNext(slots: { name: any; email: any; phone: any; motivo: any; acreedor: any; monto: any; region: any; comuna: any; }) {
  if (!slots.name) return 'name';
  if (!slots.email && !slots.phone) return 'contact';
  if (!slots.motivo) return 'motivo';

  // Acreedor y Monto ahora son OBSERVED pero NO BLOCKING si el motivo no es financiero.
  // Pero para simplificar el flujo general: si tenemos nombre, contacto y motivo, consideramos "básicos completos".
  // El LLM puede decidir pedir más detalles si el motivo es vago.
  // Forzamos región/comuna al final para routing geográfico.

  if (!slots.region) return 'region';
  if (!slots.comuna) return 'comuna';

  return 'close';
}

function slotsComplete(slots: ReturnType<typeof sniffSlots> & { region: any; comuna: any }) {
  // Ya no exigimos acreedor/monto para cerrar, solo los esenciales
  return Boolean(slots.name && (slots.email || slots.phone) && slots.motivo && slots.region && slots.comuna);
}

function buildMotivoRich(baseMotivo: string | null, extra: { acreedor?: string | null; montoCLP?: number | null; region?: string | null; comuna?: string | null }) {
  const parts: string[] = [];
  if (baseMotivo) parts.push(baseMotivo);
  if (extra.acreedor) parts.push(`Acreedor: ${extra.acreedor}`);
  if (extra.montoCLP) parts.push(`Monto aprox: ${formatCLP(extra.montoCLP)}`);
  if (extra.comuna || extra.region) parts.push(`Ubicación: ${[extra.comuna, extra.region].filter(Boolean).join(', ')}`);
  return parts.join(' | ') || null;
}

/* ============= Supabase helpers (con tu esquema) ============= */
async function getOrCreateConversation(conversationId?: string | null) {
  const supabase = getSupabaseClient();
  if (conversationId) {
    const { data } = await supabase
      .from('conversations')
      .select('id,messages')
      .eq('id', conversationId)
      .single();
    if (data) return { id: data.id as string, messages: (data as any).messages || [] };
  }
  const { data, error } = await supabase
    .from('conversations')
    .insert({ messages: [], status: 'active' })
    .select('id,messages')
    .single();
  if (error || !data) {
    console.error('[conversations insert] error', error);
    throw new Error(error?.message || 'No se pudo crear conversación');
  }
  return { id: data.id as string, messages: (data as any).messages || [] };
}

async function updateConversationMessages(conversationId: string, messages: any[]) {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from('conversations')
    .update({ messages })
    .eq('id', conversationId);
  if (error) throw new Error('No se pudo actualizar conversación');
}

async function findRecentDuplicate(email: string | null, phone: string | null) {
  if (!email && !phone) return null;
  const supabase = getSupabaseClient();
  const since = new Date(Date.now() - DEDUPE_WINDOW_HOURS * 3600 * 1000).toISOString();
  let q = supabase
    .from('leads')
    .select('id')
    .gte('created_at', since)
    .limit(1);
  if (email && phone) q = q.or(`email.eq.${email},phone.eq.${phone}`);
  else if (email) q = q.eq('email', email);
  else if (phone) q = q.eq('phone', phone);
  const { data } = await q;
  return data?.[0] ?? null;
}

async function upsertLeadFromSlots(slots: ReturnType<typeof sniffSlots> & { region: string | null; comuna: string | null }, conversationId: string) {
  if (!SAVE_LEADS) return { leadId: null, leadStatus: 'disabled' as const };
  const supabase = getSupabaseClient();

  const name = normText(slots.name);
  const email = normEmail(slots.email);
  const phone = normPhone(slots.phone);
  const motivo = normText(slots.motivo);
  const acreedor = normText(slots.acreedor);
  const region = normText(slots.region);
  const comuna = normText(slots.comuna);
  const monto = slots.monto ?? null;

  // mínimos para crear
  if (!name || (!email && !phone)) return { leadId: null, leadStatus: 'skipped' as const };

  // dedupe 48h
  const dup = await findRecentDuplicate(email, phone);
  if (dup) return { leadId: dup.id as string, leadStatus: 'deduped' as const };

  // motivo enriquecido (sin columnas nuevas)
  const motivoRich = buildMotivoRich(motivo, {
    acreedor,
    montoCLP: monto,
    region: region ?? undefined,
    comuna: comuna ?? undefined
  });

  const payload: any = {
    name,
    email,
    phone,
    motivo: motivoRich,
    source: 'bot',
    channel: 'bot',
    conversation_id: conversationId
  };

  const { data, error } = await supabase
    .from('leads')
    .insert(payload)
    .select('id')
    .single();

  if (error || !data) return { leadId: null, leadStatus: 'error' as const };
  return { leadId: data.id as string, leadStatus: 'inserted' as const };
}

/* ====================== Handler ====================== */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { message, conversationId, systemPrompt, history } = body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const trimmedMessage = trimTo(message.trim(), MAX_INPUT_CHARS);

    const historyProvided = Array.isArray(history);
    let currentHistory: Msg[] = historyProvided
      ? (history as any[])
        .map((m: any) => ({
          role: m?.role,
          content: String(m?.content ?? ''),
        }))
        .filter((m: any) => m && (m.role === 'user' || m.role === 'assistant' || m.role === 'system'))
      : [];

    let persistence: 'supabase' | 'none' = 'supabase';
    let conversation: { id: string; messages: any[] } = { id: typeof conversationId === 'string' && conversationId ? conversationId : randomUUID(), messages: [] };

    // Try Supabase persistence; if it fails, keep the bot working stateless using the provided history.
    try {
      const stored = await getOrCreateConversation(conversationId);
      conversation = stored;
      if (!historyProvided) currentHistory = (stored.messages || []) as Msg[];
    } catch (err) {
      persistence = 'none';
      console.warn('[api/bot/message] Supabase unavailable, running stateless:', err);
    }

    // Ensure the user's current message is present once.
    const last = currentHistory[currentHistory.length - 1];
    if (!(last?.role === 'user' && last.content === trimmedMessage)) {
      currentHistory.push({ role: 'user', content: trimmedMessage });
    }

    if (currentHistory.length > MAX_HISTORY_MESSAGES) {
      currentHistory = currentHistory.slice(-MAX_HISTORY_MESSAGES);
    }

    if (persistence === 'supabase') {
      try {
        await updateConversationMessages(conversation.id, currentHistory);
      } catch (err) {
        persistence = 'none';
        console.warn('[api/bot/message] Supabase update failed, continuing stateless:', err);
      }
    }

    // slots conocidos + siguiente paso
    const baseSlots = sniffSlots(currentHistory);
    // región/comuna aún no detectadas por heurística => null
    const slotsWithGeo = { ...baseSlots, region: null as string | null, comuna: null as string | null };
    const next = resolveNext(slotsWithGeo);

    // steering para evitar loops
    const steering = `KnownSlots: ${JSON.stringify({
      name: baseSlots.name ?? null,
      email: baseSlots.email ?? null,
      phone: baseSlots.phone ?? null,
      motivo: baseSlots.motivo ?? null,
      acreedor: baseSlots.acreedor ?? null,
      monto: baseSlots.monto ?? null,
      region: null,
      comuna: null
    })}\nPróximo paso: ${next}. Pregunta SOLO por ese slot y no repitas slots ya resueltos.`;

    // LLM
    const systemInstruction = `${systemPrompt || SYSTEM_PROMPT}\n\n${steering}`;
    let reply: string;
    try {
      reply = await generateLLMReply(systemInstruction, currentHistory);
    } catch (err: any) {
      const rawMsg = String(err?.message || 'LLM error');
      const provider = String(process.env.BOT_LLM_PROVIDER || 'auto').trim().toLowerCase();

      // Mensaje corto para el usuario final (no romper el chat)
      const userMessage =
        process.env.NODE_ENV === 'production'
          ? 'En este momento el asistente no está disponible. Déjanos tu email/teléfono y te contactamos, o escríbenos por WhatsApp.'
          : `Error del modelo (${provider}): ${rawMsg}`;

      console.error('[api/bot/message] llm error', err);

      return NextResponse.json(
        {
          conversationId: conversation.id,
          reply: userMessage,
          leadId: null,
          leadStatus: 'disabled',
          persistence,
          xelSync: null,
          xelLeadId: null,
        },
        { status: 200 }
      );
    }

    // guardar respuesta del bot
    currentHistory.push({ role: 'assistant', content: reply });
    if (currentHistory.length > MAX_HISTORY_MESSAGES) {
      currentHistory = currentHistory.slice(-MAX_HISTORY_MESSAGES);
    }
    if (persistence === 'supabase') {
      try {
        await updateConversationMessages(conversation.id, currentHistory);
      } catch (err) {
        persistence = 'none';
        console.warn('[api/bot/message] Supabase update failed after reply, continuing stateless:', err);
      }
    }

    // procesar LEAD desde respuesta
    let leadId: string | null = null;
    let leadStatus: 'inserted' | 'deduped' | 'skipped' | 'disabled' | 'error' = 'skipped';
    let xelSync: 'ok' | 'failed' | null = null;
    let xelLeadId: string | null = null;

    let leadBlock = extractLeadBlock(reply);

    // --------- AUTO-LEAD FALLBACK: si el modelo no lo emitió pero ya están los 7 slots ----------
    // Intento reconstruir slots completos leyendo *todo* el historial (incluida la última respuesta del usuario antes del cierre).
    // OJO: region/comuna sólo las tiene el modelo, pero si el modelo ya las preguntó y el usuario respondió, irán en history.
    // Aquí sólo activamos fallback si detectamos explícitamente que ya se preguntó y respondió.
    const fullText = currentHistory.map(m => m.content).join(' ').toLowerCase();
    const regionMatch = fullText.match(/\b(region|región)\s*:?\s*([a-záéíóúñ\s]{2,60})/i)?.[2] ?? null;
    const comunaMatch = fullText.match(/\bcomuna\s*:?\s*([a-záéíóúñ\s]{2,60})/i)?.[1] ?? null;

    const reconstructSlots = {
      ...baseSlots,
      region: normText(regionMatch),
      comuna: normText(comunaMatch)
    };

    if (!leadBlock && slotsComplete(reconstructSlots as any)) {
      // construimos LEAD compatible
      leadBlock = {
        name: reconstructSlots.name,
        email: reconstructSlots.email,
        phone: reconstructSlots.phone,
        motivo: reconstructSlots.motivo,
        acreedor: reconstructSlots.acreedor,
        monto: reconstructSlots.monto ? String(reconstructSlots.monto) : null,
        region: reconstructSlots.region,
        comuna: reconstructSlots.comuna
      };
      // añadimos un cierre amable (no repetimos saludo)
      const cierre = `Excelente, ${reconstructSlots.name}. Ya registré tu caso. Nuestro equipo de DeudaCero te contactará. Con nosotros sí es posible encontrar una salida.`;
      reply = `${reply}\n\n${cierre}\n<LEAD>${JSON.stringify(leadBlock)}</LEAD>`;
      // Guardamos esta respuesta aumentada en la conversación
      currentHistory.push({ role: 'assistant', content: reply });
      await updateConversationMessages(conversation.id, currentHistory);
    }
    // -------------------------------------------------------------------------------------------

    if (leadBlock) {
      if (persistence === 'supabase') {
        try {
          const result = await upsertLeadFromSlots(
            {
              name: leadBlock.name ?? baseSlots.name,
              email: leadBlock.email ?? baseSlots.email,
              phone: leadBlock.phone ?? baseSlots.phone,
              motivo: leadBlock.motivo ?? baseSlots.motivo,
              acreedor: leadBlock.acreedor ?? baseSlots.acreedor,
              monto: parseMontoToCLP(leadBlock.monto ?? (baseSlots.monto ? String(baseSlots.monto) : null)),
              region: normText(leadBlock.region) ?? null,
              comuna: normText(leadBlock.comuna) ?? null
            },
            conversation.id
          );
          leadId = result.leadId;
          leadStatus = result.leadStatus;
        } catch (err) {
          leadId = null;
          leadStatus = 'error';
          console.warn('[api/bot/message] lead upsert failed:', err);
        }
      } else {
        leadId = null;
        leadStatus = 'disabled';
      }

      const fullName = normText(leadBlock.name ?? baseSlots.name);
      const email = normEmail(leadBlock.email ?? baseSlots.email);
      const phone = normPhone(leadBlock.phone ?? baseSlots.phone);
      const motivoBase = normText(leadBlock.motivo ?? leadBlock.message ?? baseSlots.motivo);
      const acreedor = normText(leadBlock.acreedor ?? baseSlots.acreedor);
      const montoValue =
        parseMontoToCLP(leadBlock.monto ?? null) ?? (baseSlots.monto ?? null);
      const region = normText(leadBlock.region) ?? null;
      const comuna = normText(leadBlock.comuna) ?? null;
      const message = buildMotivoRich(motivoBase ?? null, {
        acreedor,
        montoCLP: montoValue,
        region: region ?? undefined,
        comuna: comuna ?? undefined,
      });

      if (fullName && email) {
        try {
          const xelResult = await sendLeadToXel({
            full_name: fullName,
            email,
            phone,
            rut: null,
            message,
            lead_type: 'consulta',
            origin: 'bot',
            conversation_id: conversation.id,
          });

          if (xelResult.ok) {
            xelSync = 'ok';
            xelLeadId = xelResult.lead_id ?? null;
            console.log('[xel][bot] lead synced', {
              status: xelResult.status,
              lead_id: xelResult.lead_id,
            });
          } else {
            xelSync = 'failed';
            console.warn('[xel][bot] lead sync failed', {
              status: xelResult.status,
            });
          }
        } catch (err) {
          xelSync = 'failed';
          console.warn('[xel][bot] lead sync error');
        }
      } else {
        xelSync = 'failed';
        console.warn('[xel][bot] lead sync skipped (missing email/full_name)');
      }
    }

    // limpiar respuesta visible
    const cleanReply = reply.replace(/<LEAD>[\s\S]*?<\/LEAD>/, '').trim();

    // Preparar datos del lead para que el frontend los envíe a Geimser
    let leadData = null;
    if (leadBlock) {
      leadData = {
        name: normText(leadBlock.name ?? baseSlots.name),
        email: normEmail(leadBlock.email ?? baseSlots.email),
        phone: normPhone(leadBlock.phone ?? baseSlots.phone),
        message: buildMotivoRich(
          normText(leadBlock.motivo ?? leadBlock.message ?? baseSlots.motivo),
          {
            acreedor: normText(leadBlock.acreedor ?? baseSlots.acreedor),
            montoCLP: parseMontoToCLP(leadBlock.monto ?? null) ?? (baseSlots.monto ?? null),
            region: normText(leadBlock.region) ?? null,
            comuna: normText(leadBlock.comuna) ?? null,
          }
        ),
      };
    }

    return NextResponse.json({
      conversationId: conversation.id,
      reply: cleanReply,
      leadData, // Send this to frontend
      persistence,
    });

  } catch (e) {
    console.error('[api/bot/message] error', e);
    const message =
      e instanceof Error
        ? e.message
        : 'Internal server error';
    const safeMessage = process.env.NODE_ENV === 'production' ? 'Internal server error' : message;
    return NextResponse.json({ error: safeMessage }, { status: 500 });
  }
}
