"use client";

import { motion } from "framer-motion";
import { MessageSquare, FileText, Gavel, FileCheck, Flag } from "lucide-react";

const steps = [
    {
        id: "1",
        title: "ENTREVISTA Y RECOPILACIÓN DE INFORMACIÓN",
        desc: "Se concreta una reunión vía zoom o presencial en nuestras oficinas para conocer del caso de cada persona y poder recopilar los antecedentes.",
        icon: MessageSquare,
        align: "bottom"
    },
    {
        id: "2",
        title: "DESARROLLO Y REALIZACIÓN DE SOLICITUD A PRESENTAR",
        desc: "Con la información recaudada se procede a la redacción de la liquidación.",
        icon: FileText,
        align: "top"
    },
    {
        id: "3",
        title: "PRESENTACIÓN ANTE TRIBUNAL DE JUSTICIA",
        desc: "Se presenta la solicitud de quiebra elaborada previamente ante el tribunal de justicia.",
        icon: Gavel,
        align: "bottom"
    },
    {
        id: "4",
        title: "DILIGENCIAS VARIAS",
        desc: "Se da cumplimiento a las distintas diligencias que solicite el tribunal con respecto a la quiebra.",
        icon: FileCheck,
        align: "top"
    },
    {
        id: "5",
        title: "DICTACIÓN DE SENTENCIA POR PARTE DEL TRIBUNAL",
        desc: "", // No description in the image for the last step, but implied conclusion
        icon: Flag,
        align: "bottom"
    }
];

const ProcessFlow = () => {
    return (
        <section className="py-24 bg-white relative overflow-hidden">
            <div className="container mx-auto px-6 max-w-7xl relative">
                <div className="text-center mb-20">
                    <motion.h2
                        initial={{ opacity: 0, y: 15 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="font-serif text-4xl md:text-5xl font-bold text-legal-navy mb-4"
                    >
                        CONOCE <br /> <span className="text-legal-navy">LAS ETAPAS</span>
                    </motion.h2>
                    <div className="flex items-center justify-center gap-4 mt-4">
                        <div className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center font-serif text-legal-navy font-bold">TQ</div>
                        <div className="h-8 w-px bg-gray-300"></div>
                        <div className="text-gray-500 tracking-widest uppercase text-sm font-semibold">TU QUIEBRA</div>
                    </div>
                </div>

                {/* Desktop Flow (Snake/Wave Style simplified to horizontal for responsiveness) */}
                <div className="relative hidden lg:block pb-24 mt-32">
                    {/* Connecting Line */}
                    <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -translate-y-1/2 z-0" />

                    <div className="grid grid-cols-5 gap-4 relative z-10">
                        {steps.map((step, i) => (
                            <motion.div
                                key={step.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.2, duration: 0.5 }}
                                className="relative flex flex-col items-center group"
                            >
                                {/* Circle with Icon */}
                                <div className={`w-20 h-20 rounded-full border-4 flex items-center justify-center bg-legal-navy text-white z-20 shadow-lg mb-4
                                    ${i % 2 === 0 ? "border-legal-navy bg-legal-navy" : "border-[#d8c595] bg-[#d8c595]"}
                                    transition-transform duration-300 hover:scale-110
                                `}>
                                    <h3 className="font-bold text-2xl">{step.id}</h3>
                                </div>

                                {/* Connector to line */}
                                {/* Content Box */}
                                <div className={`absolute w-64 text-center ${i % 2 === 0
                                    ? "top-28 pt-4" // Bottom aligned
                                    : "bottom-28 pb-4"   // Top aligned
                                    }`}>
                                    {/* Icon Bubble */}
                                    {/* 
                                        In the design, icons are inside separate bubbles. 
                                        Here we can put the icon above/below the number or use the description box.
                                      */}
                                    <div className={`mx-auto w-16 h-16 rounded-full bg-legal-navy text-white flex items-center justify-center mb-4 shadow-md
                                         ${i % 2 === 0 ? "bg-legal-navy" : "bg-legal-gold-500 text-legal-navy"}
                                      `}>
                                        <step.icon size={24} />
                                    </div>

                                    <h4 className="font-serif font-bold text-legal-navy text-sm mb-2 uppercase min-h-[40px] flex items-center justify-center">
                                        {step.title}
                                    </h4>
                                    {step.desc && (
                                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 shadow-sm text-xs text-gray-600 leading-relaxed relative">
                                            {/* Little arrow pointing to the circle line */}
                                            <div className={`absolute left-1/2 -translate-x-1/2 w-3 h-3 bg-gray-50 border-l border-t border-gray-100 transform rotate-45
                                                ${i % 2 === 0 ? "-top-1.5 border-t border-l" : "-bottom-1.5 border-b border-r border-t-0 border-l-0 bg-gray-50"}
                                             `} />

                                            {step.desc}
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Mobile Vertical Flow */}
                <div className="lg:hidden space-y-8 relative">
                    <div className="absolute left-8 top-4 bottom-4 w-0.5 bg-gray-200 z-0"></div>
                    {steps.map((step, i) => (
                        <motion.div
                            key={step.id}
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className="relative z-10 pl-20"
                        >
                            <div className={`absolute left-4 top-0 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold z-20
                                ${i % 2 === 0 ? "bg-legal-navy" : "bg-legal-gold-500"}
                            `}>
                                {step.id}
                            </div>

                            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                                <div className="flex items-center gap-3 mb-3">
                                    <step.icon className="text-legal-gold-500" size={24} />
                                    <h3 className="font-serif font-bold text-legal-navy text-sm uppercase">
                                        {step.title}
                                    </h3>
                                </div>
                                <p className="text-gray-600 text-sm leading-relaxed">
                                    {step.desc}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>

            </div>
        </section>
    );
};

export default ProcessFlow;
