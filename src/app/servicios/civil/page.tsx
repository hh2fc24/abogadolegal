import PageHeader from "@/components/layout/PageHeader";
import Contact from "@/components/home/Contact";
import Image from "next/image";

export const metadata = {
    title: "Derecho Civil | Abogado Legal",
    description: "Resolución de conflictos civiles, herencias, contratos y propiedades.",
};

export default function CivilPage() {
    return (
        <main className="bg-white">
            <PageHeader title="Derecho Civil" breadcrumb="Servicios / Civil" />

            <section className="py-20">
                <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
                    <div>
                        <h2 className="font-serif text-3xl font-bold text-legal-navy mb-6">Área Civil</h2>
                        <div className="prose prose-lg text-gray-600">
                            <p className="mb-6">
                                En el Área Civil, nos especializamos en la resolución de conflictos que surgen entre particulares o empresas en relación a bienes, obligaciones y derechos. Esto incluye casos de conflictos de propiedad, herencias, problemas de copropiedad, incumplimientos de contratos, y demandas por daños y perjuicios.
                            </p>
                            <p className="mb-6">
                                Si te enfrentas a una situación en la que tus derechos como propietario o contratante han sido vulnerados, te asesoramos desde el inicio, buscando soluciones que eviten el desgaste de un juicio. No obstante, si es necesario, te representamos en tribunales, asegurando que tu postura sea respaldada con sólidos argumentos jurídicos.
                            </p>
                            <p className="mb-6">
                                Además, brindamos asesoría en trámites de sucesión y partición de bienes, garantizando que los procesos hereditarios se realicen conforme a la ley y protegiendo tus intereses patrimoniales.
                            </p>
                        </div>

                        <div className="my-12 p-8 bg-legal-50 border-l-4 border-legal-gold-500 italic text-xl text-legal-navy font-serif">
                            «Representación efectiva en todo tipo de conflictos civiles para proteger tus intereses.»
                        </div>
                    </div>
                    <div className="relative h-[500px] w-full rounded-xl overflow-hidden shadow-xl">
                        <Image
                            src="/images/services/civil.png"
                            fill
                            alt="Abogado Civil en reunión"
                            className="object-cover"
                        />
                    </div>
                </div>
            </section>

            <Contact />
        </main>
    );
}
