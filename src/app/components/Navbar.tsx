// src/app/components/Navbar.tsx

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import Image from "next/image";

// --- Datos de los enlaces de navegación ---
const navLinks = [
  { title: "Metodología", id: "metodologia" },
  { title: "Resultados", id: "resultados" },
  { title: "Garantía", id: "garantia" },
  { title: "Preguntas", id: "faq" },
  { title: "Contacto", id: "contacto" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    const onResize = () => {
      if (window.innerWidth >= 768) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener("scroll", onScroll);
    window.addEventListener("resize", onResize);

    document.body.style.overflow = isMenuOpen ? "hidden" : "auto";

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      document.body.style.overflow = "auto";
    };
  }, [isMenuOpen]);

  const handleScrollTo = (id: string) => {
    setIsMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      const navbarHeight = 64;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition =
        elementPosition + window.pageYOffset - navbarHeight;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  const linkColor =
    scrolled || isMenuOpen
      ? "text-slate-300 hover:text-white"
      : "text-slate-700 hover:text-slate-900";
  const mobileIconColor = isMenuOpen
    ? "text-white"
    : scrolled
    ? "text-white"
    : "text-slate-900";

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 border-b
        ${
          scrolled || isMenuOpen
            ? "bg-slate-900/80 backdrop-blur-lg border-white/10 shadow-lg"
            : "bg-transparent border-transparent"
        }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
        {/* LOGO */}
        <Link href="/" className="flex items-center">
          <Image
            src="/DCERO_LOGO.svg"
            alt="Deudas Cero"
            width={140}
            height={40}
            priority
          />
        </Link>

        {/* Navegación de Escritorio */}
        <nav className="hidden items-center gap-8 text-sm md:flex">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => handleScrollTo(link.id)}
              className={`font-medium transition-colors duration-300 ${linkColor}`}
            >
              {link.title}
            </button>
          ))}
        </nav>

        {/* CTA Escritorio con degradado elegante */}
        <Link
          href="/evaluacion"
          className="hidden rounded-lg bg-gradient-to-r from-[#0B2C5E] via-[#087F9C] to-[#07D4C0] px-5 py-2 text-sm font-semibold text-white shadow-sm transition-transform hover:scale-105 md:block"
        >
          Evaluación Gratuita
        </Link>

        {/* Botón de Menú Móvil */}
        <div className="md:hidden">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`transition-colors duration-300 ${mobileIconColor}`}
          >
            <span className="sr-only">Abrir menú</span>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Panel de Menú Móvil */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="absolute left-0 top-16 h-[calc(100vh-4rem)] w-full bg-slate-900 md:hidden"
          >
            <nav className="flex flex-col items-center gap-8 pt-10 text-lg">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => handleScrollTo(link.id)}
                  className="font-medium text-slate-300 transition-colors hover:text-white"
                >
                  {link.title}
                </button>
              ))}
              {/* CTA Móvil con degradado elegante */}
              <Link
                href="/evaluacion"
                className="mt-6 rounded-lg bg-gradient-to-r from-[#0B2C5E] via-[#087F9C] to-[#07D4C0] px-8 py-3 font-semibold text-white shadow-sm"
              >
                Evaluación Gratuita
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}