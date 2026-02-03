import PageHeader from "@/components/layout/PageHeader";
import ServicesGrid from "@/components/home/Services";
import Contact from "@/components/home/Contact";

export const metadata = {
    title: "Servicios Legales | Abogado Legal",
    description: "Explora nuestras áreas de práctica: Laboral, Civil, Familia y Penal.",
};

export default function ServicesPage() {
    return (
        <main className="bg-white">
            <PageHeader title="Nuestros Servicios" breadcrumb="Servicios" />
            <ServicesGrid />
            <Contact />
        </main>
    );
}
