"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ShieldCheck, HelpCircle } from "lucide-react";

// Contenido mejorado
const faqs = [
  {
    q: "¿Cuál es el plazo estimado para la eliminación de mis registros de DICOM?",
    a: "El plazo varía según la causal de la deuda. En casos de prescripción, el proceso judicial y administrativo puede tomar entre 60 y 120 días. Para aclaraciones o regularizaciones, el tiempo es considerablemente menor. Desde la evaluación inicial, le entregaremos un itinerario claro y realista.",
  },
  {
    q: "¿Existen costos iniciales para evaluar mi caso?",
    a: "No. La evaluación de su caso es completamente gratuita y sin compromiso.",
  },
  {
    q: "¿Ofrecen sus servicios legales en todo el territorio nacional?",
    a: "Absolutamente. Nuestro estudio cuenta con una plataforma digital segura que nos permite representar a clientes en todo Chile con la misma eficiencia que una atención presencial. Gestionamos toda la documentación y comunicación de forma remota, optimizando su tiempo y recursos.",
  },
  {
    q: "¿Cómo garantizan la confidencialidad de mi información sensible?",
    a: "La seguridad de su información es un pilar fundamental. Cumplimos rigurosamente con la Ley 19.628 sobre Protección de la Vida Privada y aplicamos protocolos de encriptación de datos. Todo su caso está protegido por el secreto profesional de nuestros abogados.",
  },
];

// Subcomponente para cada fila del acordeón
function AccordionItem({
  faq,
  isOpen,
  onClick,
}: {
  faq: { q: string; a: string };
  isOpen: boolean;
  onClick: () => void;
}) {
  return (
    <div className="border-b border-slate-200 last:border-b-0">
      <button
        onClick={onClick}
        className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
      >
        <span className="text-base font-semibold text-slate-800">{faq.q}</span>
        <ChevronDown
          className={`h-5 w-5 text-blue-600 transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            initial="collapsed"
            animate="open"
            exit="collapsed"
            variants={{
              open: { opacity: 1, height: "auto" },
              collapsed: { opacity: 0, height: 0 },
            }}
            transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}
            className="overflow-hidden"
          >
            <p className="px-6 pb-5 text-base text-slate-600">{faq.a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FAQPreview() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="bg-white py-16 sm:py-24">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-6 lg:grid-cols-3 lg:gap-8 lg:px-8">
        {/* Columna de Título y Contexto */}
        <div className="lg:col-span-1">
          <HelpCircle className="h-10 w-10 text-blue-700" />
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Respuestas Claras
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Entendemos sus inquietudes. Aquí resolvemos las dudas más comunes con
            la transparencia y profesionalismo que nos caracteriza.
          </p>
           <Link
              href="/faq"
              className="mt-8 inline-flex items-center gap-2 rounded-md bg-blue-700 px-5 py-3 text-base font-semibold text-white shadow-sm transition-colors hover:bg-blue-800"
            >
              Ver todas las preguntas
              <span aria-hidden="true">→</span>
            </Link>
        </div>

        {/* Columna de Preguntas Frecuentes */}
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
            {faqs.map((faq, i) => (
              <AccordionItem
                key={i}
                faq={faq}
                isOpen={openIndex === i}
                onClick={() => handleToggle(i)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}