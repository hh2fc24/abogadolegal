// src/app/components/Benefits.tsx

"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scale, Handshake, ShieldCheck, FileCheck, ArrowRight, BarChart, Clock, BrainCircuit } from 'lucide-react';
import Link from 'next/link';
import { PieChart } from 'react-minimal-pie-chart';

// Estructura de datos
type Method = {
  title: string;
  desc: string;
  icon: React.ElementType;
  metrics: {
    complexity: string;
    time: string;
    success: string;
  };
  cta: string;
};

const METHODS: Method[] = [
  {
    title: "Defensa por Prescripción",
    desc: "Nuestra principal especialidad. Argumentamos legalmente ante tribunales para que se declare prescrita la acción de cobro, extinguiendo la obligación de forma definitiva y permanente.",
    icon: Scale,
    metrics: { complexity: "Alta", time: "3-6 Meses", success: "98%" },
    cta: "Evaluar caso para Prescripción"
  },
  {
    title: "Negociación Estratégica",
    desc: "Representamos tus intereses ante los acreedores para alcanzar acuerdos de pago convenientes, con condonaciones de intereses y plazos que se ajusten a tu realidad.",
    icon: Handshake,
    metrics: { complexity: "Media", time: "1-2 Meses", success: "95%" },
    cta: "Iniciar una Negociación"
  },
  {
    title: "Defensa en Juicios",
    desc: "Si ya enfrentas una demanda, nuestro equipo de litigantes interviene con defensas y tercerías para proteger tu patrimonio y buscar la mejor resolución posible.",
    icon: ShieldCheck,
    metrics: { complexity: "Alta", time: "Variable", success: "92%" },
    cta: "Solicitar Defensa Judicial"
  },
  {
    title: "Aclaración y Rectificación",
    desc: "Un proceso rápido y eficiente para corregir información errónea o deudas ya pagadas que aún afectan negativamente tus registros comerciales.",
    icon: FileCheck,
    metrics: { complexity: "Baja", time: "30 Días", success: "100%" },
    cta: "Rectificar mis Registros"
  },
];

