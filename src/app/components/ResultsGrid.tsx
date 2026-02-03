// src/app/components/ResultsGrid.tsx

"use client";

import { useState } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { CheckCircle, Scale, Archive, FileText, Plus, Minus } from 'lucide-react';

// --- 1. Definiciones de Tipos (Completas y Seguras) ---
type CaseStatus = "success" | "resolved" | "closed";

type CaseResult = {
  caseId: string;
  headline: string;
  summary: string;
  detail: string;
  timeline: string;
  status: CaseStatus;
  metric: string;
};

type StatusConfig = {
  label: string;
  color: string;
  bg: string;
  icon: React.ElementType;
};

// --- 2. Datos de Casos (Completos) ---
const CASES: CaseResult[] = [
  { 
    caseId: "CL-2024-0812",
    headline: "Prescripción Extintiva de Deuda", 
    summary: "Se argumentó la prescripción de la acción de cobro ante tribunales.",
    detail: "Tras analizar los plazos legales, se interpuso una demanda de prescripción extintiva contra la entidad acreedora. El tribunal acogió nuestros argumentos, emitiendo una sentencia favorable que declaró la deuda como legalmente incobrable. Se procedió a oficiar al Boletín Comercial para la eliminación permanente y definitiva del registro, liberando al cliente de toda obligación.",
    timeline: "45 Días Hábiles",
    status: "success",
    metric: "Deuda Extinguida"
  },
  { 
    caseId: "CL-2024-0745",
    headline: "Acuerdo en Juicio Ejecutivo", 
    summary: "Negociación directa con abogados de la parte demandante.",
    detail: "En pleno proceso de cobranza judicial, nuestro equipo de litigantes tomó contacto directo con los abogados del acreedor. Se presentó una contrapropuesta sólida, resultando en un acuerdo de pago con una condonación del 72% de la deuda total, incluyendo intereses y costas procesales. El acuerdo fue ratificado judicialmente, cerrando el caso de forma favorable.",
    timeline: "28 Días Hábiles",
    status: "resolved",
    metric: "72% Condonación"
  },
  { 
    caseId: "CL-2024-0691",
    headline: "Abandono del Procedimiento", 
    summary: "Se solicitó el archivo de la causa por inactividad del acreedor.",
    detail: "Se realizó un seguimiento exhaustivo de la causa judicial, detectando inactividad procesal por parte del demandante por un período superior al legal. Se redactó y presentó un escrito solicitando el abandono del procedimiento, el cual fue acogido por el tribunal, resultando en el archivo definitivo de la causa y el cese completo de la acción de cobro.",
    timeline: "60 Días Hábiles",
    status: "closed",
    metric: "Caso Archivado"
  },
];

// --- 3. Configuración de Estilos (Completa y Tipada) ---
const statusConfig: Record<CaseStatus, StatusConfig> = {
  success: { label: "Éxito Total", color: "text-green-400", bg: "bg-green-500/10", icon: CheckCircle },
  resolved: { label: "Resuelto Favorablemente", color: "text-blue-400", bg: "bg-blue-500/10", icon: Scale },
  closed: { label: "Caso Cerrado", color: "text-indigo-400", bg: "bg-indigo-500/10", icon: Archive }
};

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.2, delayChildren: 0.3 } }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
};

// --- Componente Principal ---
export default function ResultsGrid() {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  return (
    <section className="bg-slate-900 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <h2 className="text-base font-semibold leading-7 text-blue-400">Resultados Verificables</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Línea de Tiempo de Victorias Legales
          </p>
          <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-slate-300">
            Nuestro historial no es una lista, es una cronología de éxito. Cada punto en esta línea representa un caso resuelto y la tranquilidad recuperada de un cliente. Explore los expedientes para ver nuestra metodología en acción.
          </p>
        </motion.div>

        {/* Línea de Tiempo Interactiva */}
        <div className="mt-20">
          <div className="relative">
            {/* La línea de tiempo horizontal */}
            <div className="absolute top-5 left-0 h-0.5 w-full bg-slate-700"></div>
            
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              className="relative grid grid-cols-1 gap-12 lg:grid-cols-3"
            >
              {CASES.map((caseItem, index) => (
                <TimelineItem
                  key={caseItem.caseId}
                  caseData={caseItem}
                  isExpanded={expandedIndex === index}
                  onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
                />
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

// --- Sub-componente para cada item de la Línea de Tiempo ---
function TimelineItem({ caseData, isExpanded, onClick }: { caseData: CaseResult, isExpanded: boolean, onClick: () => void }) {
  const config = statusConfig[caseData.status];
  const Icon = config.icon;

  return (
    <motion.div variants={itemVariants} className="relative flex flex-col items-start">
      {/* Nodo en la línea de tiempo */}
      <div className="relative z-10">
        <div className={`h-10 w-10 rounded-full grid place-items-center ${isExpanded ? 'bg-blue-500' : 'bg-slate-800 ring-4 ring-slate-900'}`}>
          <Icon className={`h-5 w-5 ${isExpanded ? 'text-white' : 'text-slate-400'}`} />
        </div>
      </div>

      {/* Tarjeta de Contenido */}
      <motion.div 
        layout
        className="mt-6 w-full rounded-xl bg-slate-800/80 ring-1 ring-white/10"
        transition={{ layout: { duration: 0.4, ease: "easeOut" } }}
      >
        <div className="p-6">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-white">{caseData.headline}</h3>
            <button onClick={onClick} className="flex-shrink-0 grid h-7 w-7 place-items-center rounded-full bg-slate-700/50 text-slate-400 hover:bg-slate-700 hover:text-white transition-all">
              {isExpanded ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            </button>
          </div>
          
          <AnimatePresence initial={false}>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: 'auto', marginTop: '1.5rem' }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
                <div className="border-t border-white/10 pt-6">
                  <p className="text-slate-300">{caseData.detail}</p>
                  <div className="mt-6 grid grid-cols-2 gap-4 rounded-lg bg-slate-900/50 p-4 ring-1 ring-white/10">
                    <div>
                      <p className="text-xs text-slate-400">Plazo Resolución</p>
                      <p className="font-semibold text-white">{caseData.timeline}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Resultado Clave</p>
                      <p className="font-semibold text-white">{caseData.metric}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}