// src/app/api/bot/message/route.ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';

/* ===================== Config ===================== */
const MAX_HISTORY_MESSAGES = 50;

let supabaseClient: ReturnType<typeof createClient> | null = null;

function getSupabaseClient() {
  if (supabaseClient) return supabaseClient;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseServiceKey) throw new Error('Supabase env vars are missing.');
  supabaseClient = createClient(supabaseUrl, supabaseServiceKey);
  return supabaseClient;
}

/* =================== Utilidades ==================== */
function normText(text?: string | null): string | null {
  const t = (text ?? '').trim();
  return t ? t.replace(/\s+/g, ' ') : null;
}

function normEmail(email?: string | null): string | null {
  const v = (email ?? '').trim().toLowerCase();
  // Validacion laxa para permitir correos
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? v : null;
}

function normPhone(phone?: string | null): string | null {
  const raw = (phone ?? '').replace(/[^\d]/g, '');
  if (!raw || raw.length < 8) return null;
  return raw;
}

/* ============= Supabase Helpers ============= */
async function getOrCreateConversation(conversationId?: string | null) {
  const supabase = getSupabaseClient();
  if (conversationId) {
    const { data } = await supabase.from('conversations').select('id,messages').eq('id', conversationId).single();
    if (data) return { id: data.id as string, messages: (data as any).messages || [] };
  }
  const { data, error } = await supabase.from('conversations').insert({ messages: [], status: 'active' }).select('id,messages').single();
  if (error || !data) throw new Error('Error creando conversación');
  return { id: data.id as string, messages: (data as any).messages || [] };
}

async function updateConversationMessages(conversationId: string, messages: any[]) {
  const supabase = getSupabaseClient();
  await supabase.from('conversations').update({ messages }).eq('id', conversationId);
}

/* ====================== Lógica de Estado (Flow Engine) ====================== */
type FlowState = {
  step: 'GREETING' | 'WAITING_NAME' | 'WAITING_SERVICE' | 'WAITING_CONTACT' | 'WAITING_MESSAGE' | 'COMPLETED';
  data: {
    name?: string;
    service?: string;
    contact?: string;
    message?: string;
  };
};

// Analiza el historial para determinar el estado actual
function analyzeState(history: { role: string; content: string }[]): FlowState {
  const data: FlowState['data'] = {};

  // 1. Mensaje del sistema inicial o vacío
  if (history.length === 0) return { step: 'GREETING', data };

  // Heurística simple: iteramos el historial para ver qué hemos preguntado y qué han respondido.
  // Asumimos que el historial está en orden cronológico correcto.

  let currentStep: FlowState['step'] = 'WAITING_NAME'; // Empezamos esperando nombre porque el saludo inicial ya lo pide en el frontend

  // Recorrer mensajes para reconstruir estado
  // OJO: Esto es frágil si el historial es texto libre. 
  // Mejor estrategia: Buscar marcadores en las respuestas del ASISTENTE para saber qué preguntó.

  for (let i = 0; i < history.length; i++) {
    const msg = history[i];
    if (msg.role === 'assistant') {
      const content = msg.content.toLowerCase();
      if (content.includes('cuál es tu nombre')) currentStep = 'WAITING_NAME';
      else if (content.includes('trámite') || content.includes('materia') || content.includes('servicio')) currentStep = 'WAITING_SERVICE';
      else if (content.includes('email') || content.includes('teléfono') || content.includes('contactarte')) currentStep = 'WAITING_CONTACT';
      else if (content.includes('detalle') || content.includes('algo más')) currentStep = 'WAITING_MESSAGE';
      else if (content.includes('gracias') || content.includes('24 horas')) currentStep = 'COMPLETED';
    } else if (msg.role === 'user') {
      const txt = msg.content;
      // Asignar respuesta al paso activo
      if (currentStep === 'WAITING_NAME') {
        // Asumimos que lo que responde ES el nombre
        data.name = txt;
        // Avanzamos 'mentalmente' al siguiente paso para la siguiente iteración, 
        // pero el bucle continuará si hay más mensajes.
        // En realidad, el estado actual se define por la ULTIMA pregunta del asistente que NO tiene respuesta del usuario.
      }
      else if (currentStep === 'WAITING_SERVICE') data.service = txt;
      else if (currentStep === 'WAITING_CONTACT') data.contact = txt;
      else if (currentStep === 'WAITING_MESSAGE') data.message = txt;
    }
  }

  // Refinamiento: Determinar el paso REAL basado en qué datos tenemos y cuál fue el último mensaje.
  const lastMsg = history[history.length - 1];

  // Si el último mensaje fue del USER, nos toca procesarlo y avanzar.
  // Si el último mensaje fue del ASSISTANT, estamos esperando al user (el estado se mantiene).

  if (lastMsg.role === 'assistant') {
    // El asistente ya preguntó algo, el usuario no ha respondido. Mantenemos el step derivado.
    return { step: currentStep, data };
  }

  // El usuario acaba de responder. Procesamos esa respuesta.
  // Pero wait, 'analyzeState' se llama CON el mensaje nuevo del usuario ya en history (en el POST handler).
  // Así que 'currentStep' arriba indica qué PREGUNTÓ el asistente antes.

  // Si currentStep era WAITING_NAME y el usuario mandó mensaje -> data.name ya se llenó en el loop? 
  // No, el loop es acumulativo. 

  // Vamos a hacerlo más simple: state machine hardcoded
  // 1. Verificar si tenemos nombre.
  // 2. Verificar si tenemos servicio.
  // 3. Verificar si tenemos contacto.
  // 4. Verificar si tenemos mensaje (u omitir).

  // Problema: No sabemos si el texto "Juan" es nombre o servicio sin contexto.
  // Solución: Usar el último prompt del bot para interpretar el input del usuario.

  // Buscar la última pregunta del asistente
  const lastAssistantMsg = [...history].reverse().find(m => m.role === 'assistant');
  const lastUserMsg = history[history.length - 1]; // El mensaje actual

  if (!lastAssistantMsg) {
    // Caso raro: usuario habla primero sin saludo del bot?
    // Asumimos que está respondiendo al saludo inicial del frontend (nombre)
    return { step: 'WAITING_NAME', data: { name: lastUserMsg.content } }; // Interpretamos input como nombre
  }

  const q = lastAssistantMsg.content.toLowerCase();

  // Recopilar datos anteriores (no implementado full history parsing aquí para simplificar, confiamos en flujo lineal)
  // En un bot real stateless, necesitaríamos guardar el estado en DB o hidden fields.
  // Aquí, vamos a inferir "qué toca ahora" en el handler `POST`.

  return { step: 'GREETING', data }; // Placeholder, lógica real en el handler principal
}


