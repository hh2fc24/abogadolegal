// src/app/components/ComoSaberDicom.tsx

"use client";

import { useState } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { FileSearch, Landmark, Banknote, HelpCircle, ChevronDown, CheckCircle, XCircle } from 'lucide-react';

// --- Sub-componente para las tarjetas de consulta ---
interface MethodCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  isFree: boolean;
}
function CheckMethodCard({ icon: Icon, title, description, isFree }: MethodCardProps) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      {isFree && (
        <span className="absolute top-0 right-0 -mt-2 -mr-2 flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white shadow-md">
          <CheckCircle className="h-5 w-5" />
        </span>
      )}
      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100">
        <Icon className="h-6 w-6 text-slate-700" />
      </div>
      <h4 className="mt-4 font-bold text-slate-900">{title}</h4>
      <p className="mt-1 text-sm text-slate-600">{description}</p>
    </div>
  );
}

// --- Sub-componente para el acordeón de FAQs ---
interface FaqItemProps {
  q: string;
  a: string;
  isOpen: boolean;
  onClick: () => void;
}
function FaqAccordionItem({ q, a, isOpen, onClick }: FaqItemProps) {
  return (
    <div className="border-b border-slate-200">
      <button onClick={onClick} className="flex w-full items-center justify-between gap-4 py-5 px-6 text-left">
        <span className="font-semibold text-slate-800">{q}</span>
        <ChevronDown className={`h-5 w-5 text-blue-600 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial="collapsed" animate="open" exit="collapsed"
            variants={{
              open: { opacity: 1, height: "auto" },
              collapsed: { opacity: 0, height: 0 },
            }}
            transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}
            className="overflow-hidden"
          >
            <p className="pb-5 px-6 text-slate-600" dangerouslySetInnerHTML={{ __html: a }} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- Componente Principal ---
export default function ComoSaberDicom() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqItems = [
    {
      q: "¿Si me sacan de DICOM en 5 años, la deuda desaparece?",
      a: "No. La <strong>Ley de Protección de la Vida Privada</strong> obliga a eliminar el registro comercial negativo tras 5 años, pero <strong>la deuda sigue existiendo legalmente</strong>. La institución financiera aún puede iniciar acciones de cobro judicial.",
    },
    {
      q: "Entonces, ¿qué significa que una deuda 'prescriba'?",
      a: "Lo que prescribe no es la deuda en sí, sino <strong>la acción del acreedor para cobrarla judicialmente</strong>. Por regla general, este plazo es de 5 años si no ha habido gestión de cobro notificada. Para títulos como pagarés o cheques, el plazo puede ser de solo 1 año.",
    },
    {
      q: "Si pasan 5 años, ¿mi deuda prescribe automáticamente?",
      a: "No, este es un punto crítico. La prescripción <strong>debe ser declarada por un Tribunal de Justicia</strong>. Usted, a través de su abogado, debe solicitarlo formalmente. No es un proceso automático.",
    },
     {
      q: "Si un tribunal declara la prescripción, ¿salgo de DICOM?",
      a: "Sí, y de forma definitiva respecto a esa deuda. La sentencia judicial es el documento legal que nos permite <strong>exigir al boletín comercial la eliminación permanente</strong> de dicho registro.",
    },
  ];

  return (
    <section className="bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8 }}
          className="grid grid-cols-1 gap-16 lg:grid-cols-2 lg:gap-24"
        >
          {/* --- Columna de Información y Acciones --- */}
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              ¿Cómo saber si estoy en DICOM?
            </h2>
            <p className="mt-4 text-lg leading-8 text-slate-600">
              Conocer su situación es el primer paso para recuperar el control. Aquí le presentamos las vías formales para consultar su estado comercial en Chile.
            </p>

            <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
              <CheckMethodCard 
                icon={FileSearch} 
                title="Informe CMF (Gratuito)" 
                description="Solicite su Informe de Deudas en la Comisión para el Mercado Financiero con su Clave Única." 
                isFree={true} 
              />
              <CheckMethodCard 
                icon={Landmark} 
                title="Boletín Comercial" 
                description="Obtenga su certificado de antecedentes comerciales directamente en su sitio web (trámite pagado)." 
                isFree={false} 
              />
            </div>
            
            <div className="mt-16">
              <h3 className="text-2xl font-bold tracking-tight text-slate-900">
                Estoy en DICOM. ¿Cuáles son los caminos?
              </h3>
              <p className="mt-3 text-slate-600">
                Existen múltiples estrategias legales para solucionar su situación. La clave es elegir la más adecuada para su caso particular.
              </p>
            </div>

            <div className="mt-8 rounded-xl border border-slate-200 bg-white shadow-sm">
              {faqItems.map((item, index) => (
                <FaqAccordionItem
                  key={index}
                  q={item.q}
                  a={item.a}
                  isOpen={openFaq === index}
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                />
              ))}
            </div>
          </div>

          {/* --- Columna de Imagen y Confianza --- */}
          <div className="flex items-center">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="group relative"
            >
              <div className="aspect-[4/5] w-full rounded-2xl bg-slate-200">
                {/* AQUÍ VA LA IMAGEN DE LOS ABOGADOS */}
                <img 
                   src="https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=1887&auto=format&fit=crop" // Imagen de placeholder, reemplazar
                   alt="Equipo de abogados expertos de DeudasCero"
                   className="h-full w-full rounded-2xl object-cover shadow-xl"
                />
              </div>
              <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-slate-900/10"></div>
              
              <div className="absolute bottom-6 left-6 right-6 rounded-lg bg-white/70 p-4 text-sm leading-6 text-slate-900 backdrop-blur-md">
                 <h4 className="font-bold">Nuestra Misión</h4>
                 <p className="mt-1">Proveer una defensa legal de excelencia para que personas y empresas recuperen su tranquilidad financiera y puedan mirar al futuro con confianza.</p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}