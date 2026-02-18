"use client";
import Image from "next/image";

const Contact = () => {
    return (
        <section id="contacto-form" className="py-16 md:py-20 bg-white">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

                    {/* Info */}
                    <div>
                        <h3 className="text-legal-gold-500 font-bold tracking-widest uppercase mb-2">Ubicación</h3>
                        <h2 className="font-serif text-3xl md:text-4xl font-bold text-legal-navy mb-8">
                            CONTÁCTANOS
                        </h2>

                        <div className="space-y-6 mb-8">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-legal-50 rounded-full flex items-center justify-center text-legal-navy text-lg">📍</div>
                                <div>
                                    <h4 className="font-bold text-legal-navy">Ubicación</h4>
                                    <p className="text-gray-600">Av. Apoquindo 6410, Of 502, Las Condes</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-legal-50 rounded-full flex items-center justify-center text-legal-navy text-lg">📞</div>
                                <div>
                                    <h4 className="font-bold text-legal-navy">Teléfono</h4>
                                    <p className="text-gray-600">+56 2 2712 1162</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-legal-50 rounded-full flex items-center justify-center text-legal-navy text-lg">✉️</div>
                                <div>
                                    <h4 className="font-bold text-legal-navy">Email</h4>
                                    <p className="text-gray-600">info@abogadolegal.cl</p>
                                </div>
                            </div>
                        </div>

                        <div className="w-full h-80 rounded-xl overflow-hidden shadow-lg border-2 border-legal-gold-500 relative group">
                            <iframe
                                width="100%"
                                height="100%"
                                frameBorder="0"
                                scrolling="no"
                                marginHeight={0}
                                marginWidth={0}
                                src="https://maps.google.com/maps?q=Av.+Apoquindo+6410,+Las+Condes&t=&z=15&ie=UTF8&iwloc=&output=embed"
                                className="w-full h-full grayscale hover:grayscale-0 transition-all duration-500"
                                style={{
                                    border: 0
                                }}
                            ></iframe>
                            <div className="absolute inset-0 pointer-events-none border-4 border-legal-navy/10 rounded-xl"></div>
                        </div>
                    </div>

                    {/* Form */}
                    <div className="bg-gray-50 p-6 md:p-8 rounded-sm shadow-lg border-t-4 border-legal-gold-500">
                        <h3 className="font-serif text-xl md:text-2xl font-bold text-legal-navy mb-5">Envíenos un mensaje</h3>
                        <form className="space-y-5">
                            <div>
                                <label className="block text-sm font-semibold text-legal-navy mb-2">Nombre</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-sm focus:border-legal-gold-500 focus:ring-1 focus:ring-legal-gold-500 outline-none transition-all"
                                    placeholder="Tu nombre completo"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-legal-navy mb-2">Correo electrónico</label>
                                <input
                                    type="email"
                                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-sm focus:border-legal-gold-500 focus:ring-1 focus:ring-legal-gold-500 outline-none transition-all"
                                    placeholder="tu@email.com"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-legal-navy mb-2">Mensaje</label>
                                <textarea
                                    rows={4}
                                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-sm focus:border-legal-gold-500 focus:ring-1 focus:ring-legal-gold-500 outline-none transition-all"
                                    placeholder="Cuéntanos sobre tu caso..."
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full bg-legal-navy text-white font-bold py-3 rounded-sm hover:bg-legal-gold-500 hover:text-legal-navy transition-all uppercase tracking-wide"
                            >
                                Contactar
                            </button>
                        </form>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default Contact;
