import Hero from "@/components/home/Hero";
import ServicesGrid from "@/components/home/Services";
import Testimonials from "@/components/home/Testimonials";
import Contact from "@/components/home/Contact";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Hero />
      <ServicesGrid />
      <Testimonials />
      <Contact />
    </main>
  );
}