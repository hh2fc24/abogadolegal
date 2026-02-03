"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import MagneticButton from "@/components/ui/MagneticButton";

const Hero = () => {
    return (
        <section className="relative h-screen min-h-[600px] flex items-center justify-center overflow-hidden">
            {/* Background Video */}
            <div className="absolute inset-0 z-0">
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover"
                    poster="/hero_lawyers_abstract_luxury.png" // Fallback
                >
                    <source src="/33.mp4" type="video/mp4" />
                </video>
                {/* Overlay for text readability and blue tone */}
                <div className="absolute inset-0 bg-legal-navy/70 mix-blend-multiply" />
                <div className="absolute inset-0 bg-gradient-to-t from-legal-navy via-transparent to-transparent" />
            </div>

            <div className="relative z-10 max-w-5xl mx-auto px-6 text-center text-white">
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="font-serif text-lg md:text-xl tracking-[0.2em] text-legal-gold-500 mb-6 uppercase"
                >
                    Excelencia y Compromiso
                </motion.h2>

                <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="font-serif text-5xl md:text-8xl font-bold mb-8 leading-tight tracking-tight"
                >
                    DEFENSA LEGAL
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                    className="text-lg md:text-2xl text-gray-200 max-w-3xl mx-auto leading-relaxed mb-12 font-light"
                >
                    Estrategia jurídica de alto nivel para proteger tus derechos en cada etapa del proceso.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.8 }}
                    className="flex flex-col md:flex-row gap-6 justify-center"
                >
                    <MagneticButton>
                        <Link
                            href="/contacto"
                            className="px-10 py-4 bg-legal-gold-500 text-legal-navy font-bold text-sm tracking-widest uppercase hover:bg-white transition-all duration-300 shadow-lg hover:shadow-xl inline-block"
                        >
                            Contáctanos
                        </Link>
                    </MagneticButton>
                    <MagneticButton>
                        <Link
                            href="/servicios"
                            className="px-10 py-4 border border-white text-white font-bold text-sm tracking-widest uppercase hover:bg-white hover:text-legal-navy transition-all duration-300 inline-block"
                        >
                            Nuestros Servicios
                        </Link>
                    </MagneticButton>
                </motion.div>
            </div>
        </section>
    );
};

export default Hero;
