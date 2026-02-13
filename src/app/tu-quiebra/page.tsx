import Hero from "@/components/tu-quiebra/Hero";
import Services from "@/components/tu-quiebra/Services";
import Benefits from "@/components/tu-quiebra/Benefits";
import About from "@/components/tu-quiebra/About";
import FAQ from "@/components/tu-quiebra/FAQ";
import Contact from "@/components/home/Contact"; // Reusing existing Contact component

export const metadata = {
    title: "Tu Quiebra | Asesoría en Insolvencia y Reemprendimiento",
    description: "Expertos en Ley de Quiebras, Liquidación Voluntaria y Reorganización de Empresas. Recupera tu tranquilidad financiera.",
};

export default function TuQuiebraPage() {
    return (
        <main className="min-h-screen bg-white">
            <Hero />
            <Services />
            <Benefits />
            <About />
            <FAQ />
            <Contact />
        </main>
    );
}
