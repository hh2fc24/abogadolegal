"use client";

import Link from "next/link";

const Footer = () => {
    return (
        <footer className="bg-legal-navy text-white pt-16 pb-8 border-t border-white/5">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    {/* Brand */}
                    <div className="space-y-4">
                        <h2 className="font-serif text-xl font-bold">
                            ABOGADO <span className="text-legal-gold-500">LEGAL</span>
                        </h2>
                        <p className="text-gray-400 text-xs leading-relaxed max-w-xs">
                            Protegemos tus derechos con experiencia en causas de familia, laborales, civiles y penales. Confianza y resultados.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div className="space-y-4">
                        <h3 className="font-bold text-sm tracking-widest text-legal-gold-500 uppercase">Servicios</h3>
                        <ul className="space-y-2 text-xs text-gray-400">
                            <li><Link href="/servicios/familia" className="hover:text-white transition-colors">Derecho Familiar</Link></li>
                            <li><Link href="/servicios/penal" className="hover:text-white transition-colors">Derecho Penal</Link></li>
                            <li><Link href="/servicios/civil" className="hover:text-white transition-colors">Derecho Civil</Link></li>
                            <li><Link href="/servicios/laboral" className="hover:text-white transition-colors">Derecho Laboral</Link></li>
                        </ul>
                    </div>

                    {/* Legals */}
                    <div className="space-y-4">
                        <h3 className="font-bold text-sm tracking-widest text-legal-gold-500 uppercase">Legales</h3>
                        <ul className="space-y-2 text-xs text-gray-400">
                            <li><Link href="/politica-cookies" className="hover:text-white transition-colors">Política de Cookies</Link></li>
                            <li><Link href="/politica-privacidad" className="hover:text-white transition-colors">Política de Privacidad</Link></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div className="space-y-4">
                        <h3 className="font-bold text-sm tracking-widest text-legal-gold-500 uppercase">Contacto</h3>
                        <ul className="space-y-3 text-xs text-gray-400">
                            <li className="flex items-start gap-3">
                                <span className="mt-1 block w-1 h-1 rounded-full bg-legal-gold-500 shrink-0" />
                                Av. Apoquindo 6410, Of 502<br />Las Condes, Santiago
                            </li>
                            <li className="flex items-center gap-3">
                                <span className="block w-1 h-1 rounded-full bg-legal-gold-500 shrink-0" />
                                +56 2 2712 1162
                            </li>
                            <li className="flex items-center gap-3">
                                <span className="block w-1 h-1 rounded-full bg-legal-gold-500 shrink-0" />
                                info@abogadolegal.cl
                            </li>
                            <li className="flex items-center gap-3 font-semibold text-white">
                                <span className="block w-1 h-1 rounded-full bg-legal-gold-500 shrink-0" />
                                Atención las 24 Horas
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-white/5 pt-8 text-center text-[10px] text-gray-500 uppercase tracking-widest">
                    <p>© {new Date().getFullYear()} Abogado Legal. Todos los derechos reservados.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
