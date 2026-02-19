// File: src/app/components/Chatbot.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { MessageCircle, Send, X } from "lucide-react";
import { sendBotMessage, saveConversationForReview } from "@/app/lib/chatAdapter";

type Message = {
  role: "user" | "assistant";
  content: string;
  options?: string[]; // Opciones para chips clicables
};

/**
 * PROMPT COMERCIAL ROBUSTO
 * (Este prompt se usa en el backend, pero mantenemos la referencia aquí si es necesario
 * aunque la lógica principal se moverá al servidor).
 */
const SYSTEM_PROMPT = `Eres "Asistente Legal", la IA oficial de Abogado Legal (Chile).
Tu objetivo es captar leads con un flujo GUIADO Y AMABLE.

ETAPAS OBLIGATORIAS (en orden):
1. NOMBRE: Pide el nombre del usuario.
2. SERVICIO: Ofrece opciones (Tu Quiebra, Familia, Civil, Laboral, Penal).
3. CONTACTO: Pide email o teléfono para contactar en 24h hábiles.
4. MENSAJE: Pregunta si quiere agregar algún detalle adicional o prefiere omitir.
5. CIERRE: Confirma que un abogado lo contactará en 24 horas hábiles.

REGLAS:
- Sé breve y cordial.
- Si el usuario selecciona una opción, reconócela y pasa a lo siguiente.
- Al final, cuando tengas todos los datos, genera el bloque <LEAD>...`;

