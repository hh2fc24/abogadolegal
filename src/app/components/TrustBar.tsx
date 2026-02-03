// src/app/components/TrustBar.tsx

"use client";

import { motion, Variants } from 'framer-motion';
import { Scale, FileSignature, Timer } from 'lucide-react';

const trustPillars = [
  {
    icon: Scale,
    title: "Respaldo Jurídico Integral",
    description: "Cada estrategia es diseñada y ejecutada por un equipo de abogados expertos en derecho de deudas."
  },
  {
    icon: FileSignature,
    title: "Contratos y Acuerdos Formales",
    description: "Toda nuestra relación y gestión se formaliza por escrito, garantizando transparencia y seguridad."
  },
  {
    icon: Timer,
    title: "Trazabilidad del Caso 24/7",
    description: "Acceso a nuestra plataforma digital para monitorear el avance de tu caso en tiempo real, cuando lo necesites."
  }
];

// Variantes para el contenedor principal
const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.2, delayChildren: 0.3 } }
};

// Variantes para los elementos de texto y el sello
const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } }
};

// Variantes para las tarjetas de pilares
const pillarCardVariants: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: "easeOut" } }
};

// Variantes para las líneas conectoras
const lineVariants: Variants = {
  hidden: { scaleX: 0 },
  visible: { scaleX: 1, transition: { duration: 0.8, ease: [0.6, 0.01, -0.05, 0.95], delay: 0.5 } }
};

export default function TrustBar() {
  return (
    <section className="bg-slate-900 text-white py-24 sm:py-32">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className="mx-auto max-w-5xl px-6 lg:px-8"
      >
        {/* --- NUEVO BLOQUE DE ENCABEZADO --- */}
        <motion.div variants={itemVariants} className="text-center mb-20">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Los Pilares de tu Tranquilidad
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-300">
                Construimos cada caso sobre una base de principios inquebrantables. Estos son los tres pilares que garantizan la seriedad y eficacia de nuestro trabajo.
            </p>
        </motion.div>
        {/* --- FIN DEL NUEVO BLOQUE --- */}

        <div className="relative grid grid-cols-1 items-center gap-y-16 lg:grid-cols-3 lg:gap-x-16">
          <PillarCard pillar={trustPillars[0]} alignment="right" />
          
          <div className="relative flex justify-center items-center h-full">
            <motion.div variants={lineVariants} className="absolute right-1/2 top-1/2 h-0.5 w-1/2 origin-right bg-gradient-to-l from-blue-500/80 to-slate-700 hidden lg:block" />
            
            <motion.div variants={itemVariants} className="relative z-10 grid h-32 w-32 place-items-center rounded-full bg-gradient-to-br from-slate-800 to-slate-900 shadow-2xl shadow-blue-500/20 ring-1 ring-slate-700">
              <Scale className="h-12 w-12 text-blue-400" />
            </motion.div>
            
            <motion.div variants={lineVariants} className="absolute left-1/2 top-1/2 h-0.5 w-1/2 origin-left bg-gradient-to-r from-blue-500/80 to-slate-700 hidden lg:block" />
          </div>

          <PillarCard pillar={trustPillars[1]} alignment="left" />
          {/* Ajuste para el tercer pilar para mejor alineación en todas las vistas */}
          <div className="lg:col-start-2 lg:flex lg:justify-center">
            <PillarCard pillar={trustPillars[2]} alignment="center" />
          </div>
        </div>
      </motion.div>
    </section>
  );
}

function PillarCard({ pillar, alignment }: { pillar: typeof trustPillars[0], alignment: 'left' | 'right' | 'center' }) {
  const Icon = pillar.icon;
  const textAlign = alignment === 'right' ? 'lg:text-right' : (alignment === 'center' ? 'text-center' : 'lg:text-left');
  const itemsAlign = alignment === 'right' ? 'lg:items-end' : (alignment === 'center' ? 'items-center' : 'lg:items-start');

  return (
    <motion.div variants={pillarCardVariants} className={`group relative flex flex-col items-center ${itemsAlign}`}>
      <div className="grid h-16 w-16 place-items-center rounded-xl bg-slate-800 ring-1 ring-slate-700 transition-all duration-300 group-hover:scale-110 group-hover:bg-blue-900/50 group-hover:ring-blue-500">
        <Icon className="h-8 w-8 text-slate-300 transition-colors group-hover:text-white" />
      </div>
      <h3 className={`mt-6 text-lg font-bold text-slate-100 ${textAlign}`}>{pillar.title}</h3>
      <p className={`mt-2 text-slate-400 ${textAlign}`}>{pillar.description}</p>
    </motion.div>
  );
}