// --- Componente Principal ---
export default function Benefits() {
  const [selected, setSelected] = useState(0);
  const activeMethod = METHODS[selected];
  const ActiveIcon = activeMethod.icon;

  const getChartData = (metrics: Method["metrics"]) => {
    // Lógica simple para visualizar datos cualitativos en un gráfico
    const complexityValue = { 'Alta': 3, 'Media': 2, 'Baja': 1 }[metrics.complexity] || 1;
    const timeValue = { '3-6 Meses': 3, '1-2 Meses': 2, '30 Días': 1, 'Variable': 1 }[metrics.time] || 1;
    const successValue = parseFloat(metrics.success) / 100 * 3;
    
    return [
      { title: 'Complejidad', value: complexityValue, color: '#3b82f6' }, // blue
      { title: 'Tiempo', value: timeValue, color: '#8b5cf6' }, // violet
      { title: 'Éxito', value: successValue, color: '#10b981' }, // emerald
    ];
  };
  
  const chartData = getChartData(activeMethod.metrics);

  return (
    <section className="relative overflow-hidden bg-slate-900 py-24 sm:py-32">
      <div className="absolute inset-0 bg-grid-slate-800 [mask-image:linear-gradient(to_bottom,white_10%,transparent_100%)]"></div>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 0.8 }}
        className="mx-auto max-w-7xl px-6 lg:px-8"
      >
        <div className="text-center">
          <h2 className="text-base font-semibold leading-7 text-blue-400">Nuestra Metodología</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Caminos estratégicos hacia tu libertad financiera
          </p>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-300">
            Cada caso es único. Selecciona una de nuestras estrategias para conocer en detalle cómo podemos devolverte la tranquilidad que mereces.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-12 lg:grid-cols-3 lg:gap-8">
          <div className="flex flex-col gap-2">
            {METHODS.map((method, index) => (
              <MethodSelector
                key={method.title}
                method={method}
                isSelected={selected === index}
                onClick={() => setSelected(index)}
              />
            ))}
          </div>
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              <motion.div
                key={selected}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }}
                exit={{ opacity: 0, y: -30, transition: { duration: 0.3, ease: "easeIn" } }}
                className="relative h-full w-full rounded-2xl bg-slate-800/50 p-8 shadow-2xl ring-1 ring-white/10 backdrop-blur-lg flex flex-col"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white">
                      <ActiveIcon className="h-8 w-8" />
                    </div>
                  </div>
                  <h3 className="mt-6 text-2xl font-bold text-white">{activeMethod.title}</h3>
                  <p className="mt-3 text-slate-300 leading-relaxed">{activeMethod.desc}</p>
                </div>
                
                <div className="my-8 flex-grow flex items-center justify-center gap-6 md:gap-12">
                  <div className="relative w-32 h-32 md:w-36 md:h-36">
                    <PieChart
                      data={chartData}
                      lineWidth={15}
                      startAngle={-90}
                      animate
                      animationDuration={1000}
                      animationEasing="ease-out"
                    />
                    <div className="absolute inset-0 flex items-center justify-center text-center">
                       <p className="text-xs font-semibold text-slate-400">Métricas</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <MetricItem icon={BrainCircuit} label="Complejidad" value={activeMethod.metrics.complexity} color="#3b82f6" />
                    <MetricItem icon={Clock} label="Tiempo Estimado" value={activeMethod.metrics.time} color="#8b5cf6" />
                    <MetricItem icon={BarChart} label="Tasa de Éxito" value={activeMethod.metrics.success} color="#10b981" />
                  </div>
                </div>

                {/* --- DIV DEL BOTÓN CORREGIDO --- */}
                <div className="mt-auto text-center md:text-left">
                  {/* Clases ajustadas para un botón más pequeño */}
                  <Link href="/evaluacion" className="wow-button-small primary-button group">
                    {activeMethod.cta}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* --- ESTILOS DEL BOTÓN CORREGIDO --- */}
      <style jsx global>{`
        .bg-grid-slate-800 { background-image: linear-gradient(white 1px, transparent 1px), linear-gradient(to right, white 1px, transparent 1px); background-size: 4rem 4rem; opacity: 0.05; animation: pan 20s linear infinite; }
        @keyframes pan { from { background-position: 0 0; } to { background-position: 4rem 0; } }
        
        /* Estilo del botón ajustado */
        .wow-button-small { display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem; padding: 0.625rem 1.25rem; font-weight: 600; border-radius: 0.5rem; transition: all 0.3s ease; font-size: 0.875rem; /* 14px */ }
        .primary-button { background-color: white; color: #020617; }
        .primary-button:hover { background-color: #e2e8f0; transform: scale(1.02); }
      `}</style>
    </section>
  );
}

// --- Sub-componentes ---

function MethodSelector({ method, isSelected, onClick }: { method: Method, isSelected: boolean, onClick: () => void }) {
  const Icon = method.icon;
  return (
    <motion.button
      onClick={onClick}
      animate={isSelected ? "active" : "inactive"}
      className="relative flex w-full items-start gap-4 rounded-xl p-4 text-left transition-colors duration-300"
    >
      <motion.div className="absolute inset-0 rounded-xl" variants={{ active: { backgroundColor: "rgba(30, 41, 59, 0.7)", scale: 1.02 }, inactive: { backgroundColor: "rgba(30, 41, 59, 0.2)", scale: 1 }}} />
      <div className={`relative z-10 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg transition-colors duration-300 ${isSelected ? 'bg-blue-600' : 'bg-slate-700'}`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
      <div className="relative z-10">
        <h4 className={`font-semibold transition-colors duration-300 ${isSelected ? 'text-white' : 'text-slate-200'}`}>{method.title}</h4>
        <p className={`mt-1 text-sm leading-snug transition-colors duration-300 ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>
          {method.desc.substring(0, 60)}...
        </p>
      </div>
    </motion.button>
  );
}

function MetricItem({ icon: Icon, label, value, color }: { icon: React.ElementType, label: string, value: string, color: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }}></div>
      <p className="text-sm font-medium text-slate-400">{label}: <span className="font-semibold text-white">{value}</span></p>
    </div>
  );
}