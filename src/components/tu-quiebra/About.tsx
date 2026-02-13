"use client";

import { motion } from "framer-motion";
import MagneticButton from "@/components/ui/MagneticButton";
import Link from "next/link";
import Image from "next/image";

const About = () => {
    return (
        <section className="py-20 bg-white relative overflow-hidden">
            <div className="container mx-auto px-6 max-w-7xl">
                <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-20">

                    {/* Image Section */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="w-full md:w-1/2 relative min-h-[400px] h-[500px]"
                    >
                        <div className="absolute inset-0 bg-legal-navy/10 rounded-2xl transform rotate-3 z-0" />
                        <div className="absolute inset-0 bg-legal-gold-500/10 rounded-2xl transform -rotate-3 z-0" />
                        <div className="absolute inset-0 z-10 rounded-2xl overflow-hidden shadow-2xl">
                            {/* Placeholder generic office image */}
                            <Image
                                src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=2664&auto=format&fit=crop"
                                alt="Nuestro Estudio"
                                fill
                                className="object-cover"
                            />
                        </div>
                    </motion.div>

                    {/* Content Section */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="w-full md:w-1/2"
                    >
                        <h2 className="font-serif text-4xl md:text-5xl font-bold text-legal-navy mb-6">
                            NUESTRO ESTUDIO
                        </h2>
                        <div className="w-24 h-1 bg-legal-gold-500 mb-8" />

                        <div className="space-y-6 text-gray-600 text-lg leading-relaxed">
                            <p>
                                En este espacio, tendrás todo lo que requieres para llevar a cabo tus liquidaciones de forma ágil, precisa y confiable.
                            </p>
                            <p>
                                Nuestro equipo de abogados especialistas en quiebras de empresas está comprometido a brindarte el mejor servicio, guiándote en cada paso del proceso para lograr resultados óptimos.
                            </p>
                            <p>
                                Trabajamos con un enfoque personalizado, adaptándonos a las necesidades específicas de cada cliente. Nuestra misión es facilitar tus trámites y brindarte soluciones a medida.
                            </p>
                        </div>

                        <div className="mt-10">
                            <MagneticButton>
                                <Link
                                    href="#contacto"
                                    className="px-10 py-4 border border-legal-navy text-legal-navy font-bold text-sm tracking-widest uppercase hover:bg-legal-navy hover:text-white transition-all duration-300 inline-block"
                                >
                                    SOLICITAR ASESORÍA
                                </Link>
                            </MagneticButton>
                        </div>
                    </motion.div>


                </div>
            </div>
        </section>
    );
};

export default About;
