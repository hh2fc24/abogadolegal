import PageHeader from "@/components/layout/PageHeader";
import Contact from "@/components/home/Contact";
import Image from "next/image";

export const metadata = {
    title: "Derecho Familiar | Abogado Legal",
    description: "Asesoría en divorcios, pensiones, custodia y violencia intrafamiliar.",
};

export default function FamiliaPage() {
    return (
        <main className="bg-white">
            <PageHeader title="Derecho Familiar" breadcrumb="Servicios / Familia" />

            <section className="py-20">
                <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
                    <div>
                        <h2 className="font-serif text-3xl font-bold text-legal-navy mb-6">Área Familiar</h2>
                        <div className="prose prose-lg text-gray-600">
                            <p className="mb-6">
                                El Área de Familia abarca una amplia gama de situaciones relacionadas con la vida familiar y personal, donde las emociones suelen jugar un papel importante. Nos encargamos de asesorarte y representarte en temas de divorcio, ya sea de mutuo acuerdo o contencioso, siempre buscando la solución más adecuada para ti y tu familia.
                            </p>
                            <p className="mb-6">
                                También te asistimos en la regulación del régimen de visitas, la custodia de hijos, la fijación y modificación de pensiones alimenticias, y en todo tipo de temas relacionados con el bienestar de los menores.
                            </p>
                            <p className="mb-6">
                                Además, abordamos casos de violencia intrafamiliar, protegiendo a quienes han sido víctimas y actuando para obtener medidas cautelares que garanticen su seguridad. En todos los procesos de familia, buscamos soluciones que sean justas, equilibradas y que prioricen el bienestar de los niños y adolescentes cuando están involucrados, trabajando con empatía y profesionalismo en estos temas tan delicados.
                            </p>
                        </div>

                        <div className="my-12 p-8 bg-legal-50 border-l-4 border-legal-gold-500 italic text-xl text-legal-navy font-serif">
                            «Soluciones familiares confiables que protegen tus derechos y los de tu familia.»
                        </div>
                    </div>
                    <div className="relative h-[500px] w-full rounded-xl overflow-hidden shadow-xl">
                        <Image
                            src="/images/services/familia.png"
                            fill
                            alt="Asesoría Familiar y Divorcios"
                            className="object-cover"
                        />
                    </div>
                </div>
            </section>

            <Contact />
        </main>
    );
}
