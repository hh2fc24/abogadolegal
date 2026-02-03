import PageHeader from "@/components/layout/PageHeader";
import Contact from "@/components/home/Contact";
import Image from "next/image";

export const metadata = {
    title: "Derecho Penal | Abogado Legal",
    description: "Defensa penal experta en delitos económicos, robos, fraudes y más.",
};

export default function PenalPage() {
    return (
        <main className="bg-white">
            <PageHeader title="Derecho Penal" breadcrumb="Servicios / Penal" />

            <section className="py-20">
                <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
                    <div>
                        <h2 className="font-serif text-3xl font-bold text-legal-navy mb-6">Área Penal</h2>
                        <div className="prose prose-lg text-gray-600">
                            <p className="mb-6">
                                En nuestra Área Penal, ofrecemos una asesoría integral en todos los aspectos relacionados con el derecho penal. Si has sido acusado de un delito o eres víctima de uno, te acompañamos en cada etapa del proceso, desde la investigación hasta la defensa en juicio.
                            </p>
                            <p className="mb-6">
                                Nos encargamos de casos de diversa índole, como robos, fraudes, delitos económicos, delitos contra la propiedad, violencia intrafamiliar, homicidios, entre otros. Trabajamos con rigor y dedicación para garantizar que tus derechos sean respetados y que recibas una defensa técnica, basada en un análisis detallado de las pruebas y de la legislación vigente.
                            </p>
                            <p className="mb-6">
                                Nuestra meta es obtener la mejor resolución posible, ya sea mediante la absolución, una reducción de condena o el resguardo de tus intereses como víctima, en busca de justicia.
                            </p>
                        </div>

                        <div className="my-12 p-8 bg-legal-50 border-l-4 border-legal-gold-500 italic text-xl text-legal-navy font-serif">
                            «Defensa penal sólida y comprometida en todo tipo de procedimientos y delitos.»
                        </div>
                    </div>
                    <div className="relative h-[500px] w-full rounded-xl overflow-hidden shadow-xl">
                        <Image
                            src="/images/services/penal.png"
                            fill
                            alt="Defensa Penal y Juicios"
                            className="object-cover"
                        />
                    </div>
                </div>
            </section>

            <Contact />
        </main>
    );
}
