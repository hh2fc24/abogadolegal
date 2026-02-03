import PageHeader from "@/components/layout/PageHeader";
import Contact from "@/components/home/Contact";
import Testimonials from "@/components/home/Testimonials";
import Image from "next/image";

export const metadata = {
    title: "Sobre Nosotros | Abogado Legal",
    description: "Conoce nuestra misión, visión y equipo de expertos en derecho.",
};

export default function AboutPage() {
    return (
        <main className="bg-white">
            <PageHeader title="Sobre Nosotros" breadcrumb="Sobre Nosotros" />

            {/* Intro */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div>
                        <h2 className="font-serif text-3xl font-bold text-legal-navy mb-6">
                            Compromiso y Excelencia Legal
                        </h2>
                        <p className="text-gray-600 mb-6 leading-relaxed">
                            En Abogado Legal nos especializamos en brindar soluciones jurídicas estratégicas a medida, con el objetivo de apoyar a nuestros clientes en el cumplimiento de sus metas.
                        </p>
                        <p className="text-gray-600 mb-6 leading-relaxed">
                            Nuestro compromiso es ofrecer un servicio basado en los valores de integridad, lealtad y confidencialidad, cualidades esenciales para asegurar el éxito de cada estrategia comercial y de defensa. Nos enorgullece trabajar de manera cercana y personalizada con cada cliente.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                            <div className="border-l-4 border-legal-gold-500 pl-4">
                                <h3 className="font-bold text-legal-navy text-lg">Equipo Especializado</h3>
                                <p className="text-sm text-gray-600 mt-2">Abogados expertos en causas de familia, laborales, civiles y penales.</p>
                            </div>
                            <div className="border-l-4 border-legal-gold-500 pl-4">
                                <h3 className="font-bold text-legal-navy text-lg">Gran Compromiso</h3>
                                <p className="text-sm text-gray-600 mt-2">Servicio ético y transparente, asegurando entendimiento claro.</p>
                            </div>
                            <div className="border-l-4 border-legal-gold-500 pl-4">
                                <h3 className="font-bold text-legal-navy text-lg">Resultados Eficientes</h3>
                                <p className="text-sm text-gray-600 mt-2">Dedicación y precisión para garantizar resultados justos.</p>
                            </div>
                        </div>
                    </div>
                    <div className="relative h-[500px] bg-gray-100 rounded-lg overflow-hidden shadow-xl">
                        <Image
                            src="/team_lawyers_meeting.png"
                            alt="Equipo de Abogados Expertos"
                            fill
                            className="object-cover"
                        />
                    </div>
                </div>
            </section>

            {/* Mission / Vision */}
            <section className="py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="bg-white p-10 shadow-sm border-t-4 border-legal-navy">
                        <h3 className="font-serif text-2xl font-bold text-legal-navy mb-4">Misión</h3>
                        <p className="text-gray-600 leading-relaxed">
                            Nuestra misión es proporcionar asesoría jurídica integral y estratégica a nuestros clientes, con un enfoque personalizado y altamente especializado. Nos comprometemos a ser un apoyo confiable, trabajando con responsabilidad y ética para ofrecer soluciones precisas y efectivas en cada área del negocio de nuestros clientes, contribuyendo al cumplimiento de sus metas y al crecimiento sostenible de sus operaciones.
                        </p>
                    </div>
                    <div className="bg-white p-10 shadow-sm border-t-4 border-legal-gold-500">
                        <h3 className="font-serif text-2xl font-bold text-legal-navy mb-4">Visión</h3>
                        <p className="text-gray-600 leading-relaxed">
                            Nuestra visión es consolidarnos como un referente en el ámbito legal en Chile, reconocidos por nuestro enfoque personalizado, la excelencia profesional de nuestro equipo y la confianza que generamos en nuestros clientes. Aspiramos a seguir creando relaciones a largo plazo, basadas en el respeto mutuo, y a mantenernos como un estudio jurídico innovador.
                        </p>
                    </div>
                </div>
            </section>

            <div className="bg-legal-navy py-12 text-center text-white">
                <h2 className="font-serif text-3xl italic">"Experiencia, confianza y resultados garantizados."</h2>
            </div>

            <Testimonials />
            <Contact />
        </main>
    );
}
