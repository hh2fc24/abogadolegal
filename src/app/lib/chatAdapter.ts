// Archivo: src/app/lib/chatAdapter.ts

type ChatRole = 'user' | 'assistant' | 'system';

type SendOptions = {
  userEmail?: string;
  systemPrompt?: string;
  history?: Array<{ role: ChatRole; content: string }>;
};

type BotResponse = {
  conversationId: string;
  reply: string;
  leadId?: string | null;
  leadStatus?: 'inserted' | 'deduped' | 'skipped' | 'disabled' | 'error';
  persistence?: 'supabase' | 'none';
  leadData?: {
    name: string;
    email: string | null;
    phone: string | null;
    message: string | null;
  } | null;
};

const KEY = 'dc_conversation_id';

export function getConversationId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(KEY);
}

export function setConversationId(id: string | null) {
  if (typeof window === 'undefined') return;
  if (!id) return;
  localStorage.setItem(KEY, id);
}

export function resetConversation() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(KEY);
}

export async function sendBotMessage(message: string, opts: SendOptions = {}): Promise<BotResponse> {
  const conversationId = getConversationId();

  const payload: any = {
    message,
    conversationId: conversationId || null,
  };

  if (opts.systemPrompt) payload.systemPrompt = opts.systemPrompt;

  if (opts.history && Array.isArray(opts.history)) {
    const safeHistory = opts.history
      .filter(
        (m) =>
          m &&
          typeof m.content === 'string' &&
          (m.role === 'user' || m.role === 'assistant' || m.role === 'system')
      )
      .map((m) => ({ role: m.role, content: m.content }));
    if (safeHistory.length) payload.history = safeHistory;
  }

  let res: Response;
  try {
    res = await fetch('/api/bot/message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'fetch_failed';
    throw new Error(`No se pudo conectar con el servidor del bot (${msg}).`);
  }

  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    const detail = (json as any)?.error || res.statusText || 'Error en la API del bot';
    throw new Error(detail);
  }

  if (json.conversationId && json.conversationId !== conversationId) {
    setConversationId(json.conversationId);
  }

  return json as BotResponse;
}

export function extractLeadBlock(text: string): object | null {
  const match = text.match(/<LEAD>([\s\S]*?)<\/LEAD>/);
  if (!match) return null;
  try {
    return JSON.parse(match[1]);
  } catch {
    return null;
  }
}

/**
 * Marca una conversación con un estado dado (por defecto, 'success').
 * Acepta: 'success' | 'needs_review'
 */
export async function saveConversationForReview(
  conversationId: string | null,
  status: 'success' | 'needs_review' = 'success'
) {
  if (!conversationId) return;

  try {
    const res = await fetch(`/api/conversations/${conversationId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });

    if (!res.ok) {
      const errorBody = await res.json().catch(() => ({}));
      console.error('Error al actualizar estado de conversación:', errorBody.error || res.statusText);
    } else {
      console.log(`Conversación ${conversationId} marcada como ${status}.`);
    }
  } catch (error) {
    console.error('Error de red al actualizar conversación:', error);
  }
}
