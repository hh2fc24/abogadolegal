"use client";

import Link from "next/link";
// 1. Importa el tipo `Variants` junto con `motion`
import { motion, Variants } from "framer-motion";
import { ShieldCheck, ArrowRight } from "lucide-react";

// 2. Aplica el tipo `Variants` a la constante
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

// 3. Aplica el tipo `Variants` aquí también
const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut", // Ahora TypeScript entenderá esto correctamente
    },
  },
};

export default function Guarantee() {
  return (
    <section className="bg-slate-50 py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          className="relative mx-auto grid max-w-2xl grid-cols-1 items-center gap-x-16 gap-y-12 rounded-2xl border border-slate-200 bg-white p-8 shadow-lg lg:max-w-none lg:grid-cols-2 lg:p-12"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
        >
          <ShieldCheck className="absolute -top-8 -left-8 h-24 w-24 text-blue-50 opacity-80" />

          <div className="relative">
            <motion.p
              variants={itemVariants}
              className="font-semibold text-blue-600"
            >
              NUESTRO COMPROMISO
            </motion.p>
            <motion.h2
              variants={itemVariants}
              className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl"
            >
              Garantía Visible
            </motion.h2>
            <motion.p
              variants={itemVariants}
              className="mt-4 text-lg text-slate-600"
            >
              Recuperamos tu historial y tu tranquilidad financiera con soluciones legales claras y efectivas. Sin letra chica, solo resultados reales
            </motion.p>
          </div>

          <motion.div
            variants={itemVariants}
            className="flex w-full justify-start lg:justify-end"
          >
            <Link
              href="/evaluacion"
              className="group flex w-full items-center justify-center gap-x-3 rounded-lg bg-blue-700 px-8 py-4 text-base font-semibold text-white shadow-sm transition-all duration-300 ease-in-out hover:bg-blue-800 hover:shadow-lg hover:scale-105 sm:w-auto"
            >
              Quiero salir de DICOM
              <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}