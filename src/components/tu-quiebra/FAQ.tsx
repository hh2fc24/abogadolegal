"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X } from "lucide-react";

const faqs = [
    {
        question: "¿Cuáles son las señales comunes de que mi situación financiera podría requerir asistencia legal?",
        answer: "Señales clave incluyen: incapacidad para pagar deudas a tiempo, acoso constante de acreedores, demandas o embargos inminentes, y cuando tus pasivos superan tus activos significativamente."
    },
    {
        question: "¿Cuáles son los beneficios de contar con representación legal en asuntos financieros y de quiebra?",
        answer: "Un abogado especialista puede proteger tus bienes, negociar mejores condiciones con acreedores, detener el acoso y guiarte por el proceso legal más adecuado (liquidación o reorganización) para tu caso."
    },
    {
        question: "¿Una empresa se puede declarar en quiebra?",
        answer: "Sí, a través del procedimiento de Liquidación Voluntaria (Ley 20.720), una empresa puede declarar su insolvencia para liquidar sus bienes y extinguir sus deudas remanentes, permitiendo un cierre ordenado."
    },
    {
        question: "¿Qué pasos iniciales debo tomar si enfrento dificultades financieras en mi empresa?",
        answer: "Lo primero es realizar un diagnóstico financiero real. Luego, contactar a un abogado especialista para evaluar si es viable una reorganización para salvar la empresa o si la liquidación es la mejor alternativa."
    },
    {
        question: "¿Cuáles son los riesgos legales de no abordar adecuadamente una crisis financiera?",
        answer: "Ignorar la crisis puede llevar a liquidaciones forzosas (demanda de acreedores), responsabilidad personal de los socios/administradores, embargo de bienes personales y problemas legales a largo plazo."
    }
];

const FAQ = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    return (
        <section className="py-20 bg-gray-50">
            <div className="container mx-auto px-6 max-w-4xl">
                <div className="text-center mb-16">
                    <motion.span
                        initial={{ opacity: 0, y: 15 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-legal-gold-500 font-bold tracking-widest uppercase text-sm mb-4 block"
                    >
                        PREGUNTAS FRECUENTES
                    </motion.span>
                    <motion.h2
                        initial={{ opacity: 0, y: 15 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="font-serif text-4xl md:text-5xl font-bold text-legal-navy mb-4"
                    >
                        CONOCE LAS RESPUESTAS
                    </motion.h2>
                    <div className="w-24 h-1 bg-legal-gold-500 mx-auto" />
                </div>

                <div className="space-y-4">
                    {faqs.map((faq, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
                        >
                            <button
                                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                                className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors"
                            >
                                <span className={`font-medium text-lg pr-8 ${openIndex === i ? 'text-legal-gold-500' : 'text-legal-navy'}`}>
                                    {faq.question}
                                </span>
                                <span className={`flex-shrink-0 transition-transform duration-300 ${openIndex === i ? 'rotate-180' : ''}`}>
                                    {openIndex === i ? <X className="text-legal-gold-500" /> : <Plus className="text-gray-400" />}
                                </span>
                            </button>
                            <AnimatePresence>
                                {openIndex === i && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <div className="p-6 pt-0 text-gray-600 leading-relaxed border-t border-gray-100">
                                            {faq.answer}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FAQ;
