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
        "Delito / Penal",
        "Asociaciones Gremiales"
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
        <div className="fixed bottom-20 right-5 z-[70] flex h-[min(640px,calc(100vh-120px))] w-[min(420px,calc(100vw-40px))] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white text-gray-900 shadow-[0_16px_60px_rgba(12,24,52,0.25)] animate-fade-in-up sm:h-[min(680px,calc(100vh-120px))] sm:w-[420px] max-sm:fixed max-sm:inset-0 max-sm:rounded-none max-sm:border-0 font-sans">
          {/* Header */}
          <header className="flex flex-shrink-0 items-center justify-between border-b border-gray-100 bg-legal-navy px-5 py-4 text-white shadow-sm relative overflow-hidden">
            {/* Background texture hint */}
            <div className="absolute inset-0 bg-gradient-to-br from-legal-navy to-[#1e2a4a] opacity-100" />

            <div className="flex items-center gap-3 relative z-10">
              <div className="relative">
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-legal-gold-500 shadow-sm ring-1 ring-white/20 backdrop-blur-sm">
                  <MessageCircle size={22} />
                </div>
                <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-legal-navy" />
              </div>
              <div className="leading-tight">
                <div className="text-[15px] font-bold tracking-wide">Asistente Legal</div>
                <div className="text-xs text-green-400 font-medium flex items-center gap-1">
                  En línea <span className="animate-pulse">●</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="relative z-10 rounded-full p-2 text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
              aria-label="Cerrar chat"
            >
              <X size={20} />
            </button>
          </header>

          {/* Conversación */}
          <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4 bg-[#F8F9FA]">
            {msgs.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                aria-live="polite"
              >
                <div
                  className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-5 py-3.5 text-[15px] leading-relaxed shadow-sm transition-all ${m.role === "user"
                    ? "bg-legal-navy text-white rounded-br-none"
                    : "bg-white text-gray-800 border border-gray-200/60 rounded-bl-none"
                    }`}
                >
                  {/* Renderizar contenido con soporte básico de Markdown (negritas) */}
                  {((text) => {
                    // Función simple para parsear **negrita**
                    const parts = text.split(/(\*\*.*?\*\*)/g);
                    return parts.map((part, i) => {
                      if (part.startsWith('**') && part.endsWith('**')) {
                        return <strong key={i} className="font-semibold text-inherit">{part.slice(2, -2)}</strong>;
                      }
                      return part;
                    });
                  })(m.content)}
                </div>
                {/* Renderizar Opciones si existen */}
                {m.role === "assistant" && m.options && m.options.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2 animate-fade-in-up">
                    {m.options.map((opt, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          if (isTyping) return;
                          setInput(opt);
                          sendText(opt);
                        }}
                        className="rounded-full border border-legal-navy/10 bg-white px-4 py-2 text-[13px] font-medium text-legal-navy hover:bg-legal-gold-50 hover:border-legal-gold-300 hover:text-legal-navy transition-all shadow-sm active:scale-95"
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
          <footer className="flex-shrink-0 border-t border-gray-100 bg-white p-4">
            <div className="flex items-center gap-2 bg-gray-50 rounded-full px-2 py-1 border border-gray-200 focus-within:border-legal-navy/30 focus-within:bg-white focus-within:ring-2 focus-within:ring-legal-navy/10 transition-all shadow-sm">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder="Escribe aquí tu respuesta..."
                className="flex-1 bg-transparent px-3 py-2.5 text-[15px] text-gray-900 placeholder:text-gray-400 outline-none"
                aria-label="Mensaje para el Asistente"
              />
              <button
                onClick={send}
                disabled={isTyping || !input.trim()}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-legal-navy text-white shadow-md transition-all hover:bg-[#1e2a4a] hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 disabled:hover:bg-legal-navy"
              >
                <Send size={16} className="ml-0.5" />
              </button>
            </div>
            <div className="mt-2 text-center">
              <span className="text-[10px] text-gray-400">Protegemos tus datos con cifrado SSL</span>
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
