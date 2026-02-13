"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import MagneticButton from "@/components/ui/MagneticButton";

const Navbar = () => {
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const pathname = usePathname();

    const isDarkHeaderRoute =
        pathname === "/" ||
        pathname?.startsWith("/servicios") ||
        pathname === "/contacto" ||
        pathname === "/sobre-nosotros" ||
        pathname === "/politica-cookies" ||
        pathname === "/politica-privacidad";

    const isTransparent = !scrolled && !mobileMenuOpen;
    const useLightText = isTransparent && isDarkHeaderRoute;

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const navLinks = [
        { name: "Inicio", href: "/" },
        { name: "Tu Quiebra", href: "/tu-quiebra" },
        { name: "Sobre Nosotros", href: "/sobre-nosotros" },
        { name: "Servicios", href: "/servicios" },
        { name: "Contacto", href: "/contacto" },
    ];

    return (
        <header
            className={`fixed top-0 w-full z-50 transition-all duration-300 bg-legal-navy ${scrolled ? "shadow-md py-4 border-b border-white/5" : "py-6"}`}
        >
            <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="group relative z-50 block">
                    <div className="relative h-12 w-32 md:h-16 md:w-40">
                        <Image
                            src="/logo_nav.jpeg"
                            fill
                            alt="Logo"
                            className="object-contain object-left"
                            priority
                        />
                    </div>
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-8">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            className={`text-xs font-bold uppercase tracking-wider transition-colors hover:text-legal-gold-500 ${scrolled ? "text-white/90" : (useLightText ? "text-white/90" : "text-white/90")
                                } ${pathname === link.href ? "text-legal-gold-500" : ""}`}
                        >
                            {link.name}
                        </Link>
                    ))}
                    <MagneticButton>
                        <Link
                            href="/contacto"
                            className={`px-6 py-3 rounded-sm text-xs font-bold uppercase tracking-widest transition-all inline-block shadow-xl bg-[#d4af37] text-legal-navy hover:bg-white hover:text-legal-navy border-2 border-[#d4af37]`}
                        >
                            CONTÁCTANOS
                        </Link>
                    </MagneticButton>
                </nav>

                {/* Mobile Menu Button */}
                <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="md:hidden p-2 z-50 focus:outline-none"
                    aria-label="Toggle menu"
                >
                    <div
                        className={`w-6 h-0.5 mb-1.5 transition-all ${mobileMenuOpen
                            ? "rotate-45 translate-y-2 bg-legal-navy"
                            : "bg-white"
                            }`}
                    />
                    <div
                        className={`w-6 h-0.5 mb-1.5 transition-all ${mobileMenuOpen
                            ? "opacity-0"
                            : "bg-white"
                            }`}
                    />
                    <div
                        className={`w-6 h-0.5 transition-all ${mobileMenuOpen
                            ? "-rotate-45 -translate-y-2 bg-legal-navy"
                            : "bg-white"
                            }`}
                    />
                </button>

                {/* Mobile Nav Overlay */}
                <div
                    className={`fixed inset-0 bg-white z-40 flex flex-col items-center justify-center gap-8 transition-transform duration-300 ease-in-out md:hidden ${mobileMenuOpen ? "translate-x-0" : "translate-x-full"
                        }`}
                >
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            onClick={() => setMobileMenuOpen(false)}
                            className="text-2xl font-serif text-legal-navy font-medium hover:text-legal-gold-500 transition-colors uppercase tracking-widest"
                        >
                            {link.name}
                        </Link>
                    ))}
                </div>
            </div>
        </header>
    );
};

export default Navbar;