/* ====================== Handler ====================== */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { message, conversationId, history } = body;

    if (!message || !message.trim()) return NextResponse.json({ error: 'Message required' }, { status: 400 });
    const userText = message.trim();

    // 1. Cargar Conversación
    let conversation = { id: conversationId || randomUUID(), messages: [] as any[] };
    let persistence = 'supabase';
    try {
      const stored = await getOrCreateConversation(conversationId);
      conversation = stored;
    } catch { persistence = 'none'; }

    // Reconstruir historial completo con el nuevo mensaje
    let currentHistory = Array.isArray(history) ? history : conversation.messages || [];
    // Asegurar que message está en history
    if (!currentHistory.length || currentHistory[currentHistory.length - 1].content !== userText) {
      currentHistory.push({ role: 'user', content: userText });
    }

    // 2. Determinar ESTADO ACTUAL basado en la última pregunta del asistente
    //    (Buscamos hacia atrás el último assistant message)
    let lastBotQ = "";
    for (let i = currentHistory.length - 2; i >= 0; i--) {
      if (currentHistory[i].role === 'assistant') {
        lastBotQ = currentHistory[i].content;
        break;
      }
    }

    // Si no hay pregunta previa, asumimos que es respuesta al saludo inicial (Problema)
    if (!lastBotQ) lastBotQ = "¿cuál es tu problema legal hoy?";


    // 3. Lógica de Transición (State Machine)
    let reply = "";
    let options: string[] = [];
    let leadData = null;
    let nextStep = "";

    const cleanQ = lastBotQ.toLowerCase();
    const cleanUserText = userText.toLowerCase();

    // -- LOGIC: EXCLUSIONES (Filtros de temas prohibidos)
    const forbiddenKeywords = ['violación', 'violacion', 'abuso sexual', 'menor de edad', 'narcotráfico', 'narcotrafico', 'estupefacientes', 'drogas', 'droga'];
    const isExcluded = forbiddenKeywords.some(k => cleanUserText.includes(k));

    if (isExcluded) {
      reply = "Lo sentimos, pero en Abogado Legal **no tomamos casos** relacionados con delitos sexuales, menores de edad, ni narcotráfico. Te recomendamos buscar un especialista en esa área.";
      // No options, leadData null. Conversation ends here.
    }
    else {

      // -- STATE: WAITING_PROBLEM (Respuesta al saludo inicial "¿cuál es tu problema?")
      // El frontend ahora inicia con "Cuéntame, ¿cuál es tu problema legal hoy?" y opciones.
      if (cleanQ.includes("problema") || cleanQ.includes("ayudarte") || cleanQ.includes("necesitas")) {
        // Guardamos el problema/servicio seleccionado
        // Solicitamos NOMBRE
        reply = "Entendido. Para derivarte con el especialista adecuado, por favor indícame tu **Nombre**.";
      }
      // -- STATE: WAITING_NAME (Respuesta a "¿cuál es tu nombre?")
      else if (cleanQ.includes("nombre")) {
        // Validamos nombre
        if (userText.length < 2) {
          reply = "Por favor, indícame un nombre válido para poder dirigirme a ti.";
        } else {
          reply = `Gracias, ${userText}. Para que un abogado te contacte, por favor indícame tu **Teléfono** o **Email** (ej: 912345678).`;
        }
      }
      // -- STATE: WAITING_CONTACT (Respuesta a contacto)
      else if (cleanQ.includes("teléfono") || cleanQ.includes("email") || cleanQ.includes("contactarte")) {
        // Validar contacto
        const isEmail = normEmail(userText);
        const isPhone = normPhone(userText);

        // if (!isEmail && !isPhone) {
        //   // Permitimos avanzar si parece un intento, o pedimos confirmar. 
        //   // Para ser "amable", si no es válido, insistimos suavemente una vez o aceptamos texto libre si es muy largo?
        //   // Mejor validación simple.
        //   reply = "Ese contacto no parece válido. Por favor ingresa un email (ej: nombre@gmail.com) o un teléfono (ej: 912345678).";
        // } else {
        //   reply = "Perfecto. Si deseas, puedes contarme más detalles de tu caso, o presionar 'Omitir' para finalizar.";
        //   options = ["Omitir"];
        // }
        // Validacion laxa para no trabar
        if (!isEmail && !isPhone && userText.length < 5) {
          reply = "Por favor ingresa un número de teléfono o email válido para poder contactarte.";
        } else {
          reply = "Perfecto. ¿Quieres agregar algún detalle sobre tu caso (ej: monto de la deuda, hace cuánto fue el despido, etc)? O puedes presionar 'Omitir'.";
          options = ["Omitir"];
        }
      }
      // -- STATE: WAITING_MESSAGE (Respuesta a detalle)
      else if (cleanQ.includes("detalle") || cleanQ.includes("omitir")) {
        // Ya tenemos todo. Generamos LEAD.
        reply = "¡Listo! Hemos recibido tu solicitud. Un abogado experto revisará tu caso y te contactará a la brevedad. ¡Gracias por confiar en Abogado Legal!";

        // RECOLECTAR DATOS DE TODO EL HISTORIAL
        const getAnswerTo = (keywords: string[]) => {
          // Buscamos el mensaje del usuario INMEDIATAMENTE DESPUÉS de una pregunta del bot con keywords
          for (let i = 0; i < currentHistory.length - 1; i++) {
            if (currentHistory[i].role === 'assistant') {
              const q = currentHistory[i].content.toLowerCase();
              if (keywords.some(k => q.includes(k))) {
                return currentHistory[i + 1]?.role === 'user' ? currentHistory[i + 1].content : null;
              }
            }
          }
          return null;
        };

        // 1. Problema (respuesta a "problema", "necesitas", etc) - Suele ser el primer mensaje del user
        const motivo = getAnswerTo(["problema", "ayudarte", "necesitas"]) || "Consulta General";

        // 2. Nombre (respuesta a "nombre")
        const name = getAnswerTo(["nombre"]) || "Usuario";

        // 3. Contacto (respuesta a "teléfono", "email")
        const contactRaw = getAnswerTo(["teléfono", "email", "contactarte"]) || "";
        const email = normEmail(contactRaw);
        const phone = normPhone(contactRaw);

        // 4. Detalle (mensaje actual)
        const finalMsg = userText.toLowerCase() === 'omitir' ? '' : userText;

        leadData = {
          name,
          email,
          phone,
          motivo,
          message: finalMsg,
          fuente: 'Chatbot' // metadata extra
        };

        // Enviamos el leadData en la respuesta JSON para que el frontend lo procese o lo enviamos directo a la API de leads aquí si quisiéramos.
        // El frontend hace el POST a /api/bot/lead, así que devolvemos leadData.
      }
      // -- STATE: COMPLETED
      else {
        // Si sigue hablando después del cierre
        reply = "Tus datos ya fueron recibidos. Un especialista te contactará pronto.";
      }
    } // End of exclusion check else block

    // 4. Guardar y Responder
    currentHistory.push({ role: 'assistant', content: reply, options }); // Guardamos options en history si queremos persistencia visual (supa soportará jsonb extra?)
    // Ojo: Supabase almacena JSONB, así que sí soporta campos extra.

    if (persistence === 'supabase') {
      try { await updateConversationMessages(conversation.id, currentHistory); }
      catch (e) { console.error('Error saving history', e); }
    }

    // Limpiar <LEAD> del reply visible
    const cleanReply = reply.replace(/<LEAD>[\s\S]*?<\/LEAD>/, '').trim();

    return NextResponse.json({
      conversationId: conversation.id,
      reply: cleanReply,
      options,
      leadData,
      persistence
    });

  } catch (e: any) {
    console.error('Error en bot handler', e);
    return NextResponse.json({ error: e.message || 'Error interno' }, { status: 500 });
  }
}

