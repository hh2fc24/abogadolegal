import PageHeader from "@/components/layout/PageHeader";
import Contact from "@/components/home/Contact";

export const metadata = {
    title: "Contacto | Abogado Legal",
    description: "Contáctanos para una asesoría legal experta.",
};

export default function ContactPage() {
    return (
        <main className="bg-white">
            <PageHeader title="Contacto" breadcrumb="Contacto" />
            <Contact />

            {/* Map Placeholder or Extra Info could go here if requested, but reused form is good */}
        </main>
    );
}
