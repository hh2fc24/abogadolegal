"use client";

import { motion } from "framer-motion";
import { Handshake, Gavel, Scale, ShieldCheck } from "lucide-react";

const services = [
    {
        title: "Liquidación Voluntaria",
        desc: "La Liquidación Voluntaria es un proceso iniciado por el deudor, ya sea una empresa o una persona con dificultades financieras, para resolver problemas de insolvencia o sobreendeudamiento. Ofrecemos apoyo y asesoría durante todo el proceso.",
        icon: Scale,
        delay: 0.1
    },
    {
        title: "Liquidación Forzosa",
        desc: "La Liquidación Forzosa es un procedimiento dirigido por acreedores bajo supervisión de la Superintendencia debido a la insolvencia grave del deudor. Proporcionamos soluciones para restaurar la estabilidad financiera en estas circunstancias.",
        icon: Gavel,
        delay: 0.2
    },
    {
        title: "Reorganización Financiera",
        desc: "La reorganización es una alternativa valiosa para empresas endeudadas con activos y recursos rescatables, evitando la liquidación forzosa o la quiebra. Nuestro estudio te puede ayudar rápidamente en la recuperación financiera de tu empresa.",
        icon: Handshake,
        delay: 0.3
    },
    {
        title: "Tercería de bienes",
        desc: "La tercería es un procedimiento que protege los derechos e intereses de una persona o empresa sobre los bienes de un deudor en procesos de reorganización o liquidación. Entregamos asesoría sólida y efectiva para garantizar esta protección.",
        icon: ShieldCheck,
        delay: 0.4
    }
];

const Services = () => {
    return (
        <section className="py-20 bg-gray-50 relative overflow-hidden" id="servicios">
            <div className="container mx-auto px-6 max-w-7xl relative">
                <div className="text-center mb-16">
                    <motion.span
                        initial={{ opacity: 0, y: 15 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-legal-gold-500 font-bold tracking-widest uppercase text-sm mb-4 block"
                    >
                        NUESTROS SERVICIOS
                    </motion.span>
                    <motion.h2
                        initial={{ opacity: 0, y: 15 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="font-serif text-4xl md:text-5xl font-bold text-legal-navy mb-4"
                    >
                        DESCUBRE CÓMO TE PODEMOS AYUDAR
                    </motion.h2>
                    <div className="w-24 h-1 bg-legal-gold-500 mx-auto mb-6" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {services.map((service, i) => (
                        <motion.div
                            key={service.title}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: service.delay, duration: 0.4 }}
                            className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300"
                        >
                            <div className="w-16 h-16 rounded-full bg-legal-navy/5 flex items-center justify-center text-legal-gold-500 mb-6 mx-auto">
                                <service.icon size={32} />
                            </div>
                            <h3 className="font-serif text-xl font-bold text-legal-navy mb-4 text-center">
                                {service.title}
                            </h3>
                            <p className="text-gray-600 text-sm leading-relaxed text-center mb-6">
                                {service.desc}
                            </p>
                            <div className="text-center pt-4 border-t border-gray-100">
                                <button className="text-legal-gold-500 font-bold text-xs tracking-widest uppercase hover:text-legal-navy transition-colors">
                                    MÁS INFORMACIÓN
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Services;
