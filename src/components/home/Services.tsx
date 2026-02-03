"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Scale, Gavel, HeartHandshake, Briefcase, ArrowRight } from "lucide-react";

const services = [
    {
        title: "Abogado Laboral",
        desc: "Defensa estratégica en despidos injustificados y tutela de derechos.",
        href: "/servicios/laboral",
        icon: Briefcase,
        image: "/service_labor.png",
        delay: 0.1
    },
    {
        title: "Abogado Civil",
        desc: "Resolución de conflictos, contratos y herencias con precisión.",
        href: "/servicios/civil",
        icon: Gavel,
        image: "/service_civil.png",
        delay: 0.2
    },
    {
        title: "Abogado Familia",
        desc: "Acuerdos justos en divorcios y pensiones, protegiendo lo esencial.",
        href: "/servicios/familia",
        icon: HeartHandshake,
        image: "/service_family.png",
        delay: 0.3
    },
    {
        title: "Abogado Penal",
        desc: "Defensa técnica de alto nivel en delitos económicos y responsabilidad.",
        href: "/servicios/penal",
        icon: Scale,
        image: "/service_penal.png",
        delay: 0.4
    }
];

const ServicesGrid = () => {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    return (
        <section className="py-20 bg-gray-50 relative overflow-hidden">
            <div className="container mx-auto px-6 max-w-[1400px] relative">
                <div className="text-center mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 15 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="font-serif text-4xl md:text-5xl font-bold text-legal-navy mb-4"
                    >
                        Servicios Legales
                    </motion.h2>
                    <div className="w-24 h-1 bg-legal-gold-500 mx-auto mb-6" />
                    <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed">
                        Protegemos tus derechos con <span className="font-semibold text-legal-navy">experiencia y estrategia</span> en las áreas más críticas.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 lg:gap-10">
                    {services.map((service, i) => {
                        const isHovered = hoveredIndex === i;

                        return (
                            <motion.div
                                key={service.title}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: service.delay, duration: 0.4 }}
                                className="h-full"
                            >
                                <Link
                                    href={service.href}
                                    onMouseEnter={() => setHoveredIndex(i)}
                                    onMouseLeave={() => setHoveredIndex(null)}
                                    className={`group relative block h-[480px] w-full rounded-xl transition-all duration-500
                                        bg-gradient-to-r from-[#d4af37] via-[#e3c065] to-[#b08d26] bg-[length:200%_200%] p-[2px]
                                        hover:animate-gradient-xy
                                        hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(212,175,55,0.15)]
                                        ${isHovered ? "scale-[1.02]" : ""}
                                    `}
                                >
                                    <div className="h-full w-full bg-white rounded-[10px] relative overflow-hidden flex flex-col justify-between">

                                        {/* Background Image: Subtle presence by default (Expert Touch), Full reveal on hover */}
                                        <div className="absolute inset-0 z-0">
                                            <Image
                                                src={service.image}
                                                alt={service.title}
                                                fill
                                                className={`object-cover transition-all duration-500 ease-out
                                                    ${isHovered ? "opacity-100 scale-110" : "opacity-5 grayscale scale-100"}
                                                `}
                                            />
                                            {/* Overlay */}
                                            <div
                                                className={`absolute inset-0 bg-legal-navy/90 transition-opacity duration-300 ${isHovered ? "opacity-100" : "opacity-0"
                                                    }`}
                                            />
                                        </div>

                                        {/* Content - Magazine Layout: Content pushed down */}
                                        <div className="relative z-10 p-8 flex flex-col h-full items-start text-left">

                                            {/* Top: Icon Only */}
                                            <div className="w-full">
                                                <div className="w-16 h-16 rounded-full bg-legal-50/80 backdrop-blur-sm flex items-center justify-center text-legal-navy mb-8 
                                                    group-hover:bg-legal-gold-500 group-hover:text-legal-navy transition-colors duration-300 shadow-sm">
                                                    <service.icon size={28} strokeWidth={1.5} />
                                                </div>
                                            </div>

                                            {/* Middle Spacer to push text down */}
                                            <div className="flex-grow" />

                                            {/* Bottom: Text & CTA */}
                                            <div className="w-full mt-auto">
                                                <h3 className={`font-serif text-3xl font-bold mb-4 transition-colors duration-300 leading-tight ${isHovered ? "text-white" : "text-legal-navy"
                                                    }`}>
                                                    {service.title}
                                                </h3>

                                                <p className={`text-base md:text-lg leading-relaxed font-medium transition-colors duration-300 mb-8 ${isHovered ? "text-gray-100" : "text-gray-600"
                                                    }`}>
                                                    {service.desc}
                                                </p>

                                                <div className={`pt-6 border-t transition-colors duration-300 ${isHovered ? "border-white/30" : "border-gray-200"
                                                    }`}>
                                                    <span className={`flex items-center justify-between text-sm font-bold uppercase tracking-widest transition-colors duration-300 ${isHovered ? "text-legal-gold-500" : "text-legal-navy"
                                                        }`}>
                                                        CONSULTAR AHORA
                                                        <ArrowRight size={18} className={`transition-transform duration-300 ${isHovered ? "translate-x-2" : ""}`} />
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default ServicesGrid;
