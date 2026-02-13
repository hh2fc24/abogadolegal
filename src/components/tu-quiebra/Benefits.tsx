"use client";

import { motion } from "framer-motion";
import { CheckCircle, Shield, TrendingUp } from "lucide-react";
import MagneticButton from "@/components/ui/MagneticButton";
import Link from "next/link";

const Benefits = () => {
    return (
        <section className="py-20 bg-legal-navy text-white relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-1/3 h-full bg-white/5 skew-x-12 transform translate-x-32" />

            <div className="container mx-auto px-6 max-w-7xl relative z-10">
                <div className="text-center mb-16">
                    <motion.span
                        initial={{ opacity: 0, y: 15 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-legal-gold-500 font-bold tracking-widest uppercase text-sm mb-4 block"
                    >
                        BENEFICIOS
                    </motion.span>
                    <motion.h2
                        initial={{ opacity: 0, y: 15 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="font-serif text-4xl md:text-5xl font-bold mb-4"
                    >
                        ¿QUÉ PUEDES LOGRAR CON <br /> NUESTROS SERVICIOS?
                    </motion.h2>
                    <div className="w-24 h-1 bg-legal-gold-500 mx-auto mb-10" />
                    <div className="flex flex-wrap justify-center gap-4 text-sm font-semibold text-gray-400 uppercase tracking-wider mb-8">
                        <span>Reorganización</span>
                        <span className="text-legal-gold-500">•</span>
                        <span>Tercería de Bienes</span>
                        <span className="text-legal-gold-500">•</span>
                        <span>Liquidación Voluntaria</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <BenefitCard
                        icon={TrendingUp}
                        title="CONTINUIDAD EMPRESARIAL"
                        desc="Evita la quiebra y permite la continuidad operativa de tu empresa."
                        delay={0.1}
                    />
                    <BenefitCard
                        icon={Shield}
                        title="PROTECCIÓN LEGAL"
                        desc="Evita quiebras, demandas y desalojos, manteniendo contratos vigentes y suspendiendo procesos legales."
                        delay={0.2}
                    />
                    <BenefitCard
                        icon={CheckCircle}
                        title="CONSERVACIÓN DE DERECHOS"
                        desc="Continuidad de derechos en registros y licitaciones. Protección inicial de 90 días, ampliable con apoyo de acreedores."
                        delay={0.3}
                    />
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mt-16 text-center bg-white/5 rounded-2xl p-8 backdrop-blur-sm border border-white/10 max-w-4xl mx-auto"
                >
                    <h3 className="font-serif text-2xl font-bold mb-4">CONVERSEMOS SOBRE TU CASO</h3>
                    <p className="text-gray-300 mb-8 max-w-2xl mx-auto">REALIZA TU CONSULTA Y RECIBE NUESTRA ORIENTACIÓN</p>

                    <MagneticButton>
                        <Link
                            href="#contacto"
                            className="px-10 py-4 bg-legal-gold-500 text-legal-navy font-bold text-sm tracking-widest uppercase hover:bg-white hover:text-legal-navy transition-all duration-300 shadow-lg inline-block"
                        >
                            SOLICITAR ASESORÍA
                        </Link>
                    </MagneticButton>
                </motion.div>
            </div>
        </section>
    );
};

const BenefitCard = ({ icon: Icon, title, desc, delay }: { icon: any, title: string, desc: string, delay: number }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay, duration: 0.4 }}
        className="bg-white/5 p-8 rounded-xl border border-white/10 hover:bg-white/10 transition-colors duration-300 text-center"
    >
        <div className="w-16 h-16 rounded-full bg-legal-gold-500 flex items-center justify-center text-legal-navy mb-6 mx-auto shadow-lg shadow-legal-gold-500/20">
            <Icon size={32} />
        </div>
        <h3 className="font-serif text-xl font-bold text-white mb-4">
            {title}
        </h3>
        <p className="text-gray-300 text-sm leading-relaxed">
            {desc}
        </p>
    </motion.div>
);

export default Benefits;
