"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import MagneticButton from "@/components/ui/MagneticButton";

const Hero = () => {
    return (
        <section className="relative h-[80vh] min-h-[600px] flex items-center justify-center overflow-hidden bg-legal-navy">
            {/* Background Image/Overlay */}
            <div className="absolute inset-0 z-0">
                {/* Placeholder for a relevant background image, or use a gradient/pattern */}
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-20" />
                <div className="absolute inset-0 bg-gradient-to-t from-legal-navy via-legal-navy/80 to-transparent" />
            </div>

            <div className="relative z-10 max-w-5xl mx-auto px-6 text-center text-white">
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="font-serif text-lg md:text-xl tracking-[0.2em] text-legal-gold-500 mb-6 uppercase"
                >
                    Asesoría Legal Experta
                </motion.h2>

                <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="font-serif text-4xl md:text-7xl font-bold mb-8 leading-tight tracking-tight"
                >
                    Te ayudamos a declarar<br />
                    tu empresa en quiebra
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                    className="text-lg md:text-2xl text-gray-200 max-w-3xl mx-auto leading-relaxed mb-10 font-light"
                >
                    Nuestro equipo de abogados especialistas en quiebras está listo para brindarte asesoría legal experta.
                </motion.p>
                
                 <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.7 }}
                    className="flex flex-wrap justify-center gap-4 mb-12 text-sm md:text-base text-gray-300 font-medium"
                >
                    <span className="flex items-center gap-2">✔ Liquidación voluntaria</span>
                    <span className="flex items-center gap-2">✔ Liquidación forzosa</span>
                    <span className="flex items-center gap-2">✔ Reorganización</span>
                    <span className="flex items-center gap-2">✔ Tercería de bienes</span>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.8 }}
                    className="flex flex-col md:flex-row gap-6 justify-center"
                >
                    <MagneticButton>
                        <Link
                            href="https://wa.me/56912345678" // Replace with actual WhatsApp if available or keep generic
                            target="_blank"
                            className="px-10 py-4 bg-[#25D366] text-white font-bold text-sm tracking-widest uppercase hover:bg-white hover:text-[#25D366] transition-all duration-300 shadow-lg hover:shadow-xl inline-block"
                        >
                            WHATSAPP
                        </Link>
                    </MagneticButton>
                    <MagneticButton>
                        <Link
                            href="#contacto"
                            className="px-10 py-4 border border-legal-gold-500 text-legal-gold-500 font-bold text-sm tracking-widest uppercase hover:bg-legal-gold-500 hover:text-legal-navy transition-all duration-300 inline-block"
                        >
                            SOLICITAR ASESORÍA
                        </Link>
                    </MagneticButton>
                </motion.div>
            </div>
        </section>
    );
};

export default Hero;
