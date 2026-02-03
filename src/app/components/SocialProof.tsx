// src/app/components/SocialProof.tsx

"use client";

import { motion, useInView, animate } from "framer-motion";
import { useRef, useEffect } from "react";

// --- Fuentes de video en /public ---
// Asegúrate de tener estos archivos en la carpeta /public: 1.1.mp4, 1.2.mp4, 1.3.mp4, 1.4.mp4
const VIDEO_SOURCES = ["/1.1.mp4", "/1.2.mp4", "/1.3.mp4", "/1.4.mp4"];

// --- Componente Principal ---
export default function SocialProof() {
  const countRef = useRef<HTMLSpanElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.5 });

  useEffect(() => {
    if (isInView && countRef.current) {
      const controls = animate(0, 50000, {
        duration: 2.5,
        ease: "easeOut",
        onUpdate(value) {
          if (countRef.current) {
            // Usamos 'de-DE' para separador de miles: 50.000
            countRef.current.textContent = Math.round(value).toLocaleString("de-DE");
          }
        },
      });
      return () => controls.stop();
    }
  }, [isInView]);

  return (
    <section ref={sectionRef} className="bg-white py-20 sm:py-28 overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.8 }}
          className="mx-auto max-w-3xl text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl md:text-5xl">
            Únete a los más de{" "}
            <span className="inline-block">
              <span ref={countRef}>0</span>+
            </span>
            <br />
            chilenos que ya recuperaron su tranquilidad
          </h2>
          <p className="mt-6 text-lg leading-8 text-slate-600">
            Nuestra trayectoria y la confianza de miles de clientes nos avalan. Medios de
            comunicación de todo el país han destacado nuestro trabajo como el estudio jurídico
            líder en la defensa de deudores en Chile.
          </p>
        </motion.div>
      </div>

      {/* --- Recuadro inferior con Marquee de Videos --- */}
      <div className="mt-20 relative">
        {/* Fade lateral para elegancia */}
        <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-r from-white via-white/0 to-white" />

        {/* Dos filas en direcciones opuestas para sensación premium */}
        <VideoMarquee sources={VIDEO_SOURCES} baseVelocity={-1} />
        <VideoMarquee sources={[...VIDEO_SOURCES].reverse()} baseVelocity={1} />
      </div>

      {/* Estilos del marquee (global para evitar CSS externo) */}
      <style jsx global>{`
        .video-marquee-track {
          display: flex;
          flex-wrap: nowrap;
          gap: 2rem;
          width: max-content;
        }
        .video-card {
          flex-shrink: 0;
          width: 320px; /* ancho del recuadro de cada video */
          height: 180px; /* 16:9 */
          border-radius: 16px;
          overflow: hidden;
          background: rgba(15, 23, 42, 0.06); /* slate-900/6 */
          box-shadow: 0 2px 10px rgba(15, 23, 42, 0.08);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          backdrop-filter: blur(4px);
          border: 1px solid rgba(15, 23, 42, 0.08);
        }
        .video-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 18px rgba(15, 23, 42, 0.12);
        }
        .video-el {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
      `}</style>
    </section>
  );
}

// --- Componente de Marquee para videos ---
interface VideoMarqueeProps {
  sources: string[];
  baseVelocity: number; // negativo => izquierda; positivo => derecha
}

function VideoMarquee({ sources, baseVelocity = -1 }: VideoMarqueeProps) {
  // Duración proporcional a la velocidad base para una sensación constante
  const duration = 50 / Math.max(0.5, Math.abs(baseVelocity));

  // Duplicamos fuentes para loop infinito
  const loopSources = [...sources, ...sources];

  return (
    <div className="flex flex-nowrap overflow-hidden my-6 whitespace-nowrap">
      <motion.div
        className="video-marquee-track"
        animate={{
          x: baseVelocity < 0 ? ["0%", "-100%"] : ["-100%", "0%"],
        }}
        transition={{
          ease: "linear",
          duration,
          repeat: Infinity,
        }}
        aria-label="Carrusel de videos de testimonios y social proof"
      >
        {loopSources.map((src, idx) => (
          <div className="video-card" key={`${src}-${idx}`}>
            <VideoSilentAutoPlay src={src} />
          </div>
        ))}
      </motion.div>
    </div>
  );
}

// --- Video con autoplay silencioso y seguro para móviles ---
function VideoSilentAutoPlay({ src }: { src: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const inView = useInView(ref, { margin: "-10% 0px -10% 0px" });

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    // forzamos mute para permitir autoplay en móviles
    v.muted = true;
    if (inView) {
      const play = v.play();
      if (play && typeof play.catch === "function") {
        play.catch(() => {
          // Si el navegador bloquea autoplay, intentamos de nuevo en silencio
          v.muted = true;
          v.play().catch(() => {});
        });
      }
    } else {
      v.pause();
    }
  }, [inView]);

  return (
    <video
      ref={ref}
      className="video-el"
      src={src}
      playsInline
      muted
      loop
      autoPlay
      preload="metadata"
      controls={false}
      aria-label="Video de social proof sin sonido"
    />
  );
}