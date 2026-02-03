"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Quote } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const testimonials = [
    { name: "Ricardo Herrera", role: "Caso Penal", text: "Me defendieron en un caso complejo con resultados impecables. Profesionales de élite." },
    { name: "María Fernández", role: "Familia", text: "Lograron un acuerdo justo para mis hijos. Su empatía y firmeza hicieron la diferencia." },
    { name: "Francisco Morales", role: "Divorcio", text: "El proceso fue rápido y transparente. Me sentí respaldado en todo momento." },
    { name: "Pedro García", role: "Laboral", text: "Recuperaron mis años de servicio. Estrategia legal sólida y ganadora." },
    { name: "Sofía Muñoz", role: "Civil", text: "Solucionaron un conflicto de herencia que parecía imposible. Eternamente agradecida." },
    { name: "Carlos Torres", role: "Penal", text: "Abogados que realmente pelean por ti. Su nivel técnico es impresionante." },
    { name: "Ana López", role: "Tuición", text: "Cuidaron los intereses de mi familia como si fuera la suya. Excelente servicio." },
];

const TestimonialCard = ({ item }: { item: typeof testimonials[0] }) => (
    <div className="h-full w-full p-6 md:p-8 flex flex-col relative group">
        {/* Divider line instead of border */}
        <div className="absolute left-0 top-8 bottom-8 w-[1px] bg-gradient-to-b from-transparent via-legal-gold-500/30 to-transparent opacity-50 hidden md:block" />

        <Quote className="text-legal-gold-500/20 w-12 h-12 mb-6" aria-hidden="true" />

        <div className="flex-grow">
            <p className="text-white/90 text-xl md:text-2xl font-serif italic leading-relaxed mb-8">
                "{item.text}"
            </p>
        </div>

        <div className="flex items-center gap-4 pt-4">
            <div className="w-12 h-12 rounded-full border border-legal-gold-500/30 flex items-center justify-center text-white font-serif text-lg bg-white/5">
                {item.name.charAt(0)}
            </div>
            <div>
                <h4 className="font-bold text-white text-base tracking-wide">{item.name}</h4>
                <p className="text-legal-gold-500 text-xs uppercase tracking-widest font-semibold mt-1">
                    {item.role}
                </p>
            </div>
        </div>
    </div>
);

const Testimonials = () => {
    const reduceMotion = useReducedMotion();
    const [page, setPage] = useState(0);

    useEffect(() => {
        if (reduceMotion) return;
        const id = window.setInterval(() => setPage((p) => p + 1), 5500);
        return () => window.clearInterval(id);
    }, [reduceMotion]);

    const visible = useMemo(() => {
        const start = ((page % testimonials.length) + testimonials.length) % testimonials.length;
        const items = [];
        for (let i = 0; i < 3; i++) items.push(testimonials[(start + i) % testimonials.length]);
        return items;
    }, [page]);

    return (
        <section className="py-24 bg-legal-navy relative overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-legal-gold-500/30 to-transparent" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-legal-800/30 via-transparent to-transparent pointer-events-none" />

            <div className="max-w-7xl mx-auto px-6 mb-16 text-center relative z-10">
                <motion.span
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    className="text-legal-gold-500 font-bold tracking-[0.2em] text-xs uppercase mb-3 inline-block bg-legal-gold-500/10 px-3 py-1 rounded-full border border-legal-gold-500/20"
                >
                    Referencias Comprobadas
                </motion.span>
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="font-serif text-3xl md:text-5xl font-bold text-white drop-shadow-md"
                >
                    Confianza y <span className="text-legal-gold-500 italic">Resultados</span>
                </motion.h2>
            </div>

            {/* Fade Carousel (no movement) */}
            <div className="relative z-10 max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[0, 1, 2].map((slot) => (
                        <div
                            key={slot}
                            className={[
                                "relative min-h-[280px]",
                                slot === 1 ? "hidden md:block" : "",
                                slot === 2 ? "hidden lg:block" : "",
                            ].join(" ")}
                        >
                            <AnimatePresence mode="wait" initial={false}>
                                <motion.div
                                    key={`${slot}-${visible[slot].name}`}
                                    className="absolute inset-0"
                                    initial={reduceMotion ? { opacity: 1 } : { opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={reduceMotion ? { opacity: 1 } : { opacity: 0 }}
                                    transition={reduceMotion ? { duration: 0 } : { duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                                >
                                    <TestimonialCard item={visible[slot]} />
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    ))}
                </div>

                <div className="mt-8 flex items-center justify-center gap-2">
                    {testimonials.map((t, i) => {
                        const isActive = i === (((page % testimonials.length) + testimonials.length) % testimonials.length);
                        return (
                            <button
                                key={t.name}
                                type="button"
                                onClick={() => setPage(i)}
                                aria-label={`Mostrar testimonio de ${t.name}`}
                                className={[
                                    "h-2.5 w-2.5 rounded-full transition-all duration-300",
                                    isActive ? "bg-legal-gold-500 shadow-[0_0_0_4px_rgba(212,175,55,0.16)]" : "bg-white/20 hover:bg-white/35",
                                ].join(" ")}
                            />
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default Testimonials;
