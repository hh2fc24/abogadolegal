import PageHeader from "@/components/layout/PageHeader";
import Contact from "@/components/home/Contact";
import Image from "next/image";

export const metadata = {
    title: "Derecho Laboral | Abogado Legal",
    description: "Defensa de derechos laborales para trabajadores y empleadores.",
};

export default function LaboralPage() {
    return (
        <main className="bg-white">
            <PageHeader title="Derecho Laboral" breadcrumb="Servicios / Laboral" />

            <section className="py-20">
                <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
                    <div>
                        <h2 className="font-serif text-3xl font-bold text-legal-navy mb-6">Área Laboral</h2>
                        <div className="prose prose-lg text-gray-600">
                            <p className="mb-6">
                                En nuestra Área Laboral, brindamos asesoría tanto a trabajadores como a empleadores, ofreciendo una visión completa de los derechos y obligaciones que corresponden a ambas partes.
                            </p>
                            <p className="mb-6">
                                Si eres trabajador, te ayudamos a enfrentar despidos injustificados, irregularidades en el pago de remuneraciones, acoso laboral o problemas relacionados con licencias médicas y derechos laborales vulnerados.
                            </p>
                            <p className="mb-6">
                                Si eres empleador, te asistimos en la correcta redacción de contratos, la prevención de conflictos laborales y en la defensa frente a demandas de empleados, asegurando que actúes conforme a la legislación vigente. En ambos casos, nuestro objetivo es lograr acuerdos satisfactorios a través de la negociación, y si es necesario, actuamos en tribunales laborales para garantizar que se cumplan los derechos de nuestros clientes.
                            </p>
                        </div>

                        <div className="my-12 p-8 bg-legal-50 border-l-4 border-legal-gold-500 italic text-xl text-legal-navy font-serif">
                            «Defendemos tus derechos laborales con soluciones legales, rápidas y efectivas.»
                        </div>
                    </div>
                    <div className="relative h-[500px] w-full rounded-xl overflow-hidden shadow-xl">
                        <Image
                            src="/images/services/laboral.png"
                            fill
                            alt="Asesoría Laboral Profesional"
                            className="object-cover"
                        />
                    </div>
                </div>
            </section>

            <Contact />
        </main>
    );
}