const TypingIndicator = () => (
  <div className="flex justify-start">
    <div className="bg-gray-100 text-gray-900 max-w-[85%] rounded-2xl px-4 py-3 text-sm flex items-center space-x-2 border border-gray-200">
      <div className="w-1.5 h-1.5 bg-legal-navy/60 rounded-full animate-pulse [animation-delay:0.1s]" />
      <div className="w-1.5 h-1.5 bg-legal-navy/60 rounded-full animate-pulse [animation-delay:0.2s]" />
      <div className="w-1.5 h-1.5 bg-legal-navy/60 rounded-full animate-pulse [animation-delay:0.3s]" />
    </div>
  </div>
);

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [msgs, setMsgs] = useState<Message[]>([
    {
      role: "assistant",
      content: "¡Hola! Soy el Asistente Legal. 👋\n\nCuéntame, **¿cuál es tu problema legal hoy?** Selecciona una opción:",
      options: [
        "Borrar Deuda / Embargos",
        "Tramitar Divorcio",
        "Pensión de Alimentos",
        "Despido Injustificado",
        "Herencias / Posesión",
        "Arriendo / Desalojo",
        "Delito / Penal"
      ]
    },
  ]);
  const [unread, setUnread] = useState(0);
  const [showNudge, setShowNudge] = useState(false);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, isTyping, open]);

  // Nudge primera visita
  useEffect(() => {
    const seen = sessionStorage.getItem("lex_seen");
    if (!seen) {
      const t = setTimeout(() => setShowNudge(true), 1000);
      const t2 = setTimeout(() => setShowNudge(false), 9000);
      return () => {
        clearTimeout(t);
        clearTimeout(t2);
      };
    }
  }, []);

  // Badge no leídos
  useEffect(() => {
    if (!open && msgs.length > 0) {
      const last = msgs[msgs.length - 1];
      if (last.role === "assistant") setUnread((u) => u + 1);
    }
  }, [msgs, open]);

  // Hotkeys
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const key = typeof e.key === "string" ? e.key : "";
      if (!key) return;
      if (key === "Escape" && open) setOpen(false);
      if ((key === "l" || key === "L") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        toggleOpen();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open]);

  function toggleOpen() {
    setOpen((v) => {
      const next = !v;
      if (next) {
        setUnread(0);
        setShowNudge(false);
        sessionStorage.setItem("lex_seen", "1");
        setTimeout(() => inputRef.current?.focus(), 50);
      }
      return next;
    });
  }

  async function sendText(textOverride?: string) {
    const text = (textOverride || input).trim();
    if (!text || isTyping) return;

    setInput("");
    const userMessage: Message = { role: "user", content: text };
    const newHistory = [...msgs, userMessage];
    setMsgs(newHistory);
    setIsTyping(true);

    try {
      const replyData = await sendBotMessage(text, {
        systemPrompt: SYSTEM_PROMPT,
        history: newHistory.map((m) => ({ role: m.role, content: m.content })),
      });
      const { reply, conversationId } = replyData;

      // Si viene leadData, lo enviamos a Geimser (server-to-server via /api/bot/lead)
      if (replyData.leadData) {
        try {
          const ingestRes = await fetch('/api/bot/lead', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...replyData.leadData,
              meta: {
                page: window.location.pathname,
                title: document.title,
                source: 'bot_guided'
              }
            }),
          });

          const ingestJson = await ingestRes.json();
          if (!ingestRes.ok || !ingestJson.ok) {
            console.error('Error enviando lead a Geimser:', ingestJson.error);
          } else {
            console.log('✅ Lead enviado a Geimser correctamente');
          }
        } catch (err) {
          console.error('Error de red al enviar lead a Geimser:', err);
        }
      }

      setIsTyping(false);
      // Intentamos parsear opciones del texto de respuesta (formato custom o metadatos)
      // Por ahora, asumiremos que el backend puede devolver 'options' en replyData si modificamos chatAdapter,
      // O podemos inferirlas del texto si el backend usa un formato especial.
      // Vamos a modificar chatAdapter para que traiga 'options'.

      const botMsg: Message = {
        role: "assistant",
        content: reply || "",
        options: replyData.options // Asumimos que replyData traerá options
      };

      setMsgs([...newHistory, botMsg]);

      if (replyData.leadData && conversationId) {
        await saveConversationForReview(conversationId, "success");
      }
    } catch (e) {
      console.error("Error en el chat:", e);
      setIsTyping(false);
      setMsgs((curr) => [
        ...curr,
        {
          role: "assistant",
          content: "Disculpa, tuve un problema. ¿Podrías intentar nuevamente?",
        },
      ]);
    }
  }

  function send() {
    sendText();
  }

  return (
    <>
      {/* Nudge teaser */}
      {showNudge && (
        <div className="fixed bottom-24 right-5 z-[60] max-w-[260px] animate-fade-in-up">
          <div className="rounded-2xl border border-legal-gold-500/20 bg-white px-4 py-3 text-sm text-legal-navy shadow-[0_8px_24px_rgba(12,24,52,0.15)]">
            <div className="mb-1 font-semibold text-legal-navy">¿Necesitas asesoría legal?</div>
            <div className="text-gray-600">
              Nuestro <span className="font-bold text-legal-gold-600">Asistente Virtual</span> puede evaluar tu caso ahora.
            </div>
          </div>
        </div>
      )}

      {/* Launcher */}
      <button
        onClick={toggleOpen}
        aria-label="Abrir chat de asistencia"
        className="fixed bottom-5 right-5 z-[65] group flex items-center gap-3 rounded-full bg-legal-navy px-5 py-3 text-white shadow-xl ring-1 ring-white/20 transition hover:brightness-110 hover:scale-[1.02] animate-lex-pulse border border-legal-gold-500/50"
      >
        <span className="relative inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/10">
          <MessageCircle size={22} className="text-legal-gold-500" />
          <span className="pointer-events-none absolute inset-0 rounded-full ring-2 ring-white/10 group-hover:ring-legal-gold-500/50" />
          {unread > 0 && (
            <span className="absolute -right-1 -top-1 min-w-[18px] rounded-full bg-red-600 px-1.5 text-[10px] font-semibold leading-5 text-white">
              {unread}
            </span>
          )}
        </span>
        <span className="relative z-10 text-sm font-semibold tracking-tight">
          Asistencia <span className="hidden sm:inline">Legal 24/7</span>
        </span>
      </button>

      {/* Ventana */}
      {open && (
        <div className="fixed bottom-20 right-5 z-[70] flex h-[min(640px,calc(100vh-120px))] w-[min(420px,calc(100vw-40px))] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white text-gray-900 shadow-[0_16px_60px_rgba(12,24,52,0.25)] animate-fade-in-up sm:h-[min(680px,calc(100vh-120px))] sm:w-[420px] max-sm:fixed max-sm:inset-0 max-sm:rounded-none max-sm:border-0">
          {/* Header */}
          <header className="flex flex-shrink-0 items-center justify-between border-b border-gray-100 bg-legal-navy px-4 py-4 text-white">
            <div className="flex items-center gap-3">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-legal-gold-500 shadow-sm ring-1 ring-white/20">
                <MessageCircle size={20} />
              </div>
              <div className="leading-tight">
                <div className="text-sm font-bold">Asistente Legal</div>
                <div className="text-[11px] text-gray-300">Abogado Legal Chile</div>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="rounded-md p-1 text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
              aria-label="Cerrar chat"
            >
              <X size={20} />
            </button>
          </header>

          {/* Conversación */}
          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-3 bg-gray-50/50">
            {msgs.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                aria-live="polite"
              >
                <div
                  className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm shadow-sm ${m.role === "user"
                    ? "bg-legal-navy text-white"
                    : "bg-white text-gray-800 border border-gray-100"
                    }`}
                >
                  {m.content}
                </div>
                {/* Renderizar Opciones si existen */}
                {m.role === "assistant" && m.options && m.options.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {m.options.map((opt, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          if (isTyping) return;
                          setInput(opt);
                          // Hack: usamos setTimeout para asegurar que el estado input se actualice antes de enviar, 
                          // o mejor llamamos a una versión de send que acepte argumento.
                          // Pero como 'send' usa 'input' del state, mejor hacemos una función dedicada 'sendText(opt)'
                          sendText(opt);
                        }}
                        className="rounded-full border border-legal-gold-500/50 bg-white px-3 py-1.5 text-xs font-medium text-legal-navy hover:bg-legal-gold-50 hover:text-legal-navy-dark transition-colors shadow-sm"
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {isTyping && <TypingIndicator />}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <footer className="flex-shrink-0 border-t border-gray-100 bg-white p-3">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder="Describe tu caso aquí..."
                className="flex-1 rounded-full border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition-all focus:border-legal-navy focus:bg-white focus:ring-1 focus:ring-legal-navy/20"
                aria-label="Mensaje para el Asistente"
              />
              <button
                onClick={send}
                disabled={isTyping || !input.trim()}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-legal-gold-500 text-legal-navy shadow-sm transition-transform hover:scale-105 hover:bg-legal-gold-400 disabled:opacity-50 disabled:hover:scale-100"
              >
                <Send size={18} />
              </button>
            </div>
          </footer>
        </div>
      )}

      {/* Animaciones globales */}
      <style jsx global>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.25s ease-out;
        }

        @keyframes lex-pulse {
          0% {
            transform: translateZ(0) scale(1);
            box-shadow: 0 4px 12px rgba(12, 24, 52, 0.15);
          }
          50% {
            transform: translateZ(0) scale(1.03);
            box-shadow: 0 8px 20px rgba(12, 24, 52, 0.25);
          }
          100% {
            transform: translateZ(0) scale(1);
            box-shadow: 0 4px 12px rgba(12, 24, 52, 0.15);
          }
        }
        .animate-lex-pulse {
          animation: lex-pulse 3s ease-in-out infinite;
        }
      `}</style>
    </>
  );
}